document.addEventListener("DOMContentLoaded", function() {

    const loginId = localStorage.getItem("loginId");

    // Fetch current profile details from the server
    fetch('http://localhost:3001/api/passenger/profile', {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'loginid': loginId
        }
    })
        .then(response => response.json())
        .then(data => {
            if (data.profile) {
                document.getElementById("loginName").value = data.profile.LoginName;
                document.getElementById("email").value = data.profile.Email;
                document.getElementById("contactNumber").value = data.profile.ContactNumber;
            } else {
                showMessage("Unable to etch profile details.");
            }
        })
        .catch(error => {
            console.error("Error fetching profile:", error);
            showMessage("Error fetching profile. Please try again.");
        });

    // Form submission handling
    document.getElementById("editProfileForm").addEventListener("submit", function(e) {
        e.preventDefault();

        const loginName = document.getElementById("loginName").value;
        const email = document.getElementById("email").value;
        const contactNumber = document.getElementById("contactNumber").value;

        if (!validateEmail(email) || contactNumber.length !== 10) {
            showMessage("Please provide valid input.");
            return;
        }

        fetch('http://localhost:3000/api/passenger/edit-profile', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'loginid': loginId
            },
            body: JSON.stringify({
                loginName: loginName,
                email: email,
                contactNumber: contactNumber
            })
        })
            .then(response => response.json())
            .then(data => {
                if (data.message) {
                    showMessage(data.message, 'success');
                }
            })
            .catch(error => {
                console.error("Error:", error);
                showMessage("Error updating profile. Please try again.");
            });
    });

    function validateEmail(email) {
        const re = /^[a-zA-Z0-9._%+-]+@[a-zAZ0-9.-]+\.[a-zA-Z]{2,4}$/;
        return re.test(email);
    }

    function showMessage(message, type = 'error') {
        const messageDiv = document.getElementById('message');
        messageDiv.textContent = message;
        messageDiv.style.color = type === 'success' ? 'green' : 'red';
    }
});