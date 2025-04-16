
let fireworks = [];
let gravity;
let started = false;
let explosionSound;
let loveTrack;
let surpriseTriggered = false;

function preload() {
  soundFormats('mp3');
  explosionSound = loadSound('firework-explosion.mp3', () => {}, () => {});
  loveTrack = loadSound('careless-whisper.mp3', () => {}, () => {});
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  colorMode(HSB);
  gravity = createVector(0, 0.13);
  background(0);
}

function draw() {
  if (!started) return;

  colorMode(RGB);
  background(0, 0, 0, 30);

  if (random(1) < 0.025) {
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
  textSize(32);
  textAlign(CENTER);
  text('Hi Sarah, I like you 💖', width / 2, height - 50);
}

function touchStarted() {
  started = true;
  userStartAudio();

  // Start 20 second timer for the button reveal
  setTimeout(() => {
    const btn = document.getElementById('surpriseBtn');
    if (btn) btn.style.display = 'block';
  }, 20000);

  return false;
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}

document.addEventListener("DOMContentLoaded", () => {
  const btn = document.getElementById('surpriseBtn');
  if (btn) {
    btn.addEventListener('click', () => {
      surpriseTriggered = true;
      document.getElementById('message').classList.add('show');
      if (loveTrack && loveTrack.isLoaded()) {
        loveTrack.play();
      }
      setTimeout(() => {
        for (let i = 0; i < 5; i++) {
          fireworks.push(new Firework(true));
        }
      }, 1000);
    });
  }
});

class Firework {
  constructor() {
    this.hu = random(360);
    this.firework = new Particle(random(width * 0.2, width * 0.8), height, this.hu, true);
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
      if (this.firework.vel.y >= random(-2, 0)) {
        this.exploded = true;
        this.explode();
        if (explosionSound && explosionSound.isLoaded()) {
          explosionSound.play();
        }
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
    let num = int(random(70, 130));
    for (let i = 0; i < num; i++) {
      const angle = map(i, 0, num, 0, TWO_PI);
      const mag = random(3, 7);
      const vel = p5.Vector.fromAngle(angle).mult(mag);
      const hueShift = surpriseTriggered ? 300 : 0;
      const p = new Particle(this.firework.pos.x, this.firework.pos.y, (this.hu + hueShift) % 360, false, vel);
      this.particles.push(p);
    }
  }

  show() {
    if (!this.exploded) this.firework.show();
    for (let p of this.particles) p.show();
  }
}

class Particle {
  constructor(x, y, hu, firework, vel = null) {
    this.pos = createVector(x, y);
    this.prevPos = this.pos.copy();
    this.hu = hu;
    this.firework = firework;
    this.lifespan = 255;
    this.acc = createVector(0, 0);

    if (firework) {
      this.vel = createVector(0, random(-13, -10));
    } else {
      this.vel = vel || p5.Vector.random2D().mult(random(2, 6));
      this.drag = random(0.91, 0.95);
    }
  }

  applyForce(force) {
    this.acc.add(force);
  }

  update() {
    this.prevPos = this.pos.copy();
    if (!this.firework) {
      this.vel.mult(this.drag);
      this.lifespan -= map(this.vel.mag(), 0, 5, 0.5, 1.5);
    }
    this.vel.add(this.acc);
    this.pos.add(this.vel);
    this.acc.mult(0);
  }

  done() {
    return this.lifespan < 10;
  }

  show() {
    colorMode(HSB);
    strokeWeight(this.firework ? 2 : 1);
    stroke(this.hu, 100, 255, this.lifespan);
    line(this.prevPos.x, this.prevPos.y, this.pos.x, this.pos.y);

    if (!this.firework) {
      noStroke();
      fill(this.hu, 100, 255, this.lifespan / 5);
      ellipse(this.pos.x, this.pos.y, 4);
    }
  }
}
