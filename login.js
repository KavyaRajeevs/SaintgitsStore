// Function to handle Google Sign-In
function handleCredentialResponse(response) {
    fetch('http://localhost:3000/login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ token: response.credential })
    })
    .then(res => res.json())
    .then(data => {
        if (data.token) {
            // Store the JWT token
            localStorage.setItem('token', data.token);
            
            // Decode the JWT to get user info
            const payload = parseJwt(data.token);
            
            // Store user data in localStorage with comprehensive details
            const userData = {
                id: payload.id || payload.userId,
                name: payload.name || payload.username,
                username: payload.username,
                picture: payload.picture || '',
                role: payload.role || 'user',
                email: payload.email
            };
            
            localStorage.setItem('userData', JSON.stringify(userData));
            console.log('User data stored in localStorage:', JSON.parse(localStorage.getItem('userData')));
            
            // Redirect based on role
            window.location.href = data.redirect || 'home.html';
        } else {
            console.error('Login failed');
            alert('Login failed. Please try again.');
        }
    })
    .catch(err => {
        console.error('Error logging in:', err);
        alert('Login failed. Please try again.');
    });
}

// Handle traditional login form submission
document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const username = document.getElementById('username').value;
            const password = document.getElementById('password').value;
            
            fetch('http://localhost:3000/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ username, password })
            })
            .then(res => res.json())
            .then(data => {
                if (data.token) {
                    localStorage.setItem('token', data.token);
                    
                    // Decode the JWT to get user info
                    const payload = parseJwt(data.token);
                    
                    // Store user data in localStorage with comprehensive details
                    const userData = {
                        id: payload.userId,
                        name: payload.username,
                        username: payload.username,
                        email: payload.email,
                        picture: '', // Default empty for traditional login
                        role: 'user'
                    };
                    
                    localStorage.setItem('userData', JSON.stringify(userData));
                    
                    window.location.href = 'home.html';
                } else {
                    alert('Login failed. Please check your credentials.');
                }
            })
            .catch(err => {
                console.error('Error logging in:', err);
                alert('Login failed. Please try again.');
            });
        });
    }
});

// Existing parseJwt function
function parseJwt(token) {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
    
    return JSON.parse(jsonPayload);
}