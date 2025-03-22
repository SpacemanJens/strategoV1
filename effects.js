class Star {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }

    drawStarEffect(x, y, hsb2, hsb3, hsb4, hsb5, fill1, fill2, fill3, fill4, cr, coronaEffect) {
        // Apply supernova effect parameters if active
        if (coronaEffect !== 1) {
            fill1 = 50;
            fill2 = 550;
            fill3 = 300;
            fill4 = 400;
        }

        push();
        blendMode(BLEND);
        colorMode(HSB, hsb2, hsb3, hsb4, hsb5);
        blendMode(ADD);
        for (let d = 0; d < 1; d += 0.01) {
            fill(fill1, fill2, fill3, (1.1 - d * 1.2) * fill4);
            circle(x, y, cr * d + random(0, coronaEffect));
        }
        pop();
    }
}

class YellowStar extends Star {
    constructor(x, y) {
        super(x, y);
        this.isButtonHovered = false;
        this.crSize = random(30, 60);
        this.maxSize = random(15, 30); // Different max sizes for variety
        this.animationSpeed = random(0.01, 0.03);
        this.size = random(8, 15); // For collision detection
    }

    draw() {
        // Animate cr size smoothly when button is hovered
        this.crSize = lerp(
            this.crSize,
            this.isButtonHovered ? this.maxSize : 4,
            this.animationSpeed
        );

        // Draw the star effect
        this.drawStarEffect(this.x, this.y, 430, 800, 1500, 1010, 50, 550, 300, 400, this.crSize, 1);
    }

    setButtonHovered(isHovered) {
        this.isButtonHovered = isHovered;
    }
}

class DecorativeStar extends YellowStar {
    constructor(x, y) {
        super(x, y);
        this.initStarParameters();
        this.setupSupernovaProperties();
    }

    initStarParameters() {
        // Choose star type based on random value
        const randomValue = random(1);
        let params;

        if (randomValue > 0.9) {
            params = { hsb2: 0, hsb3: 0, hsb4: 0, hsb5: 10000, fill1: 50, fill2: 550, fill3: 300, fill4: 400, sizeFactor: random(1, 1.5) };  // red
        } else if (randomValue > 0.8) {
            params = { hsb2: 600, hsb3: 645, hsb4: 2000, hsb5: 1010, fill1: 550, fill2: 550, fill3: 300, fill4: 400, sizeFactor: random(0.8, 1.5) }; // pink
        } else if (randomValue > 0.7) {
            params = { hsb2: 71, hsb3: 645, hsb4: 2000, hsb5: 1010, fill1: 50, fill2: 550, fill3: 300, fill4: 400, sizeFactor: random(1, 1.5) };  //blue
        } else if (randomValue > 0.6) {
            params = { hsb2: 87, hsb3: 645, hsb4: 2000, hsb5: 1010, fill1: 50, fill2: 550, fill3: 300, fill4: 400, sizeFactor: random(0.8, 1.5) };  // light blue
        } else if (randomValue > 0.5) {
            params = { hsb2: 160, hsb3: 645, hsb4: 2000, hsb5: 1010, fill1: 50, fill2: 550, fill3: 300, fill4: 400, sizeFactor: random(0.8, 1.5) }; // green
        } else if (randomValue > 0.4) {
            params = { hsb2: 65, hsb3: 0, hsb4: 65, hsb5: 300, fill1: 50, fill2: 122, fill3: 500, fill4: 56, sizeFactor: random(0.8, 1.5) }; // Purple giant
        } else if (randomValue > 0.3) {
            params = { hsb2: 181, hsb3: 181, hsb4: 2000, hsb5: 300, fill1: 50, fill2: 122, fill3: 500, fill4: 181, sizeFactor: random(0.8, 1.5) }; // Green giant
        } else {
            params = { hsb2: 1600, hsb3: 645, hsb4: 2000, hsb5: 1010, fill1: 50, fill2: 1600, fill3: 1600, fill4: 400, sizeFactor: random(0.5, 5.5) }; // Red giant
        }

        // Assign parameters to this star
        Object.assign(this, params);
    }

    setupSupernovaProperties() {
        this.isSupernova = false;
        this.supernovaStartFrame = 0;
        this.supernovaDuration = ANIMATION_FRAMES;
        this.disappearThreshold = SUPERNOVA_THRESHOLD;
        this.isDead = false;
        this.supernovaMaxSize = SUPERNOVA_MAX_SIZE;
    }

    draw() {
        // If star is dead (post-supernova), don't draw it
        if (this.isDead) return;

        if (this.isSupernova) {
            this.drawSupernova();
        } else {
            this.drawNormalStar();
        }
    }

    drawSupernova() {
        // Calculate progress of supernova animation
        const progress = (frameCount - this.supernovaStartFrame) / this.supernovaDuration;
        const normalizedProgress = progress / this.disappearThreshold;

        // Growth calculation
        const growthFactor = pow(normalizedProgress, 12.2);
        const currentSize = lerp(this.crSize, this.supernovaMaxSize, growthFactor);

        // Calculate fade effect
        const fadeFactor = this.calculateFadeFactor(normalizedProgress);
        const currentFill1 = lerp(this.fill1, 0, fadeFactor);
        const currentFill2 = lerp(this.fill2, 0, fadeFactor);

        // Draw with supernova effect
        this.drawStarEffect(
            this.x, this.y,
            this.hsb2, this.hsb3, this.hsb4, this.hsb5,
            currentFill1, currentFill2,
            this.fill3 * (1 - fadeFactor * 0.7),
            this.fill4 * (1 + normalizedProgress * 2.5 - fadeFactor),
            currentSize,
            6 * normalizedProgress
        );

        // Trigger flash effect at the end of the supernova animation
        if (currentSize >= this.supernovaMaxSize / 4) {
            backgroundManager.setFlashEffect(60);
            this.isDead = true;
        }
    }

    calculateFadeFactor(progress) {
        // Start fading at 30% progress, complete by 70%
        const rawFade = constrain(map(progress, 0.3, 0.7, 0, 1), 0, 1);
        // Apply non-linear fade curve
        return pow(rawFade, 0.7);
    }

    drawNormalStar() {
        if (this.isButtonHovered) {
            this.crSize = lerp(this.crSize, this.maxSize, this.animationSpeed);
        } else {
            this.crSize = lerp(this.crSize, 4, this.animationSpeed);
        }

        this.drawStarEffect(
            this.x, this.y,
            this.hsb2, this.hsb3, this.hsb4, this.hsb5,
            this.fill1, this.fill2, this.fill3, this.fill4,
            this.crSize, 1
        );
    }

    triggerSupernova() {
        if (!this.isDead && !this.isSupernova) {
            this.isSupernova = true;
            this.supernovaStartFrame = frameCount;
        }
    }
    
    // New Spejder class to manage spejder animations
class Spejder {
    constructor() {
        // Animation frames
        this.framesLeft = []; // Array to hold left-facing animation frames
        this.framesRight = []; // Array to hold right-facing animation frames

        // Animation state
        this.currentFrameIndex = 0;
        this.lastUpdateTime = 0;
        this.animationSpeed = 0.15; // Controls the animation frame rate

        // Position and movement
        this.posX = 0;  // Current X position percentage (0-1)
        this.posY = 0;  // Current Y position percentage (0-1)
        this.movementSpeed = 0.00015; // How fast the spejder moves
        this.isMovingLeft = false;

        // Scaling and cycling
        this.scaleFactor = 0.2;  // Start at fifth size
        this.inCycleMode = false;
        this.initialX = 0;
        this.initialY = 0;

        // Base dimensions
        this.baseWidth = 300;
        this.baseHeight = 228;
    }

