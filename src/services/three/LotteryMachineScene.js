// src/services/three/LotteryMachineScene.js
// ✨ REVOLUTIONARY DESIGN - Just floating numbers, no balls!
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

export class LotteryMachineScene {
  constructor(container) {
    this.container = container;
    this.scene = null;
    this.camera = null;
    this.renderer = null;
    this.controls = null;
    this.balls = []; // Actually just numbers now
    this.machine = null;
    this.animationFrameId = null;
    this.rotationSpeed = 0.3;
    this.ballSpinSpeed = 0.5;
    this.isInitialized = false;
    
    this.waitForContainerAndInit();
  }

  waitForContainerAndInit() {
    const checkAndInit = () => {
      if (!this.container) {
        console.error('❌ Container is null');
        return;
      }

      const width = this.container.clientWidth;
      const height = this.container.clientHeight;

      if (width > 0 && height > 0) {
        console.log('✅ Container has size, initializing...');
        this.init();
      } else {
        setTimeout(checkAndInit, 100);
      }
    };

    checkAndInit();
  }

  async init() {
    try {
      console.log('🎨 Initializing Three.js scene...');
      
      const width = this.container.clientWidth;
      const height = this.container.clientHeight;

      if (width === 0 || height === 0) {
        throw new Error('Container has no dimensions');
      }

      // Create scene
      this.scene = new THREE.Scene();
      this.scene.background = new THREE.Color(0x0a0a1f);
      this.scene.fog = new THREE.Fog(0x0a0a1f, 20, 50);
      
      // Camera - positioned to see full machine with tall base
      this.camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
      this.camera.position.set(0, 0, 15); // Further back and centered
      this.camera.lookAt(0, -2, 0); // Look slightly down to see base
      
      // Renderer
      this.renderer = new THREE.WebGLRenderer({ 
        antialias: true,
        alpha: true,
        powerPreference: 'high-performance',
      });
      
      this.renderer.setSize(width, height);
      this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      this.renderer.shadowMap.enabled = true;
      this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
      
      while (this.container.firstChild) {
        this.container.removeChild(this.container.firstChild);
      }
      
      this.container.appendChild(this.renderer.domElement);
      
      // Orbit controls
      this.controls = new OrbitControls(this.camera, this.renderer.domElement);
      this.controls.enableDamping = true;
      this.controls.dampingFactor = 0.05;
      this.controls.minDistance = 8;
      this.controls.maxDistance = 20;
      this.controls.autoRotate = true;
      this.controls.autoRotateSpeed = 0.5;
      
      this.setupLights();
      this.createMachine();
      
      window.addEventListener('resize', this.onWindowResize.bind(this));
      
      this.isInitialized = true;
      
      console.log('🎬 Starting animation loop...');
      this.animate();
      
      console.log('✅ Three.js scene initialized successfully');
      
    } catch (error) {
      console.error('❌ Failed to initialize scene:', error);
      throw error;
    }
  }

  setupLights() {
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    this.scene.add(ambientLight);
    
    const spotLight = new THREE.SpotLight(0xffffff, 2);
    spotLight.position.set(0, 20, 0);
    spotLight.castShadow = true;
    this.scene.add(spotLight);
    
    const frontLight = new THREE.DirectionalLight(0xffffff, 0.8);
    frontLight.position.set(0, 5, 10);
    this.scene.add(frontLight);
  }

  createMachine() {
    const machineGroup = new THREE.Group();
    
    // ✨ MATERIALS
    const goldMaterial = new THREE.MeshStandardMaterial({
      color: 0xDAA520,
      metalness: 1.0,
      roughness: 0.2,
      emissive: 0xB8860B,
      emissiveIntensity: 0.4,
    });
    
    const bronzeMaterial = new THREE.MeshStandardMaterial({
      color: 0x8B6914,
      metalness: 0.95,
      roughness: 0.25,
      emissive: 0x654321,
      emissiveIntensity: 0.2,
    });
    
    // ✨✨✨ IMPROVED GLASS ELLIPSOID - MORE VISIBLE & GLASS-LIKE! ✨✨✨
    const glassGeometry = new THREE.SphereGeometry(5, 64, 64);
    glassGeometry.scale(1.5, 0.75, 1.5); // Flattened ellipsoid
    
    const glassMaterial = new THREE.MeshPhysicalMaterial({
      color: 0xE0F0FF, // ✅ Slight blue tint for glass look
      transparent: true,
      opacity: 0.45, // ✅ INCREASED from 0.25 - Less transparent, more visible
      metalness: 0.05,
      roughness: 0.05, // ✅ Very smooth but slightly rougher for visibility
      transmission: 0.65, // ✅ REDUCED from 0.85 - Less see-through, more solid
      thickness: 3.5, // ✅ INCREASED from 2.5 - Thicker glass
      clearcoat: 1.0,
      clearcoatRoughness: 0.1, // ✅ Slight roughness for better visibility
      side: THREE.DoubleSide,
      envMapIntensity: 2.5, // ✅ INCREASED from 2.0 - Stronger reflections
      ior: 1.52, // Real glass index of refraction
      reflectivity: 0.7, // ✅ Balanced reflectivity
    });
    
    const glassEllipsoid = new THREE.Mesh(glassGeometry, glassMaterial);
    glassEllipsoid.castShadow = true;
    glassEllipsoid.receiveShadow = true;
    machineGroup.add(glassEllipsoid);
    
    // ✨ MINIMAL GOLDEN BANDS - Just a few key accent lines
    // Main equator band - VERY THIN
    const equatorBand = new THREE.Mesh(
      new THREE.TorusGeometry(7.5, 0.06, 8, 64), // Ultra thin!
      goldMaterial
    );
    equatorBand.rotation.x = Math.PI / 2;
    equatorBand.castShadow = true;
    machineGroup.add(equatorBand);
    
    // Only 3 horizontal bands - minimal decoration
    const bandYPositions = [2.5, 0, -2.5];
    bandYPositions.forEach(y => {
      const normalizedY = y / 3.75;
      const bandRadius = 7.5 * Math.sqrt(1 - (normalizedY * normalizedY) * 0.4);
      
      const band = new THREE.Mesh(
        new THREE.TorusGeometry(bandRadius, 0.05, 8, 64), // Super thin!
        goldMaterial
      );
      band.rotation.x = Math.PI / 2;
      band.position.y = y;
      band.castShadow = true;
      machineGroup.add(band);
    });
    
    // Only 2 vertical meridian bands - minimal
    for (let i = 0; i < 2; i++) {
      const angle = (i / 2) * Math.PI;
      const meridianBand = new THREE.Mesh(
        new THREE.TorusGeometry(3.75, 0.05, 8, 64), // Super thin!
        goldMaterial
      );
      meridianBand.rotation.y = angle;
      meridianBand.scale.set(1.5, 0.75, 1.5);
      meridianBand.castShadow = true;
      machineGroup.add(meridianBand);
    }
    
    // Very few tiny golden spheres - just at key intersections
    const numSpheres = 8; // Much fewer
    const sphereHeights = [2.5, 0, -2.5];
    
    for (let i = 0; i < numSpheres; i++) {
      const angle = (i / numSpheres) * Math.PI * 2;
      
      sphereHeights.forEach(y => {
        const normalizedY = y / 3.75;
        const radiusAtY = 7.5 * Math.sqrt(1 - (normalizedY * normalizedY) * 0.4);
        
        const x = Math.cos(angle) * radiusAtY;
        const z = Math.sin(angle) * radiusAtY;
        
        const sphere = new THREE.Mesh(
          new THREE.SphereGeometry(0.08, 6, 6), // Tiny!
          goldMaterial
        );
        sphere.position.set(x, y, z);
        sphere.castShadow = true;
        machineGroup.add(sphere);
      });
    }
    
    // ✨ TOP CAP - Crown on top
    const topGroup = new THREE.Group();
    
    const topCap = new THREE.Mesh(
      new THREE.CylinderGeometry(1.5, 2.0, 0.8, 32),
      bronzeMaterial
    );
    topCap.position.y = 4.2;
    topCap.castShadow = true;
    topGroup.add(topCap);
    
    const topRing = new THREE.Mesh(
      new THREE.TorusGeometry(2.1, 0.18, 16, 32),
      goldMaterial
    );
    topRing.rotation.x = Math.PI / 2;
    topRing.position.y = 3.8;
    topGroup.add(topRing);
    
    const spire = new THREE.Mesh(
      new THREE.ConeGeometry(0.5, 1.0, 32),
      goldMaterial
    );
    spire.position.y = 5.2;
    spire.castShadow = true;
    topGroup.add(spire);
    
    const topSphere = new THREE.Mesh(
      new THREE.SphereGeometry(0.35, 16, 16),
      goldMaterial
    );
    topSphere.position.y = 5.9;
    topGroup.add(topSphere);
    
    machineGroup.add(topGroup);
    
    // ✨✨✨ MINIMAL CLEAN BASE - ONLY ESSENTIALS ✨✨✨
    const baseGroup = new THREE.Group();
    
    // Simple connection neck
    const neck = new THREE.Mesh(
      new THREE.CylinderGeometry(2.2, 2.8, 2.5, 32),
      bronzeMaterial
    );
    neck.position.y = -5.0;
    neck.castShadow = true;
    baseGroup.add(neck);
    
    // ✨ SOLID BASE BOX - CLEAN AND SIMPLE
    const baseBox = new THREE.Mesh(
      new THREE.BoxGeometry(9.0, 6.5, 9.0),
      bronzeMaterial
    );
    baseBox.position.y = -9.5;
    baseBox.castShadow = true;
    baseBox.receiveShadow = true;
    baseGroup.add(baseBox);
    
    // ✨✨✨ FRONT GEAR MECHANISM ONLY ✨✨✨
    const gearBase = new THREE.Mesh(
      new THREE.CylinderGeometry(3.0, 3.0, 1.2, 32),
      bronzeMaterial
    );
    gearBase.rotation.z = Math.PI / 2;
    gearBase.position.set(5.1, -9.5, 0);
    gearBase.castShadow = true;
    baseGroup.add(gearBase);
    
    // Outer gear ring
    const gearOuter = new THREE.Mesh(
      new THREE.TorusGeometry(2.8, 0.3, 16, 32),
      goldMaterial
    );
    gearOuter.rotation.y = Math.PI / 2;
    gearOuter.position.set(5.3, -9.5, 0);
    gearOuter.castShadow = true;
    baseGroup.add(gearOuter);
    
    // Middle ring
    const gearMiddle = new THREE.Mesh(
      new THREE.TorusGeometry(1.8, 0.25, 16, 32),
      goldMaterial
    );
    gearMiddle.rotation.y = Math.PI / 2;
    gearMiddle.position.set(5.3, -9.5, 0);
    baseGroup.add(gearMiddle);
    
    // Inner ring
    const gearInner = new THREE.Mesh(
      new THREE.TorusGeometry(1.0, 0.2, 16, 32),
      goldMaterial
    );
    gearInner.rotation.y = Math.PI / 2;
    gearInner.position.set(5.3, -9.5, 0);
    baseGroup.add(gearInner);
    
    // Center hub
    const gearCenter = new THREE.Mesh(
      new THREE.SphereGeometry(0.6, 20, 20),
      goldMaterial
    );
    gearCenter.position.set(5.4, -9.5, 0);
    gearCenter.castShadow = true;
    baseGroup.add(gearCenter);
    
    // Gear teeth
    for (let i = 0; i < 16; i++) {
      const angle = (i / 16) * Math.PI * 2;
      const toothY = -9.5 + Math.cos(angle) * 3.0;
      const toothZ = Math.sin(angle) * 3.0;
      
      const tooth = new THREE.Mesh(
        new THREE.BoxGeometry(0.6, 0.3, 0.4),
        goldMaterial
      );
      tooth.position.set(5.3, toothY, toothZ);
      tooth.castShadow = true;
      baseGroup.add(tooth);
    }
    
    // Crank handle
    const crankShaft = new THREE.Mesh(
      new THREE.CylinderGeometry(0.25, 0.25, 5.0, 16),
      goldMaterial
    );
    crankShaft.rotation.z = Math.PI / 2;
    crankShaft.position.set(7.8, -9.5, 0);
    crankShaft.castShadow = true;
    baseGroup.add(crankShaft);
    
    const crankHandle = new THREE.Mesh(
      new THREE.SphereGeometry(0.5, 16, 16),
      goldMaterial
    );
    crankHandle.position.set(10.3, -9.5, 0);
    crankHandle.castShadow = true;
    baseGroup.add(crankHandle);
    
    // ✨ SIMPLE PEDESTAL
    const pedestal = new THREE.Mesh(
      new THREE.CylinderGeometry(7.5, 8.0, 1.0, 32),
      goldMaterial
    );
    pedestal.position.y = -13.2;
    pedestal.castShadow = true;
    baseGroup.add(pedestal);
    
    machineGroup.add(baseGroup);
    
    // Add rim lighting
    const rimLight1 = new THREE.PointLight(0xFFD700, 0.5, 15);
    rimLight1.position.set(10, 0, 0);
    machineGroup.add(rimLight1);
    
    const rimLight2 = new THREE.PointLight(0xFFD700, 0.5, 15);
    rimLight2.position.set(-10, 0, 0);
    machineGroup.add(rimLight2);
    
    this.machine = machineGroup;
    this.scene.add(machineGroup);
    
    console.log('✅ Improved glass ellipsoid lottery machine created!');
  }

  // ✅ NEW: Create floating number - LAST 4 DIGITS ONLY
  createBall(ballNumber) {
    // ✅ Get last 4 digits only
    const displayNumber = ballNumber.toString().slice(-4);
    
    // Create a canvas with crisp rendering
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const context = canvas.getContext('2d');
    
    // Enable crisp rendering
    context.imageSmoothingEnabled = false;
    
    // Solid white circle background
    context.fillStyle = '#FFFFFF';
    context.beginPath();
    context.arc(256, 256, 240, 0, Math.PI * 2);
    context.fill();
    
    // Thick black border
    context.strokeStyle = '#000000';
    context.lineWidth = 16;
    context.stroke();
    
    // ✅ 4-digit number - HUGE and BOLD
    context.fillStyle = '#000000';
    context.font = 'bold 200px Arial';
    context.textAlign = 'center';
    context.textBaseline = 'middle';
    context.fillText(displayNumber, 256, 256);
    
    // Create sprite (billboard - always faces camera)
    const texture = new THREE.CanvasTexture(canvas);
    texture.minFilter = THREE.LinearFilter;
    texture.magFilter = THREE.LinearFilter;
    
    const material = new THREE.SpriteMaterial({ 
      map: texture,
      transparent: false,
    });
    
    const sprite = new THREE.Sprite(material);
    sprite.scale.set(4, 4, 1); // Large circle
    
    sprite.userData.ballNumber = ballNumber;
    sprite.userData.displayNumber = displayNumber;
    
    return sprite;
  }

  addBall(ballNumber, animate = true) {
    console.log(`🎱 addBall called with ballNumber: ${ballNumber}, current ball count: ${this.balls.length}`);
    
    // ✅ PREVENT DUPLICATES
    const existingBall = this.balls.find(b => b.userData.ballNumber === ballNumber);
    if (existingBall) {
      console.warn(`⚠️ Ball ${ballNumber} already exists! Skipping duplicate.`);
      return existingBall;
    }
    
    const ball = this.createBall(ballNumber);
    
    if (animate) {
      // Start above
      const ballIndex = this.balls.length;
      const angle = (ballIndex * Math.PI * 2) / Math.max(1, ballIndex + 1);
      const radius = 3;
      
      ball.position.set(
        Math.cos(angle) * radius,
        15,
        Math.sin(angle) * radius
      );
      
      ball.scale.set(0, 0, 0);
      this.animateBallEntry(ball, ballIndex);
    } else {
      const ballIndex = this.balls.length;
      const angle = (ballIndex * Math.PI * 2) / Math.max(1, this.balls.length + 1);
      const radius = 3;
      const height = 0;
      
      ball.position.set(
        Math.cos(angle) * radius,
        height,
        Math.sin(angle) * radius
      );
    }
    
    this.balls.push(ball);
    this.scene.add(ball);
    
    console.log(`✅ Ball ${ballNumber} added! Total balls now: ${this.balls.length}`);
    console.log(`   All ball numbers:`, this.balls.map(b => b.userData.ballNumber));
    
    return ball;
  }
/*eslint-disable*/
  animateBallEntry(ball, ballIndex) {
    const startY = ball.position.y;
    const targetY = 0;
    const duration = 2000;
    const startTime = Date.now();
    
    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easeProgress = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      
      ball.position.y = startY - (startY - targetY) * easeProgress;
      ball.scale.setScalar(easeProgress);
      
      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };
    
    animate();
  }

  spinBalls(speed = 1) {
    const time = Date.now() * 0.001;
    
    this.balls.forEach((ball, index) => {
      // Circular orbit
      const radius = 3;
      const angle = time * speed * 0.2 + index * (Math.PI * 2 / Math.max(this.balls.length, 1));
      const height = Math.sin(time + index) * 1.5;
      
      ball.position.x = Math.cos(angle) * radius;
      ball.position.z = Math.sin(angle) * radius;
      ball.position.y = height;
      
      // Sprites automatically face camera - no rotation needed!
    });
  }

  highlightBall(ballNumber) {
    const ball = this.balls.find(b => b.userData.ballNumber === ballNumber);
    if (!ball) return null;
    
    // Add pulsing effect to highlighted ball
    let time = 0;
    const animateGlow = () => {
      time += 0.05;
      const scale = 1 + Math.sin(time) * 0.2;
      ball.scale.set(4 * scale, 4 * scale, 1);
      requestAnimationFrame(animateGlow);
    };
    animateGlow();
    
    return ball;
  }

  extractBall(ballNumber, onComplete) {
    const ballIndex = this.balls.findIndex(b => b.userData.ballNumber === ballNumber);
    if (ballIndex === -1) return;
    
    const ball = this.balls[ballIndex];
    const startPos = ball.position.clone();
    const targetPos = new THREE.Vector3(0, 8, 0);
    const duration = 3000;
    const startTime = Date.now();
    
    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      ball.position.lerpVectors(startPos, targetPos, progress);
      ball.scale.setScalar(4 + progress * 4);
      
      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        this.balls.splice(ballIndex, 1);
        this.scene.remove(ball);
        if (onComplete) onComplete(ball);
      }
    };
    
    animate();
  }

  rotateMachine(speed = 0.5) {
    if (this.machine) {
      this.machine.rotation.y += 0.005 * speed;
    }
  }

  setRotationSpeed(speed) {
    this.rotationSpeed = speed;
  }

  setBallSpinSpeed(speed) {
    this.ballSpinSpeed = speed;
  }

  animate() {
    if (!this.isInitialized) return;

    this.animationFrameId = requestAnimationFrame(this.animate.bind(this));
    
    this.controls.update();
    this.rotateMachine(this.rotationSpeed);
    this.spinBalls(this.ballSpinSpeed);
    
    this.renderer.render(this.scene, this.camera);
  }

  onWindowResize() {
    if (!this.container || !this.isInitialized) return;
    
    const width = this.container.clientWidth;
    const height = this.container.clientHeight;
    
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
  }

  dispose() {
    console.log(' Disposing Three.js scene');
    
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
    }
    
    window.removeEventListener('resize', this.onWindowResize.bind(this));
    
    this.balls.forEach(ball => {
      if (ball.geometry) ball.geometry.dispose();
      if (ball.material) {
        if (ball.material.map) ball.material.map.dispose();
        ball.material.dispose();
      }
    });
    
    if (this.machine) {
      this.machine.traverse(child => {
        if (child.geometry) child.geometry.dispose();
        if (child.material) child.material.dispose();
      });
    }
    
    if (this.renderer) {
      this.renderer.dispose();
      if (this.container && this.renderer.domElement) {
        this.container.removeChild(this.renderer.domElement);
      }
    }
    
    this.isInitialized = false;
  }
}
//THis code is perfect. jus to make galss thicker above code
// // src/services/three/LotteryMachineScene.js
// // ✨ REVOLUTIONARY DESIGN - Just floating numbers, no balls!
// import * as THREE from 'three';
// import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

// export class LotteryMachineScene {
//   constructor(container) {
//     this.container = container;
//     this.scene = null;
//     this.camera = null;
//     this.renderer = null;
//     this.controls = null;
//     this.balls = []; // Actually just numbers now
//     this.machine = null;
//     this.animationFrameId = null;
//     this.rotationSpeed = 0.3;
//     this.ballSpinSpeed = 0.5;
//     this.isInitialized = false;
    
//     this.waitForContainerAndInit();
//   }

//   waitForContainerAndInit() {
//     const checkAndInit = () => {
//       if (!this.container) {
//         console.error('❌ Container is null');
//         return;
//       }

//       const width = this.container.clientWidth;
//       const height = this.container.clientHeight;

//       if (width > 0 && height > 0) {
//         console.log('✅ Container has size, initializing...');
//         this.init();
//       } else {
//         setTimeout(checkAndInit, 100);
//       }
//     };

//     checkAndInit();
//   }

//   async init() {
//     try {
//       console.log('🎨 Initializing Three.js scene...');
      
//       const width = this.container.clientWidth;
//       const height = this.container.clientHeight;

//       if (width === 0 || height === 0) {
//         throw new Error('Container has no dimensions');
//       }

//       // Create scene
//       this.scene = new THREE.Scene();
//       this.scene.background = new THREE.Color(0x0a0a1f);
//       this.scene.fog = new THREE.Fog(0x0a0a1f, 20, 50);
      
//       // Camera - positioned to see full machine with tall base
//       this.camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
//       this.camera.position.set(0, 0, 15); // Further back and centered
//       this.camera.lookAt(0, -2, 0); // Look slightly down to see base
      
//       // Renderer
//       this.renderer = new THREE.WebGLRenderer({ 
//         antialias: true,
//         alpha: true,
//         powerPreference: 'high-performance',
//       });
      
//       this.renderer.setSize(width, height);
//       this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
//       this.renderer.shadowMap.enabled = true;
//       this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
      
//       while (this.container.firstChild) {
//         this.container.removeChild(this.container.firstChild);
//       }
      
//       this.container.appendChild(this.renderer.domElement);
      
//       // Orbit controls
//       this.controls = new OrbitControls(this.camera, this.renderer.domElement);
//       this.controls.enableDamping = true;
//       this.controls.dampingFactor = 0.05;
//       this.controls.minDistance = 8;
//       this.controls.maxDistance = 20;
//       this.controls.autoRotate = true;
//       this.controls.autoRotateSpeed = 0.5;
      
//       this.setupLights();
//       this.createMachine();
      
//       window.addEventListener('resize', this.onWindowResize.bind(this));
      
//       this.isInitialized = true;
      
//       console.log('🎬 Starting animation loop...');
//       this.animate();
      
//       console.log('✅ Three.js scene initialized successfully');
      
//     } catch (error) {
//       console.error('❌ Failed to initialize scene:', error);
//       throw error;
//     }
//   }

//   setupLights() {
//     const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
//     this.scene.add(ambientLight);
    
//     const spotLight = new THREE.SpotLight(0xffffff, 2);
//     spotLight.position.set(0, 20, 0);
//     spotLight.castShadow = true;
//     this.scene.add(spotLight);
    
//     const frontLight = new THREE.DirectionalLight(0xffffff, 0.8);
//     frontLight.position.set(0, 5, 10);
//     this.scene.add(frontLight);
//   }

//   createMachine() {
//     const machineGroup = new THREE.Group();
    
//     // ✨ MATERIALS
//     const goldMaterial = new THREE.MeshStandardMaterial({
//       color: 0xDAA520,
//       metalness: 1.0,
//       roughness: 0.2,
//       emissive: 0xB8860B,
//       emissiveIntensity: 0.4,
//     });
    
//     const bronzeMaterial = new THREE.MeshStandardMaterial({
//       color: 0x8B6914,
//       metalness: 0.95,
//       roughness: 0.25,
//       emissive: 0x654321,
//       emissiveIntensity: 0.2,
//     });
    
//     // ✨✨✨ CRYSTAL CLEAR GLASS ELLIPSOID - BEAUTIFUL GLASS! ✨✨✨
//     const glassGeometry = new THREE.SphereGeometry(5, 64, 64);
//     glassGeometry.scale(1.5, 0.75, 1.5); // Flattened ellipsoid
    
//     const glassMaterial = new THREE.MeshPhysicalMaterial({
//       color: 0xFFFFFF, // Pure white for clarity
//       transparent: true,
//       opacity: 0.25, // More transparent but still visible
//       metalness: 0,
//       roughness: 0, // Perfectly smooth = shiny!
//       transmission: 0.85, // More see-through
//       thickness: 2.5, // Thick glass
//       clearcoat: 1.0,
//       clearcoatRoughness: 0, // Perfectly shiny clearcoat
//       side: THREE.DoubleSide,
//       envMapIntensity: 2.0, // Strong reflections!
//       ior: 1.52, // Real glass index of refraction
//       reflectivity: 0.9, // Very reflective
//     });
    
//     const glassEllipsoid = new THREE.Mesh(glassGeometry, glassMaterial);
//     glassEllipsoid.castShadow = true;
//     glassEllipsoid.receiveShadow = true;
//     machineGroup.add(glassEllipsoid);
    
//     // ✨ MINIMAL GOLDEN BANDS - Just a few key accent lines
//     // Main equator band - VERY THIN
//     const equatorBand = new THREE.Mesh(
//       new THREE.TorusGeometry(7.5, 0.06, 8, 64), // Ultra thin!
//       goldMaterial
//     );
//     equatorBand.rotation.x = Math.PI / 2;
//     equatorBand.castShadow = true;
//     machineGroup.add(equatorBand);
    
