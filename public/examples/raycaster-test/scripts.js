import {
  GridHelper, Scene, Color, Fog, HemisphereLight,
    PointLight, MeshPhongMaterial, Mesh,
    PlaneBufferGeometry, WebGLRenderer,
    PerspectiveCamera, Raycaster, Vector2, Vector3,
    Group, BoxBufferGeometry, IcosahedronBufferGeometry,
    Cache, ReinhardToneMapping,
	LoadingManager, AxesHelper
} from 'https://cdn.jsdelivr.net/npm/three@0.126/build/three.module.js';

import Stats from "https://cdn.jsdelivr.net/npm/three@0.126/examples/jsm/libs/stats.module.js";
import { OBJLoader } from 'https://cdn.jsdelivr.net/npm/three@0.126/examples/jsm/loaders/OBJLoader.js';
import { MTLLoader } from 'https://cdn.jsdelivr.net/npm/three@0.126/examples/jsm/loaders/MTLLoader.js';
import gsap from "https://cdn.skypack.dev/gsap@3.5.1";

class Stage {
	constructor() {
		const manager = new LoadingManager();
		manager.onLoad = function () {
			console.log('Loading complete!');
			loadComplete();
			animate();
		};

		manager.onProgress = function (url, itemsLoaded, itemsTotal) {
			document.getElementById('loading').innerHTML = Math.round(itemsLoaded / itemsTotal * 100) + '% loaded';
		};

		this.models = {};
		this.stats = new Stats();

		this.presentTextures = [];
		this.presentMaterials = [];

		this.boxGeometry = new BoxBufferGeometry(1, 1, 1);
		this.greyMaterial = new MeshPhongMaterial( {color: 0xeeeeee, shininess: 30} )

		this.container;
		this.scene;
		this.plane;
		this.renderer;
		this.width = 0;
		this.height = 0;
		this.lookAtHelper;

		this.cameraTarget;
		this.camera;

		Cache.enabled = true;

		this.raycaster = new Raycaster();
		this.mouse = new Vector2();
		this.sceneObjects = [];

		this.scene = new Scene();
		this.scene.background = new Color(0x424874);
		this.scene.fog = new Fog(0x424874, 100, 200);
		this.scene.add(new AxesHelper(100));

		const gridHelper = new GridHelper(100, 10);
		gridHelper.material.transparent = true;
		this.scene.add(gridHelper);

		this.scene.add(new HemisphereLight(0xfefeff, 0xeeeeff, 0.4));

		const ambientLight = new PointLight(0xffffff, 0.1);
		ambientLight.position.set(20, -10, 20)
		this.scene.add(ambientLight);

		const shadowLight = new PointLight(0xffffff, 0.6, 100);
		shadowLight.position.set(10, 0, 4);
		shadowLight.castShadow = true;
		shadowLight.shadow.radius = 16;
		shadowLight.shadow.mapSize.width = 2048;
		shadowLight.shadow.mapSize.height = 2048;
		this.scene.add(shadowLight);

		this.plane = new Mesh(
			new PlaneBufferGeometry(1000, 1000),
			new MeshPhongMaterial({ color: 0xDCD6F7 })
		);
		this.plane.position.set(-10, -30.5, -10);
		this.plane.receiveShadow = true;
		this.plane.rotation.x = -Math.PI / 2;
		this.scene.add(this.plane);

		this.renderer = new WebGLRenderer({ antialias: true });
		this.renderer.setSize(window.innerWidth, window.innerHeight);
		this.renderer.shadowMap.enabled = true;
		this.renderer.toneMapping = ReinhardToneMapping;
		this.renderer.toneMappingExposure = 2.3;
		this.renderer.domElement.addEventListener('click', onClick, false);
		document.getElementById('reset').addEventListener('click', onButtonClick, false);
		this.renderer.domElement.addEventListener('mousemove', onMouseMove, false);

		this.container = document.getElementById('container');
		this.container.appendChild(this.renderer.domElement);
		this.container.appendChild(this.stats.dom);

		this.camera = new PerspectiveCamera(15, window.innerWidth / window.innerHeight, 5, 400);
		this.camera.position.set(35, 75, 55);
		this.cameraTarget = new Vector3(0, -20, 0);

		let center = new Vector3(0, 15, 0)
		const previewCameraDistance = 70;

		this.lights = [];

		let colors = [0xff0000, 0x00ff00, 0x0000ff, 0xffff00, 0xff00ff,  0x00ffff];

		for (let i = 0; i < 3; i++) {
			let group = new Group();
			group.position.x = 1000;

			let color = colors[Math.floor(Math.random() * colors.length)];
			let light = new PointLight(color, 0.5, 50, 1.7 );
			group.add(light);

			let geometry = new IcosahedronBufferGeometry(0.5, 4);
			let material = new MeshPhongMaterial({ color: color, wireframe: false });
			let mesh = new Mesh( geometry, material );
			mesh.castShadow = true;
			group.add(mesh);

			this.scene.add(group);
			this.lights.push(group);
		}

		let roomGroup = new Group();
		roomGroup.position.x = 10;
		roomGroup.position.y = 0;
		roomGroup.position.z = 10;
		roomGroup.rotation.y = 2.5;
		this.scene.add(roomGroup);

		const meshObjects = [];
    const materialsLoader = new MTLLoader(manager);
    materialsLoader.load('https://assets.codepen.io/238794/apartment-living-room.mtl', function (materials) {
      const objLoader = new OBJLoader(manager);
      objLoader.setMaterials(materials);
      objLoader.load('https://dl.dropboxusercontent.com/s/pace6tvc6esxuxj/apartment-living-room.obj', function (object) {
        object.traverse(function (child) {
					if (child.type === 'Mesh') {
            meshObjects.push(child);
          }
				});
        object.scale.set(2, 2, 2);
        roomGroup.add(object);
      },
      (xhr) => {},
      (error) => console.log('An error happened'));
    });

		this.sceneObjects = meshObjects;
		this.onResize();
	}

