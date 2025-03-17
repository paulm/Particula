/**
 * Main application file for Particula
 * Handles setup, drawing and window events
 */

// P5.js setup function
function setup() {
  createCanvas(windowWidth, windowHeight);
  colorMode(HSB, 360, 100, 100, 1);
  
  // Initialize all managers
  AutoFocusManager.initialize();
  ParticleSystem.initialize();
  IntervalManager.initialize();
  UIManager.initialize();
}

// P5.js draw function (called every frame)
function draw() {
  // Clear background with semi-transparent white for slight trails
  background(...Config.canvas.bgColor);
  
  // Update all components
  IntervalManager.update();
  AutoFocusManager.update();
  ParticleSystem.update();
}

// Handle window resize
function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  
  // Update particle positions after resize
  ParticleSystem.updateParticlePositions(Config.particles.radius);
}