/**
 * PawPal Home Page - JavaScript
 * Handles user authentication, pets management, and calendar functionality
 */

// Initialize auth
let auth = new PawPalAuth({
  storageKey: 'example_app_user',
  usersKey: 'example_app_users'
});

// Check if user is logged in
const currentUser = auth.getCurrentUser();
if (!currentUser) {
  // Redirect to login if not authenticated
  window.location.href = 'modular-login.html';
} else {
  // Display user's first name
  const firstName = currentUser.name.split(' ')[0];
  document.getElementById('userFirstName').textContent = firstName;
  
  // Load user's pets
  loadUserPets();
  
  // Initialize calendar
  initCalendar();
}

// Logout function
async function handleLogout() {
  const result = await auth.logout();
  if (result.success) {
    window.location.href = 'modular-login.html';
  }
}

// ==================== PETS MANAGEMENT ====================

function loadUserPets() {
  const petsContainer = document.getElementById('petsContainer');
  
  // Get pets from localStorage (using user's email as key)
  const userPetsKey = `pawpal_pets_${currentUser.email}`;
  const petsData = localStorage.getItem(userPetsKey);
  const pets = petsData ? JSON.parse(petsData) : [];

  if (pets.length === 0) {
    petsContainer.innerHTML = `
      <div class="no-pets">
        <p>No pets added yet. Click "Add New Pet" to get started!</p>
      </div>
    `;
    return;
  }

  // Render pets
  const petsList = document.createElement('ul');
  petsList.className = 'pets-list';
  
  pets.forEach(pet => {
    const petItem = document.createElement('li');
    petItem.className = 'pet-item';
    
    const icon = pet.type === 'dog' ? '🐕' : pet.type === 'cat' ? '🐈' : '🐾';
    
    petItem.innerHTML = `
      <div class="pet-icon">${icon}</div>
      <div class="pet-info">
        <p class="pet-name">${pet.name}</p>
        <p class="pet-details">${pet.type} • ${pet.age} ${pet.age === 1 ? 'year' : 'years'} old${pet.notes ? ' • ' + pet.notes : ''}</p>
      </div>
    `;
    
    petsList.appendChild(petItem);
  });
  
  petsContainer.innerHTML = '';
  petsContainer.appendChild(petsList);
}

function addNewPet() {
  const name = prompt('Enter pet name:');
  if (!name) return;
  
  const type = prompt('Enter pet type (dog/cat/other):')?.toLowerCase() || 'other';
  const age = parseInt(prompt('Enter pet age:') || '0');
  const notes = prompt('Any special notes? (optional)') || '';

  const userPetsKey = `pawpal_pets_${currentUser.email}`;
  const petsData = localStorage.getItem(userPetsKey);
  const pets = petsData ? JSON.parse(petsData) : [];

  pets.push({
    id: Date.now(),
    name,
    type,
    age,
    notes,
    createdAt: new Date().toISOString()
  });

  localStorage.setItem(userPetsKey, JSON.stringify(pets));
  loadUserPets();
  auth.showMessage(`${name} has been added!`, 'success');
}

// ==================== CALENDAR ====================

let currentDate = new Date();

function initCalendar() {
  renderCalendar();
}

function renderCalendar() {
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  
  // Update header
  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'];
  document.getElementById('currentMonth').textContent = `${monthNames[month]} ${year}`;
  
  // Get calendar grid
  const calendarGrid = document.getElementById('calendarGrid');
  calendarGrid.innerHTML = '';
  
  // Add day headers
  const dayHeaders = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  dayHeaders.forEach(day => {
    const header = document.createElement('div');
    header.className = 'calendar-day-header';
    header.textContent = day;
    calendarGrid.appendChild(header);
  });
  
  // Get first day of month and number of days
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysInPrevMonth = new Date(year, month, 0).getDate();
  
  // Get today's date for highlighting
  const today = new Date();
  const isCurrentMonth = today.getFullYear() === year && today.getMonth() === month;
  const todayDate = today.getDate();
  
  // Add days from previous month
  for (let i = firstDay - 1; i >= 0; i--) {
    const day = document.createElement('div');
    day.className = 'calendar-day other-month';
    day.textContent = daysInPrevMonth - i;
    calendarGrid.appendChild(day);
  }
  
  // Add days of current month
  for (let i = 1; i <= daysInMonth; i++) {
    const day = document.createElement('div');
    day.className = 'calendar-day';
    day.textContent = i;
    
    if (isCurrentMonth && i === todayDate) {
      day.classList.add('today');
    }
    
    calendarGrid.appendChild(day);
  }
  
  // Add days from next month to fill grid
  const totalCells = calendarGrid.children.length - 7; // Subtract day headers
  const remainingCells = 35 - totalCells; // 5 weeks * 7 days
  for (let i = 1; i <= remainingCells; i++) {
    const day = document.createElement('div');
    day.className = 'calendar-day other-month';
    day.textContent = i;
    calendarGrid.appendChild(day);
  }
}

function previousMonth() {
  currentDate.setMonth(currentDate.getMonth() - 1);
  renderCalendar();
}

function nextMonth() {
  currentDate.setMonth(currentDate.getMonth() + 1);
  renderCalendar();
}
