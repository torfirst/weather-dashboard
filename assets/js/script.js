const apiKey = '2cbc2508908e0608c001575848ce5c4b';
var searchBtnEl = document.getElementById('search-button');
var searchInput = document.getElementById('search-input');
var currentWeatherEl = document.getElementById('current-weather');
var forecastEl = document.getElementById('five-day');
var recentSearchEl = document.getElementById('recent-search');

// Function to create a div element with current weather details
function generateCurrentWeather(cityName, date, icon, temp, wind, humidity) {
    const currentWeatherDiv = document.createElement('div');
    currentWeatherDiv.className = 'display-current';

    const dateHeading = document.createElement('h2');
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

    // Temperature
    const tempItem = document.createElement('li');
    tempItem.textContent = `Max Temperature: ${temp}° F`;
    detailsList.append(tempItem);

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

    const dateHeading = document.createElement('h4');
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
    maxTempItem.textContent = `Temp: ${maxTemp}° F`;
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

function convertUnixToDate(unixTimestamp) {
    const date = new Date(unixTimestamp * 1000);

    // Get the various components of the date
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are zero-based, so add 1
    const day = String(date.getDate()).padStart(2, '0');

    // Format the date as a string
    const formattedDate = `${year}-${month}-${day}`;

    return formattedDate;
}

// Function to save search to local storage
function saveSearchToLocalStorage(searchTerm) {
    // Check if there is already a search history in local storage
    let searchHistory = JSON.parse(localStorage.getItem('searchHistory')) || [];

    // Check for duplicates before adding the current search term
    if (!searchHistory.includes(searchTerm)) {
        // Add the current search term to the search history array
        searchHistory.push(searchTerm);

        // Save the updated search history back to local storage
        localStorage.setItem('searchHistory', JSON.stringify(searchHistory));
    }
}

// Function to display search history as clickable buttons
function displaySearchHistory() {
    // Retrieve search history from local storage
    const searchHistory = JSON.parse(localStorage.getItem('searchHistory')) || [];
    recentSearchEl.innerHTML = '';

    const historyList = document.createElement('ul');

    // Reverse the searchHistory array so that the most recent result is on top
    searchHistory.reverse();

    searchHistory.forEach(searchTerm => {
        const listItem = document.createElement('li');
        const button = document.createElement('button');
        button.className = 'history-button'

        // Set button text to the search term
        button.textContent = searchTerm;

        // Attach a click event listener to each button
        button.addEventListener('click', function (event) { 
            callAPI(event, searchTerm);
        });

        // Append the button to the list item
        listItem.appendChild(button);

        // Append the list item to the list
        historyList.appendChild(listItem);
    });

    recentSearchEl.appendChild(historyList);
}

function callAPI(event, searchTerm) {
    
    event.preventDefault()
if (searchTerm) {
    searchInput.value = searchTerm;
}

    fetch(`https://api.openweathermap.org/data/2.5/weather?q=${searchInput.value}&appid=${apiKey}&timezone=America/Chicago&units=imperial`)
        .then(function (response) {
            return response.json();
        })
        .then(function (data) {
            console.log(data);

            currentWeatherEl.innerHTML = '';

            const cityName = data.name;
            const date = convertUnixToDate(data.dt);
            const icon = data.weather[0].icon;
            const temp = data.main.temp;
            const wind = data.wind.speed;
            const humidity = data.main.humidity;

            console.log(date);
            // Create a div element for today's forecast
            const currentWeatherDiv = generateCurrentWeather(cityName, date, icon, temp, wind, humidity);

            fetch(`http://api.openweathermap.org/data/2.5/forecast?q=${searchInput.value}&appid=${apiKey}&units=imperial&timezone=America/Chicago`)
                .then(function (response) {
                    return response.json();
                })
                .then(function (data) {
                    console.log(data);

                    // // Map function creates a new array containing the extracted date part (entry.dt_txt.split(' ')[0]) from each entry's dt_txt property in the data.list array
                    const datesArray = data.list.map(entry => entry.dt_txt.split(' ')[0]);
                    // // Set object automatically removes duplicate values and creates a new set from datesArray. Spread operator (...) converts the set back into an array.
                    const uniqueDatesArray = [...new Set(datesArray)];

                    forecastEl.innerHTML = '';
                    var fiveDayTitleEl = document.createElement('div');
                    fiveDayTitleEl.className = ('five-day-title');
                    var fiveDayTitle = document.createElement('h3');
                    fiveDayTitle.textContent = '5-Day Forecast:';
                    fiveDayTitleEl.append(fiveDayTitle);
                    forecastEl.append(fiveDayTitleEl);

                    // Create a div element for the next 5 days forecast
                    const forecastContainer = document.createElement('div');
                    forecastContainer.className = 'five-days-forecast';

                    // Skip the first date and loop through the rest
                    for (let i = 0; i < uniqueDatesArray.length; i++) {
                        const remainingDays = uniqueDatesArray[i];

                        // Filter entries for the remaining dates
                        const fiveDayForecast = data.list.filter(entry => entry.dt_txt.split(' ')[0] === remainingDays);


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

                        forecastContainer.append(forecastDiv);
                    }

                    forecastEl.append(forecastContainer);

                    // Save the search to local storage
                    saveSearchToLocalStorage(cityName);

                    // Retrieve and display search history
                    displaySearchHistory();
                })
                .catch(error => {
                    console.error('Error:', error.message);
                });
        })
}

// Call displaySearchHistory after the page has loaded to initially populate the search history
document.addEventListener('DOMContentLoaded', function () {
    displaySearchHistory();
});

searchBtnEl.addEventListener("click", callAPI);

