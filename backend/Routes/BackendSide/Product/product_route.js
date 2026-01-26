const express = require("express");
const fs = require("fs");
const path = require("path");
const route = express.Router();
const multer = require("multer");
const csv = require("csv-parser");
const axios = require("axios");
const {
  Product,
  Variation,
} = require("../../../Models/BackendSide/product_model");
const User = require("../../../Models/FrontendSide/user_model");
const Wishlist = require("../../../Models/FrontendSide/wish_list_model");
const Review = require("../../../Models/FrontendSide/review_model");

const { default: mongoose } = require("mongoose");
const checkAdminOrRole2 = require("../../../Middleware/checkAdminOrRole2");
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
  },
});

const storage_csv = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "./imageUploads/backend/product"); // Specify the directory to store uploaded files
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`); // Unique filename
  },
});

const uploadcsv = multer({ storage: storage_csv });

async function copyLocalImage(imagePath, uploadFolder) {
  if (!imagePath) return null;

  const fileName = `${Date.now()}-${path.basename(imagePath.split("?")[0])}`;
  const destPath = path.join(uploadFolder, fileName);

  // URL image
  if (/^https?:\/\//.test(imagePath)) {
    try {
      const writer = fs.createWriteStream(destPath);
      const response = await axios.get(imagePath, { responseType: "stream" });

      response.data.pipe(writer);

      await new Promise((resolve, reject) => {
        writer.on("finish", resolve);
        writer.on("error", reject);
      });

      return {
        filename: fileName,
        path: destPath,
        originalname: path.basename(imagePath),
      };
    } catch (err) {
      console.error("Image download failed:", imagePath, err.message);
      return null;
    }
  }

  // Local image
  if (fs.existsSync(imagePath)) {
    fs.copyFileSync(imagePath, destPath);

    return {
      filename: fileName,
      path: destPath,
      originalname: path.basename(imagePath),
    };
  }

  return null;
}

// 🚀 IMPORT PRODUCT CSV
route.post(
  "/upload-csv",
  checkAdminOrRole2,
  uploadcsv.single("csvFile"),
  (req, res) => {
    if (!req.file)
      return res
        .status(400)
        .json({ type: "error", message: "CSV not uploaded" });

    const uploadFolder = "./imageUploads/backend/product";
    const rows = [];

    fs.createReadStream(req.file.path)
      .pipe(csv())
      .on("data", (row) => rows.push(row))
      .on("end", async () => {
        try {
          fs.unlinkSync(req.file.path);

          // 1️⃣ GROUP ROWS BY PRODUCT
          const groupedByProduct = rows.reduce((acc, row) => {
            const key = row.SKU_Code?.trim(); // unique per product

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

            const categoryName = firstRow.Category?.trim().toLowerCase();

            const categoryDoc = categoryName
              ? await Category.findOne({ Category_Name: categoryName })
              : null;

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
            if (
              firstRow.Collection_Name &&
              firstRow.Collection_Name.trim() !== ""
            ) {
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
              productImagesArray = await Promise.all(
                firstRow.Product_Images.split("|").map((img) =>
                  copyLocalImage(img, uploadFolder),
                ),
              );

              productImagesArray = productImagesArray.filter(Boolean);
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

              // Product_Dis_Price: Number(firstRow.Product_Dis_Price),
              // Product_Ori_Price: Number(firstRow.Product_Ori_Price),
              // Max_Dis_Price: Number(firstRow.Max_Dis_Price),

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
                variationImages = await Promise.all(
                  rowsInVariation[0].Variation_Images.split("|").map((img) =>
                    copyLocalImage(img, uploadFolder),
                  ),
                );

                variationImages = variationImages.filter(Boolean);
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
                  const purity = sizeParts[3];

                  sizeArray.push({
                    Size_Name: sizeName,
                    Size_Stock: stock,
                    Size_Price: price,
                    Size_Status: true,
                    Size_purity: purity,
                  });
                }
              });

              // Create single variation
              const createdVariation = await Variation.create({
                Variation_Name: varName,
                Variation_Images: variationImages,
                Variation_Label: varName,
                Variation_Size: sizeArray,
                Variation_Status:
                  rowsInVariation[0].Variation_Status !== "false",
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
  },
);

async function generateSKU() {
  const today = new Date();
  const datePart = today.toISOString().slice(0, 10).replace(/-/g, ""); // YYYYMMDD

  const lastProduct = await Product.findOne({
    SKU_Code: { $regex: `^XD-${datePart}` },
  }).sort({ createdAt: -1 });

  let nextNumber = 1;

  if (lastProduct) {
    const lastSKU = lastProduct.SKU_Code.split("-").pop();
    nextNumber = parseInt(lastSKU, 10) + 1;
  }

  return `XD-${datePart}-${String(nextNumber).padStart(4, "0")}`;
}

// 🚀 CREATE PRODUCT WITH MULTIPLE IMAGES
route.post(
  "/add",
  checkAdminOrRole2,
  upload.array("images", 5),
  async (req, res) => {
    try {
      let {
        Product_Name,
        Category,
        Brand_Name,
        Collection_Name,
        Description,
        existingImages, // ✅ already uploaded images
      } = req.body;

      /* ---------- CATEGORY ---------- */
      const categoryIds = Array.isArray(Category)
        ? Category
        : Category?.split(",");

      /* ---------- AUTO SKU ---------- */
      const SKU_Code = await generateSKU();

      /* ---------- PARSE EXISTING IMAGES ---------- */
      let selectedImages = [];
      if (existingImages) {
        try {
          selectedImages = JSON.parse(existingImages);
        } catch {
          return res.status(400).json({
            type: "error",
            message: "Invalid existingImages format",
          });
        }
      }

      /* ---------- NEW UPLOADED IMAGES ---------- */
      const uploadedImages = (req.files || []).map((file) => {
        const ext = path.extname(file.originalname);
        const imageFilename = `${Product_Name.replace(/\s/g, "_")}_${Date.now()}_${Math.floor(
          Math.random() * 9999,
        )}${ext}`;

        const newPath = `imageUploads/backend/product/${imageFilename}`;
        fs.renameSync(file.path, newPath);

        return {
          filename: imageFilename,
          path: newPath,
          originalname: file.originalname,
        };
      });

      /* ---------- FINAL IMAGE LIST ---------- */
      const Product_Images = [...selectedImages, ...uploadedImages];

      if (Product_Images.length === 0) {
        return res.status(202).json({
          type: "warning",
          message: "Add at least one product image",
        });
      }

      /* ---------- CREATE PRODUCT ---------- */
      const product = await Product.create({
        Product_Name,
        SKU_Code,
        Category: categoryIds,
        Brand_Name,
        Collections: Collection_Name,
        Description,
        Product_Label: Product_Name,
        Product_Images,
      });

      return res.status(200).json({
        type: "success",
        message: "Product added successfully!",
        data: {
          productId: product._id,
          SKU_Code,
        },
      });
    } catch (error) {
      // cleanup new uploads
      req.files?.forEach((f) => f?.path && fs.unlinkSync(f.path));

      // duplicate SKU safety
      if (error.code === 11000) {
        return res.status(202).json({
          type: "warning",
          message: "SKU conflict, please retry",
        });
      }

      console.error(error);
      return res.status(500).json({
        type: "error",
        message: "Server Error!",
      });
    }
  },
);

// root folder where images exist
const IMAGE_ROOT = path.join(
  __dirname,
  "../../../imageUploads/backend"
);

// folders to scan
const IMAGE_FOLDERS = [
  "product",
  "variation",
];

route.get("/get-all-images", checkAdminOrRole2, async (req, res) => {
  try {
    const result = {};

    IMAGE_FOLDERS.forEach((folder) => {
      const folderPath = path.join(IMAGE_ROOT, folder);

      if (!fs.existsSync(folderPath)) {
        result[folder] = [];
        return;
      }

      const files = fs
        .readdirSync(folderPath)
        .filter((file) =>
          /\.(jpg|jpeg|png|webp|gif)$/i.test(file)
        );

      result[folder] = files.map((file) => ({
        filename: file,
        path: `imageUploads/backend/${folder}/${file}`,
        url: `${process.env.IP_ADDRESS}/imageUploads/backend/${folder}/${file}`,
      }));
    });

    res.status(200).json({
      type: "success",
      message: "Images fetched successfully",
      data: result,
    });
  } catch (error) {
    console.error("Fetch images error:", error);
    res.status(500).json({
      type: "error",
      message: "Failed to fetch images",
    });
  }
});

// get all product
route.get("/get", async (req, res) => {
  try {
    const products = await Product.aggregate([
      { $sort: { createdAt: -1 } },

      /* ---------- POPULATE CATEGORY ---------- */
      {
        $lookup: {
          from: "categories",
          localField: "Category",
          foreignField: "_id",
          as: "Category",
        },
      },

      { $unwind: { path: "$Category", preserveNullAndEmptyArrays: true } },

      /* ---------- CATEGORY HIERARCHY ---------- */
      {
        $graphLookup: {
          from: "categories",
          startWith: "$Category.Parent_Category",
          connectFromField: "Parent_Category",
          connectToField: "_id",
          as: "categoryHierarchy",
        },
      },

      /* ---------- ORDER TOP → CHILD ---------- */
      {
        $addFields: {
          categoryHierarchy: {
            $reverseArray: "$categoryHierarchy",
          },
        },
      },

      /* ---------- STRING PATH ---------- */
      {
        $addFields: {
          category_path: {
            $reduce: {
              input: {
                $concatArrays: [
                  {
                    $map: {
                      input: "$categoryHierarchy",
                      as: "cat",
                      in: "$$cat.Category_Name",
                    },
                  },
                  ["$Category.Category_Name"],
                ],
              },
              initialValue: "",
              in: {
                $cond: [
                  { $eq: ["$$value", ""] },
                  "$$this",
                  { $concat: ["$$value", " > ", "$$this"] },
                ],
              },
            },
          },
        },
      },

      /* ---------- POPULATE BRAND ---------- */
      {
        $lookup: {
          from: "datas",
          localField: "Brand_Name",
          foreignField: "_id",
          as: "Brand_Name",
        },
      },
      { $unwind: { path: "$Brand_Name", preserveNullAndEmptyArrays: true } },

      /* ---------- POPULATE COLLECTION ---------- */
      {
        $lookup: {
          from: "datas",
          localField: "Collections",
          foreignField: "_id",
          as: "Collections",
        },
      },
      { $unwind: { path: "$Collections", preserveNullAndEmptyArrays: true } },
    ]);

    if (!products.length) {
      return res.status(404).json({
        type: "warning",
        message: "Products not found!",
      });
    }

    /* ================= ADMIN PRODUCTS ================= */
    const adminProducts = products.map((p) => ({
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

      Variation_Count: p.Variation?.length || 0,
      Popular_pick: p.Popular_pick,
      Trendy_collection: p.Trendy_collection,
      HomePage: p.HomePage,
      Product_Status: p.Product_Status,
      Product_Label: p.Product_Label,
      Shipping: p.Shipping,

      // ✅ NEW
      category_path: p.category_path,

      // old fields kept
      category: p.Category?.Category_Name,
      brand: p.Brand_Name?.Data_Name,
      collection: p.Collections?.Data_Name,
      createdAt: p.createdAt,
      updatedAt: p.updatedAt,
    }));

    /* ================= FRONTEND PRODUCTS ================= */
    const frontendProducts = products
      .filter((p) => p.Product_Status === true)
      .map((p) => ({
        _id: p._id,
        Product_Name: p.Product_Name,
        SKU_Code: p.SKU_Code,
        Product_Label: p.Product_Label,

        // optional but useful for frontend
        category_path: p.category_path,
      }));

    /* ================= RESPONSE ================= */
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
        Product_Image: `http://${
          process.env.IP_ADDRESS
        }/${product?.Product_Image?.path?.replace(/\\/g, "/")}`,
        Brand: {
          _id: product?.Brand_Name?._id,
          Brand_Name: product.Brand_Name?.Data_Name,
        },
        Collections: {
          _id: product?.Collections?._id,
          Collections: product.Collections?.Data_Name,
        },
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

        Description: products.Description,
        Product_Label: products.Product_Label,
        Variation_Count: products.Variation.length,
        Variation: products?.Variation,
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
      .populate("Collections", "Data_Name");

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
        Collections: product?.Collections?.Data_Name,
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
  try {
    const { HomeFeatures, userId } = req.query;

    let user = null;
    if (userId && userId !== "0") {
      user = await User.findById(userId);
    }

    let filter = { Product_Status: true };

    if (HomeFeatures === "1") filter.Popular_pick = true;
    else if (HomeFeatures === "2") filter.Trendy_collection = true;
    else if (HomeFeatures === "3") filter.HomePage = true;

    const products = await Product.find(filter)
      .populate("Category", "Category_Name")
      .populate("Brand_Name", "Data_Name")
      .populate("Collections", "Data_Name")
      .populate({
        path: "Variation",
        select: "-__v",
      })
      .sort({ createdAt: -1 });

    const userWishlist = userId ? await getWishList(userId) : [];

    const result = products.map((product) => {
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

        // ✅ MAIN PRODUCT IMAGE (from variation)
        Product_Image: firstVariation?.Variation_Images?.[0]?.path
          ? `${
              process.env.IP_ADDRESS
            }/${firstVariation.Variation_Images[0].path.replace(/\\/g, "/")}`
          : null,

        // ✅ PRICE DETAILS
        price: firstSize?.Size_Price || 0,
        purity: firstSize?.Size_Purity || null,
        size: firstSize?.Size_Name || null,

        // ✅ Full variation (for product detail page)
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
    });

    return res.status(200).json({
      type: "success",
      message: "Products fetched successfully",
      products: result,
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
    0,
  );

  let rating = totalRating / reviewsForProduct.length;
  rating = rating.toFixed(1);
  return rating;
}

// get product using id
route.get("/mob/get/single/:id", async (req, res) => {
  const userId = req?.query?.userId;
  const productId = req.params.id;

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
      .populate("Collections", "Data_Name");

    if (!product) {
      return res
        .status(200)
        .json({ type: "warning", message: "No products found!", products: [] });
    } else {
      const result = {
        _id: product._id,
        Product_Name: product.Product_Name,
        SKU_Code: product.SKU_Code,
        Product_Image: `${process.env.IP_ADDRESS}/${product?.Product_Image?.path?.replace(/\\/g, "/")}`,
        Category: product.Category[0]?.Category_Name,
        CategoryId: product.Category[0]?._id,
        Brand_Name: product?.Brand_Name?.Data_Name,
        Collections: product?.Collections?.Data_Name,

        Description: product.Description,
        Product_Label: product.Product_Label,
        Variation_Count: product.Variation.length,
        variation: product?.Variation?.reduce(
          (filteredVariations, variation) => {
            const filteredSizes = variation?.Variation_Size?.filter(
              (size) => size?.Size_Stock > 0,
            );

            if (filteredSizes.length > 0) {
              filteredVariations.push({
                variation_Id: variation?._id,
                variation_Name: variation?.Variation_Name,
                variation_Sizes: filteredSizes?.map((variation) => ({
                  id: variation?._id,
                  name: variation?.Size_Name,
                  stock: variation?.Size_Stock,
                  price: variation?.Size_Price,
                  purity: variation?.Size_purity,
                })),
                variation_Images: variation?.Variation_Images?.map(
                  (variation) => ({
                    variation_Image: `${
                      process.env.IP_ADDRESS
                    }/${variation?.path?.replace(/\\/g, "/")}`,
                  }),
                ),
              });
            }

            return filteredVariations;
          },
          [],
        ),
        Popular_pick: product.Popular_pick,
        HomePage: product.HomePage,
        Trendy_collection: product.Trendy_collection,
        isFavorite: userWishlist.includes(product._id?.toString()),
        ratings: ratings,
      };

      res
        .status(200)
        .json({
          type: "success",
          message: "Products found successfully!",
          product: result,
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
      product.Variation.map((variation) => variation._id),
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
  upload.array("images", 5),
  async (req, res) => {
    try {
      const productId = req.params.id;
      const {
        Product_Name,
        SKU_Code,
        Category,
        Brand_Name,
        Collections,
        Description,
        existingImages,
      } = req.body;

      /* ---------- FIND PRODUCT ---------- */
      const existingProduct = await Product.findById(productId);
      if (!existingProduct) {
        return res.status(404).json({
          type: "warning",
          message: "Product not found!",
        });
      }

      /* ---------- CATEGORY ---------- */
      if (Category) {
        const categoryIds = Array.isArray(Category)
          ? Category
          : Category.split(",");
        existingProduct.Category = categoryIds.map(
          (id) => new mongoose.Types.ObjectId(id),
        );
      }

      /* ---------- SKU CHECK ---------- */
      if (
        SKU_Code &&
        SKU_Code.trim().toUpperCase() !== existingProduct.SKU_Code
      ) {
        const duplicateSKU = await Product.findOne({
          SKU_Code: SKU_Code.trim().toUpperCase(),
          _id: { $ne: productId },
        });

        if (duplicateSKU) {
          return res.status(202).json({
            type: "warning",
            message: "Product with same SKU already exists!",
          });
        }
      }

      /* ---------- UPDATE FIELDS ---------- */
      if (Product_Name) existingProduct.Product_Name = Product_Name;
      if (SKU_Code) existingProduct.SKU_Code = SKU_Code.trim().toUpperCase();

      if (Brand_Name) existingProduct.Brand_Name = Brand_Name;
      if (Collections) existingProduct.Collections = Collections;
      if (Description !== undefined) existingProduct.Description = Description;

      /* ---------- HANDLE EXISTING IMAGES ---------- */
      let finalImages = [];
      if (existingImages) {
        finalImages = JSON.parse(existingImages);
      }

      /* ---------- HANDLE NEW IMAGES ---------- */
      if (req.files && req.files.length > 0) {
        const newImages = req.files.map((file) => {
          const ext = path.extname(file.originalname);
          const filename = `${existingProduct.Product_Name.replace(
            /\s/g,
            "_",
          )}_${Date.now()}${ext}`;

          const imagePath = `imageUploads/backend/product/${filename}`;
          fs.renameSync(file.path, imagePath);

          return {
            filename,
            path: imagePath,
            originalname: file.originalname,
          };
        });

        finalImages = [...finalImages, ...newImages];
      }

      existingProduct.Product_Images = finalImages;

      await existingProduct.save();

      return res.status(200).json({
        type: "success",
        message: "Product updated successfully!",
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({
        type: "error",
        message: "Server Error!",
      });
    }
  },
);

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
          (size) => size.Size_Stock >= 0 && size.Size_Stock <= 2,
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
            })),
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
        (size) => size._id.toString() === sizeId,
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
  },
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
