
let fireworks = [];
let gravity;
let fireworkSound;
let fft;
let started = false;

function preload() {
  soundFormats('mp3');
  fireworkSound = loadSound('fiery-whistle-firework-missile-explodes-in-the-night-sky-258872.mp3');
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  colorMode(HSB);
  gravity = createVector(0, 0.2);
  textFont('Courier New');
  textSize(36);
  textAlign(CENTER, CENTER);
  fft = new p5.FFT();
  background(0);
}

function draw() {
  if (!started) {
    background(0);
    fill(255);
    text('Tap anywhere to start the show 🎇', width / 2, height / 2);
    return;
  }

  background(0, 0, 0, 25);

  if (random(1) < 0.02) {
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
    userStartAudio();
    started = true;
    fireworkSound.loop();
  }
}

class Firework {
  constructor() {
    this.hu = random(255);
    this.firework = new Particle(random(width), height, this.hu, true);
    this.exploded = false;
    this.particles = [];
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
    let spectrum = fft.analyze();
    let energy = fft.getEnergy("bass");
    let count = map(energy, 0, 255, 30, 120);

    for (let i = 0; i < count; i++) {
      const p = new Particle(this.firework.pos.x, this.firework.pos.y, this.hu, false);
      this.particles.push(p);
    }
  }

  show() {
    if (!this.exploded) {
      this.firework.show();
    }

    for (let p of this.particles) {
      p.show();
    }
  }
}

class Particle {
  constructor(x, y, hu, firework) {
    this.pos = createVector(x, y);
    this.prevPos = this.pos.copy();
    this.firework = firework;
    this.lifespan = 255;
    this.hu = hu;
    this.acc = createVector(0, 0);

    if (this.firework) {
      this.vel = createVector(0, random(-6, -3)); // slower ascent
    } else {
      this.vel = p5.Vector.random2D();
      this.vel.mult(random(2, 10));
    }
  }

  applyForce(force) {
    this.acc.add(force);
  }

  update() {
    this.prevPos = this.pos.copy();

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
    strokeWeight(2);
    let glow = color(this.hu, 255, 255, this.lifespan);
    stroke(glow);
    line(this.prevPos.x, this.prevPos.y, this.pos.x, this.pos.y);

    // Soft bloom glow
    noStroke();
    fill(this.hu, 255, 255, this.lifespan / 4);
    ellipse(this.pos.x, this.pos.y, 12);
  }
}
