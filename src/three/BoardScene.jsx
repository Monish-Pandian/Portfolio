// 3D scene: board, coins, striker, camera and pointer input. Physics lives in CarromPhysics (2D);
// this file only draws it. Physics x -> world X, physics y -> world Z, 100 physics units = 1 world unit.
import { memo, useCallback, useEffect, useMemo, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { BOARD, POCKETS, SIDE_NORMALS } from '../physics/carromPhysics.js';
import {
  makeBoardTexture,
  makeCoinTexture,
  makeFrameTexture,
  makeLabelTexture,
  makeStrikerTexture,
} from './textures.js';

const S = 0.01;
const HALF = BOARD.half * S; // 3.7
const BAND = 0.55; // frame thickness
const FRAME_H = 0.24;
const COIN_R = BOARD.coinR * S;
const COIN_H = 0.05;
const STRIKER_R = BOARD.strikerR * S;
const STRIKER_H = 0.045;

const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));
const easeOutBack = (a) => {
  const c1 = 1.70158;
  const c3 = c1 + 1;
  return 1 + c3 * (a - 1) ** 3 + c1 * (a - 1) ** 2;
};

/* ------------------------------ static board ------------------------------ */

function Lights({ lowPower }) {
  return (
    <>
      <ambientLight intensity={0.55} />
      <hemisphereLight args={['#fff1da', '#3a2412', 0.45]} />
      <directionalLight
        position={[-3, 9, 4]}
        intensity={1.7}
        castShadow={!lowPower}
        shadow-mapSize={[2048, 2048]}
        shadow-camera-left={-6}
        shadow-camera-right={6}
        shadow-camera-top={6}
        shadow-camera-bottom={-6}
        shadow-camera-near={1}
        shadow-camera-far={24}
        shadow-bias={-0.0004}
      />
    </>
  );
}

function SideLabel({ side, text, active }) {
  const map = useMemo(() => makeLabelTexture(text), [text]);
  const quaternion = useMemo(() => {
    const [nx, ny] = SIDE_NORMALS[side];
    const x = new THREE.Vector3(ny, 0, -nx); // player's right
    const y = new THREE.Vector3(-nx, 0, -ny); // reading direction: toward the board centre
    const z = new THREE.Vector3().crossVectors(x, y); // up
    return new THREE.Quaternion().setFromRotationMatrix(new THREE.Matrix4().makeBasis(x, y, z));
  }, [side]);
  const [nx, ny] = SIDE_NORMALS[side];
  const d = HALF + BAND / 2;
  return (
    <mesh position={[nx * d, FRAME_H + 0.003, ny * d]} quaternion={quaternion}>
      <planeGeometry args={[3.7, 0.46]} />
      <meshBasicMaterial map={map} transparent depthWrite={false} color={active ? '#f6d58f' : '#a98355'} opacity={active ? 1 : 0.8} />
    </mesh>
  );
}

function Board({ sections, activeSide }) {
  const boardTex = useMemo(() => makeBoardTexture(POCKETS, BOARD.baseline), []);
  const frameTex = useMemo(() => makeFrameTexture(), []);
  const span = (HALF + BAND) * 2;
  const frame = { map: frameTex, roughness: 0.55, metalness: 0.02 };
  return (
    <group>
      <mesh position={[0, -0.17, 0]} castShadow receiveShadow>
        <boxGeometry args={[span, 0.3, span]} />
        <meshStandardMaterial {...frame} />
      </mesh>
      <mesh rotation-x={-Math.PI / 2} receiveShadow>
        <planeGeometry args={[HALF * 2, HALF * 2]} />
        <meshStandardMaterial map={boardTex} roughness={0.36} metalness={0} />
      </mesh>
      {[
        [0, -(HALF + BAND / 2), span, BAND],
        [0, HALF + BAND / 2, span, BAND],
        [-(HALF + BAND / 2), 0, BAND, HALF * 2],
        [HALF + BAND / 2, 0, BAND, HALF * 2],
      ].map(([x, z, w, d], i) => (
        <mesh key={i} position={[x, FRAME_H / 2, z]} castShadow receiveShadow>
          <boxGeometry args={[w, FRAME_H, d]} />
          <meshStandardMaterial {...frame} />
        </mesh>
      ))}
      {POCKETS.map((p, i) => (
        <mesh key={i} position={[p.x * S, 0.004, p.y * S]} rotation-x={-Math.PI / 2}>
          <ringGeometry args={[0.305, 0.36, 48]} />
          <meshStandardMaterial color="#8d6c32" metalness={0.55} roughness={0.4} />
        </mesh>
      ))}
      {sections.map((s, i) => (
        <SideLabel key={s.key} side={i} text={s.label} active={i === activeSide} />
      ))}
      <mesh position={[0, -0.34, 0]} rotation-x={-Math.PI / 2} receiveShadow>
        <planeGeometry args={[60, 60]} />
        <meshStandardMaterial color="#1b1511" roughness={1} />
      </mesh>
    </group>
  );
}

