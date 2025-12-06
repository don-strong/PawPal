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
  
  // Initialize medication reminders
  initMedicationReminders();
  
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
    
    // Pet thumbnail - use image if available, otherwise show icon
    const petThumbnail = pet.image 
      ? `<img src="${pet.image}" alt="${pet.name}" style="width: 50px; height: 50px; border-radius: 50%; object-fit: cover;">`
      : icon;

    petItem.innerHTML = `
      <div class="pet-icon">${petThumbnail}</div>
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
        age: pet.age,
        weight: pet.weight,
        sex: pet.sex,
        medicine: pet.medicine,
        notes: pet.notes,
        image: pet.image
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

async function handlePetAction(petId, action) {
  if (action === 'details') {
    await showPetDetailAndEdit(petId);
  } else if (action === 'dashboard') {
    goToPetDashboard(petId);
  } else if (action === 'delete') {
    await deletePet(petId);
  }
}

async function editPet(petId) {
  const pets = await getUserPets();
  const pet = pets.find(p => (p.id || p.pet_id) === petId);
  if (!pet) {
    console.error('Pet not found for editing:', petId);
    return;
  }

  // Map API fields to form fields
  const existingData = {
    id: pet.id || pet.pet_id,
    name: pet.name,
    type: pet.species || pet.type,  // API uses 'species'
    breed: pet.breed,
    age: pet.age,
    sex: pet.sex,
    weight: pet.weight,
    medicine: pet.medicine,
    notes: pet.notes,
    image: pet.image
  };

  const updated = await promptPetDetails(existingData);
  if (!updated) return;

  try {
    // Call API to update pet
    const response = await fetch(`http://localhost:5001/pets/${petId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${currentUser.token}`
      },
      body: JSON.stringify({
        name: updated.name,
        species: updated.type,  // API uses 'species'
        breed: updated.breed,
        age: updated.age,
        weight: updated.weight,
        sex: updated.sex,
        medicine: updated.medicine,
        notes: updated.notes,
        image: updated.image
      })
    });

    if (response.ok) {
      await loadUserPets();
      auth.showMessage(`${updated.name} has been updated.`, 'success');
    } else {
      const error = await response.json();
      auth.showMessage(error.error || 'Failed to update pet', 'error');
    }
  } catch (err) {
    console.error('Error updating pet:', err);
    auth.showMessage('Error updating pet: ' + err.message, 'error');
  }
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

