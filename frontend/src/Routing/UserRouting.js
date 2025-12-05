import Aos from "aos";
import  { useEffect, useState } from "react";
import {
  BrowserRouter as Router,
  Route,
  Routes,
  useLocation,
} from "react-router-dom";
import { routes } from "../Routes/Routes";

import Like from "../Pages/Like/Like";
import User from "../Pages/User/User";
import OTP from "../Pages/User/OTP/OTP";
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
import Wallet from "../Pages/Wallet/Wallet";
import Coins from "../Pages/Wallet/Coins/Coins";
import Contact from "../Pages/User/SettingPage/Contact/Contact";
import Notification from "../Pages/Wallet/Notification/Notification";
import ScrollToTop from "../Component/ScrollToTop/ScrollToTop";
import ThankYouMobile from "../Pages/ThankYou/ThankYouMobile";
import PaymentPending from "../Pages/ThankYou/PaymentPending";
import PaymentError from "../Pages/ThankYou/PaymentError";
import WalletThankYou from "../Pages/ThankYou/walletThankyou";
import Error from "../Pages/ThankYou/error";

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
    // window.open("https://api.whatsapp.com/send?phone=+917289009522&text=Hello.");
  };

  useEffect(() => {
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <Router>
      <ScrollToTop
        handleOnScrollTop={handleOnScrollTop}
        scrolled={scrolled}
      />
      <Layout>
        <Routes>
          <Route path={routes.otpUrl} element={<OTP />} />
          <Route path={routes.userUrl} element={<User />} />
          <Route path={routes.likeUrl} element={<Like />} />
          <Route path={routes.signupUrl} element={<Signup />} />
          <Route path={routes.homepageUrl} element={<Home />} />
          <Route path={routes.orderUrl} element={<OrderPage />} />
          <Route path="/product-detail/:name" element={<AddCart />} />
          <Route path={routes.addressUrl} element={<Address />} />
          <Route path={routes.summeryUrl} element={<Summery />} />
          <Route path={routes.shoppingUrl} element={<Shopping />} />
          <Route path={routes.thankyouUrl} element={<ThankYou />} />
          <Route path={routes.walletAdded} element={<WalletThankYou />} />
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
          <Route path={routes.walletUrl} element={<Wallet />} />
          <Route path={routes.coinsUrl} element={<Coins />} />
          <Route path={routes.contactUrl} element={<Contact />} />
          <Route path={routes.notificationUrl} element={<Notification />} />
        </Routes>
      </Layout>
    </Router>
  );
};

export default UserRouting;
