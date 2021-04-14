import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.126/build/three.module.js';
import { OrbitControls } from 'https://cdn.jsdelivr.net/npm/three@0.126/examples/jsm/controls/OrbitControls.js';
import Stats from 'https://cdn.jsdelivr.net/npm/three@0.126/examples/jsm/libs/stats.module.js';
import { OBJLoader } from 'https://cdn.jsdelivr.net/npm/three@0.126/examples/jsm/loaders/OBJLoader.js';
import { MTLLoader } from 'https://cdn.jsdelivr.net/npm/three@0.126/examples/jsm/loaders/MTLLoader.js';

let stats, container, camera, light, controls, scene, renderer, mesh, meshPosition, label, sprite, spritePosition, spriteBehindObject;
THREE.Cache.enabled = true;

function loadComplete() {
  const loadingScreen = document.getElementById('loader');
  loadingScreen.remove();

  label = document.querySelector('.label');

  const hotSpotTexture = new THREE.CanvasTexture(document.querySelector('#hotspot-1'));

  const spriteMaterial = new THREE.SpriteMaterial({
    map: hotSpotTexture,
    alphaTest: 0.5,
    transparent: true,
    depthTest: false,
    depthWrite: false
  });

  meshPosition = new THREE.Vector3();
  meshPosition.setFromMatrixPosition(mesh.matrixWorld);

  sprite = new THREE.Sprite(spriteMaterial);
  sprite.position.copy(meshPosition);
  sprite.scale.set(60, 60, 1);
  scene.add(sprite);

  animate();
}

const manager = new THREE.LoadingManager();
manager.onLoad = loadComplete;

container = document.getElementById('container');
scene = new THREE.Scene();
scene.background = new THREE.Color(0x111);
const loader = new THREE.TextureLoader();
loader.load('//assets.codepen.io/238794/Lake.jpg' , function(texture) {
  scene.background = texture;
});

buildScene();

renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.shadowMap.enabled = true;
renderer.toneMapping = THREE.ReinhardToneMapping;
renderer.toneMappingExposure = 2;
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);
container.appendChild(renderer.domElement);

camera = new THREE.PerspectiveCamera(25, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(50, 50, 50);
camera.lookAt(scene.position);
camera.updateMatrixWorld();

controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.5;
controls.maxDistance = 200;

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

function buildLights(scene) {
  const hemiLight = new THREE.HemisphereLight(0xffeeb1, 0x080820, 1);
  scene.add(hemiLight);

  const light = new THREE.SpotLight('#fff', 1);
  light.position.y = 50;
  light.castShadow = true;
  light.shadow.bias = -0.0001;
  light.shadow.mapSize.width = 2048;
  light.shadow.mapSize.height = 2048;
  scene.add(light);
  return light;
}

function buildScene() {
  const materialsLoader = new MTLLoader(manager);
  materialsLoader.load('//assets.codepen.io/238794/Mountain_Bike.mtl', function (materials) {
    const objLoader = new OBJLoader(manager);
    objLoader.setMaterials(materials);
    objLoader.load('//dl.dropbox.com/s/ndnxljza18eute4/Mountain_Bike.obj', function (object) {
      object.traverse(child => {
        if (child.isMesh) {
          if (child.name == 'pedal_kiri_Cube.007') {
            mesh = child;
          }
          child.castShadow = true;
          child.receiveShadow = true;
        }
      });
      object.position.set(10, 0, 15);
      object.rotation.set(0, 3, 0);
      object.scale.set(3, 3, 3);
      scene.add(object);
    },
    (xhr) => {},
    (error) => console.log('An error happened'));
  });
}

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

function updateAnnotationOpacity() {
  const spritePosition = new THREE.Vector3();
  sprite.getWorldPosition(spritePosition);

  const spriteDistance = camera.position.distanceTo(spritePosition);
  const meshDistance = camera.position.distanceTo(meshPosition);

  spriteBehindObject = spriteDistance > meshDistance;
  sprite.material.opacity = spriteBehindObject ? 0.25 : 1;
}

function updateScreenPosition() {
  const vector = new THREE.Vector3(10, 15, 15);
  const canvas = renderer.domElement;

  vector.project(camera);

  vector.x = Math.round((0.5 + vector.x / 2) * (canvas.width / window.devicePixelRatio));
  vector.y = Math.round((0.5 - vector.y / 2) * (canvas.height / window.devicePixelRatio));

  label.style.top = `${vector.y}px`;
  label.style.left = `${vector.x}px`;
  label.style.opacity = spriteBehindObject ? 0.25 : 1;
}


function animate() {
  requestAnimationFrame(animate);
  if (controls) controls.update();
  if (renderer) renderer.render(scene, camera);
  if (stats) stats.update();
  if (mesh && label) {
    updateAnnotationOpacity();
    updateScreenPosition()
  }
}
