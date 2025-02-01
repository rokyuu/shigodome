let startColor, goalColor;


function setup() {
    createCanvas(400, 400);
    startColor = color(random(255), random(255), random(255));
    goalColor = color(random(255), random(255), random(255));
}

function draw() {
    background(220);
    fill(startColor);
    rect(50, 150, 100, 100);
    fill(goalColor);
    rect(250, 150, 100, 100);
}
