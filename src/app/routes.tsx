import { createBrowserRouter } from "react-router";
import { RootLayout } from "./pages/RootLayout";
import { CustomerLayout } from "./pages/CustomerLayout";
import { StorefrontPage } from "./pages/StorefrontPage";
import { CustomizePage } from "./pages/CustomizePage";
import { CheckoutPage } from "./pages/CheckoutPage";
import { MyOrdersPage } from "./pages/MyOrdersPage";
import { CustomerLoginPage } from "./pages/CustomerLoginPage";
import { CustomerRegisterPage } from "./pages/CustomerRegisterPage";
import { AdminLoginPage } from "./pages/AdminLoginPage";
import { NotFound } from "./pages/NotFound";
import { AdminLayout } from "./components/admin/AdminLayout";
import { AdminDashboard } from "./components/admin/AdminDashboard";
import { AdminOrders } from "./components/admin/AdminOrders";
import { AdminProducts } from "./components/admin/AdminProducts";
import { AdminPayments } from "./components/admin/AdminPayments";
import { AdminAccounts } from "./components/admin/AdminAccounts";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: RootLayout,
    children: [
      // Customer storefront (header + pages)
      {
        Component: CustomerLayout,
        children: [
          { index: true, Component: StorefrontPage },
          { path: "product/:id", Component: CustomizePage },
          { path: "checkout", Component: CheckoutPage },
          { path: "pesanan-saya", Component: MyOrdersPage },
        ],
      },
      // Auth screens (no storefront chrome)
      { path: "login", Component: CustomerLoginPage },
      { path: "register", Component: CustomerRegisterPage },
      { path: "admin/login", Component: AdminLoginPage },
      // Admin / owner panel
      {
        path: "admin",
        Component: AdminLayout,
        children: [
          { index: true, Component: AdminDashboard },
          { path: "orders", Component: AdminOrders },
          { path: "products", Component: AdminProducts },
          { path: "payments", Component: AdminPayments },
          { path: "accounts", Component: AdminAccounts },
        ],
      },
      { path: "*", Component: NotFound },
    ],
  },
]);
