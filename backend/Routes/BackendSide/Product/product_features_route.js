const express = require('express');
const route = express.Router();
const User = require('../../../Models/FrontendSide/user_model')
const { Product } = require('../../../Models/BackendSide/product_model')
const Wishlist = require('../../../Models/FrontendSide/wish_list_model');

// get wishlist from wishlist Model
const getWishList = async (userId) => {
    try {
        if (userId != "0") {
            const wishList = await Wishlist.find({ user: userId }, 'product');
            return wishList.map((item) => item.product?.toString());
        }
    } catch (error) {
        console.error(error);
        return [];
    }
};

// GET SIMILAR & YOU MAY ALSO LIKE PRODUCTS (MOBILE)
route.get('/mob/get/productlist/:id', async (req, res) => {
  try {
    const categoryId = req.params.id;
    const { userId, productId } = req.query;

    let user = null;
    if (userId && userId !== "0") {
      user = await User.findById(userId);
    }

    const userWishlist = userId ? await getWishList(userId) : [];

    // ------------------ SIMILAR PRODUCTS ------------------
    const similarProducts = await Product.find({
      Category: { $in: [categoryId] },
      Product_Status: true,
      _id: { $ne: productId },
    })
      .populate("Category", "Category_Name")
      .populate("Brand_Name", "Data_Name")
      .populate("Collections", "Data_Name")
      .populate("Variation")
      .sort({ createdAt: -1 })
      .limit(10);

    const formatProduct = (product) => {
      const firstVariation = product.Variation?.[0];
      const firstSize = firstVariation?.Variation_Size?.[0];

      return {
        _id: product._id,
        Product_Name: product.Product_Name,
        Description: product.Description,

        Category: product.Category?.[0]?.Category_Name || null,
        categoryId: product.Category?.[0]?._id || null,

        Brand_Name: product.Brand_Name?.Data_Name || null,
        Collections: product.Collections?.Data_Name || null,

        // MAIN IMAGE
        Product_Image: firstVariation?.Variation_Images?.[0]?.path
          ? `${process.env.IP_ADDRESS}/${firstVariation.Variation_Images[0].path.replace(/\\/g, "/")}`
          : null,

        // PRICE DATA
        price: firstSize?.Size_Price || 0,
        purity: firstSize?.Size_Purity || null,
        size: firstSize?.Size_Name || null,

        Variations: product.Variation.map((v) => ({
          _id: v._id,
          Variation_Name: v.Variation_Name,
          Variation_Label: v.Variation_Label,
          Variation_Status: v.Variation_Status,

          Variation_Images: v.Variation_Images.map((img) => ({
            url: `${process.env.IP_ADDRESS}/${img.path.replace(/\\/g, "/")}`,
          })),

          Sizes: v.Variation_Size.map((s) => ({
            Size_Name: s.Size_Name,
            Size_Price: s.Size_Price,
            Size_Stock: s.Size_Stock,
            Size_Purity: s.Size_purity,
            Size_Status: s.Size_Status,
          })),
        })),

        isFavorite: userWishlist.includes(product._id.toString()),
      };
    };

    // Format both lists
    const SimilarProducts = similarProducts.map(formatProduct);

    // ------------------ YOU MAY ALSO LIKE ------------------
    const youMayAlsoLikeRaw = await Product.aggregate([
      { $match: { Product_Status: true, _id: { $ne: productId } } },
      { $sample: { size: 10 } },
    ]);

    const populatedYouMayAlsoLike = await Product.populate(youMayAlsoLikeRaw, [
      { path: "Category", select: "Category_Name" },
      { path: "Brand_Name", select: "Data_Name" },
      { path: "Collections", select: "Data_Name" },
      { path: "Variation" },
    ]);

    const YouMayAlsoLike = populatedYouMayAlsoLike.map(formatProduct);

    return res.status(200).json({
      type: "success",
      message: "Products fetched successfully",
      SimilarProducts,
      YouMayAlsoLike,
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({
      type: "error",
      message: "Server Error",
      error: error.message,
    });
  }
});


module.exports = route
