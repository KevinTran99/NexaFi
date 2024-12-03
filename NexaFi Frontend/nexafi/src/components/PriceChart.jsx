import { Line } from 'react-chartjs-2';
import 'chart.js/auto';

const MarketplaceGraph = () => {
  const fakePriceData = [
    { time: '2024-10-01', price: 66 },
    { time: '2024-10-02', price: 65 },
    { time: '2024-10-03', price: 64 },
    { time: '2024-10-04', price: 63 },
    { time: '2024-10-05', price: 64 },
    { time: '2024-10-06', price: 62 },
    { time: '2024-10-07', price: 61 },
    { time: '2024-10-08', price: 63 },
    { time: '2024-10-09', price: 65 },
    { time: '2024-10-10', price: 66 },
    { time: '2024-10-11', price: 67 },
    { time: '2024-10-12', price: 65 },
    { time: '2024-10-13', price: 68 },
    { time: '2024-10-14', price: 66 },
    { time: '2024-10-15', price: 64 },
    { time: '2024-10-16', price: 63 },
    { time: '2024-10-17', price: 65 },
    { time: '2024-10-18', price: 62 },
    { time: '2024-10-19', price: 63 },
    { time: '2024-10-20', price: 64 },
    { time: '2024-10-21', price: 66 },
    { time: '2024-10-22', price: 67 },
    { time: '2024-10-23', price: 68 },
    { time: '2024-10-24', price: 69 },
    { time: '2024-10-25', price: 70 },
    { time: '2024-10-26', price: 68 },
    { time: '2024-10-27', price: 70 },
    { time: '2024-10-28', price: 68 },
    { time: '2024-10-29', price: 67 },
    { time: '2024-10-30', price: 65 },
    { time: '2024-10-31', price: 64 },
    { time: '2024-11-01', price: 66 },
    { time: '2024-11-02', price: 64 },
    { time: '2024-11-03', price: 66 },
    { time: '2024-11-04', price: 67 },
    { time: '2024-11-05', price: 68 },
    { time: '2024-11-06', price: 69 },
    { time: '2024-11-07', price: 70 },
    { time: '2024-11-08', price: 71 },
    { time: '2024-11-09', price: 70 },
    { time: '2024-11-10', price: 69 },
    { time: '2024-11-11', price: 67 },
    { time: '2024-11-12', price: 68 },
    { time: '2024-11-13', price: 71 },
    { time: '2024-11-14', price: 73 },
    { time: '2024-11-15', price: 71 },
    { time: '2024-11-16', price: 72 },
    { time: '2024-11-17', price: 73 },
    { time: '2024-11-18', price: 74 },
    { time: '2024-11-19', price: 73 },
    { time: '2024-11-20', price: 72 },
  ];

  const chartData = {
    labels: fakePriceData.map(entry => entry.time),
    datasets: [
      {
        label: 'EUA Carbon NFTs (USD)',
        data: fakePriceData.map(entry => entry.price),
        borderColor: '#3b802a',
        backgroundColor: 'rgba(59, 128, 42, 0.1)',
        fill: true,
        tension: 0.3,
        pointRadius: 0,
        pointHoverRadius: 6,
        pointHitRadius: 20,
        borderWidth: 1.5,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        display: false,
      },
    },
    scales: {
      x: {
        title: {
          display: true,
        },
        ticks: {
          callback: function (value) {
            const date = this.getLabelForValue(value);
            const [, month, day] = date.split('-');

            if (day === '01') {
              return month === '10' ? 'Oct' : month === '11' ? 'Nov' : '';
            } else if (day === '10' || day === '20') {
              return day;
            } else {
              return '';
            }
          },
          maxRotation: 0,
          autoSkip: false,
        },
        grid: {
          display: false,
        },
      },
      y: {
        title: {
          display: true,
        },
        beginAtZero: true,
        position: 'right',
        min: 60,
        max: 78,
      },
    },
  };

  return <Line data={chartData} options={chartOptions} />;
};

export default MarketplaceGraph;
