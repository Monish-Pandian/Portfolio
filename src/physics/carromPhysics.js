// 2D carrom physics on Matter.js. No DOM / Three.js here, so it can run headless in tests.
// Units are "board units": the playing area is a square from -half to +half on both axes.
// The 3D scene renders x -> world X and y -> world Z (scaled by 0.01).
import Matter from 'matter-js';

const { Engine, Bodies, Body, Composite } = Matter;

export const BOARD = Object.freeze({
  half: 370,
  coinR: 15,
  strikerR: 20,
  pocketR: 30,
  pocketInset: 345,
  baseline: 270,
  strikerRange: 225,
});

// Unit vector from board centre toward each player side: 0 bottom, 1 right, 2 top, 3 left.
export const SIDE_NORMALS = [
  [0, 1],
  [1, 0],
  [0, -1],
  [-1, 0],
];

export const POCKETS = [
  [-1, -1],
  [1, -1],
  [1, 1],
  [-1, 1],
].map(([sx, sy]) => ({ x: sx * BOARD.pocketInset, y: sy * BOARD.pocketInset }));

const STEP = 1000 / 120; // fixed physics step (ms)
// Matter reports velocity in px per 1/60 s regardless of our 120 Hz step.
const MAX_V = 26; // keeps fast shots from tunnelling (about 13 px per physics step)
const SINK_MS = 450;
const SLIDE_MS = 350;

const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));
const speedOf = (b) => Math.hypot(b.velocity.x, b.velocity.y);

/** Coin formation around the centre: a ring for <=6 coins, then centre + rings. */
export function formation(n) {
  const slots = [];
  if (n <= 6) {
    const r = 38;
    for (let i = 0; i < n; i++) {
      const a = -Math.PI / 2 + (i / n) * Math.PI * 2;
      slots.push({ x: Math.cos(a) * r, y: Math.sin(a) * r });
    }
    return slots;
  }
  slots.push({ x: 0, y: 0 });
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2;
    slots.push({ x: Math.cos(a) * 36, y: Math.sin(a) * 36 });
  }
  for (let i = 0; i < 12; i++) {
    const a = ((i + 0.5) / 12) * Math.PI * 2;
    slots.push({ x: Math.cos(a) * 72, y: Math.sin(a) * 72 });
  }
  return slots.slice(0, n);
}

export class CarromPhysics {
  constructor({ onPocket = () => {}, onStatus = () => {} } = {}) {
    this.onPocket = onPocket;
    this.onStatus = onStatus;
    this.engine = Engine.create({
      gravity: { x: 0, y: 0, scale: 0 },
      positionIterations: 10,
      velocityIterations: 8,
    });
    this.world = this.engine.world;
    this.time = 0;
    this.acc = 0;
    this.side = 0;
    this.strikerT = 0;
    this.status = 'ready'; // ready | scripted | moving
    this.script = null;
    this.scriptedShot = false;
    this.scriptTarget = null;
    this.coins = new Map();
    this.settleCount = 0;
    this.shotAt = 0;

    const h = BOARD.half;
    const t = 300;
    const wall = { isStatic: true, restitution: 0.78, friction: 0 };
    Composite.add(this.world, [
      Bodies.rectangle(0, -h - t / 2, 2 * h + 2 * t, t, wall),
      Bodies.rectangle(0, h + t / 2, 2 * h + 2 * t, t, wall),
      Bodies.rectangle(-h - t / 2, 0, t, 2 * h + 2 * t, wall),
      Bodies.rectangle(h + t / 2, 0, t, 2 * h + 2 * t, wall),
    ]);

    this.striker = Bodies.circle(0, 0, BOARD.strikerR, {
      restitution: 0.9,
      friction: 0.01,
      frictionStatic: 0,
      frictionAir: 0.022,
      density: 0.0028,
    });
    this.strikerSpawnAt = 0;
    this.strikerGone = false;
    Composite.add(this.world, this.striker);
    this._placeStriker();
  }

  /* ----------------------------- setup ----------------------------- */

