import React, { useState, useCallback } from 'react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  ReferenceLine
} from 'recharts';
import { 
  Card, CardContent, Typography, Box, 
  useTheme,
  ToggleButtonGroup, ToggleButton
} from '@mui/material';
import { ShowChart } from '@mui/icons-material';
import { format, subDays, subMonths, subYears, parseISO } from 'date-fns';
import { usePortfolioHistory, PortfolioValue } from '../hooks/usePortfolioHistory';
import { useAssetHistory, AssetValue } from '../hooks/useAssetHistory';
import { PortfolioService } from '../services/portfolioService';
import { Portfolio } from '../types';

// Types
type HistoryData = PortfolioValue | AssetValue; // Both have same structure: { date: string, value: number }

interface PerformanceData {
  data: HistoryData[];
  startValue: number;
  endValue: number;
  percentChange: number;
  highValue: number;
  lowValue: number;
  valueChange: number;
}

interface ValueChartProps {
  portfolioId?: number;
  assetId?: number;
  title?: string;
  currentPrice?: number; // Add currentPrice prop for asset charts
}

// Filter data based on time range
const filterData = (data: HistoryData[], range: string): PerformanceData => {
  const today = new Date();
  let startDate: Date;
  
  switch(range) {
    case '1W':
      startDate = subDays(today, 7);
      break;
    case '1M':
      startDate = subMonths(today, 1);
      break;
    case '3M':
      startDate = subMonths(today, 3);
      break;
    case '6M':
      startDate = subMonths(today, 6);
      break;
    case 'YTD':
      startDate = new Date(today.getFullYear(), 0, 1); // January 1st of current year
      break;
    case '1Y':
      startDate = subYears(today, 1);
      break;
    case 'ALL':
    default:
      startDate = new Date(0); // Beginning of time
      break;
  }
  
  const filteredData = data.filter(item => {
    const itemDate = parseISO(item.date);
    return itemDate >= startDate;
  });
  
  // Calculate performance metrics
  const startValue = filteredData[0]?.value || 0;
  const endValue = filteredData[filteredData.length - 1]?.value || 0;
  const valueChange = endValue - startValue;
  const percentChange = startValue ? (valueChange / startValue) * 100 : 0;
  
  // Find high and low values
  const values = filteredData.map(item => item.value);
  const highValue = Math.max(...values);
  const lowValue = Math.min(...values);
  
  return {
    data: filteredData,
    startValue,
    endValue,
    percentChange,
    valueChange,
    highValue,
    lowValue
  };
};

// Custom tooltip component
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const dateValue = parseISO(label);
    const formattedDate = format(dateValue, 'MMM d, yyyy');
    const value = payload[0].value;
    const formattedValue = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(value as number);
    
    return (
      <Card sx={{ boxShadow: 2, p: 1, bgcolor: 'background.paper' }}>
        <Typography variant="body2" color="text.secondary">
          {formattedDate}
        </Typography>
        <Typography variant="subtitle1" fontWeight="bold">
          {formattedValue}
        </Typography>
      </Card>
    );
  }
  
  return null;
};

