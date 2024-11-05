import React, { useRef, useEffect } from "react";
import { Engine, Scene } from "@babylonjs/core";
import {
  FreeCamera,
  Vector3,
  HemisphericLight,
  MeshBuilder,
} from "@babylonjs/core";
import { Inspector } from "@babylonjs/inspector";

const App: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const inspectorRef = useRef<boolean>(false);

  const setupScene = (canvas: HTMLCanvasElement) => {
    const engine = new Engine(canvas, true);
    const scene = new Scene(engine);

    // Create a basic camera
    const camera = new FreeCamera("camera1", new Vector3(0, 5, -10), scene);
    camera.setTarget(Vector3.Zero());
    camera.attachControl(canvas, true);

    // Create a basic light
    const light = new HemisphericLight("light1", new Vector3(0, 1, 0), scene);
    light.intensity = 0.7;

    // Create a basic sphere
    const sphere = MeshBuilder.CreateSphere("sphere", { diameter: 2 }, scene);
    sphere.position.y = 1;

    // Add a plane below the sphere
    const ground = MeshBuilder.CreateGround(
      "ground1",
      { width: 6, height: 6 },
      scene
    );

    return { engine, scene };
  };

  const renderScene = (scene: Scene) => {
    scene.render();

    //TODO: Add custom rendering code here
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
    if (event.ctrlKey && event.key === "d") {
      event.preventDefault();
      toggleInspector(scene);
    }
  };

  useEffect(() => {
    if (!canvasRef.current) return;

    const { engine, scene } = setupScene(canvasRef.current);

    const onKeyDown = (event: KeyboardEvent) => handleKeyDown(event, scene);
    window.addEventListener("keydown", onKeyDown);

    window.addEventListener("resize", () => engine.resize());

    engine.runRenderLoop(() => {
      renderScene(scene);
    });

    return () => {
      engine.dispose();
      window.removeEventListener("keydown", onKeyDown);
    };
  }, []);

  return <canvas ref={canvasRef} style={{ width: "100vw", height: "100vh" }} />;
};

export default App;
