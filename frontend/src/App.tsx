import { useEffect } from "react";
import { RouterProvider } from "react-router-dom";

import { router } from "./router";
import { useAuthStore } from "./store/authStore";

import GlobalPopup from "./components/ui/GlobalPopup";

function App() {
  useEffect(() => {
    // Hydrate token/user from localStorage so protected routes work.
    useAuthStore.getState().hydrate();
  }, []);

  return (
    <>
      <RouterProvider router={router} />
      <GlobalPopup />
    </>
  );
}

export default App;



