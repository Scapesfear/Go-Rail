document.addEventListener('DOMContentLoaded', () => {
    // Get user details from localStorage
    const userName = localStorage.getItem("userName") || "Passenger";
    const loginId = localStorage.getItem("loginID");
    
    // Check if user is logged in
    if (!loginId) {
        alert('Please login first');
        window.location.href = 'login.html';
        return;
    }

    // Set greeting
    document.getElementById("userGreet").textContent = `Welcome back, ${userName}`;

    // Fetch user details from server to prefill the form
    fetch(`http://localhost:3001/user-details?loginId=${loginId}`)
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                // Prefill form fields with user data
                document.getElementById('loginName').value = data.user.LoginName || '';
                document.getElementById('contactNumber').value = data.user.ContactNumber || '';
                document.getElementById('email').value = data.user.Email || '';
            } else {
                console.error('Error fetching user details:', data.message);
            }
        })
        .catch(error => {
            console.error('Error:', error);
        });

    // Get all edit buttons
    const editButtons = document.querySelectorAll('.edit-btn');
    
    // Add click event listeners to edit buttons
    editButtons.forEach(button => {
        button.addEventListener('click', () => {
            const input = button.previousElementSibling;
            input.removeAttribute('readonly');
            input.focus();
            button.textContent = 'Save';
            button.classList.add('save-mode');
        });
    });

    // Handle form submission
    const form = document.querySelector('form');
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        
        // Get form data
        const formData = new FormData(form);
        const data = {
            loginId: loginId,
            loginName: formData.get('loginName'),
            contactNumber: formData.get('contactNumber'),
            email: formData.get('email')
        };

        // Validate data
        if (!data.loginName || !data.contactNumber || !data.email) {
            alert('Please fill in all fields');
            return;
        }

        // Send data to server
        fetch('http://localhost:3001/update-details', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                alert('Details updated successfully!');
                window.location.href = 'passenger_homescreen.html';
            } else {
                alert('Error updating details: ' + data.message);
            }
        })
        .catch(error => {
            console.error('Error:', error);
            alert('An error occurred while updating details.');
        });
    });

    // Handle cancel button click
    const cancelBtn = document.querySelector('.cancel-btn');
    cancelBtn.addEventListener('click', () => {
        window.location.href = 'passenger_homescreen.html';
    });
}); 