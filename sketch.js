// Reactive Circle Particles
let particles = [];
let numParticles = 100;
let radius = 240;
let centerX, centerY;

// Spring physics
let springStrength = 0.05;
let mouseRepelForce = 0.45;
let mouseRepelRadius = 150;
let damping = 0.8;

// Autonomous movement
let rotationSpeed = 0.0006; // Very slow rotation
let oscillationAmount = 3; // How much particles oscillate
let oscillationSpeed = 0.042; // Speed of oscillation

// Mouse proximity effects
let mouseProximityScale = 8.7; // How much particles grow when mouse is close

// Auto Focus Points Collection (multiple instances)
let autoFocusPoints = [];
let autoFocusColors = [
  { h: 0, s: 100, b: 100 },    // Red
  { h: 200, s: 100, b: 100 },  // Cyan
  { h: 280, s: 100, b: 100 },  // Purple
  { h: 50, s: 100, b: 100 },   // Yellow
  { h: 130, s: 100, b: 100 },  // Green
  { h: 330, s: 100, b: 100 }   // Pink
];

// UI Controls
let showControls = true;
let showLines = false; // Add variable to control line visibility
let sliderParticles, sliderRadius, sliderWaveAmp, sliderWaveSpeed;
let sliderRotation, sliderMouseForce, sliderSpring, sliderMouseSize;
let controlPanel, hideButton;

// Color schemes
let colorSchemes = [
  { name: "Rainbow", getHue: (angle) => map(angle, 0, TWO_PI, 0, 360) },
  { name: "Monochrome", getHue: (angle) => 0, saturation: 0, brightness: 30 },
  { name: "Ocean", getHue: (angle) => map(angle, 0, TWO_PI, 180, 240) },
  { name: "Sunset", getHue: (angle) => map(angle, 0, TWO_PI, 0, 60) },
  { name: "Neon", getHue: (angle) => floor(angle / (PI/3)) * 60 }
];
let currentColorScheme = 0;

// Auto focus section containers
let autoFocusSections = [];

function setup() {
  createCanvas(windowWidth, windowHeight);
  colorMode(HSB, 360, 100, 100, 1);
  
  centerX = width / 2;
  centerY = height / 2;
  
  // Create first auto focus point
  createAutoFocusPoint({
    enabled: true,
    radius: 300,
    speed: -0.048, // Negative for counter-clockwise
    angle: 0,
    point: { x: 0, y: 0 },
    scale: 7.7,
    spring: 0.5, // Spring strength for this auto focus
    showIndicators: false,
    clockwise: false,
    color: autoFocusColors[0]
  });
  
  // Create particles arranged in a circle
  createParticles();
  
  // Setup control panel with HTML elements
  createControlPanel();
}

