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
  private atmosphereMesh: any;

  ROTATION_SPEED = 0.01;
  PLANET_DIAMETER = 2;
  PLANET_ATMOSPHERE_DIAMETER = 2.15;

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
    this.mesh = MeshBuilder.CreateSphere(
      "sphere",
      { diameter: this.PLANET_DIAMETER },
      scene
    );
    this.mesh.position.y = 1;
    this.mesh.material = sphereMaterial;

    glowLayer.addIncludedOnlyMesh(this.mesh);

    // Create the atmosphere
    const atmosphereMaterial = new StandardMaterial(
      "atmosphereMaterial",
      scene
    );
    atmosphereMaterial.emissiveColor = new Color3(0.5, 0.5, 1);
    atmosphereMaterial.alpha = 0.15;
    atmosphereMaterial.diffuseTexture = new Texture(
      "/textures/space_sky_nz.jpg",
      scene
    );
    this.atmosphereMesh = MeshBuilder.CreateSphere(
      "atmosphere",
      { diameter: this.PLANET_ATMOSPHERE_DIAMETER },
      scene
    );
    this.atmosphereMesh.material = atmosphereMaterial;
    this.atmosphereMesh.position = this.mesh.position;

    // Setup render tick
    /*scene.onBeforeRenderObservable.add(() => {
      this.update();
    });*/
  }

  public update() {
    // Rotate planet
    this.mesh.rotation.y += this.ROTATION_SPEED;

    // Rotate the atmosphere slightly to give a dynamic effect
    this.atmosphereMesh.rotation.y += -this.ROTATION_SPEED * 0.5;
  }
}
