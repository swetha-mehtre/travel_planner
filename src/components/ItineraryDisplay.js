import React from 'react';

const ScheduleItem = ({ item, type, index, dayIndex, highlightLocation }) => (
  <div className="schedule-item" key={`${type}-${dayIndex}-${index}`}>
    <div className="schedule-time">{item.time || 'TBD'}</div>
    <div className="schedule-content">
      <h5
        className={`${type}-name cursor-pointer hover:underline`}
        onClick={() => highlightLocation(item)}
      >
        {item.name} {type === 'meal' && `(${item.type})`}
      </h5>
      <p className={`${type}-description`}>{item.description}</p>
      {item.price && <span className="price-tag">${item.price}</span>}
    </div>
  </div>
);

const ItineraryDisplay = ({ itinerary, tripData, onItineraryUpdate, setHighlighted }) => {
  if (!itinerary?.days?.length) return null;

  const highlightLocation = (location) => {
    setHighlighted?.(location);
  };

  return (
    <div className="itinerary-display p-6 bg-white rounded-lg shadow-lg">
      <div className="itinerary-header mb-6">
        <h3 className="text-2xl font-semibold">
          {tripData?.destination || 'WanderMind'} Trip Itinerary
        </h3>
        <p className="itinerary-dates text-gray-600">
          {tripData?.startDate || 'N/A'} - {tripData?.endDate || 'N/A'}
        </p>
        <p className="itinerary-budget text-gray-600">
          Budget: ${tripData?.budget || 0} for {tripData?.numberOfPeople || 1} people
        </p>
      </div>

      {itinerary.days.map((day, dayIndex) => (
        <div key={dayIndex} className="itinerary-day mb-4">
          <h4 className="day-title text-xl font-medium mb-2">
            Day {dayIndex + 1}: {day.date}
          </h4>
          <div className="day-schedule space-y-2">
            {(day.activities || []).map((activity, index) => (
              <ScheduleItem
                item={activity}
                type="activity"
                index={index}
                dayIndex={dayIndex}
                highlightLocation={highlightLocation}
              />
            ))}
            {(day.meals || []).map((meal, index) => (
              <ScheduleItem
                item={meal}
                type="meal"
                index={index}
                dayIndex={dayIndex}
                highlightLocation={highlightLocation}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default ItineraryDisplay;