import { createRoot } from "react-dom/client";
import App from "./App";

const root = document.getElementById("get-host-version-root");

if (root) {
  createRoot(root).render(<App />);
}

export default App;
