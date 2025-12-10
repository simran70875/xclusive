const express = require('express');
const route = express.Router();
const User = require('../../../Models/FrontendSide/user_model')
const { Product, Variation } = require('../../../Models/BackendSide/product_model')
const Wishlist = require('../../../Models/FrontendSide/wish_list_model');
const checkAdminRole = require('../../../Middleware/adminMiddleWares')
const checkAdminOrRole1 = require('../../../Middleware/checkAdminOrRole1')
const checkAdminOrRole2 = require('../../../Middleware/checkAdminOrRole2')
const checkAdminOrRole3 = require('../../../Middleware/checkAdminOrRole3')
const checkAdminOrRole4 = require('../../../Middleware/checkAdminOrRole4')
const checkAdminOrRole5 = require('../../../Middleware/checkAdminOrRole5');
const { default: mongoose } = require('mongoose');

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

// get all product for particular category (mobile) 
route.get('/mob/get/productlist/:id', async (req, res) => {
    const categoryId = req.params.id;
    const userId = req?.query?.userId
    const productId = req?.query?.productId


    let user

    if (userId != "0") {
        user = await User.findById(userId);
    }

    try {
        let SimilarProducts = await Product.find({
            Category: { $in: [categoryId] },
            Product_Status: true,
            _id: { $ne: productId }
        })
            .limit(10)
            .populate('Category', 'Category_Name')
            .populate({
                path: 'Variation',
                select: '-__v',
            })
            .populate('Brand_Name', 'Data_Name')
            .populate('Collections', 'Data_Name')
            .sort({ createdAt: -1 })

        SimilarProducts = SimilarProducts?.filter((product) => product?._id?.toString() !== productId)

        // Randomly select products for "You May Also Like"
        let YouMayAlsoLike = await Product.aggregate([
            { $match: { Product_Status: true, _id: { $ne: [productId] } } },
            { $sample: { size: 10 } },
        ]);

        YouMayAlsoLike = YouMayAlsoLike?.filter((product) => product?._id?.toString() !== productId)

        let ResultSimilarProducts = []
        let ResultYouMayAlsoLike = []

        const userWishlist = await getWishList(userId);

        {
            ResultSimilarProducts = SimilarProducts.map(product => ({
                _id: product._id,
                Product_Name: product.Product_Name,
                SKU_Code: product.SKU_Code,
                Product_Image: `${process.env.IP_ADDRESS}/${product?.Product_Image?.path?.replace(/\\/g, '/')}`,
                Category: product.Category[0]?.Category_Name || "",
                Brand_Name: product?.Brand_Name?.Data_Name,
                Collections: product?.Collections?.Data_Name,


                Product_Dis_Price: (user?.User_Type === '0' || userId === "0"
                    ? (product.Product_Dis_Price)
                    : (user?.User_Type === '1' ? product.Gold_Price :
                        (user?.User_Type === '2' ? product.Silver_Price : product.PPO_Price))),

                Product_Ori_Price: (user?.User_Type === '0' || userId === "0" ? (product.Product_Ori_Price) : (product.Product_Dis_Price)),

                Max_Dis_Price: product.Max_Dis_Price,
                Gold_Price: product.Gold_Price,
                Silver_Price: product.Silver_Price,
                PPO_Price: product.PPO_Price,
                Description: product.Description,
                Product_Label: product.Product_Label,
                Popular_pick: product.Popular_pick,
                Trendy_collection: product.Trendy_collection,
                isFavorite: userId == "0" ? false : userWishlist?.includes(product._id?.toString())
            }));
        }

        {
            ResultYouMayAlsoLike = YouMayAlsoLike.map(product => ({
                _id: product._id,
                Product_Name: product.Product_Name,
                SKU_Code: product.SKU_Code,
                Product_Image: `${process.env.IP_ADDRESS}/${product?.Product_Image?.path?.replace(/\\/g, '/')}`,
                Category: product.Category[0]?.Category_Name || "",
                Brand_Name: product?.Brand_Name?.Data_Name,
                Collections: product?.Collections?.Data_Name,


                Product_Dis_Price: (user?.User_Type === '0' || userId === "0"
                    ? (product.Product_Dis_Price)
                    : (user?.User_Type === '1' ? product.Gold_Price :
                        (user?.User_Type === '2' ? product.Silver_Price : product.PPO_Price))),

                Product_Ori_Price: (user?.User_Type === '0' || userId === "0"
                    ? (product.Product_Ori_Price) : (product.Product_Dis_Price)),

                Max_Dis_Price: product.Max_Dis_Price,
                Gold_Price: product.Gold_Price,
                Silver_Price: product.Silver_Price,
                PPO_Price: product.PPO_Price,
                Description: product.Description,
                Product_Label: product.Product_Label,
                Popular_pick: product.Popular_pick,
                Trendy_collection: product.Trendy_collection,
                isFavorite: userId == "0" ? false : userWishlist?.includes(product._id?.toString())
            }));
        }
        res.status(200).json({ type: 'success', message: 'Products found successfully!', YouMayAlsoLike: ResultYouMayAlsoLike || [], SimilarProducts: ResultSimilarProducts || [] });

    } catch (error) {
        res.status(500).json({ type: 'error', message: 'Server Error!', errorMessage: error });
        console.log(error)
    }
});


module.exports = route
