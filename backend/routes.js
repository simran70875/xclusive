// routes.js
const express = require("express");
const route = express.Router();

const MarqueeRouter = require("./Routes/BackendSide/marquee.js");
const CategoryRoute = require("./Routes/BackendSide/Category/category_route");
const BannerRoute = require("./Routes/BackendSide/Banner/banner_route");
const ProductBannerRoute = require("./Routes/BackendSide/Banner/product_banner_route");
const PopUpBannerRoute = require("./Routes/BackendSide/Banner/popup_banner_route.js");
const ProductRoute = require("./Routes/BackendSide/Product/product_route");
const NotifyRoute = require("./Routes/BackendSide/Product/notify_route");
const VariationRoute = require("./Routes/BackendSide/Product/variation_route");
const DataRoute = require("./Routes/BackendSide/Data/data_route");
const UserRoute = require("./Routes/FrontendSide/User/users_route");
const CartRoute = require("./Routes/FrontendSide/Cart/cart_route");
const ChargesRoute = require("./Routes/Settings/Charges/add_charges_route");
const ProductFeaturesRoute = require("./Routes/BackendSide/Product/product_features_route");
const AddressRoute = require("./Routes/FrontendSide/User/address_route");
const WishList = require("./Routes/BackendSide/Product/wish_list_route");
const OrderRoute = require("./Routes/FrontendSide/Order/order_route");
const ResellerRoute = require("./Routes/FrontendSide/User/reseller_route");
const SettingsRoute = require("./Routes/Settings/General/general_settings_route");
const ReviewRoute = require("./Routes/FrontendSide/Review/review_route");
const SearchRoute = require("./Routes/BackendSide/Product/search_route");
const AdminRoute = require("./Routes/Admin/admin_route");
const SubAdminRoute = require("./Routes/Admin/subAdmin_route");
const AuthRoute = require("./Routes/Admin/auth_route");
const NotificationRoute = require("./Routes/FrontendSide/Notification/notification_route");
const NewsletterRoute = require("./Routes/FrontendSide/Newsletter/newsletter_route");
const couporonRoute = require("./Routes/FrontendSide/Coupon/coupon_route")

route.use(""  , MarqueeRouter)
route.use("/category", CategoryRoute);
route.use("/banner", BannerRoute);
route.use("/product/banner", ProductBannerRoute);
route.use("/popup/banner", PopUpBannerRoute);
route.use("/product", ProductRoute);
route.use("/product/variation", VariationRoute);
route.use("/product/notify", NotifyRoute);
route.use("/data", DataRoute);
route.use("/user", UserRoute);
route.use("/cart", CartRoute);
route.use("/charges", ChargesRoute);
route.use("/feature/product", ProductFeaturesRoute);
route.use("/address", AddressRoute);
route.use("/wishlist", WishList);
route.use("/order", OrderRoute);
route.use("/reseller", ResellerRoute);
route.use("/app/settings", SettingsRoute);
route.use("/review", ReviewRoute);
route.use("/search", SearchRoute);
route.use("/admin", AdminRoute);
route.use("/subAdmin", SubAdminRoute);
route.use("/auth", AuthRoute);
route.use("/notification", NotificationRoute);
route.use("/newsletter", NewsletterRoute);
route.use("/coupon", couporonRoute);

module.exports = route;