    // Load all animation frames
    loadAnimationFrames() {
        // Load left-facing frames
        for (let i = 1; i <= 24; i++) {
            const frameName = `p4spejderL${i}`;
            this.framesLeft.push(loadImage(`images/p4spejder/${frameName}.png`));
        }

        // Load right-facing frames
        for (let i = 1; i <= 24; i++) {
            const frameName = `p4spejderR${i}`;
            this.framesRight.push(loadImage(`images/p4spejder/${frameName}.png`));
        }
    }

    // Reset animation state
    reset() {
        this.posX = 0;
        this.posY = 0;
        this.isMovingLeft = false;
        this.inCycleMode = false;
        this.initialX = 0;
        this.initialY = 0;
        this.scaleFactor = 0.2;
        this.currentFrameIndex = 0;
    }

    // Update animation frame and position
    update() {
        // Update animation frame at specified intervals
        const currentTime = millis();
        if (currentTime - this.lastUpdateTime > 1000 * this.animationSpeed) {
            // Update frame index based on movement direction
            if (this.inCycleMode && !this.isMovingLeft) {
                // Play animation in reverse when moving right (going back)
                this.currentFrameIndex = (this.currentFrameIndex - 1 + this.framesLeft.length) % this.framesLeft.length;
            } else {
                // Normal forward animation
                this.currentFrameIndex = (this.currentFrameIndex + 1) % this.framesLeft.length;
            }
            this.lastUpdateTime = currentTime;
        }

        // Calculate panel dimensions
        const circleRightEdge = 100 + CIRCLE_RADIUS * 2 + 150;
        const enlargedSize = 800;
        const panelX = circleRightEdge;
        const panelY = height / 2 - enlargedSize / 2 - 100;

        // Calculate actual X and Y positions
        const margin = 20;
        const maxX = enlargedSize - this.baseWidth - margin;
        const maxY = enlargedSize - this.baseHeight - margin;

        const animX = panelX + margin + (maxX * this.posX) + 600;
        const animY = panelY + margin + (maxY * this.posY) + 200;

        // Store initial position when we first start the animation
        if (!this.inCycleMode && this.initialX === 0 && this.initialY === 0) {
            this.initialX = animX;
            this.initialY = animY;
        }

        // Update scale factor based on Y position
        if (animY > 440) {
            this.scaleFactor = 1.0; // Full size when Y > 440
        } else {
            // Scale linearly between 0.2 and 1.0 based on position between start Y and 440
            const scaleProgress = map(animY, this.initialY, 440, 0.2, 1.0);
            this.scaleFactor = constrain(scaleProgress, 0.2, 1.0);
        }

        // Transition to cycle mode when reaching bottom of path
        if (animY >= 550 && !this.inCycleMode) {
            this.inCycleMode = true;
            this.isMovingLeft = false; // Go back to starting position
            //  console.log("Transitioning to cycle mode at Y:", animY);
        }

        // Update position based on cycle mode
        if (this.inCycleMode) {
            if (this.isMovingLeft) {
                // Moving left
                this.posX = this.posX - this.movementSpeed;

                // Also update Y position when moving left in cycle mode
                this.posY = min(this.posY + this.movementSpeed, 0.8);

                // Reverse direction when reaching left boundary
                if (animX <= this.initialX - 300) {
                    this.isMovingLeft = false;
                }
            } else {
                // Moving right (returning to start)
                this.posX = this.posX + this.movementSpeed;

                // Adjust Y position to return to initial Y
                if (animY > this.initialY) {
                    this.posY = this.posY - this.movementSpeed;
                }

                // Check if we've returned to starting position
                const distanceToStart = dist(animX, animY, this.initialX, this.initialY);
                if (distanceToStart < 5) {
                    // Reset to exact starting position
                    this.posX = (this.initialX - (panelX + margin + 600)) / maxX;
                    this.posY = (this.initialY - (panelY + margin + 200)) / maxY;

                    // Start a new cycle
                    this.isMovingLeft = true;
                }

                // If we've gone too far right, correct
                if (animX > this.initialX + 10) {
                    this.isMovingLeft = true;
                }
            }
        } else {
            // Initial phase: just move left
            this.posX = this.posX - this.movementSpeed;

            // Always update Y position if not in cycle mode
            this.posY = min(this.posY + this.movementSpeed, 0.8);
        }

        return { animX, animY, panelX, panelY, margin };
    }

    // Draw the spejder at current position with current animation frame
    draw(panelX, panelY, enlargedSize) {
        // Skip if no frames loaded
        if (this.framesLeft.length === 0) return;

        // Update animation
        const { animX, animY } = this.update();

        // Apply scaling factor to dimensions
        const animationWidth = this.baseWidth * this.scaleFactor;
        const animationHeight = this.baseHeight * this.scaleFactor;

        // Adjust position to account for scaling (center the scaled image)
        const adjustedX = animX + (this.baseWidth - animationWidth) / 2;
        const adjustedY = animY + (this.baseHeight - animationHeight) / 2;

        // Use appropriate frames based on direction
        const currentFrames = this.isMovingLeft ? this.framesRight : this.framesLeft;

        // Draw current frame.
        const currentFrameIndex = this.currentFrameIndex % currentFrames.length;
        image(currentFrames[currentFrameIndex], adjustedX, adjustedY, animationWidth, animationHeight);
     }
}

// New ImageIndex8Manager class to manage all animations for image index 8
class ImageIndex8Manager {
    constructor() {

        // Warpgate A animation properties
        this.warpgateAImages = [];
        this.warpgateAIndex = 0;
        this.lastWarpgateAUpdate = 0;
        this.warpgateAAnimationSpeed = 0.15;
        this.warpgateAWidth = 109;
        this.warpgateAHeight = 92;

        // LightTower animation properties
        this.warpgateBImages = [];
        this.warpgateBIndex = 0;
        this.lastWarpgateBUpdate = 0;
        this.warpgateBDirection = 1;
        this.warpgateBAnimationSpeed = 0.15;
        this.warpgateBWidth = 207;
        this.warpgateBHeight = 161;
    }

    // Load all animation assets
    loadImages() {
        // Load warpgate A images
        for (let i = 1; i <= 6; i++) {
            const frameName = `p3warpgateA${i}`;
            this.warpgateAImages.push(loadImage(`images/p3warpgateA/${frameName}.png`));
        }

        // Load warpgate B images
        for (let i = 1; i <= 13; i++) {
            const frameName = `p3warpgateB${i}`;
            this.warpgateBImages.push(loadImage(`images/p3warpgateB/${frameName}.png`));
        }
    }

    // Reset all animations
    reset() {
        // Reset warpgate animation
        this.warpgateAIndex = 0;
        this.lastWarpgateAUpdate = 0;

        // Reset lightTower animation
        this.warpgateBIndex = 0;
        this.warpgateBDirection = 1;
        this.lastWarpgateBUpdate = 0;
    }

    updateWarpgateAAnimation() {
        const currentTime = millis();

        if (currentTime - this.lastWarpgateAUpdate > 1000 * this.warpgateAAnimationSpeed) {
            // Correctly increment the warpgate A index with proper bounds checking
            this.warpgateAIndex = (this.warpgateAIndex + 1) % this.warpgateAImages.length;

            this.lastWarpgateAUpdate = currentTime;
        }
    }

