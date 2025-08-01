import React, { useState } from 'react';
import { 
  Box, 
  Card, 
  CardContent, 
  Typography, 
  MenuItem,
  Select,
  FormControl,
  InputLabel
} from '@mui/material';
import { PriceChange } from '@mui/icons-material';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';

const mockCashFlowData = [
  { name: 'Inflow', value: 34000, color: '#4a90e2' },
  { name: 'Outflow', value: 20000, color: '#50e3c2' },
];

const months = ['January', 'February', 'March', 'April', 'May'];

const CashFlowChart: React.FC = () => {
  const [selectedMonth, setSelectedMonth] = useState(months[0]);

  const handleMonthChange = (event: any) => {
    setSelectedMonth(event.target.value);
  };

  return (
    <Card>
      <CardContent>
        <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
          <Box display="flex" alignItems="center">
            <PriceChange sx={{ mr: 1, color: '#6200ea' }} />
            <Typography variant="h6" gutterBottom>
              Cash Flow
            </Typography>
          </Box>
          <FormControl size="small" variant="outlined">
            <InputLabel>Month</InputLabel>
            <Select
              value={selectedMonth}
              onChange={handleMonthChange}
              label="Month"
            >
              {months.map((month) => (
                <MenuItem key={month} value={month}>
                  {month}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>
        <Typography variant="subtitle1" align="center" gutterBottom>
          {selectedMonth}
        </Typography>
        <Box height={250}>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={mockCashFlowData}
                cx="50%"
                cy="50%"
                outerRadius={100}
                innerRadius={0}
                cornerRadius={5}
                paddingAngle={2}
                dataKey="value"
              >
                {mockCashFlowData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </Box>
      </CardContent>
    </Card>
  );
};

export default CashFlowChart;
