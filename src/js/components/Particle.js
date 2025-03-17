/**
 * Particle class
 * Represents a single particle in the system
 */
class Particle {
  /**
   * Create a new particle
   * @param {number} x - Initial x position
   * @param {number} y - Initial y position
   * @param {number} angle - Angular position around the circle
   * @param {number} index - Index in the particle array
   */
  constructor(x, y, angle, index) {
    // Position and physics
    this.pos = createVector(x, y);
    this.vel = createVector(0, 0);
    this.acc = createVector(0, 0);
    
    // Home position (where particle wants to return to)
    this.home = createVector(x, y);
    this.homeAngle = angle;
    this.index = index;
    
    // Autonomous movement
    this.oscillationOffset = random(TWO_PI);
    this.rotationOffset = 0;
    
    // Appearance
    this.baseSize = random(Config.particles.minSize, Config.particles.maxSize);
    this.angle = angle;
    this.opacity = Config.particles.opacity;
    this.updateColor();
    
    // Effects
    this.proximityScale = 0;
    this.influenceRadius = Config.mouse.repelRadius;
    
    // Transition properties
    this.isTransitioning = false;
    this.oldHome = null;
    this.targetHome = null;
    this.homeTransitionStart = 0;
    this.homeTransitionDuration = 0;
    
    // Highlight effect properties
    this.isHighlighted = false;
    this.highlightScale = 1;
    this.originalHue = 0;
    this.originalSaturation = 0;
    this.originalBrightness = 0;
    this.tempHue = undefined;
    this.tempSaturation = undefined;
    this.tempBrightness = undefined;
    
    // Removal properties
    this.markedForRemoval = false;
    this.removalStartTime = 0;
    this.removalDuration = 0;
    this.removalTarget = null;
    
    // New particle properties
    this.isNew = false;
    this.newParticleScale = 1;
  }
  
  /**
   * Update the particle's color based on current color scheme
   */
  updateColor() {
    const scheme = Config.colorSchemes[ParticleSystem.currentColorScheme];
    this.hue = scheme.getHue(this.angle);
    this.customSaturation = scheme.saturation;
    this.customBrightness = scheme.brightness;
  }
  
  /**
   * Update the particle's position and properties
   */
  update() {
    const currentTime = millis();
    
    // Handle removal animation if marked for removal
    if (this.markedForRemoval) {
      this.updateRemovalAnimation(currentTime);
      return;
    }
    
    // Update autonomous movement (handles transitions)
    this.updateAutonomousMovement();
    
    // Reset acceleration
    this.acc.mult(0);
    
    // Apply spring force to home position
    let springForce = p5.Vector.sub(this.home, this.pos);
    springForce.mult(Config.particles.spring.strength);
    this.acc.add(springForce);
    
    // Track proximity scaling from various sources
    let proximityScale = 0;
    
    // Apply mouse interactions if mouse is within canvas
    if (mouseX > 0 && mouseX < width && mouseY > 0 && mouseY < height) {
      this.applyMouseInteraction(proximityScale);
    }
    
    // Apply auto focus interactions
    this.applyAutoFocusInteractions(proximityScale);
    
    // Smoothly transition proximity scale
    this.proximityScale = lerp(this.proximityScale, proximityScale, 0.2);
    
    // Update velocity and position
    this.vel.add(this.acc);
    this.vel.mult(Config.particles.spring.damping);
    this.pos.add(this.vel);
    
    // Handle fade-in for new particles
    if (this.isNew || this.opacity < Config.particles.opacity) {
      this.updateFadeInAnimation();
    }
  }
  
  /**
   * Update removal animation
   * @param {number} currentTime - Current time in milliseconds
   */
  updateRemovalAnimation(currentTime) {
    let elapsedTime = currentTime - this.removalStartTime;
    let progress = constrain(elapsedTime / this.removalDuration, 0, 1);
    
    // Fade out opacity
    this.opacity = lerp(Config.particles.opacity, 0, progress);
    
    // Gradually reduce size
    this.proximityScale = lerp(this.proximityScale, -0.5, progress * 0.5);
    
    // Move position toward center
    this.pos.x = lerp(this.pos.x, this.removalTarget.x, progress * 0.1);
    this.pos.y = lerp(this.pos.y, this.removalTarget.y, progress * 0.1);
    
    // Reduced spring force as it's being removed
    const weakenedSpringForce = Config.particles.spring.strength * (1 - progress * 0.8);
    
    // Apply gentle spring force for stability
    let springForce = p5.Vector.sub(this.home, this.pos);
    springForce.mult(weakenedSpringForce);
    this.acc = springForce.copy();
    
    // Update velocity with increased damping
    this.vel.add(this.acc);
    this.vel.mult(Config.particles.spring.damping * 0.8);
    this.pos.add(this.vel);
  }
  