    // Update warpgate animation frames using ping-pong effect
    updateWarpgateBAnimation() {
        const currentTime = millis();

        if (currentTime - this.lastWarpgateBUpdate > 1000 * this.warpgateBAnimationSpeed) {
            // Update the frame index based on current direction
            this.warpgateBIndex += this.warpgateBDirection;

            // Make sure we stay within the image array bounds
            if (this.warpgateBIndex >= this.warpgateBImages.length - 1) {
                this.warpgateBIndex = this.warpgateBImages.length - 1;
                this.warpgateBDirection = -1; // Start going backward
            } else if (this.warpgateBIndex <= 0) {
                this.warpgateBIndex = 0;
                this.warpgateBDirection = 1; // Start going forward
            }

            this.lastWarpgateBUpdate = currentTime;
        }
    }

    // Draw the warpgate animation at specific position
    drawWarpgateAAnimation(panelX, panelY) {
        if (this.warpgateAImages.length === 0) return; // Skip if no images loaded

        // Calculate fixed position relative to the panel
        const warpgateX = panelX + 191; // Position from left edge of panel
        const warpgateY = panelY + 382; // Position from top edge of panel

        // Draw current frame
        const currentFrame = this.warpgateAImages[this.warpgateAIndex];
        if (currentFrame) {
            image(currentFrame, warpgateX, warpgateY, this.warpgateAWidth, this.warpgateAHeight);
        }
    }

    // Draw the warpgate animation at specific position
    drawWarpgateBAnimation(panelX, panelY) {
        if (this.warpgateBImages.length === 0) return; // Skip if no images loaded

        // Calculate fixed position relative to the panel
        const warpgateX = panelX + 420; // Position from left edge of panel
        const warpgateY = panelY + 169; // Position from top edge of panel

        // Draw current frame
        const currentFrame = this.warpgateBImages[this.warpgateBIndex];
        if (currentFrame) {
            image(currentFrame, warpgateX, warpgateY, this.warpgateBWidth, this.warpgateBHeight);
        }
    }

    // Update and render all animations for image index 11
    updateAndDraw(panelX, panelY, enlargedSize) {
        // Update animations
        this.updateWarpgateAAnimation();
        this.updateWarpgateBAnimation();

        // Draw all elements
        this.drawWarpgateAAnimation(panelX, panelY);
        this.drawWarpgateBAnimation(panelX, panelY);
    }
}

// New ImageIndex11Manager class to manage all animations for image index 11
class ImageIndex11Manager {
    constructor() {
        // Create a spejder instance
        this.spejder = new Spejder();

        // Warpgate animation properties
        this.warpgateImages = [];
        this.warpgateIndex = 0;
        this.lastWarpgateUpdate = 0;
        this.warpgateDirection = 1; // 1 = forward, -1 = reverse
        this.warpgateAnimationSpeed = 0.15;
        this.warpgateWidth = 192;
        this.warpgateHeight = 150;

        // LightTower animation properties
        this.lightTowerImages = [];
        this.lightTowerIndex = 0;
        this.lastLightTowerUpdate = 0;
        this.lightTowerDirection = 1;
        this.lightTowerAnimationSpeed = 0.15;
        this.lightTowerWidth = 98;
        this.lightTowerHeight = 75;
    }

    // Load all animation assets
    loadImages() {
        // Load spejder animations
        this.spejder.loadAnimationFrames();

        // Load warpgate images
        for (let i = 1; i <= 13; i++) {
            const frameName = `p4warpgateA${i}`;
            this.warpgateImages.push(loadImage(`images/p4warpgateA/${frameName}.png`));
        }

        // Load lightTower images
        for (let i = 1; i <= 11; i++) {
            const frameName = `p4lightTower${i}`;
            this.lightTowerImages.push(loadImage(`images/p4lightTower/${frameName}.png`));
        }
    }

    // Reset all animations
    reset() {
        // Reset spejder
        this.spejder.reset();

        // Reset warpgate animation
        this.warpgateIndex = 0;
        this.warpgateDirection = 1;
        this.lastWarpgateUpdate = 0;

        // Reset lightTower animation
        this.lightTowerIndex = 0;
        this.lightTowerDirection = 1;
        this.lastLightTowerUpdate = 0;
    }

    // Update warpgate animation frames using ping-pong effect
    updateWarpgateAnimation() {
        const currentTime = millis();

        if (currentTime - this.lastWarpgateUpdate > 1000 * this.warpgateAnimationSpeed) {
            // Update the frame index based on current direction
            this.warpgateIndex += this.warpgateDirection;

            // Make sure we stay within the image array bounds
            if (this.warpgateIndex >= this.warpgateImages.length - 1) {
                this.warpgateIndex = this.warpgateImages.length - 1;
                this.warpgateDirection = -1; // Start going backward
            } else if (this.warpgateIndex <= 0) {
                this.warpgateIndex = 0;
                this.warpgateDirection = 1; // Start going forward
            }

            this.lastWarpgateUpdate = currentTime;
        }
    }

    // Update lightTower animation frames using ping-pong effect
    updateLightTowerAnimation() {
        const currentTime = millis();

        if (currentTime - this.lastLightTowerUpdate > 1000 * this.lightTowerAnimationSpeed) {
            // Update the frame index based on current direction
            this.lightTowerIndex += this.lightTowerDirection;

            // Make sure we stay within the image array bounds
            if (this.lightTowerIndex >= this.lightTowerImages.length - 1) {
                this.lightTowerIndex = this.lightTowerImages.length - 1;
                this.lightTowerDirection = -1; // Start going backward
            } else if (this.lightTowerIndex <= 0) {
                this.lightTowerIndex = 0;
                this.lightTowerDirection = 1; // Start going forward
            }

            this.lastLightTowerUpdate = currentTime;
        }
    }

    // Draw the warpgate animation at specific position
    drawWarpgateAnimation(panelX, panelY) {
        if (this.warpgateImages.length === 0) return; // Skip if no images loaded

        // Calculate fixed position relative to the panel
        const warpgateX = panelX + 455; // Position from left edge of panel
        const warpgateY = panelY + 515; // Position from top edge of panel

        // Draw current frame
        const currentFrame = this.warpgateImages[this.warpgateIndex];
        if (currentFrame) {
            image(currentFrame, warpgateX, warpgateY, this.warpgateWidth, this.warpgateHeight);
        }
    }

    // Draw the lightTower animation at specific position
    drawLightTowerAnimation(panelX, panelY) {
        if (this.lightTowerImages.length === 0) return; // Skip if no images loaded

        // Calculate fixed position relative to the panel
        const lightTowerX = panelX + 163; // Position from left edge of panel
        const lightTowerY = panelY + 50; // Position from top edge of panel

        // Draw current frame
        const currentFrame = this.lightTowerImages[this.lightTowerIndex];
        if (currentFrame) {
            image(currentFrame, lightTowerX, lightTowerY, this.lightTowerWidth, this.lightTowerHeight);
        }
    }

