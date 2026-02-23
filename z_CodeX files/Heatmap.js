import { useState, useMemo } from "react";
import "./SubmissionHeatmapStandalone.css";

const MONTH_NAMES = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
];

const generateMonthsData = (year) => {
  const monthsData = [];
  
  for (let month = 0; month < 12; month++) {
    const days = [];
    let weekColumn = 0;
    
    const firstDayOfMonth = new Date(year, month, 1);
    const lastDayOfMonth = new Date(year, month + 1, 0);
    const firstDayOfWeek = firstDayOfMonth.getDay();
    
    let currentDate = new Date(firstDayOfMonth);
    
    while (currentDate <= lastDayOfMonth) {
      const dayOfWeek = currentDate.getDay();
      
      days.push({
        date: new Date(currentDate),
        monthIndex: month,
        dayOfWeek,
        weekOffset: weekColumn
      });
      
      if (dayOfWeek === 6) {
        weekColumn++;
      }
      
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    const maxWeeks = Math.max(...days.map(d => d.weekOffset)) + 1;
    
    monthsData.push({
      month,
      label: MONTH_NAMES[month],
      days,
      firstDayOfWeek,
      weeksCount: maxWeeks
    });
  }
  
  return monthsData;
};

const HeatmapCube = ({ date, isActive, onToggle }) => {
  const handleClick = () => {
    onToggle?.(date);
  };

  return (
    <button
      onClick={handleClick}
      className={`heatmap-cube ${isActive ? 'active' : ''}`}
      title={date.toLocaleDateString('en-US', { 
        weekday: 'short', 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric' 
      })}
      aria-label={`${date.toLocaleDateString()}, ${isActive ? 'active' : 'inactive'}`}
    />
  );
};

export const SubmissionHeatmapStandalone = () => {
  const currentYear = new Date().getFullYear();
  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [activeSubmissions, setActiveSubmissions] = useState(new Set());

  const yearRange = useMemo(() => {
    return Array.from({ length: 13 }, (_, i) => currentYear - 10 + i);
  }, [currentYear]);

  const monthsData = useMemo(() => generateMonthsData(selectedYear), [selectedYear]);

  const handleToggleCube = (date) => {
    const dateKey = date.toISOString().split('T')[0];
    setActiveSubmissions(prev => {
      const newSet = new Set(prev);
      if (newSet.has(dateKey)) {
        newSet.delete(dateKey);
      } else {
        newSet.add(dateKey);
      }
      return newSet;
    });
  };

  return (
    <div className="heatmap-container">
      <div className="heatmap-wrapper">
        <div className="heatmap-header">
          <h1 className="heatmap-title">Submission Heatmap</h1>
          
          <select 
            className="heatmap-year-select"
            value={selectedYear} 
            onChange={(e) => setSelectedYear(parseInt(e.target.value))}
          >
            {yearRange.map(year => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>
        </div>

        <div className="heatmap-content">
          <div className="heatmap-months">
            {monthsData.map((monthData) => (
              <div key={monthData.month} className="heatmap-month">
                <div className="month-label">
                  {monthData.label}
                </div>

                <div className="month-grid">
                  {Array.from({ length: 7 }).map((_, dayOfWeek) => (
                    <div key={dayOfWeek} className="day-row">
                      {Array.from({ length: monthData.weeksCount }).map((_, weekCol) => {
                        const dayData = monthData.days.find(
                          d => d.weekOffset === weekCol && d.dayOfWeek === dayOfWeek
                        );

                        if (!dayData) {
                          return <div key={weekCol} className="heatmap-cube-empty" />;
                        }

                        const dateKey = dayData.date.toISOString().split('T')[0];
                        const isActive = activeSubmissions.has(dateKey);

                        return (
                          <HeatmapCube
                            key={`${monthData.month}-${dayOfWeek}-${weekCol}`}
                            date={dayData.date}
                            isActive={isActive}
                            onToggle={handleToggleCube}
                          />
                        );
                      })}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="heatmap-legend">
          <span>Click any cube to toggle its state</span>
          <div className="legend-item">
            <div className="legend-cube empty" />
            <span>Empty</span>
          </div>
          <div className="legend-item">
            <div className="legend-cube active" />
            <span>Active</span>
          </div>
        </div>
      </div>
    </div>
  );
};