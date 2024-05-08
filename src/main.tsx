import React from "react"
import ReactDOM from "react-dom/client"
import App from "./App"
import "./index.css"
//@ts-ignore
import { msalConfig } from './authConfig';

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
      <App />
  </React.StrictMode>,
)
