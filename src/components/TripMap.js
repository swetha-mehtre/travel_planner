import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet-routing-machine/dist/leaflet-routing-machine.css';
import 'leaflet-routing-machine';

// Default map center (Mysore)
const DEFAULT_CENTER = [12.2958, 76.6394];
const DEFAULT_ZOOM = 10;

// Fix for default Leaflet marker icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// Custom icon for highlighted marker
const highlightedIcon = new L.Icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconSize: [35, 55],
  iconAnchor: [17, 55],
  popupAnchor: [0, -50],
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  shadowSize: [41, 41],
});

const TripMap = ({ points = [], highlighted }) => {
  const map = useMap();
  
  // Normalize coordinates to [lat, lng]
  const validPoints = points
    .filter(point => point?.coordinates && Array.isArray(point.coordinates) && point.coordinates.length === 2)
    .map(point => ({
      ...point,
      coordinates: point.coordinates.map(coord => Number(coord)).filter(coord => !isNaN(coord))
    }))
    .filter(point => point.coordinates.length === 2);

  // Update map view based on points
  useEffect(() => {
    if (validPoints.length > 0) {
      const bounds = L.latLngBounds(validPoints.map(p => p.coordinates));
      if (bounds.isValid()) {
        map.fitBounds(bounds, { padding: [50, 50] });
      } else {
        map.setView(DEFAULT_CENTER, DEFAULT_ZOOM);
      }
    } else {
      map.setView(DEFAULT_CENTER, DEFAULT_ZOOM);
    }
  }, [validPoints, map]);

  // Add routing control for multiple points
  useEffect(() => {
    if (map && validPoints.length > 1) {
      const routingControl = L.Routing.control({
        waypoints: validPoints.map(point => L.latLng(...point.coordinates)),
        routeWhileDragging: true,
        show: false,
        lineOptions: { styles: [{ color: '#6366F1', weight: 3 }] },
        createMarker: () => null,
      }).addTo(map);

      return () => {
        map.removeLayer(routingControl);
      };
    }
  }, [map, validPoints]);

  if (!validPoints.length) {
    return (
      <div className="h-full w-full flex items-center justify-center bg-gray-800 rounded-lg">
        <p className="text-gray-300 text-center p-4">
          Generate a WanderMind itinerary to view the map
        </p>
      </div>
    );
  }

  const isPointHighlighted = (point) =>
    highlighted &&
    highlighted.name === point.name &&
    highlighted.coordinates &&
    Array.isArray(highlighted.coordinates) &&
    highlighted.coordinates[0] === point.coordinates[0] &&
    highlighted.coordinates[1] === point.coordinates[1];

  return (
    <MapContainer
      center={validPoints[0]?.coordinates || DEFAULT_CENTER}
      zoom={DEFAULT_ZOOM}
      style={{ height: '100%', width: '100%' }}
      className="rounded-lg"
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      />
      {validPoints.map((point, index) => (
        <Marker
          key={index}
          position={point.coordinates}
          icon={isPointHighlighted(point) ? highlightedIcon : undefined}
        >
          <Popup>
            <div className="p-2">
              <h3 className="font-bold">{point.name}</h3>
              <p>{point.description}</p>
              <a
                href={`https://www.google.com/maps/dir/?api=1&destination=${point.coordinates[0]},${point.coordinates[1]}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-500 hover:text-blue-700"
              >
                Get Directions
              </a>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
};

export default TripMap;