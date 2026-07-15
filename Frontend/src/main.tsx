import { createRoot } from "react-dom/client";
import { setAuthTokenGetter, setBaseUrl } from "@workspace/api-client-react";
import App from "./App";
import "./index.css";

setBaseUrl(import.meta.env.VITE_API_BASE_URL ?? null);
setAuthTokenGetter(() => localStorage.getItem("ryln_token"));

createRoot(document.getElementById("root")!).render(<App />);
