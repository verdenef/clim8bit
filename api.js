/**
 * Weather API Configuration and Key Management
 * 
 * This module handles all API interactions with OpenWeatherMap,
 * including automatic API key rotation for rate limit handling.
 */

// Array of API keys for automatic rotation when rate limits are hit
const API_KEYS = [
  "e22e0645060efe152baa808e347ff07e",  // Primary key
  "787aacd2cffc118e0bb5ce01b5fdd594",   // Backup 1
  "bb7900d8a8eb069ac4f9c898b561ed87",   // Backup 2
  "839bdf964b6f1caa1cb1b35baee5f0f4"    // Backup 3
];

// OpenWeatherMap API base URL
const BASE_URL = "https://api.openweathermap.org/data/2.5";

// Debug mode for development logging (set to false for production)
const DEBUG_MODE = true;

// Track current API key index and failed keys for rotation logic
let currentKeyIndex = 0;
let failedKeys = new Set();

/**
 * Get the currently active API key
 * @returns {string} The current API key
 */
function getCurrentAPIKey() {
  return API_KEYS[currentKeyIndex];
}

/**
 * Rotate to the next available API key when current one fails
 * Marks current key as failed and finds next working key
 * @returns {boolean} True if rotation successful, false if all keys exhausted
 */
function rotateAPIKey() {
  // Mark current key as failed
  failedKeys.add(currentKeyIndex);
  
  // Find next available key that hasn't failed
  for (let i = 0; i < API_KEYS.length; i++) {
    if (!failedKeys.has(i)) {
      currentKeyIndex = i;
      if (DEBUG_MODE) console.log(`Switched to API key index: ${i}`);
      return true;
    }
  }
  
  // All keys have been exhausted
  console.error('All API keys have been exhausted');
  return false;
}

/**
 * Generic API request handler with automatic key rotation
 * Attempts to make API calls with different keys if rate limits are hit
 * @param {string} url - The API endpoint URL (without API key)
 * @returns {Promise<Object>} The API response data
 * @throws {Error} When all API keys are exhausted or network errors occur
 */
async function makeAPIRequest(url) {
  let lastError;
  
  // Try all available keys in sequence
  for (let attempt = 0; attempt < API_KEYS.length; attempt++) {
    try {
      const currentKey = getCurrentAPIKey();
      const fullUrl = `${url}&appid=${currentKey}`;
      
      if (DEBUG_MODE) console.log(`API attempt ${attempt + 1} with key index: ${currentKeyIndex}`);
      
      const res = await fetch(fullUrl);
      
      // Check if request was successful
      if (res.ok) {
        const data = await res.json();
        // Verify data is valid and not an error response
        if (data && data.cod !== 401 && data.cod !== 429) {
          return data; // Success - return the data
        }
      }
      
      // Handle API key specific errors (401 = unauthorized, 429 = rate limit)
      if (res.status === 401 || res.status === 429) {
        if (DEBUG_MODE) console.warn(`API key ${currentKeyIndex} failed with status: ${res.status}`);
        lastError = new Error(`API key issue: ${res.status}`);
        
        // Try to rotate to next key
        if (!rotateAPIKey()) {
          throw new Error('All API keys exhausted. Please try again later.');
        }
        continue; // Try with next key
      }
      
      // For other HTTP errors, throw immediately
      if (!res.ok) {
        throw new Error(`HTTP error: ${res.status}`);
      }
      
    } catch (err) {
      lastError = err;
      
      // If it's a network error, don't rotate keys - just fail
      if (err.message.includes('Failed to fetch') || err.message.includes('Network')) {
        throw new Error('Network error. Please check your connection.');
      }
      
      // For API key issues, rotate and retry if more keys available
      if (attempt < API_KEYS.length - 1) {
        if (!rotateAPIKey()) {
          break;
        }
      }
    }
  }
  
  // All attempts failed
  throw lastError || new Error('All API requests failed');
}

/**
 * Get current weather data for a specific city
 * @param {string} city - The city name to get weather for
 * @param {string} units - Temperature units ('metric' or 'imperial')
 * @returns {Promise<Object>} Weather data object from OpenWeatherMap API
 * @throws {Error} When city is invalid or API request fails
 */
async function getWeather(city, units = 'metric') {
  try {
    // Validate input
    if (!city || !city.trim()) {
      throw new Error("City name is required");
    }
    
    // Build API URL with city name and units
    const url = `${BASE_URL}/weather?q=${encodeURIComponent(city.trim())}&units=${units}`;
    const data = await makeAPIRequest(url);
    
    // Validate response data
    if (!data || !data.name) {
      throw new Error("Invalid weather data received");
    }
    
    return data;
  } catch (err) {
    console.error('Weather API error:', err);
    throw err;
  }
}