//     // Only 3 horizontal bands - minimal decoration
//     const bandYPositions = [2.5, 0, -2.5];
//     bandYPositions.forEach(y => {
//       const normalizedY = y / 3.75;
//       const bandRadius = 7.5 * Math.sqrt(1 - (normalizedY * normalizedY) * 0.4);
      
//       const band = new THREE.Mesh(
//         new THREE.TorusGeometry(bandRadius, 0.05, 8, 64), // Super thin!
//         goldMaterial
//       );
//       band.rotation.x = Math.PI / 2;
//       band.position.y = y;
//       band.castShadow = true;
//       machineGroup.add(band);
//     });
    
//     // Only 2 vertical meridian bands - minimal
//     for (let i = 0; i < 2; i++) {
//       const angle = (i / 2) * Math.PI;
//       const meridianBand = new THREE.Mesh(
//         new THREE.TorusGeometry(3.75, 0.05, 8, 64), // Super thin!
//         goldMaterial
//       );
//       meridianBand.rotation.y = angle;
//       meridianBand.scale.set(1.5, 0.75, 1.5);
//       meridianBand.castShadow = true;
//       machineGroup.add(meridianBand);
//     }
    
//     // Very few tiny golden spheres - just at key intersections
//     const numSpheres = 8; // Much fewer
//     const sphereHeights = [2.5, 0, -2.5];
    
//     for (let i = 0; i < numSpheres; i++) {
//       const angle = (i / numSpheres) * Math.PI * 2;
      
//       sphereHeights.forEach(y => {
//         const normalizedY = y / 3.75;
//         const radiusAtY = 7.5 * Math.sqrt(1 - (normalizedY * normalizedY) * 0.4);
        
//         const x = Math.cos(angle) * radiusAtY;
//         const z = Math.sin(angle) * radiusAtY;
        
//         const sphere = new THREE.Mesh(
//           new THREE.SphereGeometry(0.08, 6, 6), // Tiny!
//           goldMaterial
//         );
//         sphere.position.set(x, y, z);
//         sphere.castShadow = true;
//         machineGroup.add(sphere);
//       });
//     }
    
//     // ✨ TOP CAP - Crown on top
//     const topGroup = new THREE.Group();
    
//     const topCap = new THREE.Mesh(
//       new THREE.CylinderGeometry(1.5, 2.0, 0.8, 32),
//       bronzeMaterial
//     );
//     topCap.position.y = 4.2;
//     topCap.castShadow = true;
//     topGroup.add(topCap);
    
//     const topRing = new THREE.Mesh(
//       new THREE.TorusGeometry(2.1, 0.18, 16, 32),
//       goldMaterial
//     );
//     topRing.rotation.x = Math.PI / 2;
//     topRing.position.y = 3.8;
//     topGroup.add(topRing);
    
//     const spire = new THREE.Mesh(
//       new THREE.ConeGeometry(0.5, 1.0, 32),
//       goldMaterial
//     );
//     spire.position.y = 5.2;
//     spire.castShadow = true;
//     topGroup.add(spire);
    
//     const topSphere = new THREE.Mesh(
//       new THREE.SphereGeometry(0.35, 16, 16),
//       goldMaterial
//     );
//     topSphere.position.y = 5.9;
//     topGroup.add(topSphere);
    
//     machineGroup.add(topGroup);
    
//     // ✨✨✨ MINIMAL CLEAN BASE - ONLY ESSENTIALS ✨✨✨
//     const baseGroup = new THREE.Group();
    
//     // Simple connection neck
//     const neck = new THREE.Mesh(
//       new THREE.CylinderGeometry(2.2, 2.8, 2.5, 32),
//       bronzeMaterial
//     );
//     neck.position.y = -5.0;
//     neck.castShadow = true;
//     baseGroup.add(neck);
    
//     // ✨ SOLID BASE BOX - CLEAN AND SIMPLE
//     const baseBox = new THREE.Mesh(
//       new THREE.BoxGeometry(9.0, 6.5, 9.0),
//       bronzeMaterial
//     );
//     baseBox.position.y = -9.5;
//     baseBox.castShadow = true;
//     baseBox.receiveShadow = true;
//     baseGroup.add(baseBox);
    
//     // ✨✨✨ FRONT GEAR MECHANISM ONLY ✨✨✨
//     const gearBase = new THREE.Mesh(
//       new THREE.CylinderGeometry(3.0, 3.0, 1.2, 32),
//       bronzeMaterial
//     );
//     gearBase.rotation.z = Math.PI / 2;
//     gearBase.position.set(5.1, -9.5, 0);
//     gearBase.castShadow = true;
//     baseGroup.add(gearBase);
    
//     // Outer gear ring
//     const gearOuter = new THREE.Mesh(
//       new THREE.TorusGeometry(2.8, 0.3, 16, 32),
//       goldMaterial
//     );
//     gearOuter.rotation.y = Math.PI / 2;
//     gearOuter.position.set(5.3, -9.5, 0);
//     gearOuter.castShadow = true;
//     baseGroup.add(gearOuter);
    
//     // Middle ring
//     const gearMiddle = new THREE.Mesh(
//       new THREE.TorusGeometry(1.8, 0.25, 16, 32),
//       goldMaterial
//     );
//     gearMiddle.rotation.y = Math.PI / 2;
//     gearMiddle.position.set(5.3, -9.5, 0);
//     baseGroup.add(gearMiddle);
    
//     // Inner ring
//     const gearInner = new THREE.Mesh(
//       new THREE.TorusGeometry(1.0, 0.2, 16, 32),
//       goldMaterial
//     );
//     gearInner.rotation.y = Math.PI / 2;
//     gearInner.position.set(5.3, -9.5, 0);
//     baseGroup.add(gearInner);
    
//     // Center hub
//     const gearCenter = new THREE.Mesh(
//       new THREE.SphereGeometry(0.6, 20, 20),
//       goldMaterial
//     );
//     gearCenter.position.set(5.4, -9.5, 0);
//     gearCenter.castShadow = true;
//     baseGroup.add(gearCenter);
    
//     // Gear teeth
//     for (let i = 0; i < 16; i++) {
//       const angle = (i / 16) * Math.PI * 2;
//       const toothY = -9.5 + Math.cos(angle) * 3.0;
//       const toothZ = Math.sin(angle) * 3.0;
      
//       const tooth = new THREE.Mesh(
//         new THREE.BoxGeometry(0.6, 0.3, 0.4),
//         goldMaterial
//       );
//       tooth.position.set(5.3, toothY, toothZ);
//       tooth.castShadow = true;
//       baseGroup.add(tooth);
//     }
    
//     // Crank handle
//     const crankShaft = new THREE.Mesh(
//       new THREE.CylinderGeometry(0.25, 0.25, 5.0, 16),
//       goldMaterial
//     );
//     crankShaft.rotation.z = Math.PI / 2;
//     crankShaft.position.set(7.8, -9.5, 0);
//     crankShaft.castShadow = true;
//     baseGroup.add(crankShaft);
    
//     const crankHandle = new THREE.Mesh(
//       new THREE.SphereGeometry(0.5, 16, 16),
//       goldMaterial
//     );
//     crankHandle.position.set(10.3, -9.5, 0);
//     crankHandle.castShadow = true;
//     baseGroup.add(crankHandle);
    
//     // ✨ SIMPLE PEDESTAL
//     const pedestal = new THREE.Mesh(
//       new THREE.CylinderGeometry(7.5, 8.0, 1.0, 32),
//       goldMaterial
//     );
//     pedestal.position.y = -13.2;
//     pedestal.castShadow = true;
//     baseGroup.add(pedestal);
    
//     machineGroup.add(baseGroup);
    
//     // Add rim lighting
//     const rimLight1 = new THREE.PointLight(0xFFD700, 0.5, 15);
//     rimLight1.position.set(10, 0, 0);
//     machineGroup.add(rimLight1);
    
//     const rimLight2 = new THREE.PointLight(0xFFD700, 0.5, 15);
//     rimLight2.position.set(-10, 0, 0);
//     machineGroup.add(rimLight2);
    
//     this.machine = machineGroup;
//     this.scene.add(machineGroup);
    
//     console.log('✅ SOLID glass ellipsoid lottery machine created!');
//   }

//   // ✅ NEW: Create floating number - LAST 4 DIGITS ONLY
//   createBall(ballNumber) {
//     // ✅ Get last 4 digits only
//     const displayNumber = ballNumber.toString().slice(-4);
    
//     // Create a canvas with crisp rendering
//     const canvas = document.createElement('canvas');
//     canvas.width = 512;
//     canvas.height = 512;
//     const context = canvas.getContext('2d');
    
//     // Enable crisp rendering
//     context.imageSmoothingEnabled = false;
    
//     // Solid white circle background
//     context.fillStyle = '#FFFFFF';
//     context.beginPath();
//     context.arc(256, 256, 240, 0, Math.PI * 2);
//     context.fill();
    
//     // Thick black border
//     context.strokeStyle = '#000000';
//     context.lineWidth = 16;
//     context.stroke();
    
//     // ✅ 4-digit number - HUGE and BOLD
//     context.fillStyle = '#000000';
//     context.font = 'bold 200px Arial';
//     context.textAlign = 'center';
//     context.textBaseline = 'middle';
//     context.fillText(displayNumber, 256, 256);
    
//     // Create sprite (billboard - always faces camera)
//     const texture = new THREE.CanvasTexture(canvas);
//     texture.minFilter = THREE.LinearFilter;
//     texture.magFilter = THREE.LinearFilter;
    
//     const material = new THREE.SpriteMaterial({ 
//       map: texture,
//       transparent: false,
//     });
    
//     const sprite = new THREE.Sprite(material);
//     sprite.scale.set(4, 4, 1); // Large circle
    
//     sprite.userData.ballNumber = ballNumber;
//     sprite.userData.displayNumber = displayNumber;
    
//     return sprite;
//   }

//   addBall(ballNumber, animate = true) {
//     console.log(`🎱 addBall called with ballNumber: ${ballNumber}, current ball count: ${this.balls.length}`);
    
//     // ✅ PREVENT DUPLICATES
//     const existingBall = this.balls.find(b => b.userData.ballNumber === ballNumber);
//     if (existingBall) {
//       console.warn(`⚠️ Ball ${ballNumber} already exists! Skipping duplicate.`);
//       return existingBall;
//     }
    
//     const ball = this.createBall(ballNumber);
    
//     if (animate) {
//       // Start above
//       const ballIndex = this.balls.length;
//       const angle = (ballIndex * Math.PI * 2) / Math.max(1, ballIndex + 1);
//       const radius = 3;
      
//       ball.position.set(
//         Math.cos(angle) * radius,
//         15,
//         Math.sin(angle) * radius
//       );
      
//       ball.scale.set(0, 0, 0);
//       this.animateBallEntry(ball, ballIndex);
//     } else {
//       const ballIndex = this.balls.length;
//       const angle = (ballIndex * Math.PI * 2) / Math.max(1, this.balls.length + 1);
//       const radius = 3;
//       const height = 0;
      
//       ball.position.set(
//         Math.cos(angle) * radius,
//         height,
//         Math.sin(angle) * radius
//       );
//     }
    
//     this.balls.push(ball);
//     this.scene.add(ball);
    
//     console.log(`✅ Ball ${ballNumber} added! Total balls now: ${this.balls.length}`);
//     console.log(`   All ball numbers:`, this.balls.map(b => b.userData.ballNumber));
    
//     return ball;
//   }
// /*eslint-disable*/
//   animateBallEntry(ball, ballIndex) {
//     const startY = ball.position.y;
//     const targetY = 0;
//     const duration = 2000;
//     const startTime = Date.now();
    
//     const animate = () => {
//       const elapsed = Date.now() - startTime;
//       const progress = Math.min(elapsed / duration, 1);
//       const easeProgress = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      
//       ball.position.y = startY - (startY - targetY) * easeProgress;
//       ball.scale.setScalar(easeProgress);
      
//       if (progress < 1) {
//         requestAnimationFrame(animate);
//       }
//     };
    
//     animate();
//   }

//   spinBalls(speed = 1) {
//     const time = Date.now() * 0.001;
    
//     this.balls.forEach((ball, index) => {
//       // Circular orbit
//       const radius = 3;
//       const angle = time * speed * 0.2 + index * (Math.PI * 2 / Math.max(this.balls.length, 1));
//       const height = Math.sin(time + index) * 1.5;
      
//       ball.position.x = Math.cos(angle) * radius;
//       ball.position.z = Math.sin(angle) * radius;
//       ball.position.y = height;
      
//       // Sprites automatically face camera - no rotation needed!
//     });
//   }

//   highlightBall(ballNumber) {
//     const ball = this.balls.find(b => b.userData.ballNumber === ballNumber);
//     if (!ball) return null;
    
//     // Add pulsing effect to highlighted ball
//     let time = 0;
//     const animateGlow = () => {
//       time += 0.05;
//       const scale = 1 + Math.sin(time) * 0.2;
//       ball.scale.set(4 * scale, 4 * scale, 1);
//       requestAnimationFrame(animateGlow);
//     };
//     animateGlow();
    
//     return ball;
//   }

//   extractBall(ballNumber, onComplete) {
//     const ballIndex = this.balls.findIndex(b => b.userData.ballNumber === ballNumber);
//     if (ballIndex === -1) return;
    
//     const ball = this.balls[ballIndex];
//     const startPos = ball.position.clone();
//     const targetPos = new THREE.Vector3(0, 8, 0);
//     const duration = 3000;
//     const startTime = Date.now();
    
//     const animate = () => {
//       const elapsed = Date.now() - startTime;
//       const progress = Math.min(elapsed / duration, 1);
      
//       ball.position.lerpVectors(startPos, targetPos, progress);
//       ball.scale.setScalar(4 + progress * 4);
      
//       if (progress < 1) {
//         requestAnimationFrame(animate);
//       } else {
//         this.balls.splice(ballIndex, 1);
//         this.scene.remove(ball);
//         if (onComplete) onComplete(ball);
//       }
//     };
    
//     animate();
//   }

//   rotateMachine(speed = 0.5) {
//     if (this.machine) {
//       this.machine.rotation.y += 0.005 * speed;
//     }
//   }

//   setRotationSpeed(speed) {
//     this.rotationSpeed = speed;
//   }

//   setBallSpinSpeed(speed) {
//     this.ballSpinSpeed = speed;
//   }

//   animate() {
//     if (!this.isInitialized) return;

//     this.animationFrameId = requestAnimationFrame(this.animate.bind(this));
    
//     this.controls.update();
//     this.rotateMachine(this.rotationSpeed);
//     this.spinBalls(this.ballSpinSpeed);
    
//     this.renderer.render(this.scene, this.camera);
//   }

//   onWindowResize() {
//     if (!this.container || !this.isInitialized) return;
    
//     const width = this.container.clientWidth;
//     const height = this.container.clientHeight;
    
//     this.camera.aspect = width / height;
//     this.camera.updateProjectionMatrix();
//     this.renderer.setSize(width, height);
//   }

//   dispose() {
//     console.log(' Disposing Three.js scene');
    
//     if (this.animationFrameId) {
//       cancelAnimationFrame(this.animationFrameId);
//     }
    
//     window.removeEventListener('resize', this.onWindowResize.bind(this));
    
//     this.balls.forEach(ball => {
//       if (ball.geometry) ball.geometry.dispose();
//       if (ball.material) {
//         if (ball.material.map) ball.material.map.dispose();
//         ball.material.dispose();
//       }
//     });
    
//     if (this.machine) {
//       this.machine.traverse(child => {
//         if (child.geometry) child.geometry.dispose();
//         if (child.material) child.material.dispose();
//       });
//     }
    
//     if (this.renderer) {
//       this.renderer.dispose();
//       if (this.container && this.renderer.domElement) {
//         this.container.removeChild(this.renderer.domElement);
//       }
//     }
    
//     this.isInitialized = false;
//   }
// }
// // src/services/three/LotteryMachineScene.js
// // ✨ REVOLUTIONARY DESIGN - Just floating numbers, no balls!
// import * as THREE from 'three';
// import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

// export class LotteryMachineScene {
//   constructor(container) {
//     this.container = container;
//     this.scene = null;
//     this.camera = null;
//     this.renderer = null;
//     this.controls = null;
//     this.balls = []; // Actually just numbers now
//     this.machine = null;
//     this.animationFrameId = null;
//     this.rotationSpeed = 0.3;
//     this.ballSpinSpeed = 0.5;
//     this.isInitialized = false;
    
//     this.waitForContainerAndInit();
//   }

//   waitForContainerAndInit() {
//     const checkAndInit = () => {
//       if (!this.container) {
//         console.error('❌ Container is null');
//         return;
//       }

//       const width = this.container.clientWidth;
//       const height = this.container.clientHeight;

//       if (width > 0 && height > 0) {
//         console.log('✅ Container has size, initializing...');
//         this.init();
//       } else {
//         setTimeout(checkAndInit, 100);
//       }
//     };

//     checkAndInit();
//   }

//   async init() {
//     try {
//       console.log('🎨 Initializing Three.js scene...');
      
//       const width = this.container.clientWidth;
//       const height = this.container.clientHeight;

//       if (width === 0 || height === 0) {
//         throw new Error('Container has no dimensions');
//       }

//       // Create scene
//       this.scene = new THREE.Scene();
//       this.scene.background = new THREE.Color(0x0a0a1f);
//       this.scene.fog = new THREE.Fog(0x0a0a1f, 20, 50);
      
//       // Camera - positioned to see full machine with tall base
//       this.camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
//       this.camera.position.set(0, 0, 15); // Further back and centered
//       this.camera.lookAt(0, -2, 0); // Look slightly down to see base
      
//       // Renderer
//       this.renderer = new THREE.WebGLRenderer({ 
//         antialias: true,
//         alpha: true,
//         powerPreference: 'high-performance',
//       });
      
//       this.renderer.setSize(width, height);
//       this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
//       this.renderer.shadowMap.enabled = true;
//       this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
      
//       while (this.container.firstChild) {
//         this.container.removeChild(this.container.firstChild);
//       }
      
//       this.container.appendChild(this.renderer.domElement);
      
//       // Orbit controls
//       this.controls = new OrbitControls(this.camera, this.renderer.domElement);
//       this.controls.enableDamping = true;
//       this.controls.dampingFactor = 0.05;
//       this.controls.minDistance = 8;
//       this.controls.maxDistance = 20;
//       this.controls.autoRotate = true;
//       this.controls.autoRotateSpeed = 0.5;
      
//       this.setupLights();
//       this.createMachine();
      
//       window.addEventListener('resize', this.onWindowResize.bind(this));
      
//       this.isInitialized = true;
      
//       console.log('🎬 Starting animation loop...');
//       this.animate();
      
//       console.log('✅ Three.js scene initialized successfully');
      
//     } catch (error) {
//       console.error('❌ Failed to initialize scene:', error);
//       throw error;
//     }
//   }

//   setupLights() {
//     const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
//     this.scene.add(ambientLight);
    
//     const spotLight = new THREE.SpotLight(0xffffff, 2);
//     spotLight.position.set(0, 20, 0);
//     spotLight.castShadow = true;
//     this.scene.add(spotLight);
    
//     const frontLight = new THREE.DirectionalLight(0xffffff, 0.8);
//     frontLight.position.set(0, 5, 10);
//     this.scene.add(frontLight);
//   }

//   createMachine() {
//     const machineGroup = new THREE.Group();
    
//     // ✨ MATERIALS
//     const goldMaterial = new THREE.MeshStandardMaterial({
//       color: 0xDAA520,
//       metalness: 1.0,
//       roughness: 0.2,
//       emissive: 0xB8860B,
//       emissiveIntensity: 0.4,
//     });
    
//     const bronzeMaterial = new THREE.MeshStandardMaterial({
//       color: 0x8B6914,
//       metalness: 0.95,
//       roughness: 0.25,
//       emissive: 0x654321,
//       emissiveIntensity: 0.2,
//     });
    
//     // ✨✨✨ CRYSTAL CLEAR GLASS ELLIPSOID - BEAUTIFUL GLASS! ✨✨✨
//     const glassGeometry = new THREE.SphereGeometry(5, 64, 64);
//     glassGeometry.scale(1.5, 0.75, 1.5); // Flattened ellipsoid
    
//     const glassMaterial = new THREE.MeshPhysicalMaterial({
//       color: 0xFFFFFF, // Pure white for clarity
//       transparent: true,
//       opacity: 0.25, // More transparent but still visible
//       metalness: 0,
//       roughness: 0, // Perfectly smooth = shiny!
//       transmission: 0.85, // More see-through
//       thickness: 2.5, // Thick glass
//       clearcoat: 1.0,
//       clearcoatRoughness: 0, // Perfectly shiny clearcoat
//       side: THREE.DoubleSide,
//       envMapIntensity: 2.0, // Strong reflections!
//       ior: 1.52, // Real glass index of refraction
//       reflectivity: 0.9, // Very reflective
//     });
    
//     const glassEllipsoid = new THREE.Mesh(glassGeometry, glassMaterial);
//     glassEllipsoid.castShadow = true;
//     glassEllipsoid.receiveShadow = true;
//     machineGroup.add(glassEllipsoid);
    
//     // ✨ MINIMAL GOLDEN BANDS - Just a few key accent lines
//     // Main equator band - VERY THIN
//     const equatorBand = new THREE.Mesh(
//       new THREE.TorusGeometry(7.5, 0.06, 8, 64), // Ultra thin!
//       goldMaterial
//     );
//     equatorBand.rotation.x = Math.PI / 2;
//     equatorBand.castShadow = true;
//     machineGroup.add(equatorBand);
    
//     // Only 3 horizontal bands - minimal decoration
//     const bandYPositions = [2.5, 0, -2.5];
//     bandYPositions.forEach(y => {
//       const normalizedY = y / 3.75;
//       const bandRadius = 7.5 * Math.sqrt(1 - (normalizedY * normalizedY) * 0.4);
      
//       const band = new THREE.Mesh(
//         new THREE.TorusGeometry(bandRadius, 0.05, 8, 64), // Super thin!
//         goldMaterial
//       );
//       band.rotation.x = Math.PI / 2;
//       band.position.y = y;
//       band.castShadow = true;
//       machineGroup.add(band);
//     });
    
//     // Only 2 vertical meridian bands - minimal
//     for (let i = 0; i < 2; i++) {
//       const angle = (i / 2) * Math.PI;
//       const meridianBand = new THREE.Mesh(
//         new THREE.TorusGeometry(3.75, 0.05, 8, 64), // Super thin!
//         goldMaterial
//       );
//       meridianBand.rotation.y = angle;
//       meridianBand.scale.set(1.5, 0.75, 1.5);
//       meridianBand.castShadow = true;
//       machineGroup.add(meridianBand);
//     }
    
//     // Very few tiny golden spheres - just at key intersections
//     const numSpheres = 8; // Much fewer
//     const sphereHeights = [2.5, 0, -2.5];
    
//     for (let i = 0; i < numSpheres; i++) {
//       const angle = (i / numSpheres) * Math.PI * 2;
      
//       sphereHeights.forEach(y => {
//         const normalizedY = y / 3.75;
//         const radiusAtY = 7.5 * Math.sqrt(1 - (normalizedY * normalizedY) * 0.4);
        
//         const x = Math.cos(angle) * radiusAtY;
//         const z = Math.sin(angle) * radiusAtY;
        
//         const sphere = new THREE.Mesh(
//           new THREE.SphereGeometry(0.08, 6, 6), // Tiny!
//           goldMaterial
//         );
//         sphere.position.set(x, y, z);
//         sphere.castShadow = true;
//         machineGroup.add(sphere);
//       });
//     }
    
//     // ✨ TOP CAP - Crown on top
//     const topGroup = new THREE.Group();
    
//     const topCap = new THREE.Mesh(
//       new THREE.CylinderGeometry(1.5, 2.0, 0.8, 32),
//       bronzeMaterial
//     );
//     topCap.position.y = 4.2;
//     topCap.castShadow = true;
//     topGroup.add(topCap);
    
//     const topRing = new THREE.Mesh(
//       new THREE.TorusGeometry(2.1, 0.18, 16, 32),
//       goldMaterial
//     );
//     topRing.rotation.x = Math.PI / 2;
//     topRing.position.y = 3.8;
//     topGroup.add(topRing);
    
//     const spire = new THREE.Mesh(
//       new THREE.ConeGeometry(0.5, 1.0, 32),
//       goldMaterial
//     );
//     spire.position.y = 5.2;
//     spire.castShadow = true;
//     topGroup.add(spire);
    
//     const topSphere = new THREE.Mesh(
//       new THREE.SphereGeometry(0.35, 16, 16),
//       goldMaterial
//     );
//     topSphere.position.y = 5.9;
//     topGroup.add(topSphere);
    
//     machineGroup.add(topGroup);
    
//     // ✨✨✨ CLEAN PROFESSIONAL BASE - NO STICKS ✨✨✨
//     const baseGroup = new THREE.Group();
    
//     // Smooth connection neck - no sticks
//     const neck = new THREE.Mesh(
//       new THREE.CylinderGeometry(2.2, 2.8, 2.5, 32),
//       bronzeMaterial
//     );
//     neck.position.y = -5.0;
//     neck.castShadow = true;
//     baseGroup.add(neck);
    
//     // Top neck ring
//     const neckRing = new THREE.Mesh(
//       new THREE.TorusGeometry(2.9, 0.25, 16, 32),
//       goldMaterial
//     );
//     neckRing.rotation.x = Math.PI / 2;
//     neckRing.position.y = -3.6;
//     baseGroup.add(neckRing);
    
