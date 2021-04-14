import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.126/build/three.module.js';
import { OrbitControls } from 'https://cdn.jsdelivr.net/npm/three@0.126/examples/jsm/controls/OrbitControls.js';
import Stats from 'https://cdn.jsdelivr.net/npm/three@0.126/examples/jsm/libs/stats.module.js';
import { OBJLoader } from 'https://cdn.jsdelivr.net/npm/three@0.126/examples/jsm/loaders/OBJLoader.js';
import { MTLLoader } from 'https://cdn.jsdelivr.net/npm/three@0.126/examples/jsm/loaders/MTLLoader.js';
import { CSS2DRenderer, CSS2DObject } from 'https://cdn.jsdelivr.net/npm/three@0.126/examples/jsm/renderers/CSS2DRenderer.js';

let stats, container, camera, light, controls, scene, renderer, labelRenderer, mesh, label, labelBehindObject;
THREE.Cache.enabled = true;

function loadComplete() {
  const loadingScreen = document.getElementById('loader');
  loadingScreen.remove();

  const pos = new THREE.Vector3(5, 0, 0);
  const div = document.createElement('div');
  div.className = 'label';
  div.innerHTML = '<h2>Ferrari Formula 1</h2>';
  label = new CSS2DObject(div);
  label.position.copy(pos);
  mesh.add(label);

  animate();
}

const manager = new THREE.LoadingManager();
manager.onLoad = loadComplete;

container = document.getElementById('container');
scene = new THREE.Scene();
scene.background = new THREE.Color(0x111);
buildScene();

renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.shadowMap.enabled = true;
renderer.toneMapping = THREE.ReinhardToneMapping;
renderer.toneMappingExposure = 2;
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);
container.appendChild(renderer.domElement);

labelRenderer = new CSS2DRenderer();
labelRenderer.setSize(window.innerWidth, window.innerHeight);
labelRenderer.domElement.style.position = 'absolute';
labelRenderer.domElement.style.top = '0px';
document.body.appendChild(labelRenderer.domElement);

camera = new THREE.PerspectiveCamera(25, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(50, 50, 50);
camera.lookAt(scene.position);
camera.updateMatrixWorld();

controls = new OrbitControls(camera, labelRenderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.5;
controls.maxDistance = 250;

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

function buildScene() {
  const planeGeometry = new THREE.PlaneGeometry(100, 100, 50, 50);
  const material = new THREE.MeshBasicMaterial({ color: 0x000000 });
  const plane = new THREE.Mesh(planeGeometry, material);
  plane.rotateX(-Math.PI / 2);
  scene.add(plane);

  const materialsLoader = new MTLLoader(manager);
  materialsLoader.load('//assets.codepen.io/238794/Formula_1_mesh.mtl', function (materials) {
    const objLoader = new OBJLoader(manager);
    objLoader.setMaterials(materials);
    objLoader.load('//dl.dropbox.com/s/3n80c1fh674zm7p/Formula_1_mesh.obj', function (object) {
      object.traverse(child => {
        if (child.isMesh) {
          mesh = child;
        }
      });
      object.rotation.set(0, 2, 0);
      object.scale.set(0.1, 0.1, 0.1);
      scene.add(object)
    },
    (xhr) => {},
    (error) => console.log('An error happened'));
  });
}

function buildLights(scene) {
  let hemiLight = new THREE.HemisphereLight(0xffeeb1, 0x080820, 1);
  scene.add(hemiLight);

  const light = new THREE.SpotLight('#fff', 1);
  light.position.y = 100;
  light.castShadow = true;
  light.shadow.bias = -0.0001;
  light.shadow.mapSize.width = 1024*4;
  light.shadow.mapSize.height = 1024*4;
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
  labelRenderer.setSize(window.innerWidth, window.innerHeight);
}

function updateAnnotationOpacity() {
  const meshDistance = camera.position.distanceTo(mesh.position);
  const labelDistance = camera.position.distanceTo(label.position);
  labelBehindObject = labelDistance > meshDistance;
  label.element.style.opacity = labelBehindObject ? 0.25 : 1;
}

function animate() {
  requestAnimationFrame(animate);
  if (controls) controls.update();
  if (renderer) renderer.render(scene, camera);
  if (labelRenderer) labelRenderer.render(scene, camera);
  if (stats) stats.update();
  if (mesh && label) {
    updateAnnotationOpacity();
  }
}
