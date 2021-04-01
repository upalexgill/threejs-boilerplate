import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.126/build/three.module.js';
import { OrbitControls } from 'https://cdn.jsdelivr.net/npm/three@0.126/examples/jsm/controls/OrbitControls.js';
import Stats from 'https://cdn.jsdelivr.net/npm/three@0.126/examples/jsm/libs/stats.module.js';
import { GUI } from 'https://cdn.jsdelivr.net/npm/three@0.126/examples/jsm/libs/dat.gui.module.js';

var stats, container, camera, light, controls, scene, renderer;

container = document.getElementById('container');
scene = new THREE.Scene();
scene.background = new THREE.Color(0x222);
renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.shadowMap.enabled = true;
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);
container.appendChild(renderer.domElement);

camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 1, 1000);
camera.position.set(30, 30, 30);
camera.rotation.set(-3.14, -0.44, -3.14);
camera.lookAt(scene.position);
camera.updateMatrixWorld();

controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.05;
controls.screenSpacePanning = false;
controls.minDistance = 10;
controls.maxDistance = 100;
controls.maxPolarAngle = Math.PI / 2;

light = buildLights(scene);

window.addEventListener('resize', onWindowResize);

const gridHelper = new THREE.GridHelper(100, 10);
gridHelper.material.transparent = true;
scene.add(gridHelper);

const pointLightHelper = new THREE.PointLightHelper(light);
scene.add(pointLightHelper);

const axisHelper = new THREE.AxesHelper(100);
scene.add(axisHelper);

stats = new Stats();
container.appendChild(stats.dom);

const data = {
  cameraXPos: camera.position.x,
  cameraYPos: camera.position.y,
  cameraZPos: camera.position.z
};

var gui = new GUI();

function move(object, axis, value){
  object.position[axis] = value;
}

const folder = gui.addFolder('THREE.PerspectiveCamera');
folder.add(data, 'cameraXPos', 1, 30).onChange(function(value){move(camera, 'x', value)});
folder.add(data, 'cameraYPos', 1, 30).onChange(function(value){move(camera, 'y', value)});
folder.add(data, 'cameraZPos', 1, 30).onChange(function(value){move(camera, 'z', value)});

function buildLights(scene) {
  var light = new THREE.SpotLight("#fff", 1);
  light.position.y = 100;
  light.angle = 1.05;
  light.decacy = 2;
  light.penumbra = 1;
  light.shadow.camera.near = 10;
  light.shadow.camera.far = 1000;
  light.shadow.camera.fov = 30;
  scene.add(light);
  return light;
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
  stats.update();
}

animate();
