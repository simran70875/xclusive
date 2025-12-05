const express = require('express');
const route = express.Router();
const multer = require('multer');
const { Product, Variation } = require('../../../Models/BackendSide/product_model')
const User = require('../../../Models/FrontendSide/user_model')
const authMiddleWare = require('../../../Middleware/authMiddleWares')
const Wishlist = require('../../../Models/FrontendSide/wish_list_model');
const Review = require('../../../Models/FrontendSide/review_model')
const fs = require('fs');
const path = require('path')
const Data = require('../../../Models/BackendSide/data_model')


// get wishlist from wishlist Model
const getWishList = async (userId) => {
    try {
        if (userId != "0") {
            const wishList = await Wishlist.find({ user: userId }, 'product');
            return wishList.map((item) => item.product?.toString());
        }
        else {
            return []
        }
    } catch (error) {
        console.error(error);
        return [];
    }
};

// search by name product
route.get('/get', async (req, res) => {
    try {
        let { query, userId, page = "1", limit = 20 } = req.query;

        let user
        if (userId !== "0") {
            user = await User.findById(userId);
        }

        const skip = (page - 1) * limit;
        limit = parseInt(limit);

        // Construct a search query using regular expression to match Product_Name and other relevant fields
        // const searchQuery = {
        //     $or: [
        //         { Product_Name: { $regex: query, $options: 'i' } }, // Case-insensitive search
        //         { Description: { $regex: query, $options: 'i' } },
        //     ],
        // };

        const searchQuery = {
            $and: [
                {
                    $or: [
                        { Product_Name: { $regex: query, $options: 'i' } },
                        { Description: { $regex: query, $options: 'i' } },
                    ],
                },
                { Product_Status: true },
            ],
        };

        const products = await Product.find(searchQuery).skip(skip).limit(limit).sort({ createdAt: -1 })

        if (products.length <= 0) {
            return res.status(200).json({ type: 'success', message: 'Products not found!', products: [] });
        }

        const userWishlist = await getWishList(userId);

        if (products.length === 0) {
            return res.status(200).json({ type: 'warning', message: 'No products found for the given category!', products: [] });
        } else {
            const result = products.map(product => ({
                _id: product._id,
                Product_Name: product.Product_Name,
                SKU_Code: product.SKU_Code,
                Product_Image: `${process.env.IP_ADDRESS}/${product?.Product_Image?.path?.replace(/\\/g, '/')}`,
                Category: product.Category?.Category_Name,
                Brand_Name: product?.Brand_Name?.Data_Name,
                Fabric_Type: product?.Fabric_Type?.Data_Name,
                Occasions: product?.Occasions?.Data_Name,

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
                Ready_to_wear: product.Ready_to_wear,
                Popular_pick: product.Popular_pick,
                Trendy_collection: product.Trendy_collection,
                isFavorite: userWishlist.includes(product._id?.toString())
            }));


            const totalProducts = await Product.countDocuments(searchQuery);

            res.status(200).json({
                type: 'success', message: 'Products found successfully!', products: result || [],
                currentPage: page,
                totalPages: Math.ceil(totalProducts / limit)
            });
        }
    } catch (error) {
        res.status(500).json({ type: 'error', message: 'Server Error!', errorMessage: error });
        console.error(error);
    }
});


