// Main JavaScript for Poll App

// Global variables
let currentUser = null;
const API_URL = '/api';
let chartsMap = new Map();

// DOM Content Loaded
document.addEventListener('DOMContentLoaded', () => {
  // Check if user is logged in
  checkAuthStatus();

  // Setup event listeners
  setupEventListeners();

  // Load appropriate content based on current page
  loadPageContent();
});

// Check authentication status
function checkAuthStatus() {
  const token = localStorage.getItem('token');

  if (token) {
    // Update UI for logged in user
    document.querySelectorAll('.logged-out').forEach(el => el.style.display = 'none');
    document.querySelectorAll('.logged-in').forEach(el => el.style.display = 'block');

    // Fetch user data
    fetch(`${API_URL}/auth/me`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          currentUser = data.data;
        } else {
          // Token might be invalid or expired
          localStorage.removeItem('token');
          updateAuthUI(false);
        }
      })
      .catch(err => {
        console.error('Error checking auth status:', err);
        localStorage.removeItem('token');
        updateAuthUI(false);
      });
  } else {
    updateAuthUI(false);
  }
}

// Update UI based on authentication
function updateAuthUI(isLoggedIn) {
  if (isLoggedIn) {
    document.querySelectorAll('.logged-out').forEach(el => el.style.display = 'none');
    document.querySelectorAll('.logged-in').forEach(el => el.style.display = 'block');
  } else {
    document.querySelectorAll('.logged-out').forEach(el => el.style.display = 'block');
    document.querySelectorAll('.logged-in').forEach(el => el.style.display = 'none');
  }
}

// Setup all event listeners
function setupEventListeners() {
  // Logout button
  const logoutBtn = document.getElementById('logout-btn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', (e) => {
      e.preventDefault();
      logout();
    });
  }

  // Registration form
  const registerForm = document.getElementById('register-form');
  if (registerForm) {
    registerForm.addEventListener('submit', registerUser);
  }

  // Login form
  const loginForm = document.getElementById('login-form');
  if (loginForm) {
    loginForm.addEventListener('submit', loginUser);
  }

  // Create poll form
  const createPollForm = document.getElementById('create-poll-form');
  if (createPollForm) {
    createPollForm.addEventListener('submit', createPoll);

    // Add/remove option buttons for poll creation
    const addOptionBtn = document.getElementById('add-option');
    const removeOptionBtn = document.getElementById('remove-option');

    if (addOptionBtn) {
      addOptionBtn.addEventListener('click', () => {
        const optionsContainer = document.getElementById('options-container');
        const optionInputs = optionsContainer.querySelectorAll('.option-input');

        if (optionInputs.length < 5) {
          const newOption = document.createElement('div');
          newOption.className = 'option-input mb-2';
          newOption.innerHTML = `
            <div class="input-group">
              <span class="input-group-text">${optionInputs.length + 1}</span>
              <input type="text" class="form-control" name="options[]" required>
            </div>
          `;

          optionsContainer.appendChild(newOption);

          // Enable remove button if we have more than 2 options
          if (optionsContainer.querySelectorAll('.option-input').length > 2) {
            removeOptionBtn.disabled = false;
          }

          // Disable add button if we reach 5 options
          if (optionsContainer.querySelectorAll('.option-input').length >= 5) {
            addOptionBtn.disabled = true;
          }
        }
      });
    }

    if (removeOptionBtn) {
      removeOptionBtn.addEventListener('click', () => {
        const optionsContainer = document.getElementById('options-container');
        const optionInputs = optionsContainer.querySelectorAll('.option-input');

        if (optionInputs.length > 2) {
          optionsContainer.removeChild(optionInputs[optionInputs.length - 1]);

          // Disable remove button if we have only 2 options left
          if (optionsContainer.querySelectorAll('.option-input').length <= 2) {
            removeOptionBtn.disabled = true;
          }

          // Enable add button if we have fewer than 5 options
          if (optionsContainer.querySelectorAll('.option-input').length < 5) {
            addOptionBtn.disabled = false;
          }
        }
      });
    }
  }

  // Vote form - will be set up dynamically when poll is loaded
}

// Load content based on current page
function loadPageContent() {
  const path = window.location.pathname;

  if (path === '/' || path === '/index.html') {
    loadRecentPolls();
  } else if (path === '/polls' || path === '/polls/index.html') {
    loadAllPolls();
  } else if (path.match(/^\/polls\/\w+$/)) {
    const pollId = path.split('/').pop();
    loadSinglePoll(pollId);
  }
}

