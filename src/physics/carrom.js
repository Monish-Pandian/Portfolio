import Matter from 'matter-js';

const { Engine, Bodies, Body, Composite, Events } = Matter;

// All physics runs in a flat 2D space measured in "px". The 3D scene only renders it.
export const HALF = 380; // board half-size
export const COIN_R = 22;
export const STRIKER_R = 30;
export const POCKET_R = 46;
export const REST_DIST = 285; // striker rest distance from centre, on the player's side

export const POCKETS = [
  { x: -HALF, y: -HALF },
  { x: HALF, y: -HALF },
  { x: -HALF, y: HALF },
  { x: HALF, y: HALF },
];

// Unit vector (physics x, y) pointing from board centre to the player seated at each side.
export const SIDES = [
  { x: 0, y: 1 },
  { x: 1, y: 0 },
  { x: 0, y: -1 },
  { x: -1, y: 0 },
];

const WALL = 0x1;
const COIN = 0x2;
const STRIKER = 0x4;
const STEP = 1000 / 60;
const AIR = 0.022;

const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const lerp = (a, b, t) => a + (b - a) * t;
const speed = (b) => Math.hypot(b.velocity.x, b.velocity.y);

export function layoutFor(n) {
  if (n <= 0) return [];
  if (n === 1) return [{ x: 0, y: 0 }];
  const out = [];
  const ring = (count, r, offset) => {
    for (let i = 0; i < count; i++) {
      const a = offset + (i / count) * Math.PI * 2;
      out.push({ x: Math.cos(a) * r, y: Math.sin(a) * r });
    }
  };
  if (n <= 7) ring(n, 120, Math.PI / 6);
  else {
    ring(6, 105, Math.PI / 6);
    ring(n - 6, 205, 0.2);
  }
  return out;
}

export class CarromWorld {
  constructor() {
    this.engine = Engine.create({ gravity: { x: 0, y: 0, scale: 0 } });
    this.engine.positionIterations = 8;
    this.engine.velocityIterations = 6;
    this.coins = new Map(); // id -> body (on the board)
    this.layout = new Map(); // id -> home position
    this.pocketed = new Set();
    this.shot = null; // scripted shot state machine
    this.freeShot = false; // player-flicked shot in flight
    this.freeFrames = 0;
    this.settle = 0;
    this.acc = 0;
    this.resetTimer = 0;
    this.side = SIDES[0];
    this.onPocket = () => {};

    const t = 400;
    const len = HALF * 2 + t * 2;
    const wall = (x, y, w, h) =>
      Bodies.rectangle(x, y, w, h, {
        isStatic: true,
        restitution: 0.75,
        friction: 0,
        label: 'wall',
        collisionFilter: { category: WALL, mask: COIN | STRIKER },
      });
    Composite.add(this.engine.world, [
      wall(0, -HALF - t / 2, len, t),
      wall(0, HALF + t / 2, len, t),
      wall(-HALF - t / 2, 0, t, len),
      wall(HALF + t / 2, 0, t, len),
    ]);

    this.striker = Bodies.circle(0, REST_DIST, STRIKER_R, {
      label: 'striker',
      restitution: 0.8,
      friction: 0,
      frictionAir: AIR,
      density: 0.006,
      collisionFilter: { category: STRIKER, mask: WALL | COIN },
    });
    Composite.add(this.engine.world, this.striker);

    Events.on(this.engine, 'collisionStart', (e) => this.onCollide(e));
    this.resetStriker();
  }

  get restPos() {
    return { x: this.side.x * REST_DIST, y: this.side.y * REST_DIST };
  }

  canAim() {
    return !this.shot && !this.freeShot;
  }

  setSide(i) {
    this.side = SIDES[i];
    this.shot = null;
    this.freeShot = false;
    this.resetStriker();
  }

  setCoins(ids) {
    for (const b of this.coins.values()) Composite.remove(this.engine.world, b);
    this.coins.clear();
    this.layout.clear();
    this.pocketed.clear();
    const pts = layoutFor(ids.length);
    ids.forEach((id, i) => {
      this.layout.set(id, pts[i]);
      this.addCoin(id, pts[i]);
    });
    this.shot = null;
    this.freeShot = false;
  }

