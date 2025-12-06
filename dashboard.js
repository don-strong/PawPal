/**
 * PawPal Dashboard Page - JavaScript
 * Handles dashboard functionality and displays pet-specific information
 */

// Initialize auth with API mode to connect to Flask backend
let auth = new PawPalAuth({
  storageKey: 'example_app_user',
  usersKey: 'example_app_users',
  apiEndpoint: 'http://localhost:5001'
});

// Check if user is logged in
const currentUser = auth.getCurrentUser();
if (!currentUser) {
  // Redirect to login if not authenticated
  window.location.href = 'modular-login.html';
} else {
  // Load the selected pet's dashboard
  loadPetDashboard();
}

// Logout function
async function handleLogout() {
  const result = await auth.logout();
  if (result.success) {
    window.location.href = 'modular-login.html';
  }
}

async function loadPetDashboard() {
  // Get the selected pet ID from session storage
  const petId = sessionStorage.getItem('selectedPetId');
  console.log('Dashboard: Looking for pet ID:', petId);
  
  if (!petId) {
    // No pet selected, redirect to home
    console.log('Dashboard: No pet ID in session storage');
    window.location.href = 'home.html';
    return;
  }

  // Get the pet from user's pets via API
  const pets = await getUserPets();
  console.log('Dashboard: Fetched pets:', pets);
  
  const petIdNum = Number(petId);
  const pet = pets.find(p => {
    // API returns 'id', but could also be 'pet_id'
    const pId = p.id || p.pet_id;
    console.log('Dashboard: Comparing pet id', pId, 'with', petIdNum);
    return pId === petIdNum;
  });

  if (!pet) {
    // Pet not found - show error instead of redirecting immediately
    console.log('Dashboard: Pet not found in list');
    document.getElementById('petName').textContent = 'Pet Not Found';
    document.getElementById('petSubtitle').textContent = 'Unable to load pet data. Please go back and try again.';
    document.getElementById('petDetailsContainer').innerHTML = '<p>Could not find pet with ID: ' + petId + '</p><p><a href="home.html">Return to Home</a></p>';
    return;
  }

  console.log('Dashboard: Found pet:', pet);

  // Update the header with pet info
  const icon = pet.species === 'dog' ? '🐕' : pet.species === 'cat' ? '🐈' : '🐾';
  document.getElementById('petIcon').textContent = icon;
  document.getElementById('petName').textContent = pet.name + "'s Dashboard";
  document.getElementById('petSubtitle').textContent = `Detailed information and health records for ${pet.name}`;

  // Load pet details
  loadPetDetails(pet);
  loadMedication(pet);
  loadDoseLogging(pet);
}