// Load recent polls for homepage
function loadRecentPolls() {
  const container = document.getElementById('recent-polls-container');
  if (!container) return;

  fetch(`${API_URL}/polls`)
    .then(res => res.json())
    .then(data => {
      if (data.success) {
        container.innerHTML = '';

        // Take just the first 4 polls for the recent section
        const recentPolls = data.data.slice(0, 4);

        if (recentPolls.length === 0) {
          container.innerHTML = '<div class="alert alert-info">No polls created yet. Be the first to create one!</div>';
          return;
        }

        const row = document.createElement('div');
        row.className = 'row';

        recentPolls.forEach(poll => {
          const template = document.getElementById('poll-card-template');
          if (template) {
            const clone = document.importNode(template.content, true);

            clone.querySelector('.poll-title').textContent = poll.title;
            clone.querySelector('.poll-creator').textContent = poll.creator.username;
            clone.querySelector('.poll-date').textContent = new Date(poll.createdAt).toLocaleDateString();
            clone.querySelector('.poll-votes').textContent = poll.totalVotes;
            clone.querySelector('.poll-link').href = `/polls/${poll._id}`;

            row.appendChild(clone);
          }
        });

        container.appendChild(row);
      } else {
        showAlert('error', 'Error loading recent polls');
      }
    })
    .catch(err => {
      console.error('Error loading recent polls:', err);
      showAlert('error', 'Error loading recent polls');
    });
}

// Load all polls
function loadAllPolls() {
  const container = document.getElementById('polls-container');
  if (!container) return;

  fetch(`${API_URL}/polls`)
    .then(res => res.json())
    .then(data => {
      if (data.success) {
        container.innerHTML = '';

        if (data.data.length === 0) {
          container.innerHTML = '<div class="alert alert-info">No polls created yet. Be the first to create one!</div>';
          return;
        }

        const row = document.createElement('div');
        row.className = 'row';

        data.data.forEach(poll => {
          const template = document.getElementById('poll-card-template');
          if (template) {
            const clone = document.importNode(template.content, true);

            clone.querySelector('.poll-title').textContent = poll.title;
            clone.querySelector('.poll-creator').textContent = poll.creator.username;
            clone.querySelector('.poll-date').textContent = new Date(poll.createdAt).toLocaleDateString();
            clone.querySelector('.poll-votes').textContent = poll.totalVotes;
            clone.querySelector('.poll-link').href = `/polls/${poll._id}`;

            row.appendChild(clone);
          }
        });

        container.appendChild(row);
      } else {
        showAlert('error', 'Error loading polls');
      }
    })
    .catch(err => {
      console.error('Error loading polls:', err);
      showAlert('error', 'Error loading polls');
    });
}

// Load single poll
function loadSinglePoll(pollId) {
  const container = document.getElementById('poll-container');
  if (!container) return;

  fetch(`${API_URL}/polls/${pollId}`)
    .then(res => res.json())
    .then(data => {
      if (data.success) {
        const poll = data.data;

        // Use the template
        const template = document.getElementById('poll-template');
        if (template) {
          const clone = document.importNode(template.content, true);

          clone.querySelector('.poll-title').textContent = poll.title;
          clone.querySelector('.poll-creator').textContent = poll.creator.username;
          clone.querySelector('.poll-date').textContent = new Date(poll.createdAt).toLocaleDateString();

          // Clear container and append the template clone
          container.innerHTML = '';
          container.appendChild(clone);

          // Check if user is logged in
          const token = localStorage.getItem('token');
          if (!token) {
            document.querySelector('.vote-section').style.display = 'none';
            document.querySelector('.login-to-vote-message').classList.remove('d-none');
          } else {
            // Check if user has already voted
            if (poll.voters.includes(currentUser?._id)) {
              document.querySelector('.vote-section').style.display = 'none';
              document.querySelector('.already-voted-message').classList.remove('d-none');
            } else {
              // Add options to the form
              const optionsList = document.querySelector('.options-list');
              poll.options.forEach((option, index) => {
                const optionItem = document.createElement('label');
                optionItem.className = 'list-group-item';
                optionItem.innerHTML = `
                  <input class="form-check-input me-2" type="radio" name="optionIndex" value="${index}" required>
                  ${option.text}
                `;
                optionsList.appendChild(optionItem);
              });

              // Add event listener to vote form
              const voteForm = document.getElementById('vote-form');
              voteForm.addEventListener('submit', (e) => submitVote(e, pollId));
            }
          }

          // Display results
          displayPollResults(poll);
        }
      } else {
        showAlert('error', 'Error loading poll');
      }
    })
    .catch(err => {
      console.error('Error loading poll:', err);
      showAlert('error', 'Error loading poll');
    });
}

// Display poll results with Chart.js
function displayPollResults(poll) {
  const ctx = document.getElementById('results-chart');
  if (!ctx) return;

  // Prepare data for chart
  const labels = poll.options.map(option => option.text);
  const data = poll.options.map(option => option.votes);
  const backgroundColors = [
    '#4361ee', '#3a0ca3', '#7209b7', '#f72585', '#4cc9f0'
  ];

  // Create chart
  const chart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: labels,
      datasets: [{
        label: 'Votes',
        data: data,
        backgroundColor: backgroundColors.slice(0, labels.length),
        borderWidth: 0
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: {
          display: false
        },
        tooltip: {
          callbacks: {
            label: function (context) {
              const value = context.raw;
              const total = data.reduce((a, b) => a + b, 0);
              const percentage = total > 0 ? Math.round((value / total) * 100) : 0;
              return `${value} votes (${percentage}%)`;
            }
          }
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            precision: 0
          }
        }
      }
    }
  });

  // Store chart in map to reference later if needed
  chartsMap.set(poll._id, chart);
}

