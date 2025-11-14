import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
// Import custom SCSS (includes Bootstrap with customizations)
import "./styles/main.scss";
import App from "./App.tsx";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
