const express = require("express");
const route = express.Router();
const multer = require("multer");
const {
  Product,
  Variation,
} = require("../../../Models/BackendSide/product_model");
const User = require("../../../Models/FrontendSide/user_model");
const authMiddleWare = require("../../../Middleware/authMiddleWares");
const Wishlist = require("../../../Models/FrontendSide/wish_list_model");
const Review = require("../../../Models/FrontendSide/review_model");
const fs = require("fs");
const path = require("path");
const { default: mongoose } = require("mongoose");
const checkAdminRole = require("../../../Middleware/adminMiddleWares");
const checkAdminOrRole1 = require("../../../Middleware/checkAdminOrRole1");
const checkAdminOrRole2 = require("../../../Middleware/checkAdminOrRole2");
const checkAdminOrRole4 = require("../../../Middleware/checkAdminOrRole4");
const checkAdminOrRole5 = require("../../../Middleware/checkAdminOrRole5");

// Set up multer middleware to handle file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./imageUploads/backend/product");
  },
  filename: function (req, file, cb) {
    cb(null, file?.originalname);
  },
});
const upload = multer({ storage: storage });

// Create Product
route.post(
  "/add",
  checkAdminOrRole2,
  upload.single("image"),
  async (req, res) => {
    try {
      const {
        Product_Name,
        SKU_Code,
        Category,
        Brand_Name,
        Fabric_Type,
        Occasions,
        Product_Dis_Price,
        Product_Ori_Price,
        Max_Dis_Price,
        Gold_Price,
        Silver_Price,
        PPO_Price,
        Description,
      } = req.body;

      const categoryIds = Category.split(",");

      // const existingProduct = await Product.findOne({
      //     $or: [
      //         { Product_Name: { $regex: `^${Product_Name}$`, $options: 'i' } },
      //         { Category: { $in: categoryIds } }
      //     ]
      // });

      const existingProduct = false;

      const existingProductCode = await Product.findOne({
        SKU_Code: { $regex: `^${SKU_Code}$`, $options: "i" },
      });

      if (existingProduct) {
        if (req.file) {
          fs.unlinkSync(req?.file?.path);
        }
        return res.status(202).json({
          type: "warning",
          message:
            "Product with the same Product_Name already exists for the selected Category.",
        });
      } else if (existingProductCode) {
        if (req.file) {
          fs.unlinkSync(req?.file?.path);
        }
        return res.status(202).json({
          type: "warning",
          message: "Product with the same SKU Code already exists.",
        });
      } else {
        const product = new Product({
          Product_Name: Product_Name,
          SKU_Code: SKU_Code,
          Category: categoryIds,
          Brand_Name: Brand_Name,
          Fabric_Type: Fabric_Type,
          Occasions: Occasions,
          Product_Dis_Price: Product_Dis_Price,
          Product_Ori_Price: Product_Ori_Price,
          Max_Dis_Price: Max_Dis_Price,
          Gold_Price: Gold_Price,
          Silver_Price: Silver_Price,
          PPO_Price: PPO_Price,
          Description: Description,
          Product_Label: Product_Name,
        });

        await product.save();

        if (req.file) {
          const originalFilename = req.file.originalname;
          const extension = originalFilename.substring(
            originalFilename.lastIndexOf(".")
          );
          const imageFilename = `${Product_Name.replace(
            /\s/g,
            "_"
          )}${extension}`;
          const imagePath = "imageUploads/backend/product/" + imageFilename;

          fs.renameSync(req?.file?.path, imagePath);

          const image = {
            filename: imageFilename,
            path: imagePath,
            originalname: originalFilename,
          };
          product.Product_Image = image;

          await product.save();
        }

        res.status(200).json({
          type: "success",
          message: "Product added successfully!",
          productId: product?._id,
        });
      }
    } catch (error) {
      if (req?.file) {
        fs.unlinkSync(req?.file?.path);
      }
      res
        .status(500)
        .json({ type: "error", message: "Server Error!", errorMessage: error });
      console.log(error);
    }
  }
);

