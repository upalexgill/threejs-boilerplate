import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.126/build/three.module.js';
import { OrbitControls } from 'https://cdn.jsdelivr.net/npm/three@0.126/examples/jsm/controls/OrbitControls.js';
import { OBJLoader } from 'https://cdn.jsdelivr.net/npm/three@0.126.0/examples/jsm/loaders/OBJLoader.js';

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

const renderer = new THREE.WebGLRenderer();
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableKeys = false;
controls.maxDistance = 5000.0;
controls.enableDamping = true;
controls.dampingFactor = 0.16;
controls.target.set(0, 0, 0);

camera.position.set(0, 5, 0);
controls.update();

document.body.appendChild(renderer.domElement);

THREE.ImageUtils.crossOrigin = '';
const texture = THREE.ImageUtils.loadTexture('Pfizer_new_2021.jpeg');
texture.anisotropy = renderer.getMaxAnisotropy();

const cubeGeometry = new THREE.BoxGeometry(2, 2, 2);
let materials = [];
for(let counter = 0; counter < 6; counter++) {
  materials.push(new THREE.MeshBasicMaterial({color: 'white',  map: texture}));
}

var cube = new THREE.Mesh(cubeGeometry, materials);
scene.add(cube);

var animate = function () {
  requestAnimationFrame( animate );
  cube.rotation.x += 0.01;
  cube.rotation.y += 0.01;
  renderer.render(scene, camera);
};

animate();
