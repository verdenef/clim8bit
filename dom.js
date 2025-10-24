/**
 * Display current weather data in the UI
 * @param {Object} data - Weather data from OpenWeatherMap API
 * @param {string} units - Temperature units ('metric' or 'imperial')
 */
function displayWeather(data, units = 'metric') {
  // Get DOM elements for error handling and basic info
  const errorMessage = document.getElementById("error-message");
  const cityName = document.getElementById("city-name");
  const description = document.getElementById("description");
  
  // Hide any previous error messages and display city info
  if (errorMessage) errorMessage.style.display = "none";
  if (cityName) cityName.textContent = `${data.name}, ${data.sys.country}`;
  if (description) description.textContent = data.weather[0].description;
  
  // Get temperature unit based on selected units
  const tempUnit = units === 'metric' ? '°C' : '°F';
  const temperature = document.getElementById("temperature");
  const humidity = document.getElementById("humidity");
  const wind = document.getElementById("wind");
  const feelsLike = document.getElementById("feels-like");
  const pressure = document.getElementById("pressure");
  const visibility = document.getElementById("visibility");
  const weatherIcon = document.querySelector("#weather-icon img");
  
  // Display temperature and humidity
  if (temperature) temperature.textContent = `${Math.round(data.main.temp)}${tempUnit}`;
  if (humidity) humidity.textContent = `Humidity: ${data.main.humidity}%`;
  
  // Convert and display wind speed based on units
  const windUnit = units === 'metric' ? 'm/s' : 'mph';
  const windSpeed = units === 'metric' ? data.wind.speed : (data.wind.speed * 2.237).toFixed(1);
  if (wind) wind.textContent = `Wind: ${windSpeed} ${windUnit}`;

  // Display additional weather details
  const feelsLikeTemp = Math.round(data.main.feels_like);
  if (feelsLike) feelsLike.textContent = `Feels like: ${feelsLikeTemp}${tempUnit}`;
  if (pressure) pressure.textContent = `Pressure: ${data.main.pressure} hPa`;
  if (visibility) visibility.textContent = `Visibility: ${(data.visibility / 1000).toFixed(1)} km`;

  // Display weather icon from OpenWeatherMap
  const iconCode = data.weather[0].icon;
  if (weatherIcon) {
    weatherIcon.src = `https://openweathermap.org/img/wn/${iconCode}@2x.png`;
  }
}

/**
 * Display error message to the user
 * @param {string} message - Error message to display
 */
function displayError(message) {
  const errorEl = document.getElementById("error-message");
  if (errorEl) {
    errorEl.textContent = message;
    errorEl.style.display = "block";
  }
}

/**
 * Display 5-day weather forecast in the UI
 * @param {Object} forecastData - Forecast data from OpenWeatherMap API
 * @param {string} units - Temperature units ('metric' or 'imperial')
 */
function displayForecast(forecastData, units = 'metric') {
  const forecastContainer = document.getElementById("forecast-container");
  if (!forecastContainer) return; // Exit if container doesn't exist

  const tempUnit = units === 'metric' ? '°C' : '°F';
  const dailyForecasts = processForecastData(forecastData); // Process raw forecast data

  // Build forecast HTML with title and grid container
  let forecastHTML = '<h3 class="forecast-title">📅 5-DAY FORECAST</h3><div class="forecast-grid">';
  
  // Generate forecast cards for each day
  dailyForecasts.forEach(day => {
    const date = new Date(day.date);
    const dayName = date.toLocaleDateString('en', { weekday: 'short' });
    const avgTemp = Math.round(day.temps.reduce((a, b) => a + b, 0) / day.temps.length);
    
    forecastHTML += `
      <div class="forecast-card">
        <div class="forecast-day">${dayName}</div>
        <div class="forecast-icon">${getWeatherEmoji(day.weather.icon)}</div>
        <div class="forecast-temp">${avgTemp}${tempUnit}</div>
        <div class="forecast-desc">${day.weather.description}</div>
      </div>
    `;
  });
  
  forecastHTML += '</div>';
  forecastContainer.innerHTML = forecastHTML;
  // Ensure the forecast section is visible
  forecastContainer.style.display = 'block';
}

/**
 * Process raw forecast data and group by day
 * @param {Object} data - Raw forecast data from OpenWeatherMap API
 * @returns {Array} Array of daily forecast objects
 */
