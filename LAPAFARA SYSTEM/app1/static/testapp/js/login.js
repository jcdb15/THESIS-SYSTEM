    function validateForm() {
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;

        if (username === "" || password === "") {
            document.getElementById('error-message').innerText = "Both fields are required!";
            return false;
        }

        if (!username.includes("@")) {
            document.getElementById('error-message').innerText = "Please enter a valid email address!";
            return false;
        }

        if (password.length < 6) {
            document.getElementById('error-message').innerText = "Password must be at least 6 characters long!";
            return false;
        }

        alert("Logged in successfully!");
        return true;

        
    }


  // Auto-remove toast after 3 seconds
  setTimeout(() => {
    const toasts = document.querySelectorAll('.toast');
    toasts.forEach(toast => {
      toast.style.display = 'none';
    });
  }, 3000);
