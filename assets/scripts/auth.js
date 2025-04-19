// Authentication utility file - include this on all pages
document.addEventListener('DOMContentLoaded', function() {
    console.log("Auth.js loaded - checking authentication");
    
    // Check if we're on the dashboard page
    if (window.location.pathname.includes('dashboard')) {
        console.log("Dashboard page detected");
        protectDashboard();
    }
    
    // Check if we're on the login page
    if (window.location.pathname.includes('login')) {
        console.log("Login page detected");
        const urlParams = new URLSearchParams(window.location.search);
        const needLogin = urlParams.get('needLogin');
        
        // Show notification message if redirected from dashboard
        if (needLogin === 'true') {
            showCornerNotification('Login to access your dashboard!', 'warning');
        }

        // Handle registration form submission
        const registerForm = document.getElementById('register-form');
        if (registerForm) {
            registerForm.addEventListener('submit', async function(event) {
                event.preventDefault();

                const name = document.getElementById('name').value;
                const email = document.getElementById('email').value;
                const password = document.getElementById('password').value;

                // Call the registration API
                const result = await register(name, email, password);
                
                if (result.success) {
                    // Redirect to login page after successful registration
                    window.location.href = 'login.html';
                    showCornerNotification('Successfully Registered!', 'success');
                } else {
                    // Handle error (e.g., show an error notification)
                    showCornerNotification(result.message, 'error');
                }
            });
        }
    }
    
    // Function to show corner notification with close button
    function showCornerNotification(message, type = 'warning') {
        // Create notification element
        let notificationDiv = document.createElement('div');
        notificationDiv.className = `notification ${type} corner-notification`;
        
        // Add content with close button
        notificationDiv.innerHTML = `
            <div class="notification-content">
                <span class="notification-message">${message}</span>
                <button class="close-btn" aria-label="Close notification">&times;</button>
            </div>
        `;
        
        // Add to body
        document.body.appendChild(notificationDiv);
        
        // Set up close button functionality
        const closeBtn = notificationDiv.querySelector('.close-btn');
        closeBtn.addEventListener('click', function() {
            notificationDiv.style.opacity = '0';
            setTimeout(() => {
                if (document.body.contains(notificationDiv)) {
                    document.body.removeChild(notificationDiv);
                }
            }, 300); // Wait for fade out animation
        });
        
        // Auto remove after 5 seconds
        setTimeout(() => {
            if (document.body.contains(notificationDiv)) {
                notificationDiv.style.opacity = '0';
                setTimeout(() => {
                    if (document.body.contains(notificationDiv)) {
                        document.body.removeChild(notificationDiv);
                    }
                }, 300); // Wait for fade out animation
            }
        }, 5000);
    }
    
    // Function to protect dashboard page
    function protectDashboard() {
        console.log("Running dashboard protection");
        const token = localStorage.getItem('userToken');
        console.log("Token found:", !!token);
        
        // If no token, redirect to login with notification parameter
        if (!token) {
            console.log("No token - redirecting to login");
            window.location.href = 'login.html?needLogin=true';
            return;
        }
        
        // If token exists, display user info
        const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
        const userNameElement = document.getElementById('user-info');
        if (userNameElement && userInfo.name) {
            userNameElement.textContent = `Welcome, ${userInfo.name}!`;
        }
        
        console.log("Dashboard protection complete - user authenticated");
    }

    const loginAnchor = document.getElementById('loginAnchor');
    const token = localStorage.getItem('userToken');

    if (token) {
        // User is logged in – change Login to Logout
        loginAnchor.textContent = 'Logout';
        loginAnchor.href = '#'; // Prevent navigation
        loginAnchor.addEventListener('click', (e) => {
            e.preventDefault();
            // Clear auth data
            localStorage.removeItem('userToken');
            localStorage.removeItem('userInfo');
            // Redirect to login
            window.location.href = 'login.html';
        });
    } else {
        // User is not logged in – make sure it's set to Login
        loginAnchor.textContent = 'Login';
        loginAnchor.href = 'login.html';
    }
});