import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet-routing-machine/dist/leaflet-routing-machine.css';
import 'leaflet-routing-machine';
import logo from './assets/logo.png';

// Fix default Leaflet marker icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

function TripMap({ points = [] }) {
  const [map, setMap] = useState(null);
  const defaultCenter = { lat: 12.97, lng: 77.59 }; // Bangalore fallback

  // Validate coordinates
  const validPoints = points.filter(point => {
    const isValid = point?.coordinates?.lat &&
                    point?.coordinates?.lng &&
                    typeof point.coordinates.lat === 'number' &&
                    typeof point.coordinates.lng === 'number' &&
                    !isNaN(point.coordinates.lat) &&
                    !isNaN(point.coordinates.lng) &&
                    point.coordinates.lat >= -90 && point.coordinates.lat <= 90 &&
                    point.coordinates.lng >= -180 && point.coordinates.lng <= 180;
    if (!isValid) console.log('Invalid point:', point);
    return isValid;
  });

  console.log('TripMap validPoints:', validPoints);

  const center = validPoints.length > 0
    ? { lat: validPoints[0].coordinates.lat, lng: validPoints[0].coordinates.lng }
    : defaultCenter;

  useEffect(() => {
    if (map && validPoints.length > 0) {
      const bounds = L.latLngBounds(validPoints.map(p => [p.coordinates.lat, p.coordinates.lng]));
      map.fitBounds(bounds);
    }
  }, [map, validPoints]);

  useEffect(() => {
    if (map && validPoints.length > 1) {
      map.eachLayer(layer => {
        if (layer instanceof L.Routing.Control) map.removeLayer(layer);
      });

      try {
        L.Routing.control({
          waypoints: validPoints.map(point => L.latLng(point.coordinates.lat, point.coordinates.lng)),
          routeWhileDragging: true,
          show: false,
          lineOptions: { styles: [{ color: '#6366F1', weight: 3 }] },
        }).addTo(map);
      } catch (error) {
        console.error('Routing error:', error);
      }
    }
  }, [map, validPoints]);

  if (validPoints.length === 0) {
    return (
      <div className="h-full w-full flex items-center justify-center bg-[#1a1b2e] rounded-lg">
        <div className="text-gray-300 text-center p-4">
          Generate an itinerary to see the map
        </div>
      </div>
    );
  }

  return (
    <MapContainer
      center={[center.lat, center.lng]}
      zoom={12}
      style={{ height: '100%', width: '100%' }}
      ref={setMap}
      className="map-container"
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      />
      {validPoints.map((point, index) => (
        <Marker key={index} position={[point.coordinates.lat, point.coordinates.lng]}>
          <Popup>
            <div>
              <h3 className="font-bold">{point.name}</h3>
              <p>{point.description}</p>
              <a
                href={`https://www.google.com/maps/dir/?api=1&destination=${point.coordinates.lat},${point.coordinates.lng}`}
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
}

function TripForm({ onSubmit, disabled }) {
  return (
    <div className="login-box">
      <h2>Plan Your Trip</h2>
      <form onSubmit={onSubmit}>
        <div className="trip-box">
          <input type="text" name="destination" required disabled={disabled} />
          <label>Destination</label>
        </div>
        <div className="date-pair">
          <div className="trip-box">
            <input
              type="text"
              name="startDate"
              required
              disabled={disabled}
              onFocus={(e) => (e.target.type = 'date')}
              onBlur={(e) => { if (!e.target.value) e.target.type = 'text'; }}
            />
            <label>Start Date</label>
          </div>
          <div className="trip-box">
            <input
              type="text"
              name="endDate"
              required
              disabled={disabled}
              onFocus={(e) => (e.target.type = 'date')}
              onBlur={(e) => { if (!e.target.value) e.target.type = 'text'; }}
            />
            <label>End Date</label>
          </div>
        </div>
        <div className="budget-pair">
          <div className="trip-box">
            <input type="number" name="budget" required disabled={disabled} />
            <label>Budget (USD)</label>
          </div>
          <div className="trip-box">
            <input type="number" name="numberOfPeople" min="1" required disabled={disabled} />
            <label>Number of People</label>
          </div>
        </div>
        <div className="trip-box">
          <input type="text" name="interests" required disabled={disabled} />
          <label>Interests (comma-separated)</label>
        </div>
        <div className="trip-box">
          <input 
            type="text" 
            name="groqApiKey" 
            disabled={disabled}
            defaultValue={process.env.REACT_APP_GROQ_API_KEY || ''}
            placeholder={process.env.REACT_APP_GROQ_API_KEY ? 'Using API key from .env' : 'Enter your Groq API key'}
          />
          <label>Groq API Key (optional if set in .env)</label>
        </div>
        <label className="api-note">
          <a href="https://console.groq.com/keys" className="api-link">
            Get your key
          </a>
          <span className="api-info">Your API key is stored locally and never sent to our servers</span>
        </label>
        <button type="submit" disabled={disabled} className="submit-button">
          Generate Itinerary
        </button>
      </form>
    </div>
  );
}

function Loader({ size }) {
  return (
    <div
      className="loader"
      style={{
        width: `${size}px`,
        height: `${size}px`,
        border: `${size / 9}px solid rgba(255, 255, 255, 0.3)`,
        borderTop: `${size / 9}px solid #ffffff`,
        borderRadius: '50%',
        animation: 'spin 1s linear infinite',
      }}
    />
  );
}

function Brand({ compact }) {
  return (
    <div className="brand">
      <img
        src={logo}
        alt="WanderMind Logo"
        className="brand-logo"
        onError={(e) => { e.target.src = 'https://via.placeholder.com/40'; }}
      />
      {!compact && (
        <div className="brand-text">
          <span className="brand-title">WanderMind</span>
          <span className="brand-subtitle">Smart Trip Planner</span>
        </div>
      )}
    </div>
  );
}

function ItineraryDisplay({ itinerary, tripData, onItineraryUpdate, setHighlighted }) {
  if (!itinerary || itinerary.days.length === 0) return null;

  return (
    <div className="itinerary-display">
      <div className="itinerary-header">
        <h3>{tripData?.destination || 'Your'} Trip Itinerary</h3>
        <p className="itinerary-dates">
          {tripData?.startDate} - {tripData?.endDate}
        </p>
        <p className="itinerary-budget">Budget: ${tripData?.budget || 0} for {tripData?.numberOfPeople || 1} people</p>
      </div>
      {itinerary.days.map((day, dayIndex) => (
        <div key={dayIndex} className="itinerary-day">
          <h4 className="day-title">Day {dayIndex + 1}: {day.date}</h4>
          <div className="day-schedule">
            {day.activities?.map((activity, activityIndex) => (
              <div key={`activity-${dayIndex}-${activityIndex}`} className="schedule-item activity-item">
                <div className="schedule-time">{activity.time || '09:00 AM'}</div>
                <div className="schedule-content">
                  <h5 className="activity-name" onClick={() => setHighlighted(activity)}>
                    {activity.name}
                  </h5>
                  <p className="activity-description">{activity.description}</p>
                  {activity.price && <span className="price-tag">${activity.price}</span>}
                </div>
              </div>
            ))}
            {day.meals?.map((meal, mealIndex) => (
              <div key={`meal-${dayIndex}-${mealIndex}`} className="schedule-item meal-item">
                <div className="schedule-time">{meal.time || '12:00 PM'}</div>
                <div className="schedule-content">
                  <h5 className="meal-name" onClick={() => setHighlighted(meal)}>
                    {meal.name} ({meal.type})
                  </h5>
                  <p className="meal-description">{meal.description}</p>
                  {meal.price && <span className="price-tag">${meal.price}</span>}
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function App() {
  const [tripData, setTripData] = useState(null);
  const [itinerary, setItinerary] = useState(null);
  const [mapPoints, setMapPoints] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [highlighted, setHighlighted] = useState(null);

  // Shared coordinate validation
  const validateCoordinates = (coords) => {
    return Array.isArray(coords) &&
           coords.length === 2 &&
           typeof coords[0] === 'number' &&
           typeof coords[1] === 'number' &&
           !isNaN(coords[0]) &&
           !isNaN(coords[1]) &&
           coords[0] >= -90 && coords[0] <= 90 &&
           coords[1] >= -180 && coords[1] <= 180
      ? { lat: coords[0], lng: coords[1] }
      : null;
  };

  const handleTripSubmit = async (e) => {
    e.preventDefault();
    const formData = {
      destination: e.target.destination.value,
      startDate: e.target.startDate.value,
      endDate: e.target.endDate.value,
      budget: e.target.budget.value,
      numberOfPeople: e.target.numberOfPeople.value,
      interests: e.target.interests.value,
      groqApiKey: e.target.groqApiKey.value || process.env.REACT_APP_GROQ_API_KEY,
    };
    setLoading(true);
    setError(null);
    setHighlighted(null);
    try {
      setTripData(formData);
      const result = await generateItinerary(formData);
      if (!result.itinerary || !result.itinerary.days) {
        throw new Error('Invalid itinerary data from API');
      }

      // Transform itinerary with validated coordinates
      const transformedItinerary = {
        ...result.itinerary,
        days: result.itinerary.days.map(day => ({
          ...day,
          activities: Array.isArray(day.activities)
            ? day.activities
                .map(activity => ({
                  ...activity,
                  coordinates: validateCoordinates(activity.coordinates)
                }))
                .filter(activity => activity.coordinates)
            : [],
          meals: Array.isArray(day.meals)
            ? day.meals
                .map(meal => ({
                  ...meal,
                  coordinates: validateCoordinates(meal.coordinates)
                }))
                .filter(meal => meal.coordinates)
            : [],
        })),
      };

      // Derive mapPoints from locations or itinerary
      let transformedLocations = [];
      if (result.locations?.length > 0) {
        transformedLocations = result.locations
          .map(loc => ({
            name: loc.name,
            coordinates: validateCoordinates(loc.coordinates),
            description: loc.description || loc.name,
          }))
          .filter(loc => loc.coordinates);
      } else {
        const allLocations = transformedItinerary.days.flatMap(day => [
          ...(Array.isArray(day.activities) ? day.activities.map(activity => ({
            name: activity.name,
            coordinates: activity.coordinates,
            description: activity.description,
          })) : []),
          ...(Array.isArray(day.meals) ? day.meals.map(meal => ({
            name: meal.name,
            coordinates: meal.coordinates,
            description: `${meal.type} - ${meal.description}`,
          })) : []),
        ]);
        const uniqueLocations = [];
        const seenNames = new Set();
        for (const loc of allLocations) {
          if (loc.coordinates && !seenNames.has(loc.name)) {
            seenNames.add(loc.name);
            uniqueLocations.push(loc);
          }
        }
        transformedLocations = uniqueLocations;
      }

      // Fallback for Bangalore
      if (transformedLocations.length === 0 && formData.destination.toLowerCase().includes('bang')) {
        console.log('Using fallback Bangalore coordinates');
        transformedLocations = [
          {
            name: 'Bangalore City Center',
            coordinates: { lat: 12.97, lng: 77.59 },
            description: 'Fallback location for Bangalore',
          },
        ];
      }

      setItinerary(transformedItinerary);
      setMapPoints(transformedLocations);

      if (transformedLocations.length === 0) {
        setError('No valid coordinates found for map points.');
      }
    } catch (err) {
      console.error('Error in handleTripSubmit:', err);
      setError(err.message || 'Failed to generate itinerary. Please check your API key or try again.');
      if (formData.destination.toLowerCase().includes('bang')) {
        console.log('Setting fallback Bangalore mapPoints');
        setMapPoints([
          {
            name: 'Bangalore City Center',
            coordinates: { lat: 12.97, lng: 77.59 },
            description: 'Fallback location due to error',
          },
        ]);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleItineraryUpdate = (updatedItinerary) => {
    setItinerary(updatedItinerary);
    setHighlighted(null);
    const newMapPoints = updatedItinerary.days.flatMap(day => [
      ...(Array.isArray(day.activities)
        ? day.activities
            .filter(activity => activity.coordinates)
            .map(activity => ({
              name: activity.name,
              coordinates: activity.coordinates,
              description: activity.description,
            }))
        : []),
      ...(Array.isArray(day.meals)
        ? day.meals
            .filter(meal => meal.coordinates)
            .map(meal => ({
              name: meal.name,
              coordinates: meal.coordinates,
              description: `${meal.type} - ${meal.description}`,
            }))
        : []),
    ]);
    const uniqueMapPoints = [];
    const seenNames = new Set();
    for (const point of newMapPoints) {
      if (!seenNames.has(point.name)) {
        seenNames.add(point.name);
        uniqueMapPoints.push(point);
      }
    }
    setMapPoints(uniqueMapPoints);

    if (uniqueMapPoints.length === 0 && tripData?.destination.toLowerCase().includes('bang')) {
      console.log('Setting fallback Bangalore mapPoints for update');
      setMapPoints([
        {
          name: 'Bangalore City Center',
          coordinates: { lat: 12.97, lng: 77.59 },
          description: 'Fallback location for itinerary update',
        },
      ]);
    }
  };

  return (
    <>
      <style>{`
        html, body {
          height: 100%;
          margin: 0;
          padding: 0;
          background-color: #1a1b2e;
          color: #ffffff;
          font-family: 'Arial', sans-serif;
        }
        header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 1.5rem 2rem;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
          background-color: #1a1b2e;
        }
        .container {
          max-width: calc(100vw - 2cm);
          margin-left: 1cm;
          margin-right: 1cm;
          padding: 2rem 0;
        }
        .min-h-screen {
          min-height: 100vh;
        }
        .bg-dark {
          background-color: #1a1b2e;
        }
        .error {
          background-color: #7f1d1d;
          border: 1px solid #b91c1c;
          color: #fca5a5;
          padding: 0.75rem 1rem;
          border-radius: 0.25rem;
          margin-bottom: 1rem;
        }
        .grid {
          display: grid;
          grid-template-columns: minmax(400px, 400px) 1fr;
          gap: 1cm;
        }
        @media (min-width: 1024px) {
          .grid {
            grid-template-columns: minmax(400px, 400px) 1fr;
          }
        }
        .space-y-8 > * + * {
          margin-top: 2rem;
        }
        .map-container-wrapper {
          height: 600px;
          width: 100%;
          border-radius: 0.5rem;
          box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
          overflow: hidden;
          background: #ffffff;
        }
        .map-container {
          height: 100% !important;
          width: 100%;
          border-radius: 0.5rem;
        }
        .leaflet-container {
          height: 100% !important;
          width: 100% !important;
          border-radius: 0.5rem;
        }
        .text-center {
          text-align: center;
        }
        .py-4 {
          padding-top: 1rem;
          padding-bottom: 1rem;
        }
        .animate-spin {
          animation: spin 1s linear infinite;
        }
        .h-8 {
          height: 2rem;
        }
        .w-8 {
          width: 2rem;
        }
        .border-b-2 {
          border-bottom-width: 2px;
        }
        .border-purple-500 {
          border-color: #a78bfa;
        }
        .mx-auto {
          margin-left: auto;
          margin-right: auto;
        }
        .mt-2 {
          margin-top: 0.5rem;
        }
        .text-gray-400 {
          color: #9ca3af;
        }
        .flex {
          display: flex;
        }
        .items-center {
          align-items: center;
        }
        .brand {
          display: flex;
          align-items: center;
        }
        .brand-logo {
          width: 40px;
          height: 40px;
          margin-right: 0.75rem;
        }
        .brand-text {
          display: flex;
          flex-direction: column;
        }
        .brand-title {
          font-size: 1.5rem;
          font-weight: bold;
          line-height: 1;
          color: #1e2a44;
        }
        .brand-subtitle {
          font-size: 0.875rem;
          color: #6c757d;
          line-height: 1;
        }
        .login-box {
          width: 400px;
          padding: 40px;
          background: #1a1b2e;
          box-sizing: border-box;
          box-shadow: 0 15px 25px rgba(0,0,0,.6);
          border-radius: 10px;
        }
        .login-box h2 {
          margin: 0 0 30px;
          padding: 0;
          color: #fff;
          text-align: center;
          font-size: 2rem;
        }
        .trip-box {
          position: relative;
        }
        .trip-box input {
          width: 100%;
          padding: 10px 0;
          font-size: 16px;
          color: #fff;
          margin-bottom: 30px;
          border: none;
          border-bottom: 1px solid #fff;
          outline: none;
          background: transparent;
        }
        .trip-box input:disabled {
          background: transparent;
          color: #ccc;
        }
        .trip-box label {
          position: absolute;
          top: 0;
          left: 0;
          padding: 10px 0;
          font-size: 16px;
          color: #fff;
          pointer-events: none;
          transition: .5s;
        }
        .trip-box input:focus ~ label,
        .trip-box input:valid ~ label {
          top: -20px;
          left: 0;
          color: #fff;
          font-size: 12px;
        }
        .date-pair, .budget-pair {
          display: flex;
          justify-content: space-between;
          margin-bottom: 10px;
        }
        .date-pair .trip-box, .budget-pair .trip-box {
          width: 48%;
        }
        .trip-box input[type="date"] {
          text-align: center;
        }
        .trip-box input[type="date"]::-webkit-calendar-picker-indicator {
          filter: invert(1);
        }
        .api-note {
          display: block;
          margin-top: 0.25rem;
          font-size: 0.75rem;
          color: #a0aec0;
        }
        .api-link {
          color: #03e9f4;
          text-decoration: underline;
          margin-right: 0.5rem;
        }
        .api-info {
          font-size: 0.75rem;
          color: #a0aec0;
        }
        .submit-button {
          position: relative;
          display: inline-block;
          padding: 10px 20px;
          color: #03e9f4;
          font-size: 16px;
          text-decoration: none;
          text-transform: uppercase;
          overflow: hidden;
          transition: .5s;
          margin-top: 40px;
          letter-spacing: 4px;
          background: transparent;
          border: none;
          cursor: pointer;
        }
        .submit-button:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
        .loader {
          border-radius: 50%;
        }
        .itinerary-display {
          background: #16213e;
          border-radius: 10px;
          padding: 20px;
          margin-top: 20px;
          max-height: 600px;
          overflow-y: auto;
        }
        .itinerary-header {
          text-align: center;
          margin-bottom: 20px;
          padding-bottom: 15px;
          border-bottom: 1px solid #394867;
        }
        .itinerary-header h3 {
          color: #03e9f4;
          margin: 0 0 5px 0;
          font-size: 1.5rem;
        }
        .itinerary-dates, .itinerary-budget {
          color: #a0aec0;
          margin: 0 0 5px 0;
          font-size: 0.9rem;
        }
        .itinerary-day {
          margin-bottom: 25px;
          padding-bottom: 15px;
          border-bottom: 1px solid #394867;
        }
        .day-title {
          color: #fff;
          margin: 0 0 15px 0;
          font-size: 1.2rem;
          font-weight: bold;
        }
        .day-schedule {
          display: flex;
          flex-direction: column;
          gap: 15px;
        }
        .schedule-item {
          display: flex;
          align-items: flex-start;
          gap: 15px;
          padding: 12px;
          background: rgba(255, 255, 255, 0.05);
          border-radius: 8px;
          cursor: pointer;
          transition: background 0.2s;
        }
        .schedule-item:hover {
          background: rgba(3, 233, 244, 0.1);
        }
        .schedule-time {
          min-width: 60px;
          color: #03e9f4;
          font-weight: bold;
          font-size: 0.9rem;
        }
        .schedule-content {
          flex: 1;
        }
        .activity-name, .meal-name {
          color: #fff;
          margin: 0 0 5px 0;
          font-size: 1rem;
          font-weight: 600;
        }
        .meal-name {
          color: #f4d03f;
        }
        .activity-description, .meal-description {
          color: #a0aec0;
          margin: 0 0 5px 0;
          font-size: 0.9rem;
          line-height: 1.4;
        }
        .price-tag {
          background: #27ae60;
          color: white;
          padding: 2px 8px;
          border-radius: 12px;
          font-size: 0.8rem;
          font-weight: bold;
        }
        .leaflet-popup-content-wrapper {
          background: #ffffff;
          border-radius: 8px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        }
        .leaflet-popup-tip {
          background: #ffffff;
        }
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>

      <header className="flex items-center justify-between p-6 shadow-md">
        <Brand compact={false} />
        <div>{loading && <Loader size={36} />}</div>
      </header>

      <div className="min-h-screen bg-dark">
        <div className="container">
          {error && <div className="error">{error}</div>}
          <div className="grid">
            <div className="space-y-8">
              <TripForm onSubmit={handleTripSubmit} disabled={loading} />
              {loading && (
                <div className="text-center py-4">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500 mx-auto"></div>
                  <p className="mt-2 text-gray-400">Generating your perfect itinerary...</p>
                </div>
              )}
              <ItineraryDisplay
                itinerary={itinerary}
                tripData={tripData}
                onItineraryUpdate={handleItineraryUpdate}
                setHighlighted={setHighlighted}
              />
            </div>
            <div className="map-container-wrapper">
              <TripMap points={mapPoints} />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

async function generateItinerary(formData) {
  const systemPrompt = `
You are an expert travel itinerary planner. Generate a daily itinerary based on the user's trip details. Include 2-4 activities and 2-3 meals per day, with approximate times (e.g., "09:00 AM"), descriptions, estimated prices per person in USD, and geographic coordinates as [latitude, longitude] for each location (e.g., Bangalore: [12.97, 77.59]). Ensure coordinates are numeric, non-null, valid (latitude -90 to 90, longitude -180 to 180), and every day has at least one activity and one meal.

Return JSON only:
{
  "itinerary": {
    "days": [
      {
        "date": "YYYY-MM-DD",
        "activities": [
          {
            "name": "string",
            "description": "string",
            "time": "string",
            "price": number,
            "coordinates": [number, number]
          }
        ],
        "meals": [
          {
            "name": "string",
            "type": "Breakfast/Lunch/Dinner",
            "description": "string",
            "time": "string",
            "price": number,
            "coordinates": [number, number]
          }
        ]
      }
    ]
  },
  "locations": [
    {
      "name": "string",
      "coordinates": [number, number]
    }
  ]
}
Populate 'locations' with unique locations from activities and meals, using the same coordinates. Use city coordinates if specific ones are unavailable.
  `;

  const userPrompt = `
Destination: ${formData.destination}
Start Date: ${formData.startDate}
End Date: ${formData.endDate}
Budget: ${formData.budget} USD for ${formData.numberOfPeople} people
Interests: ${formData.interests}
Additional Notes: ${formData.additionalNotes}
  `;

  try {
    const apiResponse = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${formData.groqApiKey}`,
      },
      body: JSON.stringify({
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        model: 'llama-3.1-8b-instant',
        temperature: 0.7,
        max_tokens: 4096,
        stream: false,
        response_format: { type: "json_object" }
      }),
    });

    if (!apiResponse.ok) {
      const errorData = await apiResponse.json();
      console.error('API error:', errorData);
      throw new Error(errorData.error?.message || 'API request failed');
    }

    const data = await apiResponse.json();
    const generatedContent = data.choices[0].message.content;
    console.log('Raw API response:', generatedContent);

    // Try to parse directly as JSON first (since we're using json_object format)
    try {
      const parsedResult = JSON.parse(generatedContent);
      if (!parsedResult.itinerary || !Array.isArray(parsedResult.itinerary.days)) {
        throw new Error('Invalid itinerary structure: missing itinerary.days array');
      }
      console.log('Parsed JSON:', parsedResult);
      return {
        itinerary: parsedResult.itinerary,
        locations: parsedResult.locations || [],
      };
    } catch (e) {
      console.error('JSON parsing error:', e.message, 'Raw content:', generatedContent);
      const fallbackItinerary = {
        days: [
          {
            date: formData.startDate,
            activities: [
              {
                name: `${formData.destination} City Center`,
                description: `Explore the main area of ${formData.destination}`,
                time: '09:00 AM',
                price: 0,
                coordinates: formData.destination.toLowerCase().includes('bang') ? [12.97, 77.59] : [0, 0],
              },
            ],
            meals: [
              {
                name: 'Local Restaurant',
                type: 'Lunch',
                description: `Enjoy local cuisine in ${formData.destination}`,
                time: '12:00 PM',
                price: 10,
                coordinates: formData.destination.toLowerCase().includes('bang') ? [12.97, 77.59] : [0, 0],
              },
            ],
          },
        ],
      };
      return { itinerary: fallbackItinerary, locations: [] };
    }
  } catch (e) {
    console.error('Fetch error:', e);
    throw e;
  }
}

export default App;
