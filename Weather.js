// API Key-a5e30f35d5afcda82ef70e94ed418b8b
// API Key=fcefd28e64782b8665c3465be98e854e

// const apiKey = 'a5e30f35d5afcda82ef70e94ed418b8b'; 

const apiKey='fcefd28e64782b8665c3465be98e854e';
let isCelsius = true;

const cityInput = document.getElementById('cityInput');
const searchBtn = document.getElementById('searchBtn');
const locationBtn = document.getElementById('locationBtn');
const weatherContainer = document.getElementById('weatherContainer');
const forecastContainer = document.getElementById('forecastContainer');
const alertBox = document.getElementById('alertBox');
const recentDropdown = document.getElementById('recentDropdown');
const recentCitiesSelect = document.getElementById('recentCities');
const unitToggle = document.getElementById('unitToggle');

let recentCities = JSON.parse(localStorage.getItem('recentCities')) || [];

function showAlert(message) {
  alertBox.innerText = message;
  alertBox.classList.remove('hidden');
  setTimeout(() => alertBox.classList.add('hidden'), 4000);
}

function updateRecentDropdown() {
  if (recentCities.length === 0) {
    recentDropdown.classList.add('hidden');
    return;
  }
  recentDropdown.classList.remove('hidden');
  recentCitiesSelect.innerHTML = `<option disabled selected>Select a recent city</option>`;
  recentCities.forEach(city => {
    recentCitiesSelect.innerHTML += `<option value="${city}">${city}</option>`;
  });
}

function addRecentCity(city) {
  if (!recentCities.includes(city)) {
    recentCities.unshift(city);
    if (recentCities.length > 5) recentCities.pop();
    localStorage.setItem('recentCities', JSON.stringify(recentCities));
    updateRecentDropdown();
  }
}

function convertTemp(temp) {
  return isCelsius ? temp : (temp * 9/5) + 32;
}

function displayWeather(data) {
  const { name, weather, main, wind } = data;
  const iconUrl = `https://openweathermap.org/img/wn/${weather[0].icon}@2x.png`;
  const temp = Math.round(convertTemp(main.temp));
  const unit = isCelsius ? '°C' : '°F';


  // Temperature Alert
  if (main.temp > 40) {
    showAlert('⚠️ Extreme heat alert!');
  }

  weatherContainer.innerHTML = `
    <div class="bg-gray-300 p-4 rounded shadow text-center">
      <h2 class="text-xl font-bold mb-2">${name}</h2>
      <img src="${iconUrl}" alt="${weather[0].description}" class="mx-auto w-20" />
      <p class="text-lg font-bold">${temp}${unit}</p>
      <p class="capitalize text-gray-700">${weather[0].description}</p>
      <p class="text-sm text-gray-600">Humidity: ${main.humidity}%</p>
      <p class="text-sm text-gray-600">Wind: ${wind.speed} m/s</p>
    </div>
  `;
}

function displayForecast(forecastList) {
  forecastContainer.innerHTML = '';
  const dailyData = {};

  forecastList.forEach(entry => {
    const date = new Date(entry.dt_txt).toDateString();
    if (!dailyData[date]) {
      dailyData[date] = entry;
    }
  });

  Object.keys(dailyData).slice(0, 5).forEach(date => {
    const item = dailyData[date];
    const iconUrl = `https://openweathermap.org/img/wn/${item.weather[0].icon}@2x.png`;
    const temp = Math.round(convertTemp(item.main.temp));
    const unit = isCelsius ? '°C' : '°F';

    forecastContainer.innerHTML += `
      <div class="bg-gray-300 p-3 rounded shadow text-center">
        <p class="text-sm font-semibold">${new Date(item.dt_txt).toLocaleDateString()}</p>
        <img src="${iconUrl}" alt="${item.weather[0].description}" class="mx-auto w-14" />
        <p>${temp}${unit}</p>
        <p class="text-sm text-gray-600">💧 ${item.main.humidity}% | 💨 ${item.wind.speed} m/s</p>
      </div>
    `;
  });
}

async function fetchWeather(city) {
  if (!city) return showAlert("Please enter a city name.");
  try {
    const unit = isCelsius ? 'metric' : 'imperial';
    const res = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=${unit}`);
    const forecastRes = await fetch(`https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${apiKey}&units=${unit}`);

    if (!res.ok || !forecastRes.ok) throw new Error("City not found");

    const data = await res.json();
    const forecastData = await forecastRes.json();

    displayWeather(data);
    displayForecast(forecastData.list);
    addRecentCity(city);
  } catch (err) {
    showAlert(err.message);
  }
}

searchBtn.addEventListener('click', () => {
  const city = cityInput.value.trim();
  fetchWeather(city);
});

recentCitiesSelect.addEventListener('change', () => {
  fetchWeather(recentCitiesSelect.value);
});

locationBtn.addEventListener('click', () => {
  if (!navigator.geolocation) return showAlert("Geolocation not supported.");

  navigator.geolocation.getCurrentPosition(async position => {
    const { latitude, longitude } = position.coords;
    try {
      const unit = isCelsius ? 'metric' : 'imperial';
      const res = await fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${apiKey}&units=${unit}`);
      const forecastRes = await fetch(`https://api.openweathermap.org/data/2.5/forecast?lat=${latitude}&lon=${longitude}&appid=${apiKey}&units=${unit}`);

      if (!res.ok || !forecastRes.ok) throw new Error("Weather not found");

      const data = await res.json();
      const forecastData = await forecastRes.json();

      displayWeather(data);
      displayForecast(forecastData.list);
      addRecentCity(data.name);
    } catch (err) {
      showAlert(err.message);
    }
  });
});

unitToggle.addEventListener('click', () => {
  isCelsius = !isCelsius;
  const currentCity = cityInput.value || recentCities[0];
  if (currentCity) {
    fetchWeather(currentCity);
  }
});

updateRecentDropdown();