//     // ✨ SOLID BASE BOX - Clean surfaces
//     const baseBox = new THREE.Mesh(
//       new THREE.BoxGeometry(9.0, 6.5, 9.0),
//       bronzeMaterial
//     );
//     baseBox.position.y = -9.5;
//     baseBox.castShadow = true;
//     baseBox.receiveShadow = true;
//     baseGroup.add(baseBox);
    
//     // Golden corner caps only (no vertical sticks!)
//     const cornerPositions = [
//       // Top corners
//       [-4.5, -6.25, -4.5], [4.5, -6.25, -4.5], 
//       [-4.5, -6.25, 4.5], [4.5, -6.25, 4.5],
//       // Bottom corners
//       [-4.5, -12.75, -4.5], [4.5, -12.75, -4.5], 
//       [-4.5, -12.75, 4.5], [4.5, -12.75, 4.5]
//     ];
//     cornerPositions.forEach(([x, y, z]) => {
//       const cornerCap = new THREE.Mesh(
//         new THREE.SphereGeometry(0.4, 16, 16),
//         goldMaterial
//       );
//       cornerCap.position.set(x, y, z);
//       cornerCap.castShadow = true;
//       baseGroup.add(cornerCap);
//     });
    
//     // Horizontal golden bands - decorative only
//     const bandHeights = [-7.0, -9.5, -12.0];
//     bandHeights.forEach(y => {
//       const band = new THREE.Mesh(
//         new THREE.TorusGeometry(6.4, 0.25, 16, 4),
//         goldMaterial
//       );
//       band.rotation.x = Math.PI / 2;
//       band.position.y = y;
//       band.castShadow = true;
//       baseGroup.add(band);
//     });
    
//     // ✨✨✨ FRONT GEAR MECHANISM - CLEAN AND PROMINENT ✨✨✨
//     const gearBase = new THREE.Mesh(
//       new THREE.CylinderGeometry(3.0, 3.0, 1.2, 32),
//       bronzeMaterial
//     );
//     gearBase.rotation.z = Math.PI / 2;
//     gearBase.position.set(5.1, -9.5, 0);
//     gearBase.castShadow = true;
//     baseGroup.add(gearBase);
    
//     // Outer gear ring
//     const gearOuter = new THREE.Mesh(
//       new THREE.TorusGeometry(2.8, 0.3, 16, 32),
//       goldMaterial
//     );
//     gearOuter.rotation.y = Math.PI / 2;
//     gearOuter.position.set(5.3, -9.5, 0);
//     gearOuter.castShadow = true;
//     baseGroup.add(gearOuter);
    
//     // Middle ring
//     const gearMiddle = new THREE.Mesh(
//       new THREE.TorusGeometry(1.8, 0.25, 16, 32),
//       goldMaterial
//     );
//     gearMiddle.rotation.y = Math.PI / 2;
//     gearMiddle.position.set(5.3, -9.5, 0);
//     baseGroup.add(gearMiddle);
    
//     // Inner ring
//     const gearInner = new THREE.Mesh(
//       new THREE.TorusGeometry(1.0, 0.2, 16, 32),
//       goldMaterial
//     );
//     gearInner.rotation.y = Math.PI / 2;
//     gearInner.position.set(5.3, -9.5, 0);
//     baseGroup.add(gearInner);
    
//     // Center hub
//     const gearCenter = new THREE.Mesh(
//       new THREE.SphereGeometry(0.6, 20, 20),
//       goldMaterial
//     );
//     gearCenter.position.set(5.4, -9.5, 0);
//     gearCenter.castShadow = true;
//     baseGroup.add(gearCenter);
    
//     // Gear teeth - well defined
//     for (let i = 0; i < 16; i++) {
//       const angle = (i / 16) * Math.PI * 2;
//       const toothY = -9.5 + Math.cos(angle) * 3.0;
//       const toothZ = Math.sin(angle) * 3.0;
      
//       const tooth = new THREE.Mesh(
//         new THREE.BoxGeometry(0.6, 0.3, 0.4),
//         goldMaterial
//       );
//       tooth.position.set(5.3, toothY, toothZ);
//       tooth.castShadow = true;
//       baseGroup.add(tooth);
//     }
    
//     // Crank handle
//     const crankShaft = new THREE.Mesh(
//       new THREE.CylinderGeometry(0.25, 0.25, 5.0, 16),
//       goldMaterial
//     );
//     crankShaft.rotation.z = Math.PI / 2;
//     crankShaft.position.set(7.8, -9.5, 0);
//     crankShaft.castShadow = true;
//     baseGroup.add(crankShaft);
    
//     const crankHandle = new THREE.Mesh(
//       new THREE.SphereGeometry(0.5, 16, 16),
//       goldMaterial
//     );
//     crankHandle.position.set(10.3, -9.5, 0);
//     crankHandle.castShadow = true;
//     baseGroup.add(crankHandle);
    
//     // Side decorative gears - cleaner
//     for (let i = 0; i < 4; i++) {
//       const angle = (i / 4) * Math.PI * 2 + Math.PI / 4;
//       const gearX = Math.cos(angle) * 5.2;
//       const gearZ = Math.sin(angle) * 5.2;
      
//       const sideGear = new THREE.Mesh(
//         new THREE.CylinderGeometry(1.0, 1.0, 0.7, 8),
//         goldMaterial
//       );
//       sideGear.rotation.x = Math.PI / 2;
//       sideGear.position.set(gearX, -9.5, gearZ);
//       sideGear.lookAt(0, -9.5, 0);
//       sideGear.castShadow = true;
//       baseGroup.add(sideGear);
      
//       const sideGearCenter = new THREE.Mesh(
//         new THREE.SphereGeometry(0.4, 12, 12),
//         goldMaterial
//       );
//       sideGearCenter.position.set(gearX * 1.02, -9.5, gearZ * 1.02);
//       baseGroup.add(sideGearCenter);
//     }
    
//     // ✨ DECORATIVE PANELS on box faces (not sticks!)
//     // Front panel decoration
//     const frontPanel = new THREE.Mesh(
//       new THREE.BoxGeometry(7.0, 4.5, 0.3),
//       new THREE.MeshStandardMaterial({
//         color: 0x6B4423,
//         metalness: 0.7,
//         roughness: 0.4,
//       })
//     );
//     frontPanel.position.set(0, -9.5, 4.65);
//     frontPanel.castShadow = true;
//     baseGroup.add(frontPanel);
    
//     // Back panel decoration
//     const backPanel = frontPanel.clone();
//     backPanel.position.set(0, -9.5, -4.65);
//     baseGroup.add(backPanel);
    
//     // Side panels
//     const sidePanel1 = new THREE.Mesh(
//       new THREE.BoxGeometry(0.3, 4.5, 7.0),
//       new THREE.MeshStandardMaterial({
//         color: 0x6B4423,
//         metalness: 0.7,
//         roughness: 0.4,
//       })
//     );
//     sidePanel1.position.set(4.65, -9.5, 0);
//     sidePanel1.castShadow = true;
//     baseGroup.add(sidePanel1);
    
//     const sidePanel2 = sidePanel1.clone();
//     sidePanel2.position.set(-4.65, -9.5, 0);
//     baseGroup.add(sidePanel2);
    
//     // ✨ WIDE STABLE PEDESTAL
//     const pedestal = new THREE.Mesh(
//       new THREE.CylinderGeometry(7.5, 8.0, 1.0, 32),
//       goldMaterial
//     );
//     pedestal.position.y = -13.2;
//     pedestal.castShadow = true;
//     baseGroup.add(pedestal);
    
//     const pedestalRing = new THREE.Mesh(
//       new THREE.TorusGeometry(8.2, 0.25, 16, 32),
//       goldMaterial
//     );
//     pedestalRing.rotation.x = Math.PI / 2;
//     pedestalRing.position.y = -12.7;
//     baseGroup.add(pedestalRing);
    
//     // Pedestal decorative details
//     for (let i = 0; i < 8; i++) {
//       const angle = (i / 8) * Math.PI * 2;
//       const x = Math.cos(angle) * 7.8;
//       const z = Math.sin(angle) * 7.8;
      
//       const pedestalDecor = new THREE.Mesh(
//         new THREE.SphereGeometry(0.3, 12, 12),
//         goldMaterial
//       );
//       pedestalDecor.position.set(x, -12.7, z);
//       baseGroup.add(pedestalDecor);
//     }
    
//     machineGroup.add(baseGroup);
    
//     // Add rim lighting
//     const rimLight1 = new THREE.PointLight(0xFFD700, 0.5, 15);
//     rimLight1.position.set(10, 0, 0);
//     machineGroup.add(rimLight1);
    
//     const rimLight2 = new THREE.PointLight(0xFFD700, 0.5, 15);
//     rimLight2.position.set(-10, 0, 0);
//     machineGroup.add(rimLight2);
    
//     this.machine = machineGroup;
//     this.scene.add(machineGroup);
    
//     console.log('✅ SOLID glass ellipsoid lottery machine created!');
//   }

//   // ✅ NEW: Create floating number - LAST 4 DIGITS ONLY
//   createBall(ballNumber) {
//     // ✅ Get last 4 digits only
//     const displayNumber = ballNumber.toString().slice(-4);
    
//     // Create a canvas with crisp rendering
//     const canvas = document.createElement('canvas');
//     canvas.width = 512;
//     canvas.height = 512;
//     const context = canvas.getContext('2d');
    
//     // Enable crisp rendering
//     context.imageSmoothingEnabled = false;
    
//     // Solid white circle background
//     context.fillStyle = '#FFFFFF';
//     context.beginPath();
//     context.arc(256, 256, 240, 0, Math.PI * 2);
//     context.fill();
    
//     // Thick black border
//     context.strokeStyle = '#000000';
//     context.lineWidth = 16;
//     context.stroke();
    
//     // ✅ 4-digit number - HUGE and BOLD
//     context.fillStyle = '#000000';
//     context.font = 'bold 200px Arial';
//     context.textAlign = 'center';
//     context.textBaseline = 'middle';
//     context.fillText(displayNumber, 256, 256);
    
//     // Create sprite (billboard - always faces camera)
//     const texture = new THREE.CanvasTexture(canvas);
//     texture.minFilter = THREE.LinearFilter;
//     texture.magFilter = THREE.LinearFilter;
    
//     const material = new THREE.SpriteMaterial({ 
//       map: texture,
//       transparent: false,
//     });
    
//     const sprite = new THREE.Sprite(material);
//     sprite.scale.set(4, 4, 1); // Large circle
    
//     sprite.userData.ballNumber = ballNumber;
//     sprite.userData.displayNumber = displayNumber;
    
//     return sprite;
//   }

//   addBall(ballNumber, animate = true) {
//     console.log(`🎱 addBall called with ballNumber: ${ballNumber}, current ball count: ${this.balls.length}`);
    
//     // ✅ PREVENT DUPLICATES
//     const existingBall = this.balls.find(b => b.userData.ballNumber === ballNumber);
//     if (existingBall) {
//       console.warn(`⚠️ Ball ${ballNumber} already exists! Skipping duplicate.`);
//       return existingBall;
//     }
    
//     const ball = this.createBall(ballNumber);
    
//     if (animate) {
//       // Start above
//       const ballIndex = this.balls.length;
//       const angle = (ballIndex * Math.PI * 2) / Math.max(1, ballIndex + 1);
//       const radius = 3;
      
//       ball.position.set(
//         Math.cos(angle) * radius,
//         15,
//         Math.sin(angle) * radius
//       );
      
//       ball.scale.set(0, 0, 0);
//       this.animateBallEntry(ball, ballIndex);
//     } else {
//       const ballIndex = this.balls.length;
//       const angle = (ballIndex * Math.PI * 2) / Math.max(1, this.balls.length + 1);
//       const radius = 3;
//       const height = 0;
      
//       ball.position.set(
//         Math.cos(angle) * radius,
//         height,
//         Math.sin(angle) * radius
//       );
//     }
    
//     this.balls.push(ball);
//     this.scene.add(ball);
    
//     console.log(`✅ Ball ${ballNumber} added! Total balls now: ${this.balls.length}`);
//     console.log(`   All ball numbers:`, this.balls.map(b => b.userData.ballNumber));
    
//     return ball;
//   }
// /*eslint-disable*/
//   animateBallEntry(ball, ballIndex) {
//     const startY = ball.position.y;
//     const targetY = 0;
//     const duration = 2000;
//     const startTime = Date.now();
    
//     const animate = () => {
//       const elapsed = Date.now() - startTime;
//       const progress = Math.min(elapsed / duration, 1);
//       const easeProgress = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      
//       ball.position.y = startY - (startY - targetY) * easeProgress;
//       ball.scale.setScalar(easeProgress);
      
//       if (progress < 1) {
//         requestAnimationFrame(animate);
//       }
//     };
    
//     animate();
//   }

//   spinBalls(speed = 1) {
//     const time = Date.now() * 0.001;
    
//     this.balls.forEach((ball, index) => {
//       // Circular orbit
//       const radius = 3;
//       const angle = time * speed * 0.2 + index * (Math.PI * 2 / Math.max(this.balls.length, 1));
//       const height = Math.sin(time + index) * 1.5;
      
//       ball.position.x = Math.cos(angle) * radius;
//       ball.position.z = Math.sin(angle) * radius;
//       ball.position.y = height;
      
//       // Sprites automatically face camera - no rotation needed!
//     });
//   }

//   highlightBall(ballNumber) {
//     const ball = this.balls.find(b => b.userData.ballNumber === ballNumber);
//     if (!ball) return null;
    
//     // Add pulsing effect to highlighted ball
//     let time = 0;
//     const animateGlow = () => {
//       time += 0.05;
//       const scale = 1 + Math.sin(time) * 0.2;
//       ball.scale.set(4 * scale, 4 * scale, 1);
//       requestAnimationFrame(animateGlow);
//     };
//     animateGlow();
    
//     return ball;
//   }

//   extractBall(ballNumber, onComplete) {
//     const ballIndex = this.balls.findIndex(b => b.userData.ballNumber === ballNumber);
//     if (ballIndex === -1) return;
    
//     const ball = this.balls[ballIndex];
//     const startPos = ball.position.clone();
//     const targetPos = new THREE.Vector3(0, 8, 0);
//     const duration = 3000;
//     const startTime = Date.now();
    
//     const animate = () => {
//       const elapsed = Date.now() - startTime;
//       const progress = Math.min(elapsed / duration, 1);
      
//       ball.position.lerpVectors(startPos, targetPos, progress);
//       ball.scale.setScalar(4 + progress * 4);
      
//       if (progress < 1) {
//         requestAnimationFrame(animate);
//       } else {
//         this.balls.splice(ballIndex, 1);
//         this.scene.remove(ball);
//         if (onComplete) onComplete(ball);
//       }
//     };
    
//     animate();
//   }

//   rotateMachine(speed = 0.5) {
//     if (this.machine) {
//       this.machine.rotation.y += 0.005 * speed;
//     }
//   }

//   setRotationSpeed(speed) {
//     this.rotationSpeed = speed;
//   }

//   setBallSpinSpeed(speed) {
//     this.ballSpinSpeed = speed;
//   }

//   animate() {
//     if (!this.isInitialized) return;

//     this.animationFrameId = requestAnimationFrame(this.animate.bind(this));
    
//     this.controls.update();
//     this.rotateMachine(this.rotationSpeed);
//     this.spinBalls(this.ballSpinSpeed);
    
//     this.renderer.render(this.scene, this.camera);
//   }

//   onWindowResize() {
//     if (!this.container || !this.isInitialized) return;
    
//     const width = this.container.clientWidth;
//     const height = this.container.clientHeight;
    
//     this.camera.aspect = width / height;
//     this.camera.updateProjectionMatrix();
//     this.renderer.setSize(width, height);
//   }

//   dispose() {
//     console.log('🧹 Disposing Three.js scene');
    
//     if (this.animationFrameId) {
//       cancelAnimationFrame(this.animationFrameId);
//     }
    
//     window.removeEventListener('resize', this.onWindowResize.bind(this));
    
//     this.balls.forEach(ball => {
//       if (ball.geometry) ball.geometry.dispose();
//       if (ball.material) {
//         if (ball.material.map) ball.material.map.dispose();
//         ball.material.dispose();
//       }
//     });
    
//     if (this.machine) {
//       this.machine.traverse(child => {
//         if (child.geometry) child.geometry.dispose();
//         if (child.material) child.material.dispose();
//       });
//     }
    
//     if (this.renderer) {
//       this.renderer.dispose();
//       if (this.container && this.renderer.domElement) {
//         this.container.removeChild(this.renderer.domElement);
//       }
//     }
    
//     this.isInitialized = false;
//   }
// }
// // src/services/three/LotteryMachineScene.js
// // ✨ REVOLUTIONARY DESIGN - Just floating numbers, no balls!
// import * as THREE from 'three';
// import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

// export class LotteryMachineScene {
//   constructor(container) {
//     this.container = container;
//     this.scene = null;
//     this.camera = null;
//     this.renderer = null;
//     this.controls = null;
//     this.balls = []; // Actually just numbers now
//     this.machine = null;
//     this.animationFrameId = null;
//     this.rotationSpeed = 0.3;
//     this.ballSpinSpeed = 0.5;
//     this.isInitialized = false;
    
//     this.waitForContainerAndInit();
//   }

//   waitForContainerAndInit() {
//     const checkAndInit = () => {
//       if (!this.container) {
//         console.error('❌ Container is null');
//         return;
//       }

//       const width = this.container.clientWidth;
//       const height = this.container.clientHeight;

//       if (width > 0 && height > 0) {
//         console.log('✅ Container has size, initializing...');
//         this.init();
//       } else {
//         setTimeout(checkAndInit, 100);
//       }
//     };

//     checkAndInit();
//   }

//   async init() {
//     try {
//       console.log('🎨 Initializing Three.js scene...');
      
//       const width = this.container.clientWidth;
//       const height = this.container.clientHeight;

//       if (width === 0 || height === 0) {
//         throw new Error('Container has no dimensions');
//       }

//       // Create scene
//       this.scene = new THREE.Scene();
//       this.scene.background = new THREE.Color(0x0a0a1f);
//       this.scene.fog = new THREE.Fog(0x0a0a1f, 20, 50);
      
//       // Camera - positioned to see full machine with tall base
//       this.camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
//       this.camera.position.set(0, 0, 15); // Further back and centered
//       this.camera.lookAt(0, -2, 0); // Look slightly down to see base
      
//       // Renderer
//       this.renderer = new THREE.WebGLRenderer({ 
//         antialias: true,
//         alpha: true,
//         powerPreference: 'high-performance',
//       });
      
//       this.renderer.setSize(width, height);
//       this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
//       this.renderer.shadowMap.enabled = true;
//       this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
      
//       while (this.container.firstChild) {
//         this.container.removeChild(this.container.firstChild);
//       }
      
//       this.container.appendChild(this.renderer.domElement);
      
//       // Orbit controls
//       this.controls = new OrbitControls(this.camera, this.renderer.domElement);
//       this.controls.enableDamping = true;
//       this.controls.dampingFactor = 0.05;
//       this.controls.minDistance = 8;
//       this.controls.maxDistance = 20;
//       this.controls.autoRotate = true;
//       this.controls.autoRotateSpeed = 0.5;
      
//       this.setupLights();
//       this.createMachine();
      
//       window.addEventListener('resize', this.onWindowResize.bind(this));
      
//       this.isInitialized = true;
      
//       console.log('🎬 Starting animation loop...');
//       this.animate();
      
//       console.log('✅ Three.js scene initialized successfully');
      
//     } catch (error) {
//       console.error('❌ Failed to initialize scene:', error);
//       throw error;
//     }
//   }

//   setupLights() {
//     const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
//     this.scene.add(ambientLight);
    
//     const spotLight = new THREE.SpotLight(0xffffff, 2);
//     spotLight.position.set(0, 20, 0);
//     spotLight.castShadow = true;
//     this.scene.add(spotLight);
    
//     const frontLight = new THREE.DirectionalLight(0xffffff, 0.8);
//     frontLight.position.set(0, 5, 10);
//     this.scene.add(frontLight);
//   }

//   createMachine() {
//     const machineGroup = new THREE.Group();
    
//     // ✨ MATERIALS
//     const goldMaterial = new THREE.MeshStandardMaterial({
//       color: 0xDAA520,
//       metalness: 1.0,
//       roughness: 0.2,
//       emissive: 0xB8860B,
//       emissiveIntensity: 0.4,
//     });
    
//     const bronzeMaterial = new THREE.MeshStandardMaterial({
//       color: 0x8B6914,
//       metalness: 0.95,
//       roughness: 0.25,
//       emissive: 0x654321,
//       emissiveIntensity: 0.2,
//     });
    
//     // ✨✨✨ CRYSTAL CLEAR GLASS ELLIPSOID - BEAUTIFUL GLASS! ✨✨✨
//     const glassGeometry = new THREE.SphereGeometry(5, 64, 64);
//     glassGeometry.scale(1.5, 0.75, 1.5); // Flattened ellipsoid
    
//     const glassMaterial = new THREE.MeshPhysicalMaterial({
//       color: 0xFFFFFF, // Pure white for clarity
//       transparent: true,
//       opacity: 0.25, // More transparent but still visible
//       metalness: 0,
//       roughness: 0, // Perfectly smooth = shiny!
//       transmission: 0.85, // More see-through
//       thickness: 2.5, // Thick glass
//       clearcoat: 1.0,
//       clearcoatRoughness: 0, // Perfectly shiny clearcoat
//       side: THREE.DoubleSide,
//       envMapIntensity: 2.0, // Strong reflections!
//       ior: 1.52, // Real glass index of refraction
//       reflectivity: 0.9, // Very reflective
//     });
    
//     const glassEllipsoid = new THREE.Mesh(glassGeometry, glassMaterial);
//     glassEllipsoid.castShadow = true;
//     glassEllipsoid.receiveShadow = true;
//     machineGroup.add(glassEllipsoid);
    
//     // ✨ MINIMAL GOLDEN BANDS - Just a few key accent lines
//     // Main equator band - VERY THIN
//     const equatorBand = new THREE.Mesh(
//       new THREE.TorusGeometry(7.5, 0.06, 8, 64), // Ultra thin!
//       goldMaterial
//     );
//     equatorBand.rotation.x = Math.PI / 2;
//     equatorBand.castShadow = true;
//     machineGroup.add(equatorBand);
    
//     // Only 3 horizontal bands - minimal decoration
//     const bandYPositions = [2.5, 0, -2.5];
//     bandYPositions.forEach(y => {
//       const normalizedY = y / 3.75;
//       const bandRadius = 7.5 * Math.sqrt(1 - (normalizedY * normalizedY) * 0.4);
      
//       const band = new THREE.Mesh(
//         new THREE.TorusGeometry(bandRadius, 0.05, 8, 64), // Super thin!
//         goldMaterial
//       );
//       band.rotation.x = Math.PI / 2;
//       band.position.y = y;
//       band.castShadow = true;
//       machineGroup.add(band);
//     });
    
//     // Only 2 vertical meridian bands - minimal
//     for (let i = 0; i < 2; i++) {
//       const angle = (i / 2) * Math.PI;
//       const meridianBand = new THREE.Mesh(
//         new THREE.TorusGeometry(3.75, 0.05, 8, 64), // Super thin!
//         goldMaterial
//       );
//       meridianBand.rotation.y = angle;
//       meridianBand.scale.set(1.5, 0.75, 1.5);
//       meridianBand.castShadow = true;
//       machineGroup.add(meridianBand);
//     }
    
//     // Very few tiny golden spheres - just at key intersections
//     const numSpheres = 8; // Much fewer
//     const sphereHeights = [2.5, 0, -2.5];
    
//     for (let i = 0; i < numSpheres; i++) {
//       const angle = (i / numSpheres) * Math.PI * 2;
      
//       sphereHeights.forEach(y => {
//         const normalizedY = y / 3.75;
//         const radiusAtY = 7.5 * Math.sqrt(1 - (normalizedY * normalizedY) * 0.4);
        
//         const x = Math.cos(angle) * radiusAtY;
//         const z = Math.sin(angle) * radiusAtY;
        
//         const sphere = new THREE.Mesh(
//           new THREE.SphereGeometry(0.08, 6, 6), // Tiny!
//           goldMaterial
//         );
//         sphere.position.set(x, y, z);
//         sphere.castShadow = true;
//         machineGroup.add(sphere);
//       });
//     }
    
//     // ✨ TOP CAP - Crown on top
//     const topGroup = new THREE.Group();
    
//     const topCap = new THREE.Mesh(
//       new THREE.CylinderGeometry(1.5, 2.0, 0.8, 32),
//       bronzeMaterial
//     );
//     topCap.position.y = 4.2;
//     topCap.castShadow = true;
//     topGroup.add(topCap);
    
//     const topRing = new THREE.Mesh(
//       new THREE.TorusGeometry(2.1, 0.18, 16, 32),
//       goldMaterial
//     );
//     topRing.rotation.x = Math.PI / 2;
//     topRing.position.y = 3.8;
//     topGroup.add(topRing);
    
//     const spire = new THREE.Mesh(
//       new THREE.ConeGeometry(0.5, 1.0, 32),
//       goldMaterial
//     );
//     spire.position.y = 5.2;
//     spire.castShadow = true;
//     topGroup.add(spire);
    
//     const topSphere = new THREE.Mesh(
//       new THREE.SphereGeometry(0.35, 16, 16),
//       goldMaterial
//     );
//     topSphere.position.y = 5.9;
//     topGroup.add(topSphere);
    
//     machineGroup.add(topGroup);
    
//     // ✨✨✨ TALL VISIBLE BASE - PROMINENT BOX STRUCTURE ✨✨✨
//     const baseGroup = new THREE.Group();
    
