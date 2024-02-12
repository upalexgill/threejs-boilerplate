import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.126/build/three.module.js';

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x2f3640);
scene.fog = new THREE.FogExp2(0x2f3640, 0.04);

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 2.74, 8);

const light = new THREE.DirectionalLight(0xffffff, 1);
light.position.set(-100, 120, 300);
light.castShadow = true;
light.shadow.camera.top = 200;
light.shadow.camera.bottom = -200;
light.shadow.camera.right = 200;
light.shadow.camera.left = -200;
light.shadow.mapSize.set(4096, 4096);
scene.add(light);
scene.add(new THREE.AmbientLight(0xffffff, 0.5))

const renderer = new THREE.WebGLRenderer({
  alpha: true,
  antialias: true
});
renderer.shadowMap.enabled = true;
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

class Box extends THREE.Mesh {
  constructor({
    width,
    height,
    depth,
    velocity = {
      x: 0,
      y: 0,
      z: 0
    },
    position = {
      x: 0,
      y: 0,
      z: 0
    },
    zAcceleration = false,
    geomtry,
    material,
  }) {
    super(geomtry, material)

    this.width = width;
    this.height = height;
    this.depth = depth;

    this.position.set(position.x, position.y, position.z);

    this.right = this.position.x + this.width / 2;
    this.left = this.position.x - this.width / 2;
    this.bottom = this.position.y - this.height / 2;
    this.top = this.position.y + this.height / 2;
    this.front = this.position.z + this.depth / 2;
    this.back = this.position.z - this.depth / 2;

    this.velocity = velocity;
    this.gravity = -0.002;

    this.zAcceleration = zAcceleration;
  }

  updateSides() {
    this.right = this.position.x + this.width / 2;
    this.left = this.position.x - this.width / 2;
    this.bottom = this.position.y - this.height / 2;
    this.top = this.position.y + this.height / 2;
    this.front = this.position.z + this.depth / 2;
    this.back = this.position.z - this.depth / 2;
  }

  update(plane) {
    this.updateSides();

    if (this.zAcceleration) this.velocity.z += 0.0003;

    this.position.x += this.velocity.x;
    this.position.z += this.velocity.z;

    this.applyGravity(plane);
  }

  applyGravity(plane) {
    this.velocity.y += this.gravity;

    if (boxCollision({ box1: this, box2: plane })) {
      const friction = 0.5;
      this.velocity.y *= friction;
      this.velocity.y = -this.velocity.y;
    } else {
      this.position.y += this.velocity.y;
    }
  }
}

let plane;
let character;
let obstacle;
let frames = 0;
let spawnRate = 10;
let stopAnimate = false;
const obstacles = [];
const message = document.querySelector('.message');
const keys = {
  left: { pressed: false },
  right: { pressed: false },
  down: { pressed: false },
  up: { pressed: false }
}

function createPlane() {
  const planeGeometry = new THREE.PlaneGeometry(15, 100, 50, 50);
  const material = new THREE.MeshPhongMaterial({ color: 0xffffff });
  plane = new THREE.Mesh(planeGeometry, material);

  plane.rotateX(-Math.PI / 2);
  plane.width = 14.25;
  plane.height = 0.5;
  plane.depth = 100;
  plane.position.set(0, -2, 0);
  plane.velocity = { x: 0, y: 0, z: 0 };
  plane.gravity = -0.002;

  plane.right = plane.position.x + plane.width / 2;
  plane.left = plane.position.x - plane.width / 2;
  plane.bottom = plane.position.y - plane.height / 2;
  plane.top = plane.position.y + plane.height / 2;
  plane.front = plane.position.z + plane.depth / 2;
  plane.back = plane.position.z - plane.depth / 2;

  plane.receiveShadow = true;
  scene.add(plane);
}

function createCharacter() {
  const geomtry = new THREE.BoxGeometry(1, 1, 1);
  const textureLoader = new THREE.TextureLoader();
  const texture = textureLoader.load('https://assets.codepen.io/238794/logo-pfizer.png');
  texture.anisotropy = renderer.capabilities.getMaxAnisotropy()
  let materials = [];
  for (let counter = 0; counter < 6; counter++) {
    materials.push(new THREE.MeshBasicMaterial({ color: 'white', map: texture }));
  }
  character = new Box({
    width: 1,
    height: 1,
    depth: 1,
    velocity: {
      x: 0,
      y: -0.01,
      z: 0
    },
    geomtry,
    material: materials,
  });
  character.castShadow = true;
  scene.add(character);
  const edgesGeometry = new THREE.EdgesGeometry(geomtry);
  const lineBasicMaterial = new THREE.LineBasicMaterial({ color: 0x000000 });
  const wireframe = new THREE.LineSegments(edgesGeometry, lineBasicMaterial);
  character.add(wireframe);
}

