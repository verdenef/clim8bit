// DOM elements with null checks
const searchBtn = document.getElementById("search-btn");
const cityInput = document.getElementById("city-input");
const darkModeToggle = document.getElementById("dark-mode-toggle");
const locationBtn = document.getElementById("location-btn");
const unitsBtn = document.getElementById("units-btn");

// Global state
let currentUnits = localStorage.getItem('units') || 'metric';
let currentCity = '';

// Check if required elements exist
if (!searchBtn || !cityInput || !darkModeToggle) {
  console.error('Required DOM elements not found');
}

// Pixel animation effects
function addPixelEffects() {
  // Add floating pixel particles
  const pixelContainer = document.createElement('div');
  pixelContainer.style.position = 'fixed';
  pixelContainer.style.top = '0';
  pixelContainer.style.left = '0';
  pixelContainer.style.width = '100%';
  pixelContainer.style.height = '100%';
  pixelContainer.style.pointerEvents = 'none';
  pixelContainer.style.zIndex = '-1';
  pixelContainer.style.overflow = 'hidden';
  
  for (let i = 0; i < 20; i++) {
    const pixel = document.createElement('div');
    pixel.style.position = 'absolute';
    pixel.style.width = '4px';
    pixel.style.height = '4px';
    pixel.style.background = '#A8E6CF';
    pixel.style.left = Math.random() * 100 + '%';
    pixel.style.top = Math.random() * 100 + '%';
    pixel.style.animation = `pixelFloat ${3 + Math.random() * 4}s linear infinite`;
    pixelContainer.appendChild(pixel);
  }
  
  document.body.appendChild(pixelContainer);
}

// Add CSS for pixel animations
const style = document.createElement('style');
style.textContent = `
  @keyframes pixelFloat {
    0% { transform: translateY(100vh) rotate(0deg); opacity: 0; }
    10% { opacity: 1; }
    90% { opacity: 1; }
    100% { transform: translateY(-100vh) rotate(360deg); opacity: 0; }
  }
  
  .pixel-glow {
    animation: pixelGlow 2s ease-in-out infinite alternate;
  }
  
  @keyframes pixelGlow {
    0% { box-shadow: 0 0 5px #A8E6CF; }
    100% { box-shadow: 0 0 20px #A8E6CF, 0 0 30px #FFD3B6; }
  }
`;
document.head.appendChild(style);

// Search handler with pixel effects
if (searchBtn) {
  searchBtn.addEventListener("click", async () => {
    const city = cityInput.value.trim();
    if (!city) return;
    
    await searchCity(city);
  });
}

// Location button handler
if (locationBtn) {
  locationBtn.addEventListener("click", async () => {
    locationBtn.classList.add('pixel-glow');
  
  try {
    showLoading();
    const coords = await getCurrentLocation();
    const data = await getWeatherByCoords(coords.lat, coords.lon, currentUnits);
    currentCity = data.name;
    displayWeather(data, currentUnits);
    
    // Try to get forecast and alerts
    try {
      const [forecastData, alerts] = await Promise.all([
        getForecast(currentCity, currentUnits),
        getWeatherAlerts(currentCity)
      ]);
      displayForecast(forecastData, currentUnits);
      displayWeatherAlerts(alerts);
    } catch (err) {
      console.log('Forecast or alerts not available');
    }
    
    addToSearchHistory(currentCity);
    addSuccessPixels();
  } catch (err) {
    displayError("Unable to get your location. Please search manually.");
    addErrorPixels();
  } finally {
    hideLoading();
    setTimeout(() => {
      if (locationBtn) {
        locationBtn.classList.remove('pixel-glow');
      }
    }, 2000);
  }
  });
}

// Units toggle handler
if (unitsBtn) {
  unitsBtn.addEventListener("click", () => {
    currentUnits = currentUnits === 'metric' ? 'imperial' : 'metric';
    localStorage.setItem('units', currentUnits);
    unitsBtn.textContent = currentUnits === 'metric' ? '°C' : '°F';
    
    if (currentCity) {
      searchCity(currentCity);
    }
  });
}

