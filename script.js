// Flip cards
document.querySelectorAll('.card').forEach((card, i) => {
  card.style.animationDelay = `${i * 0.1}s`;
  card.addEventListener('click', e => {
    if (!e.target.classList.contains('tag')) {
      card.classList.toggle('flipped');
    }
  });
});

// Search filter
const search = document.getElementById('search');
if (search) {
  search.addEventListener('input', e => {
    const term = e.target.value.toLowerCase();
    document.querySelectorAll('.card').forEach(card => {
      card.style.display = card.textContent.toLowerCase().includes(term) ? '' : 'none';
    });
  });
}

// Section switching
const links = document.querySelectorAll('.sidebar-nav a');
const sections = document.querySelectorAll('.section');

links.forEach(link => {
  link.addEventListener('click', e => {
    e.preventDefault();
    const targetId = link.getAttribute('href');
    
    // Hide all sections
    sections.forEach(sec => sec.style.display = 'none');
    
    // Show target section
    const target = document.querySelector(targetId);
    if (target) target.style.display = 'block';

    // Update active link
    links.forEach(l => l.classList.remove('active'));
    link.classList.add('active');
    
    // If switching to levels section, initialize it
    if (targetId === '#levels') {
      initializeLevelsSection();
    }
  });
});

// Handle "View Levels" button in Play section - ADD THIS CODE
document.addEventListener('click', (e) => {
    // Check if the clicked element is the "View Levels" button
    const isViewLevelsButton = 
        (e.target.classList.contains('secondary-button') && e.target.textContent.includes('View Levels')) ||
        (e.target.parentElement && e.target.parentElement.classList.contains('secondary-button') && e.target.parentElement.textContent.includes('View Levels'));
    
    if (isViewLevelsButton) {
        e.preventDefault();
        
        // Hide all sections
        sections.forEach(sec => sec.style.display = 'none');
        
        // Show levels section
        const levelsSection = document.querySelector('#levels');
        if (levelsSection) {
            levelsSection.style.display = 'block';
            
            // Initialize levels section
            initializeLevelsSection();
        }

        // Update active link in sidebar
        links.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === '#levels') {
                link.classList.add('active');
            }
        });
        
        // Update URL
        window.history.pushState(null, '', '#levels');
        
        // Play click sound
        if (window.soundManager) {
            soundManager.playSound('buttonClick');
        }
    }
});

// Theme toggle functionality
const themeToggle = document.getElementById('themeToggle');
const themeLabel = document.getElementById('themeLabel');

if (themeToggle) {
  themeToggle.addEventListener('change', () => {
    document.body.classList.toggle('dark-mode');
    themeLabel.textContent = themeToggle.checked ? "Dark Mode" : "Light Mode";

    localStorage.setItem("theme", themeToggle.checked ? "dark" : "light");
  });
}

// Load saved theme on restart - DARK MODE SET AS DEFAULT
window.onload = () => {
  const savedTheme = localStorage.getItem("theme");

  // Always set to dark mode by default, unless user explicitly chose light mode
  if (savedTheme !== "light") {
    document.body.classList.add("dark-mode");
    if (themeToggle) {
      themeToggle.checked = true;
      themeLabel.textContent = "Dark Mode";
    }
    localStorage.setItem("theme", "dark");
  } else {
    document.body.classList.remove("dark-mode");
    if (themeToggle) {
      themeToggle.checked = false;
      themeLabel.textContent = "Light Mode";
    }
  }
  
  // Initialize levels section if it's active
  if (window.location.hash === '#levels' || document.querySelector('#levels').style.display !== 'none') {
    initializeLevelsSection();
  }
};

// Levels Section Functionality
function initializeLevelsSection() {
  console.log('Initializing levels section...');
  
  // Category filtering
  const categoryBtns = document.querySelectorAll('.category-btn');
  const levelCards = document.querySelectorAll('.level-card');
  
  categoryBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      // Update active button
      categoryBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      
      const category = btn.dataset.category;
      
      // Filter levels
      levelCards.forEach(card => {
        if (category === 'all' || card.dataset.category === category) {
          card.style.display = 'block';
        } else {
          card.style.display = 'none';
        }
      });
    });
  });
  
  // Level completion tracking
  
  // Update progress
  updateProgress(completedLevels.length, levelCards.length);
  
  // Play level buttons
  document.querySelectorAll('.play-level-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const level = btn.dataset.level;
      playLevel(level);
    });
  });
  
  // Setup reset button
  setupResetButton();
}