function processForecastData(data) {
  const dailyForecasts = {};
  
  // Group forecast items by date
  data.list.forEach(item => {
    const date = new Date(item.dt * 1000).toDateString();
    if (!dailyForecasts[date]) {
      // Create new day entry with initial data
      dailyForecasts[date] = {
        date: date,
        temps: [],
        weather: item.weather[0],
        humidity: item.main.humidity,
        windSpeed: item.wind.speed
      };
    }
    // Add temperature to the day's temperature array
    dailyForecasts[date].temps.push(item.main.temp);
  });

  // Return first 5 days of forecast data
  return Object.values(dailyForecasts).slice(0, 5);
}

/**
 * Convert OpenWeatherMap icon codes to emoji representations
 * @param {string} iconCode - Icon code from OpenWeatherMap API
 * @returns {string} Corresponding emoji for the weather condition
 */
function getWeatherEmoji(iconCode) {
  const iconMap = {
    '01d': '☀️', '01n': '🌙', // Clear sky day/night
    '02d': '⛅', '02n': '☁️', // Few clouds day/night
    '03d': '☁️', '03n': '☁️', // Scattered clouds day/night
    '04d': '☁️', '04n': '☁️', // Broken clouds day/night
    '09d': '🌧️', '09n': '🌧️', // Shower rain day/night
    '10d': '🌦️', '10n': '🌧️', // Rain day/night
    '11d': '⛈️', '11n': '⛈️', // Thunderstorm day/night
    '13d': '❄️', '13n': '❄️', // Snow day/night
    '50d': '🌫️', '50n': '🌫️'  // Mist day/night
  };
  return iconMap[iconCode] || '🌤️'; // Default emoji if icon not found
}

/**
 * Show loading indicator to user
 */
function showLoading() {
  const loadingEl = document.getElementById("loading");
  if (loadingEl) {
    loadingEl.style.display = "block";
  }
}

/**
 * Hide loading indicator
 */
function hideLoading() {
  const loadingEl = document.getElementById("loading");
  if (loadingEl) {
    loadingEl.style.display = "none";
  }
}

/**
 * Add a city to the search history
 * @param {string} city - City name to add to history
 */
function addToSearchHistory(city) {
  let history = JSON.parse(localStorage.getItem('searchHistory') || '[]');
  history = history.filter(item => item !== city); // Remove if already exists
  history.unshift(city); // Add to beginning of array
  history = history.slice(0, 5); // Keep only last 5 searches
  localStorage.setItem('searchHistory', JSON.stringify(history));
  updateSearchHistory(); // Update the UI
}

/**
 * Update the search history display in the UI
 */
function updateSearchHistory() {
  const historyContainer = document.getElementById("search-history");
  if (!historyContainer) return;

  try {
    const history = JSON.parse(localStorage.getItem('searchHistory') || '[]');
    if (!Array.isArray(history) || history.length === 0) {
      historyContainer.style.display = 'none';
      return;
    }

    // Show history container and populate with clickable city names
    historyContainer.style.display = 'block';
    historyContainer.innerHTML = `
      <h4>📍 RECENT SEARCHES</h4>
      <div class="history-items">
        ${history.map(city => `<span class="history-item" onclick="searchCity('${city.replace(/'/g, "\\'")}')">${city}</span>`).join('')}
      </div>
    `;
  } catch (err) {
    console.error('Error updating search history:', err);
    historyContainer.style.display = 'none';
  }
}

/**
 * Display weather alerts in the UI
 * @param {Array} alerts - Array of alert objects with type, message, and icon
 */
function displayWeatherAlerts(alerts) {
  const alertsContainer = document.getElementById("weather-alerts");
  if (!alertsContainer) return;

  // Hide alerts section if no alerts
  if (alerts.length === 0) {
    alertsContainer.style.display = 'none';
    return;
  }

  // Display alerts with appropriate styling based on alert type
  alertsContainer.style.display = 'block';
  alertsContainer.innerHTML = `
    <h3 class="alerts-title">⚠️ WEATHER ALERTS</h3>
    <div class="alerts-list">
      ${alerts.map(alert => `
        <div class="alert-item alert-${alert.type}">
          <span class="alert-icon">${alert.icon}</span>
          <span class="alert-message">${alert.message}</span>
        </div>
      `).join('')}
    </div>
  `;
}
