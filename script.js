const { useState, useEffect } = React;

// Weather App Component
function WeatherApp() {
    const [weather, setWeather] = useState(null);
    const [forecast, setForecast] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [city, setCity] = useState('');

    // Mock API key (replace with real OpenWeatherMap API key)
    const API_KEY = 'demo_key';
    const BASE_URL = 'https://api.openweathermap.org/data/2.5';

    // Mock weather data for demo
    const mockWeatherData = {
        name: 'Kuala Lumpur',
        main: {
            temp: 28,
            humidity: 75,
            pressure: 1013
        },
        weather: [{ description: 'Partly cloudy', icon: '02d' }],
        wind: { speed: 5.2 },
        visibility: 10000
    };

    const mockForecastData = [
        { day: 'Today', temp: 28, icon: '02d', description: 'Partly cloudy' },
        { day: 'Tomorrow', temp: 30, icon: '01d', description: 'Sunny' },
        { day: 'Wed', temp: 27, icon: '10d', description: 'Light rain' },
        { day: 'Thu', temp: 29, icon: '03d', description: 'Cloudy' },
        { day: 'Fri', temp: 31, icon: '01d', description: 'Sunny' }
    ];

    // Search weather function
    const searchWeather = async (searchCity) => {
        setLoading(true);
        setError('');
        
        try {
            // Simulate API call delay
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            // Use mock data for demo
            // In real implementation, you would fetch from OpenWeatherMap API:
            // const response = await fetch(`${BASE_URL}/weather?q=${searchCity}&appid=${API_KEY}&units=metric`);
            // const data = await response.json();
            
            setWeather(mockWeatherData);
            setForecast(mockForecastData);
            
        } catch (err) {
            setError('Failed to fetch weather data. Please try again.');
        } finally {
            setLoading(false);
        }
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
                                <span>Wind: {weather.wind.speed} m/s</span>
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