// filters products
route.get('/get/filterList', async (req, res) => {
    try {
        const allData = await Data.find().lean();
        const colorsData = [
            "RED", "YELLOW", "BLUE", "BLACK", "ORANGE", "WHITE", "PURPLE", "PINK",
            "BROWN", "MAROON", "MAGENTA", "GOLD", "MUSTARD", "LEMON", "BEIGE", "SILVER",
            "CREAM", "GREEN", "GRAY", "NAVY BLUE", "VIOLET", "INDIGO", "LIME", "OLIVE",
            "AQUA", "TURQUOISE"
        ];
        const rate = ["below 999", "1000-1500", "1500-2500", "2500 onwards"];
        const shipping = ["READY TO SHIP", "PRE LAUNCH"];
        const sortBy = [
            'relevance',
            'price-low-to-high',
            'price-high-to-low',
            'new-arrival'
        ]

        const groupedData = {
            occasion: [],
            brand: [],
            fabric: [],
            colors: colorsData,
            rate: rate,
            shipping: shipping,
            sortBy: sortBy
        };

        allData.forEach(item => {
            const { _id, Data_Type, Data_Name, Data_Status } = item;
            if (Data_Type === 'OCCASIONS' && Data_Status === true) {
                groupedData.occasion.push(Data_Name.toUpperCase());
            } else if (Data_Type === 'Brand Name' && Data_Status === true) {
                // groupedData.brand.push({ _id, Data_Name, Data_Status });
                groupedData.brand.push(Data_Name.toUpperCase())
            } else if (Data_Type === 'FABRIC TYPE' && Data_Status === true) {
                groupedData.fabric.push(Data_Name.toUpperCase());
            }
        });

        res.status(200).json({ type: 'success', message: 'Data found successfully!', data: groupedData });

    } catch (error) {
        res.status(500).json({ type: 'error', message: 'Server Error!', errorMessage: error });
        console.error(error);
    }
});

// filter
// route.get('/filter/get/products', async (req, res) => {
//     try {
//         const { brands, fabric, occasion, color, rate, shipping, page, limit } = req.query;

//         const filters = {};

//         if (brands) {
//             const brandObjectIds = await Data.find({ Data_Type: "Brand Name", Data_Name: { $in: brands } }).distinct('_id');
//             filters['Brand_Name'] = { $in: brandObjectIds };
//             console.log(brandObjectIds)
//         }
//         if (fabric) {
//             const fabricObjectIds = await Data.find({ Data_Type: "FABRIC TYPE", Data_Name: { $in: fabric } }).distinct('_id');
//             filters['Fabric_Type'] = { $in: fabricObjectIds };
//         }
//         if (occasion) {
//             const occasionObjectIds = await Data.find({ Data_Type: "OCCASIONS", Data_Name: { $in: occasion } }).distinct('_id');
//             filters['Occasions'] = { $in: occasionObjectIds };
//         }

//         // ... similar approach for other filters (color, rate, shipping)

//         const products = await Product.find(filters)
//             .populate('Brand_Name')
//             .populate('Fabric_Type')
//             .populate('Occasions')
//             .sort({ createdAt: -1 })
//             .skip((page - 1) * limit)
//             .limit(limit)
//             .lean();

//         res.status(200).json({ type: 'success', message: 'Products found successfully!', data: products });

//     } catch (error) {
//         res.status(500).json({ type: 'error', message: 'Server Error!', errorMessage: error });
//         console.error(error);
//     }
// });