  loadSection(ids, side = this.side) {
    for (const c of this.coins.values()) {
      if (c.state === 'live') Composite.remove(this.world, c.body);
    }
    this.coins.clear();
    this.script = null;
    this.side = side;
    const slots = formation(ids.length);
    ids.forEach((id, i) => {
      const home = slots[i];
      const coin = { id, home, state: 'live', body: null, guided: null, spawnAt: this.time, sink: null };
      coin.body = this._makeCoinBody(home.x, home.y);
      Composite.add(this.world, coin.body);
      this.coins.set(id, coin);
    });
    this.status = 'ready';
    this.settleCount = 0;
    this._resetStriker();
    this.onStatus(this.status);
  }

  setSide(side) {
    this.side = side;
    if (this.status === 'ready') this._placeStriker();
  }

  setStrikerT(t) {
    this.strikerT = clamp(t, -BOARD.strikerRange, BOARD.strikerRange);
    if (this.status === 'ready') this._placeStriker();
  }

  strikerHome(t = this.strikerT) {
    const [nx, ny] = SIDE_NORMALS[this.side];
    const px = ny;
    const py = -nx;
    return { x: nx * BOARD.baseline + px * t, y: ny * BOARD.baseline + py * t };
  }

  /* ----------------------------- shots ----------------------------- */

  /** Free flick. dir is any non-zero vector, power in 0..1. */
  shootFree(dx, dy, power) {
    if (this.status !== 'ready') return false;
    const len = Math.hypot(dx, dy);
    if (len < 1e-6) return false;
    const speed = 5 + clamp(power, 0, 1) * 19;
    this.scriptedShot = false;
    this.scriptTarget = null;
    this._launch((dx / len) * speed, (dy / len) * speed);
    return true;
  }

  /** Scripted shot that always ends with this coin in a pocket. */
  shootCoin(id) {
    if (this.status !== 'ready') return false;
    const coin = this.coins.get(id);
    if (!coin || coin.state !== 'live') return false;
    const plan = this._planShot(coin);
    coin.guided = { pocket: plan.pocket, hit: false, deadline: Infinity };
    this.script = { coinId: id, from: this.strikerT, to: plan.t, t0: this.time };
    this.scriptedShot = true;
    this.scriptTarget = id;
    this.status = 'scripted';
    this.onStatus(this.status);
    return true;
  }

  /** Put a pocketed coin back on the board (after its overlay is closed). */
  respawn(id) {
    const coin = this.coins.get(id);
    if (!coin || coin.state === 'live') return;
    const spot = this._freeSpot(coin.home);
    coin.body = this._makeCoinBody(spot.x, spot.y);
    coin.state = 'live';
    coin.spawnAt = this.time;
    coin.sink = null;
    coin.guided = null;
    Composite.add(this.world, coin.body);
  }

  /* ---------------------------- snapshots ---------------------------- */

  coinSnapshot(id) {
    const c = this.coins.get(id);
    if (!c) return null;
    if (c.state === 'live') {
      return {
        state: 'live',
        x: c.body.position.x,
        y: c.body.position.y,
        angle: c.body.angle,
        sink: 0,
        age: this.time - c.spawnAt,
      };
    }
    if (c.state === 'sinking') {
      const p = clamp((this.time - c.sink.t0) / SINK_MS, 0, 1);
      const e = 1 - (1 - Math.min(1, p * 2.2)) ** 2;
      return {
        state: 'sinking',
        x: c.sink.x + (c.sink.px - c.sink.x) * e,
        y: c.sink.y + (c.sink.py - c.sink.y) * e,
        angle: c.sink.angle,
        sink: p,
        age: 1e9,
      };
    }
    return { state: 'out', x: 0, y: 0, angle: 0, sink: 1, age: 1e9 };
  }

  strikerSnapshot() {
    return {
      x: this.striker.position.x,
      y: this.striker.position.y,
      angle: this.striker.angle,
      age: this.time - this.strikerSpawnAt,
    };
  }

  /* ------------------------------ stepping ------------------------------ */

  step(dtMs) {
    this.acc += Math.min(dtMs, 100);
    while (this.acc >= STEP) {
      this._substep();
      this.acc -= STEP;
    }
  }

  _substep() {
    if (this.status === 'scripted') this._runScript();
    if (this.status === 'ready') this._pinStriker();

    this._guide();
    Engine.update(this.engine, STEP);
    this._clampSpeeds();
    this._checkPockets();
    this._finishSinks();
    if (this.status === 'moving') this._checkSettled();
    this.time += STEP;
  }

