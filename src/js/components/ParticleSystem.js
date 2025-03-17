/**
 * ParticleSystem class
 * Manages the collection of particles and their interactions
 */
class ParticleSystem {
  /**
   * Initialize the particle system
   */
  static initialize() {
    this.particles = [];
    this.count = Config.particles.count;
    this.currentColorScheme = 0;
    
    // Queue for gradual particle additions/removals
    this.particlesQueuedForAction = 0;
    this.particleActionIsAddition = true;
    this.lastParticleActionTime = 0;
    this.particleActionInterval = 0;
    
    // Highlight tracking
    this.currentHighlightParticle = 0;
    this.highlightStartTime = 0;
    
    // Create initial particles
    this.createParticles();
  }
  
  /**
   * Create all particles in a circular arrangement
   */
  static createParticles() {
    this.particles = [];
    
    for (let i = 0; i < this.count; i++) {
      const angle = map(i, 0, this.count, 0, TWO_PI);
      const x = width/2 + cos(angle) * Config.particles.radius;
      const y = height/2 + sin(angle) * Config.particles.radius;
      
      this.particles.push(new Particle(x, y, angle, i));
    }
  }
  
  /**
   * Add a specific number of particles
   * @param {number} count - Number of particles to add
   */
  static addParticles(count) {
    const currentCount = this.particles.length;
    
    for (let i = 0; i < count; i++) {
      // Start new particles at the center
      const newParticle = new Particle(width/2, height/2, 0, currentCount + i);
      
      // Mark as new for special animation
      newParticle.isNew = true;
      newParticle.opacity = 0;
      
      // Insert at random position
      const insertIndex = floor(random(this.particles.length + 1));
      this.particles.splice(insertIndex, 0, newParticle);
    }
    
    // Redistribute particles evenly
    this.redistributeParticles();
  }
  
  /**
   * Remove a specific number of particles
   * @param {number} count - Number of particles to remove
   */
  static removeParticles(count) {
    const currentCount = this.particles.length;
    count = min(count, currentCount - 1); // Always keep at least one
    
    // Select random indices to remove
    let indices = [];
    let availableIndices = [...Array(currentCount).keys()];
    
    // Randomly select particles to remove
    for (let i = 0; i < count; i++) {
      if (availableIndices.length === 0) break;
      
      const randomIndex = floor(random(availableIndices.length));
      const particleIndex = availableIndices[randomIndex];
      
      // Remove from available options
      availableIndices.splice(randomIndex, 1);
      
      // Mark for removal animation
      if (particleIndex < this.particles.length) {
        this.particles[particleIndex].markForRemoval(
          { x: width/2, y: height/2 },
          600 // Duration in milliseconds
        );
        
        indices.push(particleIndex);
      }
    }
    
    // Schedule actual removal after animation
    setTimeout(() => {
      // Remove particles that were marked
      this.particles = this.particles.filter(p => !p.markedForRemoval);
      
      // Redistribute remaining particles
      this.redistributeParticles();
    }, 650); // Slightly longer than animation duration
  }
  
  /**
   * Redistribute all particles evenly around the circle
   */
  static redistributeParticles() {
    const totalParticles = this.particles.length;
    
    for (let i = 0; i < totalParticles; i++) {
      // Distribute evenly around circle
      const newAngle = map(i, 0, totalParticles, 0, TWO_PI);
      
      // Update particle properties
      this.particles[i].index = i;
      this.particles[i].homeAngle = newAngle;
      this.particles[i].angle = newAngle;
      this.particles[i].updateColor();
      
      // Calculate new home position
      const newX = width/2 + cos(newAngle) * Config.particles.radius;
      const newY = height/2 + sin(newAngle) * Config.particles.radius;
      
      // Handle special case for new particles
      if (this.particles[i].isNew) {
        this.particles[i].oldHome = { x: width/2, y: height/2 };
        this.particles[i].newParticleScale = 1.5;
        this.particles[i].homeTransitionDuration = 800;
        this.particles[i].isNew = false;
      } else {
        this.particles[i].oldHome = {
          x: this.particles[i].home.x,
          y: this.particles[i].home.y
        };
        this.particles[i].homeTransitionDuration = 500;
      }
      
      // Set up transition to new position
      this.particles[i].targetHome = { x: newX, y: newY };
      this.particles[i].homeTransitionStart = millis();
      this.particles[i].isTransitioning = true;
    }
  }
  
