
import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js';

export function createWatchScene(canvasId) {
  const canvas = document.getElementById(canvasId);
  if (!canvas) return null;

  const scene = new THREE.Scene();
  scene.background = new THREE.Color('#071b35');

  const camera = new THREE.PerspectiveCamera(
    45,
    canvas.clientWidth / canvas.clientHeight,
    0.1,
    100
  );

  camera.position.set(0, 0, 9);

  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: true,
    alpha: true
  });

  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(canvas.clientWidth, canvas.clientHeight);

  scene.add(new THREE.AmbientLight(0xffffff, 2));

  const light = new THREE.DirectionalLight(0xffffff, 3);
  light.position.set(4, 5, 8);
  scene.add(light);

  const watch = new THREE.Group();
  scene.add(watch);

  const materials = {
    silver: new THREE.MeshStandardMaterial({
      color: '#c8d9e5',
      metalness: 0.9,
      roughness: 0.2
    }),
    blue: new THREE.MeshStandardMaterial({
      color: '#79b9d8',
      metalness: 0.6,
      roughness: 0.25
    }),
    dark: new THREE.MeshStandardMaterial({
      color: '#102b48',
      metalness: 0.6,
      roughness: 0.3
    }),
    white: new THREE.MeshStandardMaterial({
      color: '#ffffff',
      metalness: 0.3,
      roughness: 0.25
    })
  };

  const parts = [];

  function addPart(mesh, explodedPosition) {
    watch.add(mesh);

    parts.push({
      mesh,
      original: mesh.position.clone(),
      exploded: new THREE.Vector3(...explodedPosition)
    });

    return mesh;
  }

  // Watch main case
  const caseMesh = new THREE.Mesh(
    new THREE.CylinderGeometry(1.55, 1.55, 0.3, 64),
    materials.silver
  );
  caseMesh.rotation.x = Math.PI / 2;
  addPart(caseMesh, [0, 0, 0]);

  // Watch dial
  const dial = new THREE.Mesh(
    new THREE.CircleGeometry(1.38, 64),
    materials.dark
  );
  dial.position.z = 0.18;
  addPart(dial, [0, 0, 1.8]);

  // Inner blue circle
  const innerDial = new THREE.Mesh(
    new THREE.CircleGeometry(1.23, 64),
    materials.blue
  );
  innerDial.position.z = 0.2;
  addPart(innerDial, [0, 0, 2.4]);

  // Hour markers
  for (let i = 0; i < 12; i++) {
    const angle = i * Math.PI / 6;

    const marker = new THREE.Mesh(
      new THREE.BoxGeometry(0.07, 0.2, 0.04),
      materials.white
    );

    marker.position.set(
      Math.sin(angle) * 1.05,
      Math.cos(angle) * 1.05,
      0.24
    );

    marker.rotation.z = -angle;
    addPart(marker, [
      Math.sin(angle) * 1.05,
      Math.cos(angle) * 1.05,
      3
    ]);
  }

  // Watch hands
  const hourHand = new THREE.Mesh(
    new THREE.BoxGeometry(0.09, 0.65, 0.05),
    materials.white
  );
  hourHand.position.set(0, 0.3, 0.3);
  addPart(hourHand, [0, 0.3, 3.6]);

  const minuteHand = new THREE.Mesh(
    new THREE.BoxGeometry(0.055, 0.95, 0.05),
    materials.white
  );
  minuteHand.position.set(0, 0.45, 0.34);
  addPart(minuteHand, [0, 0.45, 4.2]);

  // Center pin
  const centerPin = new THREE.Mesh(
    new THREE.SphereGeometry(0.11, 24, 24),
    materials.silver
  );
  centerPin.position.z = 0.4;
  addPart(centerPin, [0, 0, 4.8]);

  // Top and bottom straps
  const strapMaterial = new THREE.MeshStandardMaterial({
    color: '#163b5d',
    metalness: 0.2,
    roughness: 0.6
  });

  const topStrap = new THREE.Mesh(
    new THREE.BoxGeometry(0.85, 1.7, 0.22),
    strapMaterial
  );
  topStrap.position.y = 2.25;
  addPart(topStrap, [0, 2.8, -1.5]);

  const bottomStrap = new THREE.Mesh(
    new THREE.BoxGeometry(0.85, 1.7, 0.22),
    strapMaterial
  );
  bottomStrap.position.y = -2.25;
  addPart(bottomStrap, [0, -2.8, -1.5]);

  // Crown
  const crown = new THREE.Mesh(
    new THREE.CylinderGeometry(0.16, 0.16, 0.42, 24),
    materials.silver
  );
  crown.rotation.z = Math.PI / 2;
  crown.position.x = 1.7;
  addPart(crown, [2.3, 0, 0]);

  let exploded = false;
  let dragging = false;
  let previousX = 0;
  let previousY = 0;

  function explode() {
    exploded = true;

    parts.forEach(part => {
      part.mesh.position.copy(part.exploded);
    });
  }

  function assemble() {
    exploded = false;

    parts.forEach(part => {
      part.mesh.position.copy(part.original);
    });
  }

  canvas.addEventListener('pointerdown', event => {
    dragging = true;
    previousX = event.clientX;
    previousY = event.clientY;
    canvas.setPointerCapture(event.pointerId);
  });

  canvas.addEventListener('pointermove', event => {
    if (!dragging) return;

    const dx = event.clientX - previousX;
    const dy = event.clientY - previousY;

    watch.rotation.y += dx * 0.01;
    watch.rotation.x += dy * 0.01;

    previousX = event.clientX;
    previousY = event.clientY;
  });

  canvas.addEventListener('pointerup', () => {
    dragging = false;
  });

  canvas.addEventListener('pointercancel', () => {
    dragging = false;
  });

  function resize() {
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;

    if (!width || !height) return;

    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height);
  }

  const observer = new ResizeObserver(resize);
  observer.observe(canvas);

  function animate() {
    requestAnimationFrame(animate);

    if (!dragging && !exploded) {
      watch.rotation.y += 0.002;
    }

    renderer.render(scene, camera);
  }

  animate();

  return { explode, assemble };
}
