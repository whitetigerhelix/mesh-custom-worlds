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
} from "@babylonjs/core";
import {
  FreeCamera,
  Vector3,
  HemisphericLight,
  MeshBuilder,
} from "@babylonjs/core";
import { Inspector } from "@babylonjs/inspector";

// Constants
const CAMERA_SPEED = 1.0;
const CAMERA_VERTICAL_SPEED_FACTOR = 0.1;
const CAMERA_ANGULAR_SENSITIVITY = 2750;
const LIGHT_INTENSITY = 1.0;
const ORBIT_DISTANCE = 3;
const ORBIT_SPEED = 0.001;
const COLOR_TIME = 0.0025;

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

    // Basic red material
    const redMaterial = new StandardMaterial("redMaterial", scene);
    redMaterial.diffuseColor = new Color3(1, 0, 0); // Red
    redMaterial.specularColor = new Color3(0.5, 0.5, 0.5);

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
    /*sphereMaterial.reflectionTexture = new CubeTexture(
      "/textures/DefaultSkyCubeMap",
      scene
    );
    sphereMaterial.reflectionTexture.coordinatesMode = Texture.SKYBOX_MODE;*/

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

    // Create a basic sphere
    const sphere = MeshBuilder.CreateSphere("sphere", { diameter: 2 }, scene);
    sphere.position.y = 1;
    sphere.material = sphereMaterial;

    // Add a plane below the sphere
    /*    const ground = MeshBuilder.CreateGround(
      "ground1",
      { width: 6, height: 6 },
      scene
    );
    ground.position.set(0, 0, 0);
    ground.receiveShadows = true;
*/
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

    /*
    const goldberg = MeshBuilder.CreateGoldberg("goldberg", { size: 1 }, scene);
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
*/

    // Dynamic lights and shadow
    const pointLight = new PointLight(
      "pointLight",
      new Vector3(0, 1, 0),
      scene
    );

    const shadowGenerator = new ShadowGenerator(1024, pointLight);
    shadowGenerator.usePoissonSampling = true;
    shadowGenerator.darkness = 0.05;
    shadowGenerator.addShadowCaster(sphere);

    // Add glow layer for star effect
    const glowLayer = new GlowLayer("glow", scene);
    glowLayer.intensity = 0.5;
    glowLayer.addIncludedOnlyMesh(sphere);

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

    // Animations/movement/etc
    scene.onBeforeRenderObservable.add(() => {
      // Rotate planet
      sphere.rotation.y += 0.01;

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
    });

    return { engine, scene, camera };
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
      moveUpRef.current = true;
    } else if (event.key === "e") {
      moveDownRef.current = true;
    }
  };

  const handleKeyUp = (event: KeyboardEvent) => {
    //console.log("KeyUp: " + event.key + " [Control: " + event.ctrlKey + "]");

    // Stop moving camera up and down with Q and E
    if (event.key === "q") {
      moveUpRef.current = false;
    } else if (event.key === "e") {
      moveDownRef.current = false;
    }
  };

  useEffect(() => {
    if (!canvasRef.current) return;

    const { engine, scene, camera } = setupScene(canvasRef.current);

    const onKeyDown = (event: KeyboardEvent) => handleKeyDown(event, scene);
    const onKeyUp = (event: KeyboardEvent) => handleKeyUp(event);
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);

    window.addEventListener("resize", () => engine.resize());

    engine.runRenderLoop(() => {
      renderScene(scene, camera);
    });

    return () => {
      engine.dispose();
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
    };
  }, []);

  return <canvas ref={canvasRef} style={{ width: "100vw", height: "100vh" }} />;
};

export default App;
