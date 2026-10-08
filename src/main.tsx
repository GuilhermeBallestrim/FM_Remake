/**
 * React: ponto de entrada da aplicacao.
 */

import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { App } from "./App";
import "./ui/estilos.css";

const raiz = document.getElementById("root");
if (!raiz) {
  throw new Error("main: elemento #root nao encontrado no index.html");
}

createRoot(raiz).render(
  <StrictMode>
    <App />
  </StrictMode>
);