async function showPetDetailAndEdit(petId) {
  const pets = await getUserPets();
  const pet = pets.find(p => (p.id || p.pet_id) === petId);
  if (!pet) {
    console.error('Pet not found:', petId);
    return;
  }

  // Use 'species' from API, fallback to 'type' for compatibility
  const petType = pet.species || pet.type || 'other';
  const icon = petType === 'dog' ? '🐕' : petType === 'cat' ? '🐈' : '🐾';
  const modalId = 'pet-detail-modal-' + Date.now();
  const petIdForEdit = pet.id || pet.pet_id;
  
  // Pet image display
  const petImageHtml = pet.image 
    ? `<div class="pet-image-display"><img src="${pet.image}" alt="${pet.name}" style="max-width: 200px; max-height: 200px; border-radius: 10px; object-fit: cover;"></div>`
    : `<div class="pet-image-placeholder" style="width: 200px; height: 200px; background: #f0f0f0; border-radius: 10px; display: flex; align-items: center; justify-content: center; font-size: 64px;">${icon}</div>`;
  
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
        <div class="detail-section" style="text-align: center; margin-bottom: 20px;">
          ${petImageHtml}
        </div>
        <div class="detail-section">
          <h4>Basic Information</h4>
          <div class="detail-grid">
            <div class="detail-item">
              <span class="detail-label">Type:</span>
              <span class="detail-value">${petType.charAt(0).toUpperCase() + petType.slice(1)}</span>
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
        <button class="modal-btn primary" id="editPetBtn-${modalId}">Edit</button>
        <button class="modal-btn" onclick="document.getElementById('${modalId}').remove()">Close</button>
      </div>
    </div>
  `;
  document.body.appendChild(modal);
  
  // Add event listener for edit button
  document.getElementById('editPetBtn-' + modalId).addEventListener('click', () => {
    document.getElementById(modalId).remove();
    editPet(petIdForEdit);
  });
}

function promptPetDetails(existing = {}) {
  return new Promise((resolve) => {
    const modalId = 'pet-modal-' + Date.now();
    const modal = document.createElement('div');
    modal.className = 'modal-overlay show';
    modal.id = modalId;
    
    // Store the current image
    let currentImage = existing.image || null;
    
    modal.innerHTML = `
      <div class="modal-content pet-form-modal">
        <div class="modal-header">
          <h3>${existing.id ? 'Edit Pet' : 'Add New Pet'}</h3>
          <button class="modal-close" onclick="document.getElementById('${modalId}').remove()">✕</button>
        </div>
        <form class="pet-form" onsubmit="event.preventDefault()">
          <div class="form-group" style="text-align: center;">
            <label>Pet Photo</label>
            <div class="pet-image-upload" style="margin: 10px 0;">
              <div id="imagePreview-${modalId}" style="width: 120px; height: 120px; border-radius: 50%; margin: 0 auto 10px; overflow: hidden; border: 3px dashed #ccc; display: flex; align-items: center; justify-content: center; background: #f5f5f5; cursor: pointer;" onclick="document.getElementById('imageInput-${modalId}').click()">
                ${existing.image 
                  ? `<img src="${existing.image}" style="width: 100%; height: 100%; object-fit: cover;">`
                  : `<span style="color: #999; font-size: 14px; text-align: center;">Click to<br>add photo</span>`
                }
              </div>
              <input type="file" id="imageInput-${modalId}" accept="image/*" style="display: none;">
              ${existing.image ? `<button type="button" id="removeImage-${modalId}" class="btn btn-outline" style="font-size: 12px; padding: 4px 8px;">Remove Photo</button>` : ''}
            </div>
          </div>
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
    
    // Handle image upload
    const imageInput = document.getElementById('imageInput-' + modalId);
    const imagePreview = document.getElementById('imagePreview-' + modalId);
    
    imageInput.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (file) {
        // Validate file size (max 2MB)
        if (file.size > 2 * 1024 * 1024) {
          alert('Image size must be less than 2MB');
          return;
        }
        
        const reader = new FileReader();
        reader.onload = (event) => {
          currentImage = event.target.result;
          imagePreview.innerHTML = `<img src="${currentImage}" style="width: 100%; height: 100%; object-fit: cover;">`;
          imagePreview.style.border = '3px solid #3b5998';
          
          // Add remove button if not exists
          if (!document.getElementById('removeImage-' + modalId)) {
            const removeBtn = document.createElement('button');
            removeBtn.type = 'button';
            removeBtn.id = 'removeImage-' + modalId;
            removeBtn.className = 'btn btn-outline';
            removeBtn.style.cssText = 'font-size: 12px; padding: 4px 8px; margin-top: 5px;';
            removeBtn.textContent = 'Remove Photo';
            removeBtn.onclick = () => {
              currentImage = null;
              imagePreview.innerHTML = `<span style="color: #999; font-size: 14px; text-align: center;">Click to<br>add photo</span>`;
              imagePreview.style.border = '3px dashed #ccc';
              removeBtn.remove();
            };
            imagePreview.parentNode.appendChild(removeBtn);
          }
        };
        reader.readAsDataURL(file);
      }
    });
    
    // Handle remove image button if exists
    const removeBtn = document.getElementById('removeImage-' + modalId);
    if (removeBtn) {
      removeBtn.onclick = () => {
        currentImage = null;
        imagePreview.innerHTML = `<span style="color: #999; font-size: 14px; text-align: center;">Click to<br>add photo</span>`;
        imagePreview.style.border = '3px dashed #ccc';
        removeBtn.remove();
      };
    }
    
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
        image: currentImage,
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

// ==================== MEDICATION REMINDERS ====================

let reminderInterval = null;

async function initMedicationReminders() {
  // Request notification permission
  if ('Notification' in window) {
    if (Notification.permission === 'default') {
      const permission = await Notification.requestPermission();
      console.log('Notification permission:', permission);
    }
  }
  
  // Load today's schedule
  await loadTodaySchedule();
  
  // Start checking for reminders every minute
  checkMedicationReminders();
  reminderInterval = setInterval(checkMedicationReminders, 60000); // Check every minute
}

