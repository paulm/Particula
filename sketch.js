// Reactive Circle Particles
let particles = [];
let numParticles = 50;
let radius = 200;
let centerX, centerY;

// Spring physics
let springStrength = 0.05;
let mouseRepelForce = 0.2;
let mouseRepelRadius = 150;
let damping = 0.8;

// Autonomous movement
let rotationSpeed = 0.0005; // Very slow rotation
let oscillationAmount = 15; // How much particles oscillate
let oscillationSpeed = 0.02; // Speed of oscillation

// Mouse proximity effects
let mouseProximityScale = 4.0; // How much particles grow when mouse is close

// Automatic focus point (simulates mouse movement in a circle)
let autoFocus = true;
let autoFocusRadius = 250;
let autoFocusSpeed = 0.01;
let autoFocusAngle = 0;
let autoFocusPoint = { x: 0, y: 0 };
let autoFocusScale = 3.0; // How much particles grow with auto focus
let showAutoFocusIndicators = true; // Whether to show the path and focus point

// UI Controls
let showControls = true;
let showLines = true; // Add variable to control line visibility
let sliderParticles, sliderRadius, sliderWaveAmp, sliderWaveSpeed;
let sliderRotation, sliderMouseForce, sliderSpring, sliderMouseSize;
let sliderAutoSpeed, sliderAutoScale, toggleAutoFocus;
let controlPanel, hideButton;

function setup() {
  createCanvas(windowWidth, windowHeight);
  colorMode(HSB, 360, 100, 100, 1);
  
  centerX = width / 2;
  centerY = height / 2;
  
  // Create particles arranged in a circle
  createParticles();
  
  // Setup control panel with HTML elements
  createControlPanel();
}

function createParticles() {
  particles = []; // Clear any existing particles
  
  for (let i = 0; i < numParticles; i++) {
    let angle = map(i, 0, numParticles, 0, TWO_PI);
    let x = centerX + cos(angle) * radius;
    let y = centerY + sin(angle) * radius;
    
    particles.push(new Particle(x, y, angle, i));
  }
}

function createControlPanel() {
  // Create main control panel div
  controlPanel = createElement('div');
  controlPanel.position(20, 20);
  controlPanel.id('control-panel');
  
  // Style the control panel
  let panelStyle = `
    background-color: rgba(255, 255, 255, 0.8);
    padding: 15px;
    border-radius: 10px;
    box-shadow: 0 0 10px rgba(0, 0, 0, 0.2);
    width: 250px;
    font-family: Arial, sans-serif;
  `;
  controlPanel.style(panelStyle);
  
  // Panel title
  let title = createElement('h3', 'Controls');
  title.parent(controlPanel);
  title.style('margin-top: 0; margin-bottom: 15px;');
  
  // Create all sliders
  createSliderGroup('Particles', 10, 100, numParticles, 1, (val) => {
    numParticles = val;
    createParticles();
  });
  
  createSliderGroup('Radius', 50, 400, radius, 10, (val) => {
    radius = val;
    updateParticlePositions();
  });
  
  createSliderGroup('Wave Amplitude', 0, 50, oscillationAmount, 1, (val) => {
    oscillationAmount = val;
  });
  
  createSliderGroup('Wave Speed', 0, 0.1, oscillationSpeed, 0.001, (val) => {
    oscillationSpeed = val;
  });
  
  createSliderGroup('Rotation', -0.002, 0.002, rotationSpeed, 0.0001, (val) => {
    rotationSpeed = val;
  });
  
  createSliderGroup('Mouse Force', 0, 0.5, mouseRepelForce, 0.01, (val) => {
    mouseRepelForce = val;
  });
  
  createSliderGroup('Spring', 0.01, 0.2, springStrength, 0.01, (val) => {
    springStrength = val;
  });
  
  createSliderGroup('Mouse Size Effect', 0, 10, mouseProximityScale, 0.1, (val) => {
    mouseProximityScale = val;
  });
  
  // Auto Focus Controls
  let autoTitle = createElement('h4', 'Automatic Focus');
  autoTitle.parent(controlPanel);
  autoTitle.style('margin-top: 20px; margin-bottom: 10px;');
  
  // Auto Focus Toggles
  let toggleContainer = createElement('div');
  toggleContainer.parent(controlPanel);
  toggleContainer.style('margin-bottom: 12px; display: flex; align-items: center;');
  
  let toggleLabel = createElement('span', 'Enable Auto Focus:');
  toggleLabel.parent(toggleContainer);
  
  toggleAutoFocus = createCheckbox('', autoFocus);
  toggleAutoFocus.parent(toggleContainer);
  toggleAutoFocus.style('margin-left: auto;');
  toggleAutoFocus.changed(() => {
    autoFocus = toggleAutoFocus.checked();
  });
  
  // Show Indicators Toggle
  let indicatorContainer = createElement('div');
  indicatorContainer.parent(controlPanel);
  indicatorContainer.style('margin-bottom: 12px; display: flex; align-items: center;');
  
  let indicatorLabel = createElement('span', 'Show Indicators:');
  indicatorLabel.parent(indicatorContainer);
  
  let toggleIndicators = createCheckbox('', showAutoFocusIndicators);
  toggleIndicators.parent(indicatorContainer);
  toggleIndicators.style('margin-left: auto;');
  toggleIndicators.changed(() => {
    showAutoFocusIndicators = toggleIndicators.checked();
  });
  
  // Show/Hide Lines Toggle
  let linesContainer = createElement('div');
  linesContainer.parent(controlPanel);
  linesContainer.style('margin-bottom: 12px; display: flex; align-items: center;');
  
  let linesLabel = createElement('span', 'Show Lines:');
  linesLabel.parent(linesContainer);
  
  let toggleLines = createCheckbox('', showLines);
  toggleLines.parent(linesContainer);
  toggleLines.style('margin-left: auto;');
  toggleLines.changed(() => {
    showLines = toggleLines.checked();
  });
  
  // Auto Focus Speed
  createSliderGroup('Auto Speed', 0, 0.05, autoFocusSpeed, 0.001, (val) => {
    autoFocusSpeed = val;
  });
  
  // Auto Focus Size Effect
  createSliderGroup('Auto Size Effect', 0, 10, autoFocusScale, 0.1, (val) => {
    autoFocusScale = val;
  });
  
  // Auto Focus Radius
  createSliderGroup('Auto Radius', 50, 400, autoFocusRadius, 10, (val) => {
    autoFocusRadius = val;
  });
  
  // Toggle controls button
  hideButton = createButton('Hide Controls');
  hideButton.parent(controlPanel);
  hideButton.style('width: 100%; padding: 8px; margin-top: 15px; cursor: pointer;');
  hideButton.mousePressed(toggleControls);
}

