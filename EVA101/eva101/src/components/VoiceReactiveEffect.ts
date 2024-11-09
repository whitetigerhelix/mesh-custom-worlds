import {
  Scene,
  MeshBuilder,
  StandardMaterial,
  Color3,
  Vector3,
  Texture,
} from "@babylonjs/core";

class VoiceReactiveEffect {
  private scene: Scene;
  private mesh: any;
  private skyboxMaterial: StandardMaterial;
  private isActive: boolean = false;
  private mood: string = "neutral";

  constructor(scene: Scene, skyboxMaterial: StandardMaterial) {
    this.scene = scene;
    this.skyboxMaterial = skyboxMaterial;
    this.createMesh();
  }

  private createMesh() {
    console.log("VoiceReactiveEffect.createMesh");

    // Voice reactive material
    const material = new StandardMaterial("voiceReactiveMaterial", this.scene);
    material.diffuseColor = new Color3(0, 1, 0);
    material.specularColor = new Color3(0.5, 0.5, 0.5);
    material.diffuseTexture = new Texture(
      "/textures/fractalplanet.jpg",
      this.scene
    );
    material.bumpTexture = new Texture(
      "/textures/fractalplanet_bump.jpg",
      this.scene
    );
    material.emissiveColor = new Color3(0.1, 0.1, 0.3);
    material.reflectionTexture = this.skyboxMaterial.reflectionTexture;

    // Sphere mesh
    this.mesh = MeshBuilder.CreateSphere(
      "voiceReactiveSphere",
      { diameter: 1 },
      this.scene
    );
    //this.mesh.position = new Vector3(0, 0, 0);
    this.mesh.material = material;
  }

  // Start reactivity, with specific mood
  public start(mood: string = "neutral") {
    console.log("VoiceReactiveEffect.start - Mood: " + mood);

    this.isActive = true;
    this.mood = mood;
    this.updateMesh();
  }

  // Stop reactivity
  public stop() {
    console.log("VoiceReactiveEffect.stop");

    this.isActive = false;
  }

  public setPosition(position: Vector3) {
    this.mesh.position = position;
  }

  // Update the mesh color based on the current mood (ie. when reactivity starts or mood changes)
  private updateMesh() {
    if (!this.isActive) return;

    switch (this.mood) {
      case "neutral":
        this.mesh.material.diffuseColor = new Color3(0, 1, 0);
        break;

      case "happy":
        this.mesh.material.diffuseColor = new Color3(1, 1, 0);
        break;

      case "sad":
        this.mesh.material.diffuseColor = new Color3(0, 0, 1);
        break;

      case "angry":
        this.mesh.material.diffuseColor = new Color3(1, 0, 0);
        break;

      case "excited":
        this.mesh.material.diffuseColor = new Color3(1, 0.5, 0);
        break;

      case "frustrated":
        this.mesh.material.diffuseColor = new Color3(1, 0.2, 0.2);
        break;

      case "annoyed":
        this.mesh.material.diffuseColor = new Color3(1, 0.6, 0);
        break;

      case "sarcastic":
        this.mesh.material.diffuseColor = new Color3(0.5, 0, 0.5);
        break;

      case "pompous":
        this.mesh.material.diffuseColor = new Color3(1, 0.8, 0);
        break;

      case "amused":
        this.mesh.material.diffuseColor = new Color3(1, 0.7, 0.7);
        break;

      case "cynical":
        this.mesh.material.diffuseColor = new Color3(0.5, 0.5, 0.5);
        break;

      case "inquisitive":
        this.mesh.material.diffuseColor = new Color3(0, 1, 1);
        break;

      default:
        console.warn(
          "VoiceReactiveEffect.updateMesh - Unknown mood: " + this.mood
        );
        break;
    }
  }

  public update() {
    if (this.isActive) {
      let scaleFactor = 1.0; // Default scale factor
      switch (this.mood) {
        case "neutral":
          scaleFactor = 1.0 + Math.sin(Date.now() * 0.005) * 0.05;
          break;

        case "happy":
          scaleFactor = 1.2 + Math.sin(Date.now() * 0.005) * 0.1;
          break;

        case "sad":
          scaleFactor = 0.8 + Math.sin(Date.now() * 0.005) * 0.05;
          break;

        case "angry":
          scaleFactor = 1.5 + Math.sin(Date.now() * 0.01) * 0.2;
          break;

        case "excited":
          scaleFactor = 1.3 + Math.sin(Date.now() * 0.01) * 0.15;
          break;

        case "frustrated":
          scaleFactor = 1.1 + Math.sin(Date.now() * 0.01) * 0.1;
          break;

        case "annoyed":
          scaleFactor = 1.0 + Math.sin(Date.now() * 0.005) * 0.1;
          break;

        case "sarcastic":
          scaleFactor = 1.0 + Math.sin(Date.now() * 0.005) * 0.05;
          break;

        case "pompous":
          scaleFactor = 1.2 + Math.sin(Date.now() * 0.005) * 0.1;
          break;

        case "amused":
          scaleFactor = 1.1 + Math.sin(Date.now() * 0.005) * 0.1;
          break;

        case "cynical":
          scaleFactor = 0.9 + Math.sin(Date.now() * 0.005) * 0.05;
          break;

        case "inquisitive":
          scaleFactor = 1.0 + Math.sin(Date.now() * 0.005) * 0.1;
          break;

        default:
          console.warn(
            "VoiceReactiveEffect.update - Unknown mood: " + this.mood
          );
          break;
      }

      this.mesh.scaling.set(scaleFactor, scaleFactor, scaleFactor);
    }
  }
}

export default VoiceReactiveEffect;
