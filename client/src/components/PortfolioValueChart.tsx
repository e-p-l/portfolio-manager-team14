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

// Types
interface PortfolioValue {
  date: string; // ISO string format
  value: number;
}

interface PortfolioPerformanceData {
  data: PortfolioValue[];
  startValue: number;
  endValue: number;
  percentChange: number;
  highValue: number;
  lowValue: number;
  valueChange: number;
}

// Create mock data for portfolio value over time
const generateMockData = (): PortfolioValue[] => {
  const baseValue = 100000; // $100,000 starting value
  const today = new Date();
  const startDate = subYears(today, 2); // 2 years of data
  const data: PortfolioValue[] = [];
  
  // Generate daily data for 2 years
  let currentDate = startDate;
  let currentValue = baseValue;
  const volatility = 0.005; // Daily volatility
  const annualGrowth = 0.12; // 12% annual growth
  const dailyGrowth = Math.pow(1 + annualGrowth, 1/365) - 1;
  
  while (currentDate <= today) {
    // Add some randomness to create realistic market movements
    const randomFactor = 1 + (Math.random() * 2 - 1) * volatility;
    // Apply daily growth trend
    const growthFactor = 1 + dailyGrowth;
    
    currentValue = currentValue * randomFactor * growthFactor;
    
    // Add some market corrections and rallies
    // Major correction around 6 months ago
    const monthsAgo = (today.getTime() - currentDate.getTime()) / (1000 * 60 * 60 * 24 * 30);
    if (monthsAgo >= 5.9 && monthsAgo <= 6.1) {
      currentValue = currentValue * 0.92; // 8% drop
    }
    
    // Rally 3 months ago
    if (monthsAgo >= 2.9 && monthsAgo <= 3.1) {
      currentValue = currentValue * 1.07; // 7% rally
    }
    
    data.push({
      date: currentDate.toISOString(),
      value: Math.round(currentValue * 100) / 100 // Round to 2 decimal places
    });
    
    currentDate = new Date(currentDate.getTime() + 24 * 60 * 60 * 1000); // Add 1 day
  }
  
  return data;
};

// Filter data based on time range
const filterData = (data: PortfolioValue[], range: string): PortfolioPerformanceData => {
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

// Portfolio chart component
const PortfolioValueChart: React.FC = () => {
  const theme = useTheme();
  const [timeRange, setTimeRange] = useState<string>('3M');
  
  // Generate mock data once on component mount
  const [allData] = useState<PortfolioValue[]>(generateMockData);
  
  // Filter data based on selected time range
  const performanceData = filterData(allData, timeRange);
  const { data, percentChange, valueChange, endValue } = performanceData;
  
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
  
  // Current value formatted
  const formattedValue = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(endValue);
  
  // Change time range handler
  const handleTimeRangeChange = useCallback((_: React.MouseEvent<HTMLElement>, newRange: string) => {
    if (newRange !== null) {
      setTimeRange(newRange);
    }
  }, []);
  
  // No chart type handler needed
  
  // Format date for X-axis ticks
  const formatXAxis = (tickItem: string) => {
    const date = parseISO(tickItem);
    
    // Format differently based on time range
    if (timeRange === '1W' || timeRange === '1M') {
      return format(date, 'MMM d');
    } else {
      return format(date, 'MMM yyyy');
    }
  };
  
  // Calculate point colors based on performance
  const areaColor = percentChange >= 0 ? theme.palette.success.light : theme.palette.error.light;
  
  return (
    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <CardContent sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <Box display="flex" alignItems="center" mb={2}>
          <ShowChart sx={{ mr: 1, color: theme.palette.primary.main }} />
          <Typography variant="h6">
            Portfolio Value
          </Typography>
        </Box>
        
        <Box display="flex" flexDirection="column" mb={2}>
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
        
        <Box sx={{ flex: 1, minHeight: 200 }}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={data}
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

export default PortfolioValueChart;
