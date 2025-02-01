let originColor, targetColor, currentColor;
let colorEntries = [];
let gameActive = false;
let gameWon = false;
let latestRank = 0;

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

function startGame() {
    originColor = color(floor(random(256)), floor(random(256)), floor(random(256)));
    targetColor = color(floor(random(256)), floor(random(256)), floor(random(256)));
    currentColor = originColor;
    colorEntries = [];
    latestRank = 0;
    gameActive = true;
    gameWon = false;
    generateColorOptions();
}

function winGame() {
    gameActive = false;
    gameWon = true;
}

function generateColorOptions() {
    colorEntries = [];
    let distanceToTarget = euclideanDistance(
        [red(currentColor), green(currentColor), blue(currentColor)],
        [red(targetColor), green(targetColor), blue(targetColor)]
    );
    let rubberBand = map(log(distanceToTarget + 1), log(1), log(441.67 + 1), 3, 40);
    
    for (let i = 0; i < 3; i++) {
        addColorEntry(rubberBand);
    }
    rankColorEntries();
}

function addColorEntry(rubberBand) {
    let id = colorEntries.length + 1;
    
    let innerBand=rubberBand*2*id;
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

function mapColorToLocation(p5Color) {
    return { 
        x: red(p5Color), 
        y: green(p5Color), 
        z: blue(p5Color) 
    };
}

const euclideanDistance = (a, b) =>
    Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]);

function setup() {
    createCanvas(550, 400);
    startGame();
}

function draw() {
    background(220);
    //fill(color(10,10,10));
    for(let i=0;(i<800)&&false;i+=50)
    {
        line(0, i, 800, i);
        line(i, 0, i, 800);
    }

    ///// GOBLIN CODE
    fill(color(65, 146, 75));
    rect(50, 200, 100, 150, 25);
    fill(0);
    textSize(24);
    textAlign(CENTER);
    if(latestRank==0)text("(^ _ ^)/", 100, 250);
    if(latestRank==1)text("(*^▽^*)", 100, 250); //1 is happy
    if(latestRank==2)text("(´д｀; )", 100, 250); //2 is confused
    if(latestRank==3)text("(；¬＿¬)", 100, 250); //3 is angry!!!!
    ///// GOBLIN CODE
    textSize(12);
    textAlign(LEFT);
    //fill(originColor);
    //rect(450, 50, 50, 50);
    fill(currentColor);
    rect(200, 300, 300, 50);

    textSize(12);
    textAlign(LEFT);
    fill(targetColor);
    rect(50, 50, 450, 100);

    if(gameActive)
    {
        for (let i = 0; i < colorEntries.length; i++) {
            let entry = colorEntries[i];
            fill(entry.r, entry.g, entry.b);
            rect(212 + (i * 100), 195, 75, 65, 3);
            fill(0);
            textSize(24);
            textAlign(CENTER);
            text(`${i+1}`, (250 + (i*100)), 235)
            textSize(12);
            textAlign(LEFT);
            fill(0);
            text(`(${i + 1}) ID: ${entry.id}, Rank: ${entry.rank}, Distance: ${floor(entry.distance)}`, 660, i * 50 + 35);
            text(`Distance from currentColor: ${floor(entry.distanceFromCurrentLocation)}`, 660, i * 50 + 50);
            text(`r: ${entry.r} g: ${entry.g} b: ${entry.b}`, 660, i * 50 + 65);
        }
    }

    textSize(12);
    textAlign(LEFT);
    fill(0);
    text(`currentColor; r: ${String(red(currentColor))} g: ${String(green(currentColor))} b: ${String(blue(currentColor))}`, 600, 180);
    text(`targetColor; r: ${String(red(targetColor))} g: ${String(green(targetColor))} b: ${String(blue(targetColor))}`, 600, 200);

    textSize(18);
    textAlign(CENTER);
    if(gameActive){
        text("Press 1-3 to select an option", 350, 330);
    } 
    if(gameWon){
        fill(color(255,0,0));
        text("You win!!!!! Waow!!!!", 350, 330);
    }
    textSize(12);
    textAlign(LEFT);
}

function keyPressed() {
    if (gameActive && (key === 's')) {
        startGame();
    }
    if (gameActive && (key >= '1' && key <= '3')) {
        let index = int(key) - 1;
        if (colorEntries[index]) {
            currentColor = color(colorEntries[index].r, colorEntries[index].g, colorEntries[index].b);
            latestRank = colorEntries[index].rank;
            let winDistance = euclideanDistance(
                [red(currentColor), green(currentColor), blue(currentColor)],
                [red(targetColor), green(targetColor), blue(targetColor)]
            );
            if(winDistance<=45) 
            {
                currentColor = targetColor;
                winGame();
            }
            else generateColorOptions();
        }
    }
}
