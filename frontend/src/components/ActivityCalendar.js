import React from 'react';
import './ActivityCalendar.css';

// Expect data: array of 12 months, each month is array of weeks, each week is array of 7 numbers (0-3)
const ActivityCalendar = ({ data }) => {
  if (!data || data.length === 0) {
    return <div className="text-gray-400 text-sm">No submission data available.</div>;
  }

  const months = data && data.length === 12 
    ? data 
    : Array.from({ length: 12 }, () => 
        Array.from({ length: 5 }, () => 
          Array.from({ length: 7 }, () => 
            Math.random() > 0.7 ? Math.ceil(Math.random() * 3) : 0
          )
        )
      );

  return (
    <div className="activity-calendar">
      {months.map((month, i) => (
        <div key={i} className="month-column">
          <div className="weeks-container">
            {month.map((week, wIdx) => (
              <div key={wIdx} className="week-row">
                {week.map((day, dIdx) => (
                  <div
                    key={dIdx}
                    title={`Contributions: ${day}`}
                    className={`day-cell day-cell-${day}`}
                  />
                ))}
              </div>
            ))}
          </div>
          <div className="month-label">
            {new Date(0, i).toLocaleString(undefined, { month: 'short' })}
          </div>
        </div>
      ))}
    </div>
  );
};

export default ActivityCalendar;
