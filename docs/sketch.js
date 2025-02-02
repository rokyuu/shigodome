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
   let splat; // our new Splat object
   
   let splatImage; // global variable for the splat image
   
   /* ============================================
      p5.js Preload Function
      ============================================ */
   function preload() {
     // Load your splat image (ensure the path is correct)
     splatImage = loadImage("images/splat/splat00.png");
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
   
   class ColorOption {
     constructor(index, colorValue) {
       this.index = index;
       this.colorValue = colorValue;
       this.x = 212 + (index * 100);
       this.y = 195;
       this.width = 75;
       this.height = 65;
     }
   
     draw() {
       fill(this.colorValue);
       rect(this.x, this.y, this.width, this.height, 3);
       fill(0);
       textSize(24);
       textAlign(CENTER);
       text(`${this.index + 1}`, this.x + this.width / 2, this.y + 40);
     }
   }
   
   /* ============================================
      Splat Class
      ============================================ */
   /*
     The Splat class renders your transparent PNG with a border effect.
     It first draws a slightly larger, black-tinted version of the image as the border,
     and then draws the original image on top.
   */
     class Splat {
        /**
         * @param {number} x - The x-coordinate for the center of the image.
         * @param {number} y - The y-coordinate for the center of the image.
         * @param {number} scale - Scale factor for the image size.
         * @param {number} borderSize - How far from the center each border copy is drawn.
         * @param {number} iterations - How many border copies to draw around the center.
         */
        constructor(x, y, scale = 1, borderSize = 10, iterations = 12) {
          this.x = x;
          this.y = y;
          this.scale = scale;
          this.borderSize = borderSize;
          this.iterations = iterations;
          this.img = splatImage; // splatImage should be loaded in preload()
        }
        
        draw() {
          push();
          imageMode(CENTER);
          tint(0); // Black tint for the border copies
      
          // Draw border copies around a circle
          for (let i = 0; i < this.iterations; i++) {
            let angle = (TWO_PI / this.iterations) * i;
            let offsetX = cos(angle) * this.borderSize;
            let offsetY = sin(angle) * this.borderSize;
            image(
              this.img,
              this.x + offsetX,
              this.y + offsetY,
              this.img.width * this.scale,
              this.img.height * this.scale
            );
          }
          pop();
          
          // Draw the main image on top without tint
          imageMode(CENTER);
          image(
            this.img,
            this.x,
            this.y,
            this.img.width * this.scale,
            this.img.height * this.scale
          );
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
       // Fix: Correct color property reference when creating a ColorOption
       colorOptions.push(new ColorOption(i, color(colorEntries[i].r, colorEntries[i].g, colorEntries[i].b)));
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
     // Create a Splat object at a desired location (e.g., near the right side)
     splat = new Splat(800, 150, 0.5, 5);
     startGame();
   }
   
   function draw() {
     background(220);
   
     goblin.updateExpression();
     goblin.draw();
   
     currentColorBox.draw();
     targetColorBox.draw();
   
     for (let i = 0; i < colorOptions.length; i++) {
       colorOptions[i].draw();
     }
   
     // Draw the splat image with its border effect
     splat.draw();
   
     textSize(18);
     textAlign(CENTER);
     if (gameActive) {
       text("Press 1-3 to select an option", 350, 330);
     } 
     if (gameWon) {
       fill(color(0, 0, 0));
       text("You win!!!!! Waow!!!!", 350, 330);
     }
   }
   
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
   