import {
  Scene,
  MeshBuilder,
  StandardMaterial,
  Texture,
  Color3,
  GlowLayer,
} from "@babylonjs/core";

export class Planet {
  public mesh: any;

  ROTATION_SPEED = 0.01;

  constructor(
    scene: Scene,
    glowLayer: GlowLayer,
    skyboxMaterial: StandardMaterial
  ) {
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

    // Create a planetary sphere
    this.mesh = MeshBuilder.CreateSphere("sphere", { diameter: 2 }, scene);
    this.mesh.position.y = 1;
    this.mesh.material = sphereMaterial;

    glowLayer.addIncludedOnlyMesh(this.mesh);

    // Setup render tick
    /*scene.onBeforeRenderObservable.add(() => {
      this.update();
    });*/
  }

  public update() {
    // Rotate planet
    this.mesh.rotation.y += this.ROTATION_SPEED;
  }
}
