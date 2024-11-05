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

  useEffect(() => {
    if (!canvasRef.current) return;

    // Create the Babylon engine and scene
    const engine = new Engine(canvasRef.current, true);
    const scene = new Scene(engine);

    // Create a basic camera
    const camera = new FreeCamera("camera1", new Vector3(0, 5, -10), scene);
    camera.setTarget(Vector3.Zero()); // Point the camera at the origin
    camera.attachControl(canvasRef.current, true); // Attach the camera to the canvas

    // Create a basic light
    const light = new HemisphericLight("light1", new Vector3(0, 1, 0), scene);
    light.intensity = 0.7; // Set the light intensity

    // Create a basic sphere
    const sphere = MeshBuilder.CreateSphere("sphere", { diameter: 2 }, scene);
    sphere.position.y = 1; // Move the sphere upward 1 unit

    // To provide a sense of scale and grounding, add a plane below the sphere
    const ground = MeshBuilder.CreateGround(
      "ground1",
      { width: 6, height: 6 },
      scene
    );

    // Function to toggle the Babylon Inspector
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

    // Event listener for toggling the inspector with Ctrl+D
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.ctrlKey && event.key === "d") {
        event.preventDefault();
        toggleInspector();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    // Resize the canvas when the window is resized
    window.addEventListener("resize", () => engine.resize());

    // Render loop
    engine.runRenderLoop(() => {
      scene.render();
    });

    return () => {
      engine.dispose();
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  return <canvas ref={canvasRef} style={{ width: "100vw", height: "100vh" }} />;
};

export default App;
