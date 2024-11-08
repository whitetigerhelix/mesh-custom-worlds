import React from "react";
import SceneManager from "./components/SceneManager";
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
  return (
    <div className={styles.appContainer}>
      <SceneManager />
    </div>
  );
};

export default App;
