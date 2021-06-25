import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.126/build/three.module.js';
import { OrbitControls } from 'https://cdn.jsdelivr.net/npm/three@0.126/examples/jsm/controls/OrbitControls.js';

let scene, renderer, camera, controls;
init();
animate();

function init() {
	scene = new THREE.Scene();
  scene.background = new THREE.Color(0x000000);

  renderer = new THREE.WebGLRenderer();
	renderer.setSize(window.innerWidth, window.innerHeight);
	document.querySelector('#container').appendChild(renderer.domElement);

  camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 1, 1100);
  camera.position.x = 0.1;
  camera.target = new THREE.Vector3(0, 0, 0);

  controls = new OrbitControls(camera, renderer.domElement);
  controls.enablePan = false;
  controls.enableZoom = false;
  controls.autoRotate = true;
  controls.autoRotateSpeed = 0.5;
  controls.maxPolarAngle = 2; // Radians.
  controls.minPolarAngle = 1; // Radians.

  const geometry = new THREE.SphereGeometry(500, 60, 40);
  geometry.scale(-1, 1, 1);

  const material = new THREE.MeshBasicMaterial({
    map: new THREE.TextureLoader().load('360.jpeg')
  });

  const mesh = new THREE.Mesh(geometry, material);
  scene.add(mesh);
}

let deltaCount = 0;
function onDocumentMouseWheel(e) {
  function mouseWheel() {
    camera.fov -= e.wheelDeltaY * 0.05;
    camera.fov = Math.max(40, Math.min(100, camera.fov));
  }

  if (e.deltaY < 0) {
    if (deltaCount < 6) {
      mouseWheel();
      deltaCount += 1;
    }
  } else {
    if (deltaCount > 0) {
      mouseWheel();
      deltaCount -= 1;
    }
  }
  camera.updateProjectionMatrix();
}


function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

function animate() {
  requestAnimationFrame(animate);
  controls.update();
  renderer.render(scene, camera);
}

document.addEventListener('mousewheel', onDocumentMouseWheel, false);
window.addEventListener('resize', onWindowResize, false);
