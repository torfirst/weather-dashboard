const apiKey = '2cbc2508908e0608c001575848ce5c4b';
var searchBtnEl = document.getElementById('search-button');
var searchInput = document.getElementById('search-input');
var currentWeatherEl = document.getElementById('current-weather');
var forecastEl = document.getElementById('five-day');
var recentSearchEl = document.getElementById('recent-search');

// Function to create a div element with current weather details
function generateCurrentWeather(cityName, date, icon, maxTemp, wind, humidity) {
    const currentWeatherDiv = document.createElement('div');
    currentWeatherDiv.className = 'display-current';

    const dateHeading = document.createElement('h3');
    dateHeading.textContent = `${cityName} (${date})`;
    currentWeatherDiv.append(dateHeading);

    const detailsList = document.createElement('ul');

    // Weather Icon
    const weatherIconItem = document.createElement('li');
    const iconUrl = `https://openweathermap.org/img/wn/${icon}.png`;
    const iconImage = document.createElement('img');
    iconImage.src = iconUrl;
    iconImage.alt = 'Weather Icon';
    weatherIconItem.append(iconImage);
    detailsList.append(weatherIconItem);

    // Max Temperature
    const maxTempItem = document.createElement('li');
    maxTempItem.textContent = `Max Temperature: ${maxTemp}°F`;
    detailsList.append(maxTempItem);

    // Wind
    const windItem = document.createElement('li');
    windItem.textContent = `Wind: ${wind} mph`;
    detailsList.append(windItem);

    // Humidity
    const humidityItem = document.createElement('li');
    humidityItem.textContent = `Humidity: ${humidity}%`;
    detailsList.append(humidityItem);

    currentWeatherDiv.append(detailsList);

    // Append currentWeatherDiv to the currentWeatherEl 
    currentWeatherEl.append(currentWeatherDiv);
}

// Function to create a div element with forecast details
function generateForecast(date, icon, maxTemp, wind, humidity) {
    const forecastDiv = document.createElement('div');
    forecastDiv.className = 'day-box';

    const dateHeading = document.createElement('h3');
    dateHeading.textContent = date;
    forecastDiv.append(dateHeading);

    const detailsList = document.createElement('ul');

    // Weather Icon
    const weatherIconItem = document.createElement('li');
    const iconUrl = `https://openweathermap.org/img/wn/${icon}.png`;
    const iconImage = document.createElement('img');
    iconImage.src = iconUrl;
    iconImage.alt = 'Weather Icon';
    weatherIconItem.append(iconImage);
    detailsList.append(weatherIconItem);

    // Max Temperature
    const maxTempItem = document.createElement('li');
    maxTempItem.textContent = `Max Temperature: ${maxTemp}°F`;
    detailsList.append(maxTempItem);

    // Wind
    const windItem = document.createElement('li');
    windItem.textContent = `Wind: ${wind} m/s`;
    detailsList.append(windItem);

    // Humidity
    const humidityItem = document.createElement('li');
    humidityItem.textContent = `Humidity: ${humidity}%`;
    detailsList.append(humidityItem);

    forecastDiv.append(detailsList);
    forecastEl.append(forecastDiv);
    return forecastDiv;
}
// Function to save search to local storage
function saveSearchToLocalStorage(searchTerm) {
    // Check if there is already a search history in local storage
    let searchHistory = JSON.parse(localStorage.getItem('searchHistory')) || [];

    // Add the current search term to the search history array
    searchHistory.push(searchTerm);

    // Save the updated search history back to local storage
    localStorage.setItem('searchHistory', JSON.stringify(searchHistory));
}

// Function to display search history
function displaySearchHistory() {
    // Retrieve search history from local storage
    const searchHistory = JSON.parse(localStorage.getItem('searchHistory')) || [];

    // Display search history in some element on your page
    // For example, you can create a list and append it to a container element
    recentSearchEl.innerHTML = '';

    const historyList = document.createElement('ul');
    searchHistory.forEach(searchTerm => {
        const listItem = document.createElement('li');
        listItem.textContent = searchTerm;
        historyList.appendChild(listItem);
    });

    recentSearchEl.appendChild(historyList);
}

