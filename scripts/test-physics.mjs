// Headless checks for the carrom physics: every scripted shot must pocket its coin,
// nothing may leave the board, and free flicks must settle and hand control back.
import { CarromPhysics, BOARD } from '../src/physics/carromPhysics.js';

let failures = 0;
const check = (ok, msg) => {
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${msg}`);
  if (!ok) failures++;
};

function run(physics, until, maxMs = 20000) {
  let t = 0;
  while (t < maxMs && !until()) {
    physics.step(1000 / 60);
    t += 1000 / 60;
    for (const c of physics.coins.values()) {
      if (c.state === 'live') {
        const { x, y } = c.body.position;
        if (Math.abs(x) > BOARD.half + 5 || Math.abs(y) > BOARD.half + 5) return { t, escaped: c.id };
      }
    }
  }
  return { t };
}

const SIZES = [4, 5, 6, 9];

// 1) Scripted shots: every coin, every side, several formation sizes.
for (const n of SIZES) {
  for (let side = 0; side < 4; side++) {
    const ids = Array.from({ length: n }, (_, i) => `c${i}`);
    let pocketed = [];
    const physics = new CarromPhysics({ onPocket: (id) => pocketed.push(id) });
    physics.loadSection(ids, side);
    let ok = true;
    let worst = 0;
    for (const id of ids) {
      pocketed = [];
      if (!physics.shootCoin(id)) { ok = false; break; }
      const r = run(physics, () => pocketed.includes(id) && physics.status === 'ready');
      worst = Math.max(worst, r.t);
      if (r.escaped || !pocketed.includes(id)) { ok = false; break; }
      physics.respawn(id);
      run(physics, () => false, 700); // let any collateral coins finish sinking and come back
    }
    check(ok, `scripted: ${n} coins, side ${side}, all pocketed (slowest ${(worst / 1000).toFixed(1)}s)`);
  }
}

// 2) Free flick: settles, status returns to ready, no coin escapes.
for (let side = 0; side < 4; side++) {
  const physics = new CarromPhysics();
  physics.loadSection(['a', 'b', 'c', 'd', 'e'], side);
  const [nx, ny] = [[0, 1], [1, 0], [0, -1], [-1, 0]][side];
  physics.shootFree(-nx, -ny, 1);
  const r = run(physics, () => physics.status === 'ready');
  check(!r.escaped && physics.status === 'ready', `free flick, side ${side}: settles in ${(r.t / 1000).toFixed(1)}s`);
}

// 3) Refuses a second shot while one is running.
{
  const physics = new CarromPhysics();
  physics.loadSection(['a', 'b', 'c', 'd'], 0);
  physics.shootFree(0, -1, 0.5);
  check(physics.shootFree(0, -1, 0.5) === false && physics.shootCoin('a') === false, 'rejects shots while moving');
}

// 4) Respawn puts the coin back without overlap.
{
  const physics = new CarromPhysics();
  const ids = ['a', 'b', 'c', 'd'];
  let done = false;
  physics.onPocket = () => (done = true);
  physics.loadSection(ids, 0);
  physics.shootCoin('a');
  run(physics, () => done && physics.status === 'ready');
  physics.respawn('a');
  const live = [...physics.coins.values()].filter((c) => c.state === 'live');
  let minGap = Infinity;
  for (const p of live) for (const q of live) if (p !== q) minGap = Math.min(minGap, Math.hypot(p.body.position.x - q.body.position.x, p.body.position.y - q.body.position.y));
  check(live.length === 4 && minGap >= BOARD.coinR * 2 - 0.5, `respawn restores coin (min gap ${minGap.toFixed(1)})`);
}

console.log(failures ? `\n${failures} check(s) failed` : '\nAll physics checks passed');
process.exit(failures ? 1 : 0);
