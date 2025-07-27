const { useState, useEffect } = React;

// Weather App Component
function WeatherApp() {
    const [weather, setWeather] = useState(null);
    const [forecast, setForecast] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [city, setCity] = useState('');

    // OpenWeatherMap API configuration (will be used once API key is activated)
    // Get your free API key from: https://openweathermap.org/api
    // Replace 'YOUR_API_KEY_HERE' with your actual API key
    const API_KEY = 'YOUR_API_KEY_HERE';
    const BASE_URL = 'https://api.openweathermap.org/data/2.5';

    // Search weather function
    const searchWeather = async (searchCity) => {
        setLoading(true);
        setError('');
        
        try {
            // Try OpenWeatherMap API first
            const weatherResponse = await fetch(
                `${BASE_URL}/weather?q=${encodeURIComponent(searchCity)}&appid=${API_KEY}&units=metric`
            );
            
            if (weatherResponse.ok) {
                // OpenWeatherMap API is working
                const weatherData = await weatherResponse.json();
                
                // Fetch 5-day forecast
                const forecastResponse = await fetch(
                    `${BASE_URL}/forecast?q=${encodeURIComponent(searchCity)}&appid=${API_KEY}&units=metric`
                );
                
                if (forecastResponse.ok) {
                    const forecastData = await forecastResponse.json();
                    const dailyForecasts = processForecastData(forecastData.list);
                    setWeather(weatherData);
                    setForecast(dailyForecasts);
                } else {
                    throw new Error('Failed to fetch forecast data.');
                }
            } else if (weatherResponse.status === 401) {
                // API key not activated yet, use free alternative API
                await useFreeWeatherAPI(searchCity);
            } else if (weatherResponse.status === 404) {
                throw new Error('City not found. Please check the spelling and try again.');
            } else {
                throw new Error('Failed to fetch weather data. Please try again.');
            }
            
        } catch (err) {
            setError(err.message);
            setWeather(null);
            setForecast([]);
        } finally {
            setLoading(false);
        }
    };

    // Free weather API as fallback (no API key required)
    const useFreeWeatherAPI = async (searchCity) => {
        try {
            // Using wttr.in API (free, no API key required)
            const response = await fetch(`https://wttr.in/${encodeURIComponent(searchCity)}?format=j1`);
            
            if (!response.ok) {
                throw new Error('City not found. Please check the spelling and try again.');
            }

            const data = await response.json();
            
            // Transform wttr.in data to match our app's format
            const current = data.current_condition[0];
            const location = data.nearest_area[0];
            
            const weatherData = {
                name: location.areaName[0].value,
                main: {
                    temp: parseFloat(current.temp_C),
                    humidity: parseInt(current.humidity),
                    pressure: parseInt(current.pressure)
                },
                weather: [{ 
                    description: current.weatherDesc[0].value,
                    icon: getWeatherIconFromDescription(current.weatherDesc[0].value)
                }],
                wind: { 
                    speed: parseFloat(current.windspeedKmph) / 3.6 // Convert km/h to m/s
                },
                visibility: parseInt(current.visibility) * 1000 // Convert km to meters
            };

            // Create forecast data
            const forecastData = data.weather.slice(0, 5).map((day, index) => ({
                day: index === 0 ? 'Today' : new Date(day.date).toLocaleDateString('en-US', { weekday: 'short' }),
                temp: Math.round((parseFloat(day.hourly[0].tempC) + parseFloat(day.hourly[3].tempC)) / 2),
                icon: getWeatherIconFromDescription(day.hourly[0].weatherDesc[0].value),
                description: day.hourly[0].weatherDesc[0].value
            }));

            setWeather(weatherData);
            setForecast(forecastData);
            
        } catch (err) {
            throw new Error('Failed to fetch weather data. Please try again.');
        }
    };

    // Helper function to convert weather descriptions to icon codes
    const getWeatherIconFromDescription = (description) => {
        const desc = description.toLowerCase();
        if (desc.includes('sunny') || desc.includes('clear')) return '01d';
        if (desc.includes('cloudy')) return '03d';
        if (desc.includes('rain')) return '10d';
        if (desc.includes('snow')) return '13d';
        if (desc.includes('thunder')) return '11d';
        if (desc.includes('fog') || desc.includes('mist')) return '50d';
        return '02d'; // default to partly cloudy
    };

    // Process forecast data to get daily forecasts
    const processForecastData = (forecastList) => {
        const dailyData = {};
        
        forecastList.forEach(item => {
            const date = new Date(item.dt * 1000);
            const day = date.toLocaleDateString('en-US', { weekday: 'short' });
            
            if (!dailyData[day]) {
                dailyData[day] = {
                    day: day,
                    temp: Math.round(item.main.temp),
                    icon: item.weather[0].icon,
                    description: item.weather[0].description
                };
            }
        });

        return Object.values(dailyData).slice(0, 5);
    };

    // Handle search form submission
    const handleSearch = (e) => {
        e.preventDefault();
        if (city.trim()) {
            searchWeather(city);
        }
    };

    // Get weather icon based on OpenWeatherMap icon codes
    const getWeatherIcon = (iconCode) => {
        const iconMap = {
            '01d': 'fas fa-sun',
            '01n': 'fas fa-moon',
            '02d': 'fas fa-cloud-sun',
            '02n': 'fas fa-cloud-moon',
            '03d': 'fas fa-cloud',
            '03n': 'fas fa-cloud',
            '04d': 'fas fa-clouds',
            '04n': 'fas fa-clouds',
            '09d': 'fas fa-cloud-rain',
            '09n': 'fas fa-cloud-rain',
            '10d': 'fas fa-cloud-sun-rain',
            '10n': 'fas fa-cloud-moon-rain',
            '11d': 'fas fa-bolt',
            '11n': 'fas fa-bolt',
            '13d': 'fas fa-snowflake',
            '13n': 'fas fa-snowflake',
            '50d': 'fas fa-smog',
            '50n': 'fas fa-smog'
        };
        return iconMap[iconCode] || 'fas fa-cloud';
    };

    // Format temperature to whole number
    const formatTemperature = (temp) => {
        return Math.round(temp);
    };

    // Load default weather on component mount
    useEffect(() => {
        searchWeather('Kuala Lumpur');
    }, []);

    return (
        <div className="weather-app">
            <div className="header">
                <h1>Weather App</h1>
                <p>Get real-time weather information for any city</p>
            </div>

            <form onSubmit={handleSearch} className="search-container">
                <input
                    type="text"
                    className="search-input"
                    placeholder="Enter city name..."
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                />
                <button type="submit" className="search-btn">
                    <i className="fas fa-search"></i> Search
                </button>
            </form>

            {loading && (
                <div className="loading">
                    <i className="fas fa-spinner fa-spin"></i> Loading weather data...
                </div>
            )}

            {error && (
                <div className="error">
                    <i className="fas fa-exclamation-triangle"></i> {error}
                </div>
            )}

            {weather && !loading && (
                <div className="weather-container">
                    <div className="current-weather">
                        <div className="location">{weather.name}</div>
                        <div className="weather-info">
                            <div className="temperature">
                                {formatTemperature(weather.main.temp)}°C
                            </div>
                            <div className="weather-icon">
                                <i className={getWeatherIcon(weather.weather[0].icon)}></i>
                            </div>
                        </div>
                        <div className="description">
                            {weather.weather[0].description}
                        </div>
                        <div className="weather-details">
                            <div className="detail-item">
                                <i className="fas fa-tint detail-icon"></i>
                                <span>Humidity: {weather.main.humidity}%</span>
                            </div>
                            <div className="detail-item">
                                <i className="fas fa-wind detail-icon"></i>
                                <span>Wind: {weather.wind.speed.toFixed(1)} m/s</span>
                            </div>
                            <div className="detail-item">
                                <i className="fas fa-compress-alt detail-icon"></i>
                                <span>Pressure: {weather.main.pressure} hPa</span>
                            </div>
                            <div className="detail-item">
                                <i className="fas fa-eye detail-icon"></i>
                                <span>Visibility: {weather.visibility / 1000} km</span>
                            </div>
                        </div>
                    </div>

                    <div className="forecast">
                        <h3>5-Day Forecast</h3>
                        <div className="forecast-items">
                            {forecast.map((day, index) => (
                                <div key={index} className="forecast-item">
                                    <div className="forecast-day">{day.day}</div>
                                    <div className="forecast-icon">
                                        <i className={getWeatherIcon(day.icon)}></i>
                                    </div>
                                    <div className="forecast-temp">{day.temp}°C</div>
                                    <div className="forecast-desc">{day.description}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

// Render the app
ReactDOM.render(<WeatherApp />, document.getElementById('root'));
