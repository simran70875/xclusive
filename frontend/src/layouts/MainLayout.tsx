// src/layouts/MainLayout.tsx
import { useEffect, useState } from "react";
import { Routes, Route, useNavigate, Navigate } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";
import useFetch from "../hooks/useFetch";
import { type CartItem } from "../pages/cartPage";
import { API_PATHS, IMAGE_URL } from "../utils/config";

// import pages here
import HomePage from "../pages/HomePage";
import AboutPage from "../pages/AboutPage";
import SearchPage from "../pages/SearchPage";
import NewsletterPage from "../pages/AccountPage";
import CategoriesPage from "../pages/CategoriesPage";
import ShopPage from "../pages/ShopPage";
import ProjectDetails from "../pages/products/details";
import CartPage from "../pages/cartPage";
import { ScrollToTop } from "../router/AppRouter";
import useCart from "../hooks/useCart";
import OrderConfirmationPage from "../pages/OrderConfirmationPage";
import TermsPage from "../pages/Terms";
import SendQuotation from "../pages/sendQuotation";
import ContactUs from "../pages/ContactUs";
import SignInForm from "../pages/SignInForm";
import UserProfilePage from "../pages/UserProfilePage";
import { useAuth } from "../hooks/useAuth";
import PolicyPage from "../pages/privacy";

function MainLayout() {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [showBanner, setShowBanner] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const { cartdata, fetchData } = useCart();

  useEffect(() => {
    if (cartdata?.[0]?.items) {
      setCartItems(cartdata[0].items);
    }
  }, [cartdata]);

  const refreshCart = async () => {
    await fetchData();
  };

  interface floatingBannerType {
    _id: string;
    title: string;
    description: string;
    imageUrl: string;
  }

  const url = API_PATHS.GET_FLOATING_BANNER;
  const { data } = useFetch<floatingBannerType>(url);

  const navigate = useNavigate();

  interface Props {
    children: React.ReactNode;
  }

  function PrivateRoute({ children }: Props) {
    const { token } = useAuth();

    if (!token) {
      return <Navigate to="/login" replace />;
    }

    return children;
  }
  // const { token } = useAuth();

  return (
    <div className="min-h-screen">
      <Header cartItems={cartItems} refreshCart={refreshCart} />

      <main className="flex-grow mx-auto relative">
        <ScrollToTop />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/contact" element={<ContactUs />} />
          <Route path="/search" element={<SearchPage />} />
          <Route path="/account" element={<NewsletterPage />} />
          <Route path="/categories" element={<CategoriesPage />} />
          <Route path="/shop" element={<ShopPage />} />
          <Route path="/projectDetails/:productId" element={<ProjectDetails refreshCart={refreshCart} />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/sendQuotation" element={<SendQuotation />} />
          <Route path="/confirm-order/:token" element={<OrderConfirmationPage />} />
          <Route path="/terms" element={<TermsPage />} />
          <Route path="/privacy" element={<PolicyPage />} />
          <Route path="/login" element={<SignInForm />} />
          <Route
            path="/profile"
            element={
              <PrivateRoute>
                <UserProfilePage />
              </PrivateRoute>
            }
          />
        </Routes>
      </main>
      <Footer />

      {/* Floating Banner Box */}
      {showBanner && data && (
        <div
          onClick={() => navigate("/contact")}
          className="fixed bottom-5 right-5 z-50 w-55 rounded-lg overflow-hidden
               bg-gradient-to-tl from-gray-100 via-gray-200 to-gray-300
               text-gray-800 cursor-pointer shadow-[0_0_20px_4px_rgba(236,72,153,0.5)]"
        >
          {/* Close Button */}
          <button
            onClick={() => setShowBanner(false)}
            className="absolute bg-white rounded-full w-7 h-7 top-2 right-2 text-gray-500 hover:text-gray-800 text-xl font-bold"
            aria-label="Close"
          >
            &times;
          </button>

          {/* Banner image */}
          <img
            src={IMAGE_URL + "/" + data?.imageUrl}
            alt={data?.title}
            className="w-full h-auto object-cover flex-shrink-0"
          />

          <div className="flex flex-col items-center justify-center flex-grow p-3">
            <h3 className="font-semibold mb-1 p-0 uppercase text-center">
              {data?.title}
            </h3>
            <p className="text-center text-[12px]">{data?.description}</p>

          </div>
        </div>
      )}
    </div>
  );
}

export default MainLayout;