/* --------------------------------- pieces --------------------------------- */

const Coin = memo(function Coin({ item, index, accent, visited, register }) {
  const dark = index % 2 === 1;
  const sideColor = dark ? '#3a2e25' : '#e3d3b0';
  const top = useMemo(
    () =>
      makeCoinTexture({
        label: item.short,
        base: dark ? '#2b221b' : '#efe2c6',
        ink: dark ? '#efe2c6' : '#2b221b',
        accent,
      }),
    [item.short, dark, accent],
  );
  const ref = useCallback((g) => register(item.id, g), [item.id, register]);
  return (
    <group ref={ref} userData={{ coinId: item.id }} visible={false}>
      <mesh castShadow receiveShadow>
        <cylinderGeometry args={[COIN_R, COIN_R, COIN_H, 48]} />
        <meshStandardMaterial attach="material-0" color={sideColor} roughness={0.42} />
        <meshStandardMaterial attach="material-1" map={top} roughness={0.32} />
        <meshStandardMaterial attach="material-2" color={sideColor} roughness={0.42} />
      </mesh>
      {visited && (
        <mesh position={[0, COIN_H / 2 + 0.002, 0]} rotation-x={-Math.PI / 2}>
          <ringGeometry args={[COIN_R * 0.62, COIN_R * 0.7, 40]} />
          <meshBasicMaterial color="#e7c76e" />
        </mesh>
      )}
    </group>
  );
});

function Pieces({ physics, items, accent, visited, coinRefs, hoverRef, aimRef }) {
  const strikerRef = useRef();
  const guideRef = useRef();
  const tipRef = useRef();
  const strikerTex = useMemo(() => makeStrikerTexture(), []);
  const register = useCallback(
    (id, g) => {
      if (g) coinRefs.current.set(id, g);
      else coinRefs.current.delete(id);
    },
    [coinRefs],
  );

  useFrame((_, dt) => {
    physics.step(dt * 1000);
    const hover = hoverRef.current;

    for (const item of items) {
      const g = coinRefs.current.get(item.id);
      if (!g) continue;
      const s = physics.coinSnapshot(item.id);
      if (!s || s.state === 'out') {
        g.visible = false;
        continue;
      }
      let scale = 1;
      let y = COIN_H / 2;
      if (s.state === 'live') {
        scale = easeOutBack(clamp(s.age / 280, 0, 1));
        if (hover === item.id) scale *= 1.08;
      } else {
        scale = 1 - 0.5 * s.sink;
        y -= s.sink * 0.24;
      }
      g.visible = true;
      g.position.set(s.x * S, y, s.y * S);
      g.rotation.y = -s.angle;
      g.scale.setScalar(Math.max(scale, 0.001));
    }

    const st = physics.strikerSnapshot();
    const sg = strikerRef.current;
    if (sg) {
      sg.position.set(st.x * S, STRIKER_H / 2, st.y * S);
      sg.rotation.y = -st.angle;
      sg.scale.setScalar(Math.max(easeOutBack(clamp(st.age / 260, 0, 1)), 0.001));
    }

    const aim = aimRef.current;
    const gg = guideRef.current;
    if (gg) {
      gg.visible = !!aim.active;
      if (aim.active) {
        const len = 0.6 + aim.power * 3.2;
        gg.position.set(st.x * S, 0.03, st.y * S);
        gg.rotation.y = -Math.atan2(aim.dy, aim.dx);
        gg.scale.set(len, 1, 1);
        if (tipRef.current) {
          tipRef.current.visible = true;
          tipRef.current.position.set((st.x + aim.dx * 0) * S + aim.dx * len, 0.03, st.y * S + aim.dy * len);
          tipRef.current.scale.setScalar(0.6 + aim.power * 0.8);
        }
      } else if (tipRef.current) tipRef.current.visible = false;
    }
  });

  return (
    <>
      {items.map((item, i) => (
        <Coin key={item.id} item={item} index={i} accent={accent} visited={visited.has(item.id)} register={register} />
      ))}

      <group ref={strikerRef}>
        <mesh castShadow receiveShadow>
          <cylinderGeometry args={[STRIKER_R, STRIKER_R, STRIKER_H, 56]} />
          <meshStandardMaterial attach="material-0" color="#d9c4a0" roughness={0.4} />
          <meshStandardMaterial attach="material-1" map={strikerTex} roughness={0.3} />
          <meshStandardMaterial attach="material-2" color="#d9c4a0" roughness={0.4} />
        </mesh>
      </group>

      <group ref={guideRef} visible={false}>
        <mesh position={[0.5, 0, 0]}>
          <boxGeometry args={[1, 0.01, 0.055]} />
          <meshBasicMaterial color="#fff4d6" transparent opacity={0.65} depthWrite={false} />
        </mesh>
      </group>
      <mesh ref={tipRef} rotation-x={-Math.PI / 2} visible={false}>
        <ringGeometry args={[0.06, 0.1, 32]} />
        <meshBasicMaterial color="#fff4d6" transparent opacity={0.85} depthWrite={false} />
      </mesh>
    </>
  );
}

