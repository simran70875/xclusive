import { useEffect, useState } from "react";
import Header from "../../Components/HeaderComp/Header";
import LeftSide from "../../Components/SideBarComp/LeftSide";
import RightSide from "../../Components/SideBarComp/RightSide";
import AddCategory from "../InnerPages/BackEndSide/Category/AddCategory";
import { Route, Routes } from "react-router-dom";
import ShowCategory from "../InnerPages/BackEndSide/Category/ShowCategory";
import EditCategory from "../InnerPages/BackEndSide/Category/EditCategory";
import AddBanner from "../InnerPages/BackEndSide/Banner/AddBanner";
import ShowBanner from "../InnerPages/BackEndSide/Banner/ShowBanner";
import EditBanner from "../InnerPages/BackEndSide/Banner/EditBanner";
import AddData from "../InnerPages/BackEndSide/Data/AddData";
import ShowData from "../InnerPages/BackEndSide/Data/ShowData";
import EditData from "../InnerPages/BackEndSide/Data/EditData";
import ShowProduct from "../InnerPages/BackEndSide/Product/ShowProduct";
import ShowVariation from "../InnerPages/BackEndSide/Variation/ShowVariation";
import ShowVariationSize from "../InnerPages/BackEndSide/Variation/ShowVariationSize";
import ShowUser from "../InnerPages/FrontEndSide/User/ShowUser";
import AddChargesSettings from "../SettingsPages/ChargesSettings/AddChargesSettings";
import EditProduct from "../InnerPages/BackEndSide/Product/EditProduct";
import ShowOrder from "../InnerPages/FrontEndSide/Order/ShowOrder";
import EditUser from "../InnerPages/FrontEndSide/User/EditUser";
import GeneralSettingsMain from "../SettingsPages/GeneralSettings/GeneralSettingsMain";
import PageSettings from "../SettingsPages/PagesSettings/PageSettings";
import ShowCoupon from "../InnerPages/FrontEndSide/Coupon/ShowCoupon";
import AddCoupon from "../InnerPages/FrontEndSide/Coupon/AddCoupon";
import EditCoupon from "../InnerPages/FrontEndSide/Coupon/EditCoupon";
import EditOrder from "../InnerPages/FrontEndSide/Order/EditOrder";

import DashBoard from "./DashBoard";
import ShowReview from "../InnerPages/FrontEndSide/Review/ShowReview";
import AddProductBanner from "../InnerPages/BackEndSide/Product_Banner/AddProductBanner";
import ShowProductBanner from "../InnerPages/BackEndSide/Product_Banner/ShowProductBanner";
import EditProductBanner from "../InnerPages/BackEndSide/Product_Banner/EditProductBanner";
import ShowLowStockProducts from "../InnerPages/BackEndSide/Product/ShowLowStockProduct";
import ShowProductNotify from "../InnerPages/BackEndSide/Product_Notify/ShowProductNotify";
import ShowNewsletter from "../InnerPages/BackEndSide/Notification/ShowNewsletter";
import axios from "axios";
import NotAdminPage from "../AuthenticationPages/NotAdminPage";
import ShowSubAdmin from "../InnerPages/BackEndSide/SubAdmin/ShowSubAdmin";
import ShowPopBanner from "../InnerPages/BackEndSide/Banner_popup/ShowPopBanner";
import AddPopBanner from "../InnerPages/BackEndSide/Banner_popup/AddPopBanner";
import EditPopBanner from "../InnerPages/BackEndSide/Banner_popup/EditPopBanner";
import AddMarquee from "../SettingsPages/marquee";
import CreateNewOrder from "../InnerPages/FrontEndSide/Order/CreateOrder";
import AddProduct from "../InnerPages/BackEndSide/Product/AddProduct";
import MetalMaster from "../InnerPages/BackEndSide/Master_Data/MetalMaster";
import DiamondMaster from "../InnerPages/BackEndSide/Master_Data/DiamondMaster";
import AddEditDiamondPricing from "../InnerPages/BackEndSide/Master_Data/AddEditDiamond";


let url = process.env.REACT_APP_API_URL;

