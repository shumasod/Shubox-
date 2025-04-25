import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const VolumeChart = ({ data }) => {
  return (
    <ResponsiveContainer width="100%" height={80}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="#444" />
        <XAxis dataKey="date" stroke="#888" hide />
        <YAxis stroke="#888" />
        <Tooltip
          contentStyle={{ backgroundColor: '#333', border: 'none' }}
          itemStyle={{ color: '#fff' }}
          labelStyle={{ color: '#999' }}
        />
        <Bar dataKey="volume" fill="#3b82f6" />
      </BarChart>
    </ResponsiveContainer>
  );
};

export default VolumeChart;