function createObstacle() {
  const geomtry = new THREE.BoxGeometry(1, 1, 1);
  const textureLoader = new THREE.TextureLoader();
  const texture = textureLoader.load('https://assets.codepen.io/238794/corona-virus.png');
  texture.anisotropy = renderer.capabilities.getMaxAnisotropy();
  let materials = [];
  for (let counter = 0; counter < 6; counter++) {
    materials.push(new THREE.MeshBasicMaterial({ color: '#fc7271', map: texture }));
  }

  obstacle = new Box({
    width: 1,
    height: 1,
    depth: 1,
    position: {
      x: (Math.random() - 0.5) * 14,
      y: 0,
      z: -50
    },
    velocity: {
      x: 0,
      y: 0,
      z: 0.005
    },
    zAcceleration: true,
    geomtry,
    material: materials
  })
  obstacle.castShadow = true;
  scene.add(obstacle);
  const edgesGeometry = new THREE.EdgesGeometry(geomtry);
  const lineBasicMaterial = new THREE.LineBasicMaterial({ color: '#8b2429' });
  const wireframe = new THREE.LineSegments(edgesGeometry, lineBasicMaterial);
  obstacle.add(wireframe);
  obstacles.push(obstacle);
}

function boxCollision({ box1, box2 }) {
  const xCollision = box1.right >= box2.left && box1.left <= box2.right;
  const yCollision =
    box1.bottom + box1.velocity.y <= box2.top && box1.top >= box2.bottom
  const zCollision = box1.front >= box2.back && box1.back <= box2.front;
  return xCollision && yCollision && zCollision;
}

const onKeydown = (event) => {
  switch (event.key) {
    case 'ArrowLeft':
      keys.left.pressed = true;
      break;
    case 'ArrowRight':
      keys.right.pressed = true;
      break;
    case 'ArrowDown':
      keys.down.pressed = true;
      break;
    case 'ArrowUp':
      keys.up.pressed = true;
      break;
    // case ' ':
    //   character.velocity.y = 0.08;
    //   break;
  }
}

const onKeyup = (event) => {
  switch (event.key) {
    case 'ArrowLeft':
      keys.left.pressed = false;
      break;
    case 'ArrowRight':
      keys.right.pressed = false;
      break;
    case 'ArrowDown':
      keys.down.pressed = false;
      break;
    case 'ArrowUp':
      keys.up.pressed = false;
      break;
  }
}

function checkLeavingPlane(character, plane) {
  const leavingLeft = (character.left + character.width) < plane.left;
  const leavingRight = character.right > (plane.right + character.width);
  return leavingLeft || leavingRight;
}

function animate() {
  const animationId = !stopAnimate && requestAnimationFrame(animate);
  renderer.render(scene, camera);

  character.velocity.x = 0;
  character.velocity.z = 0;
  if (keys.left.pressed) {
    character.velocity.x = -0.05;
  } else if (keys.right.pressed) {
    character.velocity.x = 0.05;
  }

  if (keys.down.pressed) {
    character.velocity.z = 0.05;
  } else if (keys.up.pressed) {
    character.velocity.z = -0.05;
  }

  character.update(plane);

  if (checkLeavingPlane(character, plane)) {
    setTimeout(() => {
      stopAnimate = true;
      clearInterval(Interval);
      cancelAnimationFrame(animationId)
      message.innerHTML = 'Game Over';
      message.style.display = 'block';
    }, 1000);
  }

  obstacles.forEach((obstacle) => {
    obstacle.update(plane)
    if (boxCollision({ box1: character, box2: obstacle })) {
      stopAnimate = true;
      clearInterval(Interval);
      cancelAnimationFrame(animationId);
      message.innerHTML = 'Game Over';
      message.style.display = 'block';
    }
  })

  if (frames % spawnRate === 0) {
    if (spawnRate > 20) spawnRate -= 20;
    createObstacle();
  }

  frames++;
}

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

createPlane();
createCharacter();
animate();

window.addEventListener('resize', onWindowResize);
window.addEventListener('keydown', onKeydown);
window.addEventListener('keyup', onKeyup);