	render() {
		this.camera.lookAt(this.cameraTarget);
		this.stats.update();
		this.renderer.render(this.scene, this.camera);
	}

	onResize() {
		this.camera.aspect = window.innerWidth / window.innerHeight;
		this.camera.updateProjectionMatrix();
		this.renderer.setSize(window.innerWidth, window.innerHeight);
		this.width = window.innerWidth;
		this.height = window.innerHeight;
	}
}

let stage;
let INTERSECTED;

function loadComplete() {
	const loadingScreen = document.querySelector('#loading');
	loadingScreen.innerHTML = '';
	gsap.to(loadingScreen, {autoAlpha: 0, duration: 1.5});
}

function animate() {
	stage.render();
	requestAnimationFrame(animate);
}

function init() {
	stage = new Stage();
	window.addEventListener('resize', () => stage.onResize(), false);
}

function getIntersects(event) {
	stage.mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
	stage.mouse.y = - (event.clientY / window.innerHeight) * 2 + 1;
	stage.raycaster.setFromCamera(stage.mouse, stage.camera);
	const intersects = stage.raycaster.intersectObjects(stage.sceneObjects, true);
	return intersects;
}

function onMouseMove(event) {
	const intersects = getIntersects(event);
	if (intersects.length > 0) {
		if (INTERSECTED != intersects[0].object) {
			if (INTERSECTED && INTERSECTED.material.emissive) {
				INTERSECTED.material.emissive.setHex(INTERSECTED.currentHex);
			}
			INTERSECTED = intersects[0].object;
			if (INTERSECTED.material.emissive) {
				INTERSECTED.currentHex = INTERSECTED.material.emissive.getHex();
				INTERSECTED.material.emissive.setHex(0xfffcbb);
				document.body.style.cursor = 'pointer';
			}
		}
	} else {
		if (INTERSECTED) INTERSECTED.material.emissive.setHex(INTERSECTED.currentHex);
		INTERSECTED = null;
		document.body.style.cursor = 'default';
	}
  stage.render();
}

function onClick(event) {
	event.preventDefault();
	const intersects = getIntersects(event);

  if (intersects.length) {
		const p = intersects[0].point;
		const n = intersects[0].face && intersects[0].face.normal.clone();

		if (n) {
			n.multiplyScalar(25);
			n.add(intersects[0].point);

			const cannonTL = gsap.timeline({defaults: { ease: 'power4.easeInOut', duration: .8}});
			cannonTL.to(stage.camera.position, {x: n.x, y: n.y, z: n.z})
			cannonTL.to(stage.cameraTarget, {x: p.x, y: p.y, z: p.z, duration: .8}, 0)
		}
	}
	stage.render();
}

function onButtonClick() {
	const cannonTL = gsap.timeline({defaults: { ease: 'power4.easeInOut', duration: .8}});
	cannonTL.to(stage.camera.position, {x: 35, y: 75, z: 55})
	cannonTL.to(stage.cameraTarget, {x: 0, y: -20, z: 0, duration: 0}, 0)
}

init();
