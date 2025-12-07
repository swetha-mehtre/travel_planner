import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet-routing-machine/dist/leaflet-routing-machine.css';
import 'leaflet-routing-machine';

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

  return (
    <div className="map-wrapper-relative" style={{ position: 'relative', height: '100%' }}>
      {validPoints.length === 0 && (
        <div
          className="map-overlay"
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            zIndex: 500,
            padding: '0.75rem',
            textAlign: 'center',
            pointerEvents: 'none',
            color: '#475569',
          }}
        >
          No points yet — enter a trip to plot the map.
        </div>
      )}
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
        {(validPoints.length === 0
          ? [{ name: 'Default View', description: 'Enter your trip to see routes', coordinates: { lat: center.lat, lng: center.lng } }]
          : validPoints
        ).map((point, index) => (
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
    </div>
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
        <div className="budget-section">
          <div className="budget-input-group">
            <div className="trip-box">
              <input type="number" name="budget" required disabled={disabled} />
              <label>Budget Amount</label>
            </div>
          </div>
          <div className="currency-group">
            <label className="currency-label">Currency Type</label>
            <select name="currency" disabled={disabled} className="currency-select">
              <option value="USD">USD - US Dollar ($)</option>
              <option value="EUR">EUR - Euro (€)</option>
              <option value="GBP">GBP - British Pound (£)</option>
              <option value="INR">INR - Indian Rupee (₹)</option>
              <option value="JPY">JPY - Japanese Yen (¥)</option>
              <option value="AUD">AUD - Australian Dollar (A$)</option>
              <option value="CAD">CAD - Canadian Dollar (C$)</option>
              <option value="CHF">CHF - Swiss Franc (CHF)</option>
              <option value="CNY">CNY - Chinese Yuan (¥)</option>
              <option value="SEK">SEK - Swedish Krona (kr)</option>
              <option value="NZD">NZD - New Zealand Dollar (NZ$)</option>
              <option value="MXN">MXN - Mexican Peso (Mex$)</option>
              <option value="SGD">SGD - Singapore Dollar (S$)</option>
              <option value="HKD">HKD - Hong Kong Dollar (HK$)</option>
              <option value="NOK">NOK - Norwegian Krone (kr)</option>
              <option value="KRW">KRW - South Korean Won (₩)</option>
              <option value="TRY">TRY - Turkish Lira (₺)</option>
              <option value="BRL">BRL - Brazilian Real (R$)</option>
              <option value="ZAR">ZAR - South African Rand (R)</option>
              <option value="AED">AED - UAE Dirham (د.إ)</option>
            </select>
          </div>
          <div className="trip-box">
            <input type="number" name="numberOfPeople" min="1" required disabled={disabled} />
            <label>Number of People</label>
          </div>
        </div>
        <div className="interests-section">
          <label className="interests-label">Trip Interests</label>
          <div className="interests-grid">
            <div className="interest-category">
              <div className="category-title">🏛️ Cultural & Historical</div>
              <label className="interest-checkbox"><input type="checkbox" name="interests" value="landmarks" disabled={disabled} /> Landmarks & Monuments</label>
              <label className="interest-checkbox"><input type="checkbox" name="interests" value="museums" disabled={disabled} /> Museums & Heritage</label>
              <label className="interest-checkbox"><input type="checkbox" name="interests" value="traditions" disabled={disabled} /> Local Traditions</label>
            </div>
            <div className="interest-category">
              <div className="category-title">🍲 Food & Culinary</div>
              <label className="interest-checkbox"><input type="checkbox" name="interests" value="street_food" disabled={disabled} /> Street Food</label>
              <label className="interest-checkbox"><input type="checkbox" name="interests" value="fine_dining" disabled={disabled} /> Fine Dining</label>
              <label className="interest-checkbox"><input type="checkbox" name="interests" value="cooking_classes" disabled={disabled} /> Cooking Classes</label>
              <label className="interest-checkbox"><input type="checkbox" name="interests" value="wine_tasting" disabled={disabled} /> Wine & Tasting</label>
            </div>
            <div className="interest-category">
              <div className="category-title">🏞️ Adventure & Outdoors</div>
              <label className="interest-checkbox"><input type="checkbox" name="interests" value="hiking" disabled={disabled} /> Hiking & Trekking</label>
              <label className="interest-checkbox"><input type="checkbox" name="interests" value="water_sports" disabled={disabled} /> Water Sports</label>
              <label className="interest-checkbox"><input type="checkbox" name="interests" value="wildlife" disabled={disabled} /> Wildlife & Safari</label>
              <label className="interest-checkbox"><input type="checkbox" name="interests" value="camping" disabled={disabled} /> Camping</label>
            </div>
            <div className="interest-category">
              <div className="category-title">🎨 Creative & Growth</div>
              <label className="interest-checkbox"><input type="checkbox" name="interests" value="photography" disabled={disabled} /> Photography</label>
              <label className="interest-checkbox"><input type="checkbox" name="interests" value="art" disabled={disabled} /> Sketching & Art</label>
              <label className="interest-checkbox"><input type="checkbox" name="interests" value="journaling" disabled={disabled} /> Writing & Journaling</label>
            </div>
            <div className="interest-category">
              <div className="category-title">🛍️ Leisure & Lifestyle</div>
              <label className="interest-checkbox"><input type="checkbox" name="interests" value="shopping" disabled={disabled} /> Shopping</label>
              <label className="interest-checkbox"><input type="checkbox" name="interests" value="wellness" disabled={disabled} /> Spa & Wellness</label>
              <label className="interest-checkbox"><input type="checkbox" name="interests" value="nightlife" disabled={disabled} /> Nightlife & Events</label>
            </div>
            <div className="interest-category">
              <div className="category-title">🚗 Social & Eco</div>
              <label className="interest-checkbox"><input type="checkbox" name="interests" value="road_trips" disabled={disabled} /> Scenic Road Trips</label>
              <label className="interest-checkbox"><input type="checkbox" name="interests" value="eco_tourism" disabled={disabled} /> Eco-Tourism</label>
              <label className="interest-checkbox"><input type="checkbox" name="interests" value="volunteering" disabled={disabled} /> Volunteering</label>
            </div>
          </div>
        </div>
        <div className="extras-section">
          <label className="extras-label">Extra Wishes</label>
          <textarea
            name="extraWishes"
            disabled={disabled}
            placeholder="Any special requests, accessibility needs, food preferences, or vibes you want?"
            className="extras-textarea"
            rows="3"
          />
          <div className="famous-places">
            <label className="extras-label">Famous Places Preference</label>
            <select name="famousPreference" disabled={disabled} className="famous-select">
              <option value="city_highlights">Top city highlights</option>
              <option value="nearby_day_trips">Nearby day trips & must-sees</option>
              <option value="both">Both city highlights and nearby gems</option>
              <option value="hidden_gems">Hidden gems over tourist spots</option>
            </select>
          </div>
        </div>
        <div className="api-provider-section">
          <label className="api-provider-label">🤖 Choose AI Provider</label>
          <div className="api-provider-options">
            <label className="api-option">
              <input type="radio" name="apiProvider" value="groq" defaultChecked disabled={disabled} />
              <div className="option-content">
                <div className="option-title">⚡ Groq</div>
                <div className="option-desc">Free & Lightning Fast</div>
              </div>
            </label>
            <label className="api-option">
              <input type="radio" name="apiProvider" value="gemini" disabled={disabled} />
              <div className="option-content">
                <div className="option-title">✨ Google Gemini</div>
                <div className="option-desc">Powerful & Advanced</div>
              </div>
            </label>
          </div>
        </div>
        <div className="api-keys-section">
          <div className="api-key-group">
            <label className="api-key-label">⚡ Groq API Key</label>
            <input 
              type="text" 
              name="groqApiKey" 
              disabled={disabled}
              defaultValue={process.env.REACT_APP_GROQ_API_KEY || ''}
              placeholder={process.env.REACT_APP_GROQ_API_KEY ? '✓ Using API key from .env' : 'Paste your Groq API key'}
              className="api-key-input"
            />
            <a href="https://console.groq.com/keys" target="_blank" rel="noopener noreferrer" className="api-help-link">
              Get Groq key →
            </a>
          </div>
          <div className="api-key-group">
            <label className="api-key-label">✨ Google Gemini API Key</label>
            <input 
              type="text" 
              name="geminiApiKey" 
              disabled={disabled}
              placeholder="Paste your Google Gemini API key"
              className="api-key-input"
            />
            <a href="https://ai.google.dev/tutorials/setup" target="_blank" rel="noopener noreferrer" className="api-help-link">
              Get Gemini key →
            </a>
          </div>
        </div>
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
        src={process.env.PUBLIC_URL + '/camera-logo.png'}
        alt="Musafir Not Bhatak Logo"
        className="brand-logo"
        onError={(e) => { e.target.style.display = 'none'; }}
      />
      {!compact && (
        <div className="brand-text">
          <span className="brand-title" style={{fontFamily: "'Playfair Display', serif", fontSize: '32px', fontWeight: '900', fontStyle: 'italic', letterSpacing: '1px', background: 'linear-gradient(135deg, #7c3aed 0%, #06b6d4 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text', textShadow: '2px 2px 4px rgba(124, 58, 237, 0.1)', transform: 'skewX(-5deg)'}}>Musafir Not Bhatak</span>
        </div>
      )}
    </div>
  );
}

function ItineraryDisplay({ itinerary, tripData, onItineraryUpdate, setHighlighted }) {
  if (!itinerary || itinerary.days.length === 0) return null;

  const currencySymbols = {
    USD: '$',
    EUR: '€',
    GBP: '£',
    INR: '₹',
    JPY: '¥',
    AUD: 'A$',
    CAD: 'C$',
    CHF: 'CHF',
    CNY: '¥',
    SEK: 'kr',
    NZD: 'NZ$',
    MXN: 'Mex$',
    SGD: 'S$',
    HKD: 'HK$',
    NOK: 'kr',
    KRW: '₩',
    TRY: '₺',
    BRL: 'R$',
    ZAR: 'R',
    AED: 'د.إ',
  };

  const currencySymbol = currencySymbols[tripData?.currency] || '$';

  return (
    <div className="itinerary-display">
      <div className="itinerary-header">
        <h3>{tripData?.destination || 'Your'} Trip Itinerary</h3>
        <p className="itinerary-dates">
          {tripData?.startDate} - {tripData?.endDate}
        </p>
        <p className="itinerary-budget">Budget: {currencySymbol}{tripData?.budget || 0} for {tripData?.numberOfPeople || 1} people</p>
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
                  {activity.price && <span className="price-tag">{currencySymbol}{activity.price}</span>}
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
                  {meal.price && <span className="price-tag">{currencySymbol}{meal.price}</span>}
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
  const [currency, setCurrency] = useState('USD');

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
    const currency = e.target.currency.value;
    const budgetAmount = parseFloat(e.target.budget.value);
    const apiProvider = e.target.apiProvider?.value || 'groq';
    const extraWishes = (e.target.extraWishes?.value || '').trim();
    const famousPreference = e.target.famousPreference?.value || 'city_highlights';
    
    // Convert to standard format for API (we'll use original amount but track currency)
    const selectedInterests = Array.from(e.target.querySelectorAll('input[name="interests"]:checked'))
      .map(checkbox => checkbox.value)
      .join(', ');
    
    const formData = {
      destination: e.target.destination.value,
      startDate: e.target.startDate.value,
      endDate: e.target.endDate.value,
      budget: budgetAmount,
      currency: currency,
      numberOfPeople: e.target.numberOfPeople.value,
      interests: selectedInterests || 'general travel',
      groqApiKey: e.target.groqApiKey.value || process.env.REACT_APP_GROQ_API_KEY,
      geminiApiKey: e.target.geminiApiKey.value || '',
      apiProvider,
      extraWishes,
      famousPreference,
      additionalNotes: `${extraWishes ? `Extra wishes: ${extraWishes}. ` : ''}Famous places preference: ${famousPreference}.`,
    };
    setLoading(true);
    setError(null);
    setHighlighted(null);
    try {
      setTripData(formData);
      setCurrency(formData.currency);
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
        body {
          height: 100%;
          margin: 0;
          padding: 0;
          background-image: url('${process.env.PUBLIC_URL}/travel-bg.svg');
          background-size: 800px 800px;
          background-repeat: repeat;
          background-attachment: fixed;
          background-color: #F5F0E8;
          color: #2d3748;
          font-family: 'Poppins', 'Segoe UI', sans-serif;
          position: relative;
        }
        body::before {
          content: '';
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: linear-gradient(135deg, rgba(255, 255, 255, 0.75) 0%, rgba(245, 240, 232, 0.80) 100%);
          pointer-events: none;
          z-index: -1;
        }
        header {
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 1.5rem 2rem;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
          background: #ffffff;
          border-bottom: 2px solid #f0f0f0;
          position: relative;
          overflow: hidden;
        }
        header > * {
          position: relative;
          z-index: 1;
        }
        .container {
          max-width: 100%;
          margin: 0;
          padding: 2rem;
        }
        .min-h-screen {
          min-height: 100vh;
        }
        .bg-dark {
          background-color: transparent;
        }
        .error {
          background: linear-gradient(135deg, #fee2e2 0%, #fecaca 100%);
          border: 2px solid #fca5a5;
          color: #991b1b;
          padding: 1rem;
          border-radius: 0.75rem;
          margin-bottom: 1rem;
          font-weight: 600;
        }
        .grid {
          display: grid;
          grid-template-columns: 1fr 2fr;
          grid-template-rows: 1fr;
          gap: 2rem;
          height: calc(100vh - 100px);
          margin-bottom: 0;
        }
        @media (max-width: 1024px) {
          .grid {
            grid-template-columns: 1fr;
            grid-template-rows: auto 1fr;
            height: auto;
          }
        }
        .map-container-wrapper {
          height: 100%;
          width: 100%;
          border-radius: 1.5rem;
          box-shadow: 0 15px 40px rgba(74, 144, 226, 0.25);
          overflow: hidden;
          background: #ffffff;
          border: 3px solid #4A90E2;
          grid-column: 2;
          grid-row: 1;
          position: relative;
          background: linear-gradient(135deg, #ffffff 0%, #f0f8ff 100%);
        }
        .map-container-wrapper::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: linear-gradient(135deg, rgba(74, 144, 226, 0.05) 0%, rgba(80, 227, 194, 0.05) 100%);
          pointer-events: none;
        }
        @media (max-width: 1024px) {
          .map-container-wrapper {
            grid-column: 1;
            grid-row: 2;
            height: 60vh;
            min-height: 420px;
          }
        }
        .form-wrapper {
          grid-column: 1;
          grid-row: 1;
          overflow-y: auto;
          max-height: 100%;
          background: #ffffff;
          position: relative;
          border-radius: 1.5rem;
          box-shadow: 0 15px 40px rgba(245, 166, 35, 0.25);
          border: 3px solid #F5A623;
        }
        .form-wrapper::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: transparent;
          pointer-events: none;
          border-radius: 1.5rem;
        }
        .form-wrapper > * {
          position: relative;
          z-index: 1;
          padding: 1.5rem;
        }
        @media (max-width: 1024px) {
          .form-wrapper {
            grid-column: 1;
            grid-row: 1;
          }
        }
        .itinerary-section {
          padding: 2rem 0;
          width: 100%;
          margin-top: 1rem;
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
          font-size: 1.8rem;
          font-weight: 900;
          line-height: 1;
          background: linear-gradient(135deg, #7c3aed 0%, #06b6d4 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        .brand-subtitle {
          font-size: 1rem;
          color: #06b6d4;
          line-height: 1;
          font-weight: 600;
        }
        .login-box {
          background: linear-gradient(135deg, #ffffff 0%, #f8faff 100%);
          padding: 2.5rem;
          border: 2px solid #e0e7ff;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
          border-radius: 1.5rem;
          overflow-y: auto;
          max-height: 100%;
          width: 100%;
          box-sizing: border-box;
          display: flex;
          flex-direction: column;
          font-family: 'Poppins', sans-serif;
        }
        .login-box h2 {
          margin: 0 0 2rem 0;
          padding: 0;
          background: linear-gradient(135deg, #7c3aed 0%, #06b6d4 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          text-align: left;
          font-size: 2.2rem;
          font-weight: 800;
          font-family: 'Poppins', sans-serif;
        }
        .form-title {
          margin: 0 0 2rem 0;
          padding: 1.5rem 0;
          background: linear-gradient(135deg, #F5A623 0%, #4A90E2 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          text-align: center;
          font-size: 2.8rem;
          font-weight: 950;
          font-family: 'Poppins', sans-serif;
          letter-spacing: 1.5px;
          text-transform: uppercase;
          filter: drop-shadow(0 2px 4px rgba(245, 166, 35, 0.3));
        }
        .trip-box {
          position: relative;
          margin-bottom: 1.25rem;
          padding: 1rem;
          background: linear-gradient(135deg, rgba(74, 144, 226, 0.08) 0%, rgba(80, 227, 194, 0.08) 100%);
          border-radius: 0.75rem;
          border-left: 4px solid #F5A623;
        }
        .trip-box input {
          width: 100%;
          padding: 0.75rem 0;
          font-size: 1.15rem;
          color: #1a202c;
          margin-bottom: 1.75rem;
          border: none;
          border-bottom: 2px solid #cbd5e0;
          outline: none;
          background: transparent;
          transition: border-color 0.3s;
          font-weight: 500;
        }
        .trip-box input:disabled {
          background: transparent;
          color: #a0aec0;
          border-bottom-color: #e2e8f0;
        }
        .trip-box input:focus {
          border-bottom-color: #0ea5e9;
        }
        .trip-box label {
          position: absolute;
          top: 0;
          left: 0;
          padding: 0.75rem 0;
          font-size: 1.05rem;
          color: #64748b;
          pointer-events: none;
          transition: .3s;
          font-weight: 700;
          font-family: 'Poppins', sans-serif;
        }
        .trip-box input:focus ~ label,
        .trip-box input:valid ~ label {
          top: -1.5rem;
          left: 0;
          color: #0ea5e9;
          font-size: 0.8rem;
          font-weight: 700;
        }
        .date-pair, .budget-pair {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
          gap: 1.5rem;
          margin-bottom: 0;
        }
        .date-pair .trip-box, .budget-pair .trip-box {
          width: 100%;
          margin-bottom: 0;
        }
        .trip-box input[type="date"] {
          text-align: left;
        }
        .trip-box input[type="date"]::-webkit-calendar-picker-indicator {
          filter: none;
          cursor: pointer;
        }
        .budget-section {
          display: flex;
          flex-direction: column;
          gap: 2rem;
          margin-bottom: 1rem;
        }
        .budget-input-group {
          width: 100%;
        }
        .currency-group {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }
        .currency-label {
          font-size: 1rem;
          font-weight: 700;
          color: #7c3aed;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        .currency-select {
          width: 100%;
          padding: 1rem;
          font-size: 1rem;
          color: #1a202c;
          background: linear-gradient(135deg, #f8faff 0%, #f0f4ff 100%);
          border: 2px solid #e0e7ff;
          border-radius: 0.75rem;
          outline: none;
          transition: all 0.3s;
          cursor: pointer;
          font-weight: 600;
        }
        .currency-select:hover {
          border-color: #7c3aed;
          box-shadow: 0 4px 12px rgba(124, 58, 237, 0.1);
        }
        .currency-select:focus {
          border-color: #7c3aed;
          box-shadow: 0 6px 16px rgba(124, 58, 237, 0.2);
        }
        .currency-select option {
          background: #ffffff;
          color: #1a202c;
          padding: 0.75rem;
          font-weight: 500;
        }
        .api-note {
          display: block;
          margin-top: 1rem;
          font-size: 0.8rem;
          color: #64748b;
        }
        .api-link {
          color: #0ea5e9;
          text-decoration: underline;
          margin-right: 0.5rem;
          font-weight: 600;
        }
        .api-info {
          font-size: 0.8rem;
          color: #64748b;
        }
        .interests-section {
          margin-bottom: 1.5rem;
          padding: 1.5rem;
          background: linear-gradient(135deg, rgba(80, 227, 194, 0.12) 0%, rgba(74, 144, 226, 0.12) 100%);
          border-radius: 1rem;
          border: 3px solid #50E3C2;
          position: relative;
          box-shadow: 0 10px 25px rgba(80, 227, 194, 0.2);
        }
        .interests-section::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: linear-gradient(135deg, rgba(80, 227, 194, 0.15) 0%, rgba(74, 144, 226, 0.10) 100%);
          pointer-events: none;
          border-radius: 1rem;
        }
        .interests-section > * {
          position: relative;
          z-index: 1;
        }
        .api-provider-section {
          margin-bottom: 2rem;
          padding: 1.5rem;
          background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
          border-radius: 0.875rem;
          border: 2px solid #fcd34d;
          box-shadow: 0 4px 12px rgba(251, 191, 36, 0.2);
        }
        .api-provider-label {
          font-size: 0.9rem;
          font-weight: 800;
          color: #92400e;
          text-transform: uppercase;
          letter-spacing: 0.8px;
          display: block;
          margin-bottom: 1rem;
          font-family: 'Poppins', sans-serif;
        }
        .api-provider-options {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
          gap: 1rem;
          align-items: stretch;
        }
        .api-option {
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          gap: 0.65rem;
          padding: 1.4rem;
          background: #fffef9;
          border: 2px solid #fcd34d;
          border-radius: 0.9rem;
          cursor: pointer;
          transition: all 0.3s ease;
          font-family: 'Poppins', sans-serif;
          min-height: 140px;
          text-align: center;
        }
        .api-option:hover {
          background: #fff4d7;
          border-color: #f59e0b;
          box-shadow: 0 4px 12px rgba(245, 158, 11, 0.2);
          transform: translateY(-3px) scale(1.01);
        }
        .api-option input[type="radio"] {
          width: 22px;
          height: 22px;
          cursor: pointer;
          accent-color: #d97706;
          flex-shrink: 0;
          margin: 0;
        }
        .option-content {
          display: flex;
          flex-direction: column;
          gap: 0.1rem;
        }
        .option-title {
          font-size: 1.05rem;
          font-weight: 800;
          color: #1f2937;
          font-family: 'Poppins', sans-serif;
        }
        .option-desc {
          font-size: 0.9rem;
          color: #b45309;
          font-weight: 600;
          font-family: 'Poppins', sans-serif;
        }
        .extras-section {
          margin-bottom: 1.75rem;
          padding: 1.5rem;
          background: linear-gradient(135deg, #f8faff 0%, #eef2ff 100%);
          border-radius: 0.875rem;
          border: 2px solid #e0e7ff;
        }
        .extras-label {
          font-size: 0.95rem;
          font-weight: 800;
          color: #1e3a8a;
          display: block;
          margin-bottom: 0.75rem;
          font-family: 'Poppins', sans-serif;
        }
        .extras-textarea {
          width: 100%;
          padding: 0.9rem 1rem;
          font-size: 0.95rem;
          color: #1f2937;
          border: 2px solid #F5A623;
          border-radius: 0.75rem;
          background: linear-gradient(135deg, rgba(74, 144, 226, 0.08) 0%, rgba(80, 227, 194, 0.08) 100%);
          outline: none;
          resize: vertical;
          min-height: 96px;
          box-sizing: border-box;
          font-family: 'Poppins', sans-serif;
          transition: all 0.3s ease;
        }
        .extras-textarea:focus {
          border-color: #F5A623;
          box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.15);
        }
        .famous-places {
          margin-top: 1rem;
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }
        .famous-select {
          width: 100%;
          padding: 0.85rem 1rem;
          font-size: 0.95rem;
          border: 2px solid #cbd5e1;
          border-radius: 0.75rem;
          background: linear-gradient(135deg, rgba(74, 144, 226, 0.08) 0%, rgba(80, 227, 194, 0.08) 100%);
          color: #1f2937;
          outline: none;
          font-family: 'Poppins', sans-serif;
          transition: all 0.3s ease;
        }
        .famous-select:focus {
          border-color: #F5A623;
          box-shadow: 0 0 0 3px rgba(245, 166, 35, 0.15);
        }
        .api-keys-section {
          margin-bottom: 2rem;
          padding: 1.5rem;
          background: linear-gradient(135deg, rgba(74, 144, 226, 0.08) 0%, rgba(80, 227, 194, 0.08) 100%);
          border-radius: 0.875rem;
          border: 2px solid #F5A623;
          box-shadow: 0 4px 12px rgba(245, 166, 35, 0.1);
        }
        .api-keys-section h4 {
          margin: 0 0 1rem 0;
          font-size: 1.1rem;
          font-weight: 700;
          color: #1a202c;
        }
        .interests-label {
          font-size: 1.6rem;
          font-weight: 950;
          color: #000000;
          text-transform: uppercase;
          letter-spacing: 2.5px;
          display: block;
          margin-bottom: 1.5rem;
          text-align: center;
          filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.15));
        }
        .interests-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
          gap: 1.5rem;
        }
        .interest-category {
          background: linear-gradient(135deg, rgba(245, 166, 35, 0.12) 0%, rgba(80, 227, 194, 0.12) 100%);
          border-radius: 0.75rem;
          padding: 1.25rem;
          border: 2px solid #F5A623;
          box-shadow: 0 4px 12px rgba(245, 166, 35, 0.1);
          transition: all 0.3s ease;
        }
        .interest-category:hover {
          background: linear-gradient(135deg, rgba(245, 166, 35, 0.18) 0%, rgba(80, 227, 194, 0.18) 100%);
          transform: translateY(-2px);
          box-shadow: 0 6px 16px rgba(245, 166, 35, 0.15);
        }
        .category-title {
          font-size: 0.95rem;
          font-weight: 800;
          color: #1a202c;
          margin-bottom: 1rem;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }
        .interest-checkbox {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          font-size: 1rem;
          color: #1a202c;
          margin-bottom: 0.75rem;
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55);
          padding: 0.5rem 0.75rem;
          border-radius: 0.5rem;
          font-weight: 500;
        }
        .interest-checkbox:hover {
          background: rgba(74, 144, 226, 0.15);
          color: #4A90E2;
          transform: translateX(5px);
          box-shadow: 0 4px 12px rgba(74, 144, 226, 0.2);
        }
        .interest-checkbox:last-child {
          margin-bottom: 0;
        }
        .interest-checkbox input[type="checkbox"] {
          width: 18px;
          height: 18px;
          cursor: pointer;
          accent-color: #7c3aed;
        }
        .submit-button {
          position: relative;
          display: inline-block;
          width: 100%;
          padding: 1rem 1.5rem;
          color: #fff;
          font-size: 1.2rem;
          font-weight: 700;
          text-decoration: none;
          text-transform: uppercase;
          overflow: hidden;
          transition: all 0.4s cubic-bezier(0.68, -0.55, 0.265, 1.55);
          margin-top: 1.5rem;
          letter-spacing: 2px;
          background: linear-gradient(135deg, #4A90E2 0%, #50E3C2 100%);
          border: none;
          cursor: pointer;
          border-radius: 50px;
          box-shadow: 0 8px 25px rgba(74, 144, 226, 0.4);
          animation: popIn 0.6s ease-out;
        }
        @keyframes popIn {
          0% {
            transform: scale(0.8) translateY(10px);
            opacity: 0;
          }
          100% {
            transform: scale(1) translateY(0);
            opacity: 1;
          }
        }
        .submit-button:hover:not(:disabled) {
          transform: scale(1.05) translateY(-4px);
          background: linear-gradient(135deg, #F5A623 0%, #4A90E2 100%);
          box-shadow: 0 12px 35px rgba(245, 166, 35, 0.5);
        }
        .submit-button:active:not(:disabled) {
          transform: scale(0.98) translateY(-2px);
        }
        .submit-button:disabled {
          opacity: 0.6;
          cursor: not-allowed;
          transform: scale(1);
        }
        .loader {
          border-radius: 50%;
        }
        .itinerary-display {
          background: #ffffff;
          border-radius: 1.25rem;
          padding: 2.5rem;
          border: 2px solid #e0e7ff;
          box-shadow: 0 4px 15px rgba(0, 0, 0, 0.08);
          margin-top: 0;
          max-height: 100%;
          overflow-y: auto;
          display: flex;
          flex-direction: column;
        }
        .itinerary-header {
          text-align: left;
          margin-bottom: 1.25rem;
          padding-bottom: 1rem;
          border-bottom: 2px solid #e0e7ff;
        }
        .itinerary-header h3 {
          background: linear-gradient(135deg, #7c3aed 0%, #06b6d4 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          margin: 0 0 0.75rem 0;
          font-size: 2.2rem;
          font-weight: 800;
        }
        .itinerary-dates, .itinerary-budget {
          color: #64748b;
          margin: 0 0 0.25rem 0;
          font-size: 1rem;
          font-weight: 500;
        }
        .itinerary-day {
          margin-bottom: 2rem;
          padding-bottom: 1.5rem;
          border-bottom: 1px solid #e0e7ff;
        }
        .itinerary-day:last-child {
          border-bottom: none;
          margin-bottom: 0;
        }
        .day-title {
          color: #7c3aed;
          margin: 0 0 1.25rem 0;
          font-size: 1.5rem;
          font-weight: 800;
        }
        .day-schedule {
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
        }
        .schedule-item {
          display: flex;
          align-items: flex-start;
          gap: 1.25rem;
          padding: 1.5rem;
          background: linear-gradient(135deg, #f0f4ff 0%, #f5faff 100%);
          border-radius: 0.75rem;
          border-left: 5px solid #7c3aed;
          cursor: pointer;
          transition: all 0.3s;
        }
        .schedule-item:hover {
          background: linear-gradient(135deg, #e9ecff 0%, #f0f6ff 100%);
          box-shadow: 0 8px 20px rgba(124, 58, 237, 0.15);
          transform: translateX(4px);
        }
        .schedule-time {
          min-width: 80px;
          color: #06b6d4;
          font-weight: 800;
          font-size: 1.1rem;
        }
        .schedule-content {
          flex: 1;
        }
        .activity-name, .meal-name {
          color: #7c3aed;
          margin: 0 0 0.25rem 0;
          font-size: 1.1rem;
          font-weight: 800;
        }
        .meal-name {
          color: #f59e0b;
        }
        .activity-description, .meal-description {
          color: #64748b;
          margin: 0 0 0.25rem 0;
          font-size: 1rem;
          line-height: 1.5;
        }
        .price-tag {
          background: linear-gradient(135deg, #10b981 0%, #059669 100%);
          color: white;
          padding: 0.4rem 0.8rem;
          border-radius: 0.5rem;
          font-size: 0.95rem;
          font-weight: 800;
        }
        .leaflet-popup-content-wrapper {
          background: #ffffff;
          border-radius: 0.5rem;
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
          border: 2px solid #e0e7ff;
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
            <div className="form-wrapper">
              <TripForm onSubmit={handleTripSubmit} disabled={loading} />
              {loading && (
                <div className="text-center py-4">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500 mx-auto"></div>
                  <p className="mt-2 text-gray-400">Generating your perfect itinerary...</p>
                </div>
              )}
            </div>
            <div className="map-container-wrapper">
              <TripMap points={mapPoints} />
            </div>
          </div>
          <div className="itinerary-section">
            <ItineraryDisplay
              itinerary={itinerary}
              tripData={tripData}
              onItineraryUpdate={handleItineraryUpdate}
              setHighlighted={setHighlighted}
            />
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
Famous Places Preference: ${formData.famousPreference}
Extra Wishes: ${formData.extraWishes || 'None'}
Additional Notes: ${formData.additionalNotes || 'None'}
  `;

  try {
    const apiProvider = formData.apiProvider || 'groq';
    let apiResponse;

    if (apiProvider === 'gemini') {
      // Google Gemini API
      const geminiKey = formData.geminiApiKey;
      if (!geminiKey) {
        throw new Error('Please provide a Google Gemini API key. Get one at https://ai.google.dev/tutorials/setup');
      }

      apiResponse = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${geminiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                { text: systemPrompt + '\n\n' + userPrompt }
              ]
            }
          ],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 4096,
          }
        }),
      });

      if (!apiResponse.ok) {
        const errorData = await apiResponse.json();
        console.error('Gemini API error:', errorData);
        throw new Error(errorData.error?.message || 'Gemini API request failed');
      }

      const data = await apiResponse.json();
      const generatedContent = data.candidates?.[0]?.content?.parts?.[0]?.text;

      if (!generatedContent) {
        throw new Error('No response from Gemini API');
      }

      console.log('Gemini response:', generatedContent);

      try {
        const parsedResult = JSON.parse(generatedContent);
        if (!parsedResult.itinerary || !Array.isArray(parsedResult.itinerary.days)) {
          throw new Error('Invalid itinerary structure from Gemini');
        }
        return {
          itinerary: parsedResult.itinerary,
          locations: parsedResult.locations || [],
        };
      } catch (parseError) {
        const jsonMatch = generatedContent.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const parsedResult = JSON.parse(jsonMatch[0]);
          if (!parsedResult.itinerary || !Array.isArray(parsedResult.itinerary.days)) {
            throw new Error('Invalid itinerary structure from Gemini');
          }
          return {
            itinerary: parsedResult.itinerary,
            locations: parsedResult.locations || [],
          };
        }
        throw new Error('Failed to parse Gemini response as JSON');
      }
    } else {
      // Groq API (default)
      const groqKey = formData.groqApiKey || process.env.REACT_APP_GROQ_API_KEY;
      if (!groqKey) {
        throw new Error('Please provide a Groq API key or set REACT_APP_GROQ_API_KEY in .env. Get one at https://console.groq.com/keys');
      }

      apiResponse = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${groqKey}`,
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
        console.error('Groq API error:', errorData);
        throw new Error(errorData.error?.message || 'Groq API request failed');
      }

      const data = await apiResponse.json();
      const generatedContent = data.choices[0].message.content;
      console.log('Groq response:', generatedContent);

      try {
        const parsedResult = JSON.parse(generatedContent);
        if (!parsedResult.itinerary || !Array.isArray(parsedResult.itinerary.days)) {
          throw new Error('Invalid itinerary structure from Groq');
        }
        return {
          itinerary: parsedResult.itinerary,
          locations: parsedResult.locations || [],
        };
      } catch (parseError) {
        const jsonMatch = generatedContent.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const parsedResult = JSON.parse(jsonMatch[0]);
          if (!parsedResult.itinerary || !Array.isArray(parsedResult.itinerary.days)) {
            throw new Error('Invalid itinerary structure from Groq');
          }
          return {
            itinerary: parsedResult.itinerary,
            locations: parsedResult.locations || [],
          };
        }
        throw new Error('Failed to parse Groq response as JSON');
      }
    }
  } catch (error) {
    console.error('Error generating itinerary:', error);
    throw error;
  }
}

export default App;
