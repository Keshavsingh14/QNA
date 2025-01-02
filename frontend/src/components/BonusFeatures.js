import React from "react";

export const BonusFeatures = ({ onHint, onFormat, onThemeChange }) => {
  return (
    <div className="bonus-features">
      <div className="feature-group">
        <h3>Extra Tools</h3>
        <button className="feature-btn hint-btn" onClick={onHint}>
          <i className="fas fa-lightbulb"></i>
          Get Hint
        </button>
        <button className="feature-btn format-btn" onClick={onFormat}>
          <i className="fas fa-code"></i>
          Format Code
        </button>
        <select
          className="theme-select"
          onChange={(e) => onThemeChange(e.target.value)}
        >
          <option value="vs-dark">Dark Theme</option>
          <option value="light">Light Theme</option>
          <option value="hc-black">High Contrast</option>
        </select>
      </div>
    </div>
  );
};
