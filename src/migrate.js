/**
 * Migration script
 * 
 * This script helps migrate settings from the original sketch.js
 * to the new modular implementation.
 * 
 * Usage: Run this script in the browser console while the original
 * Particula is running to get the current config values.
 */

function migrateConfig() {
  // Create config object based on current values
  const config = {
    particles: {
      count: numParticles,
      radius: radius,
      spring: {
        strength: springStrength,
        damping: damping
      },
      motion: {
        rotationSpeed: rotationSpeed,
        oscillationAmount: oscillationAmount,
        oscillationSpeed: oscillationSpeed
      }
    },
    mouse: {
      repelForce: mouseRepelForce,
      repelRadius: mouseRepelRadius,
      proximityScale: mouseProximityScale
    },
    intervals: {
      radius: {
        enabled: radiusIntervalEnabled,
        time: radiusIntervalTime,
        smallRange: { min: radiusMinRange.min, max: radiusMinRange.max },
        largeRange: { min: radiusMaxRange.min, max: radiusMaxRange.max }
      },
      highlight: {
        enabled: particleHighlightEnabled,
        time: particleHighlightIntervalTime,
        duration: highlightDuration,
        scale: highlightScale
      },
      particleCount: {
        enabled: particleCountIntervalEnabled,
        time: particleCountIntervalTime,
        step: particleCountStep,
        min: particleCountMin,
        max: particleCountMax
      }
    },
    autoFocus: {
      points: autoFocusPoints.map(point => ({
        enabled: point.enabled,
        radius: point.radius,
        speed: point.speed,
        angle: point.angle,
        scale: point.scale,
        spring: point.spring,
        showIndicators: point.showIndicators,
        clockwise: point.clockwise,
        color: point.color
      }))
    }
  };
  
  console.log('Current Configuration:');
  console.log(JSON.stringify(config, null, 2));
  return config;
}

// Call this function in the console to get current values
// migrateConfig();