route.get('/filter/get/products', async (req, res) => {

    try {
        const { categoryId, brands, fabric, occasion, color, rate, shipping, page = "1", limit = 20, userId, sortBy } = req.query;

        let user
        if (userId !== "0") {
            user = await User.findById(userId);
        }
        const filters = {};

        if (categoryId) {
            filters['Category'] = categoryId;
        }

        if (brands) {
            const brandNamesArray = brands.split(',');
            const regexColorNames = brandNamesArray.map(name => new RegExp(name, 'i'));
            const brandObjectIds = await Data.find({ Data_Type: "Brand Name", Data_Name: { $in: regexColorNames } }).distinct('_id');
            filters['Brand_Name'] = { $in: brandObjectIds };
        }
        if (fabric) {
            const fabricNamesArray = fabric.split(',');
            const regexColorNames = fabricNamesArray.map(name => new RegExp(name, 'i'));
            const fabricObjectIds = await Data.find({ Data_Type: "FABRIC TYPE", Data_Name: { $in: regexColorNames } }).distinct('_id');
            filters['Fabric_Type'] = { $in: fabricObjectIds };
        }
        if (occasion) {
            const occasionNamesArray = occasion.split(',');
            const regexColorNames = occasionNamesArray.map(name => new RegExp(name, 'i'));
            const occasionObjectIds = await Data.find({ Data_Type: "OCCASIONS", Data_Name: { $in: regexColorNames } }).distinct('_id');
            filters['Occasions'] = { $in: occasionObjectIds };
        }

        if (color) {
            const colorNamesArray = color.split(',');
            const regexColorNames = colorNamesArray.map(name => new RegExp(name, 'i'));
            const variationObjectIds = await Variation.find({
                Variation_Name: { $in: regexColorNames }
            }).distinct('_id');

            // Use the found variation object IDs to filter products
            filters['Variation'] = { $in: variationObjectIds };
        }
        if (rate) {
            const rateRanges = {
                'below 999': { $lte: 999 },
                '1000-1500': { $gte: 1000, $lte: 1500 },
                '1500-2500': { $gte: 1500, $lte: 2500 },
                '2500 onwards': { $gte: 2500 }
            };
            if (user?.User_Type === '0' || userId === "0") {
                filters['Product_Dis_Price'] = rateRanges[rate];
            }
            else if (user?.User_Type === '1') {
                filters['Gold_Price'] = rateRanges[rate];
            }
            else if (user?.User_Type === '2') {
                filters['Silver_Price'] = rateRanges[rate];
            }
            else if (user?.User_Type === '3') {
                filters['PPO_Price'] = rateRanges[rate];
            }
        }
        if (shipping) {
            filters['Shipping'] = shipping;
        }

        const userWishlist = await getWishList(userId);

        const sortOptions = {
            relevance: {}, // Default sort
            'price-low-to-high': { 'Product_Dis_Price': 1 },
            'price-high-to-low': { 'Product_Dis_Price': -1 },
            'new-arrival': { 'createdAt': -1 }
        };


        switch (user?.User_Type) {
            case '0': // Regular user
                sortOptions['price-low-to-high'] = { 'Product_Dis_Price': 1 };
                sortOptions['price-high-to-low'] = { 'Product_Dis_Price': -1 };
                break;
            case '1': // Gold user
                sortOptions['price-low-to-high'] = { 'Gold_Price': 1 };
                sortOptions['price-high-to-low'] = { 'Gold_Price': -1 };
                break;
            case '2': // Silver user
                sortOptions['price-low-to-high'] = { 'Silver_Price': 1 };
                sortOptions['price-high-to-low'] = { 'Silver_Price': -1 };
                break;
            case '3': // PPO user
                sortOptions['price-low-to-high'] = { 'PPO_Price': 1 };
                sortOptions['price-high-to-low'] = { 'PPO_Price': -1 };
                break;
        }

        const sortingCriteria = sortOptions[sortBy] || sortOptions['relevance'];

        filters['Product_Status'] = true;

        const products = await Product.find(filters)
            .populate('Brand_Name')
            .populate('Fabric_Type')
            .populate('Occasions')
            // .sort(sortOptions[sortBy] || sortOptions['relevance'])
            .sort(sortingCriteria)
            .skip((page - 1) * limit)
            .limit(limit)
            .lean()
            .sort({ createdAt: -1 })

        if (products.length <= 0) {
            return res.status(200).json({ type: 'success', message: 'Products not found!', products: [] });
        } else {
            const result = products.map(product => ({
                _id: product._id,
                Product_Name: product.Product_Name,
                SKU_Code: product.SKU_Code,
                Product_Image: `${process.env.IP_ADDRESS}/${product?.Product_Image?.path?.replace(/\\/g, '/')}`,
                Category: product.Category?.Category_Name,
                Brand_Name: product?.Brand_Name?.Data_Name,
                Fabric_Type: product?.Fabric_Type?.Data_Name,
                Occasions: product?.Occasions?.Data_Name,

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
                Ready_to_wear: product.Ready_to_wear,
                Popular_pick: product.Popular_pick,
                Trendy_collection: product.Trendy_collection,
                Shipping: product.Shipping,
                isFavorite: userWishlist.includes(product._id?.toString())
            }));


            const totalProducts = await Product.countDocuments(filters);

            res.status(200).json({
                type: 'success', message: 'Products found successfully!',
                products: result,
                currentPage: page,
                totalPages: Math.ceil(totalProducts / limit)
            });
        }


    } catch (error) {
        res.status(500).json({ type: 'error', message: 'Server Error!', errorMessage: error });
        console.error(error);
    }
});


module.exports = route