/* ---------------------------------- camera --------------------------------- */

/**
 * Camera poses, in priority order:
 *  1. overview   - overlay open, overview toggle on, or swinging round to another side of the board
 *  2. pocket     - a coin is about to drop / is dropping: close-up on that pocket
 *  3. striker    - low and close behind the striker, looking along the line it will shoot:
 *                  idle -> toward the coins, aiming -> along the aim, scripted -> at the target coin,
 *                  flying -> held exactly where the flick was fired from
 */
const V3 = THREE.Vector3;
const wrapAngle = (a) => Math.atan2(Math.sin(a), Math.cos(a));

/** Pocket (board units) that currently has a coin heading into it, or null. */
function pocketFocus(physics) {
  for (const c of physics.coins.values()) {
    if (c.state === 'sinking') return { x: c.sink.px, y: c.sink.py };
    if (c.state === 'live' && c.guided?.hit) {
      // Stay behind the striker for the flick; cut to the pocket once the coin is well on its way.
      const pk = POCKETS[c.guided.pocket];
      if (Math.hypot(c.body.position.x - pk.x, c.body.position.y - pk.y) < 330) return { x: pk.x, y: pk.y };
    }
  }
  return null;
}

function CameraRig({ physics, side, view, overlayOpen, aimRef }) {
  const { camera, size } = useThree();
  const st = useRef(null);
  const held = useRef({ pos: new V3(0, 1, 5), look: new V3(), fov: 56 }); // last striker pose, kept while the shot flies
  const goal = useRef({ pos: new V3(), look: new V3() });

  useFrame((_, rawDt) => {
    const dt = Math.min(rawDt, 0.05);
    const n = SIDE_NORMALS[side];
    const targetAng = Math.atan2(n[1], n[0]);
    const aspect = size.width / size.height;
    const zoom = clamp(1.05 / aspect, 1, 2.3); // back off on portrait screens so the board still fits
    const narrow = clamp(0.9 / aspect, 1, 1.7);

    const overviewPos = (ang, out) => out.set(Math.cos(ang) * 5.4 * zoom, 9.4 * zoom, Math.sin(ang) * 5.4 * zoom);

    if (!st.current) {
      // First frame: start high above the board so the first move is a glide down behind the striker.
      const pos = overviewPos(targetAng, new V3());
      st.current = { ang: targetAng, pos, look: new V3(), fov: 52 };
    }
    const s = st.current;

    // Swing round the board by the short way when the side changes.
    const delta = wrapAngle(targetAng - s.ang);
    s.ang += delta * (1 - Math.exp(-dt * 4.2));
    const swinging = Math.abs(delta) > 0.06;

    const { pos: tp, look: tl } = goal.current;
    let fov;
    let rate;

    const focus = overlayOpen ? null : pocketFocus(physics);
    if (overlayOpen || view === 'overview' || swinging) {
      overviewPos(s.ang, tp);
      tl.set(0, 0, 0);
      fov = 52;
      rate = 3.2;
    } else if (focus) {
      const px = focus.x * S;
      const pz = focus.y * S;
      const il = Math.hypot(px, pz) || 1;
      const ix = -px / il; // from the pocket back toward the middle of the board
      const iz = -pz / il;
      tp.set(px + ix * 1.5 - iz * 0.9, 0.95, pz + iz * 1.5 + ix * 0.9);
      tl.set(px + ix * 0.1, 0.02, pz + iz * 0.1);
      fov = 46;
      rate = 4.5;
    } else if (physics.status === 'moving') {
      tp.copy(held.current.pos);
      tl.copy(held.current.look);
      fov = held.current.fov;
      rate = 4;
    } else {
      const sp = physics.strikerSnapshot();
      const aim = aimRef.current;
      let dx = -sp.x;
      let dy = -sp.y;
      let power = 0;
      if (physics.status === 'scripted' && physics.script) {
        const target = physics.coins.get(physics.script.coinId);
        if (target?.state === 'live') {
          dx = target.body.position.x - sp.x;
          dy = target.body.position.y - sp.y;
        }
      } else if (aim.active) {
        dx = aim.dx;
        dy = aim.dy;
        power = aim.power;
      }
      const dl = Math.hypot(dx, dy) || 1;
      dx /= dl;
      dy /= dl;
      const sx = sp.x * S;
      const sz = sp.y * S;
      const back = (1.75 + power * 0.5) * narrow; // pulling back for power draws the camera back a little
      tp.set(sx - dx * back, 1.0 * narrow, sz - dy * back);
      tl.set(sx + dx * 2.4, 0.05, sz + dy * 2.4);
      fov = 56 + (narrow - 1) * 16;
      rate = physics.status === 'scripted' ? 5 : aim.active ? 10 : 4;
      held.current.pos.copy(tp);
      held.current.look.copy(tl);
      held.current.fov = fov;
    }

    const k = 1 - Math.exp(-dt * rate);
    s.pos.lerp(tp, k);
    s.look.lerp(tl, k);
    s.fov += (fov - s.fov) * k;
    camera.position.copy(s.pos);
    camera.lookAt(s.look);
    if (Math.abs(camera.fov - s.fov) > 0.02) {
      camera.fov = s.fov;
      camera.updateProjectionMatrix();
    }

    // With the details panel docked on the right (wide screens), slide the board into the free space on the left.
    const wantShift = overlayOpen && aspect > 1.15 ? 0.22 : 0;
    s.shift = (s.shift || 0) + (wantShift - (s.shift || 0)) * (1 - Math.exp(-dt * 3));
    if (s.shift > 0.002) camera.setViewOffset(size.width, size.height, size.width * s.shift, 0, size.width, size.height);
    else if (camera.view?.enabled) camera.clearViewOffset();
  });
  return null;
}