// get all product
route.get("/get", async (req, res) => {
  try {
    const products = await Product.find()
      .sort({ createdAt: -1 })
      .populate({
        path: "Category",
        select: "Category_Name",
      })
      // .populate({
      //     path: 'Variation',
      //     select: '-__v',
      // })
      .populate({
        path: "Brand_Name",
        select: "Data_Name",
      })
      .populate({
        path: "Fabric_Type",
        select: "Data_Name",
      })
      .populate({
        path: "Occasions",
        select: "Data_Name",
      });

    if (products) {
      // for data table (admin)
      const adminProducts = products.map((product) => ({
        _id: product._id,
        Product_Name: product.Product_Name,
        SKU_Code: product.SKU_Code,
        Product_Image: `${
          process.env.IP_ADDRESS
        }/${product?.Product_Image?.path?.replace(/\\/g, "/")}`,
        // Product_Image: `${process.env.IP_ADDRESS}/${product?.Product_Image?.path?.replace(/\\/g, '/')}`,
        // Category: product?.Category?.map(category => ({
        //     _id: category?._id,
        //     Category_Name: category?.Category_Name,
        // })),
        // Category: {
        //     _id: firstCategory?._id,
        //     Category_Name: firstCategory?.Category_Name,
        // },
        Brand: {
          _id: product?.Brand_Name?._id,
          Brand_Name: product.Brand_Name?.Data_Name,
        },
        Fabric: {
          _id: product?.Fabric_Type?._id,
          Fabric_Type: product.Fabric_Type?.Data_Name,
        },
        Occasions: {
          _id: product?.Occasions?._id,
          Occasions: product.Occasions?.Data_Name,
        },
        Product_Dis_Price: product.Product_Dis_Price,
        Product_Ori_Price: product.Product_Ori_Price,
        Max_Dis_Price: product.Max_Dis_Price,
        Gold_Price: product.Gold_Price,
        Silver_Price: product.Silver_Price,
        PPO_Price: product.PPO_Price,
        // Description: product.Description,
        // Variation: product.Variation,
        // variation: product?.Variation?.map(variation => ({
        //     variation_Id: variation?._id,
        //     variation_Name: variation?.Variation_Name,
        //     variation_Sizes: variation?.Variation_Size?.map(variation => ({
        //         name: variation?.Size_Name,
        //         stock: variation?.Size_Stock
        //     })),
        //     variation_Images: variation?.Variation_Images?.map(variation => ({
        //         variation_Image: `${process.env.IP_ADDRESS}/${variation?.path?.replace(/\\/g, '/')}`
        //     })),
        //     variation_Status: variation?.Variation_Status
        // })),
        Variation_Count: product.Variation.length,
        Ready_to_wear: product.Ready_to_wear,
        Popular_pick: product.Popular_pick,
        Trendy_collection: product.Trendy_collection,
        HomePage: product.HomePage,
        Product_Status: product.Product_Status,
        Product_Label: product.Product_Label,
        Shipping: product?.Shipping,
        category: product.Category[0]?.Category_Name,
        brand: product.Brand_Name?.Data_Name,
        fabric: product.Fabric_Type?.Data_Name,
        occasions: product.Occasions?.Data_Name,
      }));

      const product = await Product.find({ Product_Status: true })
        .sort({ createdAt: -1 })
        .populate({
          path: "Category",
          select: "Category_Name",
        })
        // .populate({
        //     path: 'Variation',
        //     select: '-__v',
        // })
        .populate({
          path: "Brand_Name",
          select: "Data_Name",
        })
        .populate({
          path: "Fabric_Type",
          select: "Data_Name",
        })
        .populate({
          path: "Occasions",
          select: "Data_Name",
        });

      // for show frontend side
      let frontendProducts = [];
      if (product) {
        frontendProducts = product.map((product) => ({
          _id: product._id,
          Product_Name: product.Product_Name,
          SKU_Code: product.SKU_Code,
          // Product_Image: `${process.env.IP_ADDRESS}/${product?.Product_Image?.path?.replace(/\\/g, '/')}`,
          // Category: product.Category[0]?.Category_Name,
          // Brand_Name: product?.Brand_Name?.Data_Name,
          // Fabric_Type: product?.Fabric_Type?.Data_Name,
          // Occasions: product?.Occasions?.Data_Name,
          // Product_Dis_Price: product.Product_Dis_Price,
          // Product_Ori_Price: product.Product_Ori_Price,
          // Max_Dis_Price: product.Max_Dis_Price,
          // Gold_Price: product.Gold_Price,
          // Silver_Price: product.Silver_Price,
          // PPO_Price: product.PPO_Price,
          // Description: product.Description,
          Product_Label: product.Product_Label,
          // Variation_Count: product.Variation.length,
          // Variation: product.Variation,
          // Ready_to_wear: product.Ready_to_wear,
          // Popular_pick: product.Popular_pick,
          // HomePage: product.HomePage,
          // Trendy_collection: product.Trendy_collection,
        }));
      }

      res.json({
        type: "success",
        message: "Products found successfully!",
        product: adminProducts || [],
        product_data: frontendProducts || [],
      });
    } else {
      res.status(404).json({ type: "warning", message: "Products not found!" });
    }
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ type: "error", message: "Failed to fetch products" });
  }
});

// get all products or perform universal search
route.get("/list/getAll", async (req, res) => {
  try {
    let { page, limit, search } = req.query;

    page = page || 1;
    limit = limit || 10;

    const skip = (page - 1) * limit;

    let query = {};

    if (search) {
      const regexSearch = new RegExp(search, "i");
      query = {
        $or: [
          // { _id: search },
          { Product_Name: { $regex: regexSearch } },
          { SKU_Code: { $regex: regexSearch } },
          { "Brand_Name.Data_Name": { $regex: regexSearch } },
          { "Fabric_Type.Data_Name": { $regex: regexSearch } },
          { "Occasions.Data_Name": { $regex: regexSearch } },
          { "Category.Category_Name": { $regex: regexSearch } },
        ],
      };
    }

    const totalCount = await Product.countDocuments(query);

    const products = await Product.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit))
      .populate({
        path: "Category",
        select: "Category_Name",
      })
      .populate({
        path: "Brand_Name",
        select: "Data_Name",
      })
      .populate({
        path: "Fabric_Type",
        select: "Data_Name",
      })
      .populate({
        path: "Occasions",
        select: "Data_Name",
      });

    if (products) {
      // for data table (admin)
      const adminProducts = products.map((product) => ({
        _id: product._id,
        Product_Name: product.Product_Name,
        SKU_Code: product.SKU_Code,
        Product_Image: `http://${
          process.env.IP_ADDRESS
        }/${product?.Product_Image?.path?.replace(/\\/g, "/")}`,
        Brand: {
          _id: product?.Brand_Name?._id,
          Brand_Name: product.Brand_Name?.Data_Name,
        },
        Fabric: {
          _id: product?.Fabric_Type?._id,
          Fabric_Type: product.Fabric_Type?.Data_Name,
        },
        Occasions: {
          _id: product?.Occasions?._id,
          Occasions: product.Occasions?.Data_Name,
        },
        Product_Dis_Price: product.Product_Dis_Price,
        Product_Ori_Price: product.Product_Ori_Price,
        Max_Dis_Price: product.Max_Dis_Price,
        Gold_Price: product.Gold_Price,
        Silver_Price: product.Silver_Price,
        PPO_Price: product.PPO_Price,
        Variation_Count: product.Variation.length,
        Ready_to_wear: product.Ready_to_wear,
        Popular_pick: product.Popular_pick,
        Trendy_collection: product.Trendy_collection,
        HomePage: product.HomePage,
        Product_Status: product.Product_Status,
        Product_Label: product.Product_Label,
        Shipping: product?.Shipping,
        category: product.Category[0]?.Category_Name,
        brand: product.Brand_Name?.Data_Name,
        fabric: product.Fabric_Type?.Data_Name,
        occasions: product.Occasions?.Data_Name,
      }));
      res.json({
        type: "success",
        message: "Products found successfully!",
        product: adminProducts || [],
        total: totalCount,
        currentPage: parseInt(page),
      });
    } else {
      res.status(404).json({ type: "warning", message: "Products not found!" });
    }
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ type: "error", message: "Failed to fetch products" });
  }
});

