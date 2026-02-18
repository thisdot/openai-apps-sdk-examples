import { createRoot } from "react-dom/client";
import App from "./App";

const root = document.getElementById("call-server-tool-root");

if (root) {
  createRoot(root).render(<App />);
}

export default App;
