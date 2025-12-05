const express = require("express");
const app = express();
const {
  CategoryRoute,
  BannerRoute,
  ProductBannerRoute,
  ProductRoute,
  VariationRoute,
  NotifyRoute,
  DataRoute,
  UserRoute,
  CartRoute,
  ChargesRoute,
  ProductFeaturesRoute,
  AddressRoute,
  WishList,
  OrderRoute,
  ResellerRoute,
  MemberShipRoute,
  MemberShipHistoryRoute,
  WalletRoute,
  CouponRoute,
  SettingsRoute,
  ReviewRoute,
  CoinsRoute,
  SearchRoute,
  AdminRoute,
  SubAdminRoute,
  AuthRoute,
  NotificationRoute,
} = require("../routes.js");

const Paths = () => {
  app.use("/category", CategoryRoute);
  app.use("/banner", BannerRoute);
  app.use("/product/banner", ProductBannerRoute);
  app.use("/product", ProductRoute);
  app.use("/product/variation", VariationRoute);
  app.use("/product/notify", NotifyRoute);
  app.use("/data", DataRoute);
  app.use("/user", UserRoute);
  app.use("/cart", CartRoute);
  app.use("/charges", ChargesRoute);
  app.use("/feature/product", ProductFeaturesRoute);
  app.use("/address", AddressRoute);
  app.use("/wishlist", WishList);
  app.use("/order", OrderRoute);
  app.use("/reseller", ResellerRoute);
  app.use("/memberShip", MemberShipRoute);
  app.use("/memberShip/history", MemberShipHistoryRoute);
  app.use("/wallet/history", WalletRoute);
  app.use("/coupon", CouponRoute);
  app.use("/app/settings", SettingsRoute);
  app.use("/review", ReviewRoute);
  app.use("/coins/history", CoinsRoute);
  app.use("/search", SearchRoute);
  app.use("/admin", AdminRoute);
  app.use("/subAdmin", SubAdminRoute);
  app.use("/auth", AuthRoute);
  app.use("/notification", NotificationRoute);
};

module.exports = Paths;
