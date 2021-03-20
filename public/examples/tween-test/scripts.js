import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.126.1/build/three.module.js';
import { OrbitControls } from 'https://cdn.jsdelivr.net/npm/three@0.126/examples/jsm/controls/OrbitControls.js';
import { OBJLoader } from 'https://cdn.jsdelivr.net/npm/three@0.126.0/examples/jsm/loaders/OBJLoader.js';
import Stats from 'https://cdn.jsdelivr.net/npm/three@0.126/examples/jsm/libs/stats.module.js';
import { GUI } from 'https://cdn.jsdelivr.net/npm/three@0.126/examples/jsm/libs/dat.gui.module.js';
import { TWEEN } from 'https://cdn.jsdelivr.net/npm/three@0.126/examples/jsm/libs/tween.module.min.js';

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

const planeGeometry = new THREE.PlaneGeometry(30, 30);
const planeMaterial = new THREE.MeshPhongMaterial({color: 0xffffff});
const plane = new THREE.Mesh(planeGeometry, planeMaterial);
plane.receiveShadow = true;
plane.rotation.x = -0.5 * Math.PI;
plane.position.x = 0;
plane.position.y = 0;
plane.position.z = 0;
scene.add(plane);

const boxGeometry = new THREE.BoxGeometry(30, 30, 30);
const boxMaterial = new THREE.MeshPhongMaterial({
  color: 0xff00ff,
  transparent: true,
  opacity: 0.3
});
const mesh = new THREE.Mesh(boxGeometry, boxMaterial);
mesh.position.set(0, 15, 0);
scene.add(mesh);

light = buildLights(scene);

const loader = new OBJLoader();
loader.load(
  'standard-female-figure.obj',
  function (object ) {
    object.traverse( function (obj) {
      if (obj.isMesh){
        obj.material.color.set(0xFFFFFF);
        obj.castShadow = true;
        obj.receiveShadow = true;
      }
    });
    object.scale.set(1, 1, 1);
    object.position.set(0, 0, 0);
    scene.add(object);
  },
  function (xhr) {
    console.log((xhr.loaded / xhr.total * 100) + '% loaded');
  },
  function (err) {
    console.error('An error happened');
  });

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
  TWEEN.update();
}

animate();

const birdsEyeButton = document.getElementById('birds-eye')
birdsEyeButton.addEventListener('click', () => {
  faceOnButton.classList.remove('is-active');
  birdsEyeButton.classList.add('is-active');
  const coords = { x: camera.position.x, y: camera.position.y };
  new TWEEN.Tween(coords)
    .to({ x: 30, y: 30 })
    .onUpdate(() =>
      camera.position.set(coords.x, coords.y, camera.position.z)
    )
    .start();
});

const faceOnButton = document.getElementById('face-on')
faceOnButton.addEventListener('click', ({ currentTarget }) => {
  birdsEyeButton.classList.remove('is-active');
  faceOnButton.classList.add('is-active');
  const coords = { x: camera.position.x, y: camera.position.y, z: camera.position.z };
  new TWEEN.Tween(coords)
    .to({ x: 1, y: 25, z: 30 })
    .onUpdate(() =>
      camera.position.set(coords.x, coords.y, coords.z)
    )
    .start();
});
