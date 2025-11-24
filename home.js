/**
 * PawPal Home Page - JavaScript
 * Handles user authentication, pets management, and calendar functionality
 */

// Initialize auth with API mode to connect to Flask backend
let auth = new PawPalAuth({
  storageKey: 'example_app_user',
  usersKey: 'example_app_users',
  apiEndpoint: 'http://localhost:5001'
});

// Calendar state
let currentDate = new Date();

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
  
  // Load user's pets (async)
  loadUserPets().catch(err => {
    console.error('Failed to load pets:', err);
    const petsContainer = document.getElementById('petsContainer');
    if (petsContainer) {
      petsContainer.innerHTML = '<p style="color: red;">Failed to load pets. Make sure Flask is running.</p>';
    }
  });
}

// Logout function
async function handleLogout() {
  const result = await auth.logout();
  if (result.success) {
    window.location.href = 'modular-login.html';
  }
}

// ==================== PETS MANAGEMENT ====================

async function loadUserPets() {
  const petsContainer = document.getElementById('petsContainer');
  const pets = await getUserPets();

  if (pets.length === 0) {
    petsContainer.innerHTML = `
      <div class="no-pets">
        <p>No pets added yet. Click "Add New Pet" to get started!</p>
      </div>
    `;
    return;
  }

  const petsList = document.createElement('ul');
  petsList.className = 'pets-list';

  pets.forEach(pet => {
    const petItem = document.createElement('li');
    petItem.className = 'pet-item';
    petItem.dataset.petId = pet.pet_id || pet.id;
    const icon = pet.species === 'dog' ? '🐕' : pet.species === 'cat' ? '🐈' : '🐾';

    petItem.innerHTML = `
      <div class="pet-icon">${icon}</div>
      <div class="pet-info">
        <p class="pet-name">${pet.name}</p>
        <p class="pet-details">
          ${pet.breed ? pet.breed + ' • ' : ''}${pet.species}${pet.age ? ' • ' + pet.age + ' ' + (pet.age === 1 ? 'year' : 'years') : ''}
        </p>
      </div>
      <div class="pet-actions">
        <button class="pet-btn details" data-action="details" data-id="${pet.pet_id || pet.id}">Details & Edit</button>
        <button class="pet-btn dashboard" data-action="dashboard" data-id="${pet.pet_id || pet.id}">Dashboard</button>
        <button class="pet-btn delete" data-action="delete" data-id="${pet.pet_id || pet.id}">Delete</button>
      </div>
    `;

    petsList.appendChild(petItem);
  });

  petsContainer.innerHTML = '';
  petsContainer.appendChild(petsList);

  petsList.querySelectorAll('.pet-btn').forEach(button => {
    const action = button.dataset.action;
    const petId = Number(button.dataset.id);
    button.addEventListener('click', () => handlePetAction(petId, action));
  });
}

async function addNewPet() {
  const pet = await promptPetDetails();
  if (!pet) return;

  try {
    // POST to Flask API
    const response = await fetch('http://localhost:5001/pets/create', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${currentUser.token}`
      },
      body: JSON.stringify({
        name: pet.name,
        species: pet.type || pet.species,
        breed: pet.breed,
        age: pet.age
      })
    });

    if (response.ok) {
      const result = await response.json();
      auth.showMessage(`${pet.name} has been added!`, 'success');
      loadUserPets();
    } else {
      const error = await response.json();
      auth.showMessage(error.error || 'Failed to create pet', 'error');
    }
  } catch (err) {
    auth.showMessage('Error: ' + err.message, 'error');
  }
}

function handlePetAction(petId, action) {
  if (action === 'details') {
    showPetDetailAndEdit(petId);
  } else if (action === 'dashboard') {
    goToPetDashboard(petId);
  } else if (action === 'delete') {
    deletePet(petId);
  }
}

async function editPet(petId) {
  const pets = getUserPets();
  const petIndex = pets.findIndex(p => p.id === petId);
  if (petIndex === -1) return;

  const updated = await promptPetDetails(pets[petIndex]);
  if (!updated) return;

  pets[petIndex] = { ...pets[petIndex], ...updated, updatedAt: new Date().toISOString() };
  saveUserPets(pets);

  loadUserPets();
  auth.showMessage(`${updated.name} has been updated.`, 'success');
}

function goToPetDashboard(petId) {
  // Store the selected pet ID in session storage
  sessionStorage.setItem('selectedPetId', petId);
  // Redirect to dashboard
  window.location.href = 'dashboard.html';
}

async function deletePet(petId) {
  const pets = await getUserPets();
  const pet = pets.find(p => (p.pet_id || p.id) === petId);
  if (!pet) return;

  const confirmed = confirm(`Are you sure you want to remove ${pet.name}?`);
  if (!confirmed) return;

  try {
    const response = await fetch(`http://localhost:5001/pets/${petId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${currentUser.token}`
      }
    });

    if (response.ok) {
      auth.showMessage(`${pet.name} has been removed.`, 'info');
      loadUserPets();
    } else {
      const error = await response.json();
      auth.showMessage(error.error || 'Failed to delete pet', 'error');
    }
  } catch (err) {
    auth.showMessage('Error: ' + err.message, 'error');
  }
}

