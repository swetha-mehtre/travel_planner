import { format, eachDayOfInterval, parseISO } from 'date-fns';

// Sample itinerary template for system prompt
const ITINERARY_TEMPLATE = {
  days: [{
    date: 'yyyy-MM-dd',
    activities: [{
      name: 'Sample Activity',
      time: '09:00',
      description: 'Activity description',
      cost: 50,
      coordinates: { lat: 0, lng: 0 },
      transport: {
        method: 'taxi',
        duration: '20 min',
        cost: 10
      }
    }],
    meals: [{
      type: 'breakfast',
      time: '08:00',
      name: 'Sample Restaurant',
      description: 'Restaurant description',
      cost: 20
    }],
    dailyTotal: 80
  }]
};

const makeGroqRequest = async (messages, apiKey, model = 'llama-3.1-8b-instant', temperature = 0.3) => {
  if (!apiKey) {
    throw new Error('Please provide a valid Groq API key');
  }

  try {
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model,
        messages,
        temperature,
        max_tokens: 4000,
        top_p: 1,
        response_format: { type: 'json_object' }
      })
    });

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error('Invalid API key. Please check your Groq API key.');
      }
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error?.message || 'Failed to get response from API');
    }

    const data = await response.json();
    return JSON.parse(data.choices[0].message.content);
  } catch (error) {
    throw error.message.includes('API key') ? error : new Error(`API request failed: ${error.message}`);
  }
};

const validateAndAdjustCosts = (itinerary, numPeople) => {
  let totalPerPerson = 0;
  let costBreakdown = { activities: 0, food: 0, transportation: 0 };

  const days = itinerary.days.map(day => {
    const activitiesCost = day.activities.reduce((sum, act) => sum + (act.cost || 0), 0);
    const mealsCost = day.meals.reduce((sum, meal) => sum + (meal.cost || 0), 0);
    const transportCost = day.activities.reduce((sum, act) => sum + (act.transport?.cost || 0), 0);

    costBreakdown.activities += activitiesCost;
    costBreakdown.food += mealsCost;
    costBreakdown.transportation += transportCost;

    return {
      ...day,
      dailyTotal: activitiesCost + mealsCost + transportCost
    };
  });

  totalPerPerson = days.reduce((sum, day) => sum + (day.dailyTotal || 0), 0);

  return {
    ...itinerary,
    days,
    costBreakdown,
    perPersonTotal: totalPerPerson,
    groupTotal: totalPerPerson * numPeople
  };
};

export const generateItinerary = async (tripData, config = { model: 'llama-3.1-8b-instant' }) => {
  const { apiKey, ...restTripData } = tripData;

  try {
    if (!tripData.destination || !tripData.dates?.start || !tripData.dates?.end || !tripData.budget) {
      throw new Error('Missing required trip data: destination, dates, and budget');
    }

    const dateRange = eachDayOfInterval({
      start: parseISO(restTripData.dates.start),
      end: parseISO(restTripData.dates.end)
    });

    if (!dateRange.length) {
      throw new Error('Invalid date range: select valid travel dates');
    }

    if (dateRange.length > 14) {
      throw new Error('Trip duration too long: maximum 14 days supported');
    }

    const formattedDates = dateRange.map(date => format(date, 'yyyy-MM-dd'));
    const budgetPerPerson = Math.floor(parseInt(restTripData.budget) / parseInt(restTripData.numPeople || 1));

    if (budgetPerPerson < 50) {
      throw new Error('Budget too low: minimum $50 per person per day required');
    }

    const systemPrompt = `
      You are a travel planning assistant for WanderMind. Generate a detailed itinerary in the following JSON format:

      ${JSON.stringify(ITINERARY_TEMPLATE, null, 2)}

      Requirements:
      1. Output a single, valid JSON object.
      2. Include 2-3 activities and 3 meals (breakfast, lunch, dinner) per day.
      3. Ensure costs are realistic for the destination.
      4. Provide exact coordinates for all locations (e.g., { lat: 12.97, lng: 77.59 } for Bangalore).
      5. Schedule activities between 08:00 and 22:00.
      6. Include transport details (method, duration, cost) for each activity.
      7. Stay within the provided budget per person.
      8. Avoid duplicate activities or restaurants.
      9. Generate itineraries for all provided dates.
    `;

    const userPrompt = `
      Create a ${formattedDates.length}-day itinerary for ${restTripData.destination}:
      - Budget per person: $${budgetPerPerson}
      - Dates: ${formattedDates.join(', ')}
      - Number of people: ${restTripData.numPeople}
      - Interests: ${restTripData.interests || 'general sightseeing'}
    `;

    const itinerary = await makeGroqRequest([
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt }
    ], apiKey, config.model);

    const validatedItinerary = validateAndAdjustCosts(itinerary, restTripData.numPeople);

    const locations = validatedItinerary.days.flatMap(day => [
      ...day.activities.map(activity => ({
        name: activity.name,
        coordinates: activity.coordinates ?? { lat: 0, lng: 0 },
        description: activity.description
      })),
      ...day.meals.map(meal => ({
        name: meal.name,
        coordinates: meal.coordinates ?? { lat: 0, lng: 0 },
        description: `${meal.type} - ${meal.description}`
      }))
    ]);

    return { itinerary: validatedItinerary, locations };
  } catch (error) {
    throw new Error(error.message.includes('API key') ? `API Key Error: ${error.message}` : `Failed to generate itinerary: ${error.message}`);
  }
};

export { makeGroqRequest, validateAndAdjustCosts };