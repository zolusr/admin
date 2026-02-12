<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Ragdoll Cloth Benchmark</title>
<style>
  body {
    margin: 0;
    background: #111;
    overflow: hidden;
  }
  canvas {
    display: block;
  }
  #info {
    position: fixed;
    top: 10px;
    left: 10px;
    color: white;
    font-family: monospace;
  }
</style>
</head>
<body>
<canvas id="canvas"></canvas>
<div id="info">Clicks: 0 | Constraints: 0</div>

<script>
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
const info = document.getElementById("info");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const gravity = 0.5;
const friction = 0.999;
const bounce = 0.9;

let points = [];
let constraints = [];
let clicks = 0;

class Point {
  constructor(x, y, pinned = false) {
    this.x = x;
    this.y = y;
    this.oldx = x;
    this.oldy = y;
    this.pinned = pinned;
  }

  update() {
    if (this.pinned) return;

    let vx = (this.x - this.oldx) * friction;
    let vy = (this.y - this.oldy) * friction;

    this.oldx = this.x;
    this.oldy = this.y;

    this.x += vx;
    this.y += vy + gravity;

    if (this.y > canvas.height) {
      this.y = canvas.height;
      this.oldy = this.y + vy * bounce;
    }
  }
}

class Constraint {
  constructor(p1, p2) {
    this.p1 = p1;
    this.p2 = p2;
    this.length = Math.hypot(p1.x - p2.x, p1.y - p2.y);
  }

  update() {
    let dx = this.p2.x - this.p1.x;
    let dy = this.p2.y - this.p1.y;
    let dist = Math.hypot(dx, dy);
    let diff = (this.length - dist) / dist / 2;

    let offsetX = dx * diff;
    let offsetY = dy * diff;

    if (!this.p1.pinned) {
      this.p1.x -= offsetX;
      this.p1.y -= offsetY;
    }
    if (!this.p2.pinned) {
      this.p2.x += offsetX;
      this.p2.y += offsetY;
    }
  }

  draw() {
    ctx.beginPath();
    ctx.moveTo(this.p1.x, this.p1.y);
    ctx.lineTo(this.p2.x, this.p2.y);
    ctx.stroke();
  }
}

function createCloth(cols, rows, spacing) {
  points = [];
  constraints = [];

  const startX = canvas.width / 2 - (cols * spacing) / 2;
  const startY = 50;

  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      let pinned = y === 0;
      points.push(new Point(startX + x * spacing, startY + y * spacing, pinned));
    }
  }

  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      let i = x + y * cols;
      if (x < cols - 1)
        constraints.push(new Constraint(points[i], points[i + 1]));
      if (y < rows - 1)
        constraints.push(new Constraint(points[i], points[i + cols]));
    }
  }
}

createCloth(25, 18, 15);

canvas.addEventListener("click", (e) => {
  clicks++;
  const radius = 40;

  constraints = constraints.filter(c => {
    const mx = (c.p1.x + c.p2.x) / 2;
    const my = (c.p1.y + c.p2.y) / 2;
    const dist = Math.hypot(mx - e.clientX, my - e.clientY);
    return dist > radius;
  });
});

function update() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  for (let p of points) p.update();

  for (let i = 0; i < 5; i++)
    for (let c of constraints) c.update();

  ctx.strokeStyle = "white";
  for (let c of constraints) c.draw();

  info.textContent = `Clicks: ${clicks} | Constraints: ${constraints.length}`;

  requestAnimationFrame(update);
}

update();

window.addEventListener("resize", () => {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  createCloth(25, 18, 15);
});
</script>
</body>
</html>
