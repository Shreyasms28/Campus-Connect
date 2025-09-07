document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('login-form');
    const userRoleSelect = document.getElementById('user-role');
    const loginEmailInput = document.getElementById('login-email');

    // Message box elements
    const messageBox = document.getElementById('message-box');
    const messageText = document.getElementById('message-text');

    // This function updates the email placeholder based on the selected role.
    const updateEmailPlaceholder = () => {
        const role = userRoleSelect.value;
        if (role === 'admin') {
            loginEmailInput.placeholder = 'admin@webknot.com';
        } else {
            loginEmailInput.placeholder = 'student@webknot.com';
        }
    };

    userRoleSelect.addEventListener('change', updateEmailPlaceholder);
    updateEmailPlaceholder();

    // The showMessage and hideMessage functions
    window.showMessage = (message) => {
        messageText.textContent = message;
        messageBox.classList.remove('hidden', 'opacity-0', 'scale-95');
        messageBox.classList.add('flex', 'opacity-100', 'scale-100');
    };

    window.hideMessage = () => {
        messageBox.classList.remove('opacity-100', 'scale-100');
        messageBox.classList.add('opacity-0', 'scale-95');
        setTimeout(() => {
            messageBox.classList.add('hidden');
        }, 300);
    };

    // Main logic for form submission
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault(); // Prevent the default form submission

        const email = loginEmailInput.value;
        const password = document.getElementById('login-password').value;
        const role = userRoleSelect.value;

        try {
            // Make an API call to your Express.js backend
            const response = await fetch('/api/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username: email, password }),
            });

            const data = await response.json();

            if (response.ok) {
                // Check if the returned role matches the selected role
                if (data.role === role) {
                    showMessage('Login successful! Redirecting...');
                    // Store userId in localStorage
                    localStorage.setItem('userId', data.userId);
                    // Use a small delay for the message to be seen before redirect
                    setTimeout(() => {
                        if (data.role === 'admin') {
                            window.location.href = '/admin'; // Redirects to the /admin route
                        } else if (data.role === 'student') {
                            window.location.href = '/student'; // Redirects to the /student route
                        }
                    }, 1500);
                } else {
                    showMessage(`Invalid login. You are not registered as an ${role}.`);
                }
            } else {
                showMessage(data.message || 'Invalid credentials. Please try again.');
            }
        } catch (error) {
            console.error('Login error:', error);
            showMessage('Network error. Please try again later.');
        }
    });
});
