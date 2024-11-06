import { teamsDarkTheme, createDarkTheme } from "@fluentui/react-components";

const AppTheme = createDarkTheme({
  ...teamsDarkTheme, // Extend from an existing theme
  colorPalette: {
    brand: {
      background: "#0078D4",
      foreground: "#FFFFFF",
      border: "#005A9E",
      shadow: "#004578",
    },
    // Define other color tokens as needed
  },
  fontFamily: {
    base: "'Segoe UI', Arial, sans-serif",
    monospace: "'Courier New', Courier, monospace",
  },
  // Define other design tokens as needed
});

export default AppTheme;
