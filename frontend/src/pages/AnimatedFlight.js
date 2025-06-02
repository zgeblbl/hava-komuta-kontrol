import { useEffect, useState } from 'react';
import { Marker, useMap } from 'react-leaflet';
import L from 'leaflet';

function AnimatedFlight({ flight, duration }) {
  const [position, setPosition] = useState(flight.start);
  const map = useMap();

  useEffect(() => {
    const [startLat, startLng] = flight.start;
    const [endLat, endLng] = flight.end;

    const steps = 200; // Number of animation steps
    const interval = duration / steps;

    let currentStep = 0;
    const latStep = (endLat - startLat) / steps;
    const lngStep = (endLng - startLng) / steps;

    const intervalId = setInterval(() => {
      currentStep += 1;
      const newLat = startLat + latStep * currentStep;
      const newLng = startLng + lngStep * currentStep;

      setPosition([newLat, newLng]);

      if (currentStep >= steps) {
        clearInterval(intervalId);
      }
    }, interval);

    return () => clearInterval(intervalId);
  }, [flight, duration]);

  // Optional: calculate heading
  const angle = Math.atan2(flight.end[1] - flight.start[1], flight.end[0] - flight.start[0]) * (180 / Math.PI);

  const icon = L.divIcon({
    html: `
      <div style="transform: rotate(${angle}deg); color: red;">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
          <path d="M21 16v-2l-8-5V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z"/>
        </svg>
      </div>
    `,
    className: '',
    iconSize: [24, 24],
    iconAnchor: [12, 12]
  });

  return <Marker position={position} icon={icon} />;
}

export default AnimatedFlight;