    // Update and render all animations for image index 11
    updateAndDraw(panelX, panelY, enlargedSize) {
        // Update animations
        this.updateWarpgateAnimation();
        this.updateLightTowerAnimation();

        // Draw all elements
        this.drawWarpgateAnimation(panelX, panelY);
        this.drawLightTowerAnimation(panelX, panelY);
        this.spejder.draw(panelX, panelY, enlargedSize);
    }
}

// New ImageIndex13Manager class to manage all jellyfish animations for image index 13
class ImageIndex13Manager {
    constructor() {
        // Jellyfish management
        this.jellyfishManager = new Jellyfishs();
        this.jellyfishImages = [];
        this.isPermanentlyDisabled = false;
    }

    // Load all jellyfish assets
    loadImages() {
        // Load jellyfish images
        this.jellyfishImages.push(loadImage("images/p4p3jellyfish/p4p3jellyfishLeft.png"));
        this.jellyfishImages.push(loadImage("images/p4p3jellyfish/p4p3jellyfishLowerLeft.png"));
        this.jellyfishImages.push(loadImage("images/p4p3jellyfish/p4p3jellyfishLowerMiddle.png"));
        this.jellyfishImages.push(loadImage("images/p4p3jellyfish/p4p3jellyfishLowerRight.png"));
        this.jellyfishImages.push(loadImage("images/p4p3jellyfish/p4p3jellyfishUpperLeft.png"));
        this.jellyfishImages.push(loadImage("images/p4p3jellyfish/p4p3jellyfishUpperRight.png"));

        // Initialize the jellyfish manager with the loaded images
        this.jellyfishManager.setImages(this.jellyfishImages);
        this.jellyfishManager.initializeDefaultJellyfishes();
    }

    // Reset all animations
    reset() {
        // Reset jellyfish manager
        this.jellyfishManager.initializeDefaultJellyfishes();
        this.isPermanentlyDisabled = false;
    }

    // Activate all jellyfishes
    activateAll() {
        if (!this.isPermanentlyDisabled) {
            this.jellyfishManager.activateAll();
        }
    }

    // Deactivate all jellyfishes
    deactivateAll() {
        this.jellyfishManager.deactivateAll();
    }

    // Update all jellyfishes
    update() {
        if (this.isPermanentlyDisabled) return true;

        // Update jellyfishes and check if they're all disabled
        this.isPermanentlyDisabled = this.jellyfishManager.update();

        return this.isPermanentlyDisabled;
    }

    // Draw all jellyfishes
    draw(panelX, panelY) {
        this.jellyfishManager.draw(panelX, panelY);
    }

    // Check if all jellyfishes are disabled
    areAllDisabled() {
        return this.isPermanentlyDisabled;
    }

    // Update and render all animations for image index 13
    updateAndDraw(panelX, panelY) {
        // Activate jellyfishes if not permanently disabled
        if (!this.isPermanentlyDisabled) {
            this.activateAll();
        }

        // Update the jellyfishes
        this.update();

        // Draw all jellyfishes
        this.draw(panelX, panelY);

        return this.isPermanentlyDisabled;
    }
}

// New ImageIndex16Manager class to manage all animations for image index 11
class ImageIndex16Manager {
    constructor() {

        // Warpgate animation properties
        this.warpgateImages = [];
        this.warpgateIndex = 0;
        this.lastWarpgateUpdate = 0;
        this.warpgateAnimationSpeed = 0.15;
        this.warpgateWidth = 88;
        this.warpgateHeight = 88;

        // Water animation properties
        this.waterImages = [];
        this.waterIndex = 0;
        this.lastWaterUpdate = 0;
        this.waterAnimationSpeed = 0.15;
        this.waterWidth = 220;
        this.waterHeight = 199;
    }

    // Load all animation assets
    loadImages() {

        // Load warpgate images
        for (let i = 1; i <= 10; i++) {
            const frameName = `p0warpgateA${i}`;
            this.warpgateImages.push(loadImage(`images/p0warpgateA/${frameName}.png`));
        }

        // Load warpgate images
        for (let i = 1; i <= 6; i++) {
            const frameName = `p0water${i}`;
            this.waterImages.push(loadImage(`images/p0water/${frameName}.png`));
        }

    }

    // Reset all animations
    reset() {

        // Reset warpgate animation
        this.warpgateIndex = 0;
        this.lastWarpgateUpdate = 0;

        // Reset warpgate animation
        this.waterIndex = 0;
        this.lastWaterUpdate = 0;
    }

    updateWarpgateAnimation() {
        const currentTime = millis();

        if (currentTime - this.lastWarpgateUpdate > 1000 * this.warpgateAnimationSpeed) {
            // Correctly increment the warpgate index with proper bounds checking
            this.warpgateIndex = (this.warpgateIndex + 1) % this.warpgateImages.length;

            this.lastWarpgateUpdate = currentTime;
        }
    }

    updateWaterAnimation() {
        const currentTime = millis();

        if (currentTime - this.lastWaterUpdate > 1000 * this.waterAnimationSpeed) {
            // Correctly increment the warpgate index with proper bounds checking
            this.waterIndex = (this.waterIndex + 1) % this.waterImages.length;

            this.lastWaterUpdate = currentTime;
        }
    }

    // Draw the warpgate animation at specific position
    drawWarpgateAnimation(panelX, panelY) {
        if (this.warpgateImages.length === 0) return; // Skip if no images loaded

        // Calculate fixed position relative to the panel
        const warpgateX = panelX + 571; // Position from left edge of panel
        const warpgateY = panelY + 558; // Position from top edge of panel

        // Draw current frame
        const currentFrame = this.warpgateImages[this.warpgateIndex];
        if (currentFrame) {
            image(currentFrame, warpgateX, warpgateY, this.warpgateWidth, this.warpgateHeight);
        }
    }

    // Draw the water animation at specific position
    drawWaterAnimation(panelX, panelY) {
        if (this.waterImages.length === 0) return; // Skip if no images loaded

        // Calculate fixed position relative to the panel
        const waterX = panelX + 79; // Position from left edge of panel
        const waterY = panelY + 461; // Position from top edge of panel  

        // Draw current frame
        const currentFrame = this.waterImages[this.waterIndex];
        if (currentFrame) {
            image(currentFrame, waterX, waterY, this.waterWidth, this.waterHeight);
        }
    }

    // Update and render all animations for image index 11
    updateAndDraw(panelX, panelY, enlargedSize) {

        // Update animations
        this.updateWarpgateAnimation();
        this.updateWaterAnimation();

        // Draw all elements
        this.drawWarpgateAnimation(panelX, panelY);
        this.drawWaterAnimation(panelX, panelY);
    }
}

// New BlackCircle class to manage individual black circles
class BlackCircle {
    constructor(image, x, y, width, height, removalDelay) {
        this.image = image;           // The image to display
        this.x = x;                   // X position relative to panel
        this.y = y;                   // Y position relative to panel
        this.width = width;           // Width to display
        this.height = height;         // Height to display
        this.visible = true;          // Whether this circle is visible
        this.removalDelay = removalDelay; // Delay before removal (ms after full brightness)
        this.scheduledRemovalTime = 0;    // When this circle should be removed
    }

    // Schedule removal based on a reference time (full brightness time)
    scheduleRemoval(referenceTime) {
        this.scheduledRemovalTime = referenceTime + this.removalDelay;
        return this.scheduledRemovalTime;
    }

    // Check if it's time to hide this circle
    checkVisibility(currentTime) {
        if (this.scheduledRemovalTime > 0 && currentTime >= this.scheduledRemovalTime) {
            this.visible = false;
        }
        return this.visible;
    }

