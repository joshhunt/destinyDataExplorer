// import * as React from "react";
// import * as ReactDOM from "react-dom/client";

// import App from "./App.tsx";
import { workerInterface } from "./defsWorker/interface";
import "./index.css";

// ReactDOM.createRoot(document.getElementById("root")!).render(
//   <React.StrictMode>
//     <App />
//   </React.StrictMode>
// );

workerInterface
  .post({
    type: "init",
  })
  .then((returnV) => {
    console.log("got response from worker!", returnV);
  });
