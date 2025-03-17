/**
 * Configuration settings for Particula
 * Centralizes all configurable parameters
 */
const Config = {
  // Canvas settings
  canvas: {
    bgColor: [0, 0, 100, 0.2], // HSB: Semi-transparent white for slight trails
  },
  
  // Particle settings
  particles: {
    count: 100,
    radius: 240,
    minSize: 4,
    maxSize: 8,
    opacity: 0.85,
    spring: {
      strength: 0.05,
      damping: 0.8
    },
    motion: {
      rotationSpeed: 0.0006,
      oscillationAmount: 3,
      oscillationSpeed: 0.042
    }
  },
  
  // Mouse interaction
  mouse: {
    repelForce: 0.45,
    repelRadius: 150,
    proximityScale: 8.7
  },
  
  // Intervals
  intervals: {
    radius: {
      enabled: true,
      time: 3000, // 3 seconds
      smallRange: { min: 50, max: 120 },
      largeRange: { min: 240, max: 300 }
    },
    highlight: {
      enabled: false,
      time: 500, // 0.5 seconds
      duration: 750, // 0.75 seconds
      scale: 5
    },
    particleCount: {
      enabled: true,
      time: 1000, // 1 second
      step: 10,
      min: 10,
      max: 300
    }
  },
  
  // Auto Focus
  autoFocus: {
    colors: [
      { h: 0, s: 100, b: 100 },    // Red
      { h: 200, s: 100, b: 100 },  // Cyan
      { h: 280, s: 100, b: 100 },  // Purple
      { h: 50, s: 100, b: 100 },   // Yellow
      { h: 130, s: 100, b: 100 },  // Green
      { h: 330, s: 100, b: 100 }   // Pink
    ],
    defaultSettings: {
      enabled: true,
      radius: 250,
      speed: 0.01,
      angle: 0,
      scale: 5.0,
      spring: 0.7,
      showIndicators: false,
      clockwise: true
    }
  },
  
  // UI
  ui: {
    panel: {
      width: 250,
      opacity: 0.8,
      padding: 15,
      borderRadius: 10
    }
  },
  
  // Color schemes
  colorSchemes: [
    { name: "Rainbow", getHue: (angle) => map(angle, 0, TWO_PI, 0, 360) },
    { name: "Monochrome", getHue: (angle) => 0, saturation: 0, brightness: 30 },
    { name: "Ocean", getHue: (angle) => map(angle, 0, TWO_PI, 180, 240) },
    { name: "Sunset", getHue: (angle) => map(angle, 0, TWO_PI, 0, 60) },
    { name: "Neon", getHue: (angle) => floor(angle / (PI/3)) * 60 }
  ]
};