//     // TALLER connection neck - very visible
//     const neck = new THREE.Mesh(
//       new THREE.CylinderGeometry(2.2, 2.8, 2.5, 32), // Taller!
//       bronzeMaterial
//     );
//     neck.position.y = -5.0; // Lower position
//     neck.castShadow = true;
//     baseGroup.add(neck);
    
//     const neckRing = new THREE.Mesh(
//       new THREE.TorusGeometry(2.9, 0.25, 16, 32),
//       goldMaterial
//     );
//     neckRing.rotation.x = Math.PI / 2;
//     neckRing.position.y = -3.6;
//     baseGroup.add(neckRing);
    
//     // ✨ TALL MAIN BASE BOX - VERY VISIBLE
//     const baseBox = new THREE.Mesh(
//       new THREE.BoxGeometry(9.0, 6.5, 9.0), // TALLER and WIDER!
//       bronzeMaterial
//     );
//     baseBox.position.y = -9.5; // Lower
//     baseBox.castShadow = true;
//     baseBox.receiveShadow = true;
//     baseGroup.add(baseBox);
    
//     // Vertical edge decorations - make box more defined
//     const verticalEdges = [
//       [-4.5, -9.5, -4.5], [4.5, -9.5, -4.5], 
//       [-4.5, -9.5, 4.5], [4.5, -9.5, 4.5]
//     ];
//     verticalEdges.forEach(([x, y, z]) => {
//       const edgePillar = new THREE.Mesh(
//         new THREE.CylinderGeometry(0.2, 0.2, 6.5, 16),
//         goldMaterial
//       );
//       edgePillar.position.set(x, y, z);
//       baseGroup.add(edgePillar);
//     });
    
//     // Golden corner decorations
//     const corners = [
//       [-4.5, -6.5, -4.5], [4.5, -6.5, -4.5], 
//       [-4.5, -6.5, 4.5], [4.5, -6.5, 4.5],
//       [-4.5, -12.5, -4.5], [4.5, -12.5, -4.5], 
//       [-4.5, -12.5, 4.5], [4.5, -12.5, 4.5]
//     ];
//     corners.forEach(([x, y, z]) => {
//       const cornerSphere = new THREE.Mesh(
//         new THREE.SphereGeometry(0.35, 12, 12),
//         goldMaterial
//       );
//       cornerSphere.position.set(x, y, z);
//       baseGroup.add(cornerSphere);
//     });
    
//     // Horizontal golden bands around the box
//     [-7.0, -9.5, -12.0].forEach(y => {
//       const edgeBand = new THREE.Mesh(
//         new THREE.TorusGeometry(6.4, 0.2, 16, 4),
//         goldMaterial
//       );
//       edgeBand.rotation.x = Math.PI / 2;
//       edgeBand.position.y = y;
//       baseGroup.add(edgeBand);
//     });
    
//     // ✨✨✨ LARGE PROMINENT FRONT GEAR (RED CIRCLE!) ✨✨✨
//     const gearBase = new THREE.Mesh(
//       new THREE.CylinderGeometry(3.0, 3.0, 1.0, 32), // LARGER!
//       bronzeMaterial
//     );
//     gearBase.rotation.z = Math.PI / 2;
//     gearBase.position.set(5.0, -9.5, 0);
//     gearBase.castShadow = true;
//     baseGroup.add(gearBase);
    
//     // Outer gear ring - LARGE
//     const gearOuter = new THREE.Mesh(
//       new THREE.TorusGeometry(2.8, 0.3, 16, 32),
//       goldMaterial
//     );
//     gearOuter.rotation.y = Math.PI / 2;
//     gearOuter.position.set(5.2, -9.5, 0);
//     baseGroup.add(gearOuter);
    
//     // Middle ring
//     const gearMiddle = new THREE.Mesh(
//       new THREE.TorusGeometry(1.8, 0.25, 16, 32),
//       goldMaterial
//     );
//     gearMiddle.rotation.y = Math.PI / 2;
//     gearMiddle.position.set(5.2, -9.5, 0);
//     baseGroup.add(gearMiddle);
    
//     // Inner ring
//     const gearInner = new THREE.Mesh(
//       new THREE.TorusGeometry(1.0, 0.2, 16, 32),
//       goldMaterial
//     );
//     gearInner.rotation.y = Math.PI / 2;
//     gearInner.position.set(5.2, -9.5, 0);
//     baseGroup.add(gearInner);
    
//     // Large center hub
//     const gearCenter = new THREE.Mesh(
//       new THREE.SphereGeometry(0.6, 20, 20),
//       goldMaterial
//     );
//     gearCenter.position.set(5.3, -9.5, 0);
//     gearCenter.castShadow = true;
//     baseGroup.add(gearCenter);
    
//     // Gear teeth around outer edge - more visible
//     for (let i = 0; i < 16; i++) {
//       const angle = (i / 16) * Math.PI * 2;
//       const toothY = -9.5 + Math.cos(angle) * 3.0;
//       const toothZ = Math.sin(angle) * 3.0;
      
//       const tooth = new THREE.Mesh(
//         new THREE.BoxGeometry(0.5, 0.25, 0.4),
//         goldMaterial
//       );
//       tooth.position.set(5.2, toothY, toothZ);
//       baseGroup.add(tooth);
//     }
    
//     // LONG crank handle
//     const crankShaft = new THREE.Mesh(
//       new THREE.CylinderGeometry(0.25, 0.25, 5.0, 16),
//       goldMaterial
//     );
//     crankShaft.rotation.z = Math.PI / 2;
//     crankShaft.position.set(7.8, -9.5, 0);
//     baseGroup.add(crankShaft);
    
//     const crankHandle = new THREE.Mesh(
//       new THREE.SphereGeometry(0.5, 16, 16),
//       goldMaterial
//     );
//     crankHandle.position.set(10.3, -9.5, 0);
//     crankHandle.castShadow = true;
//     baseGroup.add(crankHandle);
    
//     // Side decorative gears
//     for (let i = 0; i < 4; i++) {
//       const angle = (i / 4) * Math.PI * 2 + Math.PI / 4;
//       const gearX = Math.cos(angle) * 5.0;
//       const gearZ = Math.sin(angle) * 5.0;
      
//       const sideGear = new THREE.Mesh(
//         new THREE.CylinderGeometry(1.0, 1.0, 0.6, 8),
//         goldMaterial
//       );
//       sideGear.rotation.x = Math.PI / 2;
//       sideGear.position.set(gearX, -9.5, gearZ);
//       sideGear.lookAt(0, -9.5, 0);
//       baseGroup.add(sideGear);
      
//       const sideGearCenter = new THREE.Mesh(
//         new THREE.SphereGeometry(0.4, 12, 12),
//         goldMaterial
//       );
//       sideGearCenter.position.set(gearX * 1.01, -9.5, gearZ * 1.01);
//       baseGroup.add(sideGearCenter);
//     }
    
//     // WIDE bottom pedestal
//     const pedestal = new THREE.Mesh(
//       new THREE.CylinderGeometry(7.5, 8.0, 1.0, 32),
//       goldMaterial
//     );
//     pedestal.position.y = -13.2;
//     pedestal.castShadow = true;
//     baseGroup.add(pedestal);
    
//     const pedestalRing = new THREE.Mesh(
//       new THREE.TorusGeometry(8.2, 0.25, 16, 32),
//       goldMaterial
//     );
//     pedestalRing.rotation.x = Math.PI / 2;
//     pedestalRing.position.y = -12.7;
//     baseGroup.add(pedestalRing);
    
//     machineGroup.add(baseGroup);
    
//     // Add rim lighting
//     const rimLight1 = new THREE.PointLight(0xFFD700, 0.5, 15);
//     rimLight1.position.set(10, 0, 0);
//     machineGroup.add(rimLight1);
    
//     const rimLight2 = new THREE.PointLight(0xFFD700, 0.5, 15);
//     rimLight2.position.set(-10, 0, 0);
//     machineGroup.add(rimLight2);
    
//     this.machine = machineGroup;
//     this.scene.add(machineGroup);
    
//     console.log('✅ SOLID glass ellipsoid lottery machine created!');
//   }

//   // ✅ NEW: Create floating number - LAST 4 DIGITS ONLY
//   createBall(ballNumber) {
//     // ✅ Get last 4 digits only
//     const displayNumber = ballNumber.toString().slice(-4);
    
//     // Create a canvas with crisp rendering
//     const canvas = document.createElement('canvas');
//     canvas.width = 512;
//     canvas.height = 512;
//     const context = canvas.getContext('2d');
    
//     // Enable crisp rendering
//     context.imageSmoothingEnabled = false;
    
//     // Solid white circle background
//     context.fillStyle = '#FFFFFF';
//     context.beginPath();
//     context.arc(256, 256, 240, 0, Math.PI * 2);
//     context.fill();
    
//     // Thick black border
//     context.strokeStyle = '#000000';
//     context.lineWidth = 16;
//     context.stroke();
    
//     // ✅ 4-digit number - HUGE and BOLD
//     context.fillStyle = '#000000';
//     context.font = 'bold 200px Arial';
//     context.textAlign = 'center';
//     context.textBaseline = 'middle';
//     context.fillText(displayNumber, 256, 256);
    
//     // Create sprite (billboard - always faces camera)
//     const texture = new THREE.CanvasTexture(canvas);
//     texture.minFilter = THREE.LinearFilter;
//     texture.magFilter = THREE.LinearFilter;
    
//     const material = new THREE.SpriteMaterial({ 
//       map: texture,
//       transparent: false,
//     });
    
//     const sprite = new THREE.Sprite(material);
//     sprite.scale.set(4, 4, 1); // Large circle
    
//     sprite.userData.ballNumber = ballNumber;
//     sprite.userData.displayNumber = displayNumber;
    
//     return sprite;
//   }

//   addBall(ballNumber, animate = true) {
//     console.log(`🎱 addBall called with ballNumber: ${ballNumber}, current ball count: ${this.balls.length}`);
    
//     // ✅ PREVENT DUPLICATES
//     const existingBall = this.balls.find(b => b.userData.ballNumber === ballNumber);
//     if (existingBall) {
//       console.warn(`⚠️ Ball ${ballNumber} already exists! Skipping duplicate.`);
//       return existingBall;
//     }
    
//     const ball = this.createBall(ballNumber);
    
//     if (animate) {
//       // Start above
//       const ballIndex = this.balls.length;
//       const angle = (ballIndex * Math.PI * 2) / Math.max(1, ballIndex + 1);
//       const radius = 3;
      
//       ball.position.set(
//         Math.cos(angle) * radius,
//         15,
//         Math.sin(angle) * radius
//       );
      
//       ball.scale.set(0, 0, 0);
//       this.animateBallEntry(ball, ballIndex);
//     } else {
//       const ballIndex = this.balls.length;
//       const angle = (ballIndex * Math.PI * 2) / Math.max(1, this.balls.length + 1);
//       const radius = 3;
//       const height = 0;
      
//       ball.position.set(
//         Math.cos(angle) * radius,
//         height,
//         Math.sin(angle) * radius
//       );
//     }
    
//     this.balls.push(ball);
//     this.scene.add(ball);
    
//     console.log(`✅ Ball ${ballNumber} added! Total balls now: ${this.balls.length}`);
//     console.log(`   All ball numbers:`, this.balls.map(b => b.userData.ballNumber));
    
//     return ball;
//   }
// /*eslint-disable*/
//   animateBallEntry(ball, ballIndex) {
//     const startY = ball.position.y;
//     const targetY = 0;
//     const duration = 2000;
//     const startTime = Date.now();
    
//     const animate = () => {
//       const elapsed = Date.now() - startTime;
//       const progress = Math.min(elapsed / duration, 1);
//       const easeProgress = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      
//       ball.position.y = startY - (startY - targetY) * easeProgress;
//       ball.scale.setScalar(easeProgress);
      
//       if (progress < 1) {
//         requestAnimationFrame(animate);
//       }
//     };
    
//     animate();
//   }

//   spinBalls(speed = 1) {
//     const time = Date.now() * 0.001;
    
//     this.balls.forEach((ball, index) => {
//       // Circular orbit
//       const radius = 3;
//       const angle = time * speed * 0.2 + index * (Math.PI * 2 / Math.max(this.balls.length, 1));
//       const height = Math.sin(time + index) * 1.5;
      
//       ball.position.x = Math.cos(angle) * radius;
//       ball.position.z = Math.sin(angle) * radius;
//       ball.position.y = height;
      
//       // Sprites automatically face camera - no rotation needed!
//     });
//   }

//   highlightBall(ballNumber) {
//     const ball = this.balls.find(b => b.userData.ballNumber === ballNumber);
//     if (!ball) return null;
    
//     // Add pulsing effect to highlighted ball
//     let time = 0;
//     const animateGlow = () => {
//       time += 0.05;
//       const scale = 1 + Math.sin(time) * 0.2;
//       ball.scale.set(4 * scale, 4 * scale, 1);
//       requestAnimationFrame(animateGlow);
//     };
//     animateGlow();
    
//     return ball;
//   }

//   extractBall(ballNumber, onComplete) {
//     const ballIndex = this.balls.findIndex(b => b.userData.ballNumber === ballNumber);
//     if (ballIndex === -1) return;
    
//     const ball = this.balls[ballIndex];
//     const startPos = ball.position.clone();
//     const targetPos = new THREE.Vector3(0, 8, 0);
//     const duration = 3000;
//     const startTime = Date.now();
    
//     const animate = () => {
//       const elapsed = Date.now() - startTime;
//       const progress = Math.min(elapsed / duration, 1);
      
//       ball.position.lerpVectors(startPos, targetPos, progress);
//       ball.scale.setScalar(4 + progress * 4);
      
//       if (progress < 1) {
//         requestAnimationFrame(animate);
//       } else {
//         this.balls.splice(ballIndex, 1);
//         this.scene.remove(ball);
//         if (onComplete) onComplete(ball);
//       }
//     };
    
//     animate();
//   }

//   rotateMachine(speed = 0.5) {
//     if (this.machine) {
//       this.machine.rotation.y += 0.005 * speed;
//     }
//   }

//   setRotationSpeed(speed) {
//     this.rotationSpeed = speed;
//   }

//   setBallSpinSpeed(speed) {
//     this.ballSpinSpeed = speed;
//   }

//   animate() {
//     if (!this.isInitialized) return;

//     this.animationFrameId = requestAnimationFrame(this.animate.bind(this));
    
//     this.controls.update();
//     this.rotateMachine(this.rotationSpeed);
//     this.spinBalls(this.ballSpinSpeed);
    
//     this.renderer.render(this.scene, this.camera);
//   }

//   onWindowResize() {
//     if (!this.container || !this.isInitialized) return;
    
//     const width = this.container.clientWidth;
//     const height = this.container.clientHeight;
    
//     this.camera.aspect = width / height;
//     this.camera.updateProjectionMatrix();
//     this.renderer.setSize(width, height);
//   }

//   dispose() {
//     console.log('🧹 Disposing Three.js scene');
    
//     if (this.animationFrameId) {
//       cancelAnimationFrame(this.animationFrameId);
//     }
    
//     window.removeEventListener('resize', this.onWindowResize.bind(this));
    
//     this.balls.forEach(ball => {
//       if (ball.geometry) ball.geometry.dispose();
//       if (ball.material) {
//         if (ball.material.map) ball.material.map.dispose();
//         ball.material.dispose();
//       }
//     });
    
//     if (this.machine) {
//       this.machine.traverse(child => {
//         if (child.geometry) child.geometry.dispose();
//         if (child.material) child.material.dispose();
//       });
//     }
    
//     if (this.renderer) {
//       this.renderer.dispose();
//       if (this.container && this.renderer.domElement) {
//         this.container.removeChild(this.renderer.domElement);
//       }
//     }
    
//     this.isInitialized = false;
//   }
// }
// // src/services/three/LotteryMachineScene.js
// // ✨ REVOLUTIONARY DESIGN - Just floating numbers, no balls!
// import * as THREE from 'three';
// import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

// export class LotteryMachineScene {
//   constructor(container) {
//     this.container = container;
//     this.scene = null;
//     this.camera = null;
//     this.renderer = null;
//     this.controls = null;
//     this.balls = []; // Actually just numbers now
//     this.machine = null;
//     this.animationFrameId = null;
//     this.rotationSpeed = 0.3;
//     this.ballSpinSpeed = 0.5;
//     this.isInitialized = false;
    
//     this.waitForContainerAndInit();
//   }

//   waitForContainerAndInit() {
//     const checkAndInit = () => {
//       if (!this.container) {
//         console.error('❌ Container is null');
//         return;
//       }

//       const width = this.container.clientWidth;
//       const height = this.container.clientHeight;

//       if (width > 0 && height > 0) {
//         console.log('✅ Container has size, initializing...');
//         this.init();
//       } else {
//         setTimeout(checkAndInit, 100);
//       }
//     };

//     checkAndInit();
//   }

//   async init() {
//     try {
//       console.log('🎨 Initializing Three.js scene...');
      
//       const width = this.container.clientWidth;
//       const height = this.container.clientHeight;

//       if (width === 0 || height === 0) {
//         throw new Error('Container has no dimensions');
//       }

//       // Create scene
//       this.scene = new THREE.Scene();
//       this.scene.background = new THREE.Color(0x0a0a1f);
//       this.scene.fog = new THREE.Fog(0x0a0a1f, 20, 50);
      
//       // Camera - positioned to see flatter machine better
//       this.camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
//       this.camera.position.set(0, 5, 12); // Slightly higher, further back
//       this.camera.lookAt(0, 0, 0);
      
//       // Renderer
//       this.renderer = new THREE.WebGLRenderer({ 
//         antialias: true,
//         alpha: true,
//         powerPreference: 'high-performance',
//       });
      
//       this.renderer.setSize(width, height);
//       this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
//       this.renderer.shadowMap.enabled = true;
//       this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
      
//       while (this.container.firstChild) {
//         this.container.removeChild(this.container.firstChild);
//       }
      
//       this.container.appendChild(this.renderer.domElement);
      
//       // Orbit controls
//       this.controls = new OrbitControls(this.camera, this.renderer.domElement);
//       this.controls.enableDamping = true;
//       this.controls.dampingFactor = 0.05;
//       this.controls.minDistance = 8;
//       this.controls.maxDistance = 20;
//       this.controls.autoRotate = true;
//       this.controls.autoRotateSpeed = 0.5;
      
//       this.setupLights();
//       this.createMachine();
      
//       window.addEventListener('resize', this.onWindowResize.bind(this));
      
//       this.isInitialized = true;
      
//       console.log('🎬 Starting animation loop...');
//       this.animate();
      
//       console.log('✅ Three.js scene initialized successfully');
      
//     } catch (error) {
//       console.error('❌ Failed to initialize scene:', error);
//       throw error;
//     }
//   }

//   setupLights() {
//     const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
//     this.scene.add(ambientLight);
    
//     const spotLight = new THREE.SpotLight(0xffffff, 2);
//     spotLight.position.set(0, 20, 0);
//     spotLight.castShadow = true;
//     this.scene.add(spotLight);
    
//     const frontLight = new THREE.DirectionalLight(0xffffff, 0.8);
//     frontLight.position.set(0, 5, 10);
//     this.scene.add(frontLight);
//   }

//   createMachine() {
//     const machineGroup = new THREE.Group();
    
//     // ✨ MATERIALS
//     const goldMaterial = new THREE.MeshStandardMaterial({
//       color: 0xDAA520,
//       metalness: 1.0,
//       roughness: 0.2,
//       emissive: 0xB8860B,
//       emissiveIntensity: 0.4,
//     });
    
//     const bronzeMaterial = new THREE.MeshStandardMaterial({
//       color: 0x8B6914,
//       metalness: 0.95,
//       roughness: 0.25,
//       emissive: 0x654321,
//       emissiveIntensity: 0.2,
//     });
    
//     // ✨✨✨ SOLID GLASS ELLIPSOID - THICK AND VISIBLE! ✨✨✨
//     const glassGeometry = new THREE.SphereGeometry(5, 64, 64);
//     glassGeometry.scale(1.5, 0.75, 1.5); // Flattened ellipsoid
    
//     const glassMaterial = new THREE.MeshPhysicalMaterial({
//       color: 0xCCDDEE, // Slightly tinted blue-white
//       transparent: true,
//       opacity: 0.35, // MUCH MORE VISIBLE!
//       metalness: 0.1,
//       roughness: 0.05,
//       transmission: 0.7, // Less transmission = more visible
//       thickness: 2.0, // Thicker glass
//       clearcoat: 1.0,
//       clearcoatRoughness: 0.05,
//       side: THREE.DoubleSide,
//       envMapIntensity: 1.5,
//       ior: 1.5, // Glass refraction
//     });
    
//     const glassEllipsoid = new THREE.Mesh(glassGeometry, glassMaterial);
//     glassEllipsoid.castShadow = true;
//     glassEllipsoid.receiveShadow = true;
//     machineGroup.add(glassEllipsoid);
    
//     // ✨ THIN GOLDEN BANDS - Just decorative accent lines
//     // Main equator band - THIN!
//     const equatorBand = new THREE.Mesh(
//       new THREE.TorusGeometry(7.5, 0.08, 12, 64), // 0.08 = very thin!
//       goldMaterial
//     );
//     equatorBand.rotation.x = Math.PI / 2;
//     equatorBand.castShadow = true;
//     machineGroup.add(equatorBand);
    
//     // Horizontal decorative bands - VERY THIN
//     const bandYPositions = [3.0, 2.0, 1.0, -1.0, -2.0, -3.0];
//     bandYPositions.forEach(y => {
//       const normalizedY = y / 3.75;
//       const bandRadius = 7.5 * Math.sqrt(1 - (normalizedY * normalizedY) * 0.4);
      
//       const band = new THREE.Mesh(
//         new THREE.TorusGeometry(bandRadius, 0.06, 12, 64), // 0.06 = super thin!
//         goldMaterial
//       );
//       band.rotation.x = Math.PI / 2;
//       band.position.y = y;
//       band.castShadow = true;
//       machineGroup.add(band);
//     });
    
//     // Vertical meridian bands - THIN arcs
//     for (let i = 0; i < 4; i++) {
//       const angle = (i / 4) * Math.PI * 2;
//       const meridianBand = new THREE.Mesh(
//         new THREE.TorusGeometry(3.75, 0.06, 12, 64), // Thin!
//         goldMaterial
//       );
//       meridianBand.rotation.y = angle;
//       meridianBand.scale.set(1.5, 0.75, 1.5);
//       meridianBand.castShadow = true;
//       machineGroup.add(meridianBand);
//     }
    
//     // Small golden spheres at band intersections - SMALLER
//     const numSpheres = 16; // Fewer spheres
//     const sphereHeights = [3.0, 1.5, 0, -1.5, -3.0];
    
//     for (let i = 0; i < numSpheres; i++) {
//       const angle = (i / numSpheres) * Math.PI * 2;
      
//       sphereHeights.forEach(y => {
//         const normalizedY = y / 3.75;
//         const radiusAtY = 7.5 * Math.sqrt(1 - (normalizedY * normalizedY) * 0.4);
        
//         const x = Math.cos(angle) * radiusAtY;
//         const z = Math.sin(angle) * radiusAtY;
        
//         const sphere = new THREE.Mesh(
//           new THREE.SphereGeometry(0.1, 8, 8), // Small!
//           goldMaterial
//         );
//         sphere.position.set(x, y, z);
//         sphere.castShadow = true;
//         machineGroup.add(sphere);
//       });
//     }
    
//     // ✨ TOP CAP - Crown on top
//     const topGroup = new THREE.Group();
    
//     const topCap = new THREE.Mesh(
//       new THREE.CylinderGeometry(1.5, 2.0, 0.8, 32),
//       bronzeMaterial
//     );
//     topCap.position.y = 4.2;
//     topCap.castShadow = true;
//     topGroup.add(topCap);
    
//     const topRing = new THREE.Mesh(
//       new THREE.TorusGeometry(2.1, 0.18, 16, 32),
//       goldMaterial
//     );
//     topRing.rotation.x = Math.PI / 2;
//     topRing.position.y = 3.8;
//     topGroup.add(topRing);
    
//     const spire = new THREE.Mesh(
//       new THREE.ConeGeometry(0.5, 1.0, 32),
//       goldMaterial
//     );
//     spire.position.y = 5.2;
//     spire.castShadow = true;
//     topGroup.add(spire);
    
//     const topSphere = new THREE.Mesh(
//       new THREE.SphereGeometry(0.35, 16, 16),
//       goldMaterial
//     );
//     topSphere.position.y = 5.9;
//     topGroup.add(topSphere);
    
//     machineGroup.add(topGroup);
    
//     // ✨✨✨ BASE - LARGE VISIBLE BOX STRUCTURE ✨✨✨
//     const baseGroup = new THREE.Group();
    
//     // Connection neck from glass bottom to base - VISIBLE
//     const neck = new THREE.Mesh(
//       new THREE.CylinderGeometry(2.0, 2.5, 1.5, 32),
//       bronzeMaterial
//     );
//     neck.position.y = -4.5;
//     neck.castShadow = true;
//     baseGroup.add(neck);
    
//     const neckRing = new THREE.Mesh(
//       new THREE.TorusGeometry(2.6, 0.2, 16, 32),
//       goldMaterial
//     );
//     neckRing.rotation.x = Math.PI / 2;
//     neckRing.position.y = -3.8;
//     baseGroup.add(neckRing);
    
//     // ✨ MAIN BASE BOX - LARGE CUBE-LIKE STRUCTURE (RED MARKED!)
//     const baseBox = new THREE.Mesh(
//       new THREE.BoxGeometry(8.0, 5.0, 8.0), // LARGE box!
//       bronzeMaterial
//     );
//     baseBox.position.y = -8.0;
//     baseBox.castShadow = true;
//     baseGroup.add(baseBox);
    
