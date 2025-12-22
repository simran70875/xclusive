const express = require('express');
const route = express.Router();
const { Product, Variation } = require('../../../Models/BackendSide/product_model')
const User = require('../../../Models/FrontendSide/user_model')
const Wishlist = require('../../../Models/FrontendSide/wish_list_model');
const Data = require('../../../Models/BackendSide/data_model');
const category_model = require('../../../Models/BackendSide/category_model');


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
    const allCats = await category_model.find({ Category_Status: true }).lean();

    const colorsData = ["White Gold", "Yellow Gold", "Rose Gold"];
    const rate = ["below 999", "1000-1500", "1500-2500", "2500 onwards"];
    const sortBy = [
      'relevance',
      'price-low-to-high',
      'price-high-to-low',
      'new-arrival'
    ]

    const groupedData = {
      brand: [],
      categories: [],
      colors: colorsData,
      rate: rate,
      sortBy: sortBy
    };

    allData.forEach(item => {
      const { Data_Name, Data_Status } = item;
      if (Data_Status === true) {
        groupedData.brand.push(Data_Name.toUpperCase())
      }
    });

    allCats.forEach(item => {
      const { _id, Category_Name, Parent_Category } = item;
      groupedData.categories.push({ _id, Category_Name, Parent_Category })
    })

    res.status(200).json({ type: 'success', message: 'Data found successfully!', data: groupedData });

  } catch (error) {
    res.status(500).json({ type: 'error', message: 'Server Error!', errorMessage: error });
    console.error(error);
  }
});

route.get('/filter/get/products', async (req, res) => {
  try {
    const {
      categoryId,
      brands,
      color,
      rate,
      page = 1,
      limit = 20,
      sortBy
    } = req.query;

    const filters = { Product_Status: true };


    console.log(categoryId)


    /* ================= CATEGORY (ARRAY) ================= */
    if (categoryId) {
      filters.Category = { $in: [categoryId] };
    }

    /* ================= BRAND ================= */
    if (brands) {
      const brandArr = brands.split(',');
      const brandIds = await Data.find({
        Data_Name: { $elemMatch: { $in: brandArr } }
      }).distinct('_id');

      filters.Brand_Name = { $in: brandIds };
    }

    /* ================= COLOR (VARIATION NAME) ================= */
    let variationFilter = {};

    if (color) {
      const colorArr = color.split(',');
      const variationIds = await Variation.find({
        Variation_Name: { $in: colorArr },
        Variation_Status: true
      }).distinct('_id');

      variationFilter._id = { $in: variationIds };
      filters.Variation = { $in: variationIds };
    }

    /* ================= PRICE (VARIATION SIZE PRICE) ================= */
    if (rate) {
      const rateRanges = {
        'below 999': { $lte: 999 },
        '1000-1500': { $gte: 1000, $lte: 1500 },
        '1500-2500': { $gte: 1500, $lte: 2500 },
        '2500 onwards': { $gte: 2500 }
      };

      variationFilter['Variation_Size'] = {
        $elemMatch: {
          Size_Price: rateRanges[rate],
          Size_Status: true
        }
      };
    }

    /* ================= SORT ================= */
    const sortMap = {
      'price-low-to-high': { 'Variation_Size.Size_Price': 1 },
      'price-high-to-low': { 'Variation_Size.Size_Price': -1 },
      'new-arrival': { createdAt: -1 }
    };

    const sortingCriteria = sortMap[sortBy] || { createdAt: -1 };

    /* ================= QUERY ================= */
    const products = await Product.find(filters)
      .populate('Brand_Name')
      .populate('Collections')
      .populate({
        path: 'Variation',
        match: variationFilter,
        select: 'Variation_Name Variation_Size Variation_Images'
      })
      .sort(sortingCriteria)
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .lean();

    /* ================= REMOVE PRODUCTS WITH NO MATCHING VARIATION ================= */
    const filteredProducts = products.filter(
      (p) => p.Variation && p.Variation.length > 0
    );

    const totalProducts = filteredProducts.length;

    if (!filteredProducts.length) {
      return res.status(200).json({
        type: 'success',
        products: [],
        totalPages: 0
      });
    }

    /* ================= RESPONSE ================= */
    const result = filteredProducts.map(product => {
      const firstVariation = product.Variation[0];
      const firstSize = firstVariation?.Variation_Size?.[0];

      return {
        _id: product._id,
        Product_Name: product.Product_Name,
        SKU_Code: product.SKU_Code,

        Product_Image: product.Product_Images?.[0]
          ? `${process.env.IP_ADDRESS}/${product.Product_Images[0].path.replace(/\\/g, '/')}`
          : null,

        Brand_Name: product.Brand_Name?.Data_Name?.[0],
        Collections: product.Collections?.Data_Name?.[0],

        Price: firstSize?.Size_Price || 0,
        Description: product.Description,
        Product_Label: product.Product_Label,
        Popular_pick: product.Popular_pick,
        Trendy_collection: product.Trendy_collection,
        Shipping: product.Shipping
      };
    });

    res.status(200).json({
      type: 'success',
      products: result,
      currentPage: Number(page),
      totalPages: Math.ceil(totalProducts / limit)
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({
      type: 'error',
      message: 'Server Error',
      errorMessage: error.message
    });
  }
});



module.exports = route