// get all product
// route.get('/list/getAll', async (req, res) => {
//     try {

//         let { page, limit } = req.query;

//         page = page || 1
//         limit = limit || 10

//         const skip = (page - 1) * limit;

//         const totalCount = await Product.countDocuments(); // Get total count of products

//         const products = await Product.find().sort({ createdAt: -1 })
//             .skip(skip)
//             .limit(Number(limit))
//             .populate({
//                 path: 'Category',
//                 select: 'Category_Name',
//             })
//             .populate({
//                 path: 'Brand_Name',
//                 select: 'Data_Name',
//             })
//             .populate({
//                 path: 'Fabric_Type',
//                 select: 'Data_Name',
//             })
//             .populate({
//                 path: 'Occasions',
//                 select: 'Data_Name',
//             })

//         if (products) {

//             // for data table (admin)
//             const adminProducts = products.map(product => ({
//                 _id: product._id,
//                 Product_Name: product.Product_Name,
//                 SKU_Code: product.SKU_Code,
//                 Product_Image: `http://${process.env.IP_ADDRESS}/${product?.Product_Image?.path?.replace(/\\/g, '/')}`,
//                 Brand: {
//                     _id: product?.Brand_Name?._id,
//                     Brand_Name: product.Brand_Name?.Data_Name,
//                 },
//                 Fabric: {
//                     _id: product?.Fabric_Type?._id,
//                     Fabric_Type: product.Fabric_Type?.Data_Name,
//                 },
//                 Occasions: {
//                     _id: product?.Occasions?._id,
//                     Occasions: product.Occasions?.Data_Name,
//                 },
//                 Product_Dis_Price: product.Product_Dis_Price,
//                 Product_Ori_Price: product.Product_Ori_Price,
//                 Max_Dis_Price: product.Max_Dis_Price,
//                 Gold_Price: product.Gold_Price,
//                 Silver_Price: product.Silver_Price,
//                 PPO_Price: product.PPO_Price,
//                 Variation_Count: product.Variation.length,
//                 Ready_to_wear: product.Ready_to_wear,
//                 Popular_pick: product.Popular_pick,
//                 Trendy_collection: product.Trendy_collection,
//                 HomePage: product.HomePage,
//                 Product_Status: product.Product_Status,
//                 Product_Label: product.Product_Label,
//                 Shipping: product?.Shipping,
//                 category: product.Category[0]?.Category_Name,
//                 brand: product.Brand_Name?.Data_Name,
//                 fabric: product.Fabric_Type?.Data_Name,
//                 occasions: product.Occasions?.Data_Name,
//             }));

//             res.json({
//                 type: "success",
//                 message: "Products found successfully!",
//                 product: adminProducts || [],
//                 total: totalCount,
//                 currentPage: parseInt(page),
//             });
//         } else {
//             res.status(404).json({ type: "warning", message: "Products not found!" });
//         }
//     } catch (error) {
//         console.error(error);
//         res.status(500).json({ type: "error", message: "Failed to fetch products" });
//     }
// });

// get all product for demo
route.get("/mob/demo/get", async (req, res) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 }).populate({
      path: "Category",
      select: "Category_Name",
    });

    if (products) {
      // for data table (admin)
      const adminProducts = products.map((product) => ({
        _id: product._id,
        Product_Name: product.Product_Name,
        Product_Image: `${
          process.env.IP_ADDRESS
        }/${product?.Product_Image?.path?.replace(/\\/g, "/")}`,
        Category_Name: product.Category[0]?.Category_Name,
        CategoryId: product?.Category[0]?._id,
      }));

      res.json({
        type: "success",
        message: "Products found successfully!",
        product: adminProducts || [],
      });
    } else {
      res
        .status(404)
        .json({ type: "warning", message: "Products not found!", product: [] });
    }
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ type: "error", message: "Failed to fetch products" });
  }
});

