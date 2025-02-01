let originColor, targetColor, currentColor;
let colorEntries = [];
let gameActive = false;
let gameWon = false;

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
    createCanvas(800, 800);
    startGame();
}

function draw() {
    background(220);
    fill(originColor);
    rect(450, 50, 50, 50);
    fill(currentColor);
    rect(525, 50, 50, 50);
    fill(targetColor);
    rect(600, 50, 50, 50);

    if(gameActive)
    {
        for (let i = 0; i < colorEntries.length; i++) {
            let entry = colorEntries[i];
            fill(entry.r, entry.g, entry.b);
            rect(50, i * 50 + 10, 100, 40);
            fill(0);
            text(`(${i + 1}) ID: ${entry.id}, Rank: ${entry.rank}, Distance: ${floor(entry.distance)}`, 160, i * 50 + 35);
            text(`Distance from currentColor: ${floor(entry.distanceFromCurrentLocation)}`, 160, i * 50 + 50);
            text(`r: ${entry.r} g: ${entry.g} b: ${entry.b}`, 160, i * 50 + 65);
        }
    }

    fill(0);
    text(`currentColor; r: ${String(red(currentColor))} g: ${String(green(currentColor))} b: ${String(blue(currentColor))}`, 400, 180);
    text(`targetColor; r: ${String(red(targetColor))} g: ${String(green(targetColor))} b: ${String(blue(targetColor))}`, 400, 200);
    if(gameActive) text("Press 1-3 to select an option", 400, 220);
    if(gameWon){
        fill(color(255,0,0));
        text("You win!!!!! Waow!!!!", 400, 260);
    }
}

function keyPressed() {
    if (key === 's') {
        startGame();
    }
    if (key >= '1' && key <= '3') {
        let index = int(key) - 1;
        if (colorEntries[index]) {
            currentColor = color(colorEntries[index].r, colorEntries[index].g, colorEntries[index].b);
            let winDistance = euclideanDistance(
                [red(currentColor), green(currentColor), blue(currentColor)],
                [red(targetColor), green(targetColor), blue(targetColor)]
            );
            console.warn("winDistance: "+winDistance);
            if(winDistance<=45) winGame();
            else generateColorOptions();
        }
    }
}
