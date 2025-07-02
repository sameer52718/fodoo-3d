import { ToastContainer } from "react-toastify";

// app/layout.js
export default function WebsiteLayout({ children }) {
  return (
    <>
      <main className="flex-1 bg-white">{children}</main>
      <ToastContainer />
    </>
  );
}
