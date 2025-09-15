import React from 'react';
import { ChartDataPoint, TimeSeriesData } from '../../types';
import { CHART_COLORS } from '../../utils/constants';

interface SimpleBarChartProps {
  data: ChartDataPoint[];
  height?: number;
  showLabels?: boolean;
  className?: string;
}

export const SimpleBarChart: React.FC<SimpleBarChartProps> = ({
  data,
  height = 200,
  showLabels = true,
  className = ''
}) => {
  const maxValue = Math.max(...data.map(d => d.value));
  const minValue = Math.min(...data.map(d => d.value));
  const range = maxValue - minValue || 1;

  return (
    <div className={`w-full ${className}`}>
      <div className="flex items-end justify-between gap-1" style={{ height }}>
        {data.map((item, index) => {
          const barHeight = ((item.value - minValue) / range) * (height - 40);
          const color = item.color || CHART_COLORS[index % CHART_COLORS.length];
          
          return (
            <div key={item.label} className="flex flex-col items-center flex-1">
              <div
                className="w-full bg-blue-500 rounded-t transition-all duration-300 hover:opacity-80 min-h-[4px] flex items-end justify-center"
                style={{ 
                  height: Math.max(barHeight, 4),
                  backgroundColor: color
                }}
                title={`${item.label}: ${item.value}`}
              >
                <span className="text-xs text-white font-medium mb-1">
                  {item.value}
                </span>
              </div>
              {showLabels && (
                <span className="text-xs text-secondary mt-1 text-center truncate w-full">
                  {item.label}
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

interface SimpleLineChartProps {
  data: TimeSeriesData[];
  height?: number;
  color?: string;
  showDots?: boolean;
  className?: string;
}

export const SimpleLineChart: React.FC<SimpleLineChartProps> = ({
  data,
  height = 200,
  color = CHART_COLORS[0],
  showDots = true,
  className = ''
}) => {
  if (data.length === 0) {
    return (
      <div className={`w-full flex items-center justify-center text-secondary ${className}`} style={{ height }}>
        No data available
      </div>
    );
  }

  const maxValue = Math.max(...data.map(d => d.value));
  const minValue = Math.min(...data.map(d => d.value));
  const range = maxValue - minValue || 1;

  const svgHeight = height - 40;
  const svgWidth = 100; // Will be scaled with viewBox

  const points = data.map((item, index) => {
    const x = (index / (data.length - 1)) * svgWidth;
    const y = svgHeight - ((item.value - minValue) / range) * svgHeight;
    return { x, y, value: item.value, date: item.date };
  });

  const pathData = points.map((point, index) => 
    `${index === 0 ? 'M' : 'L'} ${point.x} ${point.y}`
  ).join(' ');

  return (
    <div className={`w-full ${className}`}>
      <svg width="100%" height={height} viewBox={`0 0 ${svgWidth} ${height}`} className="overflow-visible">
        {/* Grid lines */}
        <defs>
          <pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse">
            <path d="M 10 0 L 0 0 0 10" fill="none" stroke="currentColor" strokeWidth="0.5" opacity="0.1"/>
          </pattern>
        </defs>
        <rect width="100%" height={svgHeight} fill="url(#grid)" />
        
        {/* Line */}
        <path
          d={pathData}
          fill="none"
          stroke={color}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        
        {/* Area under curve */}
        <path
          d={`${pathData} L ${points[points.length - 1].x} ${svgHeight} L ${points[0].x} ${svgHeight} Z`}
          fill={color}
          fillOpacity="0.1"
        />
        
        {/* Data points */}
        {showDots && points.map((point, index) => (
          <circle
            key={index}
            cx={point.x}
            cy={point.y}
            r="3"
            fill={color}
            stroke="white"
            strokeWidth="2"
            className="hover:r-4 transition-all cursor-pointer"
          >
            <title>{`${point.date.toLocaleDateString()}: ${point.value}`}</title>
          </circle>
        ))}
        
        {/* Y-axis labels */}
        <text x="-5" y="15" fontSize="10" fill="currentColor" opacity="0.6" textAnchor="end">
          {maxValue}
        </text>
        <text x="-5" y={svgHeight + 5} fontSize="10" fill="currentColor" opacity="0.6" textAnchor="end">
          {minValue}
        </text>
      </svg>
      
      {/* X-axis labels */}
      <div className="flex justify-between mt-2 text-xs text-secondary">
        <span>{data[0]?.date.toLocaleDateString()}</span>
        <span>{data[data.length - 1]?.date.toLocaleDateString()}</span>
      </div>
    </div>
  );
};

interface SimplePieChartProps {
  data: ChartDataPoint[];
  size?: number;
  showLabels?: boolean;
  className?: string;
}

export const SimplePieChart: React.FC<SimplePieChartProps> = ({
  data,
  size = 200,
  showLabels = true,
  className = ''
}) => {
  const total = data.reduce((acc, item) => acc + item.value, 0);
  
  if (total === 0) {
    return (
      <div className={`flex items-center justify-center text-secondary ${className}`} style={{ width: size, height: size }}>
        No data
      </div>
    );
  }

  let currentAngle = 0;
  const radius = (size - 20) / 2;
  const centerX = size / 2;
  const centerY = size / 2;

  const slices = data.map((item, index) => {
    const percentage = (item.value / total) * 100;
    const sliceAngle = (item.value / total) * 360;
    const startAngle = currentAngle;
    const endAngle = currentAngle + sliceAngle;
    
    const startAngleRad = (startAngle * Math.PI) / 180;
    const endAngleRad = (endAngle * Math.PI) / 180;
    
    const largeArcFlag = sliceAngle > 180 ? 1 : 0;
    
    const startX = centerX + radius * Math.cos(startAngleRad);
    const startY = centerY + radius * Math.sin(startAngleRad);
    const endX = centerX + radius * Math.cos(endAngleRad);
    const endY = centerY + radius * Math.sin(endAngleRad);
    
    const pathData = [
      `M ${centerX} ${centerY}`,
      `L ${startX} ${startY}`,
      `A ${radius} ${radius} 0 ${largeArcFlag} 1 ${endX} ${endY}`,
      'Z'
    ].join(' ');
    
    currentAngle = endAngle;
    
    return {
      ...item,
      pathData,
      percentage,
      color: item.color || CHART_COLORS[index % CHART_COLORS.length]
    };
  });

  return (
    <div className={`flex flex-col items-center ${className}`}>
      <svg width={size} height={size} className="mb-4">
        {slices.map((slice, index) => (
          <path
            key={slice.label}
            d={slice.pathData}
            fill={slice.color}
            stroke="white"
            strokeWidth="2"
            className="hover:opacity-80 transition-opacity cursor-pointer"
          >
            <title>{`${slice.label}: ${slice.value} (${slice.percentage.toFixed(1)}%)`}</title>
          </path>
        ))}
      </svg>
      
      {showLabels && (
        <div className="flex flex-wrap justify-center gap-4">
          {slices.map((slice) => (
            <div key={slice.label} className="flex items-center gap-2">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: slice.color }}
              />
              <span className="text-sm">
                {slice.label} ({slice.percentage.toFixed(1)}%)
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
