const API_KEY = "aebe7d4c03bacdb48fdc5f8181d3ebb4";
const BASE_URL = "https://api.openweathermap.org/data/2.5";

// Get current weather by city name
async function getWeather(city, units = 'metric') {
  try {
    if (!city || !city.trim()) {
      throw new Error("City name is required");
    }
    
    const res = await fetch(
      `${BASE_URL}/weather?q=${encodeURIComponent(city.trim())}&appid=${API_KEY}&units=${units}`
    );
    
    if (!res.ok) {
      if (res.status === 404) {
        throw new Error("City not found");
      } else if (res.status === 401) {
        throw new Error("API key invalid");
      } else {
        throw new Error(`Weather service error: ${res.status}`);
      }
    }
    
    const data = await res.json();
    if (!data || !data.name) {
      throw new Error("Invalid weather data received");
    }
    
    return data;
  } catch (err) {
    console.error('Weather API error:', err);
    throw err;
  }
}

// Get current weather by coordinates
async function getWeatherByCoords(lat, lon, units = 'metric') {
  try {
    if (!lat || !lon || isNaN(lat) || isNaN(lon)) {
      throw new Error("Invalid coordinates");
    }
    
    const res = await fetch(
      `${BASE_URL}/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=${units}`
    );
    
    if (!res.ok) {
      if (res.status === 404) {
        throw new Error("Location not found");
      } else if (res.status === 401) {
        throw new Error("API key invalid");
      } else {
        throw new Error(`Weather service error: ${res.status}`);
      }
    }
    
    const data = await res.json();
    if (!data || !data.name) {
      throw new Error("Invalid weather data received");
    }
    
    return data;
  } catch (err) {
    console.error('Weather API error:', err);
    throw err;
  }
}

// Get 5-day forecast
async function getForecast(city, units = 'metric') {
  try {
    if (!city || !city.trim()) {
      throw new Error("City name is required");
    }
    
    const res = await fetch(
      `${BASE_URL}/forecast?q=${encodeURIComponent(city.trim())}&appid=${API_KEY}&units=${units}`
    );
    
    if (!res.ok) {
      if (res.status === 404) {
        throw new Error("Forecast not found");
      } else if (res.status === 401) {
        throw new Error("API key invalid");
      } else {
        throw new Error(`Forecast service error: ${res.status}`);
      }
    }
    
    const data = await res.json();
    if (!data || !data.list || !Array.isArray(data.list)) {
      throw new Error("Invalid forecast data received");
    }
    
    return data;
  } catch (err) {
    console.error('Forecast API error:', err);
    throw err;
  }
}

// Get user's current location
function getCurrentLocation() {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation is not supported by this browser.'));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          lat: position.coords.latitude,
          lon: position.coords.longitude
        });
      },
      (error) => {
        reject(new Error('Unable to retrieve your location.'));
      }
    );
  });
}

// Get weather alerts (if available)
async function getWeatherAlerts(city) {
  try {
    const res = await fetch(
      `${BASE_URL}/weather?q=${encodeURIComponent(city)}&appid=${API_KEY}&units=metric`
    );
    if (!res.ok) throw new Error("No alerts available");
    const data = await res.json();
    
    // Check for severe weather conditions
    const alerts = [];
    const weather = data.weather[0];
    const main = data.main;
    
    // Temperature alerts
    if (main.temp > 35) {
      alerts.push({
        type: 'warning',
        message: '🌡️ High temperature warning! Stay hydrated and avoid prolonged sun exposure.',
        icon: '🌡️'
      });
    } else if (main.temp < 0) {
      alerts.push({
        type: 'warning',
        message: '🧊 Freezing temperatures! Dress warmly and watch for ice.',
        icon: '🧊'
      });
    }
    
    // Weather condition alerts
    if (weather.main === 'Thunderstorm') {
      alerts.push({
        type: 'alert',
        message: '⛈️ Thunderstorm warning! Stay indoors and avoid open areas.',
        icon: '⛈️'
      });
    } else if (weather.main === 'Rain' && data.rain && data.rain['1h'] > 10) {
      alerts.push({
        type: 'warning',
        message: '🌧️ Heavy rain warning! Drive carefully and avoid flooded areas.',
        icon: '🌧️'
      });
    } else if (weather.main === 'Snow') {
      alerts.push({
        type: 'warning',
        message: '❄️ Snow conditions! Drive carefully and dress warmly.',
        icon: '❄️'
      });
    }
    
    // Wind alerts
    if (data.wind.speed > 15) {
      alerts.push({
        type: 'warning',
        message: '💨 Strong winds! Secure loose objects and drive carefully.',
        icon: '💨'
      });
    }
    
    // Visibility alerts
    if (data.visibility < 1000) {
      alerts.push({
        type: 'alert',
        message: '🌫️ Poor visibility! Drive slowly and use headlights.',
        icon: '🌫️'
      });
    }
    
    return alerts;
  } catch (err) {
    return [];
  }
}
