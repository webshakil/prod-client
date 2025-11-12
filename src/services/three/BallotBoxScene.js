// src/services/three/BallotBoxScene.js
// ✨ 3D Ballot Box for Non-Lotterized Elections
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

export class BallotBoxScene {
  constructor(container) {
    this.container = container;
    this.scene = null;
    this.camera = null;
    this.renderer = null;
    this.controls = null;
    this.ballotBox = null;
    this.votes = [];
    this.animationFrameId = null;
    
    this.init();
  }

  init() {
    // Create scene
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x1e293b);
    this.scene.fog = new THREE.Fog(0x1e293b, 15, 40);
    
    // Create camera
    this.camera = new THREE.PerspectiveCamera(
      60,
      this.container.clientWidth / this.container.clientHeight,
      0.1,
      1000
    );
    this.camera.position.set(0, 8, 12);
    this.camera.lookAt(0, 0, 0);
    
    // Create renderer
    this.renderer = new THREE.WebGLRenderer({ 
      antialias: true,
      alpha: true 
    });
    this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.container.appendChild(this.renderer.domElement);
    
    // Add orbit controls
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.05;
    this.controls.minDistance = 8;
    this.controls.maxDistance = 20;
    this.controls.maxPolarAngle = Math.PI / 2.2;
    this.controls.autoRotate = true;
    this.controls.autoRotateSpeed = 1;
    
    // Add lights
    this.setupLights();
    
    // Create ballot box
    this.createBallotBox();
    
    // Add floor
    this.createFloor();
    
    // Handle window resize
    window.addEventListener('resize', this.onWindowResize.bind(this));
    