async function loadTodaySchedule() {
  const container = document.getElementById('todaySchedule');
  if (!container) return;
  
  const pets = await getUserPets();
  const now = new Date();
  const scheduleItems = [];
  
  for (const pet of pets) {
    if (!pet.medicine) continue;
    
    const petId = pet.pet_id || pet.id;
    const reminderKey = `pawpal_med_reminder_${currentUser.email}_${petId}`;
    const reminder = JSON.parse(localStorage.getItem(reminderKey) || '{}');
    
    if (!reminder.interval) continue;
    
    // Calculate dose times for today based on interval
    const interval = reminder.interval;
    const startHour = 8; // Start doses at 8 AM
    const doseTimes = [];
    
    for (let hour = startHour; hour < 24; hour += interval) {
      const doseTime = new Date(now);
      doseTime.setHours(Math.floor(hour), (hour % 1) * 60, 0, 0);
      doseTimes.push(doseTime);
    }
    
    // Get dose logs for today
    const doseLogKey = `pawpal_dose_log_${currentUser.email}_${petId}`;
    const doseLogs = JSON.parse(localStorage.getItem(doseLogKey) || '[]');
    const todayLogs = doseLogs.filter(log => {
      const logDate = new Date(log.timestamp);
      return logDate.toDateString() === now.toDateString();
    });
    
    doseTimes.forEach(doseTime => {
      const timeStr = doseTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      const isPast = doseTime < now;
      
      // Check if dose was logged around this time (within 1 hour window)
      const wasLogged = todayLogs.some(log => {
        const logTime = new Date(log.timestamp);
        return Math.abs(logTime - doseTime) < 60 * 60 * 1000; // Within 1 hour
      });
      
      scheduleItems.push({
        pet: pet,
        time: doseTime,
        timeStr: timeStr,
        isPast: isPast,
        wasLogged: wasLogged,
        medicine: pet.medicine
      });
    });
  }
  
  // Sort by time
  scheduleItems.sort((a, b) => a.time - b.time);
  
  if (scheduleItems.length === 0) {
    container.innerHTML = `
      <p style="color: #666; font-size: 14px;">No medication reminders scheduled for today.</p>
      <p style="color: #888; font-size: 12px; margin-top: 8px;">Set up reminders in each pet's dashboard.</p>
    `;
    return;
  }
  
  let html = '<div class="schedule-list" style="max-height: 300px; overflow-y: auto;">';
  
  scheduleItems.forEach(item => {
    const icon = item.pet.species === 'dog' ? '🐕' : item.pet.species === 'cat' ? '🐈' : '🐾';
    let statusClass = '';
    let statusIcon = '';
    
    if (item.wasLogged) {
      statusClass = 'background: #d4edda; border-left: 3px solid #28a745;';
      statusIcon = '✅';
    } else if (item.isPast) {
      statusClass = 'background: #f8d7da; border-left: 3px solid #dc3545;';
      statusIcon = '⚠️';
    } else {
      statusClass = 'background: #fff3cd; border-left: 3px solid #ffc107;';
      statusIcon = '⏰';
    }
    
    html += `
      <div class="schedule-item" style="display: flex; align-items: center; gap: 12px; padding: 10px; margin-bottom: 8px; border-radius: 6px; ${statusClass}">
        <span style="font-size: 20px;">${icon}</span>
        <div style="flex: 1;">
          <div style="font-weight: 600; color: #333;">${item.pet.name}</div>
          <div style="font-size: 12px; color: #666;">${item.medicine}</div>
        </div>
        <div style="text-align: right;">
          <div style="font-weight: 600; color: #3b5998;">${item.timeStr}</div>
          <div style="font-size: 16px;">${statusIcon}</div>
        </div>
      </div>
    `;
  });
  
  html += '</div>';
  
  // Add legend
  html += `
    <div style="margin-top: 12px; padding-top: 12px; border-top: 1px solid #eee; font-size: 11px; color: #888;">
      <span style="margin-right: 12px;">✅ Given</span>
      <span style="margin-right: 12px;">⚠️ Missed</span>
      <span>⏰ Upcoming</span>
    </div>
  `;
  
  container.innerHTML = html;
}

async function checkMedicationReminders() {
  if (!('Notification' in window) || Notification.permission !== 'granted') {
    return;
  }
  
  const pets = await getUserPets();
  const now = new Date();
  
  for (const pet of pets) {
    if (!pet.medicine) continue;
    
    const petId = pet.pet_id || pet.id;
    const reminderKey = `pawpal_med_reminder_${currentUser.email}_${petId}`;
    const reminder = JSON.parse(localStorage.getItem(reminderKey) || '{}');
    
    if (!reminder.interval) continue;
    
    // Check if it's time for a reminder
    const lastNotifiedKey = `pawpal_last_notified_${currentUser.email}_${petId}`;
    const lastNotified = localStorage.getItem(lastNotifiedKey);
    const lastNotifiedTime = lastNotified ? new Date(lastNotified) : null;
    
    // Calculate if we should notify now
    const intervalMs = reminder.interval * 60 * 60 * 1000; // Convert hours to ms
    const shouldNotify = !lastNotifiedTime || (now - lastNotifiedTime) >= intervalMs;
    
    // Also check if current time is close to a scheduled dose time
    const startHour = 8;
    const interval = reminder.interval;
    let isNearDoseTime = false;
    
    for (let hour = startHour; hour < 24; hour += interval) {
      const doseHour = Math.floor(hour);
      const doseMinute = Math.round((hour % 1) * 60);
      
      if (now.getHours() === doseHour && Math.abs(now.getMinutes() - doseMinute) <= 5) {
        isNearDoseTime = true;
        break;
      }
    }
    
    if (shouldNotify && isNearDoseTime) {
      // Send notification
      const icon = pet.species === 'dog' ? '🐕' : pet.species === 'cat' ? '🐈' : '🐾';
      
      new Notification(`${icon} PawPal Medication Reminder`, {
        body: `Time to give ${pet.name} their medication: ${pet.medicine}`,
        icon: '/favicon.ico',
        tag: `pawpal-med-${petId}`,
        requireInteraction: true
      });
      
      // Update last notified time
      localStorage.setItem(lastNotifiedKey, now.toISOString());
      
      // Refresh the schedule display
      loadTodaySchedule();
    }
  }
}

// Refresh schedule when a dose is logged (called from dashboard)
window.addEventListener('storage', (e) => {
  if (e.key && e.key.includes('pawpal_dose_log_')) {
    loadTodaySchedule();
  }
});
