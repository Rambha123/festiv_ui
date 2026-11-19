import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { wishesPlugin } from "./server/wishes.mjs";
export default defineConfig({ plugins: [react(), wishesPlugin()], base: "./" });
