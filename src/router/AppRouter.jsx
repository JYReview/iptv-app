import { Routes, Route, Navigate } from "react-router-dom";
import AppLayout from "../layouts/AppLayout.jsx";
import Home from "../pages/Home.jsx";
import Checker from "../pages/Checker.jsx";

export default function AppRouter() {
  return (
    <Routes>
      <Route path="/" element={<AppLayout />}>
        <Route index element={<Home />} />
        <Route path="checker" element={<Checker />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}
