import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Card, CardContent, Typography, Box } from '@mui/material';

// Mock data for asset classes - replace this with real data later
const mockAssetClassData = [
  { name: 'Stocks', value: 65, color: '#4a90e2' },
  { name: 'ETFs', value: 20, color: '#50e3c2' },
  { name: 'Bonds', value: 10, color: '#bd10e0' },
  { name: 'Cash', value: 5, color: '#f5a623' },
];

const AssetClassChart: React.FC = () => {
  return (
    <Card>
      <CardContent>
        <Box display="flex" alignItems="center" mb={2}>
          <Typography variant="h6" color="primary">
            Asset Classes
          </Typography>
        </Box>
        <Box height={250}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              layout="vertical"
              data={mockAssetClassData}
              margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
            >
              <XAxis type="number" hide />
              <YAxis type="category" dataKey="name" width={100} />
              <Tooltip />
              <Bar dataKey="value" barSize={20}>
                {mockAssetClassData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Box>
      </CardContent>
    </Card>
  );
};

export default AssetClassChart;
