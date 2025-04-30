document.getElementById("loginForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const email = e.target.email.value;
  const password = e.target.password.value;

  try {
    const res = await fetch("http://localhost:3000/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const text = await res.text();
    document.getElementById("loginMessage").innerText = text;

    if (res.ok) {
      // Set login status in localStorage
      localStorage.setItem('isLoggedIn', 'true');
      // Try to extract user name from response if available, otherwise fallback
      let userName = '';
      try {
        const data = JSON.parse(text);
        if (data && data.name) userName = data.name;
      } catch (e) {
        // If not JSON or no name, fallback
        userName = localStorage.getItem('userName') || '';
      }

      if (typeof saveUserNameToLocal === 'function') {
        saveUserNameToLocal(userName);
      } else if (userName) {
        localStorage.setItem('userName', userName);
      }
      e.target.reset();
      alert("Login successful!");
      window.location.href = "index.html"; // Optional redirect
    } else {
      alert("Login failed: " + text);
    }
  } catch (err) {
    console.error(err);
    alert("Login error");
  }
});
