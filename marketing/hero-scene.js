/**
 * "The Depth Field" — the HiLabs hero scene.
 *
 * A live 3D reading of the logo's idea: rings that sink toward a glowing amber core, circled
 * by the three arcs of the three learning phases, with a sparse field of particles drifting
 * inward. It is a layer on top of the page, never a requirement: index.html ships a static SVG
 * of the same motif, and this module is only imported once the page has painted and only when
 * the device, connection and motion preference all allow it.
 *
 * Every colour comes from the design tokens, passed in by the caller.
 *
 * One deliberate departure from the brief, section 6b: there is no EffectComposer and no
 * UnrealBloomPass. Bloom thresholds on the luminance of the whole frame, so against the light
 * hero the background itself exceeds any threshold and the entire frame blooms — a grey-white
 * smear with the scene lost inside it. Bloom needs a dark scene, and the brief's own rules say
 * the background stays transparent so the page's white shows through, and never a black void.
 * The core's glow is built instead from two soft radial sprites over the solid amber sphere,
 * which reads the same at this size and costs nothing. It also keeps the lazy payload well
 * inside the 250KB budget, since only three.module.js loads.
 */

const THREE_VERSION = "0.160.0";
const BASE = `https://cdn.jsdelivr.net/npm/three@${THREE_VERSION}/`;

