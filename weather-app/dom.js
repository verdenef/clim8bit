function displayWeather(data, units = 'metric') {
  const errorMessage = document.getElementById("error-message");
  const cityName = document.getElementById("city-name");
  const description = document.getElementById("description");
  
  if (errorMessage) errorMessage.style.display = "none";
  if (cityName) cityName.textContent = `${data.name}, ${data.sys.country}`;
  if (description) description.textContent = data.weather[0].description;
  
  const tempUnit = units === 'metric' ? '°C' : '°F';
  const temperature = document.getElementById("temperature");
  const humidity = document.getElementById("humidity");
  const wind = document.getElementById("wind");
  const feelsLike = document.getElementById("feels-like");
  const pressure = document.getElementById("pressure");
  const visibility = document.getElementById("visibility");
  const weatherIcon = document.querySelector("#weather-icon img");
  
  if (temperature) temperature.textContent = `${Math.round(data.main.temp)}${tempUnit}`;
  if (humidity) humidity.textContent = `Humidity: ${data.main.humidity}%`;
  
  const windUnit = units === 'metric' ? 'm/s' : 'mph';
  const windSpeed = units === 'metric' ? data.wind.speed : (data.wind.speed * 2.237).toFixed(1);
  if (wind) wind.textContent = `Wind: ${windSpeed} ${windUnit}`;

  // Add additional weather details
  const feelsLikeTemp = Math.round(data.main.feels_like);
  if (feelsLike) feelsLike.textContent = `Feels like: ${feelsLikeTemp}${tempUnit}`;
  if (pressure) pressure.textContent = `Pressure: ${data.main.pressure} hPa`;
  if (visibility) visibility.textContent = `Visibility: ${(data.visibility / 1000).toFixed(1)} km`;

  const iconCode = data.weather[0].icon;
  if (weatherIcon) {
    weatherIcon.src = `https://openweathermap.org/img/wn/${iconCode}@2x.png`;
  }
}

function displayError(message) {
  const errorEl = document.getElementById("error-message");
  if (errorEl) {
    errorEl.textContent = message;
    errorEl.style.display = "block";
  }
}

function displayForecast(forecastData, units = 'metric') {
  const forecastContainer = document.getElementById("forecast-container");
  if (!forecastContainer) return;

  const tempUnit = units === 'metric' ? '°C' : '°F';
  const dailyForecasts = processForecastData(forecastData);

  let forecastHTML = '<h3 class="forecast-title">📅 5-DAY FORECAST</h3><div class="forecast-grid">';
  
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
  // Ensure the forecast section is shown
  forecastContainer.style.display = 'block';
}

function processForecastData(data) {
  const dailyForecasts = {};
  
  data.list.forEach(item => {
    const date = new Date(item.dt * 1000).toDateString();
    if (!dailyForecasts[date]) {
      dailyForecasts[date] = {
        date: date,
        temps: [],
        weather: item.weather[0],
        humidity: item.main.humidity,
        windSpeed: item.wind.speed
      };
    }
    dailyForecasts[date].temps.push(item.main.temp);
  });

  return Object.values(dailyForecasts).slice(0, 5);
}

function getWeatherEmoji(iconCode) {
  const iconMap = {
    '01d': '☀️', '01n': '🌙',
    '02d': '⛅', '02n': '☁️',
    '03d': '☁️', '03n': '☁️',
    '04d': '☁️', '04n': '☁️',
    '09d': '🌧️', '09n': '🌧️',
    '10d': '🌦️', '10n': '🌧️',
    '11d': '⛈️', '11n': '⛈️',
    '13d': '❄️', '13n': '❄️',
    '50d': '🌫️', '50n': '🌫️'
  };
  return iconMap[iconCode] || '🌤️';
}

function showLoading() {
  const loadingEl = document.getElementById("loading");
  if (loadingEl) {
    loadingEl.style.display = "block";
  }
}

function hideLoading() {
  const loadingEl = document.getElementById("loading");
  if (loadingEl) {
    loadingEl.style.display = "none";
  }
}

function addToSearchHistory(city) {
  let history = JSON.parse(localStorage.getItem('searchHistory') || '[]');
  history = history.filter(item => item !== city);
  history.unshift(city);
  history = history.slice(0, 5); // Keep only last 5 searches
  localStorage.setItem('searchHistory', JSON.stringify(history));
  updateSearchHistory();
}

function updateSearchHistory() {
  const historyContainer = document.getElementById("search-history");
  if (!historyContainer) return;

  try {
    const history = JSON.parse(localStorage.getItem('searchHistory') || '[]');
    if (!Array.isArray(history) || history.length === 0) {
      historyContainer.style.display = 'none';
      return;
    }

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

function displayWeatherAlerts(alerts) {
  const alertsContainer = document.getElementById("weather-alerts");
  if (!alertsContainer) return;

  if (alerts.length === 0) {
    alertsContainer.style.display = 'none';
    return;
  }

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
