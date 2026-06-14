import React from "react";
import { RouterProvider } from "react-router-dom";
import Router from "./routes/Router";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import AOS from "aos";
import "aos/dist/aos.css";

const Atmosphere = () => (
  <div className="atmosphere">
    <div className="blob animate-blob left-[-10%] top-[-10%] bg-purple-600/20" />
    <div className="blob animate-blob [animation-delay:2s] right-[-5%] top-[20%] bg-blue-600/20" />
    <div className="blob animate-blob [animation-delay:4s] left-[15%] bottom-[-10%] bg-indigo-600/20" />
    <div className="blob animate-blob [animation-delay:6s] right-[20%] bottom-[10%] bg-violet-600/20" />
  </div>
);

// Main app component including router provider and toast container
const App = () => {
  React.useEffect(() => {
    AOS.init({
      duration: 1000,
      easing: "ease-out-back",
      once: false,
      mirror: true,
      anchorPlacement: "top-bottom",
    });
  }, []);

  return (
    <>
      <Atmosphere />
      <RouterProvider router={Router} />
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="dark"
      />
    </>
  );
};

export default App;
