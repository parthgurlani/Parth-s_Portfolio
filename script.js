import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.159.0/build/three.module.js";

const body = document.body;
const themeToggle = document.querySelector(".theme-toggle");
const navLinks = document.querySelectorAll(".nav-link");
const menuToggle = document.querySelector(".menu-toggle");
const siteNav = document.querySelector(".site-nav");
const modeLabel = document.querySelector(".mode-label");

const THEME_KEY = "parth-portfolio-theme";

const updateThemeLabel = (mode) => {
  if (!modeLabel || !themeToggle) return;
  const isLight = mode === "light";
  modeLabel.textContent = isLight ? "Light Mode" : "Dark Mode";
  themeToggle.dataset.mode = mode;
};

const applyTheme = (mode) => {
  body.classList.remove("theme-dark", "theme-light");
  body.classList.add(mode === "light" ? "theme-light" : "theme-dark");
  localStorage.setItem(THEME_KEY, mode);
  updateThemeLabel(mode);
};

const storedTheme = localStorage.getItem(THEME_KEY);
if (storedTheme) {
  applyTheme(storedTheme);
} else {
  applyTheme("dark");
}

if (themeToggle) {
  themeToggle.addEventListener("click", () => {
    const current = body.classList.contains("theme-light") ? "light" : "dark";
    applyTheme(current === "light" ? "dark" : "light");
  });
}

menuToggle.addEventListener("click", () => {
  const expanded = siteNav.classList.toggle("open");
  menuToggle.setAttribute("aria-expanded", expanded);
});

navLinks.forEach((link) => {
  link.addEventListener("click", () => {
    siteNav.classList.remove("open");
    menuToggle.setAttribute("aria-expanded", "false");
  });
});

const sections = document.querySelectorAll("main section[id]");
const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      const id = entry.target.id;
      const activeLink = document.querySelector(`.nav-link[href="#${id}"]`);

      if (entry.isIntersecting) {
        navLinks.forEach((link) => link.classList.remove("active"));
        if (activeLink) {
          activeLink.classList.add("active");
        }
      }
    });
  },
  {
    rootMargin: "-35% 0px -55% 0px",
    threshold: 0.2,
  }
);

sections.forEach((section) => observer.observe(section));

document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
  anchor.addEventListener("click", (event) => {
    const target = document.querySelector(anchor.getAttribute("href"));
    if (!target) return;
    event.preventDefault();
    target.scrollIntoView({ behavior: "smooth", block: "start" });
  });
});

const heroImage = document.querySelector(".hero-image");
if (heroImage) {
  heroImage.addEventListener("mousemove", (event) => {
    const rect = heroImage.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width - 0.5) * 10;
    const y = ((event.clientY - rect.top) / rect.height - 0.5) * 10;
    heroImage.style.transform = `rotateY(${x}deg) rotateX(${ -y }deg)`;
  });

  heroImage.addEventListener("mouseleave", () => {
    heroImage.style.transform = "rotateY(0deg) rotateX(0deg)";
  });
}

const canvas = document.getElementById("hero-canvas");
if (canvas) {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 100);
  camera.position.set(0, 0, 6);

  const geometry = new THREE.IcosahedronGeometry(2.8, 1);
  const material = new THREE.MeshBasicMaterial({
    wireframe: true,
    color: 0x38bdf8,
    transparent: true,
    opacity: 0.4,
  });
  const wireframe = new THREE.Mesh(geometry, material);
  scene.add(wireframe);

  const particleGeometry = new THREE.BufferGeometry();
  const particleCount = 320;
  const positions = new Float32Array(particleCount * 3);

  for (let i = 0; i < particleCount; i += 1) {
    const radius = 5 + Math.random() * 4;
    const theta = Math.random() * 2 * Math.PI;
    const phi = Math.acos(2 * Math.random() - 1);
    positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
    positions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
    positions[i * 3 + 2] = radius * Math.cos(phi);
  }

  particleGeometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  const particleMaterial = new THREE.PointsMaterial({
    color: 0xffffff,
    size: 0.06,
    transparent: true,
    opacity: 0.55,
  });
  const particles = new THREE.Points(particleGeometry, particleMaterial);
  scene.add(particles);

  const resizeRenderer = () => {
    const width = window.innerWidth;
    const height = window.innerHeight;
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(width, height);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
  };

  resizeRenderer();
  window.addEventListener("resize", resizeRenderer);

  const animate = () => {
    requestAnimationFrame(animate);
    wireframe.rotation.x += 0.0015;
    wireframe.rotation.y += 0.0018;
    particles.rotation.y -= 0.0005;
    renderer.render(scene, camera);
  };

  animate();
}

