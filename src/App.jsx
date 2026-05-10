import { BrowserRouter } from "react-router-dom";
import AppRouter from "./router/AppRouter.jsx";
import { useDarkMode } from "./hooks/useDarkMode.jsx";

export default function IPTVApp() {
  useDarkMode();

  return (
    <BrowserRouter>
      <AppRouter />
    </BrowserRouter>
  );
}
