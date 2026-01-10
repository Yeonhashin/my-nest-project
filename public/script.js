let token = "";

async function login() {
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;

  const res = await fetch('http://localhost:3000/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });

  const data = await res.json();
  token = data.access_token || "";
  document.getElementById('output').textContent = JSON.stringify(data, null, 2);
}

async function getProfile() {
  const res = await fetch('http://localhost:3000/auth/profile', {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  const data = await res.json();
  document.getElementById('output').textContent = JSON.stringify(data, null, 2);
}