  /**
   * Update all particles
   */
  static update() {
    // Update and display each particle
    for (let particle of this.particles) {
      particle.update();
      particle.display();
    }
    
    // Draw connecting lines if enabled
    if (IntervalManager.showLines) {
      this.drawConnectingLines();
    }
  }
  
  /**
   * Draw lines connecting adjacent particles
   */
  static drawConnectingLines() {
    if (this.particles.length < 2) return;
    
    stroke(0, 0, 50, 0.3);
    strokeWeight(1);
    
    for (let i = 0; i < this.particles.length; i++) {
      const p1 = this.particles[i];
      const p2 = this.particles[(i + 1) % this.particles.length];
      line(p1.pos.x, p1.pos.y, p2.pos.x, p2.pos.y);
    }
  }
  
  /**
   * Change the color scheme
   * @param {number} schemeIndex - Index of the color scheme to use
   */
  static changeColorScheme(schemeIndex) {
    this.currentColorScheme = schemeIndex;
    
    // Update all particles with new colors
    for (let particle of this.particles) {
      particle.updateColor();
    }
  }
  
  /**
   * Start highlight effect for next particle
   */
  static highlightNextParticle() {
    if (this.particles.length === 0) return;
    
    this.currentHighlightParticle = (this.currentHighlightParticle + 1) % this.particles.length;
    this.highlightStartTime = millis();
    
    const particle = this.particles[this.currentHighlightParticle];
    particle.startHighlight(
      Config.intervals.highlight.duration,
      Config.intervals.highlight.scale
    );
  }
  
  /**
   * Update particle highlight animation
   */
  static updateHighlight() {
    if (this.highlightStartTime === 0) return;
    
    const currentTime = millis();
    if (this.currentHighlightParticle < this.particles.length) {
      const particle = this.particles[this.currentHighlightParticle];
      const isComplete = particle.updateHighlight(currentTime);
      
      if (isComplete) {
        this.highlightStartTime = 0;
      }
    }
  }
  
  /**
   * Queue particles for gradual addition/removal
   * @param {number} count - Number of particles to add/remove
   * @param {boolean} isAddition - Whether to add (true) or remove (false)
   * @param {number} intervalTime - Time interval in milliseconds
   */
  static queueParticleAction(count, isAddition, intervalTime) {
    this.particlesQueuedForAction = count;
    this.particleActionIsAddition = isAddition;
    this.particleActionInterval = intervalTime / count;
    this.lastParticleActionTime = millis();
  }
  
  /**
   * Process gradual particle additions/removals
   */
  static processParticleQueue() {
    if (this.particlesQueuedForAction <= 0) return;
    
    const currentTime = millis();
    if (currentTime - this.lastParticleActionTime >= this.particleActionInterval) {
      if (this.particleActionIsAddition) {
        // Add one particle at a time
        this.addParticles(1);
        this.count++;
      } else {
        // Remove one particle at a time
        this.removeParticles(1);
        this.count--;
      }
      
      // Update the UI slider to match the new count
      UIManager.updateParticlesSlider(this.count);
      
      // Update queue and timing
      this.particlesQueuedForAction--;
      this.lastParticleActionTime = currentTime;
    }
  }
  
  /**
   * Update all particle positions based on current radius
   * @param {number} radius - New radius value
   */
  static updateParticlePositions(radius) {
    for (let i = 0; i < this.particles.length; i++) {
      const angle = this.particles[i].homeAngle;
      const x = width/2 + cos(angle) * radius;
      const y = height/2 + sin(angle) * radius;
      
      // Update home position directly (no transition)
      this.particles[i].home.x = x;
      this.particles[i].home.y = y;
    }
  }
}