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
      const { _id, Data_Name, Data_Status } = item;
      if (Data_Status === true) {
        groupedData.brand.push({ _id, Data_Name, Data_Status })
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
      sortBy,
      userId
    } = req.query;

    const filters = { Product_Status: true };
    let variationFilter = {};

    const isValid = (val) => val && val !== 'null' && val !== '';


    /* ================= CATEGORY ================= */
    if (isValid(categoryId)) {
      const categoryArr = categoryId.split(','); // ✅ MULTIPLE
      filters.Category = { $in: categoryArr };
    }

    /* ================= BRAND ================= */
    if (isValid(brands)) {
      const ids = brands.split(','); // can be brand IDs OR collection IDs

      filters.$or = [
        { Brand_Name: { $in: ids } },
        { Collections: { $in: ids } }
      ];
    }

    /* ================= COLOR ================= */
    if (isValid(color)) {
      const colorArr = color.split(',');

      const variationIds = await Variation.find({
        Variation_Name: { $in: colorArr },
        Variation_Status: true
      }).distinct('_id');

      filters.Variation = { $in: variationIds };
      variationFilter._id = { $in: variationIds };
    }

    /* ================= PRICE ================= */
    if (isValid(rate)) {
      const rateRanges = {
        'below 999': { $lte: 999 },
        '1000-1500': { $gte: 1000, $lte: 1500 },
        '1500-2500': { $gte: 1500, $lte: 2500 },
        '2500 onwards': { $gte: 2500 }
      };

      variationFilter.Variation_Size = {
        $elemMatch: {
          Size_Price: rateRanges[rate],
          Size_Status: true
        }
      };
    }

    /* ================= SORT ================= */
    const sortMap = {
      'new-arrival': { createdAt: -1 }
    };

    const sortingCriteria = sortMap[sortBy] || { createdAt: -1 };

    /* ================= USER WISHLIST ================= */
    const userWishlist = userId
      ? await Wishlist.find({ User: userId }).distinct('Product')
      : [];

    /* ================= QUERY ================= */
    const products = await Product.find(filters)
      .populate('Category')
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



    /* ================= RESPONSE ================= */
    const result = products.map(product => {
      const firstVariation = product?.Variation?.[0];
      const firstSize = firstVariation?.Variation_Size?.find(
        size => size.Size_Stock > 0
      );

      return {
        _id: product._id,
        Product_Name: product.Product_Name,
        SKU_Code: product.SKU_Code,

        Product_Image: firstVariation?.Variation_Images?.[0]
          ? `${process.env.IP_ADDRESS}/${firstVariation.Variation_Images[0].path.replace(/\\/g, '/')}`
          : product?.Product_Images?.[0]
            ? `${process.env.IP_ADDRESS}/${product.Product_Images[0].path.replace(/\\/g, '/')}`
            : null,

        Category: product.Category?.[0]?.Category_Name,
        CategoryId: product.Category?.[0]?._id,

        Brand_Name: product?.Brand_Name?.Data_Name,
        Collections: product?.Collections?.Data_Name,

        // ✅ DIRECT PRICE (used by ProductCard)
        price: firstSize?.Size_Price || 0,
        stock: firstSize?.Size_Stock || 0,
        purity: firstSize?.Size_purity || null,

        // ✅ Optional (quick product detail navigation)
        variationId: firstVariation?._id,
        sizeId: firstSize?._id,

        Popular_pick: product.Popular_pick,
        HomePage: product.HomePage,
        Trendy_collection: product.Trendy_collection,

        isFavorite: userWishlist.includes(product._id.toString()),
        ratings: 0
      };
    });


    res.status(200).json({
      type: 'success',
      products: result,
      currentPage: Number(page),
      totalPages: Math.ceil(result.length / limit)
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
