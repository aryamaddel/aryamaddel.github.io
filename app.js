tsParticles.load({
  id: "tsparticles",
  options: {
    particles: {
      color: {
        value: "#fff",
      },
      links: {
        color: "#fff",
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
        value: 80,
        limit: {
          value: 100,
        },
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
      reduceDuplicates: true,
    },
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
    responsive: [
      {
        maxWidth: 480,
        options: {
          particles: {
            number: {
              value: 15,
              limit: { value: 25 },
            },
            links: { distance: 100 },
          },
          interactivity: {
            modes: {
              push: { quantity: 2 },
              repulse: { distance: 100 },
            },
          },
        },
      },
      {
        maxWidth: 768,
        options: {
          particles: {
            number: {
              value: 25,
              limit: { value: 40 },
            },
            links: { distance: 125 },
          },
          interactivity: {
            modes: {
              push: { quantity: 3 },
              repulse: { distance: 150 },
            },
          },
        },
      },
    ],
    detectRetina: true,
  },
});