function showPetDetailAndEdit(petId) {
  const pets = getUserPets();
  const pet = pets.find(p => p.id === petId);
  if (!pet) return;

  const icon = pet.type === 'dog' ? '🐕' : pet.type === 'cat' ? '🐈' : '🐾';
  const modalId = 'pet-detail-modal-' + Date.now();
  const modal = document.createElement('div');
  modal.className = 'modal-overlay show';
  modal.id = modalId;
  modal.innerHTML = `
    <div class="modal-content pet-detail-modal">
      <div class="modal-header">
        <h3>${icon} ${pet.name}</h3>
        <button class="modal-close" onclick="document.getElementById('${modalId}').remove()">✕</button>
      </div>
      <div class="pet-detail-content">
        <div class="detail-section">
          <h4>Basic Information</h4>
          <div class="detail-grid">
            <div class="detail-item">
              <span class="detail-label">Type:</span>
              <span class="detail-value">${pet.type.charAt(0).toUpperCase() + pet.type.slice(1)}</span>
            </div>
            ${pet.breed ? `
            <div class="detail-item">
              <span class="detail-label">Breed:</span>
              <span class="detail-value">${pet.breed}</span>
            </div>
            ` : ''}
            ${pet.age ? `
            <div class="detail-item">
              <span class="detail-label">Age:</span>
              <span class="detail-value">${pet.age} ${pet.age === 1 ? 'year' : 'years'}</span>
            </div>
            ` : ''}
            ${pet.sex ? `
            <div class="detail-item">
              <span class="detail-label">Sex:</span>
              <span class="detail-value">${pet.sex}</span>
            </div>
            ` : ''}
            ${pet.weight ? `
            <div class="detail-item">
              <span class="detail-label">Weight:</span>
              <span class="detail-value">${pet.weight} lbs</span>
            </div>
            ` : ''}
          </div>
        </div>
        ${pet.medicine ? `
        <div class="detail-section">
          <h4>💊 Medicine / Allergies</h4>
          <div class="detail-grid">
            <div class="detail-item" style="grid-column: 1 / -1;">
              <span class="detail-value">${pet.medicine}</span>
            </div>
          </div>
        </div>
        ` : ''}
        ${pet.notes ? `
        <div class="detail-section">
          <h4>📝 Special Notes</h4>
          <div class="detail-grid">
            <div class="detail-item" style="grid-column: 1 / -1;">
              <span class="detail-value">${pet.notes}</span>
            </div>
          </div>
        </div>
        ` : ''}
      </div>
      <div class="modal-footer">
        <button class="modal-btn primary" onclick="editPet(${pet.id}); document.getElementById('${modalId}').remove();">Edit</button>
        <button class="modal-btn" onclick="document.getElementById('${modalId}').remove()">Close</button>
      </div>
    </div>
  `;
  document.body.appendChild(modal);
}

