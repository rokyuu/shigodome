/* ============================================
   Global Variables & Constants
   ============================================ */
   let originColor, targetColor, currentColor;
   let colorEntries = [];
   let colorOptions = [];
   let gameActive = false;
   let gameWon = false;
   let rankLatest = 0;
   let rankPrevious = rankLatest;
   let goblin;
   let currentColorBox;
   let targetColorBox;
   let splat; // our main splat object
   
   let splatImages = []; // global array for the splat images
   let janesplatImages = []; // global array for the new splat images
   let goblinImages = [];
   
   let speechBubbleImage;  // This is our "youbub.png"
   let gobbubImage;        // New: for "gobbub.png"
   let bubbleStartTime = 0;
   let bubbleDuration = 1000; // Duration in milliseconds (1 second)
   let showBubble = false;
   


   
   /* ============================================
   p5.js Preload Function
   ============================================ */
function preload() {
    goblinImages[0] = loadImage("images/goblin/gobbase.png");
    goblinImages[1] = loadImage("images/goblin/gobhappy.png");
    goblinImages[2] = loadImage("images/goblin/gobmid.png");
    goblinImages[3] = loadImage("images/goblin/gobanger.png");
    goblinImages[4] = loadImage("images/goblin/gobexite.png");
  
    // Load the speech bubble images
    speechBubbleImage = loadImage("images/speechbubs/youbub.png");
    gobbubImage = loadImage("images/speechbubs/gobbub.png"); // New image
    
    // Load the janesplat images
    janesplatImages.push(loadImage("images/janesplats/splat1f1.png"));
    janesplatImages.push(loadImage("images/janesplats/splat2f1.png"));
    janesplatImages.push(loadImage("images/janesplats/splat3f1.png"));
    janesplatImages.push(loadImage("images/janesplats/splat4f1.png"));
    janesplatImages.push(loadImage("images/janesplats/splat5f1.png"));
    janesplatImages.push(loadImage("images/janesplats/splat6f1.png"));
  }
  
      
   
   /* ============================================
      Utility Functions
      ============================================ */
   const euclideanDistance = (a, b) =>
     Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]);
   
   function mapColorToLocation(p5Color) {
     return { 
       x: red(p5Color), 
       y: green(p5Color), 
       z: blue(p5Color) 
     };
   }
   
   // This function triggers the "active" speech bubble.
