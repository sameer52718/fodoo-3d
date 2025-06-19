import Footer from "@/components/partials/Footer";
import Header from "@/components/partials/Header";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import { ToastContainer } from "react-toastify";

// app/layout.js
export default function WebsiteLayout({ children }) {
  return (
    <>
      <Header />
      <main className="flex-1 bg-white">{children}</main>
      <Footer />
      <ToastContainer />
    </>
  );
}
