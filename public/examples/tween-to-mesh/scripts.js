import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.126/build/three.module.js';
import { OrbitControls } from 'https://cdn.jsdelivr.net/npm/three@0.126/examples/jsm/controls/OrbitControls.js';
import Stats from 'https://cdn.jsdelivr.net/npm/three@0.126/examples/jsm/libs/stats.module.js';
import { TWEEN } from 'https://cdn.jsdelivr.net/npm/three@0.126/examples/jsm/libs/tween.module.min.js';
import { OBJLoader } from 'https://cdn.jsdelivr.net/npm/three@0.126/examples/jsm/loaders/OBJLoader.js';

let stats, container, camera, light, controls, scene, renderer, tween;
let meshes = [];
const objects = [];
let INTERSECTED;

container = document.getElementById('container');

scene = new THREE.Scene();
scene.background = new THREE.Color(0x000104);
scene.fog = new THREE.FogExp2(0x000104, 0.0000675);
buildScene();

renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.shadowMap.enabled = true;
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.domElement.addEventListener('click', onClick, true);
renderer.domElement.addEventListener('mousemove', onMouseMove, false);
container.appendChild(renderer.domElement);

parent = new THREE.Object3D();
scene.add(parent);

camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.01, 100000);
camera.position.z = 10;
camera.position.y = 5;

controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.5;
controls.addEventListener('end', () => updateCameraOrbit());
updateCameraOrbit();

light = buildLights(scene);

window.addEventListener('resize', onWindowResize);

const pointLightHelper = new THREE.PointLightHelper(light);
scene.add(pointLightHelper);

const axisHelper = new THREE.AxesHelper(100);
scene.add(axisHelper);

stats = new Stats();
container.appendChild(stats.dom);

function updateCameraOrbit() {
  const forward = new THREE.Vector3();
  camera.getWorldDirection(forward);
  controls.target.copy(camera.position).add(forward);
};

function buildScene() {
  var planeGeometry = new THREE.PlaneGeometry(100, 100, 50, 50);
  var material = new THREE.MeshBasicMaterial({
    color: 0xffffff,
    wireframe: true
  });
  var plane = new THREE.Mesh(planeGeometry, material);
  plane.rotateX(-Math.PI / 2);
  scene.add(plane);

  const loader = new OBJLoader();
  loader.load('https://dl.dropboxusercontent.com/s/b9yijroqqteq661/dennis-posed-004.obj', function (object) {
    object.traverse(function (child) {
      if (child.isMesh) {
        for (let i = 0; i < 20; i++) {
          const mesh = new THREE.Mesh(child.geometry, child.material);
          meshes.push(mesh);
        }
      }
    });

    meshes.forEach((mesh, index) => {
      mesh.material.color.set(Math.random() * 0xffffff);
      mesh.scale.set(3, 3, 3);
      mesh.position.x = Math.random() * 100 - 50;
      mesh.position.z = Math.random() * 100 - 50;
      scene.add(mesh);
    });
  });
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
  requestAnimationFrame(animate);
  controls.update();
  renderer.render(scene, camera);
  stats.update();
  TWEEN.update();
}

animate();

function getIntersects(event) {
  const raycaster = new THREE.Raycaster();
  const mouse = new THREE.Vector2();
	mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
	mouse.y = - (event.clientY / window.innerHeight) * 2 + 1;
	raycaster.setFromCamera(mouse, camera);
	const intersects = raycaster.intersectObjects(meshes, true);
	return intersects;
}

function onClick(event) {
  let selectedObject;
  const intersects = getIntersects(event);
  if (intersects.length > 0) {
    selectedObject = intersects[0];

    var cameraPosition = camera.position.clone();
    console.log("cameraPosition :  ", logVector3(cameraPosition));

    var targetPosition = selectedObject.object.position.clone();
    console.log("targetPosition :  ", logVector3(targetPosition));

    var distance = cameraPosition.sub(targetPosition);
    console.log("distance :  ", logVector3(distance));

    var direction = distance.normalize();
    console.log("direction :  ", logVector3(direction));

    var offset = distance.clone().sub(direction.multiplyScalar(10.0));
    console.log("offset :  ", logVector3(offset));

    var newPos = selectedObject.object.position.clone().sub(offset);
    newPos.y = camera.position.y;

    tween = new TWEEN.Tween(camera.position).to(
      {
        x: newPos.x,
        y: newPos.y,
        z: newPos.z
      },
      2000
    );

    tween.easing(TWEEN.Easing.Quadratic.Out);
    tween.start();
    tween.onUpdate(function () {
      updateCameraOrbit();
    }.bind(this));
    tween.onComplete(function () {
      updateCameraOrbit();
    }.bind(this));
  }
}

function onMouseMove(event) {
	const intersects = getIntersects(event);
	if (intersects.length > 0) {
		if (INTERSECTED != intersects[0].object) {
			INTERSECTED = intersects[0].object;
			document.body.style.cursor = 'pointer';
		}
	} else {
		INTERSECTED = null;
		document.body.style.cursor = 'default';
	}
}

function logVector3(pos) {
  if (pos.x || pos.x === 0) {
    return "x:  " + pos.x + "  /  y:  " + pos.y + "  /  z:  " + pos.z;
  } else {
    return pos;
  }
}
