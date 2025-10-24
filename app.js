/**
 * Main Application Logic and Event Handlers
 * 
 * This module handles all user interactions, DOM manipulation,
 * and coordinates between API calls and UI updates.
 */

// Get DOM elements with null safety checks
const searchBtn = document.getElementById("search-btn");
const cityInput = document.getElementById("city-input");
const darkModeToggle = document.getElementById("dark-mode-toggle");
const locationBtn = document.getElementById("location-btn");
const unitsBtn = document.getElementById("units-btn");

// Global application state
let currentUnits = localStorage.getItem('units') || 'metric'; // Temperature units preference
let currentCity = ''; // Currently displayed city

// Validate that required DOM elements exist
if (!searchBtn || !cityInput || !darkModeToggle) {
  console.error('Required DOM elements not found');
}

/**
 * Create floating pixel particle effects for retro aesthetic
 * Adds animated pixel elements that float across the screen
 */
function addPixelEffects() {
  // Create container for all pixel particles
  const pixelContainer = document.createElement('div');
  pixelContainer.style.position = 'fixed';
  pixelContainer.style.top = '0';
  pixelContainer.style.left = '0';
  pixelContainer.style.width = '100%';
  pixelContainer.style.height = '100%';
  pixelContainer.style.pointerEvents = 'none'; // Don't interfere with user interactions
  pixelContainer.style.zIndex = '1'; // Behind main content but visible
  pixelContainer.style.overflow = 'hidden';
  
  // Create 20 floating pixel particles
  const pixelColors = ['#A8E6CF', '#FFD3B6', '#FFAAA5', '#D4A5A5', '#A8D8EA'];
  for (let i = 0; i < 20; i++) {
    const pixel = document.createElement('div');
    pixel.style.position = 'absolute';
    pixel.style.width = '6px';
    pixel.style.height = '6px';
    pixel.style.background = pixelColors[i % pixelColors.length]; // Random color from array
    pixel.style.borderRadius = '2px';
    pixel.style.left = Math.random() * 100 + '%'; // Random horizontal position
    pixel.style.top = Math.random() * 100 + '%'; // Random vertical position
    pixel.style.animation = `pixelFloat ${3 + Math.random() * 4}s linear infinite`; // Random animation duration
    pixelContainer.appendChild(pixel);
  }
  
  // Add the pixel container to the page
  document.body.appendChild(pixelContainer);
}

// Add CSS animations for pixel effects
const style = document.createElement('style');
style.textContent = `
  /* Floating pixel animation - particles move from bottom to top */
  @keyframes pixelFloat {
    0% { transform: translateY(100vh) rotate(0deg); opacity: 0; }
    10% { opacity: 1; }
    90% { opacity: 1; }
    100% { transform: translateY(-100vh) rotate(360deg); opacity: 0; }
  }
  
  /* Glowing effect for interactive elements */
  .pixel-glow {
    animation: pixelGlow 2s ease-in-out infinite alternate;
  }
  
  /* Glow animation keyframes */
  @keyframes pixelGlow {
    0% { box-shadow: 0 0 5px #A8E6CF; }
    100% { box-shadow: 0 0 20px #A8E6CF, 0 0 30px #FFD3B6; }
  }
`;
document.head.appendChild(style);

// Search button event handler with pixel effects
if (searchBtn) {
  searchBtn.addEventListener("click", async () => {
    const city = cityInput.value.trim();
    if (!city) return; // Don't search if input is empty
    
    await searchCity(city);
  });
}

// Location button handler - gets weather for user's current location
if (locationBtn) {
  locationBtn.addEventListener("click", async () => {
    // Add visual feedback with pixel glow effect
    locationBtn.classList.add('pixel-glow');
  
  try {
    showLoading(); // Show loading indicator
    const coords = await getCurrentLocation(); // Get user's coordinates
    const data = await getWeatherByCoords(coords.lat, coords.lon, currentUnits);
    currentCity = data.name;
    displayWeather(data, currentUnits);
    
    // Try to get additional forecast and alert data
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
    
    addToSearchHistory(currentCity); // Save to search history
    addSuccessPixels(); // Add success visual effect
  } catch (err) {
    // Handle different types of errors with appropriate messages
    if (err.message.includes("All API keys") || err.message.includes("exhausted")) {
      displayError("Service temporarily unavailable. Please try again later.");
    } else {
      displayError("Unable to get your location. Please search manually.");
    }
    addErrorPixels(); // Add error visual effect
  } finally {
    hideLoading(); // Hide loading indicator
    // Remove glow effect after 2 seconds
    setTimeout(() => {
      if (locationBtn) {
        locationBtn.classList.remove('pixel-glow');
      }
    }, 2000);
  }
  });
}

// Units toggle handler - switches between Celsius and Fahrenheit
if (unitsBtn) {
  unitsBtn.addEventListener("click", () => {
    // Toggle between metric (Celsius) and imperial (Fahrenheit)
    currentUnits = currentUnits === 'metric' ? 'imperial' : 'metric';
    localStorage.setItem('units', currentUnits); // Save preference
    unitsBtn.textContent = currentUnits === 'metric' ? '°C' : '°F'; // Update button text
    
    // If there's a current city, refresh the weather data with new units
    if (currentCity) {
      searchCity(currentCity);
    }
  });
}

/**
 * Global search function - searches for weather data by city name
 * Made available globally for onclick handlers in HTML
 * @param {string} city - The city name to search for
 */
