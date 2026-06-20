import { Outlet } from "react-router";
import { Header } from "../components/Header";

// Customer-facing storefront layout (header + page outlet).
export function CustomerLayout() {
  return (
    <div className="font-sans">
      <Header />
      <Outlet />
    </div>
  );
}
