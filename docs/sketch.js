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
       this.x = 50;
       this.y = 200;
       this.width = 100;
       this.height = 150;
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
        constructor(index, colorValue, scale = 0.2, borderSize = 1, iterations = 5) {
          this.index = index;
          this.colorValue = colorValue;
          // Final target position for this option:
          this.targetX = 212 + (index * 100);
          this.targetY = 195;
          this.scale = scale;
          this.borderSize = borderSize;
          this.iterations = iterations;
          // Pick a random splat image:
          this.img = random(splatImages);
          
          // Choose an initial position off-screen (for the "shoot into place" effect):
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
          
          this.arrived = false; // Whether it reached its target
          
          // Create an off-screen graphics buffer for caching the composite splat
          // Here, we assume the splat's final width and height (with some extra margin)
          this.cacheW = this.img.width * this.scale + 10;
          this.cacheH = this.img.height * this.scale + 10;
          this.cache = createGraphics(this.cacheW, this.cacheH);
          this.renderToCache();
        }
        
        // Render the composite splat (borders and tinted main image) to the off-screen cache.
        renderToCache() {
          this.cache.clear();
          this.cache.push();
          this.cache.imageMode(CENTER);
          // Draw border copies with a black tint.
          this.cache.tint(0);
          for (let i = 0; i < this.iterations; i++) {
            let angle = (TWO_PI / this.iterations) * i;
            let offsetX = this.borderSize * cos(angle);
            let offsetY = this.borderSize * sin(angle);
            this.cache.image(
              this.img,
              this.cacheW/2 + offsetX,
              this.cacheH/2 + offsetY,
              this.img.width * this.scale,
              this.img.height * this.scale
            );
          }
          this.cache.pop();
          
          // Draw the main splat image tinted with the option's color.
          this.cache.push();
          this.cache.imageMode(CENTER);
          this.cache.tint(this.colorValue);
          this.cache.image(
            this.img,
            this.cacheW/2,
            this.cacheH/2,
            this.img.width * this.scale,
            this.img.height * this.scale
          );
          this.cache.pop();
          
          // Draw the option number on top.
          this.cache.push();
          this.cache.textAlign(CENTER, CENTER);
          this.cache.fill(0);
          this.cache.textSize(24);
          this.cache.text(`${this.index + 1}`, this.cacheW/2, this.cacheH/2);
          this.cache.pop();
        }
        
        // Animate the option toward its target; then add slight drifting.
        update() {
          if (!this.arrived) {
            this.x = lerp(this.x, this.targetX, 0.1);
            this.y = lerp(this.y, this.targetY, 0.1);
            if (dist(this.x, this.y, this.targetX, this.targetY) < 1) {
              this.arrived = true;
            }
          } else {
            this.x += random(-0.5, 0.5);
            this.y += random(-0.5, 0.5);
          }
        }
        
        // Check if a given coordinate is within this splat's clickable area.
        contains(mx, my) {
          let d = dist(mx, my, this.x, this.y);
          return d < (this.img.width * this.scale) / 2;
        }
        
        draw() {
          this.update();
          // Instead of redrawing all the border copies and tinted image,
          // we just draw the cached composite image.
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
     currentColorBox = new ColorBox(200, 300, 300, 50, currentColor);
     targetColorBox = new ColorBox(50, 50, 450, 100, targetColor);
   
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
   
     textSize(18);
     textAlign(CENTER);
     fill(0);
     if (gameActive) {
       text("Press 1-3 to select an option", 350, 330);
     } 
     if (gameWon) {
       fill(color(0, 0, 0));
       text("You win!!!!! Waow!!!!", 350, 330);
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
   