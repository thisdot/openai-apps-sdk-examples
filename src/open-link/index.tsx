import { createRoot } from "react-dom/client";
import App from "./App";

const root = document.getElementById("open-link-root");

if (root) {
  createRoot(root).render(<App />);
}

export default App;
