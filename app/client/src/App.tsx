import React from "react";
import { RouterProvider } from "react-router-dom";
import Router from "./routes/Router";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import AOS from "aos";
import "aos/dist/aos.css";
import { ConfirmProvider } from "./components/ConfirmDialog";

// Colour orbs behind the frosted surfaces — the blur picks these up, which is
// what gives the glass its tint. Kept saturated so the effect actually reads.
const Atmosphere = () => (
  <div className="atmosphere">
    <div className="blob animate-blob left-[-10%] top-[-10%] bg-fuchsia-500/70" />
    <div className="blob animate-blob [animation-delay:2s] right-[-5%] top-[15%] bg-indigo-500/70" />
    <div className="blob animate-blob [animation-delay:4s] left-[12%] bottom-[-12%] bg-violet-500/70" />
    <div className="blob animate-blob [animation-delay:6s] right-[18%] bottom-[8%] bg-sky-400/60" />
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
    <ConfirmProvider>
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
        theme="colored"
      />
    </ConfirmProvider>
  );
};

export default App;