//     // Golden corner decorations
//     const corners = [
//       [-4, -8, -4], [4, -8, -4], [-4, -8, 4], [4, -8, 4]
//     ];
//     corners.forEach(([x, y, z]) => {
//       const cornerSphere = new THREE.Mesh(
//         new THREE.SphereGeometry(0.3, 16, 16),
//         goldMaterial
//       );
//       cornerSphere.position.set(x, y, z);
//       baseGroup.add(cornerSphere);
//     });
    
//     // Golden edge bands on the box - horizontal lines
//     [-6.0, -8.0, -10.0].forEach(y => {
//       const edgeBand = new THREE.Mesh(
//         new THREE.TorusGeometry(5.7, 0.15, 16, 4),
//         goldMaterial
//       );
//       edgeBand.rotation.x = Math.PI / 2;
//       edgeBand.position.y = y;
//       baseGroup.add(edgeBand);
//     });
    
//     // ✨✨✨ FRONT GEAR MECHANISM (RED CIRCLE!) ✨✨✨
//     // Large circular gear on the front face
//     const gearBase = new THREE.Mesh(
//       new THREE.CylinderGeometry(2.5, 2.5, 0.8, 32),
//       bronzeMaterial
//     );
//     gearBase.rotation.z = Math.PI / 2;
//     gearBase.position.set(4.5, -8.0, 0);
//     gearBase.castShadow = true;
//     baseGroup.add(gearBase);
    
//     // Outer gear ring - LARGE AND VISIBLE
//     const gearOuter = new THREE.Mesh(
//       new THREE.TorusGeometry(2.3, 0.25, 16, 32),
//       goldMaterial
//     );
//     gearOuter.rotation.y = Math.PI / 2;
//     gearOuter.position.set(4.6, -8.0, 0);
//     baseGroup.add(gearOuter);
    
//     // Middle ring
//     const gearMiddle = new THREE.Mesh(
//       new THREE.TorusGeometry(1.5, 0.2, 16, 32),
//       goldMaterial
//     );
//     gearMiddle.rotation.y = Math.PI / 2;
//     gearMiddle.position.set(4.6, -8.0, 0);
//     baseGroup.add(gearMiddle);
    
//     // Inner ring
//     const gearInner = new THREE.Mesh(
//       new THREE.TorusGeometry(0.8, 0.15, 16, 32),
//       goldMaterial
//     );
//     gearInner.rotation.y = Math.PI / 2;
//     gearInner.position.set(4.6, -8.0, 0);
//     baseGroup.add(gearInner);
    
//     // Center hub - LARGE
//     const gearCenter = new THREE.Mesh(
//       new THREE.SphereGeometry(0.5, 20, 20),
//       goldMaterial
//     );
//     gearCenter.position.set(4.7, -8.0, 0);
//     gearCenter.castShadow = true;
//     baseGroup.add(gearCenter);
    
//     // Gear teeth around the outer edge (12 teeth)
//     for (let i = 0; i < 12; i++) {
//       const angle = (i / 12) * Math.PI * 2;
//       const toothY = -8.0 + Math.cos(angle) * 2.5;
//       const toothZ = Math.sin(angle) * 2.5;
      
//       const tooth = new THREE.Mesh(
//         new THREE.BoxGeometry(0.4, 0.2, 0.3),
//         goldMaterial
//       );
//       tooth.position.set(4.6, toothY, toothZ);
//       baseGroup.add(tooth);
//     }
    
//     // Crank handle extending from gear - LONG
//     const crankShaft = new THREE.Mesh(
//       new THREE.CylinderGeometry(0.2, 0.2, 4.0, 16),
//       goldMaterial
//     );
//     crankShaft.rotation.z = Math.PI / 2;
//     crankShaft.position.set(6.7, -8.0, 0);
//     baseGroup.add(crankShaft);
    
//     const crankHandle = new THREE.Mesh(
//       new THREE.SphereGeometry(0.4, 16, 16),
//       goldMaterial
//     );
//     crankHandle.position.set(8.7, -8.0, 0);
//     crankHandle.castShadow = true;
//     baseGroup.add(crankHandle);
    
//     // Side decorative gears (4 on sides)
//     for (let i = 0; i < 4; i++) {
//       const angle = (i / 4) * Math.PI * 2 + Math.PI / 4;
//       const gearX = Math.cos(angle) * 4.5;
//       const gearZ = Math.sin(angle) * 4.5;
      
//       const sideGear = new THREE.Mesh(
//         new THREE.CylinderGeometry(0.8, 0.8, 0.5, 8),
//         goldMaterial
//       );
//       sideGear.rotation.x = Math.PI / 2;
//       sideGear.position.set(gearX, -8.0, gearZ);
//       sideGear.lookAt(0, -8.0, 0);
//       baseGroup.add(sideGear);
      
//       // Center of side gear
//       const sideGearCenter = new THREE.Mesh(
//         new THREE.SphereGeometry(0.3, 12, 12),
//         goldMaterial
//       );
//       sideGearCenter.position.set(gearX * 1.01, -8.0, gearZ * 1.01);
//       baseGroup.add(sideGearCenter);
//     }
    
//     // Bottom pedestal - WIDE
//     const pedestal = new THREE.Mesh(
//       new THREE.CylinderGeometry(6.5, 7.0, 0.8, 32),
//       goldMaterial
//     );
//     pedestal.position.y = -10.8;
//     pedestal.castShadow = true;
//     baseGroup.add(pedestal);
    
//     // Pedestal ring
//     const pedestalRing = new THREE.Mesh(
//       new THREE.TorusGeometry(7.1, 0.2, 16, 32),
//       goldMaterial
//     );
//     pedestalRing.rotation.x = Math.PI / 2;
//     pedestalRing.position.y = -10.4;
//     baseGroup.add(pedestalRing);
    
//     machineGroup.add(baseGroup);
    
//     // Add rim lighting
//     const rimLight1 = new THREE.PointLight(0xFFD700, 0.5, 15);
//     rimLight1.position.set(10, 0, 0);
//     machineGroup.add(rimLight1);
    
//     const rimLight2 = new THREE.PointLight(0xFFD700, 0.5, 15);
//     rimLight2.position.set(-10, 0, 0);
//     machineGroup.add(rimLight2);
    
//     this.machine = machineGroup;
//     this.scene.add(machineGroup);
    
//     console.log('✅ SOLID glass ellipsoid lottery machine created!');
//   }

//   // ✅ NEW: Create floating number - LAST 4 DIGITS ONLY
//   createBall(ballNumber) {
//     // ✅ Get last 4 digits only
//     const displayNumber = ballNumber.toString().slice(-4);
    
//     // Create a canvas with crisp rendering
//     const canvas = document.createElement('canvas');
//     canvas.width = 512;
//     canvas.height = 512;
//     const context = canvas.getContext('2d');
    
//     // Enable crisp rendering
//     context.imageSmoothingEnabled = false;
    
//     // Solid white circle background
//     context.fillStyle = '#FFFFFF';
//     context.beginPath();
//     context.arc(256, 256, 240, 0, Math.PI * 2);
//     context.fill();
    
//     // Thick black border
//     context.strokeStyle = '#000000';
//     context.lineWidth = 16;
//     context.stroke();
    
//     // ✅ 4-digit number - HUGE and BOLD
//     context.fillStyle = '#000000';
//     context.font = 'bold 200px Arial';
//     context.textAlign = 'center';
//     context.textBaseline = 'middle';
//     context.fillText(displayNumber, 256, 256);
    
//     // Create sprite (billboard - always faces camera)
//     const texture = new THREE.CanvasTexture(canvas);
//     texture.minFilter = THREE.LinearFilter;
//     texture.magFilter = THREE.LinearFilter;
    
//     const material = new THREE.SpriteMaterial({ 
//       map: texture,
//       transparent: false,
//     });
    
//     const sprite = new THREE.Sprite(material);
//     sprite.scale.set(4, 4, 1); // Large circle
    
//     sprite.userData.ballNumber = ballNumber;
//     sprite.userData.displayNumber = displayNumber;
    
//     return sprite;
//   }

//   addBall(ballNumber, animate = true) {
//     console.log(`🎱 addBall called with ballNumber: ${ballNumber}, current ball count: ${this.balls.length}`);
    
//     // ✅ PREVENT DUPLICATES
//     const existingBall = this.balls.find(b => b.userData.ballNumber === ballNumber);
//     if (existingBall) {
//       console.warn(`⚠️ Ball ${ballNumber} already exists! Skipping duplicate.`);
//       return existingBall;
//     }
    
//     const ball = this.createBall(ballNumber);
    
//     if (animate) {
//       // Start above
//       const ballIndex = this.balls.length;
//       const angle = (ballIndex * Math.PI * 2) / Math.max(1, ballIndex + 1);
//       const radius = 3;
      
//       ball.position.set(
//         Math.cos(angle) * radius,
//         15,
//         Math.sin(angle) * radius
//       );
      
//       ball.scale.set(0, 0, 0);
//       this.animateBallEntry(ball, ballIndex);
//     } else {
//       const ballIndex = this.balls.length;
//       const angle = (ballIndex * Math.PI * 2) / Math.max(1, this.balls.length + 1);
//       const radius = 3;
//       const height = 0;
      
//       ball.position.set(
//         Math.cos(angle) * radius,
//         height,
//         Math.sin(angle) * radius
//       );
//     }
    
//     this.balls.push(ball);
//     this.scene.add(ball);
    
//     console.log(`✅ Ball ${ballNumber} added! Total balls now: ${this.balls.length}`);
//     console.log(`   All ball numbers:`, this.balls.map(b => b.userData.ballNumber));
    
//     return ball;
//   }
// /*eslint-disable*/
//   animateBallEntry(ball, ballIndex) {
//     const startY = ball.position.y;
//     const targetY = 0;
//     const duration = 2000;
//     const startTime = Date.now();
    
//     const animate = () => {
//       const elapsed = Date.now() - startTime;
//       const progress = Math.min(elapsed / duration, 1);
//       const easeProgress = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      
//       ball.position.y = startY - (startY - targetY) * easeProgress;
//       ball.scale.setScalar(easeProgress);
      
//       if (progress < 1) {
//         requestAnimationFrame(animate);
//       }
//     };
    
//     animate();
//   }

//   spinBalls(speed = 1) {
//     const time = Date.now() * 0.001;
    
//     this.balls.forEach((ball, index) => {
//       // Circular orbit
//       const radius = 3;
//       const angle = time * speed * 0.2 + index * (Math.PI * 2 / Math.max(this.balls.length, 1));
//       const height = Math.sin(time + index) * 1.5;
      
//       ball.position.x = Math.cos(angle) * radius;
//       ball.position.z = Math.sin(angle) * radius;
//       ball.position.y = height;
      
//       // Sprites automatically face camera - no rotation needed!
//     });
//   }

//   highlightBall(ballNumber) {
//     const ball = this.balls.find(b => b.userData.ballNumber === ballNumber);
//     if (!ball) return null;
    
//     // Add pulsing effect to highlighted ball
//     let time = 0;
//     const animateGlow = () => {
//       time += 0.05;
//       const scale = 1 + Math.sin(time) * 0.2;
//       ball.scale.set(4 * scale, 4 * scale, 1);
//       requestAnimationFrame(animateGlow);
//     };
//     animateGlow();
    
//     return ball;
//   }

//   extractBall(ballNumber, onComplete) {
//     const ballIndex = this.balls.findIndex(b => b.userData.ballNumber === ballNumber);
//     if (ballIndex === -1) return;
    
//     const ball = this.balls[ballIndex];
//     const startPos = ball.position.clone();
//     const targetPos = new THREE.Vector3(0, 8, 0);
//     const duration = 3000;
//     const startTime = Date.now();
    
//     const animate = () => {
//       const elapsed = Date.now() - startTime;
//       const progress = Math.min(elapsed / duration, 1);
      
//       ball.position.lerpVectors(startPos, targetPos, progress);
//       ball.scale.setScalar(4 + progress * 4);
      
//       if (progress < 1) {
//         requestAnimationFrame(animate);
//       } else {
//         this.balls.splice(ballIndex, 1);
//         this.scene.remove(ball);
//         if (onComplete) onComplete(ball);
//       }
//     };
    
//     animate();
//   }

//   rotateMachine(speed = 0.5) {
//     if (this.machine) {
//       this.machine.rotation.y += 0.005 * speed;
//     }
//   }

//   setRotationSpeed(speed) {
//     this.rotationSpeed = speed;
//   }

//   setBallSpinSpeed(speed) {
//     this.ballSpinSpeed = speed;
//   }

//   animate() {
//     if (!this.isInitialized) return;

//     this.animationFrameId = requestAnimationFrame(this.animate.bind(this));
    
//     this.controls.update();
//     this.rotateMachine(this.rotationSpeed);
//     this.spinBalls(this.ballSpinSpeed);
    
//     this.renderer.render(this.scene, this.camera);
//   }

//   onWindowResize() {
//     if (!this.container || !this.isInitialized) return;
    
//     const width = this.container.clientWidth;
//     const height = this.container.clientHeight;
    
//     this.camera.aspect = width / height;
//     this.camera.updateProjectionMatrix();
//     this.renderer.setSize(width, height);
//   }

//   dispose() {
//     console.log('🧹 Disposing Three.js scene');
    
//     if (this.animationFrameId) {
//       cancelAnimationFrame(this.animationFrameId);
//     }
    
//     window.removeEventListener('resize', this.onWindowResize.bind(this));
    
//     this.balls.forEach(ball => {
//       if (ball.geometry) ball.geometry.dispose();
//       if (ball.material) {
//         if (ball.material.map) ball.material.map.dispose();
//         ball.material.dispose();
//       }
//     });
    
//     if (this.machine) {
//       this.machine.traverse(child => {
//         if (child.geometry) child.geometry.dispose();
//         if (child.material) child.material.dispose();
//       });
//     }
    
//     if (this.renderer) {
//       this.renderer.dispose();
//       if (this.container && this.renderer.domElement) {
//         this.container.removeChild(this.renderer.domElement);
//       }
//     }
    
//     this.isInitialized = false;
//   }
// }
// // src/services/three/LotteryMachineScene.js
// // ✨ REVOLUTIONARY DESIGN - Just floating numbers, no balls!
// import * as THREE from 'three';
// import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

// export class LotteryMachineScene {
//   constructor(container) {
//     this.container = container;
//     this.scene = null;
//     this.camera = null;
//     this.renderer = null;
//     this.controls = null;
//     this.balls = []; // Actually just numbers now
//     this.machine = null;
//     this.animationFrameId = null;
//     this.rotationSpeed = 0.3;
//     this.ballSpinSpeed = 0.5;
//     this.isInitialized = false;
    
//     this.waitForContainerAndInit();
//   }

//   waitForContainerAndInit() {
//     const checkAndInit = () => {
//       if (!this.container) {
//         console.error('❌ Container is null');
//         return;
//       }

//       const width = this.container.clientWidth;
//       const height = this.container.clientHeight;

//       if (width > 0 && height > 0) {
//         console.log('✅ Container has size, initializing...');
//         this.init();
//       } else {
//         setTimeout(checkAndInit, 100);
//       }
//     };

//     checkAndInit();
//   }

//   async init() {
//     try {
//       console.log('🎨 Initializing Three.js scene...');
      
//       const width = this.container.clientWidth;
//       const height = this.container.clientHeight;

//       if (width === 0 || height === 0) {
//         throw new Error('Container has no dimensions');
//       }

//       // Create scene
//       this.scene = new THREE.Scene();
//       this.scene.background = new THREE.Color(0x0a0a1f);
//       this.scene.fog = new THREE.Fog(0x0a0a1f, 20, 50);
      
//       // Camera
//       this.camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
//       this.camera.position.set(0, 3, 10);
//       this.camera.lookAt(0, 0, 0);
      
//       // Renderer
//       this.renderer = new THREE.WebGLRenderer({ 
//         antialias: true,
//         alpha: true,
//         powerPreference: 'high-performance',
//       });
      
//       this.renderer.setSize(width, height);
//       this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
//       this.renderer.shadowMap.enabled = true;
//       this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
      
//       while (this.container.firstChild) {
//         this.container.removeChild(this.container.firstChild);
//       }
      
//       this.container.appendChild(this.renderer.domElement);
      
//       // Orbit controls
//       this.controls = new OrbitControls(this.camera, this.renderer.domElement);
//       this.controls.enableDamping = true;
//       this.controls.dampingFactor = 0.05;
//       this.controls.minDistance = 8;
//       this.controls.maxDistance = 20;
//       this.controls.autoRotate = true;
//       this.controls.autoRotateSpeed = 0.5;
      
//       this.setupLights();
//       this.createMachine();
      
//       window.addEventListener('resize', this.onWindowResize.bind(this));
      
//       this.isInitialized = true;
      
//       console.log('🎬 Starting animation loop...');
//       this.animate();
      
//       console.log('✅ Three.js scene initialized successfully');
      
//     } catch (error) {
//       console.error('❌ Failed to initialize scene:', error);
//       throw error;
//     }
//   }

//   setupLights() {
//     const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
//     this.scene.add(ambientLight);
    
//     const spotLight = new THREE.SpotLight(0xffffff, 2);
//     spotLight.position.set(0, 20, 0);
//     spotLight.castShadow = true;
//     this.scene.add(spotLight);
    
//     const frontLight = new THREE.DirectionalLight(0xffffff, 0.8);
//     frontLight.position.set(0, 5, 10);
//     this.scene.add(frontLight);
//   }

//   createMachine() {
//     const machineGroup = new THREE.Group();
    
//     // ✨ GLASS OVAL CONTAINER - More transparent like reference
//     const containerGeometry = new THREE.SphereGeometry(5, 64, 64);
//     containerGeometry.scale(1, 1.3, 1); // Oval shape
    
//     const containerMaterial = new THREE.MeshPhysicalMaterial({
//       color: 0xffffff,
//       transparent: true,
//       opacity: 0.04, // ✅ Much more transparent
//       metalness: 0,
//       roughness: 0.02,
//       transmission: 0.98,
//       thickness: 0.3,
//       side: THREE.DoubleSide,
//     });
    
//     const container = new THREE.Mesh(containerGeometry, containerMaterial);
//     machineGroup.add(container);
    
//     // ✨ GOLDEN METAL FRAMEWORK - Like reference image
//     const goldMaterial = new THREE.MeshStandardMaterial({
//       color: 0xd4af37, // Rich gold
//       metalness: 0.95,
//       roughness: 0.15,
//       emissive: 0xb8860b,
//       emissiveIntensity: 0.2,
//     });
    
//     // Horizontal rings (more of them)
//     const ringPositions = [5, 3, 1, -1, -3, -5];
//     ringPositions.forEach(y => {
//       const ringGeometry = new THREE.TorusGeometry(5.3, 0.12, 16, 64);
//       const ring = new THREE.Mesh(ringGeometry, goldMaterial);
//       ring.rotation.x = Math.PI / 2;
//       ring.position.y = y;
//       ring.castShadow = true;
//       machineGroup.add(ring);
//     });
    
//     // ✨ VERTICAL BARS - Create cage look
//     const numVerticalBars = 12;
//     for (let i = 0; i < numVerticalBars; i++) {
//       const angle = (i / numVerticalBars) * Math.PI * 2;
//       const x = Math.cos(angle) * 5.3;
//       const z = Math.sin(angle) * 5.3;
      
//       const barGeometry = new THREE.CylinderGeometry(0.08, 0.08, 10.5, 16);
//       const bar = new THREE.Mesh(barGeometry, goldMaterial);
//       bar.position.set(x, 0, z);
//       bar.castShadow = true;
//       machineGroup.add(bar);
      
//       // ✨ GOLDEN SPHERES at intersections
//       ringPositions.forEach(y => {
//         const sphereGeometry = new THREE.SphereGeometry(0.15, 16, 16);
//         const sphere = new THREE.Mesh(sphereGeometry, goldMaterial);
//         sphere.position.set(x, y, z);
//         sphere.castShadow = true;
//         machineGroup.add(sphere);
//       });
//     }
    
//     // ✨ ORNATE BASE - Steampunk style
//     const baseGeometry = new THREE.CylinderGeometry(2, 3.5, 4, 32);
//     const baseMaterial = new THREE.MeshStandardMaterial({
//       color: 0x8B4513, // Bronze/brown
//       metalness: 0.8,
//       roughness: 0.3,
//       emissive: 0x654321,
//       emissiveIntensity: 0.1,
//     });
//     const base = new THREE.Mesh(baseGeometry, baseMaterial);
//     base.position.y = -7;
//     base.castShadow = true;
//     machineGroup.add(base);
    
//     // Base details (decorative rings)
//     const baseRing1 = new THREE.Mesh(
//       new THREE.TorusGeometry(3.6, 0.15, 16, 32),
//       goldMaterial
//     );
//     baseRing1.rotation.x = Math.PI / 2;
//     baseRing1.position.y = -5.2;
//     machineGroup.add(baseRing1);
    
//     const baseRing2 = new THREE.Mesh(
//       new THREE.TorusGeometry(2.1, 0.15, 16, 32),
//       goldMaterial
//     );
//     baseRing2.rotation.x = Math.PI / 2;
//     baseRing2.position.y = -8.8;
//     machineGroup.add(baseRing2);
    
//     this.machine = machineGroup;
//     this.scene.add(machineGroup);
    
//     console.log('✅ Classic lottery cage created');
//   }

//   // ✅ NEW: Create floating number - LAST 4 DIGITS ONLY
//   createBall(ballNumber) {
//     // ✅ Get last 4 digits only
//     const displayNumber = ballNumber.toString().slice(-4);
    
//     // Create a canvas with crisp rendering
//     const canvas = document.createElement('canvas');
//     canvas.width = 512;
//     canvas.height = 512;
//     const context = canvas.getContext('2d');
    
//     // Enable crisp rendering
//     context.imageSmoothingEnabled = false;
    
//     // Solid white circle background
//     context.fillStyle = '#FFFFFF';
//     context.beginPath();
//     context.arc(256, 256, 240, 0, Math.PI * 2);
//     context.fill();
    
//     // Thick black border
//     context.strokeStyle = '#000000';
//     context.lineWidth = 16;
//     context.stroke();
    
//     // ✅ 4-digit number - HUGE and BOLD
//     context.fillStyle = '#000000';
//     context.font = 'bold 200px Arial';
//     context.textAlign = 'center';
//     context.textBaseline = 'middle';
//     context.fillText(displayNumber, 256, 256);
    
//     // Create sprite (billboard - always faces camera)
//     const texture = new THREE.CanvasTexture(canvas);
//     texture.minFilter = THREE.LinearFilter;
//     texture.magFilter = THREE.LinearFilter;
    
//     const material = new THREE.SpriteMaterial({ 
//       map: texture,
//       transparent: false,
//     });
    
//     const sprite = new THREE.Sprite(material);
//     sprite.scale.set(4, 4, 1); // Large circle
    
//     sprite.userData.ballNumber = ballNumber;
//     sprite.userData.displayNumber = displayNumber;
    
//     return sprite;
//   }

//   addBall(ballNumber, animate = true) {
//     console.log(`🎱 addBall called with ballNumber: ${ballNumber}, current ball count: ${this.balls.length}`);
    
//     // ✅ PREVENT DUPLICATES
//     const existingBall = this.balls.find(b => b.userData.ballNumber === ballNumber);
//     if (existingBall) {
//       console.warn(`⚠️ Ball ${ballNumber} already exists! Skipping duplicate.`);
//       return existingBall;
//     }
    
//     const ball = this.createBall(ballNumber);
    
//     if (animate) {
//       // Start above
//       const ballIndex = this.balls.length;
//       const angle = (ballIndex * Math.PI * 2) / Math.max(1, ballIndex + 1);
//       const radius = 3;
      
//       ball.position.set(
//         Math.cos(angle) * radius,
//         15,
//         Math.sin(angle) * radius
//       );
      
//       ball.scale.set(0, 0, 0);
//       this.animateBallEntry(ball, ballIndex);
//     } else {
//       const ballIndex = this.balls.length;
//       const angle = (ballIndex * Math.PI * 2) / Math.max(1, this.balls.length + 1);
//       const radius = 3;
//       const height = 0;
      
//       ball.position.set(
//         Math.cos(angle) * radius,
//         height,
//         Math.sin(angle) * radius
//       );
//     }
    
//     this.balls.push(ball);
//     this.scene.add(ball);
    
//     console.log(`✅ Ball ${ballNumber} added! Total balls now: ${this.balls.length}`);
//     console.log(`   All ball numbers:`, this.balls.map(b => b.userData.ballNumber));
    
//     return ball;
//   }
// /*eslint-disable*/
//   animateBallEntry(ball, ballIndex) {
//     const startY = ball.position.y;
//     const targetY = 0;
//     const duration = 2000;
//     const startTime = Date.now();
    
//     const animate = () => {
//       const elapsed = Date.now() - startTime;
//       const progress = Math.min(elapsed / duration, 1);
//       const easeProgress = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      
//       ball.position.y = startY - (startY - targetY) * easeProgress;
//       ball.scale.setScalar(easeProgress);
      
//       if (progress < 1) {
//         requestAnimationFrame(animate);
//       }
//     };
    
//     animate();
//   }

//   spinBalls(speed = 1) {
//     const time = Date.now() * 0.001;
    
//     this.balls.forEach((ball, index) => {
//       // Circular orbit
//       const radius = 3;
//       const angle = time * speed * 0.2 + index * (Math.PI * 2 / Math.max(this.balls.length, 1));
//       const height = Math.sin(time + index) * 1.5;
      
