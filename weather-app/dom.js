function displayWeather(data) {
  document.getElementById("error-message").style.display = "none";
  document.getElementById("city-name").textContent = data.name;
  document.getElementById("description").textContent = data.weather[0].description;
  document.getElementById("temperature").textContent = `${data.main.temp}°C`;
  document.getElementById("humidity").textContent = `Humidity: ${data.main.humidity}%`;
  document.getElementById("wind").textContent = `Wind: ${data.wind.speed} m/s`;

  const iconCode = data.weather[0].icon;
  document.querySelector("#weather-icon img").src =
    `https://openweathermap.org/img/wn/${iconCode}@2x.png`;
}

function displayError(message) {
  const errorEl = document.getElementById("error-message");
  errorEl.textContent = message;
  errorEl.style.display = "block";
}
