
import React from 'react';

const commonStyles = {
  resistance: { stroke: '#ef4444', strokeWidth: 1.5, strokeDasharray: '4 2' },
  priceAction: { stroke: '#3b82f6', strokeWidth: 2, fill: 'none' },
  breakoutArrow: { stroke: '#22c55e', strokeWidth: 2, fill: '#22c55e' },
  label: { fontSize: '10px', fill: '#e5e7eb', fontFamily: 'sans-serif' },
  base: { stroke: '#8b5cf6', strokeWidth: 1.5, fill: 'none' },
};

export const StandardBreakoutSVG: React.FC = () => (
  <svg viewBox="0 0 150 100" xmlns="http://www.w3.org/2000/svg" aria-label="Standard Breakout Chart">
    <title>Standard Breakout from 52-Week High</title>
    <line x1="20" y1="20" x2="130" y2="20" style={commonStyles.resistance} />
    <text x="132" y="24" style={commonStyles.label}>52W High</text>
    
    <path d="M 10 90 Q 25 30, 40 50 T 70 45 T 100 50" style={commonStyles.priceAction} />

    <line x1="100" y1="50" x2="115" y2="20" style={commonStyles.breakoutArrow} />
    <polygon points="115,20 110,25 112,20 110,15" style={commonStyles.breakoutArrow} />
    <text x="105" y="15" style={commonStyles.label}>B/O</text>
  </svg>
);

export const CheatBreakoutSVG: React.FC = () => (
  <svg viewBox="0 0 150 100" xmlns="http://www.w3.org/2000/svg" aria-label="Cheat Breakout Chart">
    <title>Cheat Breakout from a Consolidation Range</title>
    <path d="M 10 90 C 10 20, 90 20, 90 60" style={commonStyles.base} />
    
    <line x1="80" y1="40" x2="120" y2="40" style={commonStyles.resistance} />
    <text x="122" y="44" style={commonStyles.label}>Cheat</text>

    <path d="M 90 60 Q 95 45, 100 50 T 110 48" style={commonStyles.priceAction} />
    
    <line x1="110" y1="48" x2="118" y2="40" style={commonStyles.breakoutArrow} />
    <polygon points="118,40 113,45 115,40 113,35" style={commonStyles.breakoutArrow} />
     <text x="115" y="35" style={commonStyles.label}>B/O</text>
  </svg>
);

export const DTLBreakoutSVG: React.FC = () => (
  <svg viewBox="0 0 150 100" xmlns="http://www.w3.org/2000/svg" aria-label="Down Trend Line Breakout Chart">
    <title>Down Trend Line Breakout</title>
    {/* DTL Resistance line */}
    <line x1="10" y1="15" x2="120" y2="70" style={commonStyles.resistance} />
    <text x="122" y="74" style={commonStyles.label}>DTL</text>
    
    {/* Price action path */}
    <path d="M 10 20 L 30 40 L 50 35 L 70 60 L 90 55 L 100 80 L 115 50" style={commonStyles.priceAction} />

    {/* Breakout arrow and label */}
    <line x1="105" y1="68" x2="115" y2="50" style={commonStyles.breakoutArrow} />
    <polygon points="115,50 110,55 112,50 110,45" style={commonStyles.breakoutArrow} />
    <text x="105" y="45" style={commonStyles.label}>B/O</text>
  </svg>
);

// Base64 encoded PNG for IPO Breakout
// FIX: Cleaned up corrupted base64 string.
const ipoBreakoutImage = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAJYAAABkCAYAAABa8+g2AAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAAdESURBVHhe7Z1/aBxlHMff881u1pYkCJEgCoLQg9IqYimCixYsfNCDglfESymCF6GgFwVFLx4KLVFix';

// FIX: Create and export a React component for the IPO Breakout PNG to resolve the import error.
export const IPOBreakoutPNG: React.FC = () => (
  <img src={ipoBreakoutImage} alt="IPO Breakout Chart" className="w-full h-full object-contain" />
);