function callAPI(event) {
    event.preventDefault()

    fetch(`http://api.openweathermap.org/data/2.5/forecast?q=${searchInput.value}&appid=${apiKey}&units=imperial`)
        .then(function (response) {
            return response.json();
        })
        .then(function (data) {
            console.log(data);

            currentWeatherEl.innerHTML = '';
            // Map function creates a new array containing the extracted date part (entry.dt_txt.split(' ')[0]) from each entry's dt_txt property in the data.list array
            const datesArray = data.list.map(entry => entry.dt_txt.split(' ')[0]);
            // Set object automatically removes duplicate values and creates a new set from datesArray. Spread operator (...) converts the set back into an array.
            const uniqueDatesArray = [...new Set(datesArray)];

            // Takes today's date (first date from the array)
            const todaysDate = uniqueDatesArray[0];

            // Filter function creates a new array (currentWeather) containing only the entries whose date matches today's date.
            const currentWeather = data.list.filter(entry => entry.dt_txt.split(' ')[0] === todaysDate);

            const cityName = data.city.name;

            // Sort the currentWeather array by max temperature in descending order
            currentWeather.sort((a, b) => b.main.temp_max - a.main.temp_max);
            // Retrieve the entry with the highest max temperature
            const highestMaxTempEntry = currentWeather[0];

            // Extract information from the highest max temperature entry
            const date = highestMaxTempEntry.dt_txt.split(' ')[0];
            const icon = highestMaxTempEntry.weather[0].icon;
            const maxTemp = highestMaxTempEntry.main.temp_max;
            const wind = highestMaxTempEntry.wind.speed;
            const humidity = highestMaxTempEntry.main.humidity;


            // Create a div element for today's forecast
            const currentWeatherDiv = generateCurrentWeather(cityName, date, icon, maxTemp, wind, humidity);


            forecastEl.innerHTML = '';
            var fiveDayTitle = document.createElement('h3');
            fiveDayTitle.textContent = '5-Day Forecast:';
            forecastEl.append(fiveDayTitle);

            // Skip the first date and loop through the rest
            for (let i = 1; i < uniqueDatesArray.length; i++) {
                const remainingDays = uniqueDatesArray[i];

                // Filter entries for the remaining dates
                const fiveDayForecast = data.list.filter(entry => entry.dt_txt.split(' ')[0] === remainingDays);
                // Create a div element for the next 5 days forecast

                const fiveDaysWeatherDiv = document.createElement('div');
                fiveDaysWeatherDiv.className = 'five-days-forecast';

                // Sort the fiveDayForecast array by max temperature in descending order
                fiveDayForecast.sort((a, b) => b.main.temp_max - a.main.temp_max);

                // Retrieve the entry with the highest max temperature
                const highestMaxTempEntry = fiveDayForecast[0];

                // Extract information from the highest max temperature entry
                const date = highestMaxTempEntry.dt_txt.split(' ')[0];
                const icon = highestMaxTempEntry.weather[0].icon;
                const maxTemp = highestMaxTempEntry.main.temp_max;
                const wind = highestMaxTempEntry.wind.speed;
                const humidity = highestMaxTempEntry.main.humidity;

                // Create a div element for the day's forecast
                const forecastDiv = generateForecast(date, icon, maxTemp, wind, humidity);

                // Append the day div to the fiveDaysWeatherDiv
                fiveDaysWeatherDiv.append(forecastDiv);


                // Append the day div to forecastEl
                forecastEl.append(fiveDaysWeatherDiv);
            }
            // Save the search to local storage
            saveSearchToLocalStorage(cityName);

            // Retrieve and display search history
            displaySearchHistory();
        })
        .catch(error => {
            console.error('Error:', error.message);
        });

}

searchBtnEl.addEventListener("click", callAPI);