// Initialize Parse
Parse.initialize('5i1CFIDqU3wQ6SKcJ6EF1iJnlIt8loChwGOJa7po', 'GWvzC5pKH2Ka7rgizcRPUqf6xwKuGrZlPE0MC9Uk');
Parse.serverURL = 'https://parseapi.back4app.com';

let currentUser = null;

const dealerTypes = [
 { name: 'Type 1', cost: 100, earnings: 5 },
 { name: 'Type 2', cost: 200, earnings: 10 },
 { name: 'Type 3', cost: 300, earnings: 20 },
 { name: 'Type 4', cost: 400, earnings: 30 },
 { name: 'Type 5', cost: 500, earnings: 50 },
];

// Create a temporary user if it doesn’t exist
function createTempUser() {
 const query = new Parse.Query(Parse.User);
 query.equalTo('username', 'test');
 query.first().then((existingUser) => {
 if (!existingUser) {
 const user = new Parse.User();
 user.set('username', 'test');
 user.set('password', 'test');
 user.set('email', 'test@test.com');

 user.signUp().then((user) => {
 console.log('Temporary user created successfully');
 }).catch((error) => {
 console.log('Error creating temporary user: ' + error.message);
 });
 }
 }).catch((error) => {
 console.log('Error querying for temporary user: ' + error.message);
 });
}

createTempUser();

// Event Listeners for buttons
document.getElementById('register-button').addEventListener('click', registerUser);
document.getElementById('login-button').addEventListener('click', loginUser);

function registerUser() {
 const username = document.getElementById('username').value;
 const password = document.getElementById('password').value;
 const email = document.getElementById('email').value;

 const user = new Parse.User();
 user.set('username', username);
 user.set('password', password);
 user.set('email', email);

 user.signUp().then((user) => {
 alert('User signed up successfully');
 }).catch((error) => {
 alert('Error: ' + error.message);
 });
}

function loginUser() {
 const username = document.getElementById('username').value;
 const password = document.getElementById('password').value;

 console.log('Attempting to log in with', { username, password });

 Parse.User.logIn(username, password).then((user) => {
 console.log('Login successful:', user);
 currentUser = user;
 showLandingPage();
 }).catch((error) => {
 console.log('Login error:', error);
 alert('Error: ' + error.message);
 });
}

function showLandingPage() {
 const loginRegisterElem = document.getElementById('login-register');
 const landingPageElem = document.getElementById('landing-page');
 const playerNameElem = document.getElementById('player-name');

 console.log('Elements before navigating to landing page:', {
 loginRegisterElem,
 landingPageElem,
 playerNameElem
 });

 if (loginRegisterElem && landingPageElem && playerNameElem) {
 console.log('Navigating to the landing page');
 loginRegisterElem.style.display = 'none';
 landingPageElem.style.display = 'block';
 playerNameElem.textContent = currentUser.getUsername();
 updateBalance();
 } else {
 console.error('One or more elements not found:', {
 loginRegisterElem,
 landingPageElem,
 playerNameElem
 });
 }
}

function showGame() {
 const landingPageElem = document.getElementById('landing-page');
 const gameElem = document.getElementById('game');
 const playerNameGameElem = document.getElementById('player-name-game');

 console.log('Elements before navigating to game page:', {
 landingPageElem,
 gameElem,
 playerNameGameElem
 });

 if (landingPageElem && gameElem && playerNameGameElem) {
 console.log('Navigating to the game page');
 landingPageElem.style.display = 'none';
 gameElem.style.display = 'block';
 playerNameGameElem.textContent = currentUser.getUsername();
 updateBalance();
 updateDealers();
 initializeMap();
 } else {
 console.error('One or more elements not found:', {
 landingPageElem,
 gameElem,
 playerNameGameElem
 });
 }
}

function logout() {
 Parse.User.logOut().then(() => {
 currentUser = null;
 document.getElementById('login-register').style.display = 'block';
 document.getElementById('landing-page').style.display = 'none';
 document.getElementById('game').style.display = 'none';
 console.log('User logged out successfully');
 });
}

function initializeMap() {
 map = L.map('map').setView([0, 0], 2);
 L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
 attribution: '&copy; OpenStreetMap contributors'
 }).addTo(map);

 if (navigator.geolocation) {
 navigator.geolocation.getCurrentPosition((position) => {
 const pos = [position.coords.latitude, position.coords.longitude];
 map.setView(pos, 12);

 L.marker(pos, { icon: L.divIcon({ className: 'dealer-icon' }) }).addTo(map)
 .bindPopup('Your Location')
 .openPopup();
 console.log('User location set on map:', pos);
 });
 } else {
 alert('Geolocation is not supported by this browser');
 }

 // Initialize Live Query
 const liveQueryClient = new Parse.LiveQueryClient({
 applicationId: '5i1CFIDqU3wQ6SKcJ6EF1iJnlIt8loChwGOJa7po',
 serverURL: 'wss://multiplayergamebackend.b4a.app',
 javascriptKey: 'GWvzC5pKH2Ka7rgizcRPUqf6xwKuGrZlPE0MC9Uk'
 });
 liveQueryClient.open();

 const query = new Parse.Query('MapMarker');
 const subscription = query.subscribe();
 subscription.on('create', (marker) => {
 const location = marker.get('location');
 addMarker(location.latitude, location.longitude);
 console.log('New marker added:', location);
 });
}

function addMarker(lat, lng) {
 L.marker([lat, lng]).addTo(map);
 console.log('Marker added at:', { lat, lng });
}