function updateProgress(completed, total) {
  console.log(`Updating progress: ${completed}/${total}`);
  const progressFill = document.querySelector('.progress-fill');
  const completedCount = document.querySelector('.completed-count');
  const totalCount = document.querySelector('.total-count');
  const percentage = document.querySelector('.percentage');
  
  if (progressFill) {
    const progressPercent = (completed / total) * 100;
    progressFill.style.width = `${progressPercent}%`;
    console.log(`Progress bar set to: ${progressPercent}%`);
  }
  
  if (completedCount) {
    completedCount.textContent = completed;
    console.log(`Completed count set to: ${completed}`);
  }
  if (totalCount) totalCount.textContent = total;
  if (percentage) percentage.textContent = `${Math.round((completed / total) * 100)}%`;
}


// Reset progress functionality
function setupResetButton() {
  const resetBtn = document.getElementById('resetProgressBtn');
  console.log('Reset button found:', resetBtn);
  
  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      console.log('Reset button clicked');
      if (confirm('Are you sure you want to reset all your progress? This cannot be undone.')) {
        resetProgress();
      }
    });
  } else {
    console.log('Reset button NOT found!');
  }
}

function resetProgress() {
  console.log('Resetting progress...');
  
  // Clear completed levels from localStorage
  localStorage.removeItem('completedLevels');
  console.log('LocalStorage cleared');
  
  // Remove completed class from all level cards
  const completedCards = document.querySelectorAll('.level-card.completed');
  console.log(`Removing completed class from ${completedCards.length} cards`);
  
  completedCards.forEach(card => {
    card.classList.remove('completed');
  });
  
  // Reset progress bar and stats
  const totalLevels = document.querySelectorAll('.level-card').length;
  updateProgress(0, totalLevels);
  
  // Show confirmation message
  showNotification('Progress reset successfully!', 'success');
  console.log('Progress reset complete');
}

