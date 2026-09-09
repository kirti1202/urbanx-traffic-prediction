// ================= PASSWORD TOGGLE =================
function togglePass(id) {
  const input = document.getElementById(id);
  input.type = input.type === "password" ? "text" : "password";
}

// ================= SIGNUP =================
async function signup() {
  const name     = document.getElementById("signupUser").value.trim();
  const email    = document.getElementById("signupEmail").value.trim();
  const password = document.getElementById("signupPass").value;
  const signupMsg = document.getElementById("signupMsg");

  if (!name || !email || !password) {
    signupMsg.innerText = "All required fields must be filled";
    signupMsg.style.color = "red";
    return;
  }

  try {
    const res = await fetch("http://localhost:5001/api/auth/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password })
    });

    const data = await res.json();
    signupMsg.innerText = data.message;
    signupMsg.style.color = res.ok ? "green" : "red";

    if (res.ok) {
      sessionStorage.setItem("pendingEmail", email);
      sessionStorage.setItem("pendingName", name);
      setTimeout(() => {
        window.location.href = "otp.html";
      }, 1000);
    }

  } catch (error) {
    signupMsg.innerText = "Server not responding";
    signupMsg.style.color = "red";
  }
}

// ================= LOGIN =================
async function login() {
  const email    = document.getElementById("loginUser").value.trim();
  const password = document.getElementById("loginPass").value;
  const loginMsg = document.getElementById("loginMsg");

  if (!email || !password) {
    loginMsg.innerText = "Email and password are required";
    loginMsg.style.color = "red";
    return;
  }

  try {
    const res = await fetch("http://localhost:5001/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password })
    });

    const data = await res.json();

    if (res.ok) {
      loginMsg.innerText = "Login successful!";
      loginMsg.style.color = "green";

      if (data.token) localStorage.setItem("token", data.token);

      // Save user info for profile display
      localStorage.setItem("userName", data.name || "");
      localStorage.setItem("userEmail", data.email || email);
      // fallback — save email from input if not in response
      localStorage.setItem("userEmail", email);

      setTimeout(() => {
        window.location.href = "main.html";
      }, 800);

    } else {
      loginMsg.innerText = data.message;
      loginMsg.style.color = "red";
    }

  } catch (error) {
    loginMsg.innerText = "Server not responding";
    loginMsg.style.color = "red";
  }
}