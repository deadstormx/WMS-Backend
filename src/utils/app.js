document.addEventListener('DOMContentLoaded', function () {
    const form = document.getElementById('login-form');

    form.addEventListener('submit', function (event) {
        event.preventDefault();

        const email = document.getElementById('login-email').value;
        const password = document.getElementById('login-password').value;

        if (email === '' || password === '') {
            alert('Please fill in all fields.');
            return;
        }

        // Send data to backend
        fetch('/api/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                email,
                password,
            }),
        })
        .then(response => response.json())
        .then(data => {
            console.log('Success:', data);
            alert(data.message); // Display success message
            // Redirect to a different page on successful login, e.g., a dashboard
            if (data.success) {
                window.location.href = 'dashboard.html'; // Replace with your actual dashboard page
            }
        })
        .catch((error) => {
            console.error('Error:', error);
            alert('An error occurred. Please try again.'); // Display error message
        });
    });
});

function togglePasswordVisibility(inputId) {
    const passwordInput = document.getElementById(inputId);
    const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
    passwordInput.setAttribute('type', type);
}
