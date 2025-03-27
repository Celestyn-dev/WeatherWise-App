const apiKey = 'a43f626ab3ba81e60f039401f3918d44';
const apiUrl = 'https://api.openweathermap.org/data/2.5/weather?units=metric&q=';

const searchBox = document.getElementById('cityInput');
const searchBtn = document.getElementById('searchBtn');

const temperature = document.getElementById('temperature');
const cityName = document.getElementById('cityName');
const description = document.getElementById('description');
const humidity = document.getElementById('humidity');
const windSpeed = document.getElementById('windSpeed');
const conditionIcon = document.getElementById('conditionIcon');

const darkToggle = document.getElementById('darkToggle');
const favoritesList = document.getElementById('favoritesList');

let favoriteCities = JSON.parse(localStorage.getItem('favoriteCities')) || [];

// Function to update background based on weather and time
function updateBackground(condition, iconCode) {
  document.body.className = '';
  const isNight = iconCode.includes('n');

  switch (condition.toLowerCase()) {
    case 'clear':
      document.body.classList.add(isNight ? 'clear-night' : 'clear-day');
      break;
    case 'clouds':
      document.body.classList.add('clouds');
      break;
    case 'rain':
      document.body.classList.add('rain');
      break;
    case 'drizzle':
      document.body.classList.add('drizzle');
      break;
    case 'snow':
      document.body.classList.add('snow');
      break;
    case 'mist':
    case 'fog':
    case 'haze':
      document.body.classList.add('mist');
      break;
    case 'thunderstorm':
      document.body.classList.add('thunderstorm');
      break;
    default:
      document.body.classList.add('default');
      break;
  }
}

// Maps icon codes to local image names
function getImageForCondition(iconCode) {
  if (iconCode.includes('01')) return 'clear';
  if (iconCode.includes('02') || iconCode.includes('03') || iconCode.includes('04')) return 'clouds';
  if (iconCode.includes('09')) return 'drizzle';
  if (iconCode.includes('10')) return 'rain';
  if (iconCode.includes('11')) return 'thunderstorm';
  if (iconCode.includes('13')) return 'snow';
  if (iconCode.includes('50')) return 'mist';
  return 'clear';
}

// Main weather fetch function
async function getWeather(city) {
  try {
    const response = await fetch(apiUrl + city + `&appid=${apiKey}`);
    if (!response.ok) throw new Error('City not found');

    const data = await response.json();

    // Display weather info
    cityName.textContent = data.name;
    temperature.textContent = Math.round(data.main.temp) + '°C';
    description.textContent = data.weather[0].description;
    humidity.textContent = data.main.humidity + '%';            // ✔️ Correct format
    windSpeed.textContent = data.wind.speed + ' km/h';          // ✔️ Correct format

    const iconCode = data.weather[0].icon;
    const mainCondition = data.weather[0].main;

    conditionIcon.src = `images/${getImageForCondition(iconCode)}.png`;
    updateBackground(mainCondition, iconCode);

    sessionStorage.setItem('lastCity', data.name);

    if (!favoriteCities.includes(data.name)) {
      favoriteCities.push(data.name);
      updateFavorites();
    }

  } catch (error) {
    alert('City not found. Please try another.');
  }
}

// Update localStorage and render favorites
function updateFavorites() {
  localStorage.setItem('favoriteCities', JSON.stringify(favoriteCities));
  renderFavorites();
}

// Show favorite buttons with remove option
function renderFavorites() {
  favoritesList.innerHTML = '';

  favoriteCities.forEach(city => {
    const cityItem = document.createElement('div');
    cityItem.classList.add('favorite-item');

    const cityBtn = document.createElement('button');
    cityBtn.textContent = city;
    cityBtn.classList.add('favorite-btn');
    cityBtn.addEventListener('click', () => getWeather(city));

    const removeBtn = document.createElement('span');
    removeBtn.textContent = '❌';
    removeBtn.classList.add('remove-btn');
    removeBtn.title = 'Remove';
    removeBtn.addEventListener('click', () => removeFavorite(city));

    cityItem.appendChild(cityBtn);
    cityItem.appendChild(removeBtn);
    favoritesList.appendChild(cityItem);
  });
}

// Remove favorite
function removeFavorite(city) {
  favoriteCities = favoriteCities.filter(item => item !== city);
  updateFavorites();
}

// Event listeners
searchBtn.addEventListener('click', () => {
  const city = searchBox.value.trim();
  if (city) {
    getWeather(city);
    searchBox.value = '';
  }
});

searchBox.addEventListener('keypress', function (e) {
  if (e.key === 'Enter') {
    searchBtn.click();
  }
});

darkToggle.addEventListener('click', () => {
  document.body.classList.toggle('dark-mode');
});

// On page load
window.addEventListener('DOMContentLoaded', () => {
  const lastCity = sessionStorage.getItem('lastCity');
  if (lastCity) getWeather(lastCity);
  renderFavorites();
});