//       ball.position.x = Math.cos(angle) * radius;
//       ball.position.z = Math.sin(angle) * radius;
//       ball.position.y = height;
      
//       // Sprites automatically face camera - no rotation needed!
//     });
//   }

//   highlightBall(ballNumber) {
//     const ball = this.balls.find(b => b.userData.ballNumber === ballNumber);
//     if (!ball) return null;
    
//     // Add pulsing effect to highlighted ball
//     let time = 0;
//     const animateGlow = () => {
//       time += 0.05;
//       const scale = 1 + Math.sin(time) * 0.2;
//       ball.scale.set(4 * scale, 4 * scale, 1);
//       requestAnimationFrame(animateGlow);
//     };
//     animateGlow();
    
//     return ball;
//   }

//   extractBall(ballNumber, onComplete) {
//     const ballIndex = this.balls.findIndex(b => b.userData.ballNumber === ballNumber);
//     if (ballIndex === -1) return;
    
//     const ball = this.balls[ballIndex];
//     const startPos = ball.position.clone();
//     const targetPos = new THREE.Vector3(0, 8, 0);
//     const duration = 3000;
//     const startTime = Date.now();
    
//     const animate = () => {
//       const elapsed = Date.now() - startTime;
//       const progress = Math.min(elapsed / duration, 1);
      
//       ball.position.lerpVectors(startPos, targetPos, progress);
//       ball.scale.setScalar(4 + progress * 4);
      
//       if (progress < 1) {
//         requestAnimationFrame(animate);
//       } else {
//         this.balls.splice(ballIndex, 1);
//         this.scene.remove(ball);
//         if (onComplete) onComplete(ball);
//       }
//     };
    
//     animate();
//   }

//   rotateMachine(speed = 0.5) {
//     if (this.machine) {
//       this.machine.rotation.y += 0.005 * speed;
//     }
//   }

//   setRotationSpeed(speed) {
//     this.rotationSpeed = speed;
//   }

//   setBallSpinSpeed(speed) {
//     this.ballSpinSpeed = speed;
//   }

//   animate() {
//     if (!this.isInitialized) return;

//     this.animationFrameId = requestAnimationFrame(this.animate.bind(this));
    
//     this.controls.update();
//     this.rotateMachine(this.rotationSpeed);
//     this.spinBalls(this.ballSpinSpeed);
    
//     this.renderer.render(this.scene, this.camera);
//   }

//   onWindowResize() {
//     if (!this.container || !this.isInitialized) return;
    
//     const width = this.container.clientWidth;
//     const height = this.container.clientHeight;
    
//     this.camera.aspect = width / height;
//     this.camera.updateProjectionMatrix();
//     this.renderer.setSize(width, height);
//   }

//   dispose() {
//     console.log('🧹 Disposing Three.js scene');
    
//     if (this.animationFrameId) {
//       cancelAnimationFrame(this.animationFrameId);
//     }
    
//     window.removeEventListener('resize', this.onWindowResize.bind(this));
    
//     this.balls.forEach(ball => {
//       if (ball.geometry) ball.geometry.dispose();
//       if (ball.material) {
//         if (ball.material.map) ball.material.map.dispose();
//         ball.material.dispose();
//       }
//     });
    
//     if (this.machine) {
//       this.machine.traverse(child => {
//         if (child.geometry) child.geometry.dispose();
//         if (child.material) child.material.dispose();
//       });
//     }
    
//     if (this.renderer) {
//       this.renderer.dispose();
//       if (this.container && this.renderer.domElement) {
//         this.container.removeChild(this.renderer.domElement);
//       }
//     }
    
//     this.isInitialized = false;
//   }
// }




//last perfect code
// // src/services/three/LotteryMachineScene.js
// // ✨ REVOLUTIONARY DESIGN - Just floating numbers, no balls!
// import * as THREE from 'three';
// import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

// export class LotteryMachineScene {
//   constructor(container) {
//     this.container = container;
//     this.scene = null;
//     this.camera = null;
//     this.renderer = null;
//     this.controls = null;
//     this.balls = []; // Actually just numbers now
//     this.machine = null;
//     this.animationFrameId = null;
//     this.rotationSpeed = 0.3;
//     this.ballSpinSpeed = 0.5;
//     this.isInitialized = false;
    
//     this.waitForContainerAndInit();
//   }

//   waitForContainerAndInit() {
//     const checkAndInit = () => {
//       if (!this.container) {
//         console.error('❌ Container is null');
//         return;
//       }

//       const width = this.container.clientWidth;
//       const height = this.container.clientHeight;

//       if (width > 0 && height > 0) {
//         console.log('✅ Container has size, initializing...');
//         this.init();
//       } else {
//         setTimeout(checkAndInit, 100);
//       }
//     };

//     checkAndInit();
//   }

//   async init() {
//     try {
//       console.log('🎨 Initializing Three.js scene...');
      
//       const width = this.container.clientWidth;
//       const height = this.container.clientHeight;

//       if (width === 0 || height === 0) {
//         throw new Error('Container has no dimensions');
//       }

//       // Create scene
//       this.scene = new THREE.Scene();
//       this.scene.background = new THREE.Color(0x0a0a1f);
//       this.scene.fog = new THREE.Fog(0x0a0a1f, 20, 50);
      
//       // Camera
//       this.camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
//       this.camera.position.set(0, 3, 10);
//       this.camera.lookAt(0, 0, 0);
      
//       // Renderer
//       this.renderer = new THREE.WebGLRenderer({ 
//         antialias: true,
//         alpha: true,
//         powerPreference: 'high-performance',
//       });
      
//       this.renderer.setSize(width, height);
//       this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
//       this.renderer.shadowMap.enabled = true;
//       this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
      
//       while (this.container.firstChild) {
//         this.container.removeChild(this.container.firstChild);
//       }
      
//       this.container.appendChild(this.renderer.domElement);
      
//       // Orbit controls
//       this.controls = new OrbitControls(this.camera, this.renderer.domElement);
//       this.controls.enableDamping = true;
//       this.controls.dampingFactor = 0.05;
//       this.controls.minDistance = 8;
//       this.controls.maxDistance = 20;
//       this.controls.autoRotate = true;
//       this.controls.autoRotateSpeed = 0.5;
      
//       this.setupLights();
//       this.createMachine();
      
//       window.addEventListener('resize', this.onWindowResize.bind(this));
      
//       this.isInitialized = true;
      
//       console.log('🎬 Starting animation loop...');
//       this.animate();
      
//       console.log('✅ Three.js scene initialized successfully');
      
//     } catch (error) {
//       console.error('❌ Failed to initialize scene:', error);
//       throw error;
//     }
//   }

//   setupLights() {
//     const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
//     this.scene.add(ambientLight);
    
//     const spotLight = new THREE.SpotLight(0xffffff, 2);
//     spotLight.position.set(0, 20, 0);
//     spotLight.castShadow = true;
//     this.scene.add(spotLight);
    
//     const frontLight = new THREE.DirectionalLight(0xffffff, 0.8);
//     frontLight.position.set(0, 5, 10);
//     this.scene.add(frontLight);
//   }

//   createMachine() {
//     const machineGroup = new THREE.Group();
    
//     // Glass container - simpler
//     const containerGeometry = new THREE.SphereGeometry(5, 64, 64);
//     containerGeometry.scale(1, 1.3, 1);
    
//     const containerMaterial = new THREE.MeshPhysicalMaterial({
//       color: 0xffffff,
//       transparent: true,
//       opacity: 0.08,
//       metalness: 0,
//       roughness: 0.05,
//       transmission: 0.95,
//       thickness: 0.5,
//       side: THREE.DoubleSide,
//     });
    
//     const container = new THREE.Mesh(containerGeometry, containerMaterial);
//     machineGroup.add(container);
    
//     // Gold rings
//     const createRing = (radius, y) => {
//       const ringGeometry = new THREE.TorusGeometry(radius, 0.15, 16, 100);
//       const ringMaterial = new THREE.MeshStandardMaterial({
//         color: 0xffd700,
//         metalness: 1,
//         roughness: 0.2,
//         emissive: 0xffaa00,
//         emissiveIntensity: 0.3,
//       });
      
//       const ring = new THREE.Mesh(ringGeometry, ringMaterial);
//       ring.rotation.x = Math.PI / 2;
//       ring.position.y = y;
//       return ring;
//     };
    
//     machineGroup.add(createRing(5.2, 4));
//     machineGroup.add(createRing(5.2, 0));
//     machineGroup.add(createRing(5.2, -4));
    
//     // Base
//     const standGeometry = new THREE.CylinderGeometry(1.5, 3, 3, 32);
//     const standMaterial = new THREE.MeshStandardMaterial({
//       color: 0x1e1b4b,
//       metalness: 0.9,
//       roughness: 0.2,
//     });
//     const stand = new THREE.Mesh(standGeometry, standMaterial);
//     stand.position.y = -6.5;
//     machineGroup.add(stand);
    
//     this.machine = machineGroup;
//     this.scene.add(machineGroup);
//   }

//   // ✅ NEW: Create floating number - LAST 4 DIGITS ONLY
//   createBall(ballNumber) {
//     // ✅ Get last 4 digits only
//     const displayNumber = ballNumber.toString().slice(-4);
    
//     // Create a canvas with crisp rendering
//     const canvas = document.createElement('canvas');
//     canvas.width = 512;
//     canvas.height = 512;
//     const context = canvas.getContext('2d');
    
//     // Enable crisp rendering
//     context.imageSmoothingEnabled = false;
    
//     // Solid white circle background
//     context.fillStyle = '#FFFFFF';
//     context.beginPath();
//     context.arc(256, 256, 240, 0, Math.PI * 2);
//     context.fill();
    
//     // Thick black border
//     context.strokeStyle = '#000000';
//     context.lineWidth = 16;
//     context.stroke();
    
//     // ✅ 4-digit number - HUGE and BOLD
//     context.fillStyle = '#000000';
//     context.font = 'bold 200px Arial';
//     context.textAlign = 'center';
//     context.textBaseline = 'middle';
//     context.fillText(displayNumber, 256, 256);
    
//     // Create sprite (billboard - always faces camera)
//     const texture = new THREE.CanvasTexture(canvas);
//     texture.minFilter = THREE.LinearFilter;
//     texture.magFilter = THREE.LinearFilter;
    
//     const material = new THREE.SpriteMaterial({ 
//       map: texture,
//       transparent: false,
//     });
    
//     const sprite = new THREE.Sprite(material);
//     sprite.scale.set(4, 4, 1); // Large circle
    
//     sprite.userData.ballNumber = ballNumber;
//     sprite.userData.displayNumber = displayNumber;
    
//     return sprite;
//   }

//   addBall(ballNumber, animate = true) {
//     console.log(`🎱 addBall called with ballNumber: ${ballNumber}, current ball count: ${this.balls.length}`);
    
//     // ✅ PREVENT DUPLICATES
//     const existingBall = this.balls.find(b => b.userData.ballNumber === ballNumber);
//     if (existingBall) {
//       console.warn(`⚠️ Ball ${ballNumber} already exists! Skipping duplicate.`);
//       return existingBall;
//     }
    
//     const ball = this.createBall(ballNumber);
    
//     if (animate) {
//       // Start above
//       const ballIndex = this.balls.length;
//       const angle = (ballIndex * Math.PI * 2) / Math.max(1, ballIndex + 1);
//       const radius = 3;
      
//       ball.position.set(
//         Math.cos(angle) * radius,
//         15,
//         Math.sin(angle) * radius
//       );
      
//       ball.scale.set(0, 0, 0);
//       this.animateBallEntry(ball, ballIndex);
//     } else {
//       const ballIndex = this.balls.length;
//       const angle = (ballIndex * Math.PI * 2) / Math.max(1, this.balls.length + 1);
//       const radius = 3;
//       const height = 0;
      
//       ball.position.set(
//         Math.cos(angle) * radius,
//         height,
//         Math.sin(angle) * radius
//       );
//     }
    
//     this.balls.push(ball);
//     this.scene.add(ball);
    
//     console.log(`✅ Ball ${ballNumber} added! Total balls now: ${this.balls.length}`);
//     console.log(`   All ball numbers:`, this.balls.map(b => b.userData.ballNumber));
    
//     return ball;
//   }
// /*eslint-disable*/
//   animateBallEntry(ball, ballIndex) {
//     const startY = ball.position.y;
//     const targetY = 0;
//     const duration = 2000;
//     const startTime = Date.now();
    
//     const animate = () => {
//       const elapsed = Date.now() - startTime;
//       const progress = Math.min(elapsed / duration, 1);
//       const easeProgress = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      
//       ball.position.y = startY - (startY - targetY) * easeProgress;
//       ball.scale.setScalar(easeProgress);
      
//       if (progress < 1) {
//         requestAnimationFrame(animate);
//       }
//     };
    
//     animate();
//   }

//   spinBalls(speed = 1) {
//     const time = Date.now() * 0.001;
    
//     this.balls.forEach((ball, index) => {
//       // Circular orbit
//       const radius = 3;
//       const angle = time * speed * 0.2 + index * (Math.PI * 2 / Math.max(this.balls.length, 1));
//       const height = Math.sin(time + index) * 1.5;
      
//       ball.position.x = Math.cos(angle) * radius;
//       ball.position.z = Math.sin(angle) * radius;
//       ball.position.y = height;
      
//       // Sprites automatically face camera - no rotation needed!
//     });
//   }

//   highlightBall(ballNumber) {
//     const ball = this.balls.find(b => b.userData.ballNumber === ballNumber);
//     if (!ball) return null;
    
//     // Add pulsing effect to highlighted ball
//     let time = 0;
//     const animateGlow = () => {
//       time += 0.05;
//       const scale = 1 + Math.sin(time) * 0.2;
//       ball.scale.set(4 * scale, 4 * scale, 1);
//       requestAnimationFrame(animateGlow);
//     };
//     animateGlow();
    
//     return ball;
//   }

//   extractBall(ballNumber, onComplete) {
//     const ballIndex = this.balls.findIndex(b => b.userData.ballNumber === ballNumber);
//     if (ballIndex === -1) return;
    
//     const ball = this.balls[ballIndex];
//     const startPos = ball.position.clone();
//     const targetPos = new THREE.Vector3(0, 8, 0);
//     const duration = 3000;
//     const startTime = Date.now();
    
//     const animate = () => {
//       const elapsed = Date.now() - startTime;
//       const progress = Math.min(elapsed / duration, 1);
      
//       ball.position.lerpVectors(startPos, targetPos, progress);
//       ball.scale.setScalar(4 + progress * 4);
      
//       if (progress < 1) {
//         requestAnimationFrame(animate);
//       } else {
//         this.balls.splice(ballIndex, 1);
//         this.scene.remove(ball);
//         if (onComplete) onComplete(ball);
//       }
//     };
    
//     animate();
//   }

//   rotateMachine(speed = 0.5) {
//     if (this.machine) {
//       this.machine.rotation.y += 0.005 * speed;
//     }
//   }

//   setRotationSpeed(speed) {
//     this.rotationSpeed = speed;
//   }

//   setBallSpinSpeed(speed) {
//     this.ballSpinSpeed = speed;
//   }

//   animate() {
//     if (!this.isInitialized) return;

//     this.animationFrameId = requestAnimationFrame(this.animate.bind(this));
    
//     this.controls.update();
//     this.rotateMachine(this.rotationSpeed);
//     this.spinBalls(this.ballSpinSpeed);
    
//     this.renderer.render(this.scene, this.camera);
//   }

//   onWindowResize() {
//     if (!this.container || !this.isInitialized) return;
    
//     const width = this.container.clientWidth;
//     const height = this.container.clientHeight;
    
//     this.camera.aspect = width / height;
//     this.camera.updateProjectionMatrix();
//     this.renderer.setSize(width, height);
//   }

//   dispose() {
//     console.log('🧹 Disposing Three.js scene');
    
//     if (this.animationFrameId) {
//       cancelAnimationFrame(this.animationFrameId);
//     }
    
//     window.removeEventListener('resize', this.onWindowResize.bind(this));
    
//     this.balls.forEach(ball => {
//       if (ball.geometry) ball.geometry.dispose();
//       if (ball.material) {
//         if (ball.material.map) ball.material.map.dispose();
//         ball.material.dispose();
//       }
//     });
    
//     if (this.machine) {
//       this.machine.traverse(child => {
//         if (child.geometry) child.geometry.dispose();
//         if (child.material) child.material.dispose();
//       });
//     }
    
//     if (this.renderer) {
//       this.renderer.dispose();
//       if (this.container && this.renderer.domElement) {
//         this.container.removeChild(this.renderer.domElement);
//       }
//     }
    
//     this.isInitialized = false;
//   }
// }
//this is perfect code but of removing another star above codes
// // src/services/three/LotteryMachineScene.js
// // ✨ 3D LOTTERY MACHINE - ENHANCED GLASS OVAL VERSION WITH CONTINUOUS SPINNING
// import * as THREE from 'three';
// import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

// export class LotteryMachineScene {
//   constructor(container) {
//     this.container = container;
//     this.scene = null;
//     this.camera = null;
//     this.renderer = null;
//     this.controls = null;
//     this.balls = [];
//     this.machine = null;
//     this.animationFrameId = null;
//     this.rotationSpeed = 0.3;
//     this.ballSpinSpeed = 0.8; // ✅ INCREASED for faster spinning
//     this.isInitialized = false;
    
//     // ✨ Particle systems
//     this.particles = null;
//     this.glowRings = [];
//     this.accentLights = [];
    
//     // ✅ CRITICAL: Wait for container to have size, then initialize
//     this.waitForContainerAndInit();
//   }

//   waitForContainerAndInit() {
//     const checkAndInit = () => {
//       if (!this.container) {
//         console.error('❌ Container is null');
//         return;
//       }

//       const width = this.container.clientWidth;
//       const height = this.container.clientHeight;

//       console.log('📏 Container dimensions:', width, 'x', height);

//       if (width > 0 && height > 0) {
//         console.log('✅ Container has size, initializing...');
//         this.init();
//       } else {
//         console.warn('⏳ Waiting for container size...');
//         setTimeout(checkAndInit, 100);
//       }
//     };

//     checkAndInit();
//   }

//   init() {
//     try {
//       console.log('🎨 Initializing Three.js scene...');
      
//       const width = this.container.clientWidth;
//       const height = this.container.clientHeight;

//       if (width === 0 || height === 0) {
//         throw new Error('Container has no dimensions');
//       }

//       // Create scene
//       this.scene = new THREE.Scene();
//       this.scene.background = new THREE.Color(0x0a0a1f);
//       this.scene.fog = new THREE.Fog(0x0a0a1f, 20, 50);
      
//       // Camera positioned to see full oval machine - CLOSER
//       this.camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
//       this.camera.position.set(0, 5, 12); // ✅ Moved closer (was 0, 8, 20)
//       this.camera.lookAt(0, 0, 0);
      
//       // Enhanced renderer
//       this.renderer = new THREE.WebGLRenderer({ 
//         antialias: true,
//         alpha: true,
//         powerPreference: 'high-performance',
//       });
      
//       this.renderer.setSize(width, height);
//       this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
//       this.renderer.shadowMap.enabled = true;
//       this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
//       this.renderer.outputEncoding = THREE.sRGBEncoding;
//       this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
//       this.renderer.toneMappingExposure = 1.2;
      
//       // Clear and append renderer
//       while (this.container.firstChild) {
//         this.container.removeChild(this.container.firstChild);
//       }
      
//       this.container.appendChild(this.renderer.domElement);
//       console.log('✅ Renderer appended to container');
      
//       // Orbit controls with auto-rotation
//       this.controls = new OrbitControls(this.camera, this.renderer.domElement);
//       this.controls.enableDamping = true;
//       this.controls.dampingFactor = 0.05;
//       this.controls.minDistance = 10;
//       this.controls.maxDistance = 30;
//       this.controls.maxPolarAngle = Math.PI / 1.8;
//       this.controls.autoRotate = true;
//       this.controls.autoRotateSpeed = 1.0; // ✅ Smooth rotation
      
//       this.setupLights();
//       this.createMachine();
//       this.createParticleSystem();
//       this.createGlowRings();
      
//       window.addEventListener('resize', this.onWindowResize.bind(this));
      
//       this.isInitialized = true;
      
//       console.log('🎬 Starting animation loop...');
//       this.animate();
      
//       console.log('✅ Three.js scene initialized successfully');
      
//     } catch (error) {
//       console.error('❌ Failed to initialize scene:', error);
//       throw error;
//     }
//   }

//   setupLights() {
//     // Ambient light
//     const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
//     this.scene.add(ambientLight);
    
//     // Main spotlight from top
//     const spotLight = new THREE.SpotLight(0xffffff, 2.5);
//     spotLight.position.set(0, 25, 0);
//     spotLight.angle = Math.PI / 5;
//     spotLight.penumbra = 0.3;
//     spotLight.decay = 2;
//     spotLight.distance = 50;
//     spotLight.castShadow = true;
//     spotLight.shadow.mapSize.width = 2048;
//     spotLight.shadow.mapSize.height = 2048;
//     this.scene.add(spotLight);
    
//     // Animated colored accent lights
//     const createAccentLight = (color, x, z) => {
//       const light = new THREE.PointLight(color, 2, 50);
//       light.position.set(x, 5, z);
//       return light;
//     };
    
//     const accentLight1 = createAccentLight(0x4f46e5, 10, 10);
//     const accentLight2 = createAccentLight(0xec4899, -10, -10);
//     const accentLight3 = createAccentLight(0x10b981, 10, -10);
//     const accentLight4 = createAccentLight(0xf59e0b, -10, 10);
    
//     this.scene.add(accentLight1, accentLight2, accentLight3, accentLight4);
//     this.accentLights = [accentLight1, accentLight2, accentLight3, accentLight4];
    
//     // Rim lights for glass highlights
//     const rimLight1 = new THREE.DirectionalLight(0x6366f1, 1);
//     rimLight1.position.set(15, 10, -15);
//     this.scene.add(rimLight1);
    
//     const rimLight2 = new THREE.DirectionalLight(0xec4899, 1);
//     rimLight2.position.set(-15, 10, 15);
//     this.scene.add(rimLight2);
//   }

//   createMachine() {
//     const machineGroup = new THREE.Group();
    
//     // ✨ GLASS OVAL CONTAINER - Enhanced transparency and realism
//     const containerGeometry = new THREE.SphereGeometry(5.5, 64, 64);
//     containerGeometry.scale(1, 1.4, 1); // More oval shape
    
//     const containerMaterial = new THREE.MeshPhysicalMaterial({
//       color: 0xffffff,
//       transparent: true,
//       opacity: 0.15, // Very transparent glass
//       metalness: 0,
//       roughness: 0.03,
//       transmission: 0.98, // High transmission for glass effect
//       thickness: 0.8,
//       ior: 1.52, // Glass index of refraction
//       reflectivity: 0.6,
//       envMapIntensity: 1.2,
//       clearcoat: 1,
//       clearcoatRoughness: 0,
//       side: THREE.DoubleSide,
//     });
    
//     const container = new THREE.Mesh(containerGeometry, containerMaterial);
//     container.castShadow = true;
//     container.receiveShadow = true;
//     machineGroup.add(container);
    
//     // ✨ GOLD RINGS - More prominent
//     const createRing = (radius, y, thickness = 0.18) => {
//       const ringGeometry = new THREE.TorusGeometry(radius, thickness, 16, 100);
//       const ringMaterial = new THREE.MeshStandardMaterial({
//         color: 0xffd700,
//         metalness: 1,
//         roughness: 0.1,
//         emissive: 0xffaa00,
//         emissiveIntensity: 0.4,
//       });
      
//       const ring = new THREE.Mesh(ringGeometry, ringMaterial);
//       ring.rotation.x = Math.PI / 2;
//       ring.position.y = y;
//       ring.castShadow = true;
//       return ring;
//     };
    
//     machineGroup.add(createRing(5.7, 5));
//     machineGroup.add(createRing(5.7, 0));
//     machineGroup.add(createRing(5.7, -5));
    
//     // ✨ BASE STAND - Enhanced design
//     const standGeometry = new THREE.CylinderGeometry(1.8, 3.5, 3.5, 32);
//     const standMaterial = new THREE.MeshStandardMaterial({
//       color: 0x1e1b4b,
//       metalness: 0.95,
//       roughness: 0.15,
//       emissive: 0x312e81,
//       emissiveIntensity: 0.3,
//     });
//     const stand = new THREE.Mesh(standGeometry, standMaterial);
//     stand.position.y = -7;
//     stand.castShadow = true;
//     machineGroup.add(stand);
    
//     // Base glow effect
//     const baseGlowGeometry = new THREE.CylinderGeometry(3.7, 3.7, 0.3, 32);
//     const baseGlowMaterial = new THREE.MeshBasicMaterial({
//       color: 0x4f46e5,
//       transparent: true,
//       opacity: 0.4,
//     });
//     const baseGlow = new THREE.Mesh(baseGlowGeometry, baseGlowMaterial);
//     baseGlow.position.y = -8.7;
//     machineGroup.add(baseGlow);
    
//     this.machine = machineGroup;
//     this.scene.add(machineGroup);
    
//     console.log('✅ Glass oval lottery machine created');
//   }

//   createParticleSystem() {
//     const particleCount = 400;
//     const positions = new Float32Array(particleCount * 3);
//     const colors = new Float32Array(particleCount * 3);
    
//     const color = new THREE.Color();
//     const colorOptions = [0x4f46e5, 0xec4899, 0x10b981, 0xf59e0b];
    
//     for (let i = 0; i < particleCount; i++) {
//       const i3 = i * 3;
//       const radius = 9 + Math.random() * 6;
//       const theta = Math.random() * Math.PI * 2;
//       const phi = Math.acos(2 * Math.random() - 1);
      
