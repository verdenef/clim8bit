Team Meteor — Clim8bit Weather App

Group Members:
- Van Renfred M. Otacan (HTML Structure & Semantics)
- Angela Lois A. Calo (CSS Styling & Layout)
- Glein Ardian Edquilag (JavaScript & API Integration)
- Van Fiel (JavaScript & API Integration)
- Junalea Mhae F. Gallogo (Project Management & Documentation)

Project: Clim8bit - Retro Pixel Weather App
API used: OpenWeatherMap Current Weather API
API documentation: https://openweathermap.org/api

Features:
- Real-time weather data with pixel art aesthetics
- 5-day weather forecast with pixel-style icons
- Weather alerts and notifications
- Location-based weather detection
- Dark/Light theme toggle with nature-inspired colors
- Search history with pixel-style interactions
- Responsive design for all devices
- Floating pixel particle effects
- Consistent hover animations across all elements

Files included:
- index.html    (Landing page with team portfolio)
- app.html      (Main weather application)
- styles.css    (Retro pixel art styling with dark mode)
- app.js        (Main application logic and event handlers)
- dom.js        (DOM manipulation and display functions)
- api.js        (API integration with multiple weather services)
- images/       (Team member photos: red.jpg, angela.jpg, glein.jpg, vantempo.jpg, jun.jpg)

Technical Features:
- Multiple API key fallback system for reliability
- Async/await pattern for API calls
- Local storage for user preferences (theme, units, search history)
- Error handling with user-friendly messages
- Pixel-style animations and transitions
- Consistent z-index layering for visual effects
- Responsive grid layouts
- Cross-browser compatibility

Setup:
1. Sign up at OpenWeatherMap and obtain an API key.
2. Replace the placeholder API keys in api.js with your actual keys.
3. Open index.html via a local web server (e.g. VSCode Live Server or `python -m http.server 8000`).
4. Navigate to app.html to use the weather application.

Usage:
- Search for any city worldwide
- Use location button for automatic weather detection
- Toggle between Celsius and Fahrenheit
- Switch between light and dark themes
- View 5-day forecasts and weather alerts
- Access search history for quick city selection

Notes:
- For production, hide API keys on a server; this client-side approach is suitable for educational projects.
- If you encounter CORS issues, always use a local web server instead of opening files directly.
- The app includes multiple API keys for redundancy and better reliability.
- All visual effects are optimized for performance and consistent user experience.