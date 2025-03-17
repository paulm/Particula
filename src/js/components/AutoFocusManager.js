/**
 * AutoFocusManager class
 * Manages all auto focus points
 */
class AutoFocusManager {
  /**
   * Initialize the auto focus manager
   */
  static initialize() {
    this.points = [];
    
    // Create first auto focus point with default settings
    this.createAutoFocusPoint(Object.assign({}, 
      Config.autoFocus.defaultSettings,
      { color: Config.autoFocus.colors[2] } // Purple color
    ));
  }
  
  /**
   * Create a new auto focus point
   * @param {Object} config - Configuration for the auto focus point
   * @returns {number} - Index of the created point
   */
  static createAutoFocusPoint(config) {
    // Initialize point with required properties
    const point = Object.assign({
      point: { x: 0, y: 0 }
    }, config);
    
    this.points.push(point);
    return this.points.length - 1;
  }
  
  /**
   * Update all auto focus points
   */
  static update() {
    for (let i = 0; i < this.points.length; i++) {
      const point = this.points[i];
      
      if (point.enabled) {
        // Update angle based on direction
        point.angle += point.speed;
        
        // Update position
        point.point.x = width/2 + cos(point.angle) * point.radius;
        point.point.y = height/2 + sin(point.angle) * point.radius;
        
        // Draw indicators if enabled
        if (point.showIndicators) {
          this.drawIndicators(point);
        }
      }
    }
  }
  
  /**
   * Draw visual indicators for an auto focus point
   * @param {Object} point - The auto focus point
   */
  static drawIndicators(point) {
    push();
    
    // Draw orbit path
    noFill();
    stroke(point.color.h, point.color.s, point.color.b / 2, 0.3);
    strokeWeight(1);
    ellipse(width/2, height/2, point.radius * 2);
    
    // Draw focus point
    fill(point.color.h, point.color.s, point.color.b, 0.5);
    noStroke();
    ellipse(point.point.x, point.point.y, 10);
    
    pop();
  }
  
  /**
   * Remove an auto focus point
   * @param {number} index - Index of the point to remove
   */
  static removeAutoFocusPoint(index) {
    if (index >= 0 && index < this.points.length) {
      this.points.splice(index, 1);
    }
  }
}