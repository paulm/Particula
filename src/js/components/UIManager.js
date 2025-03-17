/**
 * UIManager class
 * Handles all UI components and interactions
 */
class UIManager {
  /**
   * Initialize the UI
   */
  static initialize() {
    this.showControls = true;
    this.controlPanel = null;
    this.hideButton = null;
    this.autoFocusSections = [];
    
    this.createControlPanel();
  }
  
  /**
   * Create the main control panel
   */
  static createControlPanel() {
    // Create main control panel div
    this.controlPanel = createElement('div');
    this.controlPanel.position(20, 20);
    this.controlPanel.id('control-panel');
    
    // Style the control panel
    const panelStyle = `
      background-color: rgba(255, 255, 255, ${Config.ui.panel.opacity});
      padding: ${Config.ui.panel.padding}px;
      border-radius: ${Config.ui.panel.borderRadius}px;
      box-shadow: 0 0 10px rgba(0, 0, 0, 0.2);
      width: ${Config.ui.panel.width}px;
      font-family: Arial, sans-serif;
      max-height: 80vh;
      overflow-y: auto;
      overflow-x: hidden;
    `;
    this.controlPanel.style(panelStyle);
    
    // Panel title
    const title = createElement('h3', 'Controls');
    title.parent(this.controlPanel);
    title.style('margin-top: 0; margin-bottom: 15px;');
    
    // Create all sections
    this.createBasicSettingsSection();
    this.createMotionSettingsSection();
    this.createInteractionSettingsSection();
    this.createIntervalSettingsSection();
    this.createAutoFocusSection();
    
    // Toggle controls button
    this.hideButton = createButton('Hide Controls');
    this.hideButton.parent(this.controlPanel);
    this.hideButton.style('width: 100%; padding: 8px; margin-top: 15px; cursor: pointer;');
    this.hideButton.mousePressed(() => this.toggleControls());
  }
  
  /**
   * Create the Basic Settings section
   */
  static createBasicSettingsSection() {
    const basicSection = this.createCollapsibleSection('Basic Settings', true);
    
    // Particles count slider
    this.createSliderGroup(
      'Particles', 
      10, 300, 
      ParticleSystem.count, 
      1,
      (val) => {
        const diff = val - ParticleSystem.count;
        if (diff > 0) {
          ParticleSystem.addParticles(diff);
        } else if (diff < 0) {
          ParticleSystem.removeParticles(Math.abs(diff));
        }
        ParticleSystem.count = val;
      },
      basicSection
    );
    
    // Radius slider
    this.createSliderGroup(
      'Radius', 
      50, 400, 
      Config.particles.radius, 
      10,
      (val) => {
        Config.particles.radius = val;
        ParticleSystem.updateParticlePositions(val);
      },
      basicSection
    );
    
    // Color scheme selector
    this.createColorSchemeSelector(basicSection);
    
    // Show lines toggle
    this.createToggle(
      'Show Lines', 
      IntervalManager.showLines,
      (checked) => { IntervalManager.showLines = checked; },
      basicSection
    );
  }
  
  /**
   * Create the Motion Settings section
   */
  static createMotionSettingsSection() {
    const motionSection = this.createCollapsibleSection('Motion Settings', false);
    
    // Wave Amplitude slider
    this.createSliderGroup(
      'Wave Amplitude', 
      0, 50, 
      Config.particles.motion.oscillationAmount, 
      1,
      (val) => { Config.particles.motion.oscillationAmount = val; },
      motionSection
    );
    
    // Wave Speed slider
    this.createSliderGroup(
      'Wave Speed', 
      0, 0.1, 
      Config.particles.motion.oscillationSpeed, 
      0.001,
      (val) => { Config.particles.motion.oscillationSpeed = val; },
      motionSection
    );
    
    // Rotation slider
    this.createSliderGroup(
      'Rotation', 
      -0.03, 0.03, 
      Config.particles.motion.rotationSpeed, 
      0.0001,
      (val) => { Config.particles.motion.rotationSpeed = val; },
      motionSection
    );
  }
  
