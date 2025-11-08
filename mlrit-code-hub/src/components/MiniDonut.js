import React from 'react';
import './MiniDonut.css';

const MiniDonut = ({ value = 0, total = 100, size = 120, stroke = 12, color = '#3b82f6' }) => {
  const ratio = total > 0 ? Math.max(0, Math.min(1, value / total)) : 0;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const dash = `${circumference * ratio} ${circumference}`;

  return (
    <svg className="mini-donut" width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <defs>
        <linearGradient id="g1" x1="0%" x2="100%" y1="0%" y2="0%">
          <stop offset="0%" stopColor={color} className="mini-donut__gradient-stop-start" />
          <stop offset="100%" stopColor={color} className="mini-donut__gradient-stop-end" />
        </linearGradient>
      </defs>
      <g transform={`translate(${size/2}, ${size/2})`}>
        <circle className="mini-donut__base-circle" r={radius} strokeWidth={stroke} />
        <circle 
          className="mini-donut__progress-circle"
          r={radius}
          stroke="url(#g1)"
          strokeWidth={stroke}
          strokeDasharray={dash}
        />
        <text className="mini-donut__text" x="0" y="0">{value}</text>
      </g>
    </svg>
  );
};

export default MiniDonut;