// find particular product
route.get("/get/:id", checkAdminOrRole2, async (req, res) => {
  const productId = req?.params?.id;

  try {
    const products = await Product.findById(productId)
      .populate({
        path: "Category",
        select: "Category_Name",
      })
      .populate({
        path: "Variation",
        select: "-__v",
      })
      .populate({
        path: "Brand_Name",
        select: "Data_Name",
      })
      .populate({
        path: "Fabric_Type",
        select: "Data_Name",
      })
      .populate({
        path: "Occasions",
        select: "Data_Name",
      });

    if (products) {
      const frontendProducts = {
        _id: products._id,
        Product_Name: products.Product_Name,
        SKU_Code: products.SKU_Code,
        Product_Image: `${
          process.env.IP_ADDRESS
        }/${products?.Product_Image?.path?.replace(/\\/g, "/")}`,
        Category: products?.Category?.map((category) => ({
          _id: category?._id,
          Category_Name: category?.Category_Name,
        })),
        Brand: {
          _id: products?.Brand_Name?._id,
          Brand_Name: products.Brand_Name?.Data_Name,
        },
        Fabric: {
          _id: products?.Fabric_Type?._id,
          Fabric_Type: products.Fabric_Type?.Data_Name,
        },
        Occasions: {
          _id: products?.Occasions?._id,
          Occasions: products.Occasions?.Data_Name,
        },
        Product_Dis_Price: products.Product_Dis_Price,
        Product_Ori_Price: products.Product_Ori_Price,
        Max_Dis_Price: products.Max_Dis_Price,
        Gold_Price: products.Gold_Price,
        Silver_Price: products.Silver_Price,
        PPO_Price: products.PPO_Price,
        Description: products.Description,
        Product_Label: products.Product_Label,
        Variation_Count: products.Variation.length,
        Variation: products?.Variation?.map((variation) => ({
          _id: variation?._id,
          variation_Name: variation?.Variation_Name,
          size_count: variation?.Variation_Size?.length,
          variation_Sizes: variation?.Variation_Size?.map((variation) => ({
            _id: variation?._id,
            name: variation?.Size_Name,
            stock: variation?.Size_Stock,
          })),
          variation_Images: variation?.Variation_Images?.map((variation) => ({
            variation_Image: `${
              process.env.IP_ADDRESS
            }/${variation?.path?.replace(/\\/g, "/")}`,
          })),
          variation_Status: variation?.Variation_Status,
        })),
        Ready_to_wear: products.Ready_to_wear,
        Popular_pick: products.Popular_pick,
        Trendy_collection: products.Trendy_collection,
      };
      res.json({
        type: "success",
        message: "Products found successfully!",
        products: frontendProducts || [],
      });
    } else {
      res.json({
        type: "success",
        message: "Products Not Found!",
        products: [],
      });
    }
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ type: "error", message: "Failed to fetch products" });
  }
});

// get wishlist from wishlist Model
const getWishList = async (userId) => {
  try {
    if (userId != "0") {
      const wishList = await Wishlist.find({ user: userId }, "product");
      return wishList.map((item) => item.product?.toString());
    } else {
      return [];
    }
  } catch (error) {
    console.error(error);
    return [];
  }
};

// get all product for particular category (mobile)
route.get("/mob/get/productlist/:id", async (req, res) => {
  const userId = req.query?.userId;
  const categoryId = req.params.id;

  let user;
  if (userId !== "0") {
    user = await User.findById(userId);
  }

  try {
    const products = await Product.find({
      Category: { $in: [categoryId] },
      Product_Status: true,
    })
      .sort({ createdAt: -1 })
      .populate("Category", "Category_Name")
      .populate({
        path: "Variation",
        select: "-__v",
      })
      .populate("Brand_Name", "Data_Name")
      .populate("Fabric_Type", "Data_Name")
      .populate("Occasions", "Data_Name");

    const userWishlist = await getWishList(userId);

    if (products.length === 0) {
      return res.status(200).json({
        type: "warning",
        message: "No products found for the given category!",
        products: [],
      });
    } else {
      const result = products.map((product) => ({
        _id: product._id,
        Product_Name: product.Product_Name,
        SKU_Code: product.SKU_Code,
        Product_Image: `${
          process.env.IP_ADDRESS
        }/${product?.Product_Image?.path?.replace(/\\/g, "/")}`,
        Category: product.Category[0]?.Category_Name,
        Brand_Name: product?.Brand_Name?.Data_Name,
        Fabric_Type: product?.Fabric_Type?.Data_Name,
        Occasions: product?.Occasions?.Data_Name,

        Product_Dis_Price:
          user?.User_Type === "0" || userId === "0"
            ? product.Product_Dis_Price
            : user?.User_Type === "1"
            ? product.Gold_Price
            : user?.User_Type === "2"
            ? product.Silver_Price
            : product.PPO_Price,

        Product_Ori_Price:
          user?.User_Type === "0" || userId === "0"
            ? product.Product_Ori_Price
            : product.Product_Dis_Price,

        Max_Dis_Price: product.Max_Dis_Price,
        Gold_Price: product.Gold_Price,
        Silver_Price: product.Silver_Price,
        PPO_Price: product.PPO_Price,
        Description: product.Description,
        Product_Label: product.Product_Label,
        Ready_to_wear: product.Ready_to_wear,
        Popular_pick: product.Popular_pick,
        HomePage: product.HomePage,
        Trendy_collection: product.Trendy_collection,
        isFavorite: userWishlist.includes(product._id?.toString()),
      }));

      res.status(200).json({
        type: "success",
        message: "Products found successfully!",
        products: result || [],
      });
    }
  } catch (error) {
    res
      .status(500)
      .json({ type: "error", message: "Server Error!", errorMessage: error });
  }
});

