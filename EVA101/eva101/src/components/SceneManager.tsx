import React, { useRef, useEffect, useState } from "react";
import { Planet } from "../classes/Planet";
import { StarEffect } from "../classes/StarEffect";
import { Inspector } from "@babylonjs/inspector";
import cannon from "cannon";
import { AdvancedDynamicTexture } from "@babylonjs/gui";
import { Button } from "@babylonjs/gui";
import UIOverlay from "./UIOverlay";
import { makeStyles } from "@fluentui/react-components";
import {
  Engine,
  Scene,
  FreeCamera,
  Vector3,
  HemisphericLight,
  GlowLayer,
  Color3,
  StandardMaterial,
  Texture,
  MeshBuilder,
  PhysicsImpostor,
  CubeTexture,
} from "@babylonjs/core";

const useStyles = makeStyles({
  sceneContainer: {
    position: "fixed",
    top: 0,
    left: 0,
    width: "100vw",
    height: "100vh",
  },
});

const SceneManager: React.FC = () => {
  const styles = useStyles();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const inspectorRef = useRef<boolean>(false);
  const moveUpRef = useRef<boolean>(false);
  const moveDownRef = useRef<boolean>(false);
  const [isUIVisible, setIsUIVisible] = useState<boolean>(true);

  const CAMERA_SPEED = 1.0;
  const CAMERA_VERTICAL_SPEED_FACTOR = 0.1;
  const CAMERA_ANGULAR_SENSITIVITY = 2750;
  const DEFAULT_LIGHT_INTENSITY = 0.333333;
  const MINIMAL_SCENE = true; // Set to true to have the clean planet scene, Set to false to have additional models and stuff in the scene

  useEffect(() => {
    if (!canvasRef.current) {
      console.error("Canvas reference is null");
      return;
    }
    console.log("Initializing SceneManager");

    const engine = new Engine(canvasRef.current, true);
    const scene = new Scene(engine);

    // Scene setup
    const audioContext = new (window.AudioContext || window.AudioContext)();
    const glowLayer = new GlowLayer("glow", scene);
    glowLayer.intensity = 0.5;

    // Camera with WASD controls, QE for up and down, and mouse look
    const camera = new FreeCamera("camera1", new Vector3(0, 5, -10), scene);
    camera.setTarget(Vector3.Zero());
    camera.attachControl(canvasRef.current, true);
    camera.keysUp.push(87); // W
    camera.keysDown.push(83); // S
    camera.keysLeft.push(65); // A
    camera.keysRight.push(68); // D
    camera.speed = CAMERA_SPEED;
    camera.angularSensibility = CAMERA_ANGULAR_SENSITIVITY;

    const light = new HemisphericLight("light1", new Vector3(0, 1, 0), scene);
    light.intensity = DEFAULT_LIGHT_INTENSITY;

    // Skybox
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

    // Create the planet and star effect and terrain (and other scene objects)
    const planet = new Planet(scene, glowLayer, skyboxMaterial);
    const starEffect = new StarEffect(scene, audioContext, glowLayer);
    starEffect.addShadowCaster(planet.mesh);

    //TODO: This should be own class eventually
    const createTerrain = () => {
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
      starEffect.addShadowCaster(terrain);

      if (!MINIMAL_SCENE) {
        // Add a groundplane below the sphere
        const ground = MeshBuilder.CreateGround(
          "ground1",
          { width: 6, height: 6 },
          scene
        );
        ground.position.set(0, 0, 0);
        ground.receiveShadows = true;
        ground.setEnabled(terrain == null); // Hide the ground plane, use terrain instead

        // Blue material
        const blueMaterial = new StandardMaterial("blueMaterial", scene);
        blueMaterial.diffuseColor = new Color3(0, 0, 1);
        blueMaterial.specularColor = new Color3(0.5, 0.5, 0.5);
        blueMaterial.emissiveColor = new Color3(0, 0, 0.5);
        blueMaterial.alpha = 1.0;

        const goldberg = MeshBuilder.CreateGoldberg(
          "goldberg",
          { size: 1 },
          scene
        );
        goldberg.position.set(0, 3, 0);
        goldberg.material = blueMaterial;

        const box = MeshBuilder.CreateBox("box", { size: 1 }, scene);
        box.position.set(3, 1, 0);
        box.material = blueMaterial;

        const cylinder = MeshBuilder.CreateCylinder(
          "cylinder",
          { diameter: 1, height: 2 },
          scene
        );
        cylinder.position.set(-3, 1, 0);
        cylinder.material = blueMaterial;
      }

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
    };

    createTerrain();

    const update = () => {
      if (moveUpRef.current) {
        camera.position.y += camera.speed * CAMERA_VERTICAL_SPEED_FACTOR;
        //console.log("moveUp: " + camera.position.y);
      }
      if (moveDownRef.current) {
        camera.position.y -= camera.speed * CAMERA_VERTICAL_SPEED_FACTOR;
        //console.log("moveDown: " + camera.position.y);
      }

      planet.update();
      starEffect.update();
    };

    // Set up the render loop update
    engine.runRenderLoop(() => {
      update();
      scene.render();
    });

    // Set up some simple UI
    //TODO: Refactor to React UI overlay components instead

    const toggleUIButton = Button.CreateSimpleButton(
      "toggleUIButton",
      "☠️ Dismiss the Scholarly Aide"
    );
    toggleUIButton.color = "white";
    toggleUIButton.background = "black";
    toggleUIButton.horizontalAlignment = Button.HORIZONTAL_ALIGNMENT_LEFT;
    toggleUIButton.verticalAlignment = Button.VERTICAL_ALIGNMENT_BOTTOM;
    toggleUIButton.width = "300px";
    toggleUIButton.height = "50px";
    toggleUIButton.top = -parseFloat(toggleUIButton.height) + 20 + "px";
    toggleUIButton.left = "10px";
    toggleUIButton.onPointerUpObservable.add(() => {
      setIsUIVisible((prevState) => {
        const visible = !prevState;

        if (toggleUIButton.textBlock) {
          toggleUIButton.textBlock.text = visible
            ? "☠️ Dismiss the Scholarly Aide"
            : "🧐 Summon the Scholarly Aide";
        }

        console.log("Toggled UI visibility: ", visible);
        return visible;
      });
    });

    const toggleAudioButton = Button.CreateSimpleButton(
      "toggleAudioButton",
      starEffect.isAudioPlaying() ? "🔊 Audio Enabled" : "🔇 Audio Muted"
    );
    toggleAudioButton.color = "white";
    toggleAudioButton.background = "black";
    toggleAudioButton.horizontalAlignment = Button.HORIZONTAL_ALIGNMENT_LEFT;
    toggleAudioButton.verticalAlignment = Button.VERTICAL_ALIGNMENT_BOTTOM;
    toggleAudioButton.width = "200px";
    toggleAudioButton.height = "50px";
    toggleAudioButton.top = -parseFloat(toggleAudioButton.height) + 20 + "px";
    toggleAudioButton.left = "350px";
    toggleAudioButton.onPointerUpObservable.add(() => {
      const playing = starEffect.toggleAudio();

      console.log("Toggling star audio player: ", playing);

      if (toggleAudioButton.textBlock) {
        toggleAudioButton.textBlock.text = playing
          ? "🔊 Audio Enabled"
          : "🔇 Audio Muted";
      }
    });

    const advancedTexture = AdvancedDynamicTexture.CreateFullscreenUI("UI");
    advancedTexture.addControl(toggleUIButton);
    advancedTexture.addControl(toggleAudioButton);

    // Bind event handlers
    const handleKeyDown = (event: KeyboardEvent) => {
      //console.log("KeyDown: " + event.key + " [Control: " + event.ctrlKey + "]");

      // Toggle inspector with Ctrl + I
      if (event.ctrlKey && event.key === "i") {
        event.preventDefault();
        toggleInspector();
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

    const toggleInspector = () => {
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

    // Add event listeners
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    window.addEventListener("resize", () => engine.resize());

    return () => {
      starEffect.dispose();
      engine.dispose();
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, []);

  return (
    <div className={styles.sceneContainer}>
      <canvas ref={canvasRef} style={{ width: "100%", height: "100%" }} />
      {isUIVisible && <UIOverlay />}
    </div>
  );
};

export default SceneManager;