    // Start animation loop
    this.animate();
  }

  setupLights() {
    // Ambient light
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    this.scene.add(ambientLight);
    
    // Main spotlight
    const spotLight = new THREE.SpotLight(0xffffff, 1.5);
    spotLight.position.set(0, 15, 0);
    spotLight.angle = Math.PI / 4;
    spotLight.penumbra = 0.3;
    spotLight.castShadow = true;
    spotLight.shadow.mapSize.width = 2048;
    spotLight.shadow.mapSize.height = 2048;
    this.scene.add(spotLight);
    
    // Accent lights
    const accentLight1 = new THREE.PointLight(0x3b82f6, 1, 30);
    accentLight1.position.set(8, 5, 8);
    this.scene.add(accentLight1);
    
    const accentLight2 = new THREE.PointLight(0x8b5cf6, 1, 30);
    accentLight2.position.set(-8, 5, -8);
    this.scene.add(accentLight2);
    
    // Rim light
    const rimLight = new THREE.DirectionalLight(0xffffff, 0.4);
    rimLight.position.set(10, 10, -10);
    this.scene.add(rimLight);
  }

  createBallotBox() {
    const boxGroup = new THREE.Group();
    
    // Main box body
    const bodyGeometry = new THREE.BoxGeometry(4, 5, 4);
    const bodyMaterial = new THREE.MeshStandardMaterial({
      color: 0x1e3a8a,
      metalness: 0.3,
      roughness: 0.4,
    });
    const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
    body.castShadow = true;
    body.receiveShadow = true;
    body.position.y = 2.5;
    boxGroup.add(body);
    
    // Top lid (slightly open)
    const lidGeometry = new THREE.BoxGeometry(4.2, 0.3, 4.2);
    const lidMaterial = new THREE.MeshStandardMaterial({
      color: 0x1e40af,
      metalness: 0.5,
      roughness: 0.3,
    });
    const lid = new THREE.Mesh(lidGeometry, lidMaterial);
    lid.position.y = 5.15;
    lid.rotation.x = -0.2;
    lid.position.z = -0.3;
    lid.castShadow = true;
    boxGroup.add(lid);
    
    // Slot opening
    const slotGeometry = new THREE.BoxGeometry(3, 0.15, 0.5);
    const slotMaterial = new THREE.MeshBasicMaterial({
      color: 0x000000,
    });
    const slot = new THREE.Mesh(slotGeometry, slotMaterial);
    slot.position.y = 5;
    slot.position.z = 2.01;
    boxGroup.add(slot);
    
    // Lock
    const lockGeometry = new THREE.CylinderGeometry(0.2, 0.2, 0.3, 16);
    const lockMaterial = new THREE.MeshStandardMaterial({
      color: 0xfbbf24,
      metalness: 0.9,
      roughness: 0.1,
    });
    const lock = new THREE.Mesh(lockGeometry, lockMaterial);
    lock.rotation.z = Math.PI / 2;
    lock.position.y = 2.5;
    lock.position.z = 2.1;
    boxGroup.add(lock);
    
    // Decorative stripe
    const stripeGeometry = new THREE.BoxGeometry(4.1, 0.5, 4.1);
    const stripeMaterial = new THREE.MeshStandardMaterial({
      color: 0x3b82f6,
      metalness: 0.7,
      roughness: 0.3,
      emissive: 0x1e40af,
      emissiveIntensity: 0.2,
    });
    const stripe = new THREE.Mesh(stripeGeometry, stripeMaterial);
    stripe.position.y = 3;
    boxGroup.add(stripe);
    
    // Base
    const baseGeometry = new THREE.BoxGeometry(5, 0.5, 5);
    const baseMaterial = new THREE.MeshStandardMaterial({
      color: 0x0f172a,
      metalness: 0.8,
      roughness: 0.2,
    });
    const base = new THREE.Mesh(baseGeometry, baseMaterial);
    base.position.y = -0.25;
    base.castShadow = true;
    base.receiveShadow = true;
    boxGroup.add(base);
    
    // Add "BALLOT BOX" text
    this.addBallotBoxLabel(boxGroup);
    
    this.ballotBox = boxGroup;
    this.scene.add(boxGroup);
  }

  addBallotBoxLabel(boxGroup) {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 256;
    const context = canvas.getContext('2d');
    
    // Background
    context.fillStyle = '#1e3a8a';
    context.fillRect(0, 0, 512, 256);
    
    // Text
    context.fillStyle = '#ffffff';
    context.font = 'bold 60px Arial';
    context.textAlign = 'center';
    context.textBaseline = 'middle';
    context.fillText('BALLOT BOX', 256, 100);
    
    context.font = 'bold 40px Arial';
    context.fillText('🗳️ VOTE HERE', 256, 170);
    
    const texture = new THREE.CanvasTexture(canvas);
    const material = new THREE.MeshBasicMaterial({ 
      map: texture,
      transparent: true,
    });
    
    const labelPlane = new THREE.Mesh(
      new THREE.PlaneGeometry(3.8, 1.9),
      material
    );
    labelPlane.position.y = 2.5;
    labelPlane.position.z = 2.01;
    boxGroup.add(labelPlane);
  }

  createFloor() {
    const floorGeometry = new THREE.CircleGeometry(15, 64);
    const floorMaterial = new THREE.MeshStandardMaterial({
      color: 0x1e293b,
      metalness: 0.1,
      roughness: 0.8,
    });
    const floor = new THREE.Mesh(floorGeometry, floorMaterial);
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = -0.5;
    floor.receiveShadow = true;
    this.scene.add(floor);
    
    // Add grid
    const gridHelper = new THREE.GridHelper(20, 20, 0x334155, 0x1e293b);
    gridHelper.position.y = -0.49;
    this.scene.add(gridHelper);
  }

  createVotePaper(voteNumber) {
    // Create paper
    const paperGeometry = new THREE.BoxGeometry(0.6, 0.02, 0.8);
    const paperMaterial = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      metalness: 0,
      roughness: 0.8,
    });
    const paper = new THREE.Mesh(paperGeometry, paperMaterial);
    paper.castShadow = true;
    
    // Add vote number texture
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 256;
    const context = canvas.getContext('2d');
    
    context.fillStyle = '#ffffff';
    context.fillRect(0, 0, 256, 256);
    
    context.fillStyle = '#000000';
    context.font = 'bold 30px Arial';
    context.textAlign = 'center';
    context.textBaseline = 'middle';
    context.fillText('VOTE', 128, 80);
    
    context.font = 'bold 50px Arial';
    context.fillText(`#${voteNumber}`, 128, 140);
    
    context.font = '20px Arial';
    context.fillText('✓ CAST', 128, 190);
    
    const texture = new THREE.CanvasTexture(canvas);
    const textMaterial = new THREE.MeshBasicMaterial({ 
      map: texture,
      transparent: true,
    });
    
    const textPlane = new THREE.Mesh(
      new THREE.PlaneGeometry(0.58, 0.78),
      textMaterial
    );
    textPlane.position.y = 0.011;
    paper.add(textPlane);
    
    paper.userData.voteNumber = voteNumber;
    
    return paper;
  }

  addVote(voteNumber, animate = true) {
    const votePaper = this.createVotePaper(voteNumber);
    
    if (animate) {
      // Start position above slot
      votePaper.position.set(0, 8, 0);
      votePaper.rotation.x = Math.random() * Math.PI;
      votePaper.rotation.z = Math.random() * Math.PI;
      
      this.animateVoteEntry(votePaper);
    } else {
      // Already inside box
      votePaper.position.set(
        (Math.random() - 0.5) * 3,
        1 + this.votes.length * 0.03,
        (Math.random() - 0.5) * 3
      );
      votePaper.rotation.y = Math.random() * Math.PI * 2;
    }
    
    this.votes.push(votePaper);
    this.scene.add(votePaper);
    
    return votePaper;
  }

  animateVoteEntry(votePaper) {
    const startY = votePaper.position.y;
    const targetY = 1 + this.votes.length * 0.03;
    const duration = 1500;
    const startTime = Date.now();
    
    // Create entry particles
    this.createEntryParticles(votePaper.position);
    
    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Ease out cubic
      const easeProgress = 1 - Math.pow(1 - progress, 3);
      
      votePaper.position.y = startY - (startY - targetY) * easeProgress;
      
      // Rotate while falling
      votePaper.rotation.x = progress * Math.PI * 2;
      votePaper.rotation.z = progress * Math.PI;
      
      // Settle into position
      if (progress > 0.8) {
        votePaper.rotation.x *= (1 - progress);
        votePaper.rotation.z *= (1 - progress);
      }
      
      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        votePaper.rotation.set(0, Math.random() * Math.PI * 2, 0);
      }
    };
    
    animate();
  }

  createEntryParticles(position) {
    const particleCount = 20;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    
    for (let i = 0; i < particleCount; i++) {
      const i3 = i * 3;
      positions[i3] = position.x;
      positions[i3 + 1] = position.y;
      positions[i3 + 2] = position.z;
    }
    
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    
    const material = new THREE.PointsMaterial({
      color: 0x3b82f6,
      size: 0.15,
      transparent: true,
      opacity: 1,
      blending: THREE.AdditiveBlending,
    });
    
    const particles = new THREE.Points(geometry, material);
    this.scene.add(particles);
    
    // Animate particles
    const startTime = Date.now();
    const duration = 800;
    
    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = elapsed / duration;
      
      if (progress < 1) {
        const positions = particles.geometry.attributes.position.array;
        
        for (let i = 0; i < particleCount; i++) {
          const i3 = i * 3;
          positions[i3] += (Math.random() - 0.5) * 0.1;
          positions[i3 + 1] -= progress * 0.05;
          positions[i3 + 2] += (Math.random() - 0.5) * 0.1;
        }
        
        particles.geometry.attributes.position.needsUpdate = true;
        material.opacity = 1 - progress;
        
        requestAnimationFrame(animate);
      } else {
        this.scene.remove(particles);
        geometry.dispose();
        material.dispose();
      }
    };
    
    animate();
  }

  animate() {
    this.animationFrameId = requestAnimationFrame(this.animate.bind(this));
    
    // Update controls
    this.controls.update();
    
    // Render
    this.renderer.render(this.scene, this.camera);
  }

  onWindowResize() {
    if (!this.container) return;
    
    const width = this.container.clientWidth;
    const height = this.container.clientHeight;
    
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
  }

  dispose() {
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
    }
    
    window.removeEventListener('resize', this.onWindowResize.bind(this));
    
    // Dispose Three.js objects
    this.votes.forEach(vote => {
      if (vote.geometry) vote.geometry.dispose();
      if (vote.material) vote.material.dispose();
    });
    
    if (this.ballotBox) {
      this.ballotBox.traverse(child => {
        if (child.geometry) child.geometry.dispose();
        if (child.material) child.material.dispose();
      });
    }
    
    this.renderer.dispose();
    if (this.container && this.renderer.domElement) {
      this.container.removeChild(this.renderer.domElement);
    }
  }
}