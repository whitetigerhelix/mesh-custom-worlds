import React, { useRef, useEffect } from "react";
import { SceneManager } from "./classes/SceneManager";
import UIOverlay from "./components/UIOverlay";
import { makeStyles } from "@fluentui/react-components";

const useStyles = makeStyles({
  appContainer: {
    position: "fixed",
    top: 0,
    left: 0,
    width: "100vw",
    height: "100vh",
  },
});

const App: React.FC = () => {
  const styles = useStyles();
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

  //TODO: change to <SceneManager /> -- SceneManager, and the planet and the star effect all need to be refactored to React components (and put in components folder), and fix casing for file names, then we can move this stuff in there
  return (
    <div className={styles.appContainer}>
      <canvas ref={canvasRef} />
      <UIOverlay />
    </div>
  );
};

export default App;
