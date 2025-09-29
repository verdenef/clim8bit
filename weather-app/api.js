const API_KEY = "aebe7d4c03bacdb48fdc5f8181d3ebb4";
const BASE_URL = "https://api.openweathermap.org/data/2.5/weather";

async function getWeather(city) {
  try {
    const res = await fetch(
      `${BASE_URL}?q=${encodeURIComponent(city)}&appid=${API_KEY}&units=metric`
    );
    if (!res.ok) throw new Error("City not found");
    return await res.json();
  } catch (err) {
    throw err;
  }
}
