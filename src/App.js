import { useState } from "react";
import "./App.css";


/**
 * Weather Now — Open-Meteo version
 * - Type a city name -> we geocode (Open-Meteo Geocoding API)
 * - Then fetch current weather -> show a clean card
 * - No API key needed
 */

export default function App() {
  const [city, setCity] = useState("");
  const [loading, setLoading] = useState(false);
  const [weather, setWeather] = useState(null); // { temp, windspeed, winddir, code, city, country }
  const [error, setError] = useState("");

  // Map Open-Meteo weather codes to a simple emoji + label
  const CODE_MAP = {
    0: { icon: "☀", text: "Clear sky" },
    1: { icon: "🌤", text: "Mainly clear" },
    2: { icon: "⛅", text: "Partly cloudy" },
    3: { icon: "☁", text: "Overcast" },
    45: { icon: "🌫", text: "Fog" },
    48: { icon: "🌫", text: "Depositing rime fog" },
    51: { icon: "🌦", text: "Light drizzle" },
    53: { icon: "🌦", text: "Moderate drizzle" },
    55: { icon: "🌦", text: "Dense drizzle" },
    61: { icon: "🌧", text: "Slight rain" },
    63: { icon: "🌧", text: "Moderate rain" },
    65: { icon: "🌧", text: "Heavy rain" },
    71: { icon: "🌨", text: "Slight snow" },
    73: { icon: "🌨", text: "Moderate snow" },
    75: { icon: "🌨", text: "Heavy snow" },
    77: { icon: "❄", text: "Snow grains" },
    80: { icon: "🌦", text: "Rain showers" },
    81: { icon: "🌧", text: "Rain showers" },
    82: { icon: "⛈", text: "Violent rain showers" },
    85: { icon: "🌨", text: "Snow showers" },
    86: { icon: "🌨", text: "Heavy snow showers" },
    95: { icon: "⛈", text: "Thunderstorm" },
    96: { icon: "⛈", text: "Thunderstorm w/ hail" },
    99: { icon: "⛈", text: "Thunderstorm w/ heavy hail" }
  };

  async function fetchWeather() {
    if (!city.trim()) return;
    setLoading(true);
    setError("");
    setWeather(null);

    try {
      // 1) Geocode city -> lat/lon (Open-Meteo geocoding, no key)
      const geoRes = await fetch(
        `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(
          city
        )}&count=1`
      );
      if (!geoRes.ok) throw new Error("Geocoding failed");
      const geoData = await geoRes.json();

      if (!geoData.results || geoData.results.length === 0) {
        throw new Error("City not found");
      }

      const place = geoData.results[0];
      const { latitude, longitude, name, country_code} = place;

      // 2) Fetch current weather
      const meteoRes = await fetch(
       ` https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true`);
      if (!meteoRes.ok) throw new Error("Weather fetch failed");
      const meteo = await meteoRes.json();

      const cw = meteo.current_weather;
      setWeather({
        temp: cw.temperature, // °C by default
        windspeed: cw.windspeed, // km/h
        winddir: cw.winddirection, // degree
        time: cw.time,
        city: name,
        country: country_code
      });
    } catch (e) {
      setError(e.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  const onKeyDown = (e) => {
    if (e.key === "Enter") fetchWeather();
  };

  const w = weather ? CODE_MAP[weather.code] || { icon: "🌥", text: "Weather" } : null;

  return (
    
    <div className="app">
      <div className="card">
        {/* Search */}
        <div className="search">
          <input
            type="text"
            placeholder="Enter city..."
            value={city}
            onChange={(e) => setCity(e.target.value)}
            onKeyDown={onKeyDown}
          />
          <button onClick={fetchWeather} aria-label="Search">🔍</button>
        </div>

        {/* States */}
        {loading && <p className="muted">Loading…</p>}
        {error && <p className="error">{error}</p>}

        {/* Weather block */}
        {weather && (
          <>
            <div className="icon" aria-hidden="true">{w.icon}</div>
            <div className="temp">{Math.round(weather.temp)}°C</div>
            <div className="place">
              {weather.city} {weather.country ? `• ${weather.country}` : ""}
            </div>
            {weather.time && (
              <p className="time">🕒 {new Date(weather.time).toLocaleString()}</p>
            )}
            
            <div className="row">
              <div className="pill">
                <span className="label">Condition</span>
                <span className="value">{w.text}</span>
              </div>
              <div className="pill">
                <span className="label">Wind</span>
                <span className="value">{weather.windspeed} km/h</span>
              </div>
              <div className="pill">
                <span className="label">Direction</span>
                <span className="value">{weather.winddir}°</span>
              </div>
              
            </div>
          </>
        )}

        {!loading && !error && !weather && (
          <p className="muted">Search any city to see current weather.</p>
        )}
      </div>
    </div>
    
  );
}