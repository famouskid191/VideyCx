// src/main.tsx

import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

import { RouterProvider, createBrowserRouter } from "react-router-dom";
import { Contact } from "./pages/Contact.tsx";
import { PlayVideo } from "./pages/PlayVideo.tsx";
import { Download } from "./pages/Download.tsx";
import Redirect from "./pages/Redirect.tsx";
import { Home } from "./pages/Home.tsx"; // Impor komponen Home yang baru

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      {
        index: true,
        element: <Home />,
      },
      { 
        path: "search",
        element: <PlayVideo /> 
      },
      {
        path: ":id", // Rute dinamis berdasarkan ID
        element: <PlayVideo />,
      },
      {
        path: "e/:id", // Rute baru untuk format `/e/:id`
        element: <PlayVideo />,
      },
      {
        path: "d/:id", // Rute baru untuk format `/e/:id`
        element: <PlayVideo />,
      },
      {
        path: "v/:id", 
        element: <PlayVideo />,
      },
      {
        path: "v", 
        element: <PlayVideo />,
      },
      {
        path: "f/:id", // Rute baru untuk format `/e/:id`
        element: <PlayVideo />,
      },
      {
        path: "play/:id", // Rute baru untuk format `/e/:id`
        element: <PlayVideo />,
      },
      {
        path: "view/:id", // Rute baru untuk format `/e/:id`
        element: <PlayVideo />,
      },
      {
        path: "share/:id", // Rute baru untuk format `/e/:id`
        element: <PlayVideo />,
      },
      {
        path: "download", // Rute untuk halaman Download
        element: <Download />,
      },
      {
        path: "contact", // Rute untuk halaman Contact
        element: <Contact />,
      },
      {
        path: "s/:id",
        element: <Redirect />,
      },
    ],
  },
]);

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);