  _runScript() {
    const s = this.script;
    const k = clamp((this.time - s.t0) / SLIDE_MS, 0, 1);
    const e = k * k * (3 - 2 * k);
    this.strikerT = s.from + (s.to - s.from) * e;
    this._placeStriker();
    if (k < 1) return;
    const coin = this.coins.get(s.coinId);
    this.script = null;
    if (!coin || coin.state !== 'live') {
      this.status = 'ready';
      this.onStatus(this.status);
      return;
    }
    const sp = this.striker.position;
    const dx = coin.body.position.x - sp.x;
    const dy = coin.body.position.y - sp.y;
    const d = Math.hypot(dx, dy) || 1;
    coin.guided.deadline = this.time + 4000;
    this._launch((dx / d) * 17, (dy / d) * 17);
  }

  _launch(vx, vy) {
    Body.setVelocity(this.striker, { x: vx, y: vy });
    this.status = 'moving';
    this.shotAt = this.time;
    this.settleCount = 0;
    this.onStatus(this.status);
  }

  /** Steer scripted coins toward their pocket once the striker has hit them. */
  _guide() {
    for (const c of this.coins.values()) {
      if (!c.guided || c.state !== 'live') continue;
      const b = c.body;
      const sp = speedOf(b);
      if (sp > 0.4) c.guided.hit = true;
      if (this.time > c.guided.deadline) {
        this._pocketCoin(c, c.guided.pocket);
        continue;
      }
      if (!c.guided.hit) continue;
      const pk = POCKETS[c.guided.pocket];
      const dx = pk.x - b.position.x;
      const dy = pk.y - b.position.y;
      const d = Math.hypot(dx, dy) || 1;
      const ux = dx / d;
      const uy = dy / d;
      const cx = sp > 1e-3 ? b.velocity.x / sp : ux;
      const cy = sp > 1e-3 ? b.velocity.y / sp : uy;
      const k = 0.06;
      let nx = cx * (1 - k) + ux * k;
      let ny = cy * (1 - k) + uy * k;
      const nl = Math.hypot(nx, ny) || 1;
      nx /= nl;
      ny /= nl;
      const speed = Math.max(sp, 6.5);
      Body.setVelocity(b, { x: nx * speed, y: ny * speed });
    }
  }

  _clampSpeeds() {
    const bodies = [this.striker];
    for (const c of this.coins.values()) if (c.state === 'live') bodies.push(c.body);
    for (const b of bodies) {
      const sp = speedOf(b);
      if (sp > MAX_V) Body.setVelocity(b, { x: (b.velocity.x / sp) * MAX_V, y: (b.velocity.y / sp) * MAX_V });
      else if (sp < 0.1 && this.status === 'moving') Body.setVelocity(b, { x: 0, y: 0 });
    }
  }

  _checkPockets() {
    const r = BOARD.pocketR - 3;
    for (const c of this.coins.values()) {
      if (c.state !== 'live') continue;
      for (let i = 0; i < POCKETS.length; i++) {
        const pk = POCKETS[i];
        if (Math.hypot(c.body.position.x - pk.x, c.body.position.y - pk.y) < r) {
          this._pocketCoin(c, i);
          break;
        }
      }
    }
    // Pocketing the striker is a foul: it just goes back to the baseline.
    if (this.status === 'moving') {
      const s = this.striker.position;
      for (const pk of POCKETS) {
        if (Math.hypot(s.x - pk.x, s.y - pk.y) < r) {
          this._finishShot();
          break;
        }
      }
    }
  }

  _pocketCoin(c, pocketIdx) {
    if (c.state !== 'live') return;
    const pk = POCKETS[pocketIdx];
    c.sink = {
      x: c.body.position.x,
      y: c.body.position.y,
      px: pk.x,
      py: pk.y,
      angle: c.body.angle,
      t0: this.time,
    };
    Composite.remove(this.world, c.body);
    c.state = 'sinking';
    c.collateral = this.scriptedShot && c.id !== this.scriptTarget;
    c.guided = null;
  }

  _finishSinks() {
    for (const c of this.coins.values()) {
      if (c.state === 'sinking' && this.time - c.sink.t0 >= SINK_MS) {
        c.state = 'out';
        // Coins knocked in by accident during a scripted shot just go back on the board.
        if (c.collateral) this.respawn(c.id);
        else this.onPocket(c.id);
      }
    }
  }

