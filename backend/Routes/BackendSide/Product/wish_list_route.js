const express = require("express");
const route = express.Router();
const Wishlist = require("../../../Models/FrontendSide/wish_list_model");
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
    const wishlistItems = await Wishlist.find({ user: userId })
      .populate({
        path: "product",
        populate: [
          { path: "Category" },
          { path: "Brand_Name" },
          { path: "Collections" },
          {
            path: "Variation",
            select: "Variation_Name Variation_Size Variation_Images"
          }
        ]
      })
      .sort({ createdAt: -1 })
      .lean();

    if (wishlistItems.length <= 0) {
      return res.status(200).json({
        type: "error",
        message: "User wishlist not found!",
        wishlist: [],
      });
    }

    // Extract the product details from the wishlist items
    const wishlistProducts = wishlistItems
      .filter(item => item?.product)
      .map(item => {

        const product = item.product; // ✅ FIXED

        const firstVariation = product?.Variation?.[0];
        const firstSize = firstVariation?.Variation_Size?.find(
          size => size.Size_Stock > 0
        );

        return {
          _id: product._id,
          Product_Name: product.Product_Name,

          Product_Image: firstVariation?.Variation_Images?.[0]
            ? `${process.env.IP_ADDRESS}/${firstVariation.Variation_Images[0].path.replace(/\\/g, "/")}`
            : product?.Product_Images?.[0]
              ? `${process.env.IP_ADDRESS}/${product.Product_Images[0].path.replace(/\\/g, "/")}`
              : null,

          Category: product.Category?.[0]?.Category_Name,
          CategoryId: product.Category?.[0]?._id,

          price: firstSize?.Size_Price || 0,
          stock: firstSize?.Size_Stock || 0,
          purity: firstSize?.Size_purity || null,

          variationId: firstVariation?._id,
          sizeId: firstSize?._id,

          isFavorite: true,
          ratings: 0
        };
      });

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
