import React, { useRef, useEffect } from "react";
import {
  Color3,
  Engine,
  PointLight,
  Scene,
  StandardMaterial,
  Texture,
  GlowLayer,
  ParticleSystem,
  Color4,
  ShadowGenerator,
  CubeTexture,
  PhysicsImpostor,
  Sound,
} from "@babylonjs/core";
import {
  FreeCamera,
  Vector3,
  HemisphericLight,
  MeshBuilder,
} from "@babylonjs/core";
import { Inspector } from "@babylonjs/inspector";
import cannon from "cannon";

// Constants
const CAMERA_SPEED = 1.0;
const CAMERA_VERTICAL_SPEED_FACTOR = 0.1;
const CAMERA_ANGULAR_SENSITIVITY = 2750;
const LIGHT_INTENSITY = 1.0;
const ORBIT_DISTANCE = 3;
const ORBIT_SPEED = 0.001;
const COLOR_TIME = 0.0025;
const ROTATION_SPEED = 0.01;
const BASE_TONE_FREQUENCY = 110; //440;

const useExtraObjects = false; // Set to true to use extra objects, set to false to have the clean planet scene

const App: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const inspectorRef = useRef<boolean>(false);
  const moveUpRef = useRef<boolean>(false);
  const moveDownRef = useRef<boolean>(false);

  const setupScene = (canvas: HTMLCanvasElement) => {
    const engine = new Engine(canvas, true);
    const scene = new Scene(engine);

    // Create a basic camera
    const camera = new FreeCamera("camera1", new Vector3(0, 5, -10), scene);
    camera.setTarget(Vector3.Zero());
    camera.attachControl(canvas, true);

    // Enable WASD movement
    camera.keysUp.push(87); // W
    camera.keysDown.push(83); // S
    camera.keysLeft.push(65); // A
    camera.keysRight.push(68); // D
    camera.speed = CAMERA_SPEED;

    // Improve mouse look responsiveness
    camera.angularSensibility = CAMERA_ANGULAR_SENSITIVITY;

    // Create a basic light and shadow generator
    const light = new HemisphericLight("light1", new Vector3(0, 1, 0), scene);
    light.intensity = LIGHT_INTENSITY;

    //
    // Create materials

    const skybox = MeshBuilder.CreateBox("skyBox", { size: 1000 }, scene);
    const skyboxMaterial = new StandardMaterial("skyBoxMaterial", scene);
    skyboxMaterial.backFaceCulling = false;
    skyboxMaterial.disableLighting = true;
    skyboxMaterial.reflectionTexture = new CubeTexture(
      "/textures/space_sky",
      scene
    );
    skyboxMaterial.reflectionTexture.coordinatesMode = Texture.SKYBOX_MODE;
    skybox.infiniteDistance = true;
    skybox.renderingGroupId = 0;
    skybox.material = skyboxMaterial;

    // Basic red material
    const redMaterial = new StandardMaterial("redMaterial", scene);
    redMaterial.diffuseColor = new Color3(1, 0, 0); // Red
    redMaterial.specularColor = new Color3(0.5, 0.5, 0.5);
    redMaterial.emissiveColor = new Color3(0.5, 0, 0);
    redMaterial.alpha = 0.1;

    // "Planet" material
    const sphereMaterial = new StandardMaterial("sphereMaterial", scene);
    sphereMaterial.specularColor = new Color3(0.5, 0.5, 0.5);
    sphereMaterial.diffuseTexture = new Texture(
      "/textures/fractalplanet.jpg",
      scene
    );
    sphereMaterial.bumpTexture = new Texture(
      "/textures/fractalplanet_bump.jpg",
      scene
    );
    sphereMaterial.emissiveColor = new Color3(0.1, 0.1, 0.3);
    sphereMaterial.reflectionTexture = skyboxMaterial.reflectionTexture;

    // Terrain material
    const terrainMaterial = new StandardMaterial("terrainMaterial", scene);
    terrainMaterial.specularColor = new Color3(0.5, 0.5, 0.5);
    terrainMaterial.diffuseColor = new Color3(0.0, 1.0, 0.0);
    terrainMaterial.diffuseTexture = new Texture(
      "/textures/terrain_heightmap.jpg",
      scene
    );
    terrainMaterial.bumpTexture = new Texture(
      "/textures/terrain_heightmap.jpg",
      scene
    );
    terrainMaterial.emissiveColor = new Color3(0.0, 0.5, 0.0);

    //
    // Create meshes

    // Create a basic sphere
    const sphere = MeshBuilder.CreateSphere("sphere", { diameter: 2 }, scene);
    sphere.position.y = 1;
    sphere.material = sphereMaterial;

    const terrain = MeshBuilder.CreateGround(
      "terrain",
      {
        width: 25,
        height: 25,
      },
      scene
    );
    terrain.position.set(0, -1, 0);
    terrain.material = terrainMaterial;
    terrain.receiveShadows = true;

    if (useExtraObjects) {
      // Add a groundplane below the sphere
      const ground = MeshBuilder.CreateGround(
        "ground1",
        { width: 6, height: 6 },
        scene
      );
      ground.position.set(0, 0, 0);
      ground.receiveShadows = true;
      ground.setEnabled(terrain == null); // Hide the ground plane, use terrain instead

      const goldberg = MeshBuilder.CreateGoldberg(
        "goldberg",
        { size: 1 },
        scene
      );
      goldberg.position.set(0, 3, 0);
      goldberg.material = redMaterial;

      const box = MeshBuilder.CreateBox("box", { size: 1 }, scene);
      box.position.set(3, 1, 0);
      box.material = redMaterial;

      const cylinder = MeshBuilder.CreateCylinder(
        "cylinder",
        { diameter: 1, height: 2 },
        scene
      );
      cylinder.position.set(-3, 1, 0);
      cylinder.material = redMaterial;
    }

    //
    // Orbiting star effect

    // Dynamic lights for the star effect
    const pointLight = new PointLight(
      "pointLight",
      new Vector3(0, 1, 0),
      scene
    );

    // Orbiting sphere to go with the star effect
    const starSphere = MeshBuilder.CreateSphere(
      "starSphere",
      { diameter: 0.2 },
      scene
    );
    starSphere.position.set(
      pointLight.position.x,
      pointLight.position.y,
      pointLight.position.z
    );
    starSphere.material = redMaterial;

    // Shadow from the star effect's light
    const shadowGenerator = new ShadowGenerator(1024, pointLight);
    shadowGenerator.usePoissonSampling = true;
    shadowGenerator.darkness = 0.05;
    shadowGenerator.addShadowCaster(sphere);
    shadowGenerator.addShadowCaster(terrain);
    shadowGenerator.addShadowCaster(starSphere);

    // Add glow layer for star effect
    const glowLayer = new GlowLayer("glow", scene);
    glowLayer.intensity = 0.5;
    glowLayer.addIncludedOnlyMesh(starSphere);

    // Add particle system for star effect
    const particleSystem = new ParticleSystem("particles", 1000, scene);
    particleSystem.particleTexture = new Texture("/textures/flare2.png", scene);
    particleSystem.emitter = pointLight.position; // Attach the particle system to the light
    particleSystem.minEmitBox = new Vector3(0, 0, 0); // Starting point
    particleSystem.maxEmitBox = new Vector3(0, 0, 0); // Ending point
    particleSystem.color1 = new Color4(1, 1, 0, 0.5); // Yellow
    particleSystem.color2 = new Color4(1, 0.5, 0, 0.5); // Orange
    particleSystem.colorDead = new Color4(0, 0, 0, 0); // Fade out
    particleSystem.minSize = 0.1;
    particleSystem.maxSize = 0.5;
    particleSystem.minLifeTime = 0.02;
    particleSystem.maxLifeTime = 0.075;
    particleSystem.emitRate = 150;
    particleSystem.blendMode = ParticleSystem.BLENDMODE_ONEONE;
    particleSystem.gravity = new Vector3(0, 0, 0);
    particleSystem.direction1 = new Vector3(-1, -1, -1);
    particleSystem.direction2 = new Vector3(1, 1, 1);
    particleSystem.minAngularSpeed = 0;
    particleSystem.maxAngularSpeed = Math.PI;
    particleSystem.minEmitPower = 1;
    particleSystem.maxEmitPower = 3;
    particleSystem.updateSpeed = 0.005;
    particleSystem.start();

    // Add sound
    const audioContext = new (window.AudioContext || window.AudioContext)();
    const oscillator = audioContext.createOscillator();
    oscillator.type = "triangle"; // You can change this to 'square', 'sawtooth', 'triangle', 'sine'
    oscillator.frequency.setValueAtTime(
      BASE_TONE_FREQUENCY,
      audioContext.currentTime
    ); // Set initial frequency in Hz

    // Create a GainNode for volume control
    const gainNode = audioContext.createGain();
    gainNode.gain.setValueAtTime(1, audioContext.currentTime); // Set initial volume

    // Create a MediaStreamAudioDestinationNode
    const mediaStreamDestination = audioContext.createMediaStreamDestination();

    // Connect the oscillator to the GainNode, then to the MediaStreamAudioDestinationNode
    oscillator.connect(gainNode);
    gainNode.connect(mediaStreamDestination);

    // Create the Sound instance using the media stream
    const sound = new Sound(
      "tone",
      mediaStreamDestination.stream,
      scene,
      null,
      {
        autoplay: false,
        loop: true,
        spatialSound: true,
        volume: 0.5, // Set lower volume for a more subtle effect
        distanceModel: "exponential",
        rolloffFactor: 1.5,
      }
    );

    // Attach the sound to the starSphere for spatial sound
    sound.attachToMesh(starSphere);

    // Handle oscillator start/stop based on sound state
    sound.play();
    oscillator.start();
    sound.onended = () => {
      oscillator.stop();
    };

    //
    // Physics
    window.CANNON = cannon;

    scene.enablePhysics();

    //TODO: add a new sphere for this instead, and make it a physics object and when you press a button (maybe f) it will launch the sphere into the air (with a simple particle effect and sound)
    /*sphere.physicsImpostor = new PhysicsImpostor(
      sphere,
      PhysicsImpostor.SphereImpostor,
      { mass: 1 },
      scene
    );*/
    terrain.physicsImpostor = new PhysicsImpostor(
      terrain,
      PhysicsImpostor.PlaneImpostor,
      { mass: 0 },
      scene
    );

    //
    // Animations/movement/etc

    scene.onBeforeRenderObservable.add(() => {
      // Rotate planet
      sphere.rotation.y += ROTATION_SPEED;

      // Orbit the light around the planet
      const time = Date.now() * ORBIT_SPEED;
      pointLight.position.x = Math.sin(time) * ORBIT_DISTANCE;
      pointLight.position.y = sphere.position.y;
      pointLight.position.z = Math.cos(time) * ORBIT_DISTANCE;

      // Animate the color
      const colorTimeR = (Math.sin(Date.now() * COLOR_TIME) + 1) / 2;
      const colorTimeG = (Math.cos(Date.now() * COLOR_TIME) + 1) / 2;
      const colorTimeB = (Math.sin(Date.now() * COLOR_TIME * 0.5) + 1) / 2;
      const alpha = (Math.cos(Date.now() * COLOR_TIME * 0.25) + 1) / 2;
      const newColor = new Color4(colorTimeR, colorTimeG, colorTimeB, alpha);
      const newColor2 = new Color4(
        1.0 - newColor.r,
        1.0 - newColor.g,
        1.0 - newColor.b,
        alpha
      );
      pointLight.diffuse = new Color3(newColor.r, newColor.g, newColor.b);
      particleSystem.color1 = newColor;
      particleSystem.color2 = newColor2;
      particleSystem.emitter = pointLight.position; // Update emitter position
      starSphere.position.set(
        pointLight.position.x,
        pointLight.position.y,
        pointLight.position.z
      );

      // Modulate the tone frequency based on the color
      const baseFrequency = BASE_TONE_FREQUENCY / 2;
      const frequency = baseFrequency + baseFrequency * newColor.r; // Example: base frequency 220Hz, modulated by red component
      oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime);
    });

    return { engine, scene, camera, sound };
  };

  const renderScene = (scene: Scene, camera: FreeCamera) => {
    //console.log("renderScene - [moveUp: " + moveUpRef.current + ", moveDown: " + moveDownRef.current + "]");

    if (moveUpRef.current) {
      camera.position.y += camera.speed * CAMERA_VERTICAL_SPEED_FACTOR;
      //console.log("moveUp: " + camera.position.y);
    }
    if (moveDownRef.current) {
      camera.position.y -= camera.speed * CAMERA_VERTICAL_SPEED_FACTOR;
      //console.log("moveDown: " + camera.position.y);
    }

    //TODO: Add custom rendering code here

    scene.render();
  };

  const toggleInspector = (scene: Scene) => {
    if (inspectorRef.current) {
      Inspector.Hide();
    } else {
      Inspector.Show(scene, {
        embedMode: true,
        overlay: true,
      });
    }
    inspectorRef.current = !inspectorRef.current;
  };

  const handleKeyDown = (event: KeyboardEvent, scene: Scene) => {
    //console.log("KeyDown: " + event.key + " [Control: " + event.ctrlKey + "]");

    // Toggle inspector with Ctrl + I
    if (event.ctrlKey && event.key === "i") {
      event.preventDefault();
      toggleInspector(scene);
    }

    // Move camera up and down with Q and E
    if (event.key === "q") {
      moveDownRef.current = true;
    } else if (event.key === "e") {
      moveUpRef.current = true;
    }
  };

  const handleKeyUp = (event: KeyboardEvent) => {
    //console.log("KeyUp: " + event.key + " [Control: " + event.ctrlKey + "]");

    // Stop moving camera up and down with Q and E
    if (event.key === "q") {
      moveDownRef.current = false;
    } else if (event.key === "e") {
      moveUpRef.current = false;
    }
  };

  // useEffect hook to set up the scene and handle lifecycle events
  useEffect(() => {
    if (!canvasRef.current) return;

    const { engine, scene, camera, sound } = setupScene(canvasRef.current);

    const onKeyDown = (event: KeyboardEvent) => handleKeyDown(event, scene);
    const onKeyUp = (event: KeyboardEvent) => handleKeyUp(event);
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);

    window.addEventListener("resize", () => engine.resize());

    engine.runRenderLoop(() => {
      renderScene(scene, camera);
    });

    return () => {
      sound.stop();
      engine.dispose();
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
    };
  }, []);

  return <canvas ref={canvasRef} style={{ width: "100vw", height: "100vh" }} />;
};

export default App;