  _checkSettled() {
    const elapsed = this.time - this.shotAt;
    let moving = speedOf(this.striker) > 0.12;
    for (const c of this.coins.values()) {
      if (c.state === 'live' && speedOf(c.body) > 0.12) moving = true;
    }
    if (this.scriptedShot && elapsed > 200) {
      const target = this.coins.get(this.scriptTarget);
      if (!target || target.state !== 'live') return this._finishShot();
    }
    this.settleCount = moving ? 0 : this.settleCount + 1;
    if ((elapsed > 300 && this.settleCount > 40) || elapsed > 8000) this._finishShot();
  }

  _finishShot() {
    // A scripted coin that never got pocketed by the physics is pocketed now: nobody is left hanging.
    for (const c of this.coins.values()) {
      if (c.guided && c.state === 'live') this._pocketCoin(c, c.guided.pocket);
    }
    this._resetStriker();
    this.status = 'ready';
    this.settleCount = 0;
    this.onStatus(this.status);
  }

  /* ----------------------------- helpers ----------------------------- */

  _makeCoinBody(x, y) {
    return Bodies.circle(x, y, BOARD.coinR, {
      restitution: 0.88,
      friction: 0.01,
      frictionStatic: 0,
      frictionAir: 0.022,
      density: 0.002,
    });
  }

  _placeStriker() {
    const h = this.strikerHome();
    Body.setPosition(this.striker, h);
    Body.setVelocity(this.striker, { x: 0, y: 0 });
    Body.setAngularVelocity(this.striker, 0);
  }

  _pinStriker() {
    this._placeStriker();
  }

  _resetStriker() {
    this._placeStriker();
    this.strikerSpawnAt = this.time;
  }

  _freeSpot(home) {
    const live = [...this.coins.values()].filter((c) => c.state === 'live').map((c) => c.body.position);
    const free = (p) => live.every((q) => Math.hypot(q.x - p.x, q.y - p.y) > BOARD.coinR * 2 + 4);
    if (free(home)) return home;
    for (let ring = 1; ring < 14; ring++) {
      const r = ring * 22;
      const n = Math.max(6, Math.round((2 * Math.PI * r) / 24));
      for (let i = 0; i < n; i++) {
        const a = (i / n) * Math.PI * 2;
        const p = { x: Math.cos(a) * r, y: Math.sin(a) * r };
        if (free(p)) return p;
      }
    }
    return home;
  }

  /** Pick the baseline spot + pocket that gives the straightest, least obstructed shot. */
  _planShot(coin) {
    const [nx, ny] = SIDE_NORMALS[this.side];
    const px = ny;
    const py = -nx;
    const c = coin.body.position;
    const others = [...this.coins.values()].filter((o) => o !== coin && o.state === 'live').map((o) => o.body.position);
    let best = { score: -Infinity, t: this.strikerT, pocket: 0 };

    for (let pi = 0; pi < POCKETS.length; pi++) {
      const pk = POCKETS[pi];
      const ux = pk.x - c.x;
      const uy = pk.y - c.y;
      const ul = Math.hypot(ux, uy) || 1;
      for (let t = -BOARD.strikerRange; t <= BOARD.strikerRange; t += 15) {
        const sx = nx * BOARD.baseline + px * t;
        const sy = ny * BOARD.baseline + py * t;
        const dx = c.x - sx;
        const dy = c.y - sy;
        const d = Math.hypot(dx, dy);
        if (-(dx * nx + dy * ny) < 60) continue; // coin must be in front of the striker
        let score = (dx * ux + dy * uy) / (d * ul);
        for (const o of others) {
          // distance from other coin to the striker->coin segment
          const k = clamp(((o.x - sx) * dx + (o.y - sy) * dy) / (d * d), 0, 1);
          const dist = Math.hypot(sx + dx * k - o.x, sy + dy * k - o.y);
          if (dist < BOARD.coinR + BOARD.strikerR + 2 && k < 0.98) score -= 1;
        }
        score -= Math.abs(t - this.strikerT) * 0.0002;
        if (score > best.score) best = { score, t, pocket: pi };
      }
    }
    return best;
  }
}
