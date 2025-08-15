tsParticles.load({
  id: "tsparticles",
  options: {
    background: {
      color: {
        value: "transparent",
      },
    },
    fpsLimit: 120,
    interactivity: {
      events: {
        onClick: {
          enable: true,
          mode: "push",
        },
        onHover: {
          enable: true,
          mode: "repulse",
        },
        resize: true,
      },
      modes: {
        push: {
          quantity: 4,
        },
        repulse: {
          distance: 200,
          duration: 0.4,
        },
      },
    },
    particles: {
      color: {
        value: "#ffffff",
      },
      links: {
        color: "#ffffff",
        distance: 150,
        enable: true,
        opacity: 0.4,
        width: 1,
      },
      move: {
        direction: "none",
        enable: true,
        outModes: {
          default: "bounce",
        },
        random: false,
        speed: 2,
        straight: false,
      },
      number: {
        density: {
          enable: true,
          area: 1000,
        },
        value: 80,
      },
      opacity: {
        value: 0.6,
        random: true,
        animation: {
          enable: true,
          speed: 1,
          minimumValue: 0.1,
          sync: false,
        },
      },
      shape: {
        type: "circle",
      },
      size: {
        value: { min: 1, max: 3 },
        animation: {
          enable: false,
          speed: 40,
          minimumValue: 0.1,
          sync: false,
        },
      },
    },
    detectRetina: true,
  },
});

// ---- GA4 custom events for richer analytics ----
(function () {
  function sendEvent(name, params) {
    if (typeof gtag === 'function') {
      try { gtag('event', name, params || {}); } catch (e) { console.error('Analytics event error:', e); }
    }
  }

  // Track clicks on project cards and social links (recommended: select_content)
  var clickableSelectors = ['.project-card', '.social-link'];
  clickableSelectors.forEach(function (sel) {
    document.querySelectorAll(sel).forEach(function (el) {
      el.addEventListener('click', function (e) {
        var target = e.currentTarget;
        var url = target.getAttribute('href') || '';
        var contentType = target.classList.contains('project-card') ? 'project_card' : 'social_link';
        var contentName = (target.querySelector('.project-title') || target).textContent.trim();
        var linkDomain = '';
        try { 
          linkDomain = url ? new URL(url, location.href).hostname : ''; 
        } catch (err) {
          console.warn('Failed to parse URL for linkDomain:', url, err);
          linkDomain = '';
        }
        sendEvent('select_content', {
          content_type: contentType,
          content_name: contentName,
          link_url: url,
          link_domain: linkDomain,
          link_text: target.textContent.trim(),
          link_classes: target.className || '',
          link_id: target.id || ''
        });
      });
    });
  });

  // Track resume download (either enhanced file_download or custom alias)
  var resume = document.querySelector('.resume-button');
  if (resume) {
    resume.addEventListener('click', function () {
      var fileUrl = location.origin + '/ARYA MADDEL Resume.pdf';
      // Custom named event for easy conversion setup
      sendEvent('resume_download', {
        file_name: 'ARYA MADDEL Resume.pdf',
        link_url: fileUrl
      });
    });
  }
})();
