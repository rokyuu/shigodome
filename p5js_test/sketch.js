let originColor, targetColor, currentColor;
let colorEntries = [];


class ColorEntry {
    constructor(id, r, g, b, distance, rank) {
        this.id = id;
        this.r = r;
        this.g = g;
        this.b = b;
        this.distance = distance;
        this.rank = rank;
    }
}

function addColorEntry() {
    let id = colorEntries.length + 1;
    let r = floor(random(256));
    let g = floor(random(256));
    let b = floor(random(256));
    let distance = random(100);
    let rank = random(10);

    let newEntry = new ColorEntry(id, r, g, b, distance, rank);
    colorEntries.push(newEntry);
}

function clearColorEntries() {
    colorEntries = [];
}

const euclideanDistance = (a, b) =>
    Math.hypot(...Object.keys(a).map(k => b[k] - a[k]));

function setup() {
    createCanvas(400, 400);
    originColor = color(random(255), random(255), random(255));
    targetColor = color(random(255), random(255), random(255));
    currentColor=originColor;
}

function draw() {
    background(220);
    fill(originColor);
    rect(50, 150, 100, 100);
    fill(targetColor);
    rect(250, 150, 100, 100);
    fill(currentColor);
    rect(25, 25, 25, 25);

    for (let i = 0; i < colorEntries.length; i++) {
        let entry = colorEntries[i];
        fill(entry.r, entry.g, entry.b);
        rect(50, i * 50 + 10, 100, 40);
        fill(0);
        text(`ID: ${entry.id} Rank: ${entry.rank}`, 160, i * 50 + 35);
    }
}

function keyPressed() {
    if (key === 'a') {
        addColorEntry();
    }
    if (key === 'c') {
        clearColorEntries();
    }
}
