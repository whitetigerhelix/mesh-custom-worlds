import React, { useRef, useEffect } from "react";
import * as THREE from "three";

interface VoiceReactiveMeshProps {
  isSpeaking: boolean;
  speakText: (
    text: string,
    voiceName: string,
    pitch?: number,
    rate?: number
  ) => Promise<void>;
  stopTalking: () => void;
}

const VoiceReactiveMesh: React.FC<VoiceReactiveMeshProps> = ({
  isSpeaking,
  speakText,
  stopTalking,
}) => {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    const renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    if (mountRef.current) {
      mountRef.current.appendChild(renderer.domElement);
    }

    const geometry = new THREE.BoxGeometry();
    const material = new THREE.ShaderMaterial({
      uniforms: {
        time: { value: 1.0 },
        isSpeaking: { value: isSpeaking },
      },
      vertexShader: `...`, // Add your vertex shader code here
      fragmentShader: `...`, // Add your fragment shader code here
    });

    const cube = new THREE.Mesh(geometry, material);
    scene.add(cube);

    camera.position.z = 5;

    const animate = () => {
      requestAnimationFrame(animate);
      cube.rotation.x += 0.01;
      cube.rotation.y += 0.01;
      material.uniforms.time.value += 0.05;
      material.uniforms.isSpeaking.value = isSpeaking ? 1.0 : 0.0;
      renderer.render(scene, camera);
    };

    animate();

    return () => {
      if (mountRef.current) {
        mountRef.current.removeChild(renderer.domElement);
      }
    };
  }, [isSpeaking]);

  return <div ref={mountRef} />;
};

export default VoiceReactiveMesh;