function loadPetDetails(pet) {
  console.log('loadPetDetails called with:', pet);
  const container = document.getElementById('petDetailsContainer');
  
  if (!container) {
    console.error('petDetailsContainer not found!');
    return;
  }
  
  // Pet photo display
  const icon = pet.species === 'dog' ? '🐕' : pet.species === 'cat' ? '🐈' : '🐾';
  const petPhotoHtml = pet.image 
    ? `<div style="text-align: center; margin-bottom: 20px;">
        <img src="${pet.image}" alt="${pet.name}" style="width: 150px; height: 150px; border-radius: 50%; object-fit: cover; border: 4px solid #3b5998; box-shadow: 0 4px 12px rgba(0,0,0,0.15);">
      </div>`
    : `<div style="text-align: center; margin-bottom: 20px;">
        <div style="width: 150px; height: 150px; border-radius: 50%; background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%); display: flex; align-items: center; justify-content: center; font-size: 64px; margin: 0 auto; border: 4px solid #3b5998; box-shadow: 0 4px 12px rgba(0,0,0,0.15);">${icon}</div>
      </div>`;
  
  try {
    const details = `
      ${petPhotoHtml}
      <div class="dashboard-info-grid">
        <div class="info-item">
          <span class="info-label">Name:</span>
          <span class="info-value">${pet.name || 'Unknown'}</span>
        </div>
        <div class="info-item">
          <span class="info-label">Type:</span>
          <span class="info-value">${pet.species ? pet.species.charAt(0).toUpperCase() + pet.species.slice(1) : 'Unknown'}</span>
        </div>
        ${pet.breed ? `
        <div class="info-item">
          <span class="info-label">Breed:</span>
          <span class="info-value">${pet.breed}</span>
        </div>
        ` : ''}
        ${pet.age !== null && pet.age !== undefined ? `
        <div class="info-item">
          <span class="info-label">Age:</span>
          <span class="info-value">${pet.age} ${pet.age === 1 ? 'year' : 'years'}</span>
        </div>
        ` : ''}
        ${pet.sex ? `
        <div class="info-item">
          <span class="info-label">Sex:</span>
          <span class="info-value">${pet.sex}</span>
        </div>
        ` : ''}
        ${pet.weight ? `
        <div class="info-item">
          <span class="info-label">Weight:</span>
          <span class="info-value">${pet.weight} lbs</span>
        </div>
        ` : ''}
      </div>
    `;
    
    container.innerHTML = details;
    console.log('Pet details rendered successfully');
  } catch (err) {
    console.error('Error rendering pet details:', err);
    container.innerHTML = '<p>Error loading pet details</p>';
  }
}

function loadMedication(pet) {
  const container = document.getElementById('healthContainer');
  const petId = pet.pet_id || pet.id;
  
  if (pet.medicine) {
    const reminderKey = `pawpal_med_reminder_${currentUser.email}_${petId}`;
    const reminder = JSON.parse(localStorage.getItem(reminderKey) || '{}');
    
    container.innerHTML = `
      <div class="info-item">
        <span class="info-label">💊 Medication</span>
        <span class="info-value">${pet.medicine}</span>
      </div>
      <div style="margin-top: 16px; padding: 14px; background-color: rgba(59, 89, 152, 0.08); border-radius: 8px; border-left: 3px solid var(--primary, #3b5998);">
        <label style="display: block; font-weight: 600; color: var(--primary, #3b5998); margin-bottom: 8px; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px;">Reminder Interval (hours)</label>
        <div style="display: flex; gap: 8px;">
          <input type="number" id="reminderInterval" min="1" max="24" value="${reminder.interval || '8'}" placeholder="Hours between doses" style="flex: 1; padding: 8px; border: 1px solid #ddd; border-radius: 4px; font-size: 14px; font-family: inherit;">
          <button onclick="saveReminder(${petId})" style="padding: 8px 16px; background-color: #3b5998; color: white; border: none; border-radius: 4px; cursor: pointer; font-weight: 600;">Save</button>
        </div>
        ${reminder.interval ? `<span class="info-value" style="display: block; margin-top: 8px;">Reminder set for every ${reminder.interval} hours</span>` : ''}
      </div>
    `;
  } else {
    container.innerHTML = '<p>No medication recorded. Add medication information to set reminders.</p>';
  }
}

async function saveReminder(petId) {
  const interval = document.getElementById('reminderInterval').value.trim();
  
  if (!interval || interval < 1 || interval > 24) {
    alert('Please enter a valid interval between 1 and 24 hours');
    return;
  }
  
  const reminderKey = `pawpal_med_reminder_${currentUser.email}_${petId}`;
  const reminder = {
    interval: parseInt(interval),
    lastSet: new Date().toISOString()
  };
  
  localStorage.setItem(reminderKey, JSON.stringify(reminder));
  
  // Reload the medication section
  const pets = await getUserPets();
  const pet = pets.find(p => (p.pet_id || p.id) === petId);
  if (pet) {
    loadMedication(pet);
  }
}