window.searchCity = async function searchCity(city) {
  if (!city) return; // Exit if no city provided
  
  // Add visual feedback with pixel glow effect
  if (searchBtn) {
    searchBtn.classList.add('pixel-glow');
  }
  showLoading(); // Show loading indicator
  
  try {
    // Fetch weather data, forecast, and alerts in parallel for better performance
    const [weatherData, forecastData, alerts] = await Promise.all([
      getWeather(city, currentUnits),
      getForecast(city, currentUnits),
      getWeatherAlerts(city)
    ]);
    
    currentCity = city; // Update current city
    displayWeather(weatherData, currentUnits); // Display current weather
    displayForecast(forecastData, currentUnits); // Display forecast
    displayWeatherAlerts(alerts); // Display any weather alerts
    addToSearchHistory(city); // Save to search history
    
    // Add success visual effect
    addSuccessPixels();
  } catch (err) {
    // Handle different error types with appropriate user messages
    if (err.message.includes("All API keys") || err.message.includes("exhausted")) {
      displayError("Service temporarily unavailable. Please try again later.");
    } else {
      displayError("City not found. Try again.");
    }
    
    // Add error visual effect
    addErrorPixels();
  } finally {
    hideLoading(); // Hide loading indicator
    // Remove glow effect after 2 seconds
    setTimeout(() => {
      if (searchBtn) {
        searchBtn.classList.remove('pixel-glow');
      }
    }, 2000);
  }
};

// Enter key support for city input - allows searching by pressing Enter
if (cityInput) {
  cityInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
      const city = cityInput.value.trim();
      if (city) {
        searchCity(city); // Trigger search when Enter is pressed
      }
    }
  });
}

/**
 * Add success visual effect when weather data loads successfully
 */
function addSuccessPixels() {
  const resultSection = document.querySelector('.result-section');
  if (resultSection) {
    resultSection.style.animation = 'pixelSuccess 1s ease-out';
  }
}

/**
 * Add error visual effect when weather data fails to load
 */
function addErrorPixels() {
  const errorMessage = document.getElementById('error-message');
  if (errorMessage) {
    errorMessage.style.animation = 'pixelError 0.5s ease-out';
  }
}

// Add CSS animations for success and error visual effects
const additionalStyle = document.createElement('style');
additionalStyle.textContent = `
  /* Success animation - gentle scale and glow effect */
  @keyframes pixelSuccess {
    0% { transform: scale(1); }
    50% { transform: scale(1.05); box-shadow: 0 0 20px #A8E6CF; }
    100% { transform: scale(1); }
  }
  
  /* Error animation - shake effect for error messages */
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
    // Toggle dark mode class on body
    document.body.classList.toggle("dark");
    const isDark = document.body.classList.contains("dark");
    darkModeToggle.textContent = isDark ? "☀️" : "🌙"; // Update button icon
    
    // Save theme preference to localStorage
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
    
    // Add smooth fade transition effect
    darkModeToggle.style.animation = 'pixelFade 0.6s ease-in-out';
    setTimeout(() => {
      darkModeToggle.style.animation = '';
    }, 600);
  });
}

// Add fade animation CSS for theme toggle
const toggleStyle = document.createElement('style');
toggleStyle.textContent = `
  /* Fade animation for theme toggle button */
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

// Global error handlers for better error management
window.addEventListener('error', (event) => {
  console.error('Global error:', event.error);
  displayError('An unexpected error occurred. Please try again.');
});

window.addEventListener('unhandledrejection', (event) => {
  console.error('Unhandled promise rejection:', event.reason);
  displayError('Network error. Please check your connection and try again.');
});

// Debug function to test pixel effects
window.testPixels = function() {
  console.log('Testing pixel effects...');
  addPixelEffects();
  console.log('Pixel effects added!');
};

// Comprehensive test function for all visual effects
window.testAllEffects = function() {
  console.log('Testing all visual effects...');
  
  // Test pixel effects
  addPixelEffects();
  console.log('✓ Pixel particles added');
  
  // Test loading overlay
  showLoading();
  setTimeout(() => {
    hideLoading();
    console.log('✓ Loading overlay tested');
  }, 2000);
  
  // Test search history (if any exists)
  const history = JSON.parse(localStorage.getItem('searchHistory') || '[]');
  if (history.length > 0) {
    updateSearchHistory();
    console.log('✓ Search history displayed');
  }
  
  // Test error message
  setTimeout(() => {
    displayError('Test error message');
    setTimeout(() => {
      const errorEl = document.getElementById('error-message');
      if (errorEl) errorEl.style.display = 'none';
      console.log('✓ Error message tested');
    }, 1000);
  }, 3000);
  
  console.log('All visual effects tested!');
};

// Initialize application when page loads
document.addEventListener('DOMContentLoaded', () => {
  try {
    console.log('Initializing pixel effects...');
    addPixelEffects(); // Add floating pixel effects
    console.log('Pixel effects initialized');
    
    // Check for saved theme preference and apply it
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
      document.body.classList.add('dark');
      if (darkModeToggle) {
        darkModeToggle.textContent = '☀️';
      }
    }
    
    // Initialize units button with current preference
    if (unitsBtn) {
      unitsBtn.textContent = currentUnits === 'metric' ? '°C' : '°F';
    }
    
    // Load and display search history
    updateSearchHistory();
  } catch (err) {
    console.error('Initialization error:', err);
  }
});
