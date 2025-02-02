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
     goblin = new Goblin();
     currentColorBox = new ColorBox(200, 300, 300, 50, currentColor);
     targetColorBox = new ColorBox(50, 50, 450, 100, targetColor);
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
   