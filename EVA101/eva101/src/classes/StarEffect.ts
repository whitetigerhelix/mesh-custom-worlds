import {
  Scene,
  PointLight,
  MeshBuilder,
  StandardMaterial,
  Color3,
  ParticleSystem,
  Texture,
  Color4,
  GlowLayer,
  Sound,
  Vector3,
  ShadowGenerator,
} from "@babylonjs/core";

export class StarEffect {
  public pointLight: PointLight;
  public mesh: any;
  public particleSystem!: ParticleSystem;
  public sound!: Sound;
  private audioContext: AudioContext;
  private oscillator!: OscillatorNode;
  private oscillator2!: OscillatorNode;
  private lfo!: OscillatorNode;
  private lfoGain!: GainNode;
  private scene: Scene;
  private shadowGenerator: ShadowGenerator;

  public autoStartSound: boolean = false;

  ORBIT_DISTANCE = 3;
  ORBIT_SPEED = 0.001;
  LIGHT_INTENSITY = 1.0;
  COLOR_TIME = 0.0025;
  BASE_TONE_FREQUENCY = 96;

  constructor(scene: Scene, audioContext: AudioContext, glowLayer: GlowLayer) {
    this.scene = scene;
    this.audioContext = audioContext;

    this.pointLight = new PointLight("pointLight", new Vector3(0, 1, 0), scene);
    this.pointLight.intensity = this.LIGHT_INTENSITY;

    // Shadow from the star effect's light
    this.shadowGenerator = new ShadowGenerator(1024, this.pointLight);
    this.shadowGenerator.usePoissonSampling = true;
    this.shadowGenerator.darkness = 0.05;

    // Create the star effect objects
    this.createStarMesh();
    this.createStarParticleSystem();
    this.createStarAudio();

    glowLayer.addIncludedOnlyMesh(this.mesh);

    // Setup render tick
    /*scene.onBeforeRenderObservable.add(() => {
      this.update();
    });*/
  }

  public addShadowCaster(mesh: any) {
    this.shadowGenerator.addShadowCaster(mesh);
  }

  private createStarMesh() {
    // Basic red material
    const redMaterial = new StandardMaterial("redMaterial", this.scene);
    redMaterial.diffuseColor = new Color3(1, 0, 0); // Red
    redMaterial.specularColor = new Color3(0.5, 0.5, 0.5);
    redMaterial.emissiveColor = new Color3(0.5, 0, 0);
    redMaterial.alpha = 0.1;

    this.mesh = MeshBuilder.CreateSphere(
      "starSphere",
      { diameter: 0.2 },
      this.scene
    );
    this.mesh.position.set(
      this.pointLight.position.x,
      this.pointLight.position.y,
      this.pointLight.position.z
    );
    this.mesh.material = redMaterial;

    this.shadowGenerator.addShadowCaster(this.mesh);
  }

  private createStarParticleSystem() {
    // Add particle system for star effect
    this.particleSystem = new ParticleSystem("particles", 1000, this.scene);
    this.particleSystem.particleTexture = new Texture(
      "/textures/flare2.png",
      this.scene
    );
    this.particleSystem.emitter = this.pointLight.position; // Attach the particle system to the light
    this.particleSystem.minEmitBox = new Vector3(0, 0, 0); // Starting point
    this.particleSystem.maxEmitBox = new Vector3(0, 0, 0); // Ending point
    this.particleSystem.color1 = new Color4(1, 1, 0, 0.5); // Yellow
    this.particleSystem.color2 = new Color4(1, 0.5, 0, 0.5); // Orange
    this.particleSystem.colorDead = new Color4(0, 0, 0, 0); // Fade out
    this.particleSystem.minSize = 0.1;
    this.particleSystem.maxSize = 0.5;
    this.particleSystem.minLifeTime = 0.02;
    this.particleSystem.maxLifeTime = 0.075;
    this.particleSystem.emitRate = 150;
    this.particleSystem.blendMode = ParticleSystem.BLENDMODE_ONEONE;
    this.particleSystem.gravity = new Vector3(0, 0, 0);
    this.particleSystem.direction1 = new Vector3(-1, -1, -1);
    this.particleSystem.direction2 = new Vector3(1, 1, 1);
    this.particleSystem.minAngularSpeed = 0;
    this.particleSystem.maxAngularSpeed = Math.PI;
    this.particleSystem.minEmitPower = 1;
    this.particleSystem.maxEmitPower = 3;
    this.particleSystem.updateSpeed = 0.005;
    this.particleSystem.start();
  }

