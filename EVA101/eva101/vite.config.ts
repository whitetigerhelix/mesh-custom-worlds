import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 443,
    https: {
      key: path.resolve(__dirname, "certs/local/key.pem"),
      cert: path.resolve(__dirname, "certs/local/cert.pem"),
    },
  },
  preview: {
    port: 443,
  },
});
