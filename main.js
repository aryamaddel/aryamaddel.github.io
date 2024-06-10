document.addEventListener('DOMContentLoaded', () => {
    const toggleSwitch = document.getElementById('theme-toggle');

    // Function to apply the theme
    const applyTheme = (darkMode) => {
      if (darkMode) {
        document.body.classList.add('dark-mode');
        toggleSwitch.checked = true;
      } else {
        document.body.classList.remove('dark-mode');
        toggleSwitch.checked = false;
      }
    };

    // Check system preference
    const prefersDarkScheme = window.matchMedia('(prefers-color-scheme: dark)').matches;
    applyTheme(prefersDarkScheme);

    // Listen for changes in system preference
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
      applyTheme(e.matches);
    });

    // Toggle switch event
    toggleSwitch.addEventListener('change', () => {
      applyTheme(toggleSwitch.checked);
    });
  });