  public createStarAudio() {
    // Create the main oscillator
    this.oscillator = this.audioContext.createOscillator();
    this.oscillator.type = "triangle"; // ie: 'square', 'sawtooth', 'triangle', 'sine'
    this.oscillator.frequency.setValueAtTime(
      this.BASE_TONE_FREQUENCY,
      this.audioContext.currentTime
    );

    // Create a second oscillator for overtones
    this.oscillator2 = this.audioContext.createOscillator();
    this.oscillator2.type = "sine";
    this.oscillator2.frequency.setValueAtTime(
      this.BASE_TONE_FREQUENCY * 2,
      this.audioContext.currentTime
    );

    const volume = 0.5; // Set lower volume for a more subtle effect

    // Create a GainNode for volume control and a media stream for the gain audio
    const mediaStreamDestination =
      this.audioContext.createMediaStreamDestination();
    const gainNode = this.audioContext.createGain();
    gainNode.gain.setValueAtTime(1, this.audioContext.currentTime);

    // Create an LFO for amplitude modulation
    this.lfo = this.audioContext.createOscillator();
    this.lfo.type = "sine";
    this.lfo.frequency.setValueAtTime(volume, this.audioContext.currentTime); // LFO frequency

    this.lfoGain = this.audioContext.createGain();
    this.lfoGain.gain.setValueAtTime(volume, this.audioContext.currentTime); // LFO amplitude

    // Connect the LFO to the gain node
    this.lfo.connect(this.lfoGain);
    this.lfoGain.connect(gainNode.gain);

    // Connect the oscillators to the GainNode, then gain to the MediaStreamAudioDestinationNode
    this.oscillator.connect(gainNode);
    this.oscillator2.connect(gainNode);
    gainNode.connect(mediaStreamDestination);

    // Create the Sound instance using the media stream
    this.sound = new Sound(
      "tone",
      mediaStreamDestination.stream,
      this.scene,
      null,
      {
        autoplay: false,
        loop: true,
        spatialSound: true,
        volume: volume,
        distanceModel: "exponential",
        rolloffFactor: 1.5,
      }
    );

    // Attach the sound to the starSphere for spatial sound
    this.sound.attachToMesh(this.mesh);

    // Handle oscillator start/stop based on sound state
    if (this.autoStartSound) {
      this.startAudio();
    }
    this.sound.onended = () => {
      this.oscillator.stop();
      this.oscillator2.stop();
      this.lfo.stop();
    };
  }

  public isAudioPlaying() {
    return this.sound.isPlaying;
  }

  public toggleAudio() {
    if (this.isAudioPlaying()) {
      this.stopAudio();
    } else {
      this.startAudio();
    }
  }

  public startAudio() {
    this.sound.play();
    this.oscillator.start();
    this.oscillator2.start();
    this.lfo.start();
  }

  public stopAudio() {
    this.sound.stop();
    this.oscillator.stop();
    this.oscillator2.stop();
    this.lfo.stop();
  }

  public update() {
    // Orbit the light around the planet
    const time = Date.now() * this.ORBIT_SPEED;
    this.pointLight.position.x = Math.sin(time) * this.ORBIT_DISTANCE;
    this.pointLight.position.y = this.mesh.position.y;
    this.pointLight.position.z = Math.cos(time) * this.ORBIT_DISTANCE;

    // Animate the color using Perlin noise
    const noise = (x: number) => (Math.sin(x) + 1) / 2;
    const colorTimeR = noise(Date.now() * this.COLOR_TIME);
    const colorTimeG = noise(Date.now() * this.COLOR_TIME + Math.PI / 2);
    const colorTimeB = noise(Date.now() * this.COLOR_TIME + Math.PI);
    const alpha = noise(Date.now() * this.COLOR_TIME + Math.PI / 4);
    const newColor = new Color4(colorTimeR, colorTimeG, colorTimeB, alpha);
    const newColor2 = new Color4(
      1.0 - newColor.r,
      1.0 - newColor.g,
      1.0 - newColor.b,
      alpha
    );
    this.pointLight.diffuse = new Color3(newColor.r, newColor.g, newColor.b);
    this.particleSystem.color1 = newColor;
    this.particleSystem.color2 = newColor2;
    this.particleSystem.emitter = this.pointLight.position; // Update emitter position
    this.mesh.position.set(
      this.pointLight.position.x,
      this.pointLight.position.y,
      this.pointLight.position.z
    );

    // Modulate the tone frequency based on the orbit speed and noise
    const baseFrequency = this.BASE_TONE_FREQUENCY / 2;
    const orbitSpeedFactor = Math.abs(Math.sin(time)) * 0.5 + 0.5; // Normalize to [0.5, 1.0]
    const frequency =
      baseFrequency + baseFrequency * orbitSpeedFactor * newColor.r; // Modulate by red component and orbit speed
    this.oscillator.frequency.setValueAtTime(
      frequency,
      this.audioContext.currentTime
    );
    this.oscillator2.frequency.setValueAtTime(
      frequency * 2,
      this.audioContext.currentTime
    ); // Harmonic overtone
  }

  // Cleanup
  public dispose() {
    this.sound.stop();
    this.oscillator.disconnect();
  }
}