//       positions[i3] = radius * Math.sin(phi) * Math.cos(theta);
//       positions[i3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
//       positions[i3 + 2] = radius * Math.cos(phi);
      
//       color.setHex(colorOptions[Math.floor(Math.random() * colorOptions.length)]);
//       colors[i3] = color.r;
//       colors[i3 + 1] = color.g;
//       colors[i3 + 2] = color.b;
//     }
    
//     const geometry = new THREE.BufferGeometry();
//     geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
//     geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    
//     const material = new THREE.PointsMaterial({
//       size: 0.12,
//       vertexColors: true,
//       transparent: true,
//       opacity: 0.7,
//       blending: THREE.AdditiveBlending,
//     });
    
//     this.particles = new THREE.Points(geometry, material);
//     this.scene.add(this.particles);
//   }

//   createGlowRings() {
//     for (let i = 0; i < 3; i++) {
//       const ringGeometry = new THREE.TorusGeometry(6.5 + i * 0.5, 0.04, 16, 100);
//       const ringMaterial = new THREE.MeshBasicMaterial({
//         color: [0x4f46e5, 0xec4899, 0x10b981][i],
//         transparent: true,
//         opacity: 0.5,
//       });
      
//       const ring = new THREE.Mesh(ringGeometry, ringMaterial);
//       ring.rotation.x = Math.PI / 2;
      
//       this.glowRings.push(ring);
//       this.scene.add(ring);
//     }
//   }

//   createBall(ballNumber, color = null) {
//     if (!color) {
//       const colors = [0x4f46e5, 0xec4899, 0x10b981, 0xf59e0b, 0xef4444, 0x8b5cf6, 0x06b6d4, 0xf97316];
//       color = colors[Math.floor(Math.random() * colors.length)];
//     }
    
//     // ✅ Simple glowing sphere
//     const ballGeometry = new THREE.SphereGeometry(0.8, 32, 32);
//     const ballMaterial = new THREE.MeshPhysicalMaterial({
//       color: color,
//       metalness: 0.2,
//       roughness: 0.1,
//       clearcoat: 1,
//       clearcoatRoughness: 0.03,
//       reflectivity: 0.9,
//       emissive: color,
//       emissiveIntensity: 0.4,
//     });
    
//     const ball = new THREE.Mesh(ballGeometry, ballMaterial);
//     ball.castShadow = true;
//     ball.receiveShadow = true;
    
//     // ✅ IMPROVED: Create high-contrast number texture with WHITE background
//     const canvas = document.createElement('canvas');
//     canvas.width = 256;
//     canvas.height = 256;
//     const context = canvas.getContext('2d');
    
//     // White circle background
//     context.fillStyle = '#FFFFFF';
//     context.beginPath();
//     context.arc(128, 128, 120, 0, Math.PI * 2);
//     context.fill();
    
//     // Black number - VERY LARGE AND BOLD
//     context.fillStyle = '#000000';
//     context.font = 'bold 140px Arial';
//     context.textAlign = 'center';
//     context.textBaseline = 'middle';
//     context.fillText(ballNumber.toString(), 128, 128);
    
//     // Create sprite for number (always faces camera)
//     const texture = new THREE.CanvasTexture(canvas);
//     const spriteMaterial = new THREE.SpriteMaterial({ 
//       map: texture,
//       transparent: true,
//     });
    
//     const sprite = new THREE.Sprite(spriteMaterial);
//     sprite.scale.set(1.6, 1.6, 1); // Large and visible
//     ball.add(sprite);
    
//     ball.userData.ballNumber = ballNumber;
//     ball.userData.color = color;
    
//     return ball;
//   }

//   addBall(ballNumber, animate = true) {
//     const ball = this.createBall(ballNumber);
    
//     if (animate) {
//       // ✅ FIX: Use deterministic positioning based on ball index
//       const ballIndex = this.balls.length;
//       const angle = (ballIndex * Math.PI * 2) / Math.max(1, ballIndex + 1);
//       const radius = 3;
      
//       // Start position (above machine)
//       ball.position.set(
//         Math.cos(angle) * radius,
//         15,
//         Math.sin(angle) * radius
//       );
      
//       ball.scale.set(0, 0, 0);
//       this.animateBallEntry(ball, ballIndex);
//     } else {
//       // ✅ FIX: Static positioning also deterministic
//       const ballIndex = this.balls.length;
//       const angle = (ballIndex * Math.PI * 2) / Math.max(1, this.balls.length + 1);
//       const radius = 3 + (ballIndex % 3) * 0.5;
//       const height = (ballIndex % 5 - 2) * 1.5;
      
//       ball.position.set(
//         Math.cos(angle) * radius,
//         height,
//         Math.sin(angle) * radius
//       );
//     }
    
//     this.balls.push(ball);
//     this.scene.add(ball);
    
//     console.log('✅ Ball added:', ballNumber, '- Total balls:', this.balls.length);
    
//     return ball;
//   }

//   animateBallEntry(ball, ballIndex) {
//     const startY = ball.position.y;
    
//     // ✅ FIX: Deterministic target position based on ball index
//     /*eslint-disable*/
//     const angle = (ballIndex * Math.PI * 2) / Math.max(1, this.balls.length + 1);
//     const radius = 3 + (ballIndex % 3) * 0.5;
//     const targetY = (ballIndex % 5 - 2) * 1.5;
    
//     const duration = 2000;
//     const startTime = Date.now();
    
//     const animate = () => {
//       const elapsed = Date.now() - startTime;
//       const progress = Math.min(elapsed / duration, 1);
//       const easeProgress = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      
//       ball.position.y = startY - (startY - targetY) * easeProgress;
//       ball.scale.setScalar(easeProgress);
//       ball.rotation.x = progress * Math.PI * 6;
//       ball.rotation.y = progress * Math.PI * 6;
      
//       if (progress < 1) {
//         requestAnimationFrame(animate);
//       }
//     };
    
//     animate();
//   }

//   // ✅ ENHANCED: Continuous circular spinning motion
//   spinBalls(speed = 1) {
//     const time = Date.now() * 0.001;
    
//     this.balls.forEach((ball, index) => {
//       // Circular motion with varying radius
//       const radius = 3.5 + Math.sin(time * 0.6 + index) * 1;
//       const angle = time * speed * 0.3 + index * (Math.PI * 2 / Math.max(this.balls.length, 1)); // ✅ 0.3x slower orbital
//       const height = Math.sin(time * 1.2 + index * 0.7) * 3;
      
//       ball.position.x = Math.cos(angle) * radius;
//       ball.position.z = Math.sin(angle) * radius;
//       ball.position.y = height;
      
//       // ✅ SLOWER ball self-rotation (was 0.03, now 0.008)
//       ball.rotation.x += 0.008;
//       ball.rotation.y += 0.008;
      
//       // ✅ Sprite automatically faces camera, no need for lookAt
      
//       // Pulsing glow effect
//       const glow = 1 + Math.sin(time * 3 + index) * 0.3;
//       ball.material.emissiveIntensity = 0.3 * glow;
//     });
//   }

//   highlightBall(ballNumber) {
//     const ball = this.balls.find(b => b.userData.ballNumber === ballNumber);
//     if (!ball) return null;
    
//     const glowGeometry = new THREE.SphereGeometry(0.55, 32, 32);
//     const glowMaterial = new THREE.MeshBasicMaterial({
//       color: 0xffd700,
//       transparent: true,
//       opacity: 0.5,
//       blending: THREE.AdditiveBlending,
//     });
//     const glow = new THREE.Mesh(glowGeometry, glowMaterial);
//     ball.add(glow);
    
//     let time = 0;
//     const animateGlow = () => {
//       time += 0.05;
//       const scale = 1 + Math.sin(time) * 0.4;
//       glow.scale.set(scale, scale, scale);
//       glow.material.opacity = 0.3 + Math.sin(time) * 0.2;
//       requestAnimationFrame(animateGlow);
//     };
//     animateGlow();
    
//     return ball;
//   }

//   extractBall(ballNumber, onComplete) {
//     const ballIndex = this.balls.findIndex(b => b.userData.ballNumber === ballNumber);
//     if (ballIndex === -1) return;
    
//     const ball = this.balls[ballIndex];
//     const startPos = ball.position.clone();
//     const targetPos = new THREE.Vector3(0, 10, 0);
//     const duration = 3000;
//     const startTime = Date.now();
    
//     const animate = () => {
//       const elapsed = Date.now() - startTime;
//       const progress = Math.min(elapsed / duration, 1);
//       const easeProgress = 1 - Math.pow(1 - progress, 3);
      
//       ball.position.lerpVectors(startPos, targetPos, easeProgress);
//       ball.scale.setScalar(1 + easeProgress * 4);
//       ball.rotation.y += 0.15;
//       ball.material.emissiveIntensity = 0.2 + easeProgress;
      
//       if (progress < 1) {
//         requestAnimationFrame(animate);
//       } else {
//         this.balls.splice(ballIndex, 1);
//         this.scene.remove(ball);
//         if (onComplete) onComplete(ball);
//       }
//     };
    
//     animate();
//   }

//   rotateMachine(speed = 0.5) {
//     if (this.machine) {
//       this.machine.rotation.y += 0.008 * speed;
//     }
//   }

//   setRotationSpeed(speed) {
//     this.rotationSpeed = speed;
//   }

//   setBallSpinSpeed(speed) {
//     this.ballSpinSpeed = speed;
//   }

//   // ✅ ANIMATION LOOP - Balls spin continuously
//   animate() {
//     if (!this.isInitialized) {
//       console.warn('⚠️ Animation called before initialization');
//       return;
//     }

//     this.animationFrameId = requestAnimationFrame(this.animate.bind(this));
    
//     const time = Date.now() * 0.001;
    
//     this.controls.update();
    
//     // Rotate machine slowly
//     this.rotateMachine(this.rotationSpeed);
    
//     // ✅ CONTINUOUS BALL SPINNING
//     this.spinBalls(this.ballSpinSpeed);
    
//     // Animate particles
//     if (this.particles) {
//       this.particles.rotation.y = time * 0.08;
//     }
    
//     // Animate glow rings
//     this.glowRings.forEach((ring, i) => {
//       ring.rotation.z = time * (0.3 + i * 0.15);
//       ring.scale.setScalar(1 + Math.sin(time * 2 + i) * 0.12);
//     });
    
//     // Animate accent lights
//     if (this.accentLights) {
//       this.accentLights.forEach((light, i) => {
//         light.intensity = 2 + Math.sin(time * 2 + i * Math.PI / 2) * 0.8;
//       });
//     }
    
//     this.renderer.render(this.scene, this.camera);
//   }

//   onWindowResize() {
//     if (!this.container || !this.isInitialized) return;
    
//     const width = this.container.clientWidth;
//     const height = this.container.clientHeight;
    
//     this.camera.aspect = width / height;
//     this.camera.updateProjectionMatrix();
//     this.renderer.setSize(width, height);
//   }

//   dispose() {
//     console.log('🧹 Disposing Three.js scene');
    
//     if (this.animationFrameId) {
//       cancelAnimationFrame(this.animationFrameId);
//     }
    
//     window.removeEventListener('resize', this.onWindowResize.bind(this));
    
//     this.balls.forEach(ball => {
//       if (ball.geometry) ball.geometry.dispose();
//       if (ball.material) ball.material.dispose();
//     });
    
//     if (this.machine) {
//       this.machine.traverse(child => {
//         if (child.geometry) child.geometry.dispose();
//         if (child.material) child.material.dispose();
//       });
//     }
    
//     if (this.particles) {
//       this.particles.geometry.dispose();
//       this.particles.material.dispose();
//     }
    
//     this.glowRings.forEach(ring => {
//       ring.geometry.dispose();
//       ring.material.dispose();
//     });
    
//     if (this.renderer) {
//       this.renderer.dispose();
//       if (this.container && this.renderer.domElement) {
//         this.container.removeChild(this.renderer.domElement);
//       }
//     }
    
//     this.isInitialized = false;
//   }
// }
//last workable code
// // src/services/three/LotteryMachineScene.js
// // ✨ 3D LOTTERY MACHINE - GUARANTEED WORKING VERSION
// import * as THREE from 'three';
// import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

// export class LotteryMachineScene {
//   constructor(container) {
//     this.container = container;
//     this.scene = null;
//     this.camera = null;
//     this.renderer = null;
//     this.controls = null;
//     this.balls = [];
//     this.machine = null;
//     this.animationFrameId = null;
//     this.rotationSpeed = 0.3;
//     this.ballSpinSpeed = 0.5;
//     this.isInitialized = false;
    
//     // ✨ Particle systems
//     this.particles = null;
//     this.glowRings = [];
//     this.accentLights = [];
    
//     // ✅ CRITICAL: Wait for container to have size, then initialize
//     this.waitForContainerAndInit();
//   }

//   // ✅ NEW: Ensure container has size before initializing
//   waitForContainerAndInit() {
//     const checkAndInit = () => {
//       if (!this.container) {
//         console.error('❌ Container is null');
//         return;
//       }

//       const width = this.container.clientWidth;
//       const height = this.container.clientHeight;

//       console.log('📏 Container dimensions:', width, 'x', height);

//       if (width > 0 && height > 0) {
//         console.log('✅ Container has size, initializing...');
//         this.init();
//       } else {
//         console.warn('⏳ Waiting for container size...');
//         setTimeout(checkAndInit, 100);
//       }
//     };

//     // Start checking
//     checkAndInit();
//   }

//   init() {
//     try {
//       console.log('🎨 Initializing Three.js scene...');
      
//       const width = this.container.clientWidth;
//       const height = this.container.clientHeight;

//       // ✅ CRITICAL: Verify dimensions
//       if (width === 0 || height === 0) {
//         throw new Error('Container has no dimensions');
//       }

//       // Create scene
//       this.scene = new THREE.Scene();
//       this.scene.background = new THREE.Color(0x0a0a1f);
      
//       // Add fog for depth
//       this.scene.fog = new THREE.Fog(0x0a0a1f, 20, 50);
      
//       // Create camera with better position to see full machine
//       this.camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
//       this.camera.position.set(0, 8, 20); // ✅ FIXED: Pull back and up for full view
//       this.camera.lookAt(0, 0, 0);
      
//       // Create renderer with enhanced settings
//       this.renderer = new THREE.WebGLRenderer({ 
//         antialias: true,
//         alpha: true,
//         powerPreference: 'high-performance',
//       });
      
//       this.renderer.setSize(width, height);
//       this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
//       this.renderer.shadowMap.enabled = true;
//       this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
//       this.renderer.outputEncoding = THREE.sRGBEncoding;
//       this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
//       this.renderer.toneMappingExposure = 1.2;
      
//       // ✅ CRITICAL: Clear container and append renderer
//       while (this.container.firstChild) {
//         this.container.removeChild(this.container.firstChild);
//       }
      
//       this.container.appendChild(this.renderer.domElement);
//       console.log('✅ Renderer appended to container');
      
//       // Add orbit controls
//       this.controls = new OrbitControls(this.camera, this.renderer.domElement);
//       this.controls.enableDamping = true;
//       this.controls.dampingFactor = 0.05;
//       this.controls.minDistance = 10;
//       this.controls.maxDistance = 30;
//       this.controls.maxPolarAngle = Math.PI / 1.8;
//       this.controls.autoRotate = true;
//       this.controls.autoRotateSpeed = 0.5;
      
//       // Add lights
//       this.setupLights();
      
//       // Create lottery machine
//       this.createMachine();
      
//       // Add particle system
//       this.createParticleSystem();
      
//       // Add glow rings
//       this.createGlowRings();
      
//       // Handle window resize
//       window.addEventListener('resize', this.onWindowResize.bind(this));
      
//       // Mark as initialized
//       this.isInitialized = true;
      
//       // ✅ CRITICAL: Start animation loop
//       console.log('🎬 Starting animation loop...');
//       this.animate();
      
//       console.log('✅ Three.js scene initialized successfully');
      
//     } catch (error) {
//       console.error('❌ Failed to initialize scene:', error);
//       throw error;
//     }
//   }

//   setupLights() {
//     // Ambient light
//     const ambientLight = new THREE.AmbientLight(0xffffff, 0.3);
//     this.scene.add(ambientLight);
    
//     // Main spotlight
//     const spotLight = new THREE.SpotLight(0xffffff, 2);
//     spotLight.position.set(0, 25, 0);
//     spotLight.angle = Math.PI / 6;
//     spotLight.penumbra = 0.3;
//     spotLight.decay = 2;
//     spotLight.distance = 50;
//     spotLight.castShadow = true;
//     spotLight.shadow.mapSize.width = 2048;
//     spotLight.shadow.mapSize.height = 2048;
//     this.scene.add(spotLight);
    
//     // Animated colored accent lights
//     const createAccentLight = (color, x, z) => {
//       const light = new THREE.PointLight(color, 1.5, 50);
//       light.position.set(x, 5, z);
//       return light;
//     };
    
//     const accentLight1 = createAccentLight(0x4f46e5, 10, 10);
//     const accentLight2 = createAccentLight(0xec4899, -10, -10);
//     const accentLight3 = createAccentLight(0x10b981, 10, -10);
//     const accentLight4 = createAccentLight(0xf59e0b, -10, 10);
    
//     this.scene.add(accentLight1, accentLight2, accentLight3, accentLight4);
//     this.accentLights = [accentLight1, accentLight2, accentLight3, accentLight4];
    
//     // Rim lights
//     const rimLight1 = new THREE.DirectionalLight(0x6366f1, 0.8);
//     rimLight1.position.set(15, 10, -15);
//     this.scene.add(rimLight1);
    
//     const rimLight2 = new THREE.DirectionalLight(0xec4899, 0.8);
//     rimLight2.position.set(-15, 10, 15);
//     this.scene.add(rimLight2);
//   }

//   createMachine() {
//     const machineGroup = new THREE.Group();
    
//     // Glass container
//     const containerGeometry = new THREE.SphereGeometry(5, 64, 64);
//     containerGeometry.scale(1, 1.3, 1);
    
//     const containerMaterial = new THREE.MeshPhysicalMaterial({
//       color: 0xffffff,
//       transparent: true,
//       opacity: 0.25, // ✅ FIXED: More visible (was 0.12)
//       metalness: 0,
//       roughness: 0.05,
//       transmission: 0.95,
//       thickness: 0.5,
//       ior: 1.5,
//       reflectivity: 0.5,
//       envMapIntensity: 1,
//       clearcoat: 1,
//       clearcoatRoughness: 0,
//       side: THREE.DoubleSide,
//     });
    
//     const container = new THREE.Mesh(containerGeometry, containerMaterial);
//     container.castShadow = true;
//     container.receiveShadow = true;
//     machineGroup.add(container);
    
//     // Gold rings
//     const createRing = (radius, y) => {
//       const ringGeometry = new THREE.TorusGeometry(radius, 0.15, 16, 100);
//       const ringMaterial = new THREE.MeshStandardMaterial({
//         color: 0xffd700,
//         metalness: 1,
//         roughness: 0.15,
//         emissive: 0xffaa00,
//         emissiveIntensity: 0.3,
//       });
      
//       const ring = new THREE.Mesh(ringGeometry, ringMaterial);
//       ring.rotation.x = Math.PI / 2;
//       ring.position.y = y;
//       ring.castShadow = true;
//       return ring;
//     };
    
//     machineGroup.add(createRing(5.2, 4));
//     machineGroup.add(createRing(5.2, 0));
//     machineGroup.add(createRing(5.2, -4));
    
//     // Base stand
//     const standGeometry = new THREE.CylinderGeometry(1.5, 3, 3, 32);
//     const standMaterial = new THREE.MeshStandardMaterial({
//       color: 0x1e1b4b,
//       metalness: 0.9,
//       roughness: 0.2,
//       emissive: 0x312e81,
//       emissiveIntensity: 0.2,
//     });
//     const stand = new THREE.Mesh(standGeometry, standMaterial);
//     stand.position.y = -6.5;
//     stand.castShadow = true;
//     machineGroup.add(stand);
    
//     // Base glow
//     const baseGlowGeometry = new THREE.CylinderGeometry(3.2, 3.2, 0.2, 32);
//     const baseGlowMaterial = new THREE.MeshBasicMaterial({
//       color: 0x4f46e5,
//       transparent: true,
//       opacity: 0.3,
//     });
//     const baseGlow = new THREE.Mesh(baseGlowGeometry, baseGlowMaterial);
//     baseGlow.position.y = -8;
//     machineGroup.add(baseGlow);
    
//     this.machine = machineGroup;
//     this.scene.add(machineGroup);
    
//     console.log('✅ Lottery machine created');
//   }

//   createParticleSystem() {
//     const particleCount = 300;
//     const positions = new Float32Array(particleCount * 3);
//     const colors = new Float32Array(particleCount * 3);
    
//     const color = new THREE.Color();
//     const colorOptions = [0x4f46e5, 0xec4899, 0x10b981, 0xf59e0b];
    
//     for (let i = 0; i < particleCount; i++) {
//       const i3 = i * 3;
//       const radius = 8 + Math.random() * 5;
//       const theta = Math.random() * Math.PI * 2;
//       const phi = Math.acos(2 * Math.random() - 1);
      
//       positions[i3] = radius * Math.sin(phi) * Math.cos(theta);
//       positions[i3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
//       positions[i3 + 2] = radius * Math.cos(phi);
      
//       color.setHex(colorOptions[Math.floor(Math.random() * colorOptions.length)]);
//       colors[i3] = color.r;
//       colors[i3 + 1] = color.g;
//       colors[i3 + 2] = color.b;
//     }
    
//     const geometry = new THREE.BufferGeometry();
//     geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
//     geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    
//     const material = new THREE.PointsMaterial({
//       size: 0.1,
//       vertexColors: true,
//       transparent: true,
//       opacity: 0.6,
//       blending: THREE.AdditiveBlending,
//     });
    
//     this.particles = new THREE.Points(geometry, material);
//     this.scene.add(this.particles);
//   }

//   createGlowRings() {
//     for (let i = 0; i < 3; i++) {
//       const ringGeometry = new THREE.TorusGeometry(6 + i, 0.03, 16, 100);
//       const ringMaterial = new THREE.MeshBasicMaterial({
//         color: [0x4f46e5, 0xec4899, 0x10b981][i],
//         transparent: true,
//         opacity: 0.4,
//       });
      
//       const ring = new THREE.Mesh(ringGeometry, ringMaterial);
//       ring.rotation.x = Math.PI / 2;
      
//       this.glowRings.push(ring);
//       this.scene.add(ring);
//     }
//   }

//   createBall(ballNumber, color = null) {
//     if (!color) {
//       const colors = [0x4f46e5, 0xec4899, 0x10b981, 0xf59e0b, 0xef4444, 0x8b5cf6, 0x06b6d4, 0xf97316];
//       color = colors[Math.floor(Math.random() * colors.length)];
//     }
    
//     const ballGeometry = new THREE.SphereGeometry(0.35, 32, 32);
//     const ballMaterial = new THREE.MeshPhysicalMaterial({
//       color: color,
//       metalness: 0.2,
//       roughness: 0.15,
//       clearcoat: 1,
//       clearcoatRoughness: 0.05,
//       reflectivity: 0.8,
//       emissive: color,
//       emissiveIntensity: 0.15,
//     });
    
//     const ball = new THREE.Mesh(ballGeometry, ballMaterial);
//     ball.castShadow = true;
//     ball.receiveShadow = true;
    
//     // Add number texture
//     const canvas = document.createElement('canvas');
//     canvas.width = 512;
//     canvas.height = 512;
//     const context = canvas.getContext('2d');
    
//     context.fillStyle = 'rgba(255, 255, 255, 0.9)';
//     context.beginPath();
//     context.arc(256, 256, 200, 0, Math.PI * 2);
//     context.fill();
    
//     context.fillStyle = '#000000';
//     context.font = 'bold 180px Arial';
//     context.textAlign = 'center';
//     context.textBaseline = 'middle';
//     const numText = ballNumber.toString().slice(-4);
//     context.fillText(numText, 256, 256);
    
//     const texture = new THREE.CanvasTexture(canvas);
//     const numberMaterial = new THREE.MeshBasicMaterial({ 
//       map: texture,
//       transparent: true,
//     });
    
//     const numberPlane = new THREE.Mesh(
//       new THREE.PlaneGeometry(0.5, 0.5),
//       numberMaterial
//     );
//     numberPlane.position.z = 0.36;
//     ball.add(numberPlane);
    
//     ball.userData.ballNumber = ballNumber;
//     ball.userData.color = color;
    
//     return ball;
//   }

//   addBall(ballNumber, animate = true) {
//     const ball = this.createBall(ballNumber);
    
//     if (animate) {
//       ball.position.set((Math.random() - 0.5) * 8, 15, (Math.random() - 0.5) * 8);
//       ball.scale.set(0, 0, 0);
//       this.animateBallEntry(ball);
//     } else {
//       const radius = Math.random() * 4;
//       const angle = Math.random() * Math.PI * 2;
//       const height = (Math.random() - 0.5) * 5;
//       ball.position.set(Math.cos(angle) * radius, height, Math.sin(angle) * radius);
//     }
    
//     this.balls.push(ball);
//     this.scene.add(ball);
    
//     console.log('✅ Ball added:', ballNumber, '- Total balls:', this.balls.length);
    
//     return ball;
//   }

//   animateBallEntry(ball) {
//     const startY = ball.position.y;
//     const targetY = (Math.random() - 0.5) * 5;
//     const duration = 2000;
//     const startTime = Date.now();
    
