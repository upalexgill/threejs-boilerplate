import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.126.1/build/three.module.js';
import { OrbitControls } from 'https://cdn.jsdelivr.net/npm/three@0.126/examples/jsm/controls/OrbitControls.js';
import { OBJLoader } from 'https://cdn.jsdelivr.net/npm/three@0.126.0/examples/jsm/loaders/OBJLoader.js';
import Stats from 'https://cdn.jsdelivr.net/npm/three@0.126/examples/jsm/libs/stats.module.js';

let stats, container, camera, light, controls, scene, renderer, time = 0;

init();
animate();

function init() {
  container = document.getElementById('container');
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x222);
  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.shadowMap.enabled = true;
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(window.innerWidth, window.innerHeight);
  container.appendChild(renderer.domElement);

  camera = new THREE.PerspectiveCamera(25, window.innerWidth / window.innerHeight, 1, 1000);
  camera.position.set(50, 100, 150);
  camera.lookAt(scene.position);
  camera.updateMatrixWorld();

  controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.05;
  controls.screenSpacePanning = false;
  controls.minDistance = 10;
  controls.maxDistance = 500;
  controls.maxPolarAngle = Math.PI / 2;

  const sphereGeometry = new THREE.SphereGeometry(30, 30, 30);
  const boxMaterial = new THREE.MeshPhongMaterial({
    color: 0xff00ff,
    transparent: true,
    opacity: 0.3
  });
  const mesh = new THREE.Mesh(sphereGeometry, boxMaterial);
  mesh.position.set(0, 0, 0);
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
}

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
  time++;
  requestAnimationFrame(animate);
  controls.update();

  light.position.x = Math.sin(time*0.01)*100;
  light.position.y = Math.sin(time*0.01)*100;

  renderer.clear();
  renderer.render(scene, camera);
  stats.update();
}
