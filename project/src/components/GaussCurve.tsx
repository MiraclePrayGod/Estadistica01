import React, { useEffect, useRef } from 'react';
import Chart from 'chart.js/auto';

interface GaussCurveProps {
  confidenceLevel: number;
}

const GaussCurve: React.FC<GaussCurveProps> = ({ confidenceLevel }) => {
  const chartRef = useRef<HTMLCanvasElement>(null);
  const chartInstance = useRef<Chart | null>(null);

  const generateGaussianData = (mean: number, stdDev: number, points: number) => {
    const data = [];
    for (let i = -4; i <= 4; i += 8/points) {
      const x = i;
      const y = (1 / (stdDev * Math.sqrt(2 * Math.PI))) * 
                Math.exp(-(Math.pow(x - mean, 2) / (2 * Math.pow(stdDev, 2))));
      data.push({ x, y });
    }
    return data;
  };

  const getZValue = (confidence: number) => {
    switch (confidence) {
      case 90: return 1.645;
      case 95: return 1.96;
      case 99: return 2.576;
      default: return 1.96;
    }
  };

  useEffect(() => {
    if (chartRef.current) {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }

      const z = getZValue(confidenceLevel);
      const data = generateGaussianData(0, 1, 100);
      
      const ctx = chartRef.current.getContext('2d');
      if (ctx) {
        chartInstance.current = new Chart(ctx, {
          type: 'line',
          data: {
            datasets: [
              {
                label: 'Distribución Normal',
                data: data,
                borderColor: 'rgb(59, 130, 246)',
                backgroundColor: 'rgba(59, 130, 246, 0.1)',
                fill: true,
                pointRadius: 0,
              },
              {
                label: `Región de Confianza (${confidenceLevel}%)`,
                data: data.filter(point => Math.abs(point.x) <= z),
                borderColor: 'rgba(59, 130, 246, 0.5)',
                backgroundColor: 'rgba(59, 130, 246, 0.3)',
                fill: true,
                pointRadius: 0,
              }
            ]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: {
                display: true,
                position: 'top'
              },
              tooltip: {
                enabled: false
              }
            },
            scales: {
              x: {
                type: 'linear',
                position: 'bottom',
                title: {
                  display: true,
                  text: 'Desviaciones Estándar (σ)'
                }
              },
              y: {
                beginAtZero: true,
                title: {
                  display: true,
                  text: 'Densidad'
                }
              }
            }
          }
        });
      }
    }

    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
    };
  }, [confidenceLevel]);

  return (
    <div className="h-64">
      <canvas ref={chartRef}></canvas>
    </div>
  );
};

export default GaussCurve;