//     const animate = () => {
//       const elapsed = Date.now() - startTime;
//       const progress = Math.min(elapsed / duration, 1);
//       const easeProgress = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      
//       ball.position.y = startY - (startY - targetY) * easeProgress;
//       ball.scale.setScalar(easeProgress);
//       ball.rotation.x = progress * Math.PI * 4;
//       ball.rotation.y = progress * Math.PI * 4;
      
//       if (progress < 1) {
//         requestAnimationFrame(animate);
//       }
//     };
    
//     animate();
//   }

//   spinBalls(speed = 1) {
//     const time = Date.now() * 0.001;
    
//     this.balls.forEach((ball, index) => {
//       const radius = 3 + Math.sin(time * 0.5 + index) * 0.8;
//       const angle = time * speed + index * (Math.PI * 2 / this.balls.length);
//       const height = Math.sin(time * 1.5 + index * 0.5) * 2.5;
      
//       ball.position.x = Math.cos(angle) * radius;
//       ball.position.z = Math.sin(angle) * radius;
//       ball.position.y = height;
      
//       ball.rotation.x += 0.02;
//       ball.rotation.y += 0.02;
      
//       const glow = 1 + Math.sin(time * 3 + index) * 0.2;
//       ball.material.emissiveIntensity = 0.15 * glow;
//     });
//   }

//   highlightBall(ballNumber) {
//     const ball = this.balls.find(b => b.userData.ballNumber === ballNumber);
//     if (!ball) return null;
    
//     const glowGeometry = new THREE.SphereGeometry(0.5, 32, 32);
//     const glowMaterial = new THREE.MeshBasicMaterial({
//       color: 0xffd700,
//       transparent: true,
//       opacity: 0.4,
//       blending: THREE.AdditiveBlending,
//     });
//     const glow = new THREE.Mesh(glowGeometry, glowMaterial);
//     ball.add(glow);
    
//     let time = 0;
//     const animateGlow = () => {
//       time += 0.05;
//       const scale = 1 + Math.sin(time) * 0.3;
//       glow.scale.set(scale, scale, scale);
//       requestAnimationFrame(animateGlow);
//     };
//     animateGlow();
    
//     return ball;
//   }

//   extractBall(ballNumber, onComplete) {
//     const ballIndex = this.balls.findIndex(b => b.userData.ballNumber === ballNumber);
//     if (ballIndex === -1) return;
    
//     const ball = this.balls[ballIndex];
//     const startPos = ball.position.clone();
//     const targetPos = new THREE.Vector3(0, 10, 0);
//     const duration = 3000;
//     const startTime = Date.now();
    
//     const animate = () => {
//       const elapsed = Date.now() - startTime;
//       const progress = Math.min(elapsed / duration, 1);
//       const easeProgress = 1 - Math.pow(1 - progress, 3);
      
//       ball.position.lerpVectors(startPos, targetPos, easeProgress);
//       ball.scale.setScalar(1 + easeProgress * 3);
//       ball.rotation.y += 0.1;
//       ball.material.emissiveIntensity = 0.15 + easeProgress * 0.85;
      
//       if (progress < 1) {
//         requestAnimationFrame(animate);
//       } else {
//         this.balls.splice(ballIndex, 1);
//         this.scene.remove(ball);
//         if (onComplete) onComplete(ball);
//       }
//     };
    
//     animate();
//   }

//   rotateMachine(speed = 0.5) {
//     if (this.machine) {
//       this.machine.rotation.y += 0.01 * speed;
//     }
//   }

//   setRotationSpeed(speed) {
//     this.rotationSpeed = speed;
//   }

//   setBallSpinSpeed(speed) {
//     this.ballSpinSpeed = speed;
//   }

//   // ✅ CRITICAL: Animation loop
//   animate() {
//     if (!this.isInitialized) {
//       console.warn('⚠️ Animation called before initialization');
//       return;
//     }

//     this.animationFrameId = requestAnimationFrame(this.animate.bind(this));
    
//     const time = Date.now() * 0.001;
    
//     // Update controls
//     this.controls.update();
    
//     // Rotate machine
//     this.rotateMachine(this.rotationSpeed);
    
//     // Spin balls
//     this.spinBalls(this.ballSpinSpeed);
    
//     // Animate particles
//     if (this.particles) {
//       this.particles.rotation.y = time * 0.05;
//     }
    
//     // Animate glow rings
//     this.glowRings.forEach((ring, i) => {
//       ring.rotation.z = time * (0.2 + i * 0.1);
//       ring.scale.setScalar(1 + Math.sin(time * 2 + i) * 0.1);
//     });
    
//     // Animate accent lights
//     if (this.accentLights) {
//       this.accentLights.forEach((light, i) => {
//         light.intensity = 1.5 + Math.sin(time * 2 + i * Math.PI / 2) * 0.5;
//       });
//     }
    
//     // Render
//     this.renderer.render(this.scene, this.camera);
//   }

//   onWindowResize() {
//     if (!this.container || !this.isInitialized) return;
    
//     const width = this.container.clientWidth;
//     const height = this.container.clientHeight;
    
//     this.camera.aspect = width / height;
//     this.camera.updateProjectionMatrix();
//     this.renderer.setSize(width, height);
//   }

//   dispose() {
//     console.log('🧹 Disposing Three.js scene');
    
//     if (this.animationFrameId) {
//       cancelAnimationFrame(this.animationFrameId);
//     }
    
//     window.removeEventListener('resize', this.onWindowResize.bind(this));
    
//     this.balls.forEach(ball => {
//       if (ball.geometry) ball.geometry.dispose();
//       if (ball.material) ball.material.dispose();
//     });
    
//     if (this.machine) {
//       this.machine.traverse(child => {
//         if (child.geometry) child.geometry.dispose();
//         if (child.material) child.material.dispose();
//       });
//     }
    
//     if (this.particles) {
//       this.particles.geometry.dispose();
//       this.particles.material.dispose();
//     }
    
//     this.glowRings.forEach(ring => {
//       ring.geometry.dispose();
//       ring.material.dispose();
//     });
    
//     if (this.renderer) {
//       this.renderer.dispose();
//       if (this.container && this.renderer.domElement) {
//         this.container.removeChild(this.renderer.domElement);
//       }
//     }
    
//     this.isInitialized = false;
//   }
// }
//last successfull workable code
// // src/services/three/LotteryMachineScene.js
// // ✨ 3D LOTTERY MACHINE - GUARANTEED WORKING VERSION
// import * as THREE from 'three';
// import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

// export class LotteryMachineScene {
//   constructor(container) {
//     this.container = container;
//     this.scene = null;
//     this.camera = null;
//     this.renderer = null;
//     this.controls = null;
//     this.balls = [];
//     this.machine = null;
//     this.animationFrameId = null;
//     this.rotationSpeed = 0.3;
//     this.ballSpinSpeed = 0.5;
//     this.isInitialized = false;
    
//     // ✨ Particle systems
//     this.particles = null;
//     this.glowRings = [];
//     this.accentLights = [];
    
//     // ✅ CRITICAL: Wait for container to have size, then initialize
//     this.waitForContainerAndInit();
//   }

//   // ✅ NEW: Ensure container has size before initializing
//   waitForContainerAndInit() {
//     const checkAndInit = () => {
//       if (!this.container) {
//         console.error('❌ Container is null');
//         return;
//       }

//       const width = this.container.clientWidth;
//       const height = this.container.clientHeight;

//       console.log('📏 Container dimensions:', width, 'x', height);

//       if (width > 0 && height > 0) {
//         console.log('✅ Container has size, initializing...');
//         this.init();
//       } else {
//         console.warn('⏳ Waiting for container size...');
//         setTimeout(checkAndInit, 100);
//       }
//     };

//     // Start checking
//     checkAndInit();
//   }

//   init() {
//     try {
//       console.log('🎨 Initializing Three.js scene...');
      
//       const width = this.container.clientWidth;
//       const height = this.container.clientHeight;

//       // ✅ CRITICAL: Verify dimensions
//       if (width === 0 || height === 0) {
//         throw new Error('Container has no dimensions');
//       }

//       // Create scene
//       this.scene = new THREE.Scene();
//       this.scene.background = new THREE.Color(0x0a0a1f);
      
//       // Add fog for depth
//       this.scene.fog = new THREE.Fog(0x0a0a1f, 20, 50);
      
//       // Create camera
//       this.camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
//       this.camera.position.set(0, 5, 15);
//       this.camera.lookAt(0, 0, 0);
      
//       // Create renderer with enhanced settings
//       this.renderer = new THREE.WebGLRenderer({ 
//         antialias: true,
//         alpha: true,
//         powerPreference: 'high-performance',
//       });
      
//       this.renderer.setSize(width, height);
//       this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
//       this.renderer.shadowMap.enabled = true;
//       this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
//       this.renderer.outputEncoding = THREE.sRGBEncoding;
//       this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
//       this.renderer.toneMappingExposure = 1.2;
      
//       // ✅ CRITICAL: Clear container and append renderer
//       while (this.container.firstChild) {
//         this.container.removeChild(this.container.firstChild);
//       }
      
//       this.container.appendChild(this.renderer.domElement);
//       console.log('✅ Renderer appended to container');
      
//       // Add orbit controls
//       this.controls = new OrbitControls(this.camera, this.renderer.domElement);
//       this.controls.enableDamping = true;
//       this.controls.dampingFactor = 0.05;
//       this.controls.minDistance = 10;
//       this.controls.maxDistance = 30;
//       this.controls.maxPolarAngle = Math.PI / 1.8;
//       this.controls.autoRotate = true;
//       this.controls.autoRotateSpeed = 0.5;
      
//       // Add lights
//       this.setupLights();
      
//       // Create lottery machine
//       this.createMachine();
      
//       // Add particle system
//       this.createParticleSystem();
      
//       // Add glow rings
//       this.createGlowRings();
      
//       // Handle window resize
//       window.addEventListener('resize', this.onWindowResize.bind(this));
      
//       // Mark as initialized
//       this.isInitialized = true;
      
//       // ✅ CRITICAL: Start animation loop
//       console.log('🎬 Starting animation loop...');
//       this.animate();
      
//       console.log('✅ Three.js scene initialized successfully');
      
//     } catch (error) {
//       console.error('❌ Failed to initialize scene:', error);
//       throw error;
//     }
//   }

//   setupLights() {
//     // Ambient light
//     const ambientLight = new THREE.AmbientLight(0xffffff, 0.3);
//     this.scene.add(ambientLight);
    
//     // Main spotlight
//     const spotLight = new THREE.SpotLight(0xffffff, 2);
//     spotLight.position.set(0, 25, 0);
//     spotLight.angle = Math.PI / 6;
//     spotLight.penumbra = 0.3;
//     spotLight.decay = 2;
//     spotLight.distance = 50;
//     spotLight.castShadow = true;
//     spotLight.shadow.mapSize.width = 2048;
//     spotLight.shadow.mapSize.height = 2048;
//     this.scene.add(spotLight);
    
//     // Animated colored accent lights
//     const createAccentLight = (color, x, z) => {
//       const light = new THREE.PointLight(color, 1.5, 50);
//       light.position.set(x, 5, z);
//       return light;
//     };
    
//     const accentLight1 = createAccentLight(0x4f46e5, 10, 10);
//     const accentLight2 = createAccentLight(0xec4899, -10, -10);
//     const accentLight3 = createAccentLight(0x10b981, 10, -10);
//     const accentLight4 = createAccentLight(0xf59e0b, -10, 10);
    
//     this.scene.add(accentLight1, accentLight2, accentLight3, accentLight4);
//     this.accentLights = [accentLight1, accentLight2, accentLight3, accentLight4];
    
//     // Rim lights
//     const rimLight1 = new THREE.DirectionalLight(0x6366f1, 0.8);
//     rimLight1.position.set(15, 10, -15);
//     this.scene.add(rimLight1);
    
//     const rimLight2 = new THREE.DirectionalLight(0xec4899, 0.8);
//     rimLight2.position.set(-15, 10, 15);
//     this.scene.add(rimLight2);
//   }

//   createMachine() {
//     const machineGroup = new THREE.Group();
    
//     // Glass container
//     const containerGeometry = new THREE.SphereGeometry(5, 64, 64);
//     containerGeometry.scale(1, 1.3, 1);
    
//     const containerMaterial = new THREE.MeshPhysicalMaterial({
//       color: 0xffffff,
//       transparent: true,
//       opacity: 0.12,
//       metalness: 0,
//       roughness: 0.05,
//       transmission: 0.95,
//       thickness: 0.5,
//       ior: 1.5,
//       reflectivity: 0.5,
//       envMapIntensity: 1,
//       clearcoat: 1,
//       clearcoatRoughness: 0,
//       side: THREE.DoubleSide,
//     });
    
//     const container = new THREE.Mesh(containerGeometry, containerMaterial);
//     container.castShadow = true;
//     container.receiveShadow = true;
//     machineGroup.add(container);
    
//     // Gold rings
//     const createRing = (radius, y) => {
//       const ringGeometry = new THREE.TorusGeometry(radius, 0.15, 16, 100);
//       const ringMaterial = new THREE.MeshStandardMaterial({
//         color: 0xffd700,
//         metalness: 1,
//         roughness: 0.15,
//         emissive: 0xffaa00,
//         emissiveIntensity: 0.3,
//       });
      
//       const ring = new THREE.Mesh(ringGeometry, ringMaterial);
//       ring.rotation.x = Math.PI / 2;
//       ring.position.y = y;
//       ring.castShadow = true;
//       return ring;
//     };
    
//     machineGroup.add(createRing(5.2, 4));
//     machineGroup.add(createRing(5.2, 0));
//     machineGroup.add(createRing(5.2, -4));
    
//     // Base stand
//     const standGeometry = new THREE.CylinderGeometry(1.5, 3, 3, 32);
//     const standMaterial = new THREE.MeshStandardMaterial({
//       color: 0x1e1b4b,
//       metalness: 0.9,
//       roughness: 0.2,
//       emissive: 0x312e81,
//       emissiveIntensity: 0.2,
//     });
//     const stand = new THREE.Mesh(standGeometry, standMaterial);
//     stand.position.y = -6.5;
//     stand.castShadow = true;
//     machineGroup.add(stand);
    
//     // Base glow
//     const baseGlowGeometry = new THREE.CylinderGeometry(3.2, 3.2, 0.2, 32);
//     const baseGlowMaterial = new THREE.MeshBasicMaterial({
//       color: 0x4f46e5,
//       transparent: true,
//       opacity: 0.3,
//     });
//     const baseGlow = new THREE.Mesh(baseGlowGeometry, baseGlowMaterial);
//     baseGlow.position.y = -8;
//     machineGroup.add(baseGlow);
    
//     this.machine = machineGroup;
//     this.scene.add(machineGroup);
    
//     console.log('✅ Lottery machine created');
//   }

//   createParticleSystem() {
//     const particleCount = 300;
//     const positions = new Float32Array(particleCount * 3);
//     const colors = new Float32Array(particleCount * 3);
    
//     const color = new THREE.Color();
//     const colorOptions = [0x4f46e5, 0xec4899, 0x10b981, 0xf59e0b];
    
//     for (let i = 0; i < particleCount; i++) {
//       const i3 = i * 3;
//       const radius = 8 + Math.random() * 5;
//       const theta = Math.random() * Math.PI * 2;
//       const phi = Math.acos(2 * Math.random() - 1);
      
//       positions[i3] = radius * Math.sin(phi) * Math.cos(theta);
//       positions[i3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
//       positions[i3 + 2] = radius * Math.cos(phi);
      
//       color.setHex(colorOptions[Math.floor(Math.random() * colorOptions.length)]);
//       colors[i3] = color.r;
//       colors[i3 + 1] = color.g;
//       colors[i3 + 2] = color.b;
//     }
    
//     const geometry = new THREE.BufferGeometry();
//     geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
//     geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    
//     const material = new THREE.PointsMaterial({
//       size: 0.1,
//       vertexColors: true,
//       transparent: true,
//       opacity: 0.6,
//       blending: THREE.AdditiveBlending,
//     });
    
//     this.particles = new THREE.Points(geometry, material);
//     this.scene.add(this.particles);
//   }

//   createGlowRings() {
//     for (let i = 0; i < 3; i++) {
//       const ringGeometry = new THREE.TorusGeometry(6 + i, 0.03, 16, 100);
//       const ringMaterial = new THREE.MeshBasicMaterial({
//         color: [0x4f46e5, 0xec4899, 0x10b981][i],
//         transparent: true,
//         opacity: 0.4,
//       });
      
//       const ring = new THREE.Mesh(ringGeometry, ringMaterial);
//       ring.rotation.x = Math.PI / 2;
      
//       this.glowRings.push(ring);
//       this.scene.add(ring);
//     }
//   }

//   createBall(ballNumber, color = null) {
//     if (!color) {
//       const colors = [0x4f46e5, 0xec4899, 0x10b981, 0xf59e0b, 0xef4444, 0x8b5cf6, 0x06b6d4, 0xf97316];
//       color = colors[Math.floor(Math.random() * colors.length)];
//     }
    
//     const ballGeometry = new THREE.SphereGeometry(0.35, 32, 32);
//     const ballMaterial = new THREE.MeshPhysicalMaterial({
//       color: color,
//       metalness: 0.2,
//       roughness: 0.15,
//       clearcoat: 1,
//       clearcoatRoughness: 0.05,
//       reflectivity: 0.8,
//       emissive: color,
//       emissiveIntensity: 0.15,
//     });
    
//     const ball = new THREE.Mesh(ballGeometry, ballMaterial);
//     ball.castShadow = true;
//     ball.receiveShadow = true;
    
//     // Add number texture
//     const canvas = document.createElement('canvas');
//     canvas.width = 512;
//     canvas.height = 512;
//     const context = canvas.getContext('2d');
    
//     context.fillStyle = 'rgba(255, 255, 255, 0.9)';
//     context.beginPath();
//     context.arc(256, 256, 200, 0, Math.PI * 2);
//     context.fill();
    
//     context.fillStyle = '#000000';
//     context.font = 'bold 180px Arial';
//     context.textAlign = 'center';
//     context.textBaseline = 'middle';
//     const numText = ballNumber.toString().slice(-4);
//     context.fillText(numText, 256, 256);
    
//     const texture = new THREE.CanvasTexture(canvas);
//     const numberMaterial = new THREE.MeshBasicMaterial({ 
//       map: texture,
//       transparent: true,
//     });
    
//     const numberPlane = new THREE.Mesh(
//       new THREE.PlaneGeometry(0.5, 0.5),
//       numberMaterial
//     );
//     numberPlane.position.z = 0.36;
//     ball.add(numberPlane);
    
//     ball.userData.ballNumber = ballNumber;
//     ball.userData.color = color;
    
//     return ball;
//   }

//   addBall(ballNumber, animate = true) {
//     const ball = this.createBall(ballNumber);
    
//     if (animate) {
//       ball.position.set((Math.random() - 0.5) * 8, 15, (Math.random() - 0.5) * 8);
//       ball.scale.set(0, 0, 0);
//       this.animateBallEntry(ball);
//     } else {
//       const radius = Math.random() * 4;
//       const angle = Math.random() * Math.PI * 2;
//       const height = (Math.random() - 0.5) * 5;
//       ball.position.set(Math.cos(angle) * radius, height, Math.sin(angle) * radius);
//     }
    
//     this.balls.push(ball);
//     this.scene.add(ball);
    
//     console.log('✅ Ball added:', ballNumber, '- Total balls:', this.balls.length);
    
//     return ball;
//   }

//   animateBallEntry(ball) {
//     const startY = ball.position.y;
//     const targetY = (Math.random() - 0.5) * 5;
//     const duration = 2000;
//     const startTime = Date.now();
    
//     const animate = () => {
//       const elapsed = Date.now() - startTime;
//       const progress = Math.min(elapsed / duration, 1);
//       const easeProgress = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      
//       ball.position.y = startY - (startY - targetY) * easeProgress;
//       ball.scale.setScalar(easeProgress);
//       ball.rotation.x = progress * Math.PI * 4;
//       ball.rotation.y = progress * Math.PI * 4;
      
//       if (progress < 1) {
//         requestAnimationFrame(animate);
//       }
//     };
    
//     animate();
//   }

//   spinBalls(speed = 1) {
//     const time = Date.now() * 0.001;
    
//     this.balls.forEach((ball, index) => {
//       const radius = 3 + Math.sin(time * 0.5 + index) * 0.8;
//       const angle = time * speed + index * (Math.PI * 2 / this.balls.length);
//       const height = Math.sin(time * 1.5 + index * 0.5) * 2.5;
      
//       ball.position.x = Math.cos(angle) * radius;
//       ball.position.z = Math.sin(angle) * radius;
//       ball.position.y = height;
      
//       ball.rotation.x += 0.02;
//       ball.rotation.y += 0.02;
      
//       const glow = 1 + Math.sin(time * 3 + index) * 0.2;
//       ball.material.emissiveIntensity = 0.15 * glow;
//     });
//   }

//   highlightBall(ballNumber) {
//     const ball = this.balls.find(b => b.userData.ballNumber === ballNumber);
//     if (!ball) return null;
    
//     const glowGeometry = new THREE.SphereGeometry(0.5, 32, 32);
//     const glowMaterial = new THREE.MeshBasicMaterial({
//       color: 0xffd700,
//       transparent: true,
//       opacity: 0.4,
//       blending: THREE.AdditiveBlending,
//     });
//     const glow = new THREE.Mesh(glowGeometry, glowMaterial);
//     ball.add(glow);
    
//     let time = 0;
//     const animateGlow = () => {
//       time += 0.05;
//       const scale = 1 + Math.sin(time) * 0.3;
//       glow.scale.set(scale, scale, scale);
//       requestAnimationFrame(animateGlow);
//     };
//     animateGlow();
    
//     return ball;
//   }

//   extractBall(ballNumber, onComplete) {
//     const ballIndex = this.balls.findIndex(b => b.userData.ballNumber === ballNumber);
//     if (ballIndex === -1) return;
    
//     const ball = this.balls[ballIndex];
//     const startPos = ball.position.clone();
//     const targetPos = new THREE.Vector3(0, 10, 0);
//     const duration = 3000;
//     const startTime = Date.now();
    
//     const animate = () => {
//       const elapsed = Date.now() - startTime;
//       const progress = Math.min(elapsed / duration, 1);
//       const easeProgress = 1 - Math.pow(1 - progress, 3);
      
//       ball.position.lerpVectors(startPos, targetPos, easeProgress);
//       ball.scale.setScalar(1 + easeProgress * 3);
//       ball.rotation.y += 0.1;
//       ball.material.emissiveIntensity = 0.15 + easeProgress * 0.85;
      
//       if (progress < 1) {
//         requestAnimationFrame(animate);
//       } else {
//         this.balls.splice(ballIndex, 1);
//         this.scene.remove(ball);
//         if (onComplete) onComplete(ball);
//       }
//     };
    
//     animate();
//   }

//   rotateMachine(speed = 0.5) {
//     if (this.machine) {
//       this.machine.rotation.y += 0.01 * speed;
//     }
//   }

//   setRotationSpeed(speed) {
//     this.rotationSpeed = speed;
//   }

//   setBallSpinSpeed(speed) {
//     this.ballSpinSpeed = speed;
//   }

//   // ✅ CRITICAL: Animation loop
//   animate() {
//     if (!this.isInitialized) {
//       console.warn('⚠️ Animation called before initialization');
//       return;
//     }

//     this.animationFrameId = requestAnimationFrame(this.animate.bind(this));
    
//     const time = Date.now() * 0.001;
    
//     // Update controls
//     this.controls.update();
    
//     // Rotate machine
//     this.rotateMachine(this.rotationSpeed);
    
//     // Spin balls
//     this.spinBalls(this.ballSpinSpeed);
    
//     // Animate particles
//     if (this.particles) {
//       this.particles.rotation.y = time * 0.05;
//     }
    
//     // Animate glow rings
//     this.glowRings.forEach((ring, i) => {
//       ring.rotation.z = time * (0.2 + i * 0.1);
//       ring.scale.setScalar(1 + Math.sin(time * 2 + i) * 0.1);
//     });
    
//     // Animate accent lights
//     if (this.accentLights) {
//       this.accentLights.forEach((light, i) => {
//         light.intensity = 1.5 + Math.sin(time * 2 + i * Math.PI / 2) * 0.5;
//       });
//     }
    
//     // Render
//     this.renderer.render(this.scene, this.camera);
//   }

//   onWindowResize() {
//     if (!this.container || !this.isInitialized) return;
    
//     const width = this.container.clientWidth;
//     const height = this.container.clientHeight;
    
//     this.camera.aspect = width / height;
//     this.camera.updateProjectionMatrix();
//     this.renderer.setSize(width, height);
//   }

//   dispose() {
//     console.log('🧹 Disposing Three.js scene');
    
//     if (this.animationFrameId) {
//       cancelAnimationFrame(this.animationFrameId);
//     }
    
//     window.removeEventListener('resize', this.onWindowResize.bind(this));
    
//     this.balls.forEach(ball => {
//       if (ball.geometry) ball.geometry.dispose();
//       if (ball.material) ball.material.dispose();
//     });
    
//     if (this.machine) {
//       this.machine.traverse(child => {
//         if (child.geometry) child.geometry.dispose();
//         if (child.material) child.material.dispose();
//       });
//     }
    
//     if (this.particles) {
//       this.particles.geometry.dispose();
//       this.particles.material.dispose();
//     }
    
//     this.glowRings.forEach(ring => {
//       ring.geometry.dispose();
//       ring.material.dispose();
//     });
    
//     if (this.renderer) {
//       this.renderer.dispose();
//       if (this.container && this.renderer.domElement) {
//         this.container.removeChild(this.renderer.domElement);
//       }
//     }
    
//     this.isInitialized = false;
//   }
// }
