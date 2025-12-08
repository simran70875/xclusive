import { BrowserRouter, useLocation } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import MainLayout from "../layouts/MainLayout";
import { useEffect, useState } from "react";
import SiteLoader from "../components/SiteLoader";

export const ScrollToTop = () => {
  const location = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [location.pathname]);

  return null;
};

const AppRouter = () => {
  const [loading, setLoading] = useState(true);
  const [hideLoader, setHideLoader] = useState(false); // controls slide up

  useEffect(() => {
    if (loading) {
      // Add overflow hidden and padding-right to compensate for scrollbar width
      const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
      document.body.style.overflow = "hidden";
      document.body.style.paddingRight = `${scrollbarWidth}px`;
    } else {
      // Reset styles
      document.body.style.overflow = "";
      document.body.style.paddingRight = "";
    }
  }, [loading]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setHideLoader(true); // start slide up animation
    }, 3000);

    const cleanup = setTimeout(() => {
      setLoading(false); // hide loader completely after animation duration
    }, 3000); // 600ms animation duration

    return () => {
      clearTimeout(timer);
      clearTimeout(cleanup);
    };
  }, []);

  return (
    <BrowserRouter>
      <MainLayout />
      {loading && <SiteLoader hide={hideLoader} />}
      <Toaster />
    </BrowserRouter>
  );
};

export default AppRouter;
