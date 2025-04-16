
let fireworks = [];
let gravity;
let fireworkSound;
let started = false;

function preload() {
  fireworkSound = loadSound('fiery-whistle-firework-missile-explodes-in-the-night-sky-258872.mp3');
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  colorMode(HSB);
  gravity = createVector(0, 0.2);
  textFont('Courier New');
  textSize(36);
  textAlign(CENTER, CENTER);
}

function draw() {
  if (!started) {
    background(0);
    fill(255);
    text('Tap to Start Fireworks', width / 2, height / 2);
    return;
  }

  background(0, 0, 0, 25);

  if (random(1) < 0.03) {
    fireworks.push(new Firework());
  }

  for (let i = fireworks.length - 1; i >= 0; i--) {
    fireworks[i].update();
    fireworks[i].show();
    if (fireworks[i].done()) {
      fireworks.splice(i, 1);
    }
  }

  fill(255);
  text("Hi Sarah, I like you 💖", width / 2, height - 50);
}

function touchStarted() {
  if (!started) {
    started = true;
    userStartAudio();
  }
}

class Firework {
  constructor() {
    this.hu = random(255);
    this.firework = new Particle(random(width), height, this.hu, true);
    this.exploded = false;
    this.particles = [];
    fireworkSound.play(); // launch sound
  }

  done() {
    return this.exploded && this.particles.length === 0;
  }

  update() {
    if (!this.exploded) {
      this.firework.applyForce(gravity);
      this.firework.update();
      if (this.firework.vel.y >= 0) {
        this.exploded = true;
        this.explode();
      }
    }

    for (let i = this.particles.length - 1; i >= 0; i--) {
      this.particles[i].applyForce(gravity);
      this.particles[i].update();
      if (this.particles[i].done()) {
        this.particles.splice(i, 1);
      }
    }
  }

  explode() {
    for (let i = 0; i < 100; i++) {
      const p = new Particle(this.firework.pos.x, this.firework.pos.y, this.hu, false);
      this.particles.push(p);
    }
    fireworkSound.play(); // explosion sound
  }

  show() {
    if (!this.exploded) {
      this.firework.show();
    }

    for (let i = 0; i < this.particles.length; i++) {
      this.particles[i].show();
    }
  }
}

class Particle {
  constructor(x, y, hu, firework) {
    this.pos = createVector(x, y);
    this.firework = firework;
    this.lifespan = 255;
    this.hu = hu;
    this.acc = createVector(0, 0);

    if (this.firework) {
      this.vel = createVector(0, random(-12, -8));
    } else {
      this.vel = p5.Vector.random2D();
      this.vel.mult(random(2, 10));
    }
  }

  applyForce(force) {
    this.acc.add(force);
  }

  update() {
    if (!this.firework) {
      this.vel.mult(0.9);
      this.lifespan -= 4;
    }

    this.vel.add(this.acc);
    this.pos.add(this.vel);
    this.acc.mult(0);
  }

  done() {
    return this.lifespan < 0;
  }

  show() {
    colorMode(HSB);
    strokeWeight(this.firework ? 4 : 2);
    stroke(this.hu, 255, 255, this.lifespan);
    point(this.pos.x, this.pos.y);
  }
}
