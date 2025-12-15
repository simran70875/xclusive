const express = require("express");
const fs = require("fs");
const path = require("path");
const route = express.Router();
const multer = require("multer");
const csv = require('csv-parser');

const { Product, Variation } = require("../../../Models/BackendSide/product_model");
const User = require("../../../Models/FrontendSide/user_model");
const Wishlist = require("../../../Models/FrontendSide/wish_list_model");
const Review = require("../../../Models/FrontendSide/review_model");

const { default: mongoose } = require("mongoose");
const checkAdminOrRole2 = require("../../../Middleware/checkAdminOrRole2");
const { handleMulter } = require("../../../utils/handleMulter");
const Category = require("../../../Models/BackendSide/category_model");
const Data = require("../../../Models/BackendSide/data_model");

// Set up multer middleware to handle file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./imageUploads/backend/product");
  },
  filename: function (req, file, cb) {
    cb(null, file?.originalname);
  },
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 20 * 1024 * 1024,
  }
});

const storage_csv = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, './imageUploads/backend/product'); // Specify the directory to store uploaded files
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`); // Unique filename
  }
});

const uploadcsv = multer({ storage: storage_csv });

function copyLocalImage(localPath, destFolder) {
  // if no image in CSV
  if (!localPath || localPath.trim() === "") return null;

  const originalname = path.basename(localPath);      // ex = cat1.jpg
  const filename = Date.now() + "-" + originalname;   // unique file name
  const destPath = path.join(destFolder, filename);

  try {
    // Copy file from local system → backend storage
    fs.promises.copyFile(localPath, destPath);

    return {
      filename,
      path: destPath,
      originalname
    };
  } catch (error) {
    console.log("Error copying:", localPath, error);
    return null;
  }
}

// 🚀 IMPORT PRODUCT CSV
route.post("/upload-csv", checkAdminOrRole2, uploadcsv.single("csvFile"), (req, res) => {
  if (!req.file) return res.status(400).json({ type: "error", message: "CSV not uploaded" });
  console.log(" CSV ==> ", req.file);

  const uploadFolder = "./imageUploads/backend/product";
  const rows = [];

  fs.createReadStream(req.file.path).pipe(csv()).on("data", (row) => rows.push(row))
    .on("end", async () => {
      try {
        fs.unlinkSync(req.file.path);

        // 1️⃣ GROUP ROWS BY PRODUCT
        const groupedByProduct = rows.reduce((acc, row) => {
          const key = row.SKU_Code?.trim();  // unique per product

          if (!acc[key]) acc[key] = [];
          acc[key].push(row);

          return acc;
        }, {});

        let inserted = 0;
        let skipped = 0;
        let skippedNames = [];

        // 2️⃣ PROCESS EACH PRODUCT GROUP
        for (let sku in groupedByProduct) {
          const productRows = groupedByProduct[sku];



          const firstRow = productRows[0];

          // 🔍 CHECK PRODUCT EXISTS
          const existingProduct = await Product.findOne({ SKU_Code: sku });
          if (existingProduct) {
            skipped++;
            skippedNames.push(firstRow.Product_Name);
            continue;
          }

          // 3️⃣ CATEGORY
          const categoryDoc = await Category.findOne({
            Category_Name: firstRow.Category?.trim(),
          });

          // 🔍 BRAND HANDLING
          let brandDoc = null;
          if (firstRow.Brand_Name && firstRow.Brand_Name.trim() !== "") {

            brandDoc = await Data.findOne({
              Data_Type: "Brand",
              Data_Name: firstRow.Brand_Name.trim(),
            });

            // ⭐ If brand does not exist → Create it
            if (!brandDoc) {
              brandDoc = await Data.create({
                Data_Type: "Brand",
                Data_Name: firstRow.Brand_Name.trim(),
                Data_Label: firstRow.Brand_Name.trim(),
                Data_Status: true,
              });
            }
          }

          // 🔍 COLLECTION HANDLING
          let collectionDoc = null;
          if (firstRow.Collection_Name && firstRow.Collection_Name.trim() !== "") {

            collectionDoc = await Data.findOne({
              Data_Type: "Collection",
              Data_Name: firstRow.Collection_Name.trim(),
            });

            // ⭐ If collection does not exist → Create it
            if (!collectionDoc) {
              collectionDoc = await Data.create({
                Data_Type: "Collection",
                Data_Name: firstRow.Collection_Name.trim(),
                Data_Label: firstRow.Collection_Name.trim(),
                Data_Status: true,
              });
            }
          }

          // 4️⃣ PRODUCT IMAGES (only from 1st row)
          let productImagesArray = [];
          if (firstRow.Product_Images) {
            productImagesArray = firstRow.Product_Images.split("|").map((img) => copyLocalImage(img, uploadFolder)).filter(Boolean);
          }

          // 5️⃣ CREATE PRODUCT FIRST
          const newProduct = await Product.create({
            Product_Name: firstRow.Product_Name,
            SKU_Code: firstRow.SKU_Code,

            Category: categoryDoc ? [categoryDoc._id] : [],

            // ⬇️ Updated brand & collection IDs
            Brand_Name: brandDoc ? brandDoc._id : null,
            Collections: collectionDoc ? collectionDoc._id : null,

            Product_Images: productImagesArray,

            Product_Dis_Price: Number(firstRow.Product_Dis_Price),
            Product_Ori_Price: Number(firstRow.Product_Ori_Price),
            Max_Dis_Price: Number(firstRow.Max_Dis_Price),

            Description: firstRow.Description,
            Product_Label: firstRow.Product_Label,

            Trendy_collection: firstRow.Trendy_collection === "true",
            Popular_pick: firstRow.Popular_pick === "true",
            HomePage: firstRow.HomePage === "true",

            Product_Status: firstRow.Product_Status !== "false",
            Shipping: firstRow.Shipping || "PRE LAUNCH",
          });

          // 6️⃣ GROUP VARIATIONS BY Variation_Name
          const variationGroups = productRows.reduce((acc, row) => {
            const name = row.Variation_Name?.trim();

            if (!name) return acc;

            if (!acc[name]) acc[name] = [];
            acc[name].push(row);

            return acc;
          }, {});


          // Store Variation IDs
          let variationIds = [];

          // 7️⃣ PROCESS EACH GROUP → ONE VARIATION
          for (let varName in variationGroups) {
            const rowsInVariation = variationGroups[varName];

            // Variation images → take from first row
            let variationImages = [];
            if (rowsInVariation[0].Variation_Images) {
              variationImages = rowsInVariation[0].Variation_Images.split("|").map((img) => copyLocalImage(img, uploadFolder)).filter(Boolean);
            }

            // Build Variation_Size array
            let sizeArray = [];

            rowsInVariation.forEach((r) => {
              if (r.Variation_Size) {
                // Format: L(16.5-17.5)|100|2891
                const sizeParts = r.Variation_Size.split("|");

                const sizeName = sizeParts[0]?.trim();
                const stock = Number(sizeParts[1] || 0);
                const price = Number(sizeParts[2] || 0);

                sizeArray.push({
                  Size_Name: sizeName,
                  Size_Stock: stock,
                  Size_Price: price,
                  Size_Status: true,
                });
              }
            });

            // Create single variation
            const createdVariation = await Variation.create({
              Variation_Name: varName,
              Variation_Images: variationImages,
              Variation_Size: sizeArray,
              Variation_Label: rowsInVariation[0].Variation_Label,
              Variation_Status: rowsInVariation[0].Variation_Status !== "false",
            });

            variationIds.push(createdVariation._id);
          }

          // 7️⃣ UPDATE PRODUCT WITH ALL VARIATIONS
          newProduct.Variation = variationIds;
          await newProduct.save();

          inserted++;
        }

        return res.status(200).json({
          type: "success",
          message: "Product CSV imported successfully!",
          inserted,
          skipped,
          skippedNames,
        });

      } catch (err) {
        console.error(err);
        return res.status(500).json({
          type: "error",
          message: "Error processing CSV",
        });
      }
    });
});


// 🚀 CREATE PRODUCT WITH MULTIPLE IMAGES
route.post(
  "/add",
  checkAdminOrRole2,
  upload.array("images", 5),
  async (req, res) => {
    try {
      const {
        Product_Name,
        SKU_Code,
        Category,
        Brand_Name,
        Collection_Name,
        Product_Dis_Price,
        Product_Ori_Price,
        Max_Dis_Price,
        Description,
      } = req.body;

      console.log("req.files product images ==> ", req.files);

      // Validate product images
      if (!req.files || req.files.length === 0) {
        return res.status(202).json({
          type: "warning",
          message: "Add atleast one product image",
        });
      }

      const categoryIds = Category.split(",");

      // 🔍 CHECK IF SKU ALREADY EXISTS
      const existingProductCode = await Product.findOne({
        SKU_Code: { $regex: `^${SKU_Code}$`, $options: "i" },
      });

      if (existingProductCode) {
        // delete uploaded images
        req.files?.forEach((f) => f?.path && fs.unlinkSync(f.path));

        return res.status(202).json({
          type: "warning",
          message: "Product with same SKU already exists.",
        });
      }

      // 📸 Handle Multiple Images
      const Product_Images = (req.files || []).map((file) => {
        const ext = path.extname(file.originalname);
        const imageFilename = `${Product_Name.replace(/\s/g, "_")}_${Date.now()}_${Math.floor(
          Math.random() * 9999
        )}${ext}`;

        const newPath = `imageUploads/backend/product/${imageFilename}`;

        fs.renameSync(file.path, newPath);

        return {
          filename: imageFilename,
          path: newPath,
          originalname: file.originalname,
        };
      });

      // 🆕 CREATE PRODUCT
      const product = new Product({
        Product_Name,
        SKU_Code,
        Category: categoryIds,
        Brand_Name,
        Collections: Collection_Name,
        Product_Dis_Price,
        Product_Ori_Price,
        Max_Dis_Price,
        Description,
        Product_Label: Product_Name,
        Product_Images,
      });

      await product.save();

      return res.status(200).json({
        type: "success",
        message: "Product added successfully!",
        productId: product._id,
      });
    } catch (error) {
      req.files?.forEach((f) => f?.path && fs.unlinkSync(f.path));

      console.error(error);
      return res.status(500).json({
        type: "error",
        message: "Server Error!",
        errorMessage: error,
      });
    }
  }
);

// get all product
route.get("/get", async (req, res) => {
  try {
    // COMMON POPULATE FIELDS
    const populateFields = [
      { path: "Category", select: "Category_Name" },
      { path: "Brand_Name", select: "Data_Name" },
      { path: "Collections", select: "Data_Name" },
    ];

    // 🔹 Fetch all products (Admin)
    const allProducts = await Product.find()
      .sort({ createdAt: -1 })
      .populate(populateFields);

    if (!allProducts)
      return res.status(404).json({
        type: "warning",
        message: "Products not found!",
      });

    // 🔹 Admin formatted list
    const adminProducts = allProducts.map((p) => ({
      _id: p._id,
      Product_Name: p.Product_Name,
      SKU_Code: p.SKU_Code,
      Product_Images: p.Product_Images,
      Brand: {
        _id: p.Brand_Name?._id,
        Brand_Name: p.Brand_Name?.Data_Name,
      },
      Collections: {
        _id: p.Collections?._id,
        Collections: p.Collections?.Data_Name,
      },
      Product_Dis_Price: p.Product_Dis_Price,
      Product_Ori_Price: p.Product_Ori_Price,
      Max_Dis_Price: p.Max_Dis_Price,
      Variation_Count: p.Variation.length,
      Popular_pick: p.Popular_pick,
      Trendy_collection: p.Trendy_collection,
      HomePage: p.HomePage,
      Product_Status: p.Product_Status,
      Product_Label: p.Product_Label,
      Shipping: p.Shipping,
      category: p.Category[0]?.Category_Name,
      brand: p.Brand_Name?.Data_Name,
      collection: p.Collections?.Data_Name,
    }));

    // 🔹 FRONTEND products (only active)
    const activeProducts = allProducts.filter((p) => p.Product_Status === true);

    const frontendProducts = activeProducts.map((p) => ({
      _id: p._id,
      Product_Name: p.Product_Name,
      SKU_Code: p.SKU_Code,
      Product_Label: p.Product_Label,
    }));

    // 🔹 RESPONSE
    res.json({
      type: "success",
      message: "Products found successfully!",
      product: adminProducts,
      product_data: frontendProducts,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      type: "error",
      message: "Failed to fetch products",
    });
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
          { "Collections.Data_Name": { $regex: regexSearch } },
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
        path: "Collections",
        select: "Data_Name",
      });

    if (products) {
      // for data table (admin)
      const adminProducts = products.map((product) => ({
        _id: product._id,
        Product_Name: product.Product_Name,
        SKU_Code: product.SKU_Code,
        Product_Image: `http://${process.env.IP_ADDRESS}/${product?.Product_Image?.path?.replace(/\\/g, "/")}`,
        Brand: {
          _id: product?.Brand_Name?._id,
          Brand_Name: product.Brand_Name?.Data_Name,
        },
        Collections: {
          _id: product?.Collections?._id,
          Collections: product.Collections?.Data_Name,
        },
        Product_Dis_Price: product.Product_Dis_Price,
        Product_Ori_Price: product.Product_Ori_Price,
        Max_Dis_Price: product.Max_Dis_Price,
        Gold_Price: product.Gold_Price,
        Silver_Price: product.Silver_Price,
        PPO_Price: product.PPO_Price,
        Variation_Count: product.Variation.length,
        Popular_pick: product.Popular_pick,
        Trendy_collection: product.Trendy_collection,
        HomePage: product.HomePage,
        Product_Status: product.Product_Status,
        Product_Label: product.Product_Label,
        Shipping: product?.Shipping,
        category: product.Category[0]?.Category_Name,
        brand: product.Brand_Name?.Data_Name,
        collections: product.Collections?.Data_Name,
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
        Product_Image: `${process.env.IP_ADDRESS
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
        path: "Collections",
        select: "Data_Name",
      });

    if (products) {
      const frontendProducts = {
        _id: products._id,
        Product_Name: products.Product_Name,
        SKU_Code: products.SKU_Code,
        Product_Images: products.Product_Images,
        Category: products?.Category?.map((category) => ({
          _id: category?._id,
          Category_Name: category?.Category_Name,
        })),
        Brand: {
          _id: products?.Brand_Name?._id,
          Brand_Name: products.Brand_Name?.Data_Name,
        },
        Collections: {
          _id: products?.Collections?._id,
          Collections: products.Collections?.Data_Name,
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
            variation_Image: `${process.env.IP_ADDRESS}/${variation?.path?.replace(/\\/g, "/")}`,
          })),
          variation_Status: variation?.Variation_Status,
        })),
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
      .populate("Collections", "Data_Name")

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
        Product_Image: `${process.env.IP_ADDRESS
          }/${product?.Product_Image?.path?.replace(/\\/g, "/")}`,
        Category: product.Category[0]?.Category_Name,
        Brand_Name: product?.Brand_Name?.Data_Name,
        Collections: product?.Collections?.Data_Name,

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
    if (HomeFeatures === "1") {
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
        .populate("Collections", "Data_Name")
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
        .populate("Collections", "Data_Name")
    } else if (HomeFeatures === "3") {
      products = await Product.find({ Product_Status: true, HomePage: true })
        .sort({ createdAt: -1 })
        .populate("Category", "Category_Name")
        .populate({
          path: "Variation",
          select: "-__v",
        })
        .populate("Brand_Name", "Data_Name")
        .populate("Collections", "Data_Name")
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
        Product_Image: `${process.env.IP_ADDRESS
          }/${product?.Product_Image?.path?.replace(/\\/g, "/")}`,
        Category: product.Category[0]?.Category_Name,
        categoryId: product.Category[0]?._id,
        Brand_Name: product?.Brand_Name?.Data_Name,
        Collections: product?.Collections?.Data_Name,

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
      .populate("Collections", "Data_Name")
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
        Product_Image: `${process.env.IP_ADDRESS
          }/${product?.Product_Image?.path?.replace(/\\/g, "/")}`,
        Category: product.Category[0]?.Category_Name,
        CategoryId: product.Category[0]?._id,
        Brand_Name: product?.Brand_Name?.Data_Name,
        Collections: product?.Collections?.Data_Name,

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
                    variation_Image: `${process.env.IP_ADDRESS
                      }/${variation?.path?.replace(/\\/g, "/")}`,
                  })
                ),
              });
            }

            return filteredVariations;
          },
          []
        ),
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
    const { Trendy_collection, Popular_pick, HomePage } = req.body;

    const newProduct = await Product.findByIdAndUpdate(productId);

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
    try {
      const productId = req.params.id;
      const {
        Product_Name,
        SKU_Code,
        Category,
        Brand_Name,
        Collections,
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
      if (!Collections == undefined || !Collections == "") {
        existingProduct.Collections = Collections;
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
          const imagePath = `${process.env.IP_ADDRESS
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
route.put("/edit/variation/size/stock/:variationId/:sizeId",
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