    // Draw the circle if visible
    draw(panelX, panelY) {
        if (!this.visible) return;

        image(this.image, panelX + this.x, panelY + this.y, this.width, this.height);
    }

    // Reset the circle
    reset() {
        this.visible = true;
        this.scheduledRemovalTime = 0;
    }
}



// New ImageIndex10Manager class to manage hangar team blue animations
class ImageIndex10Manager {
    constructor() {
        // Black circle management

        // Darkness animation
        this.darknessFactor = 0;
        this.darknessSpeed = 0.02;
        this.darknessDuration = 0; // Start brightening immediately
        this.brighteningDuration = 2500; // 2 seconds to fully brighten
        this.hoverStartTime = 0;
        this.fullBrightTime = 0;

        // Background image
        this.backgroundImage = null;

        // Spacecraft
        this.spacecraft = [];

        // Animation timing
        this.animationState = 0; // 0: initial, 1: circles hidden, 2: upper moving, 3: lower moving, 4: moving to center, 5: complete
        this.stateChangeTime = 0;
        this.CIRCLES_HIDE_DELAY = 1000; // 1 second
        this.UPPER_MOVE_DELAY = 2000; // 2 seconds (1+1)
        this.LOWER_MOVE_DELAY = 3000; // 3 seconds (1+1+1)
        this.CENTER_MOVE_DELAY = 4000; // 4 seconds (1+1+1+1)
        this.VERTICAL_MOVE_DISTANCE = 30; // 30 pixels upward

        // Center movement parameters
        this.CENTER_X = 410; // Center X position within the panel 
        this.CENTER_Y = 193; // Center Y position within the panel
        this.FINAL_SIZE = 5;  // Final size before disappearing
        this.CENTER_INITIAL_SPEED = 0.01; // Even slower initial speed for more dramatic effect (was 0.02)

        // Track if all spacecraft have vanished
        this.allVanished = false;
    }

    // Reset all animations
    reset() {
        // Reset darkness animation
        this.darknessFactor = 0;
        this.hoverStartTime = 0;
        this.fullBrightTime = 0;
        // Reset spacecraft
        this.spacecraft.forEach(craft => craft.reset());
        this.stateChangeTime = 0;
    }

    // Load all animation assets
    loadImagesAndAddSpacecrafts() {
        // Load background image
        this.backgroundImage = loadImage("images/hangerTeamBlueEffect/hangerTeamBlueEmpty1.png");

        // Load spacecraft images and create spacecraft objects
        const blackCircleImg = loadImage("images/hangerTeamBlueEffect/blackCircleDownLeft1.png");
        const upperLeftImg = loadImage("images/hangerTeamBlueEffect/spaceCraftUpperLeft.png");
        const upperRightImg = loadImage("images/hangerTeamBlueEffect/spaceCraftUpperRight.png");
        const lowerLeftImg = loadImage("images/hangerTeamBlueEffect/spaceCraftLowerLeft.png");
        const lowerRightImg = loadImage("images/hangerTeamBlueEffect/spaceCraftLowerRight.png");

        // Create spacecraft objects
        this.spacecraft = [
            new HangarSpacecraft(upperLeftImg, 151, 377, 208, 111, blackCircleImg, 131, 636, 28, 26, 200, 638, 23, 24),
            new HangarSpacecraft(upperRightImg, 457, 378, 209, 113, blackCircleImg, 594, 635, 22, 21, 657, 635, 22, 23),
            new HangarSpacecraft(lowerLeftImg, 124, 523, 153, 142, blackCircleImg, 195, 459, 25, 25, 260, 459, 24, 23),
            new HangarSpacecraft(lowerRightImg, 540, 522, 147, 141, blackCircleImg, 528, 461, 25, 25, 591, 461, 24, 23)
        ];
    }

    // Draw all elements
    draw(panelX, panelY, panelSize, fadeAlpha) {
        if (!this.backgroundImage) return;

        // Apply darkness effect with tint
        const brightness = 255 * (1 - this.darknessFactor);
        tint(brightness, brightness, brightness, fadeAlpha);

        // Draw background image
        image(this.backgroundImage, panelX, panelY, panelSize, panelSize);

        // Update and then draw each spacecraft
        this.spacecraft.forEach(craft => {
            craft.update(); // Call update before drawing
            craft.draw(panelX, panelY);
        });
    }

    // Update all animations and render
    updateAndDraw(panelX, panelY, panelSize, fadeAlpha) {

        const currentTime = millis();

        // Always treat the first update as a new hover
        if (this.hoverStartTime === 0 && this.animationState < 5) {
            this.darknessFactor = 1.0; // Start fully dark
            this.animationState = 0;
        }

        // Update darkness animation
        this.updateDarkness(currentTime);

        // Only start the spacecraft animation sequence after we've finished brightening
        if (this.darknessFactor === 0) {
            // Update animation state based on timing
            this.updateAnimationState(currentTime);
        }

        // Draw everything
        this.draw(panelX, panelY, panelSize, fadeAlpha);

        return false; // Don't need to signal start of hover anymore
    }

    // Update darkness animation - modified to ensure brightness when animation completes
    updateDarkness(currentTime) {
        // Always keep brightness at maximum when animation has completed
        if (this.animationState === 5) {
            this.darknessFactor = 0;
            return;
        }

        // If this is the very first update after hover starts, set darkness to maximum
        if (this.hoverStartTime === 0) {
            this.hoverStartTime = currentTime;
            this.darknessFactor = 1.0; // Start fully dark (was 0.5)
        }

        // Calculate hover duration
        const hoverDuration = currentTime - this.hoverStartTime;

        if (hoverDuration <= this.darknessDuration) {
            // Keep initial darkness for the first period (now 0 seconds)
            this.darknessFactor = 1.0; // Fully dark
        } else if (hoverDuration <= this.darknessDuration + this.brighteningDuration) {
            // Gradually brighten over 2 seconds
            const brighteningProgress = (hoverDuration - this.darknessDuration) / this.brighteningDuration;
            this.darknessFactor = 1.0 - brighteningProgress; // Linear brightening from 1.0 to 0.0
        } else {
            // After total time, return to normal brightness
            this.darknessFactor = 0;
            // Store the time when we reached full brightness
            if (this.fullBrightTime === 0) {
                this.fullBrightTime = currentTime;
            }
        }
    }

