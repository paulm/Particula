/**
 * IntervalManager class
 * Manages all interval-based effects
 */
class IntervalManager {
  /**
   * Initialize the interval manager
   */
  static initialize() {
    // General settings
    this.showLines = false;
    
    // Radius interval
    this.radiusIntervalEnabled = Config.intervals.radius.enabled;
    this.radiusIntervalTime = Config.intervals.radius.time;
    this.lastRadiusIntervalTime = 0;
    this.radiusInSmallRange = false;
    
    // Highlight interval
    this.highlightEnabled = Config.intervals.highlight.enabled;
    this.highlightIntervalTime = Config.intervals.highlight.time;
    this.lastHighlightTime = 0;
    
    // Particle count interval
    this.particleCountEnabled = Config.intervals.particleCount.enabled;
    this.particleCountIntervalTime = Config.intervals.particleCount.time;
    this.lastParticleCountTime = 0;
    this.particleCountIncreasing = true;
    this.particleCountStep = Config.intervals.particleCount.step;
    
    // Wave amplitude interval
    this.waveAmplitudeEnabled = Config.intervals.waveAmplitude.enabled;
    this.waveAmplitudeIntervalTime = Config.intervals.waveAmplitude.time;
    this.lastWaveAmplitudeTime = 0;
    this.useZeroWaveAmplitude = true;
  }
  
  /**
   * Process all interval effects
   */
  static update() {
    const currentTime = millis();
    
    // Process radius interval
    this.processRadiusInterval(currentTime);
    
    // Process highlight interval
    this.processHighlightInterval(currentTime);
    
    // Process particle count interval
    this.processParticleCountInterval(currentTime);
    
    // Process wave amplitude interval
    this.processWaveAmplitudeInterval(currentTime);
    
    // Process particle queue (gradual additions/removals)
    ParticleSystem.processParticleQueue();
    
    // Update highlight animations
    ParticleSystem.updateHighlight();
  }
  
  /**
   * Process radius interval effect
   * @param {number} currentTime - Current time in milliseconds
   */
  static processRadiusInterval(currentTime) {
    if (!this.radiusIntervalEnabled) return;
    
    if (currentTime - this.lastRadiusIntervalTime >= this.radiusIntervalTime) {
      // Toggle between small and large radius ranges
      this.radiusInSmallRange = !this.radiusInSmallRange;
      
      // Choose a random radius from the current range
      let newRadius;
      if (this.radiusInSmallRange) {
        newRadius = random(
          Config.intervals.radius.smallRange.min,
          Config.intervals.radius.smallRange.max
        );
      } else {
        newRadius = random(
          Config.intervals.radius.largeRange.min,
          Config.intervals.radius.largeRange.max
        );
      }
      
      // Update particles with new radius
      ParticleSystem.updateParticlePositions(newRadius);
      
      // Update timing
      this.lastRadiusIntervalTime = currentTime;
    }
  }
  
  /**
   * Process highlight interval effect
   * @param {number} currentTime - Current time in milliseconds
   */
  static processHighlightInterval(currentTime) {
    if (!this.highlightEnabled) return;
    
    if (currentTime - this.lastHighlightTime >= this.highlightIntervalTime) {
      // Highlight next particle
      ParticleSystem.highlightNextParticle();
      
      // Update timing
      this.lastHighlightTime = currentTime;
    }
  }
  
  /**
   * Process particle count interval effect
   * @param {number} currentTime - Current time in milliseconds
   */
  static processParticleCountInterval(currentTime) {
    if (!this.particleCountEnabled) return;
    
    if (currentTime - this.lastParticleCountTime >= this.particleCountIntervalTime) {
      // Only queue new particles when current queue is empty
      if (ParticleSystem.particlesQueuedForAction <= 0) {
        const step = this.particleCountStep;
        
        if (this.particleCountIncreasing) {
          // Calculate how many particles to add
          const newCount = min(
            ParticleSystem.count + step, 
            Config.intervals.particleCount.max
          );
          const particlesToAdd = newCount - ParticleSystem.count;
          
          if (particlesToAdd > 0) {
            // Queue gradual addition
            ParticleSystem.queueParticleAction(
              particlesToAdd, 
              true, 
              this.particleCountIntervalTime
            );
          }
          
          // Check if we've reached maximum
          if (newCount >= Config.intervals.particleCount.max) {
            this.particleCountIncreasing = false;
          }
        } else {
          // Calculate how many particles to remove
          const newCount = max(
            ParticleSystem.count - step, 
            Config.intervals.particleCount.min
          );
          const particlesToRemove = ParticleSystem.count - newCount;
          
          if (particlesToRemove > 0) {
            // Queue gradual removal
            ParticleSystem.queueParticleAction(
              particlesToRemove, 
              false, 
              this.particleCountIntervalTime
            );
          }
          
          // Check if we've reached minimum
          if (newCount <= Config.intervals.particleCount.min) {
            this.particleCountIncreasing = true;
          }
        }
      }
      
      // Update timing
      this.lastParticleCountTime = currentTime;
    }
  }
  
