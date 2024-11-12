const signUpButton = document.getElementById('signUp');
const signInButton = document.getElementById('signIn');
const container = document.getElementById('container');

signUpButton.addEventListener('click', () => {
   container.classList.add("right-panel-active");
});

signInButton.addEventListener('click', () => {
   container.classList.remove("right-panel-active");
});

function toggleAct() {
   container.classList.toggle('right-panel-active')
}

function validateInputs() {
   const name = document.querySelector('.sign-up-container input[type="text"]');
   const email = document.querySelector('.sign-up-container input[type="email"]');
   const pass = document.querySelector('.sign-up-container input[type="password"]');

   if (name.value.trim() === "" || email.value.trim() === "" || pass.value.trim() === "") {
      alert("Please fill out all fields.");
      return false;
   }
   const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
   if (!emailPattern.test(email.value)) {
      alert("Please enter a valid email.");
      return false;
   }
   if (pass.value.length < 6) {
      alert("Password must be at least 6 characters long.");
      return false;
   }
   return true;
}

async function getNextUserId() {
   try {
      const response = await fetch('https://54d749da1e7f46ac.mokky.dev/users');
      if (!response.ok) {
         throw new Error("Failed to fetch users from server.");
      }

      const users = await response.json();
      const maxUserId = users.reduce((max, user) => Math.max(max, user.userId || 0), 0);
      return maxUserId + 1; // Increment the highest userId by 1 for the new user
   } catch (error) {
      console.error("Error:", error);
      return 1; // Default to 1 if there’s an issue
   }
}

document.querySelector('.sign-up-container form').addEventListener('submit', async (e) => {
   e.preventDefault();
   if (!validateInputs()) return;

   const name = e.target.querySelector('input[type="text"]').value;
   const email = e.target.querySelector('input[type="email"]').value;
   const pass = e.target.querySelector('input[type="password"]').value;

   try {
      const userId = await getNextUserId(); // Fetch the next available userId
      const response = await fetch('https://54d749da1e7f46ac.mokky.dev/users', {
         method: 'POST',
         headers: {
            'Content-Type': 'application/json'
         },
         body: JSON.stringify({ userId, name, email, pass }) // Include userId in request body
      });
      if (response.ok) {
         container.classList.remove("right-panel-active");
      } else {
         alert("Failed to register.");
      }
   } catch (error) {
      console.error("Error:", error);
   }
});

document.querySelector('.sign-in-container form').addEventListener('submit', async (e) => {
   e.preventDefault();

   const email = e.target.querySelector('input[type="email"]').value;
   const password = e.target.querySelector('input[type="password"]').value;

   try {
      const response = await fetch('https://54d749da1e7f46ac.mokky.dev/users');
      if (!response.ok) {
         alert("Failed to fetch users from server.");
         console.error("Server response:", response.status);
         return;
      }

      const users = await response.json();
      console.log("Fetched users:", users);

      const user = users.find(user => user.email === email && user.pass === password);
      console.log("Found user:", user);

      if (user) {
         localStorage.setItem('userName', user.name);
         localStorage.setItem('userId', user.userId);

         window.location.href = './main.html';
      } else {
         alert("Invalid email or password.");
      }
   } catch (error) {
      console.error("Error:", error);
   }
});