// get all product features product (mobile)
route.get("/mob/get/features/productlist", async (req, res) => {
  const HomeFeatures = req?.query?.HomeFeatures;
  const userId = req?.query?.userId;

  let user;
  if (userId !== "0") {
    user = await User.findById(userId);
  }

  let products = [];

  try {
    if (HomeFeatures === "0") {
      products = await Product.find({
        Product_Status: true,
        Ready_to_wear: true,
      })
        .sort({ createdAt: -1 })
        .populate("Category", "Category_Name")
        .populate({
          path: "Variation",
          select: "-__v",
        })
        .populate("Brand_Name", "Data_Name")
        .populate("Fabric_Type", "Data_Name")
        .populate("Occasions", "Data_Name");
    } else if (HomeFeatures === "1") {
      products = await Product.find({
        Product_Status: true,
        Popular_pick: true,
      })
        .sort({ createdAt: -1 })
        .populate("Category", "Category_Name")
        .populate({
          path: "Variation",
          select: "-__v",
        })
        .populate("Brand_Name", "Data_Name")
        .populate("Fabric_Type", "Data_Name")
        .populate("Occasions", "Data_Name");
    } else if (HomeFeatures === "2") {
      products = await Product.find({
        Product_Status: true,
        Trendy_collection: true,
      })
        .sort({ createdAt: -1 })
        .populate("Category", "Category_Name")
        .populate({
          path: "Variation",
          select: "-__v",
        })
        .populate("Brand_Name", "Data_Name")
        .populate("Fabric_Type", "Data_Name")
        .populate("Occasions", "Data_Name");
    } else if (HomeFeatures === "3") {
      products = await Product.find({ Product_Status: true, HomePage: true })
        .sort({ createdAt: -1 })
        .populate("Category", "Category_Name")
        .populate({
          path: "Variation",
          select: "-__v",
        })
        .populate("Brand_Name", "Data_Name")
        .populate("Fabric_Type", "Data_Name")
        .populate("Occasions", "Data_Name");
    }

    let result = [];
    const userWishlist = await getWishList(userId);
    if (products.length === 0) {
      res
        .status(200)
        .json({ type: "warning", message: "No products found!", products: [] });
    } else {
      result = products.map((product) => ({
        _id: product._id,
        Product_Name: product.Product_Name,
        SKU_Code: product.SKU_Code,
        Product_Image: `${
          process.env.IP_ADDRESS
        }/${product?.Product_Image?.path?.replace(/\\/g, "/")}`,
        Category: product.Category[0]?.Category_Name,
        categoryId: product.Category[0]?._id,
        Brand_Name: product?.Brand_Name?.Data_Name,
        Fabric_Type: product?.Fabric_Type?.Data_Name,
        Occasions: product?.Occasions?.Data_Name,

        Product_Dis_Price:
          user?.User_Type === "0" || userId === "0"
            ? product.Product_Dis_Price
            : user?.User_Type === "1"
            ? product.Gold_Price
            : user?.User_Type === "2"
            ? product.Silver_Price
            : product.PPO_Price,

        Product_Ori_Price:
          user?.User_Type === "0" || userId === "0"
            ? product.Product_Ori_Price
            : product.Product_Dis_Price,

        Max_Dis_Price: product.Max_Dis_Price,
        Gold_Price: product.Gold_Price,
        Silver_Price: product.Silver_Price,
        PPO_Price: product.PPO_Price,
        Description: product.Description,
        Product_Label: product.Product_Label,
        Ready_to_wear: product.Ready_to_wear,
        Popular_pick: product.Popular_pick,
        HomePage: product.HomePage,
        Trendy_collection: product.Trendy_collection,
        isFavorite: userWishlist.includes(product._id?.toString()),
      }));

      // let filteredProducts = []

      // if (HomeFeatures === '0') {
      //     filteredProducts = result?.filter(product => product?.Ready_to_wear);
      // }
      // else if (HomeFeatures === '1') {
      //     filteredProducts = result?.filter(product => product?.Popular_pick);
      // }
      // else if (HomeFeatures === '2') {
      //     filteredProducts = result?.filter(product => product?.Trendy_collection);
      // }
      // else if (HomeFeatures === '3') {
      //     filteredProducts = result?.filter(product => product?.HomePage);
      // }

      res.status(200).json({
        type: "success",
        message: "Products found successfully!",
        products: result || [],
      });
    }
  } catch (error) {
    console.log(error);
    res
      .status(200)
      .json({ type: "error", message: "Server Error!", errorMessage: error });
  }
});

// function for get ratings
async function getRatings(productId) {
  const reviewsForProduct = await Review.find({
    productIds: productId,
  });

  if (reviewsForProduct.length === 0) {
    return 0;
  }

  const totalRating = reviewsForProduct.reduce(
    (sum, review) => sum + parseFloat(review.rating),
    0
  );
  let rating = totalRating / reviewsForProduct.length;
  rating = rating.toFixed(1);
  return rating;
}

