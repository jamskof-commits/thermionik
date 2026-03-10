const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const brand = document.getElementById('brand-text');

// PHYSICS CONSTANTS
const LIFT = 0.00025;
const VORTEX = 0.0008;
const FRICTION = 0.982;

let mX = 50, mY = 50, cX = 50, cY = 50;

window.addEventListener('mousemove', (e) => {
  mX = (e.clientX / window.innerWidth) * 100;
  mY = (e.clientY / window.innerHeight) * 100;
});

window.addEventListener('touchmove', (e) => {
  mX = (e.touches[0].clientX / window.innerWidth) * 100;
  mY = (e.touches[0].clientY / window.innerHeight) * 100;
}, { passive: false });

const count = 10000; 
const geo = new THREE.BufferGeometry();
const pos = new Float32Array(count * 3);
const vel = new Float32Array(count * 3);

for (let i = 0; i < count * 3; i++) {
  pos[i] = (Math.random() - 0.5) * 40;
  vel[i] = 0;
}

geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));

// PARTICLES ARE 100% BIGGER HERE (0.045)
const mat = new THREE.PointsMaterial({ 
  size: 0.045, 
  transparent: true, 
  opacity: 0.4, 
  blending: THREE.AdditiveBlending, 
  color: 0xffcc88 
});

const points = new THREE.Points(geo, mat);
scene.add(points);
camera.position.z = 12;

function animate() {
  requestAnimationFrame(animate);
  
  // Update Light Position for CSS
  cX += (mX - cX) * 0.025; 
  cY += (mY - cY) * 0.025;
  if (brand) {
    brand.style.setProperty('--lX', cX + '%');
    brand.style.setProperty('--lY', cY + '%');
  }

  const p = points.geometry.attributes.position.array;
  const time = Date.now() * 0.0005;

  const clusterX = (cX / 100 - 0.5) * 35;
  const clusterY = -(cY / 100 - 0.5) * 25;

  for (let i = 0; i < count; i++) {
    const i3 = i * 3;
    
    // Clustering Logic
    const dx = p[i3] - clusterX;
    const dy = p[i3 + 1] - clusterY;
    const distSq = dx * dx + dy * dy;
    
    if (distSq < 64) { 
      const pull = (8 - Math.sqrt(distSq)) * 0.0004;
      vel[i3] -= dy * pull;
      vel[i3 + 1] += dx * pull;
    }

    // Base Physics
    vel[i3] += Math.sin(p[i3 + 2] * 0.1 + time) * VORTEX;
    vel[i3 + 1] += LIFT;
    vel[i3] *= FRICTION;
    vel[i3 + 1] *= FRICTION;
    
    p[i3] += vel[i3];
    p[i3 + 1] += vel[i3 + 1];

    // Near Clip & Wrap
    if (p[i3 + 2] > 7.5) p[i3 + 2] = -12; 
    if (p[i3 + 1] > 18) p[i3 + 1] = -18;
  }
  
  points.geometry.attributes.position.needsUpdate = true;
  renderer.render(scene, camera);
}

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

animate();