// Value chart component (can be used for portfolio or individual assets)
const ValueChart: React.FC<ValueChartProps> = ({ portfolioId, assetId, title = "Value Chart", currentPrice }) => {
  const theme = useTheme();
  const [timeRange, setTimeRange] = useState<string>('3M');
  const [portfolio, setPortfolio] = useState<Portfolio | null>(null);
  
  // Use appropriate hook based on what's provided
  const portfolioHistory = usePortfolioHistory(portfolioId || 0);
  const assetHistory = useAssetHistory(assetId || null);
  
  // Fetch portfolio details if this is a portfolio chart
  React.useEffect(() => {
    if (portfolioId) {
      PortfolioService.getPortfolio(portfolioId)
        .then(setPortfolio)
        .catch(console.error);
    }
  }, [portfolioId]);
  
  // Determine which data to use
  const isPortfolio = !!portfolioId;
  const { historyData, loading, error } = isPortfolio ? portfolioHistory : assetHistory;
  
  // Filter data based on selected time range
  const performanceData = filterData(historyData, timeRange);
  let { data, percentChange, valueChange, endValue } = performanceData;
  
  // Replace the last value with portfolio.aum if this is a portfolio chart
  const chartData = [...data];
  if (isPortfolio && portfolio?.aum && chartData.length > 0) {
    chartData[chartData.length - 1] = {
      ...chartData[chartData.length - 1],
      value: portfolio.aum
    };
    
    // Recalculate value change and percentage with the updated AUM value
    const startValue = data[0]?.value || 0;
    const currentValue = portfolio.aum;
    valueChange = currentValue - startValue;
    percentChange = startValue ? (valueChange / startValue) * 100 : 0;
    endValue = currentValue;
  }
  
  // Replace the last value with currentPrice if this is an asset chart and currentPrice is provided
  if (!isPortfolio && currentPrice && chartData.length > 0) {
    chartData[chartData.length - 1] = {
      ...chartData[chartData.length - 1],
      value: currentPrice
    };
    
    // Recalculate value change and percentage with the updated current price
    const startValue = data[0]?.value || 0;
    valueChange = currentPrice - startValue;
    percentChange = startValue ? (valueChange / startValue) * 100 : 0;
    endValue = currentPrice;
  }
  
  // Format change value
  const formattedChange = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    signDisplay: 'always'
  }).format(valueChange);
  
  // Format percentage
  const formattedPercentage = new Intl.NumberFormat('en-US', {
    style: 'percent',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
    signDisplay: 'always'
  }).format(percentChange / 100);
  
  // Current value formatted - use portfolio.aum if available for portfolio, currentPrice for assets, otherwise endValue
  const displayValue = isPortfolio && portfolio?.aum ? portfolio.aum : 
                       !isPortfolio && currentPrice ? currentPrice : endValue;
  const formattedValue = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(displayValue);
  
  // Change time range handler
  const handleTimeRangeChange = useCallback((_: React.MouseEvent<HTMLElement>, newRange: string) => {
    if (newRange !== null) {
      setTimeRange(newRange);
    }
  }, []);
  
  
  const formatXAxis = (tickItem: string) => {
    const date = parseISO(tickItem);
    
    if (timeRange === '1W' || timeRange === '1M') {
      return format(date, 'MMM d');
    } else {
      return format(date, 'MMM yyyy');
    }
  };
  
  const areaColor = percentChange >= 0 ? theme.palette.success.light : theme.palette.error.light;
  
  // Show loading state
  if (loading) {
    return (
      <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
        <CardContent sx={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          <Box display="flex" alignItems="center" mb={2}>
            <ShowChart sx={{ mr: 1, color: theme.palette.primary.main }} />
            <Typography variant="h6">{title}</Typography>
          </Box>
          <Typography variant="body1" color="text.secondary">Loading data...</Typography>
        </CardContent>
      </Card>
    );
  }
  
  // Show error state
  if (error) {
    return (
      <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
        <CardContent sx={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          <Box display="flex" alignItems="center" mb={2}>
            <ShowChart sx={{ mr: 1, color: theme.palette.primary.main }} />
            <Typography variant="h6">{title}</Typography>
          </Box>
          <Typography variant="body1" color="error.main">{error}</Typography>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <CardContent sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <Box mb={2} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <Box>
            <Typography variant="h6" color="primary">
              {title}
            </Typography>
            
            {/* Main Portfolio Value */}
            <Typography variant="h4" fontWeight="bold">
              {formattedValue}
            </Typography>
            
            <Box display="flex" alignItems="center" mt={0.5}>
              <Typography 
                variant="subtitle1"
                color={percentChange >= 0 ? 'success.main' : 'error.main'}
                fontWeight="medium"
              >
                {formattedChange} ({formattedPercentage})
              </Typography>
              <Typography variant="body2" color="text.secondary" ml={1}>
                {timeRange === 'ALL' ? 'all time' : timeRange === 'YTD' ? 'year to date' : `past ${timeRange}`}
              </Typography>
            </Box>
          </Box>
        </Box>
        
        <Box sx={{ flex: 1, minHeight: 200 }}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={chartData}
              margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
            >
              <defs>
                <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={areaColor} stopOpacity={0.8}/>
                  <stop offset="95%" stopColor={areaColor} stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis 
                dataKey="date" 
                tickFormatter={formatXAxis}
                tick={{ fontSize: 12 }}
                tickMargin={10}
                minTickGap={30}
              />
              <YAxis 
                domain={[
                  (dataMin: number) => Math.floor(dataMin * 0.95),
                  (dataMax: number) => Math.ceil(dataMax * 1.05)
                ]}
                tick={{ fontSize: 12 }}
                tickFormatter={(value) => 
                  new Intl.NumberFormat('en-US', {
                    style: 'currency',
                    currency: 'USD',
                    notation: 'compact',
                    maximumFractionDigits: 1
                  }).format(value)
                }
                width={70}
              />
              <Tooltip content={<CustomTooltip />} />
              <ReferenceLine 
                y={performanceData.startValue}
                stroke={theme.palette.grey[400]}
                strokeDasharray="3 3"
                ifOverflow="extendDomain"
              />
              <Area 
                type="monotone" 
                dataKey="value" 
                stroke={areaColor} 
                fillOpacity={0.6}
                fill="url(#colorValue)"
                animationDuration={750}
                isAnimationActive={true}
              />
            </AreaChart>
          </ResponsiveContainer>
        </Box>
        
        <Box display="flex" justifyContent="center" mt={2}>
          <ToggleButtonGroup
            value={timeRange}
            exclusive
            onChange={handleTimeRangeChange}
            aria-label="time range"
            size="small"
          >
            <ToggleButton value="1W">1W</ToggleButton>
            <ToggleButton value="1M">1M</ToggleButton>
            <ToggleButton value="3M">3M</ToggleButton>
            <ToggleButton value="6M">6M</ToggleButton>
            <ToggleButton value="YTD">YTD</ToggleButton>
            <ToggleButton value="1Y">1Y</ToggleButton>
            <ToggleButton value="ALL">ALL</ToggleButton>
          </ToggleButtonGroup>
        </Box>
      </CardContent>
    </Card>
  );
};

export default ValueChart;