  /**
   * Create the Interaction Settings section
   */
  static createInteractionSettingsSection() {
    const interactionSection = this.createCollapsibleSection('Interaction Settings', false);
    
    // Mouse Force slider
    this.createSliderGroup(
      'Mouse Force', 
      0, 0.5, 
      Config.mouse.repelForce, 
      0.01,
      (val) => { Config.mouse.repelForce = val; },
      interactionSection
    );
    
    // Spring slider
    this.createSliderGroup(
      'Spring', 
      0.01, 0.2, 
      Config.particles.spring.strength, 
      0.01,
      (val) => { Config.particles.spring.strength = val; },
      interactionSection
    );
    
    // Mouse Size Effect slider
    this.createSliderGroup(
      'Mouse Size Effect', 
      0, 10, 
      Config.mouse.proximityScale, 
      0.1,
      (val) => { Config.mouse.proximityScale = val; },
      interactionSection
    );
  }
  
  /**
   * Create the Interval Settings section
   */
  static createIntervalSettingsSection() {
    const intervalSection = this.createCollapsibleSection('Interval', false);
    
    // Radius Interval controls
    const radiusGroup = this.createGroupContainer(intervalSection);
    
    // Radius Interval toggle
    this.createToggle(
      'Pulse Radius', 
      IntervalManager.radiusIntervalEnabled,
      (checked) => { IntervalManager.setRadiusIntervalEnabled(checked); },
      radiusGroup
    );
    
    // Radius Interval Time slider
    this.createSliderGroup(
      'Radius Interval (sec)', 
      0, 10, 
      IntervalManager.radiusIntervalTime / 1000, 
      0.1,
      (val) => { IntervalManager.setRadiusIntervalTime(val); },
      radiusGroup
    );
    
    // Highlight controls
    const highlightGroup = this.createGroupContainer(intervalSection);
    
    // Highlight toggle
    this.createToggle(
      'Highlight Particles', 
      IntervalManager.highlightEnabled,
      (checked) => { IntervalManager.setHighlightEnabled(checked); },
      highlightGroup
    );
    
    // Highlight Interval Time slider
    this.createSliderGroup(
      'Highlight Interval (sec)', 
      0, 3, 
      IntervalManager.highlightIntervalTime / 1000, 
      0.1,
      (val) => { IntervalManager.setHighlightIntervalTime(val); },
      highlightGroup
    );
    
    // Particle Count controls
    const countGroup = this.createGroupContainer(intervalSection, false);
    
    // Particle Count toggle
    this.createToggle(
      'Vary Particle Count', 
      IntervalManager.particleCountEnabled,
      (checked) => { IntervalManager.setParticleCountEnabled(checked); },
      countGroup
    );
    
    // Particle Count Interval Time slider
    this.createSliderGroup(
      'Count Interval (sec)', 
      0, 3, 
      IntervalManager.particleCountIntervalTime / 1000, 
      0.1,
      (val) => { IntervalManager.setParticleCountIntervalTime(val); },
      countGroup
    );
    
    // Particle Count Step Size slider
    this.createSliderGroup(
      'Number of Particles', 
      1, 20, 
      IntervalManager.particleCountStep, 
      1,
      (val) => { IntervalManager.setParticleCountStep(val); },
      countGroup
    );
  }
  
  /**
   * Create the Auto Focus section
   */
  static createAutoFocusSection() {
    // Create container for all auto focus sections
    const autoFocusContainer = createElement('div');
    autoFocusContainer.parent(this.controlPanel);
    autoFocusContainer.id('auto-focus-container');
    autoFocusContainer.style('margin-bottom: 15px;');
    
    // Add button to add new auto focus instances
    const addButton = createButton('+ Add Auto Focus');
    addButton.parent(autoFocusContainer);
    addButton.style('width: 100%; padding: 8px; margin-bottom: 15px; cursor: pointer; background-color: #4CAF50; color: white; border: none; border-radius: 4px;');
    addButton.mousePressed(() => this.addNewAutoFocus());
    
    // Create controls for existing auto focus points
    for (let i = 0; i < AutoFocusManager.points.length; i++) {
      this.createAutoFocusControls(i);
    }
  }
  
  /**
   * Add a new auto focus point
   */
  static addNewAutoFocus() {
    // Create with opposite settings of first point
    const firstPoint = AutoFocusManager.points[0];
    const newIndex = AutoFocusManager.createAutoFocusPoint({
      enabled: true,
      radius: 200,
      speed: 0.025,
      angle: random(TWO_PI),
      point: { x: 0, y: 0 },
      scale: 5.0,
      spring: 0.3,
      showIndicators: false,
      clockwise: !firstPoint.clockwise,
      color: Config.autoFocus.colors[AutoFocusManager.points.length % Config.autoFocus.colors.length]
    });
    
    // Create UI controls
    this.createAutoFocusControls(newIndex);
  }
  