/* ----------------------------------- input --------------------------------- */

const IDLE_AIM = { active: false, dx: 0, dy: 0, power: 0 };

function Input({ physics, view, coinRefs, hoverRef, aimRef, onCoinClick, onHover, onPower }) {
  const { camera, gl } = useThree();
  const viewRef = useRef(view);
  viewRef.current = view;

  useEffect(() => {
    const el = gl.domElement;
    el.style.touchAction = 'none';
    el.style.cursor = 'grab';
    const ray = new THREE.Raycaster();
    const ndc = new THREE.Vector2();
    const plane = new THREE.Plane(new THREE.Vector3(0, 1, 0), -0.025);
    const hit = new THREE.Vector3();
    let down = null;

    const aimAt = (e) => {
      const r = el.getBoundingClientRect();
      ndc.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1);
      ray.setFromCamera(ndc, camera);
    };
    const pickCoin = (e) => {
      aimAt(e);
      const objs = [];
      coinRefs.current.forEach((g) => g.visible && objs.push(g));
      const hits = ray.intersectObjects(objs, true);
      if (!hits.length) return null;
      let o = hits[0].object;
      while (o && o.userData.coinId === undefined) o = o.parent;
      return o ? o.userData.coinId : null;
    };
    const planePoint = (e) => {
      aimAt(e);
      return ray.ray.intersectPlane(plane, hit) ? hit.clone() : null;
    };
    const setHover = (id) => {
      if (id === hoverRef.current) return;
      hoverRef.current = id;
      onHover(id);
      el.style.cursor = id ? 'pointer' : 'grab';
    };

    const onDown = (e) => {
      if (e.pointerType === 'mouse' && e.button !== 0) return;
      el.setPointerCapture?.(e.pointerId);
      down = { x: e.clientX, y: e.clientY, coin: pickCoin(e), start: planePoint(e), aiming: false };
    };
    const onMove = (e) => {
      if (!down) {
        if (e.pointerType === 'mouse') setHover(pickCoin(e));
        return;
      }
      if (!down.aiming && Math.hypot(e.clientX - down.x, e.clientY - down.y) > 8) down.aiming = true;
      if (!down.aiming) return;

      if (viewRef.current === 'striker') {
        // First-person aiming in screen space (the board plane is too foreshortened this low):
        // pull down = power, drag sideways = turn. Dragging left turns the view right, like pulling a sling.
        const sp = physics.strikerSnapshot();
        const fl = Math.hypot(sp.x, sp.y) || 1;
        const fx = -sp.x / fl; // forward = toward the middle of the board
        const fy = -sp.y / fl;
        const yaw = clamp(-(e.clientX - down.x) * 0.0038, -1.15, 1.15);
        const pull = Math.max(0, e.clientY - down.y);
        const power = clamp((pull - 10) / Math.max(240, el.clientHeight * 0.3), 0, 1);
        aimRef.current = {
          active: true,
          dx: fx * Math.cos(yaw) - fy * Math.sin(yaw),
          dy: fy * Math.cos(yaw) + fx * Math.sin(yaw),
          power,
        };
        onPower(power);
        return;
      }

      if (!down.start) return;
      const p = planePoint(e);
      if (!p) return;
      // Slingshot: pull back from where you pressed, the striker flies the other way.
      const dx = (down.start.x - p.x) * 100;
      const dy = (down.start.z - p.z) * 100;
      const len = Math.hypot(dx, dy);
      if (len < 12) {
        aimRef.current = IDLE_AIM;
        onPower(0);
        return;
      }
      const power = clamp((len - 12) / 260, 0, 1);
      aimRef.current = { active: true, dx: dx / len, dy: dy / len, power };
      onPower(power);
    };
    const finish = (e, cancel) => {
      if (!down) return;
      const d = down;
      down = null;
      const a = aimRef.current;
      aimRef.current = IDLE_AIM;
      onPower(0);
      if (cancel) return;
      if (d.aiming) {
        if (a.active && a.power > 0.04) physics.shootFree(a.dx, a.dy, a.power);
      } else if (d.coin !== null) {
        onCoinClick(d.coin);
      }
    };
    const onUp = (e) => finish(e, false);
    const onCancel = (e) => finish(e, true);
    const onLeave = () => !down && setHover(null);

    el.addEventListener('pointerdown', onDown);
    el.addEventListener('pointermove', onMove);
    el.addEventListener('pointerup', onUp);
    el.addEventListener('pointercancel', onCancel);
    el.addEventListener('pointerleave', onLeave);
    return () => {
      el.removeEventListener('pointerdown', onDown);
      el.removeEventListener('pointermove', onMove);
      el.removeEventListener('pointerup', onUp);
      el.removeEventListener('pointercancel', onCancel);
      el.removeEventListener('pointerleave', onLeave);
    };
  }, [camera, gl, physics, coinRefs, hoverRef, aimRef, onCoinClick, onHover, onPower]);

  return null;
}

/* ---------------------------------- scene ---------------------------------- */

export default function BoardScene({
  physics,
  items,
  sections,
  side,
  view,
  overlayOpen,
  visited,
  accent,
  lowPower,
  hoverRef,
  aimRef,
  onHover,
  onCoinClick,
  onPower,
}) {
  const coinRefs = useRef(new Map());
  return (
    <>
      <color attach="background" args={['#14100d']} />
      <fog attach="fog" args={['#14100d', 16, 34]} />
      <Lights lowPower={lowPower} />
      <Board sections={sections} activeSide={side} />
      <Pieces physics={physics} items={items} accent={accent} visited={visited} coinRefs={coinRefs} hoverRef={hoverRef} aimRef={aimRef} />
      <CameraRig physics={physics} side={side} view={view} overlayOpen={overlayOpen} aimRef={aimRef} />
      <Input
        physics={physics}
        view={view}
        coinRefs={coinRefs}
        hoverRef={hoverRef}
        aimRef={aimRef}
        onCoinClick={onCoinClick}
        onHover={onHover}
        onPower={onPower}
      />
    </>
  );
}