/**
 * Get current weather data using geographic coordinates
 * @param {number} lat - Latitude coordinate
 * @param {number} lon - Longitude coordinate
 * @param {string} units - Temperature units ('metric' or 'imperial')
 * @returns {Promise<Object>} Weather data object from OpenWeatherMap API
 * @throws {Error} When coordinates are invalid or API request fails
 */
async function getWeatherByCoords(lat, lon, units = 'metric') {
  try {
    // Validate coordinates
    if (!lat || !lon || isNaN(lat) || isNaN(lon)) {
      throw new Error("Invalid coordinates");
    }
    
    // Build API URL with coordinates and units
    const url = `${BASE_URL}/weather?lat=${lat}&lon=${lon}&units=${units}`;
    const data = await makeAPIRequest(url);
    
    // Validate response data
    if (!data || !data.name) {
      throw new Error("Invalid weather data received");
    }
    
    return data;
  } catch (err) {
    console.error('Weather API error:', err);
    throw err;
  }
}

/**
 * Get 5-day weather forecast for a specific city
 * @param {string} city - The city name to get forecast for
 * @param {string} units - Temperature units ('metric' or 'imperial')
 * @returns {Promise<Object>} Forecast data object from OpenWeatherMap API
 * @throws {Error} When city is invalid or API request fails
 */
async function getForecast(city, units = 'metric') {
  try {
    // Validate input
    if (!city || !city.trim()) {
      throw new Error("City name is required");
    }
    
    // Build API URL for forecast endpoint
    const url = `${BASE_URL}/forecast?q=${encodeURIComponent(city.trim())}&units=${units}`;
    const data = await makeAPIRequest(url);
    
    // Validate response data structure
    if (!data || !data.list || !Array.isArray(data.list)) {
      throw new Error("Invalid forecast data received");
    }
    
    return data;
  } catch (err) {
    console.error('Forecast API error:', err);
    throw err;
  }
}

/**
 * Reset all API keys to their initial state
 * Useful for retrying after some time when keys may have recovered
 */
function resetAPIKeys() {
  failedKeys.clear();
  currentKeyIndex = 0;
  if (DEBUG_MODE) console.log('API keys reset to primary');
}

/**
 * Get current API key status for debugging and monitoring
 * @returns {Object} Status object with key information
 */
function getAPIKeyStatus() {
  return {
    currentKeyIndex,
    totalKeys: API_KEYS.length,
    failedKeys: Array.from(failedKeys),
    availableKeys: API_KEYS.length - failedKeys.size
  };
}

/**
 * Get user's current geographic location using browser geolocation API
 * @returns {Promise<Object>} Promise that resolves with lat/lon coordinates
 * @throws {Error} When geolocation is not supported or user denies permission
 */
function getCurrentLocation() {
  return new Promise((resolve, reject) => {
    // Check if geolocation is supported by the browser
    if (!navigator.geolocation) {
      reject(new Error('Geolocation is not supported by this browser.'));
      return;
    }

    // Request current position from browser
    navigator.geolocation.getCurrentPosition(
      (position) => {
        // Success - return coordinates
        resolve({
          lat: position.coords.latitude,
          lon: position.coords.longitude
        });
      },
      (error) => {
        // User denied permission or other geolocation error
        reject(new Error('Unable to retrieve your location.'));
      }
    );
  });
}

/**
 * Analyze weather data and generate appropriate alerts for severe conditions
 * @param {string} city - The city to check for weather alerts
 * @returns {Promise<Array>} Array of alert objects with type, message, and icon
 */
async function getWeatherAlerts(city) {
  try {
    // Get current weather data using the key rotation system
    const data = await getWeather(city);
    
    // Initialize alerts array
    const alerts = [];
    const weather = data.weather[0];
    const main = data.main;
    
    // Check for extreme temperature conditions
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
    
    // Check for severe weather conditions
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
    
    // Check for strong wind conditions
    if (data.wind.speed > 15) {
      alerts.push({
        type: 'warning',
        message: '💨 Strong winds! Secure loose objects and drive carefully.',
        icon: '💨'
      });
    }
    
    // Check for poor visibility conditions
    if (data.visibility < 1000) {
      alerts.push({
        type: 'alert',
        message: '🌫️ Poor visibility! Drive slowly and use headlights.',
        icon: '🌫️'
      });
    }
    
    return alerts;
  } catch (err) {
    // Return empty array if weather data cannot be retrieved
    return [];
  }
}