    // Update animation states based on timing
    updateAnimationState(currentTime) {
        // Don't progress animation unless we've started hovering
        if (this.hoverStartTime === 0 || this.animationState === 5) return;

        // Calculate how long we've been hovering
        const hoverDuration = currentTime - this.hoverStartTime;

        // Handle state transitions based on hover duration
        if (this.animationState === 0 && hoverDuration >= this.CIRCLES_HIDE_DELAY) {
            // 1 second: Hide all black circles
            this.spacecraft.forEach(craft => craft.hideBlackCircles());
            this.animationState = 1;
            this.stateChangeTime = currentTime;

        } else if (this.animationState === 1 && hoverDuration >= this.UPPER_MOVE_DELAY) {
            // 2 seconds: Move the upper two spacecraft up by 30 pixels
            this.spacecraft[0].moveUp(this.spacecraft[0].y - this.VERTICAL_MOVE_DISTANCE);
            this.spacecraft[1].moveUp(this.spacecraft[1].y - this.VERTICAL_MOVE_DISTANCE);
            this.animationState = 2;
            this.stateChangeTime = currentTime;

        } else if (this.animationState === 2 && hoverDuration >= this.LOWER_MOVE_DELAY) {
            // 3 seconds: Move the lower two spacecraft up by 30 pixels
            this.spacecraft[2].moveUp(this.spacecraft[2].y - this.VERTICAL_MOVE_DISTANCE);
            this.spacecraft[3].moveUp(this.spacecraft[3].y - this.VERTICAL_MOVE_DISTANCE);
            this.animationState = 3;
            this.stateChangeTime = currentTime;

        } else if (this.animationState === 3 && hoverDuration >= this.CENTER_MOVE_DELAY) {
            // 4 seconds: All spacecraft move to center and shrink
            for (let craft of this.spacecraft) {
                craft.moveToCenter(this.CENTER_X, this.CENTER_Y, this.FINAL_SIZE, this.CENTER_INITIAL_SPEED);
            }
            this.animationState = 4;
            this.stateChangeTime = currentTime;
        }

        // Check if all spacecraft have vanished (only in state 4)
        if (this.animationState === 4 && !this.allVanished) {
            this.allVanished = this.spacecraft.every(craft => craft.vanished);
            if (this.allVanished) {
                this.animationState = 5; // Final state - all vanished
            }
        }
    }
}

// New Spacecraft class for hangar animation
class HangarSpacecraft {
    constructor(image, x, y, width, height, blackCircleImage, blackCircleLeftX, blackCircleLeftY, blackCircleLeftWidth, blackCircleLeftHeight, blackCircleRightX, blackCircleRightY, blackCircleRightWidth, blackCircleRightHeight) {
        this.image = image;
        this.originalX = x;
        this.originalY = y;
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.originalWidth = width;
        this.originalHeight = height;
        this.isUpper = (y < 500); // Whether this is an upper spacecraft
        this.blackCircleImage = blackCircleImage;
        this.blackCircleLeftX = blackCircleLeftX;
        this.blackCircleLeftY = blackCircleLeftY;
        this.blackCircleLeftWidth = blackCircleLeftWidth;
        this.blackCircleLeftHeight = blackCircleLeftHeight;
        this.blackCircleRightX = blackCircleRightX;
        this.blackCircleRightY = blackCircleRightY;
        this.blackCircleRightWidth = blackCircleRightWidth;
        this.blackCircleRightHeight = blackCircleRightHeight;

        // Animation states
        this.showBlackCircles = true;
        this.targetY = y; // Target position for vertical movement
        this.movingUp = false;

        // Add center movement properties
        this.movingToCenter = false;
        this.targetCenterX = 0;
        this.targetCenterY = 0;
        this.finalSize = 45;
        this.centerSpeed = 0.0001;
        this.vanished = false;

        // Add acceleration parameters
        this.upwardAcceleration = 0.0001; // Start slow and accelerate
        this.upwardSpeed = 0.0005;       // Initial upward movement speed
        this.maxUpwardSpeed = 0.2;      // Maximum upward movement speed

        this.centerAcceleration = 0.0007; // Increase center movement acceleration for more dramatic effect
        this.centerInitialSpeed = 0.00001;  // Start MUCH slower for center movement (was 0.02)
        this.centerMaxSpeed = 0.15;      // Higher maximum center movement speed (was 0.08)
    }

    // Reset spacecraft to original position
    reset() {
        this.x = this.originalX;
        this.y = this.originalY;
        this.width = this.originalWidth;
        this.height = this.originalHeight;
        this.showBlackCircles = true;
        this.targetY = this.originalY;
        this.movingUp = false;
        this.movingToCenter = false;
        this.targetCenterX = 0;
        this.targetCenterY = 0;
        // this.vanished = false;
        this.upwardSpeed = 0.05;  // Reset speed values
        this.centerSpeed = 0.02;  // Reset center movement speed
    }

    // Move spacecraft upward by specified amount
    moveUp(targetY, speed) {
        this.targetY = targetY;
        this.movingUp = true;
        this.upwardSpeed = 0.05; // Start with initial speed
    }

    // Move spacecraft toward center and shrink
    moveToCenter(centerX, centerY, finalSize, initialSpeed) {
        this.targetCenterX = centerX;
        this.targetCenterY = centerY;
        this.finalSize = finalSize;
        this.centerSpeed = this.centerInitialSpeed; // Use very slow initial speed
        this.movingToCenter = true;
        this.movingUp = false; // Stop vertical movement
    }

    // Update spacecraft position animation with acceleration
    update() {
        // If moving up, animate toward target Y position with acceleration
        if (this.movingUp && Math.abs(this.y - this.targetY) > 0.5) {
            // Apply acceleration but limit to maximum speed
            this.upwardSpeed = min(this.upwardSpeed + this.upwardAcceleration, this.maxUpwardSpeed);

            // Move with current speed
            this.y = lerp(this.y, this.targetY, this.upwardSpeed);
            return false; // Still moving
        } else if (this.movingUp) {
            this.y = this.targetY;
            this.movingUp = false;
            // Reset speed for next time
            this.upwardSpeed = 0.05;
            return true; // Movement complete
        }

        // Handle center movement if active
        if (this.movingToCenter && !this.vanished) {
            // Calculate center points for interpolation
            const currentCenterX = this.x + this.width / 2;
            const currentCenterY = this.y + this.height / 2;

            // Apply acceleration to center movement speed
            const currentDistance = dist(currentCenterX, currentCenterY, this.targetCenterX, this.targetCenterY);
            const distanceProgress = map(
                currentDistance,
                0,
                dist(this.originalX + this.originalWidth / 2, this.originalY + this.originalHeight / 2, this.targetCenterX, this.targetCenterY),
                1, 0
            );

            // More acceleration as they get closer to the center
            const dynamicAcceleration = this.centerAcceleration * (1 + distanceProgress * 2);
            this.centerSpeed = min(this.centerSpeed + dynamicAcceleration, this.centerMaxSpeed);

            // Move toward target center with accelerating speed
            const newCenterX = lerp(currentCenterX, this.targetCenterX, this.centerSpeed);
            const newCenterY = lerp(currentCenterY, this.targetCenterY, this.centerSpeed);

            // Shrink based on distance to target
            const sizeFactor = 1 - pow(distanceProgress, 1.5);
            this.width = max(this.finalSize, this.originalWidth * sizeFactor);
            this.height = max(this.finalSize, this.originalHeight * sizeFactor);

            // Recalculate top-left corner from center position
            this.x = newCenterX - this.width / 2;
            this.y = newCenterY - this.height / 2;

            // Check if spacecraft has reached minimum size
            if (this.width <= this.finalSize + 10) {
                this.vanished = true;
                return true; // Movement and shrinking complete
            }

            return false; // Still moving/shrinking
        }

        return false; // No movement happening
    }

    // Hide black circles
    hideBlackCircles() {
        this.showBlackCircles = false;
    }

    // Draw spacecraft at current position/size
    draw(panelX, panelY) {
        // Don't draw if vanished
        if (this.vanished) return;

        // Draw spacecraft
        image(this.image, panelX + this.x, panelY + this.y, this.width, this.height);

        // Draw black circles if they should be visible
        if (this.showBlackCircles) {
            image(this.blackCircleImage, panelX + this.blackCircleLeftX, panelY + this.blackCircleLeftY,
                this.blackCircleLeftWidth, this.blackCircleLeftHeight);
            image(this.blackCircleImage, panelX + this.blackCircleRightX, panelY + this.blackCircleRightY,
                this.blackCircleRightWidth, this.blackCircleRightHeight);
        }
    }
}

// Background class to manage stars and scene elements
class BackgroundManager {
    constructor() {
        this.stars = [];
        this.decorativeStars = [];
        this.targetStar = null;
        this.flashEffect = 0;
    }

