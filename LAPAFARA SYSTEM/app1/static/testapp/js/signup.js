function validateSignUpForm() {
    const username = document.getElementById('username').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirmPassword').value;

    if (username === "" || email === "" || password === "" || confirmPassword === "") {
        document.getElementById('error-message').innerText = "All fields are required!";
        return false;
    }

    if (!email.includes("@")) {
        document.getElementById('error-message').innerText = "Please enter a valid email address!";
        return false;
    }

    if (password.length < 6) {
        document.getElementById('error-message').innerText = "Password must be at least 6 characters long!";
        return false;
    }

    if (password !== confirmPassword) {
        document.getElementById('error-message').innerText = "Passwords do not match!";
        return false;
    }

    alert("Signed up successfully!");
    return true;
}