function createSliderGroup(labelText, min, max, defaultValue, step, callback) {
  // Create container for this slider group
  let container = createElement('div');
  container.parent(controlPanel);
  container.style('margin-bottom: 12px;');
  
  // Create the label row with value display
  let labelRow = createElement('div');
  labelRow.parent(container);
  labelRow.style('display: flex; justify-content: space-between; margin-bottom: 5px;');
  
  // Add label
  let label = createElement('span', labelText);
  label.parent(labelRow);
  
  // Add value display
  let valueDisplay = createElement('span', defaultValue);
  valueDisplay.parent(labelRow);
  
  // Create the slider
  let slider = createSlider(min, max, defaultValue, step);
  slider.parent(container);
  slider.style('width: 100%;');
  
  // Handle slider input
  slider.input(() => {
    let val = slider.value();
    valueDisplay.html(val);
    callback(val);
  });
}

function toggleControls() {
  showControls = !showControls;
  
  if (showControls) {
    controlPanel.style('display: block;');
    hideButton.html('Hide Controls');
  } else {
    controlPanel.style('display: none;');
    hideButton.html('Show Controls');
  }
}

function updateParticlePositions() {
  for (let i = 0; i < particles.length; i++) {
    let angle = particles[i].homeAngle;
    particles[i].home.x = centerX + cos(angle) * radius;
    particles[i].home.y = centerY + sin(angle) * radius;
  }
}

function draw() {
  background(0, 0, 100, 0.2); // Semi-transparent white for slight trails
  
  // Update automatic focus point (simulates mouse movement)
  if (autoFocus) {
    autoFocusAngle += autoFocusSpeed;
    autoFocusPoint.x = centerX + cos(autoFocusAngle) * autoFocusRadius;
    autoFocusPoint.y = centerY + sin(autoFocusAngle) * autoFocusRadius;
    
    // Visualize the auto focus point if indicators are enabled
    if (showAutoFocusIndicators) {
      push();
      noFill();
      stroke(0, 0, 70, 0.3);
      strokeWeight(1);
      ellipse(centerX, centerY, autoFocusRadius * 2);
      
      fill(0, 100, 100, 0.5);
      noStroke();
      ellipse(autoFocusPoint.x, autoFocusPoint.y, 10);
      pop();
    }
  }
  
  // Update all particles
  for (let particle of particles) {
    particle.update();
    particle.display();
  }
  
  // Draw lines between adjacent particles if showLines is true
  if (showLines) {
    stroke(0, 0, 50, 0.3);
    strokeWeight(1);
    for (let i = 0; i < particles.length; i++) {
      let p1 = particles[i];
      let p2 = particles[(i + 1) % particles.length];
      line(p1.pos.x, p1.pos.y, p2.pos.x, p2.pos.y);
    }
  }
}

// Resize canvas when window is resized
function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  centerX = width / 2;
  centerY = height / 2;
  
  // Update particle home positions
  updateParticlePositions();
}