// get product using id
route.get("/mob/get/single/:id", async (req, res) => {
  const userId = req?.query?.userId;
  const productId = req.params.id;

  let user;
  if (userId !== "0") {
    user = await User.findById(userId);
  }

  const userWishlist = await getWishList(userId);

  const ratings = await getRatings(productId);

  try {
    const product = await Product.findById(productId)
      .populate("Category", "Category_Name, _id")
      .populate({
        path: "Variation",
        select: "-__v",
        match: { Variation_Status: true },
      })
      .populate("Brand_Name", "Data_Name")
      .populate("Fabric_Type", "Data_Name")
      .populate("Occasions", "Data_Name");
    if (!product) {
      return res
        .status(200)
        .json({ type: "warning", message: "No products found!", products: [] });
    } else {
      let shipping;
      if (product?.Shipping === "PRE LAUNCH") {
        shipping = "1";
      } else {
        shipping = "0";
      }

      const result = {
        _id: product._id,
        Product_Name: product.Product_Name,
        SKU_Code: product.SKU_Code,
        Product_Image: `${
          process.env.IP_ADDRESS
        }/${product?.Product_Image?.path?.replace(/\\/g, "/")}`,
        Category: product.Category[0]?.Category_Name,
        CategoryId: product.Category[0]?._id,
        Brand_Name: product?.Brand_Name?.Data_Name,
        Fabric_Type: product?.Fabric_Type?.Data_Name,
        Occasions: product?.Occasions?.Data_Name,

        Product_Dis_Price:
          user?.User_Type === "0" || userId === "0"
            ? product.Product_Dis_Price
            : user?.User_Type === "1"
            ? product.Gold_Price
            : user?.User_Type === "2"
            ? product.Silver_Price
            : product.PPO_Price,

        Product_Ori_Price:
          user?.User_Type === "0" || userId === "0"
            ? product.Product_Ori_Price
            : product.Product_Dis_Price,

        Max_Dis_Price: product.Max_Dis_Price,
        Gold_Price: product.Gold_Price,
        Silver_Price: product.Silver_Price,
        PPO_Price: product.PPO_Price,
        Description: product.Description,
        Product_Label: product.Product_Label,
        Variation_Count: product.Variation.length,
        // variation: product?.Variation?.map(variation => ({
        //     variation_Id: variation?._id,
        //     variation_Name: variation?.Variation_Name,
        //     variation_Sizes: variation?.Variation_Size?.map(variation => ({
        //         id: variation?._id,
        //         name: variation?.Size_Name,
        //         stock: variation?.Size_Stock
        //     })),
        //     variation_Images: variation?.Variation_Images?.map(variation => ({
        //         variation_Image: `${process.env.IP_ADDRESS}/${variation?.path?.replace(/\\/g, '/')}`
        //     }))
        // })),
        variation: product?.Variation?.reduce(
          (filteredVariations, variation) => {
            const filteredSizes = variation?.Variation_Size?.filter(
              (size) => size?.Size_Stock > 0
            );

            if (filteredSizes.length > 0) {
              filteredVariations.push({
                variation_Id: variation?._id,
                variation_Name: variation?.Variation_Name,
                variation_Sizes: filteredSizes?.map((variation) => ({
                  id: variation?._id,
                  name: variation?.Size_Name,
                  stock: variation?.Size_Stock,
                })),
                variation_Images: variation?.Variation_Images?.map(
                  (variation) => ({
                    variation_Image: `${
                      process.env.IP_ADDRESS
                    }/${variation?.path?.replace(/\\/g, "/")}`,
                  })
                ),
              });
            }

            return filteredVariations;
          },
          []
        ),
        Ready_to_wear: product.Ready_to_wear,
        Popular_pick: product.Popular_pick,
        HomePage: product.HomePage,
        // Shipping: product?.Shipping,
        Shipping: shipping,
        Trendy_collection: product.Trendy_collection,
        isFavorite: userWishlist.includes(product._id?.toString()),
        ratings: ratings,
      };

      res.status(200).json({
        type: "success",
        message: "Products found successfully!",
        products: [result] || [],
      });
    }
  } catch (error) {
    res
      .status(200)
      .json({ type: "error", message: "Server Error!", errorMessage: error });
  }
});

// delete product by id
route.delete("/delete/:id", checkAdminOrRole2, async (req, res) => {
  const productId = req.params.id;

  try {
    const product = await Product.findById(productId);

    if (!product) {
      return res
        .status(404)
        .json({ type: "warning", message: "Product not found!" });
    }

    const variationIds = product.Variation.map((variation) => variation?._id);
    const variations = await Variation.find({ _id: { $in: variationIds } });

    // Collect all image paths for deletion
    let imagePaths = [];
    variations.forEach((variation) => {
      if (variation?.Variation_Images?.path) {
        imagePaths.push(variation?.Variation_Images?.path);
      }
    });
    if (product.Product_Image?.path) {
      imagePaths.push(product.Product_Image?.path);
    }

    // Delete variations and product
    await Variation.deleteMany({ _id: { $in: variationIds } });
    await Product.findByIdAndDelete(productId);

    // Delete all associated images
    imagePaths?.forEach((imagePath) => {
      if (imagePath) {
        fs.unlinkSync(path?.join(imagePath));
      }
    });

    res.status(200).json({
      type: "success",
      message: "Product and associated variations deleted successfully!",
    });
  } catch (error) {
    console.error("Error deleting product:", error);
    res.status(500).json({ message: "Failed to delete product" });
  }
});

// delete many products
route.delete("/deletes", checkAdminOrRole2, async (req, res) => {
  try {
    const { ids } = req.body;

    if (!ids || ids.length === 0) {
      return res.status(400).json({ message: "No product IDs provided" });
    }

    // Retrieve the products to be deleted
    const products = await Product.find({ _id: { $in: ids } });

    if (products.length === 0) {
      return res.status(404).json({ message: "No products found" });
    }

    // Get the IDs of all variations associated with the products
    const variationIds = products.flatMap((product) =>
      product.Variation.map((variation) => variation._id)
    );

    // Get the image paths of all variations and product images
    let imagePaths = [];
    products.forEach((product) => {
      imagePaths.push(product.Product_Image?.path);
      product.Variation.forEach((variation) => {
        if (variation.Variation_Image?.path) {
          imagePaths.push(variation.Variation_Image.path);
        }
      });
    });

    // Delete the variations from the variations table
    await Variation.deleteMany({ _id: { $in: variationIds } });

    // Delete the images from the local folder
    imagePaths.forEach((imagePath) => {
      if (imagePath) {
        fs.unlinkSync(path.join(imagePath));
      }
    });

    // Delete the products from the products table
    await Product.deleteMany({ _id: { $in: ids } });

    res.status(200).json({
      type: "success",
      message: "All Products and associated variations deleted successfully!",
    });
  } catch (error) {
    console.log("Error deleting products:", error);
    res.status(500).json({ message: "Failed to delete products" });
  }
});

