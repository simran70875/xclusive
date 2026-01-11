import Aos from "aos";
import { useEffect, useState } from "react";
import {
  BrowserRouter as Router,
  Route,
  Routes,
  useLocation,
} from "react-router-dom";
import { routes } from "../Routes/Routes";

import Like from "../Pages/Like/Like";
import User from "../Pages/User/User";
import Home from "../Pages/HomePage/Home";
import Summery from "../Pages/Summery/Summery";
import AddCart from "../Pages/AddCart/AddCart";
import Header from "../Component/Header/Header";
import Footer from "../Component/Footer/Footer";
import Signup from "../Pages/User/Signup/Signup";
import Shopping from "../Pages/Shopping/Shopping";
import ThankYou from "../Pages/ThankYou/ThankYou";
import Catagory from "../Pages/Catagory/Catagory";
import OrderPage from "../Pages/OrderPage/OrderPage";
import OrderView from "../Pages/OrderPage/OrderView/OrderView";
import SettingPage from "../Pages/User/SettingPage/SettingPage";
import Address from "../Pages/AddAddress/Address";
import SearchData from "../Pages/SearchData/SearchData";
import Faq from "../Pages/User/SettingPage/Faq";
import About from "../Pages/User/SettingPage/About";
import Refund from "../Pages/User/SettingPage/Refund";
import Privacy from "../Pages/User/SettingPage/Privacy";
import Contact from "../Pages/User/SettingPage/Contact/Contact";
import ScrollToTop from "../Component/ScrollToTop/ScrollToTop";
import ThankYouMobile from "../Pages/ThankYou/ThankYouMobile";
import PaymentPending from "../Pages/ThankYou/PaymentPending";
import PaymentError from "../Pages/ThankYou/PaymentError";
import Error from "../Pages/ThankYou/error";
import LoadingScreen from "../Component/Loader";

const Layout = ({ children }) => {
  const location = useLocation();
  const isThankYouMobile = location.pathname === routes.thankyouMobileUrl;

  return (
    <>
      {!isThankYouMobile && <Header />}
      {children}
      {!isThankYouMobile && <Footer />}
    </>
  );
};

const UserRouting = () => {
  useEffect(() => {
    Aos.init();
  }, []);

  const [scrolled, setScrolled] = useState(false);
  const handleScroll = () => {
    const offset = window.scrollY;
    if (offset > 0) {
      setScrolled(true);
    } else {
      setScrolled(false);
    }
  };

  const handleOnScrollTop = () => {
    // window.addEventListener("scroll", handleScroll);
    window.scrollTo({ top: 0, behavior: "smooth" });
    // return () => window.removeEventListener("scroll", handleScroll);
  };

  useEffect(() => {
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const [initialLoading, setInitialLoading] = useState(true);

  useEffect(() => {
    Aos.init();

    // FIRST TIME APP LOAD LOADER
    const timer = setTimeout(() => {
      setInitialLoading(false);
    }, 4000); // you can reduce/increase time

    return () => clearTimeout(timer);
  }, []);

  if (initialLoading) {
    return (
      <LoadingScreen
        isAppLoading={initialLoading}
        onFinish={() => setInitialLoading(false)}
      />
    );
  }

  return (
    <Router>
      <ScrollToTop handleOnScrollTop={handleOnScrollTop} scrolled={scrolled} />
      <Layout>
        <Routes>
          <Route path={routes.loginUrl} element={<User />} />
          <Route path={routes.likeUrl} element={<Like />} />
          <Route path={routes.signupUrl} element={<Signup />} />
          <Route path={routes.homepageUrl} element={<Home />} />
          <Route path={routes.orderUrl} element={<OrderPage />} />
          <Route path="/product-detail/:name" element={<AddCart />} />
          <Route path={routes.addressUrl} element={<Address />} />
          <Route path={routes.summeryUrl} element={<Summery />} />
          <Route path={routes.shoppingUrl} element={<Shopping />} />
          <Route path={routes.thankyouUrl} element={<ThankYou />} />
          <Route path={routes.thankyouMobileUrl} element={<ThankYouMobile />} />
          <Route path={routes.pendingPayment} element={<PaymentPending />} />
          <Route path={routes.paymentError} element={<PaymentError />} />
          <Route path={routes.error} element={<Error />} />
          <Route path="/product/:name" element={<Catagory />} />
          <Route path={routes.settingUrl} element={<SettingPage />} />
          <Route path={routes.orderviewUrl} element={<OrderView />} />
          <Route path={routes.search} element={<SearchData />} />
          <Route path={routes.faqUrl} element={<Faq />} />
          <Route path={routes.aboutUrl} element={<About />} />
          <Route path={routes.refundUrl} element={<Refund />} />
          <Route path={routes.privacyUrl} element={<Privacy />} />
          <Route path={routes.contactUrl} element={<Contact />} />
        </Routes>
      </Layout>
    </Router>
  );
};

export default UserRouting;