  addCoin(id, pos) {
    const b = Bodies.circle(pos.x, pos.y, COIN_R, {
      label: id,
      restitution: 0.75,
      friction: 0,
      frictionAir: AIR * 1.1,
      density: 0.003,
      collisionFilter: { category: COIN, mask: WALL | COIN | STRIKER },
    });
    this.coins.set(id, b);
    Composite.add(this.engine.world, b);
  }

  // Remove a coin without a shot (used when the overlay switches to another item).
  drop(id) {
    const b = this.coins.get(id);
    if (!b) return;
    Composite.remove(this.engine.world, b);
    this.coins.delete(id);
    this.pocketed.add(id);
  }

  // Put pocketed coins back on the board at (or near) their home spots.
  respawn() {
    for (const id of [...this.pocketed]) {
      const home = this.layout.get(id) || { x: 0, y: 0 };
      this.addCoin(id, this.freeSpot(home));
    }
    this.pocketed.clear();
  }

  freeSpot(home) {
    const bodies = [...this.coins.values(), this.striker];
    const free = (p) => bodies.every((b) => Math.hypot(b.position.x - p.x, b.position.y - p.y) > COIN_R * 2 + 6);
    if (free(home)) return home;
    for (let r = 40; r < 330; r += 40) {
      for (let a = 0; a < Math.PI * 2; a += Math.PI / 8) {
        const p = { x: home.x + Math.cos(a) * r, y: home.y + Math.sin(a) * r };
        if (Math.abs(p.x) < HALF - 60 && Math.abs(p.y) < HALF - 60 && free(p)) return p;
      }
    }
    return home;
  }

  resetStriker() {
    const p = this.restPos;
    Body.setPosition(this.striker, p);
    Body.setVelocity(this.striker, { x: 0, y: 0 });
    Body.setAngularVelocity(this.striker, 0);
    this.striker.collisionFilter.mask = WALL | COIN;
  }

  // Scripted, guaranteed shot: the striker glides behind the coin, strikes it, and the
  // coin's launch velocity is then set so it always reaches the chosen far-side pocket.
  shoot(id) {
    if (this.shot || this.freeShot) return false;
    const coin = this.coins.get(id);
    if (!coin) return false;
    const u = this.side;
    let pocket = null;
    let best = Infinity;
    for (const p of POCKETS) {
      if (p.x * u.x + p.y * u.y >= 0) continue; // only the two far-side pockets
      const d = Math.hypot(p.x - coin.position.x, p.y - coin.position.y);
      if (d < best) {
        best = d;
        pocket = p;
      }
    }
    const dx = pocket.x - coin.position.x;
    const dy = pocket.y - coin.position.y;
    const len = Math.hypot(dx, dy) || 1;
    const dir = { x: dx / len, y: dy / len };
    const gap = STRIKER_R + COIN_R + 20;
    const lim = HALF - STRIKER_R - 6;
    const to = {
      x: clamp(coin.position.x - dir.x * gap, -lim, lim),
      y: clamp(coin.position.y - dir.y * gap, -lim, lim),
    };
    for (const [cid, b] of this.coins) {
      b.collisionFilter.mask = cid === id ? WALL : WALL | COIN;
    }
    Body.setVelocity(coin, { x: 0, y: 0 });
    this.shot = {
      id,
      pocket,
      dir,
      from: { x: this.striker.position.x, y: this.striker.position.y },
      to,
      phase: 'approach',
      t: 0,
      hit: false,
      launch: false,
    };
    return true;
  }

  // Player-flicked shot (drag to aim, release to shoot).
  shootFree(vx, vy) {
    if (!this.canAim()) return false;
    Body.setVelocity(this.striker, { x: vx, y: vy });
    this.freeShot = true;
    this.freeFrames = 0;
    this.settle = 0;
    return true;
  }

  step(dtSec) {
    this.acc += Math.min(dtSec, 0.1) * 1000;
    let n = 0;
    while (this.acc >= STEP && n < 6) {
      this.tick();
      this.acc -= STEP;
      n++;
    }
    if (this.acc > STEP) this.acc = 0;
  }

  tick() {
    this.updateShot();
    Engine.update(this.engine, STEP);
    const s = this.shot;
    if (s && s.launch) {
      s.launch = false;
      this.launchCoin();
    }
    this.checkPockets();
    this.updateFreeShot();
    if (this.resetTimer > 0) {
      this.resetTimer -= 1 / 60;
      if (this.resetTimer <= 0) this.resetStriker();
    }
  }