// Global search function (make it available globally for onclick handlers)
window.searchCity = async function searchCity(city) {
  if (!city) return;
  
  // Add pixel glow effect to search button
  if (searchBtn) {
    searchBtn.classList.add('pixel-glow');
  }
  showLoading();
  
  try {
    const [weatherData, forecastData, alerts] = await Promise.all([
      getWeather(city, currentUnits),
      getForecast(city, currentUnits),
      getWeatherAlerts(city)
    ]);
    
    currentCity = city;
    displayWeather(weatherData, currentUnits);
    displayForecast(forecastData, currentUnits);
    displayWeatherAlerts(alerts);
    addToSearchHistory(city);
    
    // Add success pixel effect
    addSuccessPixels();
  } catch (err) {
    displayError("City not found. Try again.");
    
    // Add error pixel effect
    addErrorPixels();
  } finally {
    hideLoading();
    // Remove glow effect after 2 seconds
    setTimeout(() => {
      if (searchBtn) {
        searchBtn.classList.remove('pixel-glow');
      }
    }, 2000);
  }
};

// Enter key support
if (cityInput) {
  cityInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
      const city = cityInput.value.trim();
      if (city) {
        searchCity(city);
      }
    }
  });
}

// Add success pixel effect
function addSuccessPixels() {
  const resultSection = document.querySelector('.result-section');
  if (resultSection) {
    resultSection.style.animation = 'pixelSuccess 1s ease-out';
  }
}

// Add error pixel effect
function addErrorPixels() {
  const errorMessage = document.getElementById('error-message');
  if (errorMessage) {
    errorMessage.style.animation = 'pixelError 0.5s ease-out';
  }
}

// Add more CSS for success/error animations
const additionalStyle = document.createElement('style');
additionalStyle.textContent = `
  @keyframes pixelSuccess {
    0% { transform: scale(1); }
    50% { transform: scale(1.05); box-shadow: 0 0 20px #A8E6CF; }
    100% { transform: scale(1); }
  }
  
  @keyframes pixelError {
    0%, 100% { transform: translateX(0); }
    25% { transform: translateX(-5px); }
    75% { transform: translateX(5px); }
  }
`;
document.head.appendChild(additionalStyle);

// Dark mode toggle with pixel effect
if (darkModeToggle) {
  darkModeToggle.addEventListener("click", () => {
    document.body.classList.toggle("dark");
    const isDark = document.body.classList.contains("dark");
    darkModeToggle.textContent = isDark ? "☀️" : "🌙";
    
    // Save theme preference
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
    
    // Add smooth fade transition effect
    darkModeToggle.style.animation = 'pixelFade 0.6s ease-in-out';
    setTimeout(() => {
      darkModeToggle.style.animation = '';
    }, 600);
  });
}

// Add fade animation CSS
const toggleStyle = document.createElement('style');
toggleStyle.textContent = `
  @keyframes pixelFade {
    0% { 
      opacity: 1; 
      filter: brightness(1);
    }
    50% { 
      opacity: 0.3; 
      filter: brightness(1.5);
    }
    100% { 
      opacity: 1; 
      filter: brightness(1);
    }
  }
`;
document.head.appendChild(toggleStyle);

// Global error handler
window.addEventListener('error', (event) => {
  console.error('Global error:', event.error);
  displayError('An unexpected error occurred. Please try again.');
});

window.addEventListener('unhandledrejection', (event) => {
  console.error('Unhandled promise rejection:', event.reason);
  displayError('Network error. Please check your connection and try again.');
});

// Initialize pixel effects when page loads
document.addEventListener('DOMContentLoaded', () => {
  try {
    addPixelEffects();
    
    // Check for saved theme preference and apply it
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
      document.body.classList.add('dark');
      if (darkModeToggle) {
        darkModeToggle.textContent = '☀️';
      }
    }
    
    // Initialize units button
    if (unitsBtn) {
      unitsBtn.textContent = currentUnits === 'metric' ? '°C' : '°F';
    }
    
    // Load search history
    updateSearchHistory();
  } catch (err) {
    console.error('Initialization error:', err);
  }
});