// Register a new user
function registerUser(e) {
  e.preventDefault();

  const username = document.getElementById('username').value;
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;
  const password2 = document.getElementById('password2').value;

  // Simple validation
  if (password !== password2) {
    showAlert('error', 'Passwords do not match');
    return;
  }

  fetch(`${API_URL}/auth/register`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      username,
      email,
      password
    })
  })
    .then(res => res.json())
    .then(data => {
      if (data.success) {
        // Save token and redirect
        localStorage.setItem('token', data.token);
        currentUser = data.user;

        showAlert('success', 'Registration successful! Redirecting...');

        // Redirect to home page after a short delay
        setTimeout(() => {
          window.location.href = '/';
        }, 1500);
      } else {
        showAlert('error', data.message || 'Registration failed');
      }
    })
    .catch(err => {
      console.error('Error registering user:', err);
      showAlert('error', 'Registration failed');
    });
}

// Login an existing user
function loginUser(e) {
  e.preventDefault();

  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;

  fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      email,
      password
    })
  })
    .then(res => res.json())
    .then(data => {
      if (data.success) {
        // Save token and redirect
        localStorage.setItem('token', data.token);
        currentUser = data.user;

        showAlert('success', 'Login successful! Redirecting...');

        // Redirect to home page after a short delay
        setTimeout(() => {
          window.location.href = '/';
        }, 1500);
      } else {
        showAlert('error', data.message || 'Login failed');
      }
    })
    .catch(err => {
      console.error('Error logging in:', err);
      showAlert('error', 'Login failed');
    });
}

// Logout user
function logout() {
  localStorage.removeItem('token');
  currentUser = null;
  updateAuthUI(false);

  showAlert('success', 'Logged out successfully');

  // Redirect to home page
  window.location.href = '/';
}

// Create a new poll
function createPoll(e) {
  e.preventDefault();

  const title = document.getElementById('title').value;
  const optionInputs = document.querySelectorAll('input[name="options[]"]');
  const options = Array.from(optionInputs).map(input => input.value.trim());

  // Validate options (no empty options allowed)
  if (options.some(option => option === '')) {
    showAlert('error', 'All options must have a value');
    return;
  }

  const token = localStorage.getItem('token');
  if (!token) {
    showAlert('error', 'You must be logged in to create a poll');
    setTimeout(() => {
      window.location.href = '/login';
    }, 1500);
    return;
  }

  fetch(`${API_URL}/polls`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({
      title,
      options
    })
  })
    .then(res => res.json())
    .then(data => {
      if (data.success) {
        showAlert('success', 'Poll created successfully! Redirecting...');

        // Redirect to the new poll after a short delay
        setTimeout(() => {
          window.location.href = `/polls/${data.data._id}`;
        }, 1500);
      } else {
        showAlert('error', data.message || 'Failed to create poll');
      }
    })
    .catch(err => {
      console.error('Error creating poll:', err);
      showAlert('error', 'Failed to create poll');
    });
}

// Submit a vote
function submitVote(e, pollId) {
  e.preventDefault();

  const selectedOption = document.querySelector('input[name="optionIndex"]:checked');
  if (!selectedOption) {
    showAlert('error', 'Please select an option');
    return;
  }

  const optionIndex = selectedOption.value;
  const token = localStorage.getItem('token');

  if (!token) {
    showAlert('error', 'You must be logged in to vote');
    setTimeout(() => {
      window.location.href = '/login';
    }, 1500);
    return;
  }

  fetch(`${API_URL}/polls/${pollId}/vote`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({
      optionIndex
    })
  })
    .then(res => res.json())
    .then(data => {
      if (data.success) {
        showAlert('success', 'Vote recorded successfully!');

        // Hide the voting form and show the already voted message
        document.querySelector('.vote-section').style.display = 'none';
        document.querySelector('.already-voted-message').classList.remove('d-none');

        // Update the results chart
        const poll = data.data;

        // If chart exists, destroy it
        if (chartsMap.has(poll._id)) {
          chartsMap.get(poll._id).destroy();
        }

        // Display updated results
        displayPollResults(poll);
      } else {
        showAlert('error', data.message || 'Failed to submit vote');
      }
    })
    .catch(err => {
      console.error('Error submitting vote:', err);
      showAlert('error', 'Failed to submit vote');
    });
}

// Show alert message
function showAlert(type, message) {
  const alertContainer = document.getElementById('alert-container');
  if (!alertContainer) return;

  const alert = document.createElement('div');
  alert.className = `alert alert-${type === 'error' ? 'danger' : type} alert-dismissible fade show`;
  alert.innerHTML = `
    ${message}
    <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
  `;

  alertContainer.appendChild(alert);

  // Remove after 5 seconds
  setTimeout(() => {
    if (alert.parentNode === alertContainer) {
      alertContainer.removeChild(alert);
    }
  }, 5000);
}