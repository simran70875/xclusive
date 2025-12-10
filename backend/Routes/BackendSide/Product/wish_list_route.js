const express = require("express");
const route = express.Router();
const Wishlist = require("../../../Models/FrontendSide/wish_list_model");
const User = require("../../../Models/FrontendSide/user_model");
const authMiddleWare = require("../../../Middleware/authMiddleWares");
const adminMiddleWares = require("../../../Middleware/adminMiddleWares");

// Add and Remove product to wishlist
route.post("/addremove", authMiddleWare, async (req, res) => {
  const userId = req.user.userId;
  const { productId } = req.body;

  try {
    const existingWishlistItem = await Wishlist.findOne({
      user: userId,
      product: productId,
    });

    if (existingWishlistItem) {
      await Wishlist.findByIdAndDelete(existingWishlistItem._id);
      res.status(200).json({
        type: "success",
        message: "Product removed from wishlist successfully",
      });
    } else {
      const wishlistItem = new Wishlist({
        user: userId,
        product: productId,
      });

      await wishlistItem.save();
      res.status(200).json({
        type: "success",
        message: "Product added to wishlist successfully",
      });
    }
  } catch (error) {
    res
      .status(500)
      .json({ type: "error", message: "Server Error!", errorMessage: error });
  }
});

// Remove product from wishlist
route.delete("/remove/:prodcutId", authMiddleWare, async (req, res) => {
  const userId = req?.user?.userId;
  const productId = req?.params?.prodcutId;

  try {
    await Wishlist.findOneAndDelete({ user: userId, product: productId });
    res.status(200).json({
      type: "success",
      message: "Product removed from wishlist successfully",
    });
  } catch (error) {
    res
      .status(500)
      .json({ type: "error", message: "Server Error!", errorMessage: error });
    console.log(error);
  }
});

// Get user's wishlist
route.get("/get", authMiddleWare, async (req, res) => {
  const userId = req.user?.userId;

  try {
    const user = await User.findOne({ _id: userId });

    const wishlistItems = await Wishlist.find({ user: userId })
      .populate("product")
      .sort({ createdAt: -1 });

    if (wishlistItems.length <= 0) {
      return res.status(200).json({
        type: "error",
        message: "User wishlist not found!",
        wishlist: [],
      });
    }

    // Extract the product details from the wishlist items
    let wishlistProducts = wishlistItems
      .filter((item) => item?.product)
      .map((item) => ({
        // _id: item?._id,
        _id: item?.product?._id,
        Product_Name: item?.product.Product_Name,
        Product_Image: `${
          process.env.IP_ADDRESS
        }/${item?.product?.Product_Image?.path?.replace(/\\/g, "/")}`,
        Product_Dis_Price:
          user?.User_Type === "0" || userId === "0"
            ? item?.product?.Product_Dis_Price
            : user?.User_Type === "1"
            ? item?.product?.Gold_Price
            : user?.User_Type === "2"
            ? item?.product?.Silver_Price
            : item?.product?.PPO_Price,

        Product_Ori_Price:
          user?.User_Type === "0" || userId === "0"
            ? item?.product?.Product_Ori_Price
            : item?.product?.Product_Dis_Price,
        isFavorite: true,
      }));

    // console.log(wishlistProducts,"pro")

    res.status(200).json({
      type: "success",
      message: "User wishlist fetched successfully",
      wishlist: wishlistProducts,
      Count: wishlistProducts?.length || 0,
    });
  } catch (error) {
    res
      .status(500)
      .json({ type: "error", message: "Server Error!", errorMessage: error });
    console.log(error);
  }
});

// Delete users Wish List
route.delete("/delete", authMiddleWare, async (req, res) => {
  const userId = req.user.userId;

  try {
    const existingWishlistItems = await Wishlist.find({ user: userId });

    if (existingWishlistItems.length === 0) {
      return res.status(200).json({
        type: "warning",
        message: "No wishlist items found for the user",
      });
    }

    await Wishlist.deleteMany({ user: userId });
    res
      .status(200)
      .json({ type: "success", message: "User wishlist deleted successfully" });
  } catch (error) {
    res
      .status(500)
      .json({ type: "error", message: "Server Error!", errorMessage: error });
  }
});

// Delete all Wish List
route.delete("/delete/all", adminMiddleWares, async (req, res) => {
  try {
    await Wishlist.deleteMany();
    res
      .status(200)
      .json({ type: "success", message: "All wishlists deleted successfully" });
  } catch (error) {
    res
      .status(500)
      .json({ type: "error", message: "Server Error!", errorMessage: error });
  }
});

module.exports = route;
