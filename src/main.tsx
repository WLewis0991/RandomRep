import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import "./index.css"
import App from "./App.tsx"
import { NeonAuthUIProvider } from "@neondatabase/auth/react/ui"
import { authClient } from "./lib/auth.ts"

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <NeonAuthUIProvider authClient={authClient}>
      <App />
    </NeonAuthUIProvider>
  </StrictMode>
)