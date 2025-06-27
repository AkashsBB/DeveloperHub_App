import { createRoot } from "react-dom/client";
import App from "./App";
import { BrowserRouter } from "react-router-dom";

const root = document.getElementById("root");
if (root) {
  createRoot(root).render(
      <BrowserRouter>
        <App />
      </BrowserRouter>
  );
}