function showNotification(message, type = 'info') {
  // Create notification element
  const notification = document.createElement('div');
  notification.textContent = message;
  notification.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: ${type === 'success' ? '#4CAF50' : '#2196F3'};
    color: white;
    padding: 1rem 2rem;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    z-index: 10000;
    font-weight: 600;
    transform: translateX(400px);
    transition: transform 0.3s ease;
  `;
  
  document.body.appendChild(notification);
  
  // Animate in
  setTimeout(() => {
    notification.style.transform = 'translateX(0)';
  }, 100);
  
  // Remove after 3 seconds
  setTimeout(() => {
    notification.style.transform = 'translateX(400px)';
    setTimeout(() => {
      if (document.body.contains(notification)) {
        document.body.removeChild(notification);
      }
    }, 300);
  }, 3000);
}

// Sound Effect System
class SoundManager {
  constructor() {
    this.sounds = {};
    this.sfxVolume = 30; // Default SFX volume
    this.loadSounds();
    this.loadVolumeSettings();
  }

  loadSounds() {
    // Create button click sound
    this.sounds.buttonClick = new Audio('assets/buttonclickSound.mp3');
    this.sounds.buttonClick.preload = 'auto';
    
    // Add error handling for sound loading
    this.sounds.buttonClick.addEventListener('error', (e) => {
      console.warn('Failed to load button click sound:', e);
    });
  }

  loadVolumeSettings() {
    // Load SFX volume from localStorage or use default
    const savedSfxVolume = localStorage.getItem('sfxVolume');
    this.sfxVolume = savedSfxVolume ? parseInt(savedSfxVolume) : 30;
    this.updateAllVolumes();
  }

  updateAllVolumes() {
    // Update volume for all sounds
    Object.values(this.sounds).forEach(sound => {
      sound.volume = this.sfxVolume / 100;
    });
  }

  playSound(soundName) {
    if (this.sounds[soundName]) {
      // Create a clone of the audio to allow overlapping sounds
      const soundClone = this.sounds[soundName].cloneNode();
      soundClone.volume = this.sfxVolume / 100;
      
      soundClone.play().catch(error => {
        console.warn('Failed to play sound:', error);
      });
    }
  }

  setSfxVolume(volume) {
    this.sfxVolume = volume;
    this.updateAllVolumes();
    localStorage.setItem('sfxVolume', volume.toString());
  }

  getSfxVolume() {
    return this.sfxVolume;
  }
}

// Initialize Sound Manager
const soundManager = new SoundManager();

// Function to add click sound to buttons
function addClickSoundToButtons() {
  // Add to all buttons
  const buttons = document.querySelectorAll('button, .ct-button, .category-btn, .reset-button, .save-button, .sidebar-nav a, .card');
  
  buttons.forEach(button => {
    // Remove existing listeners to avoid duplicates
    button.removeEventListener('click', playButtonClickSound);
    button.addEventListener('click', playButtonClickSound);
  });
}

function playButtonClickSound(event) {
  // Don't play sound for search input or volume sliders
  if (event.target.type === 'range' || event.target.id === 'search') {
    return;
  }
  
  // Don't play sound for links that navigate away
  if (event.target.tagName === 'A' && event.target.target === '_blank') {
    return;
  }
  
  soundManager.playSound('buttonClick');
}

document.addEventListener('DOMContentLoaded', () => {
    // --- 1. ELEMENT REFERENCES ---
    const themeToggle = document.getElementById('themeToggle');
    const accentColorSelect = document.getElementById('accentColor');
    const musicVolume = document.getElementById('musicVolume');
    const musicVolumeDisplay = document.getElementById('musicVolumeDisplay');
    const sfxVolume = document.getElementById('sfxVolume');
    const sfxVolumeDisplay = document.getElementById('sfxVolumeDisplay');
    const resetDataButton = document.getElementById('resetData');
    const resetColorsButton = document.getElementById('resetColors');
    const saveButton = document.querySelector('.save-button');
    
    // Navigation elements
    const navLinks = document.querySelectorAll('.sidebar-nav a');
    const sections = document.querySelectorAll('main .section');

    // --- 2. LOCAL STORAGE UTILITY ---
    const getSetting = (key, defaultValue) => {
        return localStorage.getItem(key) || defaultValue;
    };

    const saveSetting = (key, value) => {
        localStorage.setItem(key, value);
    };

    // --- 3. THEME (Dark Mode & Accent Color) LOGIC ---
    
    // Function to update header colors based on selected accent color
    function updateHeaderColors(color) {
        const root = document.documentElement;
        
        // Define color mappings for different themes
        const colorMap = {
            'blue': {
                primary: '#4C85E0',
                gradient: 'linear-gradient(135deg, #4C85E0, #4cb7ff)'
            },
            'green': {
                primary: '#4CAF50',
                gradient: 'linear-gradient(135deg, #4CAF50, #66BB6A)'
            },
            'red': {
                primary: '#F44336', 
                gradient: 'linear-gradient(135deg, #F44336, #EF5350)'
            }
        };
        
        const colors = colorMap[color] || colorMap['blue'];
        
        // Update CSS variables
        root.style.setProperty('--primary', colors.primary);
        root.style.setProperty('--gradient', colors.gradient);
        
        // Save to localStorage for persistence
        saveSetting('headerPrimaryColor', colors.primary);
        saveSetting('headerGradient', colors.gradient);
    }

    // Load saved header colors on page load
    function loadHeaderColors() {
        const savedPrimary = getSetting('headerPrimaryColor', '#4C85E0');
        const savedGradient = getSetting('headerGradient', 'linear-gradient(135deg, #4C85E0, #4cb7ff)');
        
        const root = document.documentElement;
        root.style.setProperty('--primary', savedPrimary);
        root.style.setProperty('--gradient', savedGradient);
    }

    const applyAccentColor = (color) => {
        // Remove existing theme classes
        document.body.classList.remove('blue-theme', 'green-theme', 'red-theme'); 
        
        // Apply the new theme class
        if (color !== 'blue') {
            document.body.classList.add(`${color}-theme`);
        }
        
        // Update the select box
        accentColorSelect.value = color;
        saveSetting('accentColor', color);
        
        // Update CSS variables for header colors
        updateHeaderColors(color);
    };

    const applyTheme = (theme) => {
        const isDark = theme === 'dark';
        document.body.classList.toggle('dark-mode', isDark);
        themeToggle.checked = isDark;
        saveSetting('theme', theme);
    };

    // Function to reset colors to default blue
    function resetColorsToDefault() {
        const root = document.documentElement;
        
        // Reset to default blue colors
        root.style.setProperty('--primary', '#4C85E0');
        root.style.setProperty('--gradient', 'linear-gradient(135deg, #4C85E0, #4cb7ff)');
        
        // Remove theme classes
        document.body.classList.remove('green-theme', 'red-theme');
        
        // Reset select dropdown to blue
        if (accentColorSelect) {
            accentColorSelect.value = 'blue';
        }
        
        // Save default colors to localStorage
        saveSetting('accentColor', 'blue');
        saveSetting('headerPrimaryColor', '#4C85E0');
        saveSetting('headerGradient', 'linear-gradient(135deg, #4C85E0, #4cb7ff)');
    }

    // --- Load Settings ---
    const savedTheme = getSetting('theme', 'dark');
    applyTheme(savedTheme);

    const savedAccent = getSetting('accentColor', 'blue');
    applyAccentColor(savedAccent);

    // Load saved header colors
    loadHeaderColors();

    // --- Listeners for Theme/Accent ---
    themeToggle.addEventListener('change', () => {
        const newTheme = themeToggle.checked ? 'dark' : 'light';
        applyTheme(newTheme);
    });

    accentColorSelect.addEventListener('change', (e) => {
        applyAccentColor(e.target.value);
    });

    // Color reset button
    if (resetColorsButton) {
        resetColorsButton.addEventListener('click', () => {
            if (confirm("Reset all colors to default blue?")) {
                resetColorsToDefault();
                showNotification('Colors reset to default blue!', 'success');
            }
        });
    }

    // --- 4. AUDIO CONTROL LOGIC (FIXED) ---
    const setupVolumeSlider = (slider, display, key, defaultValue) => {
        const savedValue = getSetting(key, defaultValue);
        
        slider.value = savedValue;
        display.textContent = `${savedValue}%`;

        // FIXED: Using 'input' event for immediate feedback while dragging
        slider.addEventListener('input', (e) => {
            const volume = e.target.value;
            display.textContent = `${volume}%`;
            saveSetting(key, volume);
            
            // Update sound manager volume if it's SFX volume
            if (key === 'sfxVolume') {
                soundManager.setSfxVolume(volume);
            }
        });
    };
    
    setupVolumeSlider(musicVolume, musicVolumeDisplay, 'musicVolume', 70);
    setupVolumeSlider(sfxVolume, sfxVolumeDisplay, 'sfxVolume', 30);

    // --- 5. DATA RESET LOGIC ---
    resetDataButton.addEventListener('click', () => {
        if (confirm("Are you sure you want to reset ALL application data (levels, scores, and settings)? This cannot be undone.")) {
            localStorage.clear();
            
            // Reset colors to default blue
            resetColorsToDefault();
            
            alert("Application data has been reset. Please refresh the page to see default settings.");
            window.location.reload(); 
        }
    });

    // --- 6. NAVIGATION LOGIC ---

    const showSection = (hash) => {
        const targetId = hash.substring(1) || 'play'; 

        sections.forEach(section => {
            section.style.display = (section.id === targetId) ? 'block' : 'none';
        });

        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === hash || (!hash && link.getAttribute('href') === '#play')) {
                link.classList.add('active');
            }
        });
    };

    showSection(window.location.hash);

    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const hash = link.getAttribute('href');
            window.history.pushState(null, '', hash);
            showSection(hash);
        });
    });

    // --- 7. SAVE BUTTON (Visual feedback) ---
    saveButton.addEventListener('click', () => {
        alert('Settings applied! (Volume and Theme saved automatically.)');
    });

    // --- 8. ADD CLICK SOUNDS TO BUTTONS ---
    addClickSoundToButtons();

    // Re-add click sounds when navigating between sections (for dynamically loaded content)
    const observer = new MutationObserver(() => {
        addClickSoundToButtons();
    });

    observer.observe(document.body, {
        childList: true,
        subtree: true
    });

});

// 24-Hour Game Timer for Play Section
class GameTimer {
    constructor() {
        this.totalTime = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
        this.timerInterval = null;
        this.init();
    }

    init() {
        this.loadTimerState();
        this.startTimer();
    }

    loadTimerState() {
        const savedEndTime = localStorage.getItem('gameTimerEndTime');
        const now = Date.now();
        
        if (savedEndTime) {
            this.endTime = parseInt(savedEndTime);
            // If saved time is in the past, reset it
            if (this.endTime <= now) {
                this.resetTimer();
            }
        } else {
            this.resetTimer();
        }
    }

    startTimer() {
        this.timerInterval = setInterval(() => {
            this.updateTimer();
        }, 1000);
        
        // Initial update
        this.updateTimer();
    }

    updateTimer() {
        const now = Date.now();
        const timeLeft = this.endTime - now;
        
        if (timeLeft <= 0) {
            this.onTimerComplete();
            return;
        }
        
        // Update display
        this.updateDisplay(timeLeft);
        
        // Update progress bar
        this.updateProgressBar(timeLeft);
        
        // Add warning states
        this.updateWarningState(timeLeft);
    }

    updateDisplay(timeLeft) {
        const hours = Math.floor(timeLeft / (1000 * 60 * 60));
        const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000);
        
        document.getElementById('timer-hours').textContent = hours.toString().padStart(2, '0');
        document.getElementById('timer-minutes').textContent = minutes.toString().padStart(2, '0');
        document.getElementById('timer-seconds').textContent = seconds.toString().padStart(2, '0');
    }

    updateProgressBar(timeLeft) {
        const progressPercent = (timeLeft / this.totalTime) * 100;
        const progressFill = document.getElementById('timer-progress');
        if (progressFill) {
            progressFill.style.width = `${progressPercent}%`;
        }
    }

    updateWarningState(timeLeft) {
        const timerDisplay = document.querySelector('.timer-display');
        const hoursLeft = timeLeft / (1000 * 60 * 60);
        
        // Remove previous states
        timerDisplay.classList.remove('timer-warning', 'timer-critical');
        
        // Add warning states based on time left
        if (hoursLeft <= 1) {
            timerDisplay.classList.add('timer-critical');
        } else if (hoursLeft <= 6) {
            timerDisplay.classList.add('timer-warning');
        }
    }

    onTimerComplete() {
        // Reset the timer
        this.resetTimer();
        
        // Reset game progress
        this.resetGameProgress();
        
        // Show notification
        showNotification('🎮 Daily challenge reset! All progress has been cleared.', 'info');
        
        // Restart timer
        this.updateTimer();
    }

    resetTimer() {
        this.endTime = Date.now() + this.totalTime;
        localStorage.setItem('gameTimerEndTime', this.endTime.toString());
    }

    resetGameProgress() {
        // Clear level progress
        localStorage.removeItem('completedLevels');
        
        // Remove completed class from all level cards
        const completedCards = document.querySelectorAll('.level-card.completed');
        completedCards.forEach(card => {
            card.classList.remove('completed');
        });
        
        // Reset progress bar in levels section
        const totalLevels = document.querySelectorAll('.level-card').length;
        if (typeof updateProgress === 'function') {
            updateProgress(0, totalLevels);
        }
        
        console.log('Game progress reset by 24-hour timer');
    }
}

// Initialize the game timer when the page loads
document.addEventListener('DOMContentLoaded', () => {
    // Add after other initializations
    setTimeout(() => {
        new GameTimer();
    }, 1000);
});
