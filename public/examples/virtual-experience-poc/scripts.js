import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.126/build/three.module.js';
import { OrbitControls } from 'https://cdn.jsdelivr.net/npm/three@0.126/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from "https://cdn.jsdelivr.net/npm/three@0.126/examples/jsm/loaders/GLTFLoader.js";

let camera, light, controls, scene, renderer;
let gifLoader = document.getElementById("gif-loader");
init();
animate();

function init() {
	scene = new THREE.Scene();
	scene.background = new THREE.Color(0xdddddd);
	renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.shadowMap.enabled = true;
  renderer.toneMapping = THREE.ReinhardToneMapping;
  renderer.toneMappingExposure = 2.3;
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
  controls.enableZoom = false;

let hemiLight = new THREE.HemisphereLight(0xffeeb1, 0x080820, 4);
scene.add(hemiLight);

light = new THREE.SpotLight(0xffa95c,4);
light.position.set(-50,50,50);
light.castShadow = true;
light.shadow.bias = -0.0001;
light.shadow.mapSize.width = 1024*4;
light.shadow.mapSize.height = 1024*4;
scene.add(light);



 let loader = new GLTFLoader();
    loader.load(
      'https://dl.dropboxusercontent.com/s/qap2d6wiqls2f2m/stall_v001.glb',
      function (gltf) {
        let model = gltf.scene;
        let fileAnimations = gltf.animations;

        model.traverse((o) => {
          if (o.isMesh) {
            o.castShadow = true;
            o.receiveShadow = true;
            if (o.material.map) o.material.map.anisotropy = 16;
          }


        });
        model.scale.set(2, 2, 2);
        model.position.x = -15;
        model.position.y = -6;
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
 // scene.add(helper);

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
  light.position.set(
    camera.position.x + 10,
    camera.position.y + 10,
    camera.position.z + 10,
  );
  render();
}

function render() {
  renderer.render(scene, camera);
}