  /**
   * Update fade-in animation for new particles
   */
  updateFadeInAnimation() {
    if (this.isTransitioning) {
      // Calculate how far along the particle is in its journey
      let distanceFromCenter = dist(this.pos.x, this.pos.y, width/2, height/2);
      let distanceProgress = constrain(distanceFromCenter / (Config.particles.radius * 0.8), 0, 1);
      
      // Fade in based on distance from center
      this.opacity = lerp(0, Config.particles.opacity, distanceProgress);
    }
  }
  
  /**
   * Apply mouse interaction forces and effects
   * @param {number} proximityScale - Reference to the proximity scale value
   */
  applyMouseInteraction(proximityScale) {
    let mousePos = createVector(mouseX, mouseY);
    let dir = p5.Vector.sub(this.pos, mousePos);
    let d = dir.mag();
    
    // Mouse repel force
    if (d < Config.mouse.repelRadius) {
      let force = map(d, 0, Config.mouse.repelRadius, Config.mouse.repelForce, 0);
      dir.normalize();
      dir.mult(force);
      this.acc.add(dir);
    }
    
    // Mouse proximity scaling
    if (d < this.influenceRadius) {
      let mouseScale = map(d, 0, this.influenceRadius, Config.mouse.proximityScale, 0);
      proximityScale = max(proximityScale, mouseScale);
    }
  }
  
  /**
   * Apply auto focus interaction forces and effects
   * @param {number} proximityScale - Reference to the proximity scale value
   */
  applyAutoFocusInteractions(proximityScale) {
    for (let point of AutoFocusManager.points) {
      if (point.enabled) {
        let focusPos = createVector(point.point.x, point.point.y);
        let dir = p5.Vector.sub(this.pos, focusPos);
        let d = dir.mag();
        
        // Auto focus repel force
        const focusRepelRadius = Config.mouse.repelRadius * 0.7;
        if (d < focusRepelRadius) {
          let force = map(d, 0, focusRepelRadius, Config.mouse.repelForce * point.spring, 0);
          dir.normalize();
          dir.mult(force);
          this.acc.add(dir);
        }
        
        // Auto focus scaling
        if (d < this.influenceRadius) {
          let autoScale = map(d, 0, this.influenceRadius, point.scale, 0);
          proximityScale = max(proximityScale, autoScale);
        }
      }
    }
  }
  
  /**
   * Update the particle's autonomous movement
   */
  updateAutonomousMovement() {
    // Handle position transitions first
    if (this.isTransitioning) {
      this.updatePositionTransition();
    } else {
      this.updateNormalMovement();
    }
  }
  
  /**
   * Update position during transition
   */
  updatePositionTransition() {
    let currentTime = millis();
    let elapsedTime = currentTime - this.homeTransitionStart;
    
    if (elapsedTime < this.homeTransitionDuration) {
      // Calculate transition progress
      let progress = elapsedTime / this.homeTransitionDuration;
      
      // Apply easing function
      let easedProgress = 0.5 - 0.5 * cos(progress * PI);
      
      // Interpolate between old and target positions
      this.home.x = lerp(this.oldHome.x, this.targetHome.x, easedProgress);
      this.home.y = lerp(this.oldHome.y, this.targetHome.y, easedProgress);
    } else {
      // Transition complete
      this.home.x = this.targetHome.x;
      this.home.y = this.targetHome.y;
      this.isTransitioning = false;
    }
  }
  
  /**
   * Update normal autonomous movement
   */
  updateNormalMovement() {
    // Update rotation over time
    this.rotationOffset += Config.particles.motion.rotationSpeed;
    
    // Calculate new angle with rotation
    let currentAngle = this.homeAngle + this.rotationOffset;
    
    // Add oscillation effect
    let phaseShift = this.index * (TWO_PI / ParticleSystem.count / 2);
    let oscillation = sin(frameCount * Config.particles.motion.oscillationSpeed + 
                         this.oscillationOffset + phaseShift) * 
                      Config.particles.motion.oscillationAmount;
    
    // Calculate new home position
    let currentRadius = Config.particles.radius + oscillation;
    this.home.x = width/2 + cos(currentAngle) * currentRadius;
    this.home.y = height/2 + sin(currentAngle) * currentRadius;
  }
  
