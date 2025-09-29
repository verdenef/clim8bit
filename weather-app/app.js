const searchBtn = document.getElementById("search-btn");
const cityInput = document.getElementById("city-input");
const darkModeToggle = document.getElementById("dark-mode-toggle");

// Search handler
searchBtn.addEventListener("click", async () => {
  const city = cityInput.value.trim();
  if (!city) return;

  try {
    const data = await getWeather(city);
    displayWeather(data);
  } catch (err) {
    displayError("City not found. Try again.");
  }
});

// Dark mode toggle
darkModeToggle.addEventListener("click", () => {
  document.body.classList.toggle("dark");
  darkModeToggle.textContent = document.body.classList.contains("dark") ? "☀️" : "🌙";
});
