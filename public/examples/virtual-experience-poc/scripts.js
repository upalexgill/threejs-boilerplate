import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.126/build/three.module.js';
import { OrbitControls } from 'https://cdn.jsdelivr.net/npm/three@0.126/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from "https://cdn.jsdelivr.net/npm/three@0.126/examples/jsm/loaders/GLTFLoader.js";;

let camera, light, controls, scene, renderer;
let gifLoader = document.getElementById("gif-loader");

init();
animate();

function init() {
	scene = new THREE.Scene();
	scene.background = new THREE.Color(0x000000);
	renderer = new THREE.WebGLRenderer({ antialias: true });
  // renderer.shadowMap.enabled = true;
	renderer.setPixelRatio(window.devicePixelRatio);
	renderer.setSize(window.innerWidth, window.innerHeight);
	document.body.appendChild(renderer.domElement);

  camera = new THREE.PerspectiveCamera(10, window.innerWidth / window.innerHeight, 1, 1000);
  camera.position.set(10, 50, 50);

  controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.05;
  controls.screenSpacePanning = false;
  controls.minDistance = 100;
  controls.maxDistance = 500;
  controls.maxPolarAngle = Math.PI / 2;

  let hemiLight = new THREE.HemisphereLight(0xffffff, 0xffffff, 0.61);
  hemiLight.position.set(0, 50, 0);
  scene.add(hemiLight);

  let d = 8.25;
  let dirLight = new THREE.DirectionalLight(0xffffff, 0.54);
  dirLight.position.set(-8, 12, 8);
  dirLight.castShadow = true;
  dirLight.shadow.mapSize = new THREE.Vector2(1024, 1024);
  dirLight.shadow.camera.near = 0.1;
  dirLight.shadow.camera.far = 1500;
  dirLight.shadow.camera.left = d * -1;
  dirLight.shadow.camera.right = d;
  dirLight.shadow.camera.top = d;
  dirLight.shadow.camera.bottom = d * -1;
  scene.add(dirLight);

  const pointLightHelper = new THREE.PointLightHelper(dirLight);
  scene.add(pointLightHelper);


 let loader = new GLTFLoader();
    loader.load(
      'https://dl.dropboxusercontent.com/s/qap2d6wiqls2f2m/stall_v001.glb',
      function (gltf) {
        let model = gltf.scene;
        let fileAnimations = gltf.animations;

        model.traverse((o) => {
          if (o.isMesh) {
            // o.castShadow = true;
            // o.receiveShadow = true;
          }
        });
        model.scale.set(2, 2, 2);
        model.position.x = -15;
        model.position.z = 10;
        scene.add(model);
        gifLoader.remove();
      },
      function (xhr) {
        // console.log((xhr.loaded / xhr.total * 100) + '% loaded')
        console.log('Model loading...');
      },
      function (error) {
        console.error(error);
      }
    );

  window.addEventListener('resize', onWindowResize);

  const helper = new THREE.GridHelper(50, 50);
  helper.material.transparent = true;
  scene.add(helper);

  const axisHelper = new THREE.AxesHelper(100);
  scene.add(axisHelper);
}

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

function animate() {
  requestAnimationFrame(animate);
  controls.update();
  render();
}

function render() {
  renderer.render(scene, camera);
}
