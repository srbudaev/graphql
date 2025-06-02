import { isJwtValid, fetchAndDisplayUserInfo } from './main.js';

document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('login-form');
    const loginError = document.getElementById('login-error');
    const logoutButton = document.getElementById('logout-button');

    if (!loginForm) return;

    loginForm.addEventListener('submit', async (event) => {
        event.preventDefault(); // Prevent form from submitting normally

        const username = document.getElementById('login-username').value.trim();
        const password = document.getElementById('login-password').value;

        // Simple validation
        if (!username || !password) {
            loginError.textContent = 'Please enter both username/email and password.';
            loginError.style.display = 'block';
            return;
        }

        // Hide error if validation passes
        loginError.style.display = 'none';

        // sending login request
        const credentials = btoa(`${username}:${password}`);

        await fetch('https://01.gritlab.ax/api/auth/signin', {
            method: 'POST',
            headers: {
                'Authorization': `Basic ${credentials}`,
                'Content-Type': 'application/json'
            }
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error('incorrect username or password. Please try again.');
                }
                return response.text(); // JWT returned as plain text
            })
            .then(token => {
                // removing double quotes from JWT
                const editedJwt = token.replace(/"/g, "");
                localStorage.setItem('jwt', editedJwt) // Saving JWT for later use.

                if (isJwtValid(editedJwt)) {
                    document.getElementById('login-section').style.display = 'none';
                    document.getElementById('profile-section').style.display = 'block';
                     document.getElementById('logout-button').style.display = 'block';
                    fetchAndDisplayUserInfo(editedJwt);
                } else {
                    sessionExpired('Invalid session. Please log in again.');
                }
            })
            .catch(error => {
                loginError.textContent = error.message;
                loginError.style.display = 'block';
            })
    });

    if (logoutButton) {
        logoutButton.addEventListener('click', handleLogout);
    }
});

const handleLogout = () => {
    // Remove the JWT from localStorage
    localStorage.removeItem('jwt');

    // Hide the profile section and show the login section
    document.getElementById('profile-section').style.display = 'none';
    document.getElementById('login-section').style.display = 'block';
     document.getElementById('logout-button').style.display = 'none';


    // Optionally, clear any profile info

    document.getElementById("username").textContent ='';
    document.getElementById("userid").textContent = '';
    document.getElementById("audit-ratio").textContent = '';
    document.getElementById("email").textContent = '';
    document.getElementById("campus").textContent = '';
    document.getElementById("nationality").textContent = '';
    document.getElementById("fullname").textContent = '';


};