  updateShot() {
    const s = this.shot;
    if (!s) return;
    s.t += 1 / 60;
    const coin = this.coins.get(s.id);
    if (!coin) {
      this.endShot();
      return;
    }
    const st = this.striker;
    if (s.phase === 'approach') {
      const k = Math.min(1, s.t / 1.0);
      const e = k * k * (3 - 2 * k);
      Body.setPosition(st, { x: lerp(s.from.x, s.to.x, e), y: lerp(s.from.y, s.to.y, e) });
      Body.setVelocity(st, { x: 0, y: 0 });
      if (k >= 1) {
        s.phase = 'hold';
        s.t = 0;
      }
    } else if (s.phase === 'hold') {
      Body.setVelocity(st, { x: 0, y: 0 });
      if (s.t > 0.45) {
        s.phase = 'strike';
        s.t = 0;
        coin.collisionFilter.mask = WALL | STRIKER;
        Body.setVelocity(st, { x: s.dir.x * 18, y: s.dir.y * 18 });
      }
    } else if (s.phase === 'strike') {
      if (!s.hit && s.t > 0.6) {
        // Fallback if the striker never touched the coin (e.g. clamped near a wall).
        s.hit = true;
        s.phase = 'travel';
        s.t = 0;
        s.launch = true;
      }
    } else if (s.phase === 'travel') {
      if (s.t > 7) this.pocket(s.id); // safety net: never leave the visitor waiting
    }
  }

  onCollide(e) {
    const s = this.shot;
    if (!s || s.phase !== 'strike' || s.hit) return;
    for (const p of e.pairs) {
      const a = p.bodyA.label;
      const b = p.bodyB.label;
      if ((a === 'striker' && b === s.id) || (b === 'striker' && a === s.id)) {
        s.hit = true;
        s.phase = 'travel';
        s.t = 0;
        s.launch = true; // applied after the solver has run
        break;
      }
    }
  }

  launchCoin() {
    const s = this.shot;
    const coin = s && this.coins.get(s.id);
    if (!coin) return;
    const dx = s.pocket.x - coin.position.x;
    const dy = s.pocket.y - coin.position.y;
    const dist = Math.hypot(dx, dy) || 1;
    const v = Math.max(7, dist * AIR * 1.9); // enough to coast to the pocket despite air drag
    Body.setVelocity(coin, { x: (dx / dist) * v, y: (dy / dist) * v });
    Body.setVelocity(this.striker, { x: s.dir.x * 3, y: s.dir.y * 3 });
  }

  checkPockets() {
    for (const [id, b] of [...this.coins]) {
      for (const p of POCKETS) {
        if (Math.hypot(b.position.x - p.x, b.position.y - p.y) < POCKET_R) {
          this.pocket(id);
          break;
        }
      }
    }
    if (this.freeShot) {
      const b = this.striker;
      for (const p of POCKETS) {
        if (Math.hypot(b.position.x - p.x, b.position.y - p.y) < POCKET_R) {
          this.freeShot = false;
          this.resetStriker();
          break;
        }
      }
    }
  }

  pocket(id) {
    const b = this.coins.get(id);
    if (!b) return;
    Composite.remove(this.engine.world, b);
    this.coins.delete(id);
    this.pocketed.add(id);
    const scripted = !!this.shot && this.shot.id === id;
    if (scripted) this.endShot();
    this.onPocket(id, scripted);
  }

  endShot() {
    for (const b of this.coins.values()) b.collisionFilter.mask = WALL | COIN | STRIKER;
    this.shot = null;
    Body.setVelocity(this.striker, {
      x: this.striker.velocity.x * 0.3,
      y: this.striker.velocity.y * 0.3,
    });
    this.resetTimer = 0.5;
  }

  updateFreeShot() {
    if (!this.freeShot) return;
    this.freeFrames++;
    const moving = speed(this.striker) > 0.25 || [...this.coins.values()].some((b) => speed(b) > 0.25);
    this.settle = moving ? 0 : this.settle + 1;
    if (this.settle > 40 || this.freeFrames > 1500) {
      this.freeShot = false;
      this.resetStriker();
    }
  }
}
