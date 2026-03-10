import { createRoot } from "react-dom/client";
import App from "./app/App";
import "@/styles/index.css";
import { Toaster } from "@components/ui/sonner";

createRoot(document.getElementById("root")!).render(
  <>
    <App />
    <Toaster richColors position="top-right" />
  </>
);
