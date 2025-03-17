# Particula

A dynamic, interactive particle system visualization built with p5.js.

## Overview

Particula creates an engaging visual experience with particles that respond to user interaction, autonomous movement patterns, and various interval-based effects.

## Features

- **Dynamic Particle System**: Particles arranged in a circular formation that respond to physics
- **Interaction**: Mouse-based interaction that repels and scales particles
- **Auto Focus Points**: Orbiting focus points that attract particles
- **Interval Effects**:
  - Radius Pulsing: Alternates between small and large radius
  - Particle Highlighting: Sequentially highlights particles with animation
  - Particle Count Variation: Gradually adds and removes particles

## Optimization Improvements

This refactored version includes several key optimizations:

1. **Modular Architecture**:
   - Separated code into logical components
   - Created manager classes for different aspects of functionality
   - Centralized configuration in a single object

2. **Performance Enhancements**:
   - Improved particle addition/removal with better memory management
   - Optimized animation timing and transitions
   - Better handling of DOM operations

3. **Code Quality**:
   - Improved documentation with JSDoc comments
   - More consistent naming conventions
   - Cleaner organization and separation of concerns

## File Structure

- **config.js**: Central configuration for all application settings
- **components/**
  - **Particle.js**: Individual particle class
  - **ParticleSystem.js**: Manages all particles and their interactions
  - **AutoFocusManager.js**: Handles auto focus points
  - **IntervalManager.js**: Manages all interval-based effects
  - **UIManager.js**: Handles all UI components and interactions
- **app.js**: Main application logic and p5.js integration

## Usage

1. Open `index.html` in a web browser
2. Use the control panel to adjust settings
3. Interact with particles using your mouse

## Default Settings

- **Particles**: 100 particles arranged in a circle
- **Intervals**:
  - Radius pulsing enabled with 3-second interval
  - Particle highlighting disabled
  - Particle count variation enabled with 1-second interval and 10 particles per step
- **Auto Focus**: One auto focus point enabled with clockwise movement