export async function createHeroScene(options) {
  const canvas = options.canvas;
  const host = options.host;
  const tokens = options.tokens;
  const reduced = options.reduced === true;
  const mobile = options.mobile === true;

  const THREE = await import(/* webpackIgnore: true */ `${BASE}build/three.module.js`);

  /* ---------------- renderer ---------------- */

  // premultipliedAlpha off: the shaders output straight alpha, and the canvas composites over
  // the page's white rather than over black.
  const renderer = new THREE.WebGLRenderer({
    canvas, antialias: !mobile, alpha: true, premultipliedAlpha: false
  });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.setClearColor(0x000000, 0); // transparent: the page's own surface shows through

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 120);

  const indigo = new THREE.Color(tokens.indigo);
  const amber = new THREE.Color(tokens.amber);

  const RING_COUNT = 8;
  const RING_GAP = 2.1;
  const RING_DROP = 0.2;
  const CORE_Z = -(RING_COUNT - 1) * RING_GAP - 2.4;
  const CORE_Y = -(RING_COUNT - 1) * RING_DROP - 0.5;
  const CORE = new THREE.Vector3(0, CORE_Y, CORE_Z);

  const intensity = mobile ? 0.3 : 1;

  /* ---------------- the tunnel of sinking rings ---------------- */

  const tunnel = new THREE.Group();
  scene.add(tunnel);

  const ringMaterials = [];
  for (let i = 0; i < RING_COUNT; i++) {
    const t = i / (RING_COUNT - 1);
    const radius = 2.3 - t * 0.55;
    const material = new THREE.MeshBasicMaterial({
      color: indigo,
      transparent: true,
      opacity: (0.5 - t * 0.35) * intensity,
      depthWrite: false
    });
    ringMaterials.push(material);
    const ring = new THREE.Mesh(
      new THREE.TorusGeometry(radius, radius * 0.01, 5, 128),
      material
    );
    ring.position.set(0, -i * RING_DROP, -i * RING_GAP);
    tunnel.add(ring);
  }

  /* ---------------- the three arcs ---------------- */
  /* 84 degrees each with 36-degree gaps, as the mark draws them, turning once a minute. */

  const arcs = new THREE.Group();
  arcs.position.z = -0.6;
  scene.add(arcs);

  const arcMaterial = new THREE.MeshBasicMaterial({
    color: indigo,
    transparent: true,
    opacity: 0.9 * intensity,
    depthWrite: false
  });
  const ARC_SWEEP = (84 * Math.PI) / 180;
  for (let a = 0; a < 3; a++) {
    const arc = new THREE.Mesh(
      new THREE.TorusGeometry(2.58, 0.05, 8, 96, ARC_SWEEP),
      arcMaterial
    );
    arc.rotation.z = a * ((120 * Math.PI) / 180);
    arcs.add(arc);
  }

  /* ---------------- the amber core ---------------- */

  const coreMaterial = new THREE.MeshBasicMaterial({ color: amber });
  const core = new THREE.Mesh(new THREE.SphereGeometry(0.2, 24, 18), coreMaterial);
  core.position.copy(CORE);
  scene.add(core);

  // Two soft radial sprites stand in for bloom: a tight inner glow and a wide outer falloff.
  // Normal blending, not additive, because the page behind is white and additive would wash out.
  const haloTexture = makeHaloTexture(THREE, tokens.amber);
  const haloInner = new THREE.Sprite(new THREE.SpriteMaterial({
    map: haloTexture, transparent: true, depthWrite: false, opacity: 0.85 * intensity
  }));
  haloInner.scale.set(0.9, 0.9, 1);
  haloInner.position.copy(CORE);
  scene.add(haloInner);

  const halo = new THREE.Sprite(new THREE.SpriteMaterial({
    map: haloTexture, transparent: true, depthWrite: false, opacity: 0.45 * intensity
  }));
  halo.scale.set(2.4, 2.4, 1);
  halo.position.copy(CORE);
  scene.add(halo);

  /* ---------------- particles drifting toward the core ---------------- */

  let particleCount = mobile ? 400 : 800;
  let particles = null;
  let particleGeometry = null;
  let particleData = null;

  const particleMaterial = new THREE.ShaderMaterial({
    uniforms: {
      uIndigo: { value: indigo.clone() },
      uAmber: { value: amber.clone() },
      uOpacity: { value: 0.85 * intensity },
      uScale: { value: 1 }
    },
    transparent: true,
    depthWrite: false,
    vertexShader: `
      attribute float aSize;
      attribute float aWarm;
      uniform float uScale;
      varying float vWarm;
      void main() {
        vec4 mv = modelViewMatrix * vec4(position, 1.0);
        gl_Position = projectionMatrix * mv;
        gl_PointSize = aSize * uScale * (18.0 / max(0.001, -mv.z));
        vWarm = aWarm;
      }
    `,
    fragmentShader: `
      uniform vec3 uIndigo;
      uniform vec3 uAmber;
      uniform float uOpacity;
      varying float vWarm;
      void main() {
        vec2 d = gl_PointCoord - vec2(0.5);
        float r = length(d);
        if (r > 0.5) discard;
        float a = smoothstep(0.5, 0.1, r);
        gl_FragColor = vec4(mix(uIndigo, uAmber, vWarm), a * uOpacity);
      }
    `
  });

  function buildParticles(count) {
    if (particles) {
      scene.remove(particles);
      particleGeometry.dispose();
    }
    particleCount = count;
    const position = new Float32Array(count * 3);
    const size = new Float32Array(count);
    const warm = new Float32Array(count);
    const speed = new Float32Array(count);
    for (let i = 0; i < count; i++) spawn(position, speed, size, i, true);
    particleGeometry = new THREE.BufferGeometry();
    particleGeometry.setAttribute("position", new THREE.BufferAttribute(position, 3));
    particleGeometry.setAttribute("aSize", new THREE.BufferAttribute(size, 1));
    particleGeometry.setAttribute("aWarm", new THREE.BufferAttribute(warm, 1));
    particleData = { position, size, warm, speed };
    particles = new THREE.Points(particleGeometry, particleMaterial);
    scene.add(particles);
  }

  function spawn(position, speed, size, i, anywhere) {
    const angle = Math.random() * Math.PI * 2;
    const radius = 0.5 + Math.random() * 2.3;
    const along = anywhere ? Math.random() : 0;
    position[i * 3] = Math.cos(angle) * radius;
    position[i * 3 + 1] = Math.sin(angle) * radius * 0.8 + along * CORE_Y;
    position[i * 3 + 2] = 2.2 + along * (CORE_Z - 2.2);
    speed[i] = 0.5 + Math.random() * 0.9;
    size[i] = 0.5 + Math.random() * 1.1; // tiny: a few px near the mouth, ~1px at the core
  }

  buildParticles(particleCount);

  /* ---------------- motion state ---------------- */

  const pointer = { x: 0, y: 0, tx: 0, ty: 0 };
  const MAX_TILT = (4 * Math.PI) / 180;
  const CAM_START = 6.6;
  const CAM_END = CORE_Z + 2.6;

  let scrollProgress = 0;
  let idleDrift = 0;
  let pulseUntil = 0;
  let running = false;
  let visible = true;
  let frameHandle = 0;
  let last = 0;
  let slowSince = 0;
  let downgraded = false;
  let disposed = false;

  const touch = !window.matchMedia("(hover: hover) and (pointer: fine)").matches;

  function onPointerMove(event) {
    if (touch) return;
    const rect = host.getBoundingClientRect();
    pointer.tx = ((event.clientX - rect.left) / Math.max(1, rect.width) - 0.5) * 2;
    pointer.ty = ((event.clientY - rect.top) / Math.max(1, rect.height) - 0.5) * 2;
  }
  window.addEventListener("pointermove", onPointerMove, { passive: true });

  function onScroll() {
    const rect = host.getBoundingClientRect();
    const span = rect.height + window.innerHeight * 0.4;
    scrollProgress = clamp((window.innerHeight * 0.4 - rect.top) / Math.max(1, span), 0, 1);
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  function resize() {
    const rect = host.getBoundingClientRect();
    const w = Math.max(1, Math.round(rect.width));
    const h = Math.max(1, Math.round(rect.height));
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    particleMaterial.uniforms.uScale.value = clamp(w / 560, 0.6, 1.4);
  }
  const resizeObserver = typeof ResizeObserver === "function" ? new ResizeObserver(resize) : null;
  if (resizeObserver) resizeObserver.observe(host);
  else window.addEventListener("resize", resize, { passive: true });
  resize();

  // No GPU work while the hero is off-screen.
  const io = new IntersectionObserver(
    (entries) => {
      visible = entries[0].isIntersecting;
      if (visible) start();
      else stop();
    },
    { threshold: 0 }
  );
  io.observe(host);

  function onVisibility() {
    if (document.hidden) stop();
    else if (visible) start();
  }
  document.addEventListener("visibilitychange", onVisibility);

  function onContextLost(event) {
    event.preventDefault();
    stop();
    if (typeof options.onLost === "function") options.onLost();
  }
  canvas.addEventListener("webglcontextlost", onContextLost);

  /* ---------------- frame ---------------- */

  function frame(now) {
    if (disposed) return;
    frameHandle = requestAnimationFrame(frame);
    const dt = Math.min(0.05, (now - last) / 1000);
    last = now;

    // Performance guard: two slow seconds and the scene gives up its extras rather than
    // stuttering on a mid-range phone.
    if (!downgraded) {
      if (dt > 0.024) {
        if (!slowSince) slowSince = now;
        else if (now - slowSince > 2000) downgrade();
      } else {
        slowSince = 0;
      }
    }

    arcs.rotation.z += dt * ((Math.PI * 2) / 60);

    const pos = particleData.position;
    const speed = particleData.speed;
    const warm = particleData.warm;
    for (let i = 0; i < particleCount; i++) {
      const ix = i * 3;
      const dx = CORE.x - pos[ix];
      const dy = CORE.y - pos[ix + 1];
      const dz = CORE.z - pos[ix + 2];
      const dist = Math.sqrt(dx * dx + dy * dy + dz * dz) || 1;
      const step = dt * speed[i] * 0.55;
      pos[ix] += (dx / dist) * step;
      pos[ix + 1] += (dy / dist) * step;
      pos[ix + 2] += (dz / dist) * step;
      warm[i] = clamp(1 - dist / 7, 0, 1);
      if (dist < 0.45) spawn(pos, speed, particleData.size, i, false);
    }
    particleGeometry.attributes.position.needsUpdate = true;
    particleGeometry.attributes.aWarm.needsUpdate = true;

    if (touch) {
      idleDrift += dt * 0.12;
      pointer.x = Math.sin(idleDrift) * 0.5;
      pointer.y = Math.cos(idleDrift * 0.8) * 0.3;
    } else {
      pointer.x += (pointer.tx - pointer.x) * 0.05;
      pointer.y += (pointer.ty - pointer.y) * 0.05;
    }

    const z = CAM_START + (CAM_END - CAM_START) * easeInOut(scrollProgress);
    const tiltX = Math.sin(pointer.x * MAX_TILT) * 2.2;
    const tiltY = -Math.sin(pointer.y * MAX_TILT) * 2.2;
    camera.position.set(tiltX, tiltY + CORE_Y * 0.12, z);
    camera.lookAt(0, CORE_Y * 0.35, CORE_Z * 0.45);

    let coreScale = 1;
    if (now < pulseUntil) {
      const p = 1 - (pulseUntil - now) / 600;
      coreScale = 1 + Math.sin(p * Math.PI) * 0.25;
    }
    core.scale.setScalar(coreScale);
    haloInner.scale.set(0.9 * coreScale, 0.9 * coreScale, 1);
    halo.scale.set(2.4 * coreScale, 2.4 * coreScale, 1);

    renderer.render(scene, camera);
  }

  function downgrade() {
    downgraded = true;
    buildParticles(Math.max(120, Math.floor(particleCount / 2)));
  }

  function start() {
    if (running || disposed || document.hidden) return;
    running = true;
    last = performance.now();
    frameHandle = requestAnimationFrame(frame);
  }

  function stop() {
    running = false;
    if (frameHandle) cancelAnimationFrame(frameHandle);
    frameHandle = 0;
  }

  if (!reduced) start();

  return {
    /** Pulses the core once: used when the primary button is hovered. */
    pulse() {
      pulseUntil = performance.now() + 600;
      start();
    },

    /** Re-reads the tokens, for a theme change. */
    recolour(next) {
      indigo.set(next.indigo);
      amber.set(next.amber);
      for (const m of ringMaterials) m.color.set(next.indigo);
      arcMaterial.color.set(next.indigo);
      coreMaterial.color.set(next.amber);
      particleMaterial.uniforms.uIndigo.value.set(next.indigo);
      particleMaterial.uniforms.uAmber.value.set(next.amber);
      renderer.setClearColor(new THREE.Color(next.surface), 1);
    },

    dispose() {
      disposed = true;
      stop();
      io.disconnect();
      if (resizeObserver) resizeObserver.disconnect();
      else window.removeEventListener("resize", resize);
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("scroll", onScroll);
      document.removeEventListener("visibilitychange", onVisibility);
      canvas.removeEventListener("webglcontextlost", onContextLost);
      scene.traverse((obj) => {
        if (obj.geometry) obj.geometry.dispose();
        if (obj.material) {
          const list = Array.isArray(obj.material) ? obj.material : [obj.material];
          for (const m of list) {
            if (m.map) m.map.dispose();
            m.dispose();
          }
        }
      });
      haloTexture.dispose();
      renderer.dispose();
    }
  };
}

/* ---------------- helpers ---------------- */

function clamp(v, lo, hi) {
  return v < lo ? lo : v > hi ? hi : v;
}

function easeInOut(t) {
  return t * t * (3 - 2 * t);
}

function makeHaloTexture(THREE, amberHex) {
  const size = 128;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");
  const rgb = hexToRgb(amberHex);
  const gradient = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  gradient.addColorStop(0, `rgba(${rgb},0.95)`);
  gradient.addColorStop(0.35, `rgba(${rgb},0.3)`);
  gradient.addColorStop(1, `rgba(${rgb},0)`);
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, size, size);
  return new THREE.CanvasTexture(canvas);
}

function hexToRgb(hex) {
  const h = hex.replace("#", "").trim();
  const n = parseInt(h.length === 3 ? h.replace(/./g, (c) => c + c) : h, 16);
  return `${(n >> 16) & 255},${(n >> 8) & 255},${n & 255}`;
}