  /**
   * Create controls for an auto focus point
   * @param {number} index - Index of the auto focus point
   */
  static createAutoFocusControls(index) {
    const point = AutoFocusManager.points[index];
    const colorLabel = `Auto Focus ${index + 1}`;
    
    // Create collapsible section
    const autoFocusSection = this.createCollapsibleSection(colorLabel, index === 0);
    this.autoFocusSections[index] = autoFocusSection;
    
    // Add color indicator to section header
    const sectionHeader = autoFocusSection.elt.parentElement.querySelector('div');
    const colorIndicator = createElement('div');
    colorIndicator.style(`
      width: 12px;
      height: 12px;
      border-radius: 50%;
      background-color: hsl(${point.color.h}, ${point.color.s}%, ${point.color.b / 2}%);
      display: inline-block;
      margin-right: 8px;
    `);
    
    // Add to header
    sectionHeader.insertBefore(colorIndicator.elt, sectionHeader.firstChild);
    
    // Add remove button for all except first point
    if (index > 0) {
      const removeButton = createButton('×');
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
      removeButton.mousePressed(() => this.removeAutoFocus(index));
    }
    
    // Enable toggle
    this.createToggle(
      'Enable', 
      point.enabled,
      (checked) => { point.enabled = checked; },
      autoFocusSection
    );
    
    // Show Indicators toggle
    this.createToggle(
      'Show Indicators', 
      point.showIndicators,
      (checked) => { point.showIndicators = checked; },
      autoFocusSection
    );
    
    // Clockwise toggle
    this.createToggle(
      'Clockwise', 
      point.clockwise,
      (checked) => {
        point.clockwise = checked;
        point.speed = Math.abs(point.speed) * (point.clockwise ? 1 : -1);
      },
      autoFocusSection
    );
    
    // Speed slider
    this.createSliderGroup(
      'Speed', 
      0, 0.20, 
      Math.abs(point.speed), 
      0.001,
      (val) => { point.speed = val * (point.clockwise ? 1 : -1); },
      autoFocusSection
    );
    
    // Size Effect slider
    this.createSliderGroup(
      'Size Effect', 
      0, 10, 
      point.scale, 
      0.1,
      (val) => { point.scale = val; },
      autoFocusSection
    );
    
    // Radius slider
    this.createSliderGroup(
      'Radius', 
      50, 400, 
      point.radius, 
      10,
      (val) => { point.radius = val; },
      autoFocusSection
    );
    
    // Spring slider
    this.createSliderGroup(
      'Spring', 
      0, 1, 
      point.spring, 
      0.05,
      (val) => { point.spring = val; },
      autoFocusSection
    );
  }
  
  /**
   * Remove an auto focus point
   * @param {number} index - Index of the point to remove
   */
  static removeAutoFocus(index) {
    // Remove from manager
    AutoFocusManager.removeAutoFocusPoint(index);
    
    // Remove UI section
    if (this.autoFocusSections[index] && 
        this.autoFocusSections[index].elt && 
        this.autoFocusSections[index].elt.parentElement) {
      this.autoFocusSections[index].elt.parentElement.remove();
    }
    
    // Rebuild all controls to update indices
    this.rebuildAutoFocusControls();
  }
  
  /**
   * Rebuild all auto focus controls
   */
  static rebuildAutoFocusControls() {
    // Clear existing sections
    const container = select('#auto-focus-container');
    for (let section of this.autoFocusSections) {
      if (section && section.elt && section.elt.parentElement) {
        section.elt.parentElement.remove();
      }
    }
    
    // Reset array
    this.autoFocusSections = [];
    
    // Recreate for all current points
    for (let i = 0; i < AutoFocusManager.points.length; i++) {
      this.createAutoFocusControls(i);
    }
  }
  
  /**
   * Create a collapsible section
   * @param {string} title - Section title
   * @param {boolean} startOpen - Whether section should start open
   * @returns {Element} - The content container element
   */
  static createCollapsibleSection(title, startOpen = true) {
    // Create section container
    const section = createElement('div');
    section.parent(this.controlPanel);
    section.addClass('collapsible-section');
    section.style('margin-bottom: 15px; border: 1px solid rgba(0,0,0,0.1); border-radius: 5px; overflow: hidden;');
    
    // Create header/toggle
    const header = createElement('div', title);
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
    const arrow = createElement('span', startOpen ? '▼' : '►');
    arrow.parent(header);
    
    // Create content container
    const content = createElement('div');
    content.parent(section);
    content.style(`
      padding: 10px;
      display: ${startOpen ? 'block' : 'none'};
    `);
    
    // Toggle functionality
    header.mousePressed(() => {
      const isVisible = content.style('display') !== 'none';
      content.style('display', isVisible ? 'none' : 'block');
      arrow.html(isVisible ? '►' : '▼');
    });
    
    return content;
  }
  
