import { useEffect } from "react";
import { RouterProvider } from "react-router-dom";

import { router } from "./router";
import { useAuthStore } from "./store/authStore";

import GlobalPopup from "./components/ui/GlobalPopup";
import DevToolsBounty from "./components/common/DevToolsBounty";

function App() {
  useEffect(() => {
    // Hydrate token/user from localStorage so protected routes work.
    useAuthStore.getState().hydrate();
    console.log("App mounted! DevToolsBounty should be active.");
  }, []);

  return (
    <>
      <RouterProvider router={router} />
      <GlobalPopup />
      <DevToolsBounty />
    </>
  );
}

export default App;



