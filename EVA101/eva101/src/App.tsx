import React, { useRef, useEffect } from "react";
import { SceneManager } from "./SceneManager";

const App: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const sceneManagerRef = useRef<SceneManager | null>(null);

  // useEffect hook to set up the scene and handle lifecycle events
  useEffect(() => {
    if (!canvasRef.current) return;

    sceneManagerRef.current = new SceneManager(canvasRef.current);

    return () => {
      sceneManagerRef.current?.dispose();
    };
  }, []);

  return <canvas ref={canvasRef} style={{ width: "100vw", height: "100vh" }} />;
};

export default App;