// update only status
route.patch("/update/status/:id", checkAdminOrRole2, async (req, res) => {
  const productId = await req.params.id;

  try {
    const { Product_Status } = req.body;
    const newProduct = await Product.findByIdAndUpdate(productId);
    newProduct.Product_Status = await Product_Status;

    await newProduct.save();
    res.status(200).json({
      type: "success",
      message: "Product Status update successfully!",
    });
  } catch (error) {
    res
      .status(500)
      .json({ type: "error", message: "Server Error!", errorMessage: error });
  }
});

// update product features
route.patch("/update/features/:id", checkAdminOrRole2, async (req, res) => {
  const productId = await req.params.id;

  try {
    const { Ready_to_wear, Trendy_collection, Popular_pick, HomePage } =
      req.body;

    const newProduct = await Product.findByIdAndUpdate(productId);

    newProduct.Ready_to_wear = await Ready_to_wear;
    newProduct.Trendy_collection = await Trendy_collection;
    newProduct.Popular_pick = await Popular_pick;
    newProduct.HomePage = await HomePage;

    await newProduct.save();
    res.status(200).json({
      type: "success",
      message: "Product Features update successfully!",
    });
  } catch (error) {
    res
      .status(500)
      .json({ type: "error", message: "Server Error!", errorMessage: error });
    console.log(error);
  }
});

// update product shipping
route.patch("/update/shipping/:id", checkAdminOrRole2, async (req, res) => {
  const productId = await req.params.id;

  try {
    const { Shipping } = req.body;
    const newProduct = await Product.findByIdAndUpdate(productId);

    newProduct.Shipping = await Shipping;

    await newProduct.save();
    res.status(200).json({
      type: "success",
      message: "Product Shipping update successfully!",
    });
  } catch (error) {
    res
      .status(500)
      .json({ type: "error", message: "Server Error!", errorMessage: error });
    console.log(error);
  }
});

// Update product
route.patch(
  "/update/:id",
  checkAdminOrRole2,
  upload.single("image"),
  async (req, res) => {
    console.log("work");
    try {
      const productId = req.params.id;
      const {
        Product_Name,
        SKU_Code,
        Category,
        Brand_Name,
        Fabric_Type,
        Occasions,
        Product_Dis_Price,
        Product_Ori_Price,
        Max_Dis_Price,
        Gold_Price,
        Silver_Price,
        PPO_Price,
        Description,
      } = req.body;

      const categoryIdsArray = Category.split(","); // Convert comma-separated string to an array
      const categoryObjectIds = categoryIdsArray.map(
        (cat) => new mongoose.Types.ObjectId(cat)
      );

      const existingProduct = await Product.findById(productId);

      if (!existingProduct) {
        if (req.file) {
          fs.unlinkSync(req?.file?.path);
        }
        return res.status(404).json({
          type: "warning",
          message: "Product not found!",
        });
      }

      // Check if the product name is being changed and if there is another product with the same name and category
      if (
        Product_Name.toLowerCase() !==
          existingProduct.Product_Name.toLowerCase() ||
        Category !== existingProduct.Category
      ) {
        const duplicateProduct = null;

        if (duplicateProduct) {
          if (req.file) {
            fs.unlinkSync(req?.file?.path);
          }
          return res.status(202).json({
            type: "warning",
            message:
              "Product with the same Product_Name already exists for the selected Category.",
          });
        }
      }

      existingProduct.Product_Name = Product_Name;
      existingProduct.SKU_Code = SKU_Code;
      if (!Category == undefined || !Category == "") {
        existingProduct.Category = categoryObjectIds;
      }
      if (!Brand_Name == undefined || !Brand_Name == "") {
        existingProduct.Brand_Name = Brand_Name;
      }
      if (!Fabric_Type == undefined || !Fabric_Type == "") {
        existingProduct.Fabric_Type = Fabric_Type;
      }
      if (!Occasions == undefined || !Occasions == "") {
        existingProduct.Occasions = Occasions;
      }
      existingProduct.Product_Dis_Price = Product_Dis_Price;
      existingProduct.Product_Ori_Price = Product_Ori_Price;
      existingProduct.Max_Dis_Price = Max_Dis_Price;
      existingProduct.Gold_Price = Gold_Price;
      existingProduct.Silver_Price = Silver_Price;
      existingProduct.PPO_Price = PPO_Price;
      existingProduct.Description = Description;

      // Handle the image update
      if (req.file) {
        if (
          existingProduct.Product_Image &&
          existingProduct.Product_Image.filename
        ) {
          // Remove the previous image
          // fs.unlinkSync(existingProduct?.Product_Image.path);
        }

        const originalFilename = req.file.originalname;
        const extension = originalFilename.substring(
          originalFilename.lastIndexOf(".")
        );
        const imageFilename = `${Product_Name.replace(/\s/g, "_")}${extension}`;
        const imagePath = "imageUploads/backend/product/" + imageFilename;

        fs.renameSync(req?.file?.path, imagePath);

        const image = {
          filename: imageFilename,
          path: imagePath,
          originalname: originalFilename,
        };
        existingProduct.Product_Image = image;
      }

      await existingProduct.save();

      res
        .status(200)
        .json({ type: "success", message: "Product updated successfully!" });
    } catch (error) {
      if (req?.file) {
        fs.unlinkSync(req?.file?.path);
      }
      res
        .status(500)
        .json({ type: "error", message: "Server Error!", errorMessage: error });
      console.log(error);
    }
  }
);

