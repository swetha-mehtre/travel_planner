# 🌍 WanderMind - Musafir Not Bhatak

An AI-powered travel itinerary planner that transforms your trip planning experience into a seamless, personalized adventure. Discover destinations, plan trips, and create unforgettable journeys.

## ✨ Key Features

- 🗺️ **Interactive Map** - Visualize destinations on an interactive map with routing and directions
- 🤖 **AI-Powered Itineraries** - Generate detailed travel plans using Groq AI or Google Gemini
- 📍 **Multi-Stop Planning** - Plot multiple destinations and view optimal routes
- 🏷️ **Interest-Based Recommendations** - Filter by Landmarks, Food, Culture, Adventure, Shopping, and Nature
- 💰 **Budget Tracking** - Multi-currency support with cost breakdown
- 📋 **Customizable Plans** - Add notes, preferences, and special requests
- 🎯 **Smart Routing** - Automatic route calculation between destinations

## 🎨 Modern Design

- Clean, professional UI with vibrant color theme
- Responsive grid layout with adjustable panels
- Light gradient backgrounds for visual appeal
- Smooth animations and professional typography
- Manually adjustable form and map panels

## 🚀 Quick Start

### Prerequisites

- Node.js v14+
- npm or yarn

### Installation

```bash
# Clone repository
git clone https://github.com/swetha-mehtre/travel_planner.git
cd travel_planner

# Install dependencies
npm install

# Start development server
npm start
```

The app will open at `http://localhost:3000`

## 🔑 API Setup

1. Get your **Groq API key** from [console.groq.com](https://console.groq.com)
2. (Optional) Get **Google Gemini API key** from [Google AI Studio](https://aistudio.google.com)
3. Enter keys in the app settings

**Note**: API keys are stored locally in your browser and never sent to external servers.

## 📖 How to Use

1. **Enter Destination** - Type your travel destination
2. **Set Dates & Budget** - Choose dates and budget amount
3. **Select Interests** - Pick activities you enjoy
4. **Add Notes** - Share preferences or must-see places
5. **Generate Plan** - Click "Plan Your WanderMind Trip"
6. **View Map** - See all locations on the interactive map
7. **Customize** - Edit and adjust your itinerary as needed

## 🛠️ Tech Stack

- **Frontend**: React.js with Leaflet.js
- **AI APIs**: Groq (primary) / Google Gemini (fallback)
- **Mapping**: OpenStreetMap & Leaflet Routing Machine
- **Styling**: CSS with gradients and animations
- **State**: React Hooks

## 📁 Project Structure

```
src/
├── App.js                 # Main component
├── components/
│   ├── TripForm.js       # Travel planning form
│   ├── TripMap.js        # Interactive map
│   └── ItineraryDisplay.js # Trip itinerary view
├── api/
│   └── modifyEvent.js
├── utils/
│   ├── llm.js            # AI API integration
│   └── factChecker.js
└── index.js
```

## 🌈 Color Scheme

- **Sky Blue** (#4A90E2) - Primary, freedom & travel
- **Sunset Orange** (#F5A623) - Secondary, warmth & energy
- **Forest Green** (#50E3C2) - Accent, nature & adventure
- **Black** (#000000) - Professional text

## 📱 Layout

- **Left Panel (1/3)**: Trip planning form with interests
- **Right Panel (2/3)**: Interactive map with destinations
- **Bottom (Full-width)**: Detailed itinerary display

Panels are manually adjustable for custom viewing.

## 🐛 Troubleshooting

| Issue                 | Solution                                               |
| --------------------- | ------------------------------------------------------ |
| Map not loading       | Check internet connection and browser console          |
| API errors            | Verify API key, check rate limits, try alternative API |
| Coordinates not found | Use full city name with country                        |

## 📄 License

Open source - available for personal and educational use.

## 👤 Author

**Swetha Mehtre**  
- GitHub: [https://github.com/swetha-mehtre](https://github.com/swetha-mehtre)
- LinkedIn: [https://www.linkedin.com/in/swetha-mehtre-6619442a9/](https://www.linkedin.com/in/swetha-mehtre-6619442a9/)

## 🙏 Credits

- Leaflet.js for mapping
- Groq & Google for AI
- OpenStreetMap community
- React community

---

**Start your next adventure with WanderMind!** ✈️🌍

Made with ❤️ by Swetha Mehtre
npm install

````

3. Start the development server:
```bash
npm start
````

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