  /**
   * Draw the particle
   */
  display() {
    // Calculate color values
    let hue, saturation, brightness;
    let alpha = this.opacity;
    
    // Determine color - use temporary values if highlighted
    if (this.isHighlighted && this.tempHue !== undefined) {
      hue = this.tempHue;
      saturation = this.tempSaturation;
      brightness = this.tempBrightness;
    } else {
      // Use normal color calculation
      hue = this.hue;
      
      // Calculate distance from ideal position for color variation
      let idealPos = createVector(
        width/2 + cos(this.homeAngle + this.rotationOffset) * Config.particles.radius,
        height/2 + sin(this.homeAngle + this.rotationOffset) * Config.particles.radius
      );
      
      let distFromIdeal = p5.Vector.dist(this.pos, idealPos);
      
      // Determine saturation and brightness
      saturation = this.customSaturation !== undefined ? 
        this.customSaturation : 
        map(constrain(distFromIdeal, 0, 100), 0, 100, 60, 100);
      
      brightness = this.customBrightness !== undefined ? 
        this.customBrightness : 
        90;
    }
    
    // Apply special animation for new particles from center
    let newParticleScale = 1;
    if (this.isTransitioning && this.oldHome && 
        this.oldHome.x === width/2 && this.oldHome.y === height/2) {
      
      let progress = (millis() - this.homeTransitionStart) / this.homeTransitionDuration;
      
      if (progress < 1) {
        // Brighten new particles during transition
        brightness = lerp(100, brightness, progress);
        saturation = lerp(100, saturation, progress);
        
        // Apply scale effect
        if (this.newParticleScale) {
          newParticleScale = lerp(this.newParticleScale, 1, progress);
        }
      }
    }
    
    // Size pulsing effect
    let pulseAmount = sin(frameCount * 0.05 + this.oscillationOffset) * 0.2 + 1;
    
    // Calculate final display size
    let finalSize = this.baseSize * pulseAmount * 
                   (1 + this.proximityScale) * 
                   this.highlightScale * 
                   newParticleScale;
    
    // Skip drawing particles with very low opacity
    if (alpha < 0.01) return;
    
    // Draw particle
    noStroke();
    fill(hue, saturation, brightness, alpha);
    ellipse(this.pos.x, this.pos.y, finalSize);
  }
  
  /**
   * Start highlight animation for this particle
   * @param {number} duration - Duration of highlight effect in milliseconds
   * @param {number} scale - Maximum scale factor during highlight
   */
  startHighlight(duration, scale) {
    this.isHighlighted = true;
    this.highlightStartTime = millis();
    this.highlightDuration = duration;
    this.highlightScale = 1; // Will be animated
    this.maxHighlightScale = scale;
    
    // Store original colors for restoration
    this.originalHue = this.hue;
    this.originalSaturation = this.customSaturation !== undefined ? 
      this.customSaturation : 80;
    this.originalBrightness = this.customBrightness !== undefined ? 
      this.customBrightness : 90;
  }
  
  /**
   * Update highlight animation
   * @param {number} currentTime - Current time in milliseconds
   * @returns {boolean} - Whether the highlight animation is complete
   */
  updateHighlight(currentTime) {
    if (!this.isHighlighted) return true;
    
    let highlightElapsed = currentTime - this.highlightStartTime;
    
    if (highlightElapsed < this.highlightDuration) {
      // Calculate progress
      let progress = highlightElapsed / this.highlightDuration;
      
      // Fast expand, slow shrink pattern
      let scaleFactor;
      if (progress < 0.2) {
        // Quick expansion in first 20% of time
        scaleFactor = map(progress, 0, 0.2, 1, this.maxHighlightScale);
      } else {
        // Slow easing back to normal for remaining 80%
        scaleFactor = map(progress, 0.2, 1, this.maxHighlightScale, 1);
      }
      
      // Apply scale effect
      this.highlightScale = scaleFactor;
      
      // Color transition from black back to original
      if (progress < 0.3) {
        // First 30% of time: black
        this.tempHue = 0;
        this.tempSaturation = 0;
        this.tempBrightness = 0;
      } else {
        // Remaining 70%: fade to original
        let colorProgress = map(progress, 0.3, 1, 0, 1);
        this.tempHue = lerp(0, this.originalHue, colorProgress);
        this.tempSaturation = lerp(0, this.originalSaturation, colorProgress);
        this.tempBrightness = lerp(0, this.originalBrightness, colorProgress);
      }
      
      return false; // Animation still in progress
    } else {
      // Reset highlight effects when complete
      this.highlightScale = 1;
      this.isHighlighted = false;
      this.tempHue = undefined;
      this.tempSaturation = undefined;
      this.tempBrightness = undefined;
      
      return true; // Animation complete
    }
  }
  
  /**
   * Mark particle for removal with animation
   * @param {Object} target - Target position {x, y} for removal animation
   * @param {number} duration - Duration of removal animation in milliseconds
   */
  markForRemoval(target, duration) {
    this.markedForRemoval = true;
    this.removalStartTime = millis();
    this.removalDuration = duration;
    this.removalTarget = target;
  }
  
  /**
   * Set up transition to new home position
   * @param {Object} oldPos - Old position {x, y}
   * @param {Object} newPos - New position {x, y}
   * @param {number} duration - Transition duration in milliseconds
   */
  transitionToNewPosition(oldPos, newPos, duration) {
    this.oldHome = oldPos;
    this.targetHome = newPos;
    this.homeTransitionStart = millis();
    this.homeTransitionDuration = duration;
    this.isTransitioning = true;
  }
}