function triggerSpeechBubble() {
    bubbleStartTime = millis();
    showBubble = true;
  }
  
  
   /* ============================================
      Class Definitions
      ============================================ */
   class ColorEntry {
     constructor(id, r, g, b, distance, rank, distanceFromCurrentLocation) {
       this.id = id;
       this.r = r;
       this.g = g;
       this.b = b;
       this.distance = distance;
       this.rank = rank;
       this.location = mapColorToLocation([r, g, b]);
       this.distanceFromCurrentLocation = distanceFromCurrentLocation;
     }
   }
   
   class Goblin {
    constructor() {
      // No need to define width/height if we're using the natural size.
      // We'll simply center the image.
      this.expression = "(^ _ ^)/"; // Default expression
    }
  
    updateExpression() {
    }
  
    draw() {
      // Set the image mode to CENTER
      imageMode(CENTER);
  
      // Select the correct goblin image based on rankLatest
      let currentGoblin;
      switch (rankLatest) {
        case 0:
          currentGoblin = goblinImages[0]; // gobbase.png
          break;
        case 1:
          currentGoblin = goblinImages[1]; // gobhappy.png
          break;
        case 2:
          currentGoblin = goblinImages[2]; // gobmid.png
          break;
        case 3:
          currentGoblin = goblinImages[3]; // gobanger.png
          break;
        case 4:
          currentGoblin = goblinImages[4]; // gobexcite.png
          break;
        default:
          currentGoblin = goblinImages[0]; // Fallback to gobbase.png
      }
  
      // Draw the selected goblin image
      image(currentGoblin, width / 2, 1.8 * height / 3);
    }
  }
  
  
   
   class ColorBox {
     constructor(x, y, width, height, colorValue) {
       this.x = x;
       this.y = y;
       this.width = width;
       this.height = height;
       this.colorValue = colorValue;
     }
   
     updateColor(newColor) {
       this.colorValue = newColor;
     }
   
     draw() {
       fill(this.colorValue);
       rect(this.x, this.y, this.width, this.height);
     }
   }
   
   /* ============================================
      SplatOption Class (New)
      ============================================ */
   /*
     The SplatOption class is used for the color option selections.
     Instead of a simple rectangle, it renders a splat (with a border effect)
     that is tinted to the option's color. It also drifts slightly via its update() method
     and is clickable via the contains() method.
   */
     class SplatOption {
        /**
         * @param {number} index - The index of this option (used for positioning and label).
         * @param {p5.Color} colorValue - The color this option represents.
         * @param {p5.Image} img - The splat image to use (unique for each option).
         * @param {number} scale - Scale factor for the splat image.
         * @param {number} borderSize - Offset for the border copies.
         * @param {number} iterations - How many border copies to draw.
         */
        constructor(index, colorValue, img, scale = 0.7, borderSize = 2, iterations = 5) {
          this.index = index;
          this.colorValue = colorValue;
          this.img = img; // Use the image passed in
      
          // Compute a secondary color that's 20% toward black from the main color.
          this.secondaryColor = lerpColor(this.colorValue, color(0, 0, 0), 0.2);
          
          // Set target positions based on the canvas dimensions:
          if (this.index === 0) {
            // First option: left middle side.
            this.targetX = width * 0.20;
            this.targetY = height * 0.5;
          } else if (this.index === 1) {
            // Second option: randomly choose between top middle left or top middle right.
            if (random() < 0.5) {
              this.targetX = width * 0.3;
              this.targetY = height * 0.2;
            } else {
              this.targetX = width * 0.65;
              this.targetY = height * 0.25;
            }
          } else if (this.index === 2) {
            // Third option: right middle side.
            this.targetX = width * 0.75;
            this.targetY = height * 0.6;
          }
          
          this.scale = scale;
          this.borderSize = borderSize;
          this.iterations = iterations;
          
          // Choose an initial position off-screen for the "shoot into place" effect:
          let side = floor(random(4));
          switch (side) {
            case 0: // Top
              this.x = random(width);
              this.y = -50;
              break;
            case 1: // Bottom
              this.x = random(width);
              this.y = height + 50;
              break;
            case 2: // Left
              this.x = -50;
              this.y = random(height);
              break;
            case 3: // Right
              this.x = width + 50;
              this.y = random(height);
              break;
          }
          
          this.arrived = false;
          this.noiseOffsetX = 0;
          this.noiseOffsetY = 0;
          
          // Create an off-screen graphics buffer for caching the composite splat:
          this.cacheW = this.img.width * this.scale + 10;
          this.cacheH = this.img.height * this.scale + 10;
          this.cache = createGraphics(this.cacheW, this.cacheH);
          this.renderToCache();
        }
        
        renderToCache() {
            // Clear the cache.
            this.cache.clear();
          
            // Draw the filled part (the image is all white and light gray)
            this.cache.push();
            this.cache.imageMode(CENTER);
            this.cache.tint(this.colorValue); // this will turn white into the desired color
            this.cache.image(
            this.img,
            this.cacheW / 2,
            this.cacheH / 2,
            this.img.width * this.scale,
            this.img.height * this.scale
            );
            this.cache.pop();

          
            // 4. Draw the option number on top using the secondary color.
            this.cache.push();
            this.cache.textAlign(CENTER, CENTER);
            this.cache.fill(this.secondaryColor);
            this.cache.textSize(24);
            this.cache.text(`${this.index + 1}`, this.cacheW / 2, this.cacheH / 2);
            this.cache.pop();
          }
          
          
        
        update() {
          if (!this.arrived) {
            this.x = lerp(this.x, this.targetX, 0.1);
            this.y = lerp(this.y, this.targetY, 0.1);
            if (dist(this.x, this.y, this.targetX, this.targetY) < 1) {
              this.arrived = true;
              this.noiseOffsetX = random(1000);
              this.noiseOffsetY = random(1000);
            }
          } else {
            let t = millis() * 0.001;
            let amplitude = 25;
            this.x = this.targetX + map(noise(this.noiseOffsetX + t), 0, 1, -amplitude, amplitude);
            this.y = this.targetY + map(noise(this.noiseOffsetY + t), 0, 1, -amplitude, amplitude);
          }
        }
        
        contains(mx, my) {
          let d = dist(mx, my, this.x, this.y);
          return d < (this.img.width * this.scale) / 2;
        }
        
        draw() {
          this.update();
          push();
          imageMode(CENTER);
          image(this.cache, this.x, this.y);
          pop();
        }
      }
      
      
      
      
      
   
   /* ============================================
      Game Logic Functions
      ============================================ */
   function startGame() {
     originColor = color(floor(random(256)), floor(random(256)), floor(random(256)));
     targetColor = color(floor(random(256)), floor(random(256)), floor(random(256)));
     currentColor = originColor;
     colorEntries = [];
     colorOptions = [];
     rankLatest = 0;
     rankPrevious = rankLatest;
     gameActive = true;
     gameWon = false;
   
     // Initialize Color Boxes after setting colors
     currentColorBox = new ColorBox(10, 10, 20, 20, currentColor);
     targetColorBox = new ColorBox(40, 10, 20, 20, targetColor);
   
     generateColorOptions();
   }
   
   function winGame() {
     gameActive = false;
     gameWon = true;
     rankLatest=4;
   }
   
   function generateColorOptions() {
    colorEntries = [];
    colorOptions = [];
    let distanceToTarget = euclideanDistance(
      [red(currentColor), green(currentColor), blue(currentColor)],
      [red(targetColor), green(targetColor), blue(targetColor)]
    );
    let rubberBand = map(log(distanceToTarget + 1), log(1), log(441.67 + 1), 3, 40);
    
    // First, generate the color entries:
    for (let i = 0; i < 3; i++) {
      addColorEntry(rubberBand);
    }
    rankColorEntries();
    
    // Now, make a copy of the janesplatImages array and shuffle it.
    let availableImages = janesplatImages.slice();
    shuffle(availableImages, true); // Shuffle in place
    
    // Create a SplatOption for each color entry, assigning a unique image.
    for (let i = 0; i < 3; i++) {
      colorOptions.push(new SplatOption(i, color(colorEntries[i].r, colorEntries[i].g, colorEntries[i].b), availableImages[i]));
    }
  }
  
   
   function addColorEntry(rubberBand) {
     let id = colorEntries.length + 1;
     
     let innerBand = rubberBand * 2 * id;
     innerBand *= random([-1, 1]); 
     
     let r = constrain(floor(red(currentColor) + random(-innerBand, innerBand)), 0, 255);
     let g = constrain(floor(green(currentColor) + random(-innerBand, innerBand)), 0, 255);
     let b = constrain(floor(blue(currentColor) + random(-innerBand, innerBand)), 0, 255);
   
     let distance = euclideanDistance(
       [r, g, b],
       [red(targetColor), green(targetColor), blue(targetColor)]
     );
   
     let distanceFromCurrentLocation = euclideanDistance(
       [r, g, b],
       [red(currentColor), green(currentColor), blue(currentColor)]
     );
   
     let rank = 0;
   
     let newEntry = new ColorEntry(id, r, g, b, distance, rank, distanceFromCurrentLocation);
     colorEntries.push(newEntry);
   }
   
   function rankColorEntries() {
     colorEntries.sort((a, b) => a.distance - b.distance);
     for (let i = 0; i < colorEntries.length; i++) {
       colorEntries[i].rank = i + 1;
     }
     colorEntries.sort((a, b) => a.id - b.id);
   }
   
   function clearColorEntries() {
     colorEntries = [];
   }
   
   /* ============================================
      p5.js Callback Functions
      ============================================ */
   function setup() {
     createCanvas(1024, 600);
     imageMode(CENTER); // Set a default image mode for consistency
     goblin = new Goblin();
     currentColorBox = new ColorBox(200, 300, 300, 50, currentColor);
     targetColorBox = new ColorBox(50, 50, 450, 100, targetColor);
     // Start the game (which will create the color options)
     startGame();
   }
   
   /* ============================================
   p5.js Callback Functions
   ============================================ */
function draw() {
    background(220);
  
    goblin.updateExpression();
    goblin.draw();
  
    // Draw each color option (splat options)
    for (let i = 0; (i < colorOptions.length) && gameActive; i++) {
      colorOptions[i].draw();
    }
  
    // Always display a speech bubble:
    // If the bubble duration has not expired, show youbub.png tinted with currentColor;
    // otherwise, show gobbub.png.
    push();
    imageMode(CENTER);
    if (millis() - bubbleStartTime < bubbleDuration) {
      tint(currentColor);
      image(speechBubbleImage, width / 6, height / 2 + 150);
    } else {
      // Optionally, reset the flag if needed:
      showBubble = false;
      tint(targetColor);
      image(gobbubImage, 1.7*width / 3, height / 2 + 250);
    }
    pop();
  }
  
  
   
   // Use mouse clicks to select a splat option
   function mousePressed() {
     if (gameActive) {
       for (let i = 0; i < colorOptions.length; i++) {
         if (colorOptions[i].contains(mouseX, mouseY)) {
           // When a splat option is clicked, update the current color.
           currentColor = colorOptions[i].colorValue;
           currentColorBox.updateColor(currentColor);
   
           rankPrevious = rankLatest;
           rankLatest = colorEntries[i].rank;
   
           let winDistance = euclideanDistance(
             [red(currentColor), green(currentColor), blue(currentColor)],
             [red(targetColor), green(targetColor), blue(targetColor)]
           );
   
           if (winDistance <= 60) {
             currentColor = targetColor;
             currentColorBox.updateColor(targetColor);
             winGame();
           } else {
             generateColorOptions();
           }
   
           // Update the goblin's expression on selection
           goblin.updateExpression();
           triggerSpeechBubble();
           break; // Only process one splat click per mouse press.
         }
       }
     }
   }
   
   function keyPressed() {
    // Log the key to debug whether key events are firing.
    console.log("Key pressed:", key);
    
    // Convert the key to lowercase to catch both 's' and 'S'
    if (key.toLowerCase() === 's') {
      startGame();
    }
    
    if (gameActive && (key >= '1' && key <= '3')) {
      let index = int(key) - 1;
      if (colorEntries[index]) {
        currentColor = color(colorEntries[index].r, colorEntries[index].g, colorEntries[index].b);
        currentColorBox.updateColor(currentColor);
  
        rankPrevious = rankLatest;
        rankLatest = colorEntries[index].rank;
  
        let winDistance = euclideanDistance(
          [red(currentColor), green(currentColor), blue(currentColor)],
          [red(targetColor), green(targetColor), blue(targetColor)]
        );
  
        if (winDistance <= 60) {
          currentColor = targetColor;
          currentColorBox.updateColor(targetColor);
          winGame();
        } else {
          generateColorOptions();
        }
  
        // Update Goblin's expression on selection
        goblin.updateExpression();
      }
    }
  }
  
   