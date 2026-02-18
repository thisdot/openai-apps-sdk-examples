import { createRoot } from "react-dom/client";
import App from "./App";

const root = document.getElementById("send-message-root");

if (root) {
  createRoot(root).render(<App />);
}

export default App;
