import React, { useEffect, useRef, useState, useMemo } from 'react';
import * as THREE from 'three';
// @ts-ignore
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { SoilStatus, STATUS_LIGHT_COLORS } from '../types';

interface SoilPulseRodProps {
  status: SoilStatus;
  isInserted: boolean;
}

// Helper to create fractal geometry data
const createFractalGeometry = (depth: number, startPoint: THREE.Vector3, direction: THREE.Vector3, length: number): THREE.Vector3[] => {
  if (depth === 0) return [];

  const endPoint = new THREE.Vector3().copy(startPoint).add(direction.clone().multiplyScalar(length));
  
  const points = [startPoint, endPoint];

  // Branch 1
  const branch1Dir = direction.clone().applyAxisAngle(new THREE.Vector3(0, 0, 1), 0.5).applyAxisAngle(new THREE.Vector3(0, 1, 0), Math.random() * 2);
  // Branch 2
  const branch2Dir = direction.clone().applyAxisAngle(new THREE.Vector3(0, 0, 1), -0.5).applyAxisAngle(new THREE.Vector3(0, 1, 0), Math.random() * -2);

  points.push(...createFractalGeometry(depth - 1, endPoint, branch1Dir, length * 0.7));
  points.push(...createFractalGeometry(depth - 1, endPoint, branch2Dir, length * 0.7));

  return points;
};