// get all product wich variation size have less stock
// route.get('/lowstockproducts/get', async (req, res) => {
//     try {
//         const products = await Product.find()
//             .populate({
//                 path: 'Category',
//                 select: 'Category_Name',
//             })
//             .populate({
//                 path: 'Variation',
//                 select: '-__v',
//             });

//         if (products) {
//             const lowStockProducts = products
//                 .map(product => {
//                     const lowStockVariations = product.Variation.filter(variation =>
//                         variation.Variation_Size.some(size => size.Size_Stock > 0 && size.Size_Stock < 100)
//                     );

//                     if (lowStockVariations.length > 0) {
//                         const flattenedVariations = lowStockVariations.map(variation => ({
//                             variation_Name: variation.Variation_Name,
//                             variation_Sizes: variation.Variation_Size.filter(size =>
//                                 size.Size_Stock > 0 && size.Size_Stock < 100
//                             ).map(size => ({
//                                 name: size.Size_Name,
//                                 stock: size.Size_Stock,
//                             })),
//                         }));

//                         return {
//                             _id: product._id,
//                             Product_Name: product.Product_Name,
//                             SKU_Code: product.SKU_Code,
//                             Category: product.Category?.Category_Name || '',
//                             Product_Image: `${process.env.IP_ADDRESS}/${product?.Product_Image?.path?.replace(/\\/g, '/')}` || "",
//                             Variation: flattenedVariations,
//                         };
//                     }
//                 })
//                 .filter(Boolean); // Remove undefined entries

//             // Flatten the individual variation sizes
//             const individualVariationSizes = lowStockProducts
//                 .map(product => product.Variation.map(variation => variation.variation_Sizes))
//                 .flat();

//             res.json({
//                 type: "success",
//                 message: "Products with low stock found successfully!",
//                 low_stock_products: lowStockProducts || [],
//                 individual_variation_sizes: individualVariationSizes || [],
//             });
//         } else {
//             res.status(404).json({ type: "warning", message: "Products not found!" });
//         }
//     } catch (error) {
//         console.error(error);
//         res.status(500).json({ type: "error", message: "Failed to fetch products" });
//     }
// });

route.get("/lowstockproducts/get", checkAdminOrRole2, async (req, res) => {
  try {
    const products = await Product.find()
      .populate({
        path: "Category",
        select: "Category_Name",
      })
      .populate({
        path: "Variation",
        select: "-__v",
      });

    if (products.length === 0) {
      return res
        .status(404)
        .json({ type: "warning", message: "Products not found!" });
    }

    const lowStockVariationSizes = [];

    for (const product of products) {
      for (const variation of product.Variation) {
        const lowStockSizes = variation.Variation_Size.filter(
          (size) => size.Size_Stock >= 0 && size.Size_Stock <= 2
        );

        if (lowStockSizes.length > 0) {
          // const imagePath = constructImagePath(process.env.IP_ADDRESS, process.env.PORT, variation.Variation_Image?.path);
          const imagePath = `${
            process.env.IP_ADDRESS
          }/${variation?.Variation_Images[0]?.path?.replace(/\\/g, "/")}`;

          lowStockVariationSizes.push(
            ...lowStockSizes.map((size) => ({
              _id: product._id,
              Product_Name: product.Product_Name,
              SKU_Code: product.SKU_Code,
              Category: product.Category[0]?.Category_Name || "",
              Product_Image: imagePath || "",
              Variation_Name: variation.Variation_Name,
              Variation_Id: variation._id,
              Size_Name: size.Size_Name,
              Size_Stock: size.Size_Stock,
              Size_Id: size._id,
            }))
          );
        }
      }
    }

    res.json({
      type: "success",
      message: "Low stock variation sizes found successfully!",
      low_stock_variation_sizes: lowStockVariationSizes,
    });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ type: "error", message: "Failed to fetch products" });
  }
});

// change the particular size stock of variations
route.put(
  "/edit/variation/size/stock/:variationId/:sizeId",
  checkAdminOrRole2,
  async (req, res) => {
    const { variationId, sizeId } = req.params;
    const { Size_Stock } = req.body;

    try {
      const variation = await Variation.findById(variationId);

      if (!variation) {
        return res
          .status(404)
          .json({ type: "warning", message: "Variation not found!" });
      }

      const sizeIndex = variation.Variation_Size.findIndex(
        (size) => size._id.toString() === sizeId
      );

      if (sizeIndex === -1) {
        return res
          .status(404)
          .json({ type: "warning", message: "Size not found!" });
      }

      variation.Variation_Size[sizeIndex].Size_Stock = Size_Stock;

      await variation.save();

      res.status(200).json({
        type: "success",
        message: "Stock updated successfully!",
      });
    } catch (error) {
      console.error(error);
      res
        .status(500)
        .json({ type: "error", message: "Failed to update stock" });
    }
  }
);

route.get("/download/:filename", (req, res) => {
  try {
    const { filename } = req.params;
    const imagePath = `imageUploads/backend/demo/${filename}`;
    const fileExists = fs.existsSync(imagePath);

    if (fileExists) {
      res.download(imagePath, filename, (err) => {
        if (err) {
          return res.status(500).json({
            type: "error",
            message: "Server Error!",
            errorMessage: err,
          });
        }
      });
    } else {
      return res.status(404).json({ type: "error", message: "File not found" });
    }
  } catch (error) {
    res
      .status(500)
      .json({ type: "error", message: "Server Error!", errorMessage: error });
    console.log(error);
  }
});

module.exports = route;
