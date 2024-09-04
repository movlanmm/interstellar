import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { gsap } from "gsap";
const canvas = document.querySelector("#canvas");
const playBtn = document.querySelector(".btn.play-btn");
const pauseBtn = document.querySelector(".btn.pause-btn");

// Create a scene

const scene = new THREE.Scene();

const textureLoader = new THREE.TextureLoader();

const sunTexture = textureLoader.load("/2k_sun.jpg");
const mercuryTexture = textureLoader.load("/2k_mercury.jpg");
const venusTexture = textureLoader.load("/2k_venus_surface.jpg");
const earthTexture = textureLoader.load("/2k_earth_daymap.jpg");
const marsTexture = textureLoader.load("/2k_mars.jpg");
const moonTexture = textureLoader.load("/2k_moon.jpg");

const mercuryMaterial = new THREE.MeshStandardMaterial({
  map: mercuryTexture,
});

const venusMaterial = new THREE.MeshStandardMaterial({
  map: venusTexture,
});

const earthMaterial = new THREE.MeshStandardMaterial({
  map: earthTexture,
});

const marsMaterial = new THREE.MeshStandardMaterial({
  map: marsTexture,
});

const moonMaterial = new THREE.MeshStandardMaterial({
  map: moonTexture,
});

// Number of stars
const starCount = 5000;

// Create geometry and material for the stars
const geometry = new THREE.BufferGeometry();
const vertices = new Float32Array(starCount * 3);

// Random star positions
for (let i = 0; i < starCount * 3; i++) {
  vertices[i] = Math.random() * 100 - 50; // Random positions between -50 and 50
}

geometry.setAttribute("position", new THREE.BufferAttribute(vertices, 3));

const material = new THREE.PointsMaterial({
  color: 0xffffff,
  size: 0.03, // Size of each star
  transparent: true,
  opacity: 0.8,
});

// Create points and add to the scene
const stars = new THREE.Points(geometry, material);
stars.position.z = -10;
scene.add(stars);

const sphereGeometry = new THREE.SphereGeometry(1, 32, 32);

const sunMaterial = new THREE.MeshBasicMaterial({
  map: sunTexture,
});
const sun = new THREE.Mesh(sphereGeometry, sunMaterial);
scene.add(sun);
sun.scale.setScalar(5);

const planets = [
  {
    name: "Mercury",
    radius: 0.5,
    distance: 10,
    speed: 0.03,
    material: mercuryMaterial,
    moons: [],
  },
  {
    name: "Venus",
    radius: 0.8,
    distance: 15,
    speed: 0.007,
    material: venusMaterial,
    moons: [],
  },
  {
    name: "Earth",
    radius: 1,
    distance: 20,
    speed: 0.005,
    material: earthMaterial,
    moons: [
      {
        name: "Moon",
        radius: 0.3,
        distance: 3,
        speed: 0.015,
      },
    ],
  },
  {
    name: "Mars",
    radius: 0.7,
    distance: 25,
    speed: 0.003,
    material: marsMaterial,
    moons: [
      {
        name: "Phobos",
        radius: 0.1,
        distance: 2,
        speed: 0.02,
      },
      {
        name: "Deimos",
        radius: 0.2,
        distance: 3,
        speed: 0.015,
        color: 0xffffff,
      },
    ],
  },
  {
    name: "Jupiter",
    radius: 1.5,
    distance: 30,
    speed: 0.002,
    material: new THREE.MeshBasicMaterial({
      map: textureLoader.load("/2k_jupiter.jpg"),
    }),
    moons: [],
  },
  {
    name: "Saturn",
    radius: 1.2,
    distance: 35,
    speed: 0.001,
    material: new THREE.MeshBasicMaterial({
      map: textureLoader.load("/2k_saturn.jpg"),
    }),
    moons: [],
  },
];

// Create planets and moons
const createPlanet = (planet) => {
  const planetMesh = new THREE.Mesh(sphereGeometry, planet.material);
  planetMesh.position.x = planet.distance;
  planetMesh.scale.setScalar(planet.radius);
  return planetMesh;
};

const planetMeshes = planets.map((planet) => {
  const planetMesh = createPlanet(planet);
  scene.add(planetMesh);

  planet.moons.forEach((moon) => {
    const moonMesh = new THREE.Mesh(sphereGeometry, moonMaterial);
    moonMesh.position.x = moon.distance;
    moonMesh.scale.setScalar(moon.radius);
    planetMesh.add(moonMesh);
  });
  return planetMesh;
});

const ambiantLight = new THREE.AmbientLight(0xffffff, 0.1);

scene.add(ambiantLight);

const pointLight = new THREE.PointLight(0xffffff, 2000);

scene.add(pointLight);

// Create a camera
const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);

camera.position.set(20, 10, 40);

//Audio

const listener = new THREE.AudioListener();
camera.add(listener);

const audioLoader = new THREE.AudioLoader();
const audio = new THREE.Audio(listener);

audioLoader.load("/HansZimmer.mp3", function (buffer) {
  audio.setBuffer(buffer);
  audio.setLoop(true);
  audio.setVolume(0.5);
});

playBtn.addEventListener("click", function () {
  audio.play();
  playBtn.style.display = "none";
  pauseBtn.style.display = "block";
});

pauseBtn.addEventListener("click", () => {
  audio.pause();
  playBtn.style.display = "block";
  pauseBtn.style.display = "none";
});

// Create a renderer
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio * 2));
canvas.appendChild(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.maxDistance = 50;
controls.minDistance = 20;

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

window.addEventListener("resize", onWindowResize);

function animate() {
  planetMeshes.forEach((planet, i) => {
    planet.rotation.y += planets[i].speed;
    planet.position.x = Math.sin(planet.rotation.y) * planets[i].distance;
    planet.position.z = Math.cos(planet.rotation.y) * planets[i].distance;

    planet.children.forEach((moon, j) => {
      moon.rotation.y += planets[i].moons[j].speed;
      moon.position.x =
        Math.sin(moon.rotation.y) * planets[i].moons[j].distance;
      moon.position.z =
        Math.cos(moon.rotation.y) * planets[i].moons[j].distance;
    });
  });

  requestAnimationFrame(animate);
  controls.update();
  renderer.render(scene, camera);
}

animate();