function createAutoFocusPoint(config) {
  autoFocusPoints.push(config);
  return autoFocusPoints.length - 1; // Return the index of the created point
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
    max-height: 80vh;
    overflow-y: auto;
    overflow-x: hidden;
  `;
  controlPanel.style(panelStyle);
  
  // Panel title
  let title = createElement('h3', 'Controls');
  title.parent(controlPanel);
  title.style('margin-top: 0; margin-bottom: 15px;');
  
  // Create collapsible sections
  
  // SECTION 1: Basic Settings
  let basicSection = createCollapsibleSection('Basic Settings', true);
  
  // Create basic sliders in this section
  createSliderGroup('Particles', 10, 300, numParticles, 1, (val) => {
    numParticles = val;
    createParticles();
  }, basicSection);
  
  createSliderGroup('Radius', 50, 400, radius, 10, (val) => {
    radius = val;
    updateParticlePositions();
  }, basicSection);
  
  // Color Scheme Selector
  let colorContainer = createElement('div');
  colorContainer.parent(basicSection);
  colorContainer.style('margin-bottom: 12px; display: flex; align-items: center;');
  
  let colorLabel = createElement('span', 'Color Scheme:');
  colorLabel.parent(colorContainer);
  
  let colorSelect = createSelect();
  colorSelect.parent(colorContainer);
  colorSelect.style('margin-left: auto; width: 130px;');
  
  // Add all color schemes to dropdown
  for (let i = 0; i < colorSchemes.length; i++) {
    colorSelect.option(colorSchemes[i].name, i);
  }
  
  // Set initial value
  colorSelect.selected(currentColorScheme);
  
  // Handle color scheme change
  colorSelect.changed(() => {
    currentColorScheme = parseInt(colorSelect.value());
    // Update existing particles with new colors
    for (let p of particles) {
      p.updateColor();
    }
  });
  
  // Show/Hide Lines Toggle
  let linesContainer = createElement('div');
  linesContainer.parent(basicSection);
  linesContainer.style('margin-bottom: 12px; display: flex; align-items: center;');
  
  let linesLabel = createElement('span', 'Show Lines:');
  linesLabel.parent(linesContainer);
  
  let toggleLines = createCheckbox('', showLines);
  toggleLines.parent(linesContainer);
  toggleLines.style('margin-left: auto;');
  toggleLines.changed(() => {
    showLines = toggleLines.checked();
  });
  
  // SECTION 2: Motion Settings
  let motionSection = createCollapsibleSection('Motion Settings', false);
  
  createSliderGroup('Wave Amplitude', 0, 50, oscillationAmount, 1, (val) => {
    oscillationAmount = val;
  }, motionSection);
  
  createSliderGroup('Wave Speed', 0, 0.1, oscillationSpeed, 0.001, (val) => {
    oscillationSpeed = val;
  }, motionSection);
  
  createSliderGroup('Rotation', -0.03, 0.03, rotationSpeed, 0.0001, (val) => {
    rotationSpeed = val;
  }, motionSection);
  
  // SECTION 3: Interaction Settings
  let interactionSection = createCollapsibleSection('Interaction Settings', false);
  
  createSliderGroup('Mouse Force', 0, 0.5, mouseRepelForce, 0.01, (val) => {
    mouseRepelForce = val;
  }, interactionSection);
  
  createSliderGroup('Spring', 0.01, 0.2, springStrength, 0.01, (val) => {
    springStrength = val;
  }, interactionSection);
  
  createSliderGroup('Mouse Size Effect', 0, 10, mouseProximityScale, 0.1, (val) => {
    mouseProximityScale = val;
  }, interactionSection);
  
  // SECTION 4: Auto Focus Controls
  // First create a container for all auto focus sections
  let autoFocusContainer = createElement('div');
  autoFocusContainer.parent(controlPanel);
  autoFocusContainer.id('auto-focus-container');
  autoFocusContainer.style('margin-bottom: 15px;');
  
  // Add a button to add new auto focus instances
  let addButton = createButton('+ Add Auto Focus');
  addButton.parent(autoFocusContainer);
  addButton.style('width: 100%; padding: 8px; margin-bottom: 15px; cursor: pointer; background-color: #4CAF50; color: white; border: none; border-radius: 4px;');
  addButton.mousePressed(() => {
    // Create a new auto focus point with default settings (opposite of first point)
    let newIndex = createAutoFocusPoint({
      enabled: true,
      radius: 200,
      speed: 0.025, // Positive for clockwise (opposite of first point)
      angle: random(TWO_PI), // Random starting angle
      point: { x: 0, y: 0 },
      scale: 5.0,
      spring: 0.3, // Default spring strength for new auto focus points
      showIndicators: false,
      clockwise: true, // Opposite of first point
      color: autoFocusColors[autoFocusPoints.length % autoFocusColors.length]
    });
    
    // Create UI controls for the new auto focus point
    createAutoFocusControls(newIndex);
  });
  
  // Create the first auto focus controls section
  createAutoFocusControls(0);
  
  // Toggle controls button
  hideButton = createButton('Hide Controls');
  hideButton.parent(controlPanel);
  hideButton.style('width: 100%; padding: 8px; margin-top: 15px; cursor: pointer;');
  hideButton.mousePressed(toggleControls);
}

function createAutoFocusControls(index) {
  const point = autoFocusPoints[index];
  const colorLabel = `Auto Focus ${index + 1}`;
  
  // Create a collapsible section for this auto focus point
  let autoFocusSection = createCollapsibleSection(colorLabel, index === 0);
  autoFocusSections[index] = autoFocusSection;
  
  // Add color indicator to the section header
  let sectionHeader = autoFocusSection.elt.parentElement.querySelector('div');
  let colorIndicator = createElement('div');
  colorIndicator.style(`
    width: 12px;
    height: 12px;
    border-radius: 50%;
    background-color: hsl(${point.color.h}, ${point.color.s}%, ${point.color.b / 2}%);
    display: inline-block;
    margin-right: 8px;
  `);
  
  // Insert color indicator before the title text
  sectionHeader.insertBefore(colorIndicator.elt, sectionHeader.firstChild);
  
  // Add remove button for all except the first auto focus point
  if (index > 0) {
    let removeButton = createButton('×');
    removeButton.style(`
      margin-left: 8px;
      background: none;
      border: none;
      font-size: 16px;
      cursor: pointer;
      color: #999;
      padding: 0 5px;
    `);
    removeButton.parent(sectionHeader);
    removeButton.mousePressed(() => {
      // Remove this auto focus point
      autoFocusPoints.splice(index, 1);
      // Remove the UI section
      autoFocusSection.elt.parentElement.remove();
      // Rebuild all auto focus controls (to update indices)
      rebuildAutoFocusControls();
    });
  }
  
  // Auto Focus Toggles
  let toggleContainer = createElement('div');
  toggleContainer.parent(autoFocusSection);
  toggleContainer.style('margin-bottom: 12px; display: flex; align-items: center;');
  
  let toggleLabel = createElement('span', 'Enable:');
  toggleLabel.parent(toggleContainer);
  
  let toggleAutoFocus = createCheckbox('', point.enabled);
  toggleAutoFocus.parent(toggleContainer);
  toggleAutoFocus.style('margin-left: auto;');
  toggleAutoFocus.changed(() => {
    point.enabled = toggleAutoFocus.checked();
  });
  
  // Show Indicators Toggle
  let indicatorContainer = createElement('div');
  indicatorContainer.parent(autoFocusSection);
  indicatorContainer.style('margin-bottom: 12px; display: flex; align-items: center;');
  
  let indicatorLabel = createElement('span', 'Show Indicators:');
  indicatorLabel.parent(indicatorContainer);
  
  let toggleIndicators = createCheckbox('', point.showIndicators);
  toggleIndicators.parent(indicatorContainer);
  toggleIndicators.style('margin-left: auto;');
  toggleIndicators.changed(() => {
    point.showIndicators = toggleIndicators.checked();
  });
  
  // Clockwise Toggle
  let clockwiseContainer = createElement('div');
  clockwiseContainer.parent(autoFocusSection);
  clockwiseContainer.style('margin-bottom: 12px; display: flex; align-items: center;');
  
  let clockwiseLabel = createElement('span', 'Clockwise:');
  clockwiseLabel.parent(clockwiseContainer);
  
  let toggleClockwise = createCheckbox('', point.clockwise);
  toggleClockwise.parent(clockwiseContainer);
  toggleClockwise.style('margin-left: auto;');
  toggleClockwise.changed(() => {
    point.clockwise = toggleClockwise.checked();
    // Adjust the sign of speed based on direction
    point.speed = Math.abs(point.speed) * (point.clockwise ? 1 : -1);
  });
  
  // Auto Focus Speed
  createSliderGroup('Speed', 0, 0.20, Math.abs(point.speed), 0.001, (val) => {
    // Preserve direction while changing magnitude
    point.speed = val * (point.clockwise ? 1 : -1);
  }, autoFocusSection);
  
  // Auto Focus Size Effect
  createSliderGroup('Size Effect', 0, 10, point.scale, 0.1, (val) => {
    point.scale = val;
  }, autoFocusSection);
  
  // Auto Focus Radius
  createSliderGroup('Radius', 50, 400, point.radius, 10, (val) => {
    point.radius = val;
  }, autoFocusSection);
  
  // Auto Focus Spring Strength
  createSliderGroup('Spring', 0, 1, point.spring, 0.05, (val) => {
    point.spring = val;
  }, autoFocusSection);
}

function rebuildAutoFocusControls() {
  // Remove all existing auto focus sections
  let container = select('#auto-focus-container');
  for (let section of autoFocusSections) {
    if (section && section.elt && section.elt.parentElement) {
      section.elt.parentElement.remove();
    }
  }
  
  // Clear the sections array
  autoFocusSections = [];
  
  // Rebuild the sections for all current auto focus points
  for (let i = 0; i < autoFocusPoints.length; i++) {
    createAutoFocusControls(i);
  }
}

// Function to create a collapsible section
function createCollapsibleSection(title, startOpen = true) {
  // Create a section container
  let section = createElement('div');
  section.parent(controlPanel);
  section.addClass('collapsible-section');
  section.style('margin-bottom: 15px; border: 1px solid rgba(0,0,0,0.1); border-radius: 5px; overflow: hidden;');
  
  // Create the header/toggle
  let header = createElement('div', title);
  header.parent(section);
  header.style(`
    background-color: rgba(0,0,0,0.05);
    padding: 8px 12px;
    cursor: pointer;
    display: flex;
    justify-content: space-between;
    align-items: center;
    user-select: none;
  `);
  
  // Add arrow indicator
  let arrow = createElement('span', startOpen ? '▼' : '►');
  arrow.parent(header);
  
  // Create the content container
  let content = createElement('div');
  content.parent(section);
  content.style(`
    padding: 10px;
    display: ${startOpen ? 'block' : 'none'};
  `);
  
  // Toggle functionality
  header.mousePressed(() => {
    let isVisible = content.style('display') !== 'none';
    content.style('display', isVisible ? 'none' : 'block');
    arrow.html(isVisible ? '►' : '▼');
  });
  
  return content;
}

function createSliderGroup(labelText, min, max, defaultValue, step, callback, parent = null) {
  // Create container for this slider group
  let container = createElement('div');
  container.parent(parent || controlPanel);
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
  
  // Update all auto focus points
  for (let i = 0; i < autoFocusPoints.length; i++) {
    let point = autoFocusPoints[i];
    
    if (point.enabled) {
      // Update angle (positive for clockwise, negative for counter-clockwise)
      point.angle += point.speed;
      point.point.x = centerX + cos(point.angle) * point.radius;
      point.point.y = centerY + sin(point.angle) * point.radius;
      
      // Visualize the auto focus point if indicators are enabled
      if (point.showIndicators) {
        push();
        noFill();
        stroke(point.color.h, point.color.s, point.color.b / 2, 0.3);
        strokeWeight(1);
        ellipse(centerX, centerY, point.radius * 2);
        
        fill(point.color.h, point.color.s, point.color.b, 0.5);
        noStroke();
        ellipse(point.point.x, point.point.y, 10);
        pop();
      }
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
    this.angle = angle; // Store the angle for color updates
    this.updateColor(); // Set initial color based on current scheme
    
    // Mouse/focus interaction
    this.proximityScale = 0; // How much the particle grows due to proximity
    this.influenceRadius = 150; // How close mouse/focus needs to be to affect size
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
    
    // Size scaling - from mouse or auto focus points
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
      if (d < this.influenceRadius) {
        // Calculate mouse-based scale factor
        let mouseScale = map(d, 0, this.influenceRadius, mouseProximityScale, 0);
        // Use the larger scale factor (mouse or auto)
        proximityScale = max(proximityScale, mouseScale);
      }
    }
    
    // Auto focus interaction for all enabled focus points
    for (let point of autoFocusPoints) {
      if (point.enabled) {
        let focusPos = createVector(point.point.x, point.point.y);
        let dir = p5.Vector.sub(this.pos, focusPos);
        let d = dir.mag();
        
        // Auto focus repel force - using point's custom spring value
        if (d < mouseRepelRadius * 0.7) {  // Smaller influence radius
          let force = map(d, 0, mouseRepelRadius * 0.7, mouseRepelForce * point.spring, 0);
          dir.normalize();
          dir.mult(force);
          this.acc.add(dir);
        }
        
        // Auto focus scaling - particles get larger as focus approaches
        if (d < this.influenceRadius) {
          // Calculate auto-based scale factor
          let autoScale = map(d, 0, this.influenceRadius, point.scale, 0);
          // Use the larger scale factor among all focus points
          proximityScale = max(proximityScale, autoScale);
        }
      }
    }
    
    // Apply the final scale factor with smooth transition
    this.proximityScale = lerp(this.proximityScale, proximityScale, 0.2);
    
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
  
  updateColor() {
    // Get the current color scheme
    const scheme = colorSchemes[currentColorScheme];
    // Update the hue based on the scheme's function
    this.hue = scheme.getHue(this.angle);
    // Store specific saturation and brightness if defined in the scheme
    this.customSaturation = scheme.saturation;
    this.customBrightness = scheme.brightness;
  }
  
  display() {
    // Calculate color based on distance from ideal position
    let idealPos = createVector(
      centerX + cos(this.homeAngle + this.rotationOffset) * radius,
      centerY + sin(this.homeAngle + this.rotationOffset) * radius
    );
    
    let distFromIdeal = p5.Vector.dist(this.pos, idealPos);
    
    // Use custom saturation if defined in the color scheme, otherwise calculate based on distance
    let saturation = this.customSaturation !== undefined ? 
      this.customSaturation : 
      map(constrain(distFromIdeal, 0, 100), 0, 100, 60, 100);
    
    // Use custom brightness if defined in the color scheme, otherwise use default
    let brightness = this.customBrightness !== undefined ? 
      this.customBrightness : 
      90;
    
    // Subtle size pulsing based on oscillation
    let pulseAmount = sin(frameCount * 0.05 + this.oscillationOffset) * 0.2 + 1;
    
    // Calculate final display size including proximity effect
    let finalSize = this.baseSize * pulseAmount * (1 + this.proximityScale);
    
    // Draw particle
    noStroke();
    fill(this.hue, saturation, brightness, 0.85);
    ellipse(this.pos.x, this.pos.y, finalSize);
  }
}