    // Initialize background elements
    initialize() {
        // Create stars
        this.createBackgroundStars();

        // Create target star at predefined position
        this.targetStar = new YellowStar(1300, 300);

        // Create decorative stars
        this.createDecorativeStars();
    }

    // Create background stars
    createBackgroundStars() {
        this.stars = [];
        for (let i = 0; i < 100; i++) {
            this.stars.push({
                x: random(width),
                y: random(height),
                size: random(1, 3),
                twinkle: random(0.01, 0.05)
            });
        }
    }

    // Create decorative stars
    createDecorativeStars() {
        this.decorativeStars = [];
        const imagePositions = this.calculateImagePositions();
        const enlargedRect = this.calculateEnlargedImageRect();

        for (let i = 0; i < 20; i++) {
            // Find valid position for the star
            const position = this.findValidStarPosition(imagePositions, enlargedRect);
            this.decorativeStars.push(new DecorativeStar(position.x, position.y));
        }
    }

    // Calculate positions of game images for collision avoidance
    calculateImagePositions() {
        const positions = [];
        const centerX = 100 + CIRCLE_RADIUS;
        const centerY = 100 + CIRCLE_RADIUS;
        const extraSize = 140; // Slightly larger for collision detection

        const images = gameImageManager.gameImages; // Reference GameImageManager's instance

        for (let i = 0; i < images.length; i++) {
            const angle = i * (TWO_PI / Math.max(4, images.length));
            const x = centerX + CIRCLE_RADIUS * cos(angle);
            const y = centerY + CIRCLE_RADIUS * sin(angle);
            positions.push({
                x, y,
                radius: extraSize / 1.5
            });
        }

        return positions;
    }

    // Calculate the rectangle for the enlarged image area
    calculateEnlargedImageRect() {
        const circleRightEdge = 100 + CIRCLE_RADIUS * 2 + 150;
        const enlargedSize = 840;
        const x = circleRightEdge;
        const y = height / 2 - enlargedSize / 2 - 100;

        return {
            left: x - 20,
            top: y - 20,
            right: x + enlargedSize + 20,
            bottom: y + enlargedSize + 60
        };
    }

    // Find a valid position for a decorative star avoiding collisions
    findValidStarPosition(imagePositions, enlargedRect) {
        let x, y;
        let validPosition = false;

        while (!validPosition) {
            x = random(200, width - 200);
            y = random(100, height - 100);
            validPosition = true;

            // Check against image positions
            for (const pos of imagePositions) {
                if (dist(x, y, pos.x, pos.y) < pos.radius) {
                    validPosition = false;
                    break;
                }
            }

            // Check against enlarged image area
            if (validPosition &&
                x >= enlargedRect.left && x <= enlargedRect.right &&
                y >= enlargedRect.top && y <= enlargedRect.bottom) {
                validPosition = false;
            }
        }

        return { x, y };
    }

    // Draw all stars in the background
    drawStars() {
        fill(255);
        noStroke();
        this.stars.forEach(star => {
            const brightness = 150 + 105 * sin(frameCount * star.twinkle);
            fill(brightness);
            ellipse(star.x, star.y, star.size);
        });
    }

    // Draw all scene elements
    drawBackground() {
        // Draw background stars
        this.drawStars();

        // Draw target star
        if (this.targetStar) {
            this.targetStar.draw();
        }

        // Draw decorative stars
        this.decorativeStars.forEach(star => star.draw());

        // Add flash effect on top if active
        if (this.flashEffect > 0) {
            fill(255, 255, 255, this.flashEffect * 8);
            rectMode(CORNER);
            rect(0, 0, width, height);
            this.flashEffect--;
        }
    }

    // Set the hover state of the target star
    setTargetStarHovered(isHovered) {
        if (this.targetStar) {
            this.targetStar.setButtonHovered(isHovered);
        }
    }

    // Handle supernova trigger for a specific decorative star
    triggerSupernova(index) {
        if (index < this.decorativeStars.length) {
            this.decorativeStars[index].triggerSupernova();
        }
    }

    // Set flash effect
    setFlashEffect(intensity) {
        this.flashEffect = intensity;
    }

    // Get the target star
    getTargetStar() {
        return this.targetStar;
    }

    // Get all decorative stars
    getDecorativeStars() {
        return this.decorativeStars;
    }

    // Reset hover state for all decorative stars
    resetStarHoverStates() {
        this.decorativeStars.forEach(star => star.setButtonHovered(false));
    }
}

// New class to manage game images (both small circle and enlarged view)
class GameImageManager {
    constructor() {
        this.hoveredImageIndex = -1;
        this.enlargedImageFade = 0; // Value from 0 to 1 for fade opacity
        this.previousHoveredIndex = -1;
        this.gameImages = []; // This now fully owns the game images
        this.image10HoverStartTime = 0; // Initialize image10HoverStartTime
        this.animationPosX = 0; // Initialize animationPosX
        this.animationPosY = 0; // Initialize animationPosY
        this.animationIsPaused = false;
        this.animationInCycleMode = false;
        this.pauseStartTime = 0;
        this.initialX = 0;
        this.initialY = 0;
        this.spiderScaleFactor = 0.2;
        this.showBlackCirclesForImage10 = false;
        this.blackCirclesVisible = Array(8).fill(true);
        this.blackCirclesRemovalTimes = Array(4).fill(0);
        // Add missing variables that were previously global
        this.darknessFactor = 0;
        this.image10FullBrightTime = 0;
        this.jellyfishPermanentlyDisabled = false;
    }

    // Load game background images
    loadImages() {
        const imagePaths = [
            "images/background/hangerTeamGreen.png", "images/background/planet1p1.png", "images/background/planet1p2.png",
            "images/background/planet1p3.png", "images/background/planet2p1.png", "images/background/planet2p2.png",
            "images/background/planet3p1.png", "images/background/planet3p2.png", "images/background/planet3p3.png",
            "images/background/planet3p4.png", "images/background/hangerTeamBlue.png", "images/background/planet4p1.png",
            "images/background/planet4p2.png", "images/background/planet4p3cleaned.png", "images/background/planet4p4.png",
            "images/background/logo.png", "images/background/planet0p1.png", "images/background/planet0p2.png",
            "images/background/planet0p3.png", "images/background/planet0p4.png"
        ];

        // Clear previous images if any
        this.gameImages = [];

        // Load images
        imagePaths.forEach(path => this.gameImages.push(loadImage(path)));

        // No longer returning the array since it's accessed directly via this.gameImages
    }

    // Add global game states for backward compatibility
    updateGlobalVars() {
        // Update global hoveredImageIndex for backward compatibility
        hoveredImageIndex = this.hoveredImageIndex;
        enlargedImageFade = this.enlargedImageFade;
    }

