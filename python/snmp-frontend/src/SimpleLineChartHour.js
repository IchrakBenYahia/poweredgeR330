import React, { useState, useEffect } from 'react';
import { LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';

const TemperatureLineChartHour = () => {
  const [chartData, setChartData] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('http://127.0.0.1:5000/api/tempData'); 
        const data = await response.json();
        console.log('Fetched data:', data); // Log fetched data
        const formattedData = data.map(item => ({
          heure: item[0],
          temperature: item[1]
        }));
        console.log('Formatted data:', formattedData); // Log formatted data
        setChartData(formattedData);  
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, []);

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
        <Line type="monotone" dataKey="temperature" stroke="#8884d8" />
        <CartesianGrid stroke="#ccc" />
        <XAxis dataKey="heure" />
        <YAxis domain={[0, 60]} /> {/* Set domain to include 50 */}
        <Tooltip />
        <ReferenceLine y={50} stroke="red" label={{ position: 'insideRight', value: '50°C', fill: 'red', fontSize: 12 }} />
      </LineChart>
    </ResponsiveContainer>
  );
};

export default TemperatureLineChartHour;
