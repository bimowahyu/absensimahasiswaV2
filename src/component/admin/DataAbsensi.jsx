import React, { useState } from 'react';
import axios from 'axios';
import useSWR from 'swr';
import { 
  LineChart, Line, BarChart, Bar, 
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, 
  ResponsiveContainer, LabelList
} from 'recharts';

axios.defaults.withCredentials = true;
const getApiBaseUrl = () => {
  const protocol = window.location.protocol === 'https:' ? 'https' : 'http';
  const baseUrl = process.env.REACT_APP_API_BASE_URL.replace(/^https?:\/\//, '');
  return `${protocol}://${baseUrl}`;
};

const fetcher = (url) => axios.get(url).then(res => res.data);

const AbsensiChart = () => {
  const now = new Date();
  const bulan = now.getMonth() + 1;
  const tahun = now.getFullYear();
  const [chartType, setChartType] = useState('line');

  const { data, error } = useSWR(`${getApiBaseUrl()}/absensitotal/get?bulan=${bulan}&tahun=${tahun}`, fetcher);

  if (error) return <div>Silahkan refresh</div>;
  if (!data) return <div>Loading...</div>;

  const chartData = Object.keys(data).map(karyawanId => ({
    name: data[karyawanId].nama_lengkap,
    kehadiran: data[karyawanId].kehadiran
  }));

  return (
    <div style={{ width: '100%', height: '450px' }}>
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        marginBottom: '16px'
      }}>
        <h3 style={{ 
          fontSize: '1.2rem', 
          fontWeight: 'bold', 
          color: '#333', 
          margin: 0 
        }}>
          Grafik Kehadiran - {new Intl.DateTimeFormat('id-ID', { month: 'long', year: 'numeric' }).format(now)}
        </h3>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button 
            onClick={() => setChartType('line')}
            style={{ 
              padding: '6px 12px', 
              border: 'none', 
              borderRadius: '4px', 
              cursor: 'pointer',
              backgroundColor: chartType === 'line' ? '#3f51b5' : '#f0f0f0',
              color: chartType === 'line' ? 'white' : '#333',
              fontWeight: chartType === 'line' ? 'bold' : 'normal',
              fontSize: '0.8rem'
            }}
          >
            Line Chart
          </button>
          <button 
            onClick={() => setChartType('bar')}
            style={{ 
              padding: '6px 12px', 
              border: 'none', 
              borderRadius: '4px', 
              cursor: 'pointer',
              backgroundColor: chartType === 'bar' ? '#3f51b5' : '#f0f0f0',
              color: chartType === 'bar' ? 'white' : '#333',
              fontWeight: chartType === 'bar' ? 'bold' : 'normal',
              fontSize: '0.8rem'
            }}
          >
            Bar Chart
          </button>
        </div>
      </div>

      <ResponsiveContainer>
        {chartType === 'line' ? (
          <LineChart
            data={chartData}
            margin={{ top: 20, right: 30, left: 20, bottom: 70 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis 
              dataKey="name" 
              angle={-45} 
              textAnchor="end" 
              height={80} 
              tick={{ fontSize: 12 }}
              tickMargin={10}
            />
            <YAxis 
              label={{ 
                value: 'Jumlah Kehadiran', 
                angle: -90, 
                position: 'insideLeft',
                style: { textAnchor: 'middle' }
              }} 
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: 'rgba(255, 255, 255, 0.95)', 
                borderRadius: '8px', 
                border: '1px solid #f0f0f0',
                boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
              }} 
              cursor={{ strokeDasharray: '3 3' }}
            />
            <Legend wrapperStyle={{ paddingTop: '10px' }} />
            <Line 
              type="monotone" 
              dataKey="kehadiran" 
              stroke="#3f51b5" 
              strokeWidth={2}
              activeDot={{ r: 8, fill: '#3f51b5', stroke: 'white', strokeWidth: 2 }}
              dot={{ r: 4, fill: '#3f51b5', stroke: 'white', strokeWidth: 1 }}
            >
              <LabelList dataKey="kehadiran" position="top" style={{ fontWeight: 'bold' }} />
            </Line>
          </LineChart>
        ) : (
          <BarChart
            data={chartData}
            margin={{ top: 20, right: 30, left: 20, bottom: 70 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis 
              dataKey="name" 
              angle={-45} 
              textAnchor="end" 
              height={80} 
              tick={{ fontSize: 12 }}
              tickMargin={10}
            />
            <YAxis 
              label={{ 
                value: 'Jumlah Kehadiran', 
                angle: -90, 
                position: 'insideLeft',
                style: { textAnchor: 'middle' }
              }} 
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: 'rgba(255, 255, 255, 0.95)', 
                borderRadius: '8px', 
                border: '1px solid #f0f0f0',
                boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
              }} 
              cursor={{ fill: 'rgba(0,0,0,0.05)' }}
            />
            <Legend wrapperStyle={{ paddingTop: '10px' }} />
            <Bar 
              dataKey="kehadiran" 
              fill="#3f51b5" 
              radius={[4, 4, 0, 0]}
              barSize={30}
            >
              <LabelList dataKey="kehadiran" position="top" style={{ fontWeight: 'bold' }} />
            </Bar>
          </BarChart>
        )}
      </ResponsiveContainer>
    </div>
  );
};

export default AbsensiChart;