// Particle class
class Particle {
  constructor(x, y, angle, index) {
    this.pos = createVector(x, y);
    this.vel = createVector(0, 0);
    this.acc = createVector(0, 0);
    
    // Home position (where particle wants to return to)
    this.home = createVector(x, y);
    this.homeAngle = angle;
    this.index = index; // Store particle index for phased oscillation
    
    // Autonomous movement offset
    this.oscillationOffset = random(TWO_PI); // Random starting phase
    this.rotationOffset = 0;
    
    // Appearance
    this.baseSize = random(4, 8);
    this.size = this.baseSize; // Current size including mouse influence
    this.hue = map(angle, 0, TWO_PI, 0, 360);
    
    // Mouse interaction
    this.mouseProximityScale = 0; // How much the particle grows due to mouse proximity
    this.mouseInfluenceRadius = 150; // How close mouse needs to be to affect size
  }
  
  update() {
    // Update autonomous movement
    this.updateAutonomousMovement();
    
    // Reset acceleration
    this.acc.mult(0);
    
    // Spring force towards current home position (which now moves)
    let springForce = p5.Vector.sub(this.home, this.pos);
    springForce.mult(springStrength);
    this.acc.add(springForce);
    
    // Size scaling - from mouse or auto focus point
    let proximityScale = 0;
    
    // Mouse interaction
    if (mouseX > 0 && mouseX < width && mouseY > 0 && mouseY < height) {
      let mousePos = createVector(mouseX, mouseY);
      let dir = p5.Vector.sub(this.pos, mousePos);
      let d = dir.mag();
      
      // Mouse repel force - particles move away from mouse cursor
      if (d < mouseRepelRadius) {
        let force = map(d, 0, mouseRepelRadius, mouseRepelForce, 0);
        dir.normalize();
        dir.mult(force);
        this.acc.add(dir);
      }
      
      // Mouse proximity scaling - particles get larger as mouse approaches
      if (d < this.mouseInfluenceRadius) {
        // Calculate mouse-based scale factor
        let mouseScale = map(d, 0, this.mouseInfluenceRadius, mouseProximityScale, 0);
        // Use the larger scale factor (mouse or auto)
        proximityScale = max(proximityScale, mouseScale);
      }
    }
    
    // Auto focus interaction (simulates mouse movement)
    if (autoFocus) {
      let focusPos = createVector(autoFocusPoint.x, autoFocusPoint.y);
      let dir = p5.Vector.sub(this.pos, focusPos);
      let d = dir.mag();
      
      // Auto focus repel force (optional, can be weaker than mouse)
      if (d < mouseRepelRadius * 0.7) {  // Smaller influence radius
        let force = map(d, 0, mouseRepelRadius * 0.7, mouseRepelForce * 0.5, 0);  // Weaker force
        dir.normalize();
        dir.mult(force);
        this.acc.add(dir);
      }
      
      // Auto focus scaling - particles get larger as focus approaches
      if (d < this.mouseInfluenceRadius) {
        // Calculate auto-based scale factor
        let autoScale = map(d, 0, this.mouseInfluenceRadius, autoFocusScale, 0);
        // Use the larger scale factor (mouse or auto)
        proximityScale = max(proximityScale, autoScale);
      }
    }
    
    // Apply the final scale factor with smooth transition
    this.mouseProximityScale = lerp(this.mouseProximityScale, proximityScale, 0.2);
    
    // Update velocity and position
    this.vel.add(this.acc);
    this.vel.mult(damping); // Add damping
    this.pos.add(this.vel);
  }
  
  updateAutonomousMovement() {
    // Update rotation over time
    this.rotationOffset += rotationSpeed;
    
    // Calculate new angle with rotation
    let currentAngle = this.homeAngle + this.rotationOffset;
    
    // Add oscillation effect (using sine wave)
    // Phase the oscillation based on particle index for a wave effect
    let phaseShift = this.index * (TWO_PI / numParticles / 2);
    let oscillation = sin(frameCount * oscillationSpeed + this.oscillationOffset + phaseShift) * oscillationAmount;
    
    // Calculate new home position with rotation and oscillation
    let currentRadius = radius + oscillation;
    this.home.x = centerX + cos(currentAngle) * currentRadius;
    this.home.y = centerY + sin(currentAngle) * currentRadius;
  }
  
  display() {
    // Calculate color based on distance from ideal position
    let idealPos = createVector(
      centerX + cos(this.homeAngle + this.rotationOffset) * radius,
      centerY + sin(this.homeAngle + this.rotationOffset) * radius
    );
    
    let distFromIdeal = p5.Vector.dist(this.pos, idealPos);
    let saturation = map(constrain(distFromIdeal, 0, 100), 0, 100, 60, 100);
    
    // Subtle size pulsing based on oscillation
    let pulseAmount = sin(frameCount * 0.05 + this.oscillationOffset) * 0.2 + 1;
    
    // Calculate final display size including mouse proximity effect
    let finalSize = this.baseSize * pulseAmount * (1 + this.mouseProximityScale);
    
    // Draw particle
    noStroke();
    fill(this.hue, saturation, 90, 0.85);
    ellipse(this.pos.x, this.pos.y, finalSize);
  }
}
