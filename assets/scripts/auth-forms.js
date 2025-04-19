// Combined login and register functionality
document.addEventListener('DOMContentLoaded', function() {
    console.log("Auth forms script loaded");
    
    // ====== LOGIN FORM HANDLING ======
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        console.log("Login form detected"); // for debuging
        loginForm.addEventListener('submit', function(event) {
            event.preventDefault();
            
            // Get input values
            const email = document.getElementById('loginEmail').value.trim();
            const password = document.getElementById('loginPassword').value;
            
            // Validate inputs
            if (!validateEmail(email)) {
                showFormError('loginEmail', 'Please enter a valid email address');
                return;
            }
            
            if (!password) {
                showFormError('loginPassword', 'Password is required');
                return;
            }
            
            // Show loading state
            const loginButton = document.getElementById('loginButton');
            const originalButtonText = loginButton.textContent;
            loginButton.disabled = true;
            loginButton.textContent = 'Signing in...';
            
            // Submit to backend
            login(email, password)
                .then(result => {
                    if (result.success) {
                        // Redirect to dashboard
                        window.location.href = 'dashboard.html';
                    } else {
                        // Show error message
                        showMessage(result.message || 'Login failed. Please check your credentials.', 'error');
                        loginButton.disabled = false;
                        loginButton.textContent = originalButtonText;
                    }
                })
                .catch(error => {
                    console.error('Login error:', error);
                    showMessage('An error occurred. Please try again later.', 'error');
                    loginButton.disabled = false;
                    loginButton.textContent = originalButtonText;
                });
        });
    }
    
    // ====== REGISTER FORM HANDLING ======
    const registerForm = document.getElementById('registerForm');
    if (registerForm) {
        console.log("Register form detected");
        registerForm.addEventListener('submit', function(event) {
            event.preventDefault();
            
            // Get input values
            const username = document.getElementById('registerUsername').value.trim();
            const email = document.getElementById('registerEmail').value.trim();
            const password = document.getElementById('registerPassword').value;
            const confirmPassword = document.getElementById('registerConfirmPassword').value;
            
            // Validate inputs
            if (!username) {
                showFormError('registerUsername', 'Username is required');
                return;
            }
            
            if (!validateEmail(email)) {
                showFormError('registerEmail', 'Please enter a valid email address');
                return;
            }
            
            if (password.length < 6) {
                showFormError('registerPassword', 'Password must be at least 6 characters');
                return;
            }
            
            if (password !== confirmPassword) {
                showFormError('registerConfirmPassword', 'Passwords did not match');
                return;
            }
            
            // Show loading state
            const registerButton = document.getElementById('registerButton');
            const originalButtonText = registerButton.textContent;
            registerButton.disabled = true;
            registerButton.textContent = 'Creating account...';
            
            // Submit to backend
            register(username, email, password)
                .then(result => {
                    if (result.success) {
                        // Redirect to login page
                        window.location.href = 'login.html';
                        showMessage('Registration successful! Please log in.', 'success');
                    } else {
                        // Show error message
                        showMessage(result.message || 'Registration failed. Please try again.', 'error');
                        registerButton.disabled = false;
                        registerButton.textContent = originalButtonText;
                    }
                })
                .catch(error => {
                    console.error('Registration error:', error);
                    showMessage('An error occurred. Please try again later.', 'error');
                    registerButton.disabled = false;
                    registerButton.textContent = originalButtonText;
                });
        });
    }
    
    // ====== HELPER FUNCTIONS ======
    
    // Validate email format
    function validateEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(String(email).toLowerCase());
    }
    
    // Show form field error
    function showFormError(fieldId, message) {
        const field = document.getElementById(fieldId);
        const errorSpan = field.nextElementSibling;
        
        field.classList.add('error');
        if (errorSpan && errorSpan.classList.contains('form-error')) {
            errorSpan.textContent = message;
            errorSpan.style.display = 'block';
        }
        
        // Clear error after 3 seconds
        setTimeout(() => {
            field.classList.remove('error');
            if (errorSpan) {
                errorSpan.style.display = 'none';
            }
        }, 3000);
    }
    
    // Show message in message container
    function showMessage(message, type = 'info') {
        const messageContainer = document.getElementById('messageContainer');
        if (messageContainer) {
            // Create notification element
            messageContainer.innerHTML = `<div class="notification ${type}">${message}</div>`;
            messageContainer.style.display = 'block';
            
            // Clear message after 5 seconds
            setTimeout(() => {
                messageContainer.innerHTML = '';
                messageContainer.style.display = 'none';
            }, 5000);
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
    
    // ====== API FUNCTIONS ======
    
    // Login API request
    async function login(email, password) {
        try {
            // const token = localStorage.getItem('userToken');

            const response = await fetch('http://localhost:3000/api/users/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, password})
            });
            
            const data = await response.json();
            
            if (response.ok) {
                // Store user data in localStorage
                localStorage.setItem('userToken', data.token);
                localStorage.setItem('userInfo', JSON.stringify({
                    id: data._id,
                    name: data.name,
                    email: data.email
                }));
                
                return { success: true };
            } else {
                return { success: false, message: data.message };
            }
        } catch (error) {
            console.error('Login fetch error:', error);
            return { success: false, message: 'Network error' };
        }
    }
    
    // Registration API request
    async function register(name, email, password) {
        try {
            const response = await fetch('http://localhost:3000/api/users/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ name, email, password })
            });
            
            console.log('Response:', response);  // Check the full response
            const data = await response.json();
            console.log('Data:', data);  // Check the returned data
            
            if (response.ok) {
                return { success: true };
            } else {
                return { success: false, message: data.message };
            }
        } catch (error) {
            console.error('Registration fetch error:', error);
            return { success: false, message: 'Network error' };
        }
    }
});