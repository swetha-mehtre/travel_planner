# WanderMind

WanderMind is an AI-powered travel itinerary generator that transforms your trip planning experience into a seamless, personalized adventure. Whether you're chasing hidden gems or iconic landmarks, WanderMind crafts tailor-made itineraries based on your unique preferences.

## 🚀 Try It Now!

Visit [WanderMind](*) to plan your next adventure. You'll need a Groq API key to get started - get one for free at [Groq Console](https://console.groq.com/keys).

## ✨ Features

- Hyper-Personalized Planning
    - Customize your journey by selecting destination, travel dates, budget, group size, and interests—from food tours to nature hikes.

- Interactive Mapping
    - Explore your route with dynamic maps featuring location pins, optimized paths, and real-time navigation powered by OpenStreetMap.

- Smart Daily Schedules
    - Receive detailed day-by-day plans including activities, meal suggestions, rest periods, and local tips—adjustable on the fly.

- Conversational Customization 
    - Modify any part of your itinerary through an intuitive AI chat interface. Want to swap a museum visit for a beach day? Just ask.

- Transparent Cost Breakdown
    - Get clear estimates for accommodation, transport, meals, and activities—so you can travel smart without surprises.

- Real-Time Integration
    - Embedded links for bookings, directions, and reviews ensure your itinerary is not just a plan, but a launchpad.

## 🔑 API Setup

WanderMind leverages the Groq API to generate personalized travel itineraries.

To get started:
1. Go to the [Groq Console](https://console.groq.com/keys)
2. Sign up for an account
3. Generate a new API key
4. Enter the key in WanderMind to build your itinerary

Your API key is stored locally in your browser and is never sent to our servers. This ensures you have full control over your API usage and costs.

## 🛠️ Local Development Setup

1. Clone the repository:
```bash
git clone https://github.com/rixscx/WanderMind.git
cd WanderMind
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm start
```

The application will be available at `http://localhost:3000`

4. Create a .env file and add your API key using the env variable (No spaces):
```Text
GROQ_API_KEY=
```


## 💻 Technologies Used

- React
- Tailwind CSS
- Leaflet Maps
- Groq API (llama-3.1-8b-instant)
- OpenStreetMap
- date-fns
- shadcn/ui components

## 📝 Usage Notes

- Each itinerary generation requires one API call to Groq
- Monitor your API usage in your Groq console
- Free tier limits apply based on your Groq account
- Keep your API key secure and never share it

## 📧 Contact

- GitHub: [@rixscx](https://github.com/rixscx)
- Twitter: [@rixscx](https://x.com/rixscx)

---
<p align="center">
  Made with ☕️ by rixscx
</p>

<p align="center">
  <small>Location icons created by Freepik - Flaticon</small>
</p>
