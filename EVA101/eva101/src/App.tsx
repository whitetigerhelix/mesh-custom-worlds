import React, { useRef, useEffect } from "react";
import {
  Color3,
  Engine,
  Scene,
  StandardMaterial,
  Texture,
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
const LIGHT_INTENSITY = 0.7;

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

    // Create a basic light
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

    // Animations/movement/etc
    scene.onBeforeRenderObservable.add(() => {
      sphere.rotation.y += 0.01;
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