    drawGameImages() {
        const centerX = 100 + CIRCLE_RADIUS;
        const centerY = 100 + CIRCLE_RADIUS;

        this.hoveredImageIndex = -1; // Reset hover state
        backgroundManager.resetStarHoverStates();

        for (let i = 0; i < this.gameImages.length; i++) {
            const angle = i * (TWO_PI / Math.max(4, this.gameImages.length));
            const x = centerX + CIRCLE_RADIUS * cos(angle) - IMAGE_SIZE / 2;
            const y = centerY + CIRCLE_RADIUS * sin(angle) - IMAGE_SIZE / 2;

            // Check if mouse is hovering over this image
            if (mouseX > x && mouseX < x + IMAGE_SIZE &&
                mouseY > y && mouseY < y + IMAGE_SIZE) {

                this.hoveredImageIndex = i;

                // Activate corresponding star hover state
                if (i < backgroundManager.getDecorativeStars().length) {
                    backgroundManager.getDecorativeStars()[i].setButtonHovered(true);
                }

                // Enhanced glow for hovered image
                drawingContext.shadowBlur = 30;
                drawingContext.shadowColor = 'rgba(100, 200, 255, 0.8)';
            } else {
                // Regular glow
                drawingContext.shadowBlur = 20;
                drawingContext.shadowColor = 'rgba(50, 100, 255, 0.5)';
            }

            image(this.gameImages[i], x, y, IMAGE_SIZE, IMAGE_SIZE);
            drawingContext.shadowBlur = 0;
        }

        // If the hovered image has changed, reset animations
        if (this.previousHoveredIndex !== this.hoveredImageIndex) {
            this.previousHoveredIndex = this.hoveredImageIndex;
            if (this.hoveredImageIndex >= 0) {
                this.resetAnimationPosition();
            }
        }

        // Update global variables
        // this.updateGlobalVars();
    }

    resetAnimationPosition() {
        // Reset image-specific animations - use the instances, not the class names
        imageIndex10Manager.reset();
        imageIndex11Manager.reset();
        imageIndex13Manager.reset();
        imageIndex16Manager.reset();

        // Reset for backward compatibility
        this.animationPosX = 0; // Reset animationPosX
        this.animationPosY = 0; // Reset animationPosY
        this.animationIsPaused = false;
        this.animationInCycleMode = false;
        this.pauseStartTime = 0;
        this.initialX = 0;
        this.initialY = 0;
        this.spiderScaleFactor = 0.2;

        // Reset darkness variables
        this.darknessFactor = 0; // Use instance variable
        this.image10HoverStartTime = 0; // Reset hover timing
        this.image10FullBrightTime = 0; // Use instance variable
        this.showBlackCirclesForImage10 = false;
        this.blackCirclesVisible = Array(8).fill(true);
        this.blackCirclesRemovalTimes = Array(4).fill(0);

        this.jellyfishPermanentlyDisabled = false;
    }

    drawEnlargedImage() {
        // Handle fade animation
        if (this.hoveredImageIndex < 0 || this.hoveredImageIndex >= this.gameImages.length) {
            this.enlargedImageFade = max(0, this.enlargedImageFade - 0.08); // Fade out
            this.darknessFactor = 0; // Reset darkness when not hovering any image - use this.
            this.image10HoverStartTime = 0; // Reset hover timing
            if (this.enlargedImageFade <= 0) return; // Nothing to draw
        } else {
            // If we're hovering over a new image, reset animation position
            if (this.hoveredImageIndex !== 10) {
                this.darknessFactor = 0; // Use this.
            }
            this.enlargedImageFade = min(1, this.enlargedImageFade + 0.1); // Fade in
        }

        if (this.enlargedImageFade > 0) {
            const circleRightEdge = 100 + CIRCLE_RADIUS * 2 + 150;
            const enlargedSize = 800;
            const x = circleRightEdge;
            const y = height / 2 - enlargedSize / 2 - 100;

            const fadeAlpha = 255 * this.enlargedImageFade;

            // Apply glow effect
            drawingContext.shadowBlur = 40 * this.enlargedImageFade;
            drawingContext.shadowColor = `rgba(100, 200, 255, ${0.7 * this.enlargedImageFade})`;

            // Determine which image to display
            const imageIndex = this.hoveredImageIndex >= 0 ?
                this.hoveredImageIndex : constrain(this.previousHoveredIndex, 0, this.gameImages.length - 1);

            // Draw background panel - use black for image 10, standard color for others
            if (imageIndex === 10) {
                // Black background for image 10
                fill(0, 0, 0, 230 * this.enlargedImageFade); // Pure black with opacity
            } else {
                // Standard background color for other images
                fill(20, 40, 80, 200 * this.enlargedImageFade);
            }

            rectMode(CORNER);
            rect(x - 20, y - 20, enlargedSize + 40, enlargedSize + 40, 15);

            // Handle special case animations based on imageIndex
            if (imageIndex === 10) {
                drawingContext.shadowBlur = 0;
                // Use imageIndex10Manager instance, not the class
                imageIndex10Manager.updateAndDraw(x, y, enlargedSize, fadeAlpha);
            } else {
                // For all other indexes, just draw the regular image with applied tint
                tint(255, 255, 255, fadeAlpha);
                image(this.gameImages[imageIndex], x, y, enlargedSize, enlargedSize);
            }

            drawingContext.shadowBlur = 0;

            // Special case for index 11: add animation overlay on top of the enlarged image
            if (imageIndex === 8) {
                // Use imageIndex13Manager instance, not the class
                imageIndex8Manager.updateAndDraw(x, y, enlargedSize);
            }
            if (imageIndex === 11) {
                // Use imageIndex11Manager instance, not the class
                imageIndex11Manager.updateAndDraw(x, y, enlargedSize);
            }
            // Special case for index 13: add the jellyfish animation
            else if (imageIndex === 13) {
                // Use imageIndex13Manager instance, not the class
                this.jellyfishPermanentlyDisabled = imageIndex13Manager.updateAndDraw(x, y);
            }
            else if (imageIndex === 16) {
                // Use imageIndex11Manager instance, not the class
                imageIndex16Manager.updateAndDraw(x, y, enlargedSize);
            }
            else {
                // Deactivate jellyfishes when hovering other images - use instance
                imageIndex13Manager.deactivateAll();
            }

            noTint();

            // Draw image name caption
            fill(255, fadeAlpha);
            textSize(24);
            const imageName = this.extractImageName(imageIndex);
            text(imageName, x + enlargedSize / 2, y + enlargedSize + 30);

            drawingContext.shadowBlur = 0;
        }
    }

    extractImageName(index) {
        const path = this.gameImages[index].src || "";
        const filename = path.split('/').pop();
        const name = filename.split('.')[0];

        // Format name (add spaces between camelCase and before numbers)
        return name.replace(/([A-Z])/g, ' $1')
            .replace(/([0-9])/g, ' $1')
            .trim()
            .charAt(0).toUpperCase() + name.slice(1);
    }

    checkImageClicks() {
        const centerX = 100 + CIRCLE_RADIUS;
        const centerY = 100 + CIRCLE_RADIUS;

        for (let i = 0; i < this.gameImages.length; i++) {
            const angle = i * (TWO_PI / Math.max(4, this.gameImages.length));
            const x = centerX + CIRCLE_RADIUS * cos(angle) - IMAGE_SIZE / 2;
            const y = centerY + CIRCLE_RADIUS * sin(angle) - IMAGE_SIZE / 2;

            // Check if mouse is over this image
            if (mouseX > x && mouseX < x + IMAGE_SIZE &&
                mouseY > y && mouseY < y + IMAGE_SIZE) {

                // Trigger supernova for corresponding star
                if (i < backgroundManager.getDecorativeStars().length) {
                    backgroundManager.triggerSupernova(i);
                }
                break;
            }
        }
    }
}