function promptPetDetails(existing = {}) {
  return new Promise((resolve) => {
    const modalId = 'pet-modal-' + Date.now();
    const modal = document.createElement('div');
    modal.className = 'modal-overlay show';
    modal.id = modalId;
    modal.innerHTML = `
      <div class="modal-content pet-form-modal">
        <div class="modal-header">
          <h3>${existing.id ? 'Edit Pet' : 'Add New Pet'}</h3>
          <button class="modal-close" onclick="document.getElementById('${modalId}').remove()">✕</button>
        </div>
        <form class="pet-form" onsubmit="event.preventDefault()">
          <div class="form-group">
            <label>Pet Name *</label>
            <input type="text" name="name" value="${existing.name || ''}" required>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label>Type *</label>
              <select name="type" required>
                <option value="dog" ${existing.type === 'dog' ? 'selected' : ''}>Dog</option>
                <option value="cat" ${existing.type === 'cat' ? 'selected' : ''}>Cat</option>
                <option value="other" ${existing.type === 'other' ? 'selected' : ''}>Other</option>
              </select>
            </div>
            <div class="form-group">
              <label>Breed</label>
              <input type="text" name="breed" value="${existing.breed || ''}">
            </div>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label>Age (years)</label>
              <input type="number" name="age" min="0" value="${existing.age || ''}">
            </div>
            <div class="form-group">
              <label>Sex</label>
              <select name="sex">
                <option value="">Not specified</option>
                <option value="Male" ${existing.sex === 'Male' ? 'selected' : ''}>Male</option>
                <option value="Female" ${existing.sex === 'Female' ? 'selected' : ''}>Female</option>
              </select>
            </div>
            <div class="form-group">
              <label>Weight (lbs)</label>
              <input type="number" name="weight" min="0" step="0.1" value="${existing.weight || ''}">
            </div>
          </div>
          <div class="form-group">
            <label>Medicine / Allergies</label>
            <input type="text" name="medicine" placeholder="e.g., Amoxicillin, Penicillin allergy" value="${existing.medicine || ''}">
          </div>
          <div class="form-group">
            <label>Special Notes</label>
            <textarea name="notes" rows="3" placeholder="Any other important information...">${existing.notes || ''}</textarea>
          </div>
          <div class="form-actions">
            <button type="button" class="btn btn-outline" onclick="document.getElementById('${modalId}').remove()">Cancel</button>
            <button type="submit" class="btn btn-primary">Save Pet</button>
          </div>
        </form>
      </div>
    `;
    
    document.body.appendChild(modal);
    modal.classList.add('show');
    
    const form = modal.querySelector('.pet-form');
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const formData = new FormData(form);
      const petData = {
        id: existing.id || Date.now(),
        name: formData.get('name'),
        type: formData.get('type'),
        breed: formData.get('breed'),
        age: formData.get('age') ? parseInt(formData.get('age')) : null,
        sex: formData.get('sex'),
        weight: formData.get('weight') ? parseFloat(formData.get('weight')) : null,
        medicine: formData.get('medicine'),
        notes: formData.get('notes'),
        createdAt: existing.createdAt || new Date().toISOString()
      };
      modal.remove();
      resolve(petData);
    });
    
    modal.querySelector('.modal-close').addEventListener('click', () => {
      resolve(null);
    });
  });
}

async function getUserPets() {
  try {
    const response = await fetch('http://localhost:5001/pets', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${currentUser.token}`
      }
    });

    if (response.ok) {
      const pets = await response.json();
      return pets;
    } else {
      console.error('Failed to fetch pets');
      return [];
    }
  } catch (err) {
    console.error('Error fetching pets:', err);
    return [];
  }
}

// ==================== CALENDAR ====================

function initCalendar() {
  renderCalendar();
}

function renderCalendar() {
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const calendarGrid = document.getElementById('calendarGrid');
  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'];
  document.getElementById('currentMonth').textContent = `${monthNames[month]} ${year}`;

  console.log('Calendar v3: Rendering', monthNames[month], year);
  calendarGrid.innerHTML = '';

  // Add day headers
  const dayHeaders = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  dayHeaders.forEach(day => {
    const header = document.createElement('div');
    header.className = 'calendar-day-header';
    header.textContent = day;
    calendarGrid.appendChild(header);
  });

  const firstDayIndex = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const prevMonthDays = new Date(year, month, 0).getDate();
  const today = new Date();
  const isCurrentMonth = today.getFullYear() === year && today.getMonth() === month;
  const todayDate = today.getDate();

  // Add empty cells before 1st of month
  for (let i = 0; i < firstDayIndex; i++) {
    const day = document.createElement('div');
    day.className = 'calendar-day other-month';
    day.textContent = prevMonthDays - (firstDayIndex - 1 - i);
    calendarGrid.appendChild(day);
  }

  // Add days of current month
  for (let i = 1; i <= daysInMonth; i++) {
    const day = document.createElement('div');
    day.className = 'calendar-day';
    if (isCurrentMonth && i === todayDate) {
      day.classList.add('today');
    }
    day.textContent = i;
    calendarGrid.appendChild(day);
  }

  // Calculate remaining cells to fill (6 weeks = 42 cells + 7 headers = 49 total)
  // Current cells = 7 (headers) + firstDayIndex + daysInMonth
  const currentCells = 7 + firstDayIndex + daysInMonth;
  const remainingCells = 49 - currentCells;

  // Add trailing days from next month
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