function loadDoseLogging(pet) {
  const container = document.getElementById('notesContainer');
  const petId = pet.pet_id || pet.id;
  
  // Check if pet has medicine info to log doses for
  if (pet.medicine) {
    const doseLogKey = `pawpal_dose_log_${currentUser.email}_${petId}`;
    const doseLogs = JSON.parse(localStorage.getItem(doseLogKey) || '[]');
    
    let logsHTML = `
      <div class="dose-logging-form">
        <div style="margin-bottom: 16px;">
          <label style="display: block; font-weight: 600; color: var(--primary, #3b5998); margin-bottom: 8px; font-size: 12px; text-transform: uppercase;">Log Dose</label>
          <textarea id="doseNote" placeholder="e.g., Morning dose - 10mg, given at 8:00 AM" style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px; font-size: 14px; font-family: inherit; min-height: 60px;"></textarea>
          <button onclick="saveDose(${petId})" style="margin-top: 8px; padding: 8px 16px; background-color: #3b5998; color: white; border: none; border-radius: 4px; cursor: pointer; font-weight: 600;">Add Entry</button>
        </div>
      </div>
    `;
    
    if (doseLogs.length > 0) {
      logsHTML += `<div class="dose-history"><h4 style="color: var(--primary, #3b5998); margin: 16px 0 12px 0; font-size: 12px; text-transform: uppercase; font-weight: 600; letter-spacing: 0.5px;">Recent Logs</h4>`;
      doseLogs.slice().reverse().slice(0, 5).forEach(log => {
        logsHTML += `<div class="info-item" style="margin-bottom: 8px;"><span class="info-label">${new Date(log.timestamp).toLocaleDateString()} ${new Date(log.timestamp).toLocaleTimeString()}</span><span class="info-value">${log.note}</span></div>`;
      });
      logsHTML += `</div>`;
    }
    
    container.innerHTML = logsHTML;
  } else {
    container.innerHTML = '<p>No medicine recorded. Add medicine information to start logging doses.</p>';
  }
}

async function getUserPets() {
  try {
    // Get token from the stored user object (matches auth-module.js storage)
    const userDataStr = localStorage.getItem('example_app_user');
    const userData = userDataStr ? JSON.parse(userDataStr) : null;
    const token = userData?.token;
    
    if (!token) {
      console.error('No auth token found');
      return [];
    }
    
    console.log('Fetching pets with token:', token.substring(0, 20) + '...');
    
    const response = await fetch('http://localhost:5001/pets', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    console.log('Pets API response status:', response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Failed to fetch pets:', errorText);
      throw new Error('Failed to fetch pets');
    }
    
    const data = await response.json();
    console.log('Pets API raw response:', data);
    
    // API returns array directly, not { pets: [...] }
    return Array.isArray(data) ? data : (data.pets || []);
  } catch (err) {
    console.error('Error fetching pets:', err);
    return [];
  }
}

async function saveDose(petId) {
  const doseNote = document.getElementById('doseNote').value.trim();
  
  if (!doseNote) {
    alert('Please enter a dose entry');
    return;
  }
  
  const doseLogKey = `pawpal_dose_log_${currentUser.email}_${petId}`;
  const doseLogs = JSON.parse(localStorage.getItem(doseLogKey) || '[]');
  
  doseLogs.push({
    timestamp: new Date().toISOString(),
    note: doseNote
  });
  
  localStorage.setItem(doseLogKey, JSON.stringify(doseLogs));
  
  // Trigger storage event for other tabs/windows (like home page)
  window.dispatchEvent(new StorageEvent('storage', {
    key: doseLogKey,
    newValue: JSON.stringify(doseLogs)
  }));
  
  // Clear the input and reload
  document.getElementById('doseNote').value = '';
  
  // Reload the dose logging section
  const pets = await getUserPets();
  const pet = pets.find(p => (p.pet_id || p.id) === petId);
  if (pet) {
    loadDoseLogging(pet);
  }
  
  // Show confirmation
  alert('✅ Dose logged successfully!');
}