export const SoilPulseRod: React.FC<SoilPulseRodProps> = ({ status, isInserted }) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const rodGroupRef = useRef<THREE.Group | null>(null);
  const lightRef = useRef<THREE.PointLight | null>(null);
  const ringMaterialRef = useRef<THREE.MeshStandardMaterial | null>(null);
  const fractalMaterialRef = useRef<THREE.LineBasicMaterial | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);

  // Constants
  const ROD_Y_INSERTED = -1.5;
  const ROD_Y_RETRACTED = 2;

  useEffect(() => {
    if (!mountRef.current) return;

    // --- Scene Setup ---
    const scene = new THREE.Scene();
    // Use clear background to show the CSS soil image behind
    scene.background = null; 

    // Camera
    const camera = new THREE.PerspectiveCamera(45, mountRef.current.clientWidth / mountRef.current.clientHeight, 0.1, 100);
    camera.position.set(0, 2, 14); // Slightly further back for context
    camera.lookAt(0, 0, 0);

    // Renderer
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    mountRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // --- Controls ---
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.minDistance = 8;
    controls.maxDistance = 25;
    controls.enablePan = false;
    // Limit vertical angle to prevent looking from "underground" too much, 
    // keeping the illusion of the background image somewhat intact
    controls.maxPolarAngle = Math.PI / 2 + 0.2; 

    // --- Lighting ---
    const ambientLight = new THREE.AmbientLight(0x404040, 3); // Soft white light
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, 2);
    dirLight.position.set(5, 10, 7);
    scene.add(dirLight);

    const backLight = new THREE.DirectionalLight(0x606080, 2); // Cool rim light
    backLight.position.set(-5, 2, -5);
    scene.add(backLight);

    // Dynamic Light (The "Breathing" light)
    const pointLight = new THREE.PointLight(0xffffff, 0, 10);
    pointLight.position.set(0, 3, 0);
    scene.add(pointLight);
    lightRef.current = pointLight;

    // --- 3D Objects ---
    const rodGroup = new THREE.Group();
    scene.add(rodGroup);
    rodGroupRef.current = rodGroup;

    // Materials
    const handleMat = new THREE.MeshStandardMaterial({ 
      color: 0x27272a, // Zinc-800
      roughness: 0.3,
      metalness: 0.8 
    });
    
    const ringMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      emissive: 0x000000,
      emissiveIntensity: 1,
      roughness: 0.1,
      metalness: 0.1
    });
    ringMaterialRef.current = ringMat;

    const probeMat = new THREE.MeshPhysicalMaterial({ 
      color: 0xd4d4d8, // Zinc-300
      metalness: 0.6,
      roughness: 0.2,
      transmission: 0.1, // Slight glass effect
      transparent: true,
      opacity: 0.95,
      clearcoat: 1.0,
      clearcoatRoughness: 0.1
    });

    // 1. Handle (Top Grip)
    const handleGeo = new THREE.CylinderGeometry(0.8, 0.7, 3, 32);
    const handleMesh = new THREE.Mesh(handleGeo, handleMat);
    handleMesh.position.y = 3.5;
    rodGroup.add(handleMesh);

    // Cap for handle
    const handleCapGeo = new THREE.CylinderGeometry(0.8, 0.8, 0.2, 32);
    const handleCapMesh = new THREE.Mesh(handleCapGeo, new THREE.MeshStandardMaterial({ color: 0x18181b, metalness: 0.9, roughness: 0.5 }));
    handleCapMesh.position.y = 5.1;
    rodGroup.add(handleCapMesh);

    // 2. Light Ring (The Indicator)
    const ringGeo = new THREE.CylinderGeometry(0.85, 0.85, 0.4, 32);
    const ringMesh = new THREE.Mesh(ringGeo, ringMat);
    ringMesh.position.y = 2.0; // Just below handle
    rodGroup.add(ringMesh);

    // 3. Probe Shaft (Main Body)
    const shaftGeo = new THREE.CylinderGeometry(0.4, 0.2, 8, 24);
    const shaftMesh = new THREE.Mesh(shaftGeo, probeMat);
    shaftMesh.position.y = -2.2;
    rodGroup.add(shaftMesh);

    // 4. Tip
    const tipGeo = new THREE.ConeGeometry(0.2, 0.8, 24);
    const tipMesh = new THREE.Mesh(tipGeo, new THREE.MeshStandardMaterial({ color: 0x52525b, metalness: 0.9, roughness: 0.4 }));
    tipMesh.position.y = -6.6;
    rodGroup.add(tipMesh);

    // 5. Mycelium Network (Hidden by default)
    const fractalMat = new THREE.LineBasicMaterial({ 
        color: 0xffffff, 
        transparent: true, 
        opacity: 0,
        linewidth: 2 
    });
    fractalMaterialRef.current = fractalMat;

    // Generate static geometry for fractals
    const fractalsGroup = new THREE.Group();
    rodGroup.add(fractalsGroup);
    
    // Create 4 main roots
    for (let i = 0; i < 4; i++) {
        const angle = (Math.PI / 2) * i;
        const start = new THREE.Vector3(0, -3, 0); // Start from middle of probe
        const dir = new THREE.Vector3(Math.cos(angle), -0.5, Math.sin(angle)).normalize();
        
        const points = createFractalGeometry(4, start, dir, 1.2);
        const geometry = new THREE.BufferGeometry().setFromPoints(points);
        const line = new THREE.LineSegments(geometry, fractalMat);
        fractalsGroup.add(line);
    }


    // --- Animation Loop ---
    let time = 0;
    const animate = () => {
      requestAnimationFrame(animate);
      time += 0.02;
      
      controls.update();

      // Breathing Light Effect (if active)
      if (lightRef.current && ringMaterialRef.current) {
         const breath = (Math.sin(time * 2) + 1) * 0.5 + 0.5; // 0.5 to 1.5
         lightRef.current.intensity = 2 * breath;
         ringMaterialRef.current.emissiveIntensity = 1.5 * breath;
      }

      renderer.render(scene, camera);
    };
    animate();

    // Resize Handler
    const handleResize = () => {
        if (!mountRef.current) return;
        camera.aspect = mountRef.current.clientWidth / mountRef.current.clientHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      mountRef.current?.removeChild(renderer.domElement);
      renderer.dispose();
      handleGeo.dispose();
      handleMat.dispose();
    };
  }, []); // Run once on mount

  // --- Prop Updates Handler ---
  useEffect(() => {
    if (!rodGroupRef.current || !ringMaterialRef.current || !lightRef.current || !fractalMaterialRef.current) return;

    // 1. Color Updates
    const colorHex = STATUS_LIGHT_COLORS[status];
    const color = new THREE.Color(colorHex);

    ringMaterialRef.current.emissive.set(color);
    lightRef.current.color.set(color);
    fractalMaterialRef.current.color.set(color);

    // 2. Mycelium Visibility
    if (status !== SoilStatus.IDLE && isInserted) {
        fractalMaterialRef.current.opacity = 0.8;
    } else {
        fractalMaterialRef.current.opacity = 0;
    }

    // 3. Position Transition
    let animationFrameId: number;
    const targetY = isInserted ? ROD_Y_INSERTED : ROD_Y_RETRACTED;
    
    const updatePosition = () => {
        if (!rodGroupRef.current) return;
        
        // Lerp position
        rodGroupRef.current.position.y += (targetY - rodGroupRef.current.position.y) * 0.05;
        
        // Stop if close enough
        if (Math.abs(rodGroupRef.current.position.y - targetY) > 0.001) {
            animationFrameId = requestAnimationFrame(updatePosition);
        } else {
            rodGroupRef.current.position.y = targetY;
        }
    };
    updatePosition();

    return () => cancelAnimationFrame(animationFrameId);

  }, [status, isInserted]);

  return (
    <div className="relative w-full h-full bg-zinc-900 overflow-hidden cursor-move">
        {/* Soil Background Image */}
        <div 
            className="absolute inset-0 z-0 bg-cover bg-center transition-all duration-1000"
            style={{ 
                backgroundImage: `url('https://images.unsplash.com/photo-1605806616949-1e87b487bc2a?q=80&w=1200&auto=format&fit=crop')`,
                filter: 'brightness(0.65) contrast(1.1) sepia(0.1)'
            }}
        />
        
        {/* 3D Canvas Container */}
        <div ref={mountRef} className="absolute inset-0 z-10" />

        {/* UI Overlay for "Ground Level" */}
        <div 
            className={`absolute w-full h-[1px] bg-gradient-to-r from-transparent via-zinc-400 to-transparent top-[60%] z-20 transition-opacity duration-1000 pointer-events-none ${isInserted ? 'opacity-40' : 'opacity-0'}`}
        >
            <div className="absolute -top-6 right-8 text-[10px] font-mono text-zinc-300 tracking-widest uppercase flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-zinc-400 animate-pulse" />
                Ground Level
            </div>
        </div>
        
        {/* Status Overlay */}
        <div className="absolute bottom-8 left-8 z-20 pointer-events-none select-none">
            <div className="text-[10px] text-zinc-400 font-mono mb-1">OPTICAL_SENSOR_ARRAY</div>
            <div className="text-xs font-bold text-zinc-200 tracking-widest uppercase">
                {isInserted ? 'ACTIVE' : 'STANDBY'}
            </div>
        </div>
        
        {/* Interaction Hint */}
        <div className="absolute top-4 right-4 z-20 text-[10px] text-zinc-300 font-mono border border-zinc-600 bg-black/40 px-2 py-1 rounded backdrop-blur-sm pointer-events-none">
            DRAG TO ROTATE // SCROLL TO ZOOM
        </div>
    </div>
  );
};