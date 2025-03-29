document.addEventListener('DOMContentLoaded', function() {
    // Load user data from localStorage
    const userData = JSON.parse(localStorage.getItem('userData'));
    
    if (!userData) {
        // Redirect to login if not authenticated
        window.location.href = 'login.html';
        return;
    }
    
    // Load user data
    loadUserData();
    
    // Add event listeners
    document.getElementById('profileForm').addEventListener('submit', handleFormSubmit);
    document.getElementById('cancelBtn').addEventListener('click', handleCancel);
    document.getElementById('logoutBtn').addEventListener('click', handleLogout);
});

// Populate user data in the form
function populateUserData(user) {
    // Split name into first and last name
    const nameParts = (user.name || '').split(' ');
    const firstName = nameParts[0] || '';
    const lastName = nameParts.slice(1).join(' ') || '';
    
    // Set profile picture
    const profilePic = document.getElementById('profilePic');
    if (profilePic) {
        profilePic.src = user.picture || '';
        if (!user.picture) {
            profilePic.alt = 'No Profile Picture';
        }
    }
    
    // Set welcome text with user's first name
    const userNameEl = document.getElementById('userName');
    if (userNameEl) {
        userNameEl.textContent = `Hi ${firstName}!`;
    }
    
    // Set form values
    const firstNameEl = document.getElementById('firstName');
    const lastNameEl = document.getElementById('lastName');
    const emailEl = document.getElementById('email');
    const phoneEl = document.getElementById('phone');
    
    if (firstNameEl) firstNameEl.value = firstName;
    if (lastNameEl) lastNameEl.value = lastName;
    if (emailEl) emailEl.value = user.email || '';
    
    // Set phone number if available
    if (phoneEl && user.phone) {
        phoneEl.value = user.phone;
    }
    
    // Set profile button text in header if exists
    const profileBtn = document.getElementById('profileBtn');
    if (profileBtn) {
        profileBtn.textContent = firstName ? firstName.charAt(0).toUpperCase() : 'U';
    }
}

// Load user data from localStorage
function loadUserData() {
    const userData = JSON.parse(localStorage.getItem('userData'));
    
    if (userData) {
        populateUserData(userData);
    }
}

// Handle form submission
async function handleFormSubmit(event) {
    event.preventDefault();
    
    const phone = document.getElementById('phone').value.trim();
    
    // Simple phone validation
    if (phone && !/^\d{10}$/.test(phone)) {
        alert('Please enter a valid 10-digit phone number');
        return;
    }
    
    try {
        // Get existing user data
        const userData = JSON.parse(localStorage.getItem('userData'));
        
        // Update phone number
        userData.phone = phone;
        
        // Save updated user data to localStorage
        localStorage.setItem('userData', JSON.stringify(userData));
        
        alert('Profile updated successfully');
    } catch (error) {
        console.error('Error updating profile:', error);
        alert('Failed to update profile. Please try again.');
    }
}

// Handle cancel button click
function handleCancel() {
    // Reset form to original values
    loadUserData();
}

// Handle logout button click
function handleLogout() {
    // Clear user data from localStorage
    localStorage.removeItem('userData');
    localStorage.removeItem('token');
    
    // Redirect to home page after logout
    window.location.href = 'home.html';
}