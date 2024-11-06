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
import { Planet } from "./Planet";
import { StarEffect } from "./StarEffect";
import { Inspector } from "@babylonjs/inspector";
import cannon from "cannon";

export class SceneManager {
  private engine: Engine;
  private scene: Scene;
  private camera: FreeCamera;
  private planet: Planet;
  private starEffect: StarEffect;
  private audioContext: AudioContext;
  private glowLayer: GlowLayer;

  private inspectorRef: React.MutableRefObject<boolean>;
  private moveUpRef: React.MutableRefObject<boolean>;
  private moveDownRef: React.MutableRefObject<boolean>;

  CAMERA_SPEED = 1.0;
  CAMERA_VERTICAL_SPEED_FACTOR = 0.1;
  CAMERA_ANGULAR_SENSITIVITY = 2750;
  DEFAULT_LIGHT_INTENSITY = 0.333333;

  MINIMAL_SCENE = true; // Set to true to have the clean planet scene, Set to false to have additional models and stuff in the scene

  constructor(canvas: HTMLCanvasElement) {
    this.engine = new Engine(canvas, true);
    this.scene = new Scene(this.engine);

    this.inspectorRef = { current: false };
    this.moveUpRef = { current: false };
    this.moveDownRef = { current: false };

    // Bind event handlers
    this.handleKeyDown = this.handleKeyDown.bind(this);
    this.handleKeyUp = this.handleKeyUp.bind(this);

    // Add event listeners
    window.addEventListener("keydown", this.handleKeyDown);
    window.addEventListener("keyup", this.handleKeyUp);

    window.addEventListener("resize", () => this.engine.resize());

    // Scene setup
    this.audioContext = new (window.AudioContext || window.AudioContext)();

    this.glowLayer = new GlowLayer("glow", this.scene);
    this.glowLayer.intensity = 0.5;

    // Camera with WASD controls, QE for up and down, and mouse look
    this.camera = new FreeCamera("camera1", new Vector3(0, 5, -10), this.scene);
    this.camera.setTarget(Vector3.Zero());
    this.camera.attachControl(canvas, true);
    this.camera.keysUp.push(87); // W
    this.camera.keysDown.push(83); // S
    this.camera.keysLeft.push(65); // A
    this.camera.keysRight.push(68); // D
    this.camera.speed = this.CAMERA_SPEED;
    this.camera.angularSensibility = this.CAMERA_ANGULAR_SENSITIVITY; // Improve mouse look responsiveness

    // Basic light
    const light = new HemisphericLight(
      "light1",
      new Vector3(0, 1, 0),
      this.scene
    );
    light.intensity = this.DEFAULT_LIGHT_INTENSITY;

    // Skybox
    const skybox = MeshBuilder.CreateBox("skyBox", { size: 1000 }, this.scene);
    const skyboxMaterial = new StandardMaterial("skyBoxMaterial", this.scene);
    skyboxMaterial.backFaceCulling = false;
    skyboxMaterial.disableLighting = true;
    skyboxMaterial.reflectionTexture = new CubeTexture(
      "/textures/space_sky",
      this.scene
    );
    skyboxMaterial.reflectionTexture.coordinatesMode = Texture.SKYBOX_MODE;
    skybox.infiniteDistance = true;
    skybox.renderingGroupId = 0;
    skybox.material = skyboxMaterial;

    // Create the planet and star effect and terrain (and other scene objects)
    this.planet = new Planet(this.scene, this.glowLayer, skyboxMaterial);
    this.starEffect = new StarEffect(
      this.scene,
      this.audioContext,
      this.glowLayer
    );
    this.starEffect.addShadowCaster(this.planet.mesh);
    this.createTerrain();

    // Set up the render loop update
    this.engine.runRenderLoop(() => {
      this.update();
      this.scene.render();
    });
  }

  public update() {
    if (this.moveUpRef.current) {
      this.camera.position.y +=
        this.camera.speed * this.CAMERA_VERTICAL_SPEED_FACTOR;
      //console.log("moveUp: " + this.camera.position.y);
    }
    if (this.moveDownRef.current) {
      this.camera.position.y -=
        this.camera.speed * this.CAMERA_VERTICAL_SPEED_FACTOR;
      //console.log("moveDown: " + this.camera.position.y);
    }

    this.planet.update();
    this.starEffect.update();
  }

  public dispose() {
    this.starEffect.dispose();
    this.engine.dispose();
  }

  private toggleInspector() {
    if (this.inspectorRef.current) {
      Inspector.Hide();
    } else {
      Inspector.Show(this.scene, {
        embedMode: true,
        overlay: true,
      });
    }
    this.inspectorRef.current = !this.inspectorRef.current;
  }

  private handleKeyDown(event: KeyboardEvent) {
    //console.log("KeyDown: " + event.key + " [Control: " + event.ctrlKey + "]");

    // Toggle inspector with Ctrl + I
    if (event.ctrlKey && event.key === "i") {
      event.preventDefault();
      this.toggleInspector();
    }

    // Move camera up and down with Q and E
    if (event.key === "q") {
      this.moveDownRef.current = true;
    } else if (event.key === "e") {
      this.moveUpRef.current = true;
    }
  }

  private handleKeyUp(event: KeyboardEvent) {
    //console.log("KeyUp: " + event.key + " [Control: " + event.ctrlKey + "]");

    // Stop moving camera up and down with Q and E
    if (event.key === "q") {
      this.moveDownRef.current = false;
    } else if (event.key === "e") {
      this.moveUpRef.current = false;
    }
  }

  //TODO: This should be own class eventually
  private createTerrain() {
    // Terrain material
    const terrainMaterial = new StandardMaterial("terrainMaterial", this.scene);
    terrainMaterial.specularColor = new Color3(0.5, 0.5, 0.5);
    terrainMaterial.diffuseColor = new Color3(0.0, 1.0, 0.0);
    terrainMaterial.diffuseTexture = new Texture(
      "/textures/terrain_heightmap.jpg",
      this.scene
    );
    terrainMaterial.bumpTexture = new Texture(
      "/textures/terrain_heightmap.jpg",
      this.scene
    );
    terrainMaterial.emissiveColor = new Color3(0.0, 0.5, 0.0);

    const terrain = MeshBuilder.CreateGround(
      "terrain",
      {
        width: 25,
        height: 25,
      },
      this.scene
    );
    terrain.position.set(0, -1, 0);
    terrain.material = terrainMaterial;
    terrain.receiveShadows = true;
    this.starEffect.addShadowCaster(terrain);

    if (!this.MINIMAL_SCENE) {
      // Add a groundplane below the sphere
      const ground = MeshBuilder.CreateGround(
        "ground1",
        { width: 6, height: 6 },
        this.scene
      );
      ground.position.set(0, 0, 0);
      ground.receiveShadows = true;
      ground.setEnabled(terrain == null); // Hide the ground plane, use terrain instead

      // Blue material
      const blueMaterial = new StandardMaterial("blueMaterial", this.scene);
      blueMaterial.diffuseColor = new Color3(0, 0, 1); // Blue
      blueMaterial.specularColor = new Color3(0.5, 0.5, 0.5);
      blueMaterial.emissiveColor = new Color3(0, 0, 0.5);
      blueMaterial.alpha = 1.0;

      const goldberg = MeshBuilder.CreateGoldberg(
        "goldberg",
        { size: 1 },
        this.scene
      );
      goldberg.position.set(0, 3, 0);
      goldberg.material = blueMaterial;

      const box = MeshBuilder.CreateBox("box", { size: 1 }, this.scene);
      box.position.set(3, 1, 0);
      box.material = blueMaterial;

      const cylinder = MeshBuilder.CreateCylinder(
        "cylinder",
        { diameter: 1, height: 2 },
        this.scene
      );
      cylinder.position.set(-3, 1, 0);
      cylinder.material = blueMaterial;
    }

    // Physics
    window.CANNON = cannon;

    this.scene.enablePhysics();

    //TODO: add a new sphere for this instead, and make it a physics object and when you press a button (maybe f) it will launch the sphere into the air (with a simple particle effect and sound)
    /*this.sphere.physicsImpostor = new PhysicsImpostor(
      this.sphere,
      PhysicsImpostor.SphereImpostor,
      { mass: 1 },
      this.scene
    );*/
    terrain.physicsImpostor = new PhysicsImpostor(
      terrain,
      PhysicsImpostor.PlaneImpostor,
      { mass: 0 },
      this.scene
    );
  }
}