  /**
   * Create a group container with optional bottom border
   * @param {Element} parent - Parent element
   * @param {boolean} withBorder - Whether to add bottom border
   * @returns {Element} - The group container
   */
  static createGroupContainer(parent, withBorder = true) {
    const group = createElement('div');
    group.parent(parent);
    
    if (withBorder) {
      group.style('margin-bottom: 15px; border-bottom: 1px solid rgba(0,0,0,0.1); padding-bottom: 10px;');
    } else {
      group.style('margin-bottom: 15px;');
    }
    
    return group;
  }
  
  /**
   * Create a slider group with label and value display
   * @param {string} labelText - Label text
   * @param {number} min - Minimum value
   * @param {number} max - Maximum value
   * @param {number} defaultValue - Default value
   * @param {number} step - Step size
   * @param {Function} callback - Callback function when value changes
   * @param {Element} parent - Parent element
   * @returns {Object} - Object containing slider and value display
   */
  static createSliderGroup(labelText, min, max, defaultValue, step, callback, parent = null) {
    // Create container
    const container = createElement('div');
    container.parent(parent || this.controlPanel);
    container.style('margin-bottom: 12px;');
    
    // Create label row with value display
    const labelRow = createElement('div');
    labelRow.parent(container);
    labelRow.style('display: flex; justify-content: space-between; margin-bottom: 5px;');
    
    // Add label
    const label = createElement('span', labelText);
    label.parent(labelRow);
    
    // Add value display
    const valueDisplay = createElement('span', defaultValue);
    valueDisplay.parent(labelRow);
    
    // Create slider
    const slider = createSlider(min, max, defaultValue, step);
    slider.parent(container);
    slider.style('width: 100%;');
    
    // Handle input
    slider.input(() => {
      const val = slider.value();
      valueDisplay.html(val);
      callback(val);
    });
    
    return { slider, valueDisplay };
  }
  
  /**
   * Create a toggle switch
   * @param {string} labelText - Label text
   * @param {boolean} defaultValue - Default checked state
   * @param {Function} callback - Callback function when toggled
   * @param {Element} parent - Parent element
   * @returns {Object} - Object containing container and checkbox
   */
  static createToggle(labelText, defaultValue, callback, parent) {
    // Create container
    const container = createElement('div');
    container.parent(parent);
    container.style('margin-bottom: 12px; display: flex; align-items: center;');
    
    // Add label
    const label = createElement('span', labelText);
    label.parent(container);
    
    // Create checkbox
    const checkbox = createCheckbox('', defaultValue);
    checkbox.parent(container);
    checkbox.style('margin-left: auto;');
    
    // Handle change
    checkbox.changed(() => {
      callback(checkbox.checked());
    });
    
    return { container, checkbox };
  }
  
  /**
   * Create color scheme selector
   * @param {Element} parent - Parent element
   */
  static createColorSchemeSelector(parent) {
    // Create container
    const container = createElement('div');
    container.parent(parent);
    container.style('margin-bottom: 12px; display: flex; align-items: center;');
    
    // Add label
    const label = createElement('span', 'Color Scheme:');
    label.parent(container);
    
    // Create dropdown
    const select = createSelect();
    select.parent(container);
    select.style('margin-left: auto; width: 130px;');
    
    // Add options
    for (let i = 0; i < Config.colorSchemes.length; i++) {
      select.option(Config.colorSchemes[i].name, i);
    }
    
    // Set initial value
    select.selected(ParticleSystem.currentColorScheme);
    
    // Handle change
    select.changed(() => {
      const schemeIndex = parseInt(select.value());
      ParticleSystem.changeColorScheme(schemeIndex);
    });
  }
  
  /**
   * Toggle control panel visibility
   */
  static toggleControls() {
    this.showControls = !this.showControls;
    
    if (this.showControls) {
      this.controlPanel.style('display: block;');
      this.hideButton.html('Hide Controls');
    } else {
      this.controlPanel.style('display: none;');
      this.hideButton.html('Show Controls');
    }
  }
}