const HomePage = () => {
  const [userRole, setUserRole] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    let adminToken = localStorage.getItem("token");
    async function checkAdmin() {
      try {
        const res = await axios.get(`${url}/auth/userName`, {
          headers: {
            Authorization: `${adminToken}`,
          },
        });
        if (res?.data?.type === "success") {
          const userRoleFromServer = "admin";
          setUserRole(userRoleFromServer);
          setIsAdmin(true);
        }
      } catch (error) {
        console.log(error);
      }
    }

    checkAdmin();
  }, []);

  return (
    <>
      <div id="layout-wrapper">
        <Header />
        <LeftSide />
      </div>
      <RightSide />

      <Routes>
        <Route exact path="/addMarquee" element={<AddMarquee />} />
        {/* Banner */}
        <Route exact path="/addBanner" element={<AddBanner />} />
        <Route exact path="/showBanner" element={<ShowBanner />} />

        <Route exact path="/showPopBanner" element={<ShowPopBanner />} />
        <Route exact path="/addPopBanner" element={<AddPopBanner />} />
        <Route exact path="/editPopBanner" element={<EditPopBanner />} />

        <Route exact path="/editBanner" element={<EditBanner />} />
        <Route exact path="/addProductBanner" element={<AddProductBanner />} />
        <Route
          exact
          path="/showProductBanner"
          element={<ShowProductBanner />}
        />
        <Route
          exact
          path="/editProductBanner"
          element={<EditProductBanner />}
        />

        {/* Category */}
        <Route exact path="/addCategory" element={<AddCategory />} />
        <Route exact path="/showCategory" element={<ShowCategory />} />
        <Route exact path="/editCategory" element={<EditCategory />} />

        {/* Data (Specification) */}
        <Route exact path="/addSpecification" element={<AddData />} />
        <Route exact path="/showSpecification" element={<ShowData />} />
        <Route exact path="/editSpecification" element={<EditData />} />

        {/* Product */}
        <Route exact path="/addProduct" element={<AddProduct />} />
        <Route exact path="/showProduct" element={<ShowProduct />} />
        <Route exact path="/editProduct" element={<EditProduct />} />
        <Route
          exact
          path="/showLowStockProduct"
          element={<ShowLowStockProducts />}
        />
        <Route
          exact
          path="/showProductNotify"
          element={<ShowProductNotify />}
        />

        {/* Variation */}
        <Route exact path="/showVariation" element={<ShowVariation />} />
        <Route
          exact
          path="/showVariationSize"
          element={<ShowVariationSize />}
        />

        {/* User */}
        <Route exact path="/showUser" element={<ShowUser />} />
        <Route exact path="/editUser" element={<EditUser />} />

        {/* Order */}
        <Route exact path="/showOrders" element={<ShowOrder />} />
        <Route exact path="/editOrders" element={<EditOrder />} />
        <Route exact path="/newOrder" element={<CreateNewOrder />} />

        {/* Settings */}
        <Route
          exact
          path="/addChargesSettings"
          element={<AddChargesSettings />}
        />

        <Route
          exact
          path="/generalSettings"
          element={<GeneralSettingsMain />}
        />
        <Route exact path="/pageSettings" element={<PageSettings />} />

        {/* Coupon */}
        <Route exact path="/showCoupon" element={<ShowCoupon />} />
        <Route exact path="/addCoupon" element={<AddCoupon />} />
        <Route exact path="/editCoupon" element={<EditCoupon />} />

        {/* DashBoard */}
        <Route exact path="/" element={<DashBoard />} />

        {/* Review */}
        <Route exact path="/showReview" element={<ShowReview />} />

        {/* Notification */}
        <Route exact path="/showNewsletter" element={<ShowNewsletter />} />

        {/* product master data */}
        <Route exact path="/manageMetal" element={<MetalMaster />} />
        <Route exact path="/manageDiamond" element={<DiamondMaster />} />
        <Route exact path="/addDiamond" element={<AddEditDiamondPricing />} />


        {/* Sub Admins */}
        {isAdmin ? (
          <Route exact path="/showSubAdmin" element={<ShowSubAdmin />} />
        ) : (
          <Route exact path="/showSubAdmin" element={<NotAdminPage />} />
        )}
      </Routes>
    </>
  );
};

export default HomePage;