  /**
   * Set radius interval enabled state
   * @param {boolean} enabled - Whether radius interval is enabled
   */
  static setRadiusIntervalEnabled(enabled) {
    this.radiusIntervalEnabled = enabled;
    if (enabled) {
      this.lastRadiusIntervalTime = millis();
    }
  }
  
  /**
   * Set highlight interval enabled state
   * @param {boolean} enabled - Whether highlight interval is enabled
   */
  static setHighlightEnabled(enabled) {
    this.highlightEnabled = enabled;
    if (enabled) {
      this.lastHighlightTime = millis();
    }
  }
  
  /**
   * Set particle count interval enabled state
   * @param {boolean} enabled - Whether particle count interval is enabled
   */
  static setParticleCountEnabled(enabled) {
    this.particleCountEnabled = enabled;
    if (enabled) {
      this.lastParticleCountTime = millis();
    }
  }
  
  /**
   * Update radius interval time
   * @param {number} seconds - Interval time in seconds
   */
  static setRadiusIntervalTime(seconds) {
    this.radiusIntervalTime = seconds * 1000;
  }
  
  /**
   * Update highlight interval time
   * @param {number} seconds - Interval time in seconds
   */
  static setHighlightIntervalTime(seconds) {
    this.highlightIntervalTime = seconds * 1000;
  }
  
  /**
   * Update particle count interval time
   * @param {number} seconds - Interval time in seconds
   */
  static setParticleCountIntervalTime(seconds) {
    this.particleCountIntervalTime = seconds * 1000;
  }
  
  /**
   * Update particle count step size
   * @param {number} step - Number of particles to add/remove
   */
  static setParticleCountStep(step) {
    this.particleCountStep = step;
  }
  
  /**
   * Process wave amplitude interval effect
   * @param {number} currentTime - Current time in milliseconds
   */
  static processWaveAmplitudeInterval(currentTime) {
    if (!this.waveAmplitudeEnabled) return;
    
    if (currentTime - this.lastWaveAmplitudeTime >= this.waveAmplitudeIntervalTime) {
      // Toggle between zero and random amplitude
      this.useZeroWaveAmplitude = !this.useZeroWaveAmplitude;
      
      // Choose amplitude value based on toggle state
      let newAmplitude;
      if (this.useZeroWaveAmplitude) {
        newAmplitude = Config.intervals.waveAmplitude.minValue; // 0
      } else {
        // Random value between min and max
        newAmplitude = random(
          Config.intervals.waveAmplitude.maxValue.min,
          Config.intervals.waveAmplitude.maxValue.max
        );
      }
      
      // Update configuration
      Config.particles.motion.oscillationAmount = newAmplitude;
      
      // Update timing
      this.lastWaveAmplitudeTime = currentTime;
    }
  }
  
  /**
   * Set wave amplitude interval enabled state
   * @param {boolean} enabled - Whether wave amplitude interval is enabled
   */
  static setWaveAmplitudeEnabled(enabled) {
    this.waveAmplitudeEnabled = enabled;
    if (enabled) {
      this.lastWaveAmplitudeTime = millis();
    }
  }
  
  /**
   * Update wave amplitude interval time
   * @param {number} seconds - Interval time in seconds
   */
  static setWaveAmplitudeIntervalTime(seconds) {
    this.waveAmplitudeIntervalTime = seconds * 1000;
  }
}