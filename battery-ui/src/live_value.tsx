import React from 'react';
import './App.css';

interface TemperatureProps {
  temp: number;
}

function LiveValue({ temp } : TemperatureProps) {

  let valueColour = 'white';
//Making the battery temperature value change colours based on the current temperature
//Red for too hot, blue for too cold
  if (temp < 20) {
    valueColour = 'blue';
  } else if (temp > 80) {
    valueColour = 'red';
  } else {
    valueColour = 'white';
  }

  return (
      <header className="live-value" style={{ color : valueColour }}>
        {`${temp.toString()}°C`}
      </header>
  );
}

export default LiveValue;