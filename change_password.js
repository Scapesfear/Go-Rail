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

    // Handle form submission
    const form = document.getElementById('passwordForm');
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        // Get form data
        const currentPassword = document.getElementById('currentPassword').value;
        const newPassword = document.getElementById('newPassword').value;
        const confirmPassword = document.getElementById('confirmPassword').value;
        
        // Validate form data
        if (!currentPassword || !newPassword || !confirmPassword) {
            alert('Please fill in all fields');
            return;
        }
        
        // Check if passwords match
        if (newPassword !== confirmPassword) {
            alert('New passwords do not match');
            return;
        }
        
        try {
            // Send data to server
            const response = await fetch('http://localhost:3001/change-password', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    loginId,
                    currentPassword,
                    newPassword
                })
            });
            
            const data = await response.json();
            
            if (data.success) {
                alert('Password updated successfully!');
                window.location.href = 'passenger_homescreen.html';
            } else {
                alert(`Error: ${data.message}`);
            }
        } catch (error) {
            console.error('Error:', error);
            alert('An error occurred while updating password.');
        }
    });

    // Handle cancel button click
    document.getElementById('cancelBtn').addEventListener('click', () => {
        window.location.href = 'passenger_homescreen.html';
    });
}); 