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
   
   /* ============================================
      p5.js Preload Function
      ============================================ */
   function preload() {
     // Load all splat images (splat00.png to splat35.png)
     for (let i = 0; i < 36; i++) {
       let indexStr = nf(i, 2); // formats number as two digits
       splatImages.push(loadImage("images/splat/splat" + indexStr + ".png"));
     }
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
       this.x = width/2-width/(6*2);
       this.y = height/2 - 100;
       this.width = width/6;
       this.height = height/2;
       this.cornerRadius = 25;
       this.expression = "(^ _ ^)/"; // Default expression
     }
   
     updateExpression() {
       if (gameWon) {
         this.expression = "(｡♥‿♥｡)";
       } else if (rankLatest == 0) {
         this.expression = "(^ _ ^)/";
       } else {
         if (rankPrevious <= 1) {
           if (rankLatest == 1) this.expression = "(*^▽^*)";
           if (rankLatest == 2) this.expression = "( •᷄ὤ•᷅)";
           if (rankLatest == 3) this.expression = "(・□・; )";
         } else if (rankPrevious == 2) {
           if (rankLatest == 1) this.expression = "(*^▽^*)";
           if (rankLatest == 2) this.expression = "(´д｀; )";
           if (rankLatest == 3) this.expression = "(；¬＿¬)";
         } else {
           if (rankLatest == 1) this.expression = "(*•̀ᴗ•́*)و ";
           if (rankLatest == 2) this.expression = "(´д｀; )";
           if (rankLatest == 3) this.expression = "(!'►,◄) ┌П┐";
         }
       }
     }
   
     draw() {
       fill(color(65, 146, 75));
       rect(this.x, this.y, this.width, this.height, this.cornerRadius);
       fill(0);
       textSize(24);
       textAlign(CENTER);
       text(this.expression, this.x + this.width / 2, this.y + 50);
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
         * @param {number} scale - Scale factor for the splat image.
         * @param {number} borderSize - Offset for the border copies.
         * @param {number} iterations - How many border copies to draw.
         */
        constructor(index, colorValue, scale = 0.35, borderSize = 2, iterations = 5) {
          this.index = index;
          this.colorValue = colorValue;
          
          // Compute a secondary color that's 20% toward black from the main color.
          // You can adjust the 0.2 to be a stronger or weaker difference.
          this.secondaryColor = lerpColor(this.colorValue, color(0, 0, 0), 0.2);
          
          // Set target positions based on the canvas dimensions:
          if (this.index === 0) {
            // First option: left middle side.
            this.targetX = width * 0.25;
            this.targetY = height * 0.5;
          } else if (this.index === 1) {
            // Second option: randomly choose between top middle left or top middle right.
            if (random() < 0.5) {
              this.targetX = width * 0.4;
              this.targetY = height * 0.3;
            } else {
              this.targetX = width * 0.6;
              this.targetY = height * 0.3;
            }
          } else if (this.index === 2) {
            // Third option: right middle side.
            this.targetX = width * 0.75;
            this.targetY = height * 0.5;
          }
          
          this.scale = scale;
          this.borderSize = borderSize;
          this.iterations = iterations;
          this.img = random(splatImages);
          
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
          
          // We'll set these noise offsets once the option arrives:
          this.noiseOffsetX = 0;
          this.noiseOffsetY = 0;
          
          // Create an off-screen graphics buffer for caching the composite splat:
          this.cacheW = this.img.width * this.scale + 10;
          this.cacheH = this.img.height * this.scale + 10;
          this.cache = createGraphics(this.cacheW, this.cacheH);
          this.renderToCache();
        }
        
        renderToCache() {
          this.cache.clear();
          this.cache.push();
          this.cache.imageMode(CENTER);
          // Draw border copies with the secondary color tint.
          this.cache.tint(this.secondaryColor);
          for (let i = 0; i < this.iterations; i++) {
            let angle = (TWO_PI / this.iterations) * i;
            let offsetX = this.borderSize * cos(angle);
            let offsetY = this.borderSize * sin(angle);
            this.cache.image(
              this.img,
              this.cacheW / 2 + offsetX,
              this.cacheH / 2 + offsetY,
              this.img.width * this.scale,
              this.img.height * this.scale
            );
          }
          this.cache.pop();
          
          // Draw the main splat image tinted with the option's main color.
          this.cache.push();
          this.cache.imageMode(CENTER);
          this.cache.tint(this.colorValue);
          this.cache.image(
            this.img,
            this.cacheW / 2,
            this.cacheH / 2,
            this.img.width * this.scale,
            this.img.height * this.scale
          );
          this.cache.pop();
          
          // Draw the option number on top using the secondary color.
          this.cache.push();
          this.cache.textAlign(CENTER, CENTER);
          this.cache.fill(this.secondaryColor);
          this.cache.textSize(24);
          this.cache.text(`${this.index + 1}`, this.cacheW / 2, this.cacheH / 2);
          this.cache.pop();
        }
        
        // Animate the option toward its target; then add a "bubbly" noise-driven motion.
        update() {
          if (!this.arrived) {
            // Move smoothly toward the target.
            this.x = lerp(this.x, this.targetX, 0.1);
            this.y = lerp(this.y, this.targetY, 0.1);
            if (dist(this.x, this.y, this.targetX, this.targetY) < 1) {
              this.arrived = true;
              // Once arrived, set random noise offsets.
              this.noiseOffsetX = random(1000);
              this.noiseOffsetY = random(1000);
            }
          } else {
            // Use Perlin noise for a smooth, bubbly oscillation.
            let t = millis() * 0.001; // time in seconds
            let amplitude = 25; // Adjust for desired movement amplitude
            this.x = this.targetX + map(noise(this.noiseOffsetX + t), 0, 1, -amplitude, amplitude);
            this.y = this.targetY + map(noise(this.noiseOffsetY + t), 0, 1, -amplitude, amplitude);
          }
        }
        
        // Check if a coordinate is within this splat's clickable area.
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
   }
   
   function generateColorOptions() {
     colorEntries = [];
     colorOptions = [];
     let distanceToTarget = euclideanDistance(
       [red(currentColor), green(currentColor), blue(currentColor)],
       [red(targetColor), green(targetColor), blue(targetColor)]
     );
     let rubberBand = map(log(distanceToTarget + 1), log(1), log(441.67 + 1), 3, 40);
     
     for (let i = 0; i < 3; i++) {
       addColorEntry(rubberBand);
       // Create a SplatOption for each color entry:
       colorOptions.push(new SplatOption(i, color(colorEntries[i].r, colorEntries[i].g, colorEntries[i].b)));
     }
     rankColorEntries();
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
   
   function draw() {
     background(220);
   
     goblin.updateExpression();
     goblin.draw();
   
     currentColorBox.draw();
     targetColorBox.draw();
   
     // Draw each color option (now rendered as splats that drift slightly)
     for (let i = 0; i < colorOptions.length; i++) {
       colorOptions[i].draw();
     }
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
           break; // Only process one splat click per mouse press.
         }
       }
     }
   }
   
   // You can still use keys if desired.
   function keyPressed() {
     if (key === 's') {
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
   