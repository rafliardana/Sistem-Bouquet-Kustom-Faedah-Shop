import { Outlet } from "react-router";
import { AuthProvider } from "../lib/auth";
import { StoreProvider } from "../lib/store";

// Top-level layout: provides auth + store context to the entire app tree.
export function RootLayout() {
  return (
    <AuthProvider>
      <StoreProvider>
        <Outlet />
      </StoreProvider>
    </AuthProvider>
  );
}
