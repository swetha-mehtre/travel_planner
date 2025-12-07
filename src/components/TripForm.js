import React, { useState } from 'react';

const TripForm = ({ onSubmit, disabled }) => {
  const [formData, setFormData] = useState({
    destination: '',
    dates: { start: '', end: '' },
    budget: '',
    numPeople: 1,
    interests: '',
    additionalNotes: ''
  });
  const [apiKey, setApiKey] = useState(localStorage.getItem('groq_api_key') || '');

  const handleInputChange = (key, value, nestedKey) => {
    if (nestedKey) {
      setFormData({
        ...formData,
        [key]: { ...formData[key], [nestedKey]: value }
      });
    } else {
      setFormData({ ...formData, [key]: value });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({ ...formData, apiKey });
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg">
      <h2 className="form-title">Plan Your WanderMind Trip</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Destination</label>
          <input
            type="text"
            value={formData.destination}
            onChange={(e) => handleInputChange('destination', e.target.value)}
            className="w-full p-2 border rounded-md"
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
            <input
              type="date"
              value={formData.dates.start}
              onChange={(e) => handleInputChange('dates', e.target.value, 'start')}
              className="w-full p-2 border rounded-md"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
            <input
              type="date"
              value={formData.dates.end}
              onChange={(e) => handleInputChange('dates', e.target.value, 'end')}
              className="w-full p-2 border rounded-md"
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Budget (USD)</label>
            <input
              type="number"
              value={formData.budget}
              onChange={(e) => handleInputChange('budget', e.target.value)}
              className="w-full p-2 border rounded-md"
              required
              min="0"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Number of People</label>
            <input
              type="number"
              value={formData.numPeople}
              onChange={(e) => handleInputChange('numPeople', parseInt(e.target.value))}
              className="w-full p-2 border rounded-md"
              required
              min="1"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Interests (comma-separated)</label>
          <input
            type="text"
            value={formData.interests}
            onChange={(e) => handleInputChange('interests', e.target.value)}
            className="w-full p-2 border rounded-md"
            placeholder="e.g., hiking, food, museums"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Additional Notes</label>
          <textarea
            value={formData.additionalNotes}
            onChange={(e) => handleInputChange('additionalNotes', e.target.value)}
            className="w-full p-2 border rounded-md"
            rows="3"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Groq API Key
            <span className="ml-1 text-xs text-blue-600">
              <a href="https://console.groq.com/keys" target="_blank" rel="noopener noreferrer">
                Get your key
              </a>
            </span>
          </label>
          <input
            type="password"
            value={apiKey}
            onChange={(e) => {
              const value = e.target.value;
              setApiKey(value);
              localStorage.setItem('groq_api_key', value);
            }}
            className="w-full p-2 border rounded-md"
            placeholder="gsk_..."
            required
          />
          <p className="mt-1 text-xs text-gray-500">
            Your API key is stored locally and never sent to our servers
          </p>
        </div>

        <button
          type="submit"
          disabled={disabled}
          className="w-full p-3 rounded-md transition-colors bg-blue-600 text-white hover:bg-blue-700 disabled:bg-blue-300 disabled:cursor-not-allowed"
        >
          {disabled ? 'Generating...' : 'Generate Itinerary'}
        </button>
      </form>
    </div>
  );
};

export default TripForm;