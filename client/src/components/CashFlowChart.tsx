import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { Card, CardContent, Typography, Box } from '@mui/material';

interface CashFlowChartProps {
  data?: Array<{
    name: string;
    value: number;
    color: string;
  }>;
  title?: string;
}

// Mock data (easily replaceable)
const defaultData = [
  { name: 'Inflow', value: 15900, color: '#4caf50' },
  { name: 'Outflow', value: 3200, color: '#f44336' },
];

// Custom tooltip to fix the mixing issue
const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0];
    return (
      <Box
        sx={{
          backgroundColor: '#fff',
          border: '1px solid #ddd',
          borderRadius: '8px',
          boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
          p: 1.5,
          zIndex: 9999,
          position: 'relative',
        }}
      >
        <Typography variant="body2" fontWeight="bold" sx={{ color: data.payload.color }}>
          {data.payload.name}
        </Typography>
        <Typography variant="body2">
          ${data.value.toLocaleString()}
        </Typography>
      </Box>
    );
  }
  return null;
};

const CashFlowChart: React.FC<CashFlowChartProps> = ({ 
  data = defaultData,
  title = "Cash Flow Overview"
}) => {
  const total = data.reduce((sum, item) => sum + item.value, 0);

  return (
    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <CardContent sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <Typography variant="h6" gutterBottom>
          {title}
        </Typography>

        <Box sx={{ flex: 1, position: 'relative', minHeight: 200, zIndex: 1 }}>
          <ResponsiveContainer width="100%" height="100%" style={{ zIndex: 10 }}>
            <PieChart style={{ zIndex: 10 }}>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={80}
                paddingAngle={5}
                dataKey="value"
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} wrapperStyle={{ zIndex: 9999 }} />
            </PieChart>
          </ResponsiveContainer>

          {/* Center value */}
          <Box
            sx={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              textAlign: 'center',
              zIndex: 5,
              pointerEvents: 'none', // This prevents the center text from interfering with tooltip
            }}
          >
            <Typography variant="h6" fontWeight="bold">
              ${total.toLocaleString()}
            </Typography>
            <Typography variant="body2" color="textSecondary">
              Total Volume
            </Typography>
          </Box>
        </Box>

        {/* Legend */}
        <Box display="flex" justifyContent="center" gap={3} mt={2}>
          {data.map((item) => (
            <Box key={item.name} display="flex" alignItems="center">
              <Box
                sx={{
                  width: 12,
                  height: 12,
                  borderRadius: '50%',
                  backgroundColor: item.color,
                  mr: 1
                }}
              />
              <Typography variant="body2">
                {item.name}: ${item.value.toLocaleString()}
              </Typography>
            </Box>
          ))}
        </Box>
      </CardContent>
    </Card>
  );
};

export default CashFlowChart;
