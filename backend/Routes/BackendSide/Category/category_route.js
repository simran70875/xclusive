const express = require("express");
const route = express.Router();
const multer = require("multer");
const Category = require("../../../Models/BackendSide/category_model");
const fs = require("fs");
const csv = require('csv-parser');
const checkAdminOrRole2 = require("../../../Middleware/checkAdminOrRole2");
const path = require("path");

// Set up multer middleware to handle file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./imageUploads/backend/category");
  },
  filename: function (req, file, cb) {
    const lowerCaseName = req.body.Category_Name?.toLowerCase();
    const extension = file.originalname.substring(
      file.originalname.lastIndexOf(".")
    );
    const isSecondary = file.fieldname === "secImage";

    // Define the filename based on whether it's a primary or secondary image
    const imageFilename = isSecondary
      ? `${lowerCaseName.replace(/\s/g, "_")}_secondary${extension}`
      : `${lowerCaseName.replace(/\s/g, "_")}${extension}`;

    cb(null, imageFilename);
  },
});

// Configure multer to handle multiple files
const upload = multer({ storage: storage });


const storage_csv = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, './imageUploads/backend/category'); // Specify the directory to store uploaded files
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
    fs.copyFileSync(localPath, destPath);

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

const normalize = (val = "") => val.trim().toLowerCase();

function buildTree(categories, parentId = null) {
  return categories
    .filter(cat =>
      String(cat.Parent_Category || null) === String(parentId)
    )
    .map(cat => ({
      ...cat.toObject(),
      children: buildTree(categories, cat._id)
    }));
}


// import categories from csv file
route.post(
  "/upload-csv",
  checkAdminOrRole2,
  uploadcsv.single("csvFile"),
  async (req, res) => {
    if (!req.file) {
      return res.status(400).json({ type: "error", message: "No file uploaded." });
    }

    const results = [];
    const uploadFolder = "./imageUploads/backend/category";

    fs.createReadStream(req.file.path)
      .pipe(csv())
      .on("data", (row) => results.push(row))
      .on("end", async () => {
        let inserted = 0;
        let skipped = 0;
        let skippedNames = [];

        try {
          for (const item of results) {
            const categoryName = normalize(item.Category_Name);
            const parentName = normalize(item.Parent_Category);

            // find parent if exists
            let parentCategoryId = null;

            if (parentName) {
              const parent = await Category.findOne({
                Category_Name: parentName
              });

              if (!parent) {
                skipped++;
                skippedNames.push(`${item.Category_Name} (Parent missing)`);
                continue;
              }

              parentCategoryId = parent._id;
            }

            // prevent duplicate under same parent
            const exists = await Category.findOne({
              Category_Name: categoryName,
              Parent_Category: parentCategoryId
            });

            if (exists) {
              skipped++;
              skippedNames.push(item.Category_Name);
              continue;
            }

            const categoryImageObj = copyLocalImage(item.Category_Image, uploadFolder);
            const categorySecImageObj = copyLocalImage(item.Category_Sec_Image, uploadFolder);

            await Category.create({
              Category_Name: categoryName,
              Parent_Category: parentCategoryId,
              Category_Label: item.Category_Label,
              Category_Status: item.Category_Status !== "false",
              Category_Feature: item.Category_Feature === "true",
              Category_Image: categoryImageObj,
              Category_Sec_Image: categorySecImageObj
            });

            inserted++;
          }

          fs.unlinkSync(req.file.path);

          return res.status(200).json({
            type: "success",
            message: "CSV processed",
            inserted,
            skipped,
            skippedNames
          });
        } catch (err) {
          console.error(err);
          return res.status(500).json({
            type: "error",
            message: "Error while processing CSV"
          });
        }
      });
  }
);

// Create Category
route.post("/add", checkAdminOrRole2,
  upload.fields([
    { name: "image", maxCount: 1 },
    { name: "secImage", maxCount: 1 }
  ]),
  async (req, res) => {
    try {
      const categoryName = normalize(req.body.Category_Name);
      const parentValue = req.body.Parent_Category;

      let parentCategoryId = null;

      if (parentValue) {
        const parent = await Category.findOne({
          $or: [
            { _id: parentValue },
            { Category_Name: normalize(parentValue) }
          ]
        });

        if (!parent) {
          return res.status(400).json({
            type: "error",
            message: "Parent category not found"
          });
        }

        parentCategoryId = parent._id;
      }

      // prevent duplicate under same parent
      const existingCategory = await Category.findOne({
        Category_Name: categoryName,
        Parent_Category: parentCategoryId
      });

      if (existingCategory) {
        return res
          .status(202)
          .json({ type: "warning", message: "Category already exists!" });
      }

      const category = new Category({
        Category_Name: categoryName,
        Parent_Category: parentCategoryId,
        Category_Label: req.body.Category_Label
      });

      if (req.files?.image) {
        const file = req.files.image[0];
        category.Category_Image = {
          filename: file.filename,
          path: file.path,
          originalname: file.originalname
        };
      }

      if (req.files?.secImage) {
        const file = req.files.secImage[0];
        category.Category_Sec_Image = {
          filename: file.filename,
          path: file.path,
          originalname: file.originalname
        };
      }

      await category.save();

      res.status(200).json({
        type: "success",
        message: "Category added successfully"
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({
        type: "error",
        message: "Server Error"
      });
    }
  }
);

// get all category
route.get("/get", checkAdminOrRole2, async (req, res) => {
  try {
    const category = await Category.find().populate("Parent_Category", "Category_Name").sort({ createdAt: -1 });
    if (category) {
      // for data table (admin)
      const result = category.map((category) => ({
        _id: category._id,
        Category_Name: category.Category_Name,
        Category_Image: `${process.env.IP_ADDRESS}/${category.Category_Image?.path?.replace(/\\/g, "/")}` || "",
        Category_Sec_Image: `${process.env.IP_ADDRESS}/${category.Category_Sec_Image?.path?.replace(/\\/g, "/")}` || "",
        Parent_Category: category.Parent_Category,
        Category_Label: category.Category_Label,
        Category_Status: category.Category_Status,
        Category_Feature: category.Category_Feature,
      }));

      // for show frontend side
      const allCategories = await Category.find({ Category_Status: true }).sort({ createdAt: -1, });
      const categories = buildTree(allCategories);

      res.status(200).json({
        type: "success",
        message: "Categories found successfully!",
        category: result || [],
        category_data: categories || [],
      });

    } else {
      res.status(404).json({
        type: "warning",
        message: " Category not found !",
        category: [],
        category_data: [],
      });
    }
  } catch (error) {
    res
      .status(500)
      .json({ type: "error", message: "Server Error!", errorMessage: error });
  }
});

// find category by id
route.get("/get/:id", checkAdminOrRole2, async (req, res) => {
  const categoryId = req.params.id;
  try {
    const category = await Category.findOne({
      _id: categoryId,
      Category_Status: true,
    });
    if (!category) {
      res
        .status(404)
        .json({
          type: "warning",
          message: " No category Found!",
          category: [],
        });
    } else {
      const result = {
        _id: category?._id,
        Category_Name: category.Category_Name,
        Category_Image: `${process.env.IP_ADDRESS
          }/${category.Category_Image?.path?.replace(/\\/g, "/")}`,
        Category_Sec_Image: `${process.env.IP_ADDRESS
          }/${category.Category_Sec_Image?.path?.replace(/\\/g, "/")}`,
        Category_Label: category.Category_Label,
      };
      res
        .status(200)
        .json({
          type: "success",
          message: "Category found successfully!",
          category: result || [],
        });
    }
  } catch (error) {
    res
      .status(500)
      .json({ type: "error", message: "Server Error!", errorMessage: error });
    console.log(error);
  }
});

// get all category on mobile
route.get("/mob/get", async (req, res) => {
  try {
    const category = await Category.find({ Category_Status: true });
    if (!category) {
      res
        .status(404)
        .json({
          type: "success",
          message: " No Category Found!",
          category: [],
        });
    } else {
      const result = category.map((category) => ({
        category_id: category._id,
        category_Name: category.Category_Name,
        category_Image:
          `${process.env.IP_ADDRESS}/${category.Category_Image?.path?.replace(
            /\\/g,
            "/"
          )}` || "",
        Category_Sec_Image:
          `${process.env.IP_ADDRESS
          }/${category.Category_Sec_Image?.path?.replace(/\\/g, "/")}` || "",
        category_Status: category.Category_Status,
      }));
      res
        .status(200)
        .json({
          type: "success",
          message: " Category found successfully!",
          category: result,
        });
    }
  } catch (error) {
    res
      .status(500)
      .json({ type: "error", message: "Server Error!", errorMessage: error });
  }
});

//  get all category on mobile
route.get("/mob/featurelist/get", async (req, res) => {
  try {
    const category = await Category.find({ Category_Feature: true });
    if (!category) {
      res
        .status(404)
        .json({
          type: "success",
          message: " No Category Found!",
          category: [],
        });
    } else {
      const result = category.map((category) => ({
        category_id: category._id,
        category_Name: category.Category_Name,
        category_Image:
          `${process.env.IP_ADDRESS}/${category.Category_Image?.path?.replace(
            /\\/g,
            "/"
          )}` || "",
        Category_Sec_Image:
          `${process.env.IP_ADDRESS
          }/${category.Category_Sec_Image?.path?.replace(/\\/g, "/")}` || "",
        category_Status: category.Category_Status,
      }));
      res
        .status(200)
        .json({
          type: "success",
          message: " Category found successfully!",
          category: result,
        });
    }
  } catch (error) {
    res
      .status(500)
      .json({ type: "error", message: "Server Error!", errorMessage: error });
  }
});

// find category by id for mob
route.get("/mob/get/:id", async (req, res) => {
  const categoryId = req.params.id;
  try {
    const category = await Category.findOne({
      _id: categoryId,
      Category_Status: true,
    });
    if (!category) {
      res
        .status(200)
        .json({ type: "warning", message: "No Category found!", category: [] });
    } else {
      const result = {
        category_id: category._id,
        category_Name: category.Category_Name,
        category_Image:
          `${process.env.IP_ADDRESS}/${category.Category_Image?.path?.replace(
            /\\/g,
            "/"
          )}` || "",
        Category_Sec_Image:
          `${process.env.IP_ADDRESS
          }/${category.Category_Sec_Image?.path?.replace(/\\/g, "/")}` || "",
        category_Status: category.Category_Status,
      };
      res
        .status(200)
        .json({
          type: "success",
          message: " Category found successfully!",
          category: result,
        });
    }
  } catch (error) {
    res
      .status(500)
      .json({ type: "error", message: "Server Error!", errorMessage: error });
    console.log(error);
  }
});

// Delete all categories
route.delete("/delete", checkAdminOrRole2, async (req, res) => {
  try {
    const categories = await Category.find();

    for (const category of categories) {
      if (
        category.Category_Image &&
        fs.existsSync(category.Category_Image.path)
      ) {
        fs.unlinkSync(category.Category_Image.path);
      }
      if (
        category.Category_Sec_Image &&
        fs.existsSync(category.Category_Sec_Image.path)
      ) {
        fs.unlinkSync(category.Category_Sec_Image.path);
      }
    }

    await Category.deleteMany();
    res
      .status(200)
      .json({
        type: "success",
        message: "All Categories deleted successfully!",
      });
  } catch (error) {
    res
      .status(500)
      .json({ type: "error", message: "Server Error!", errorMessage: error });
  }
});

// Delete many categories
route.delete("/deletes", checkAdminOrRole2, async (req, res) => {
  try {
    const { ids } = req.body;
    const categories = await Category.find({ _id: { $in: ids } });

    for (const category of categories) {
      if (
        category.Category_Image &&
        fs.existsSync(category.Category_Image.path)
      ) {
        fs.unlinkSync(category.Category_Image.path);
      }
      if (
        category.Category_Sec_Image &&
        fs.existsSync(category.Category_Sec_Image.path)
      ) {
        fs.unlinkSync(category.Category_Sec_Image.path);
      }
    }

    await Category.deleteMany({ _id: { $in: ids } });
    res
      .status(200)
      .json({
        type: "success",
        message: "All Categories deleted successfully!",
      });
  } catch (error) {
    res
      .status(500)
      .json({ type: "error", message: "Server Error!", errorMessage: error });
  }
});

// Delete category by ID
route.delete("/delete/:id", checkAdminOrRole2, async (req, res) => {
  const categoryId = req.params.id;
  try {
    const category = await Category.findById(categoryId);
    if (!category) {
      res.status(404).json({ type: "error", message: "Category not found!" });
    } else {
      if (
        category.Category_Image &&
        fs.existsSync(category.Category_Image.path)
      ) {
        fs.unlinkSync(category.Category_Image.path);
      }
      if (
        category.Category_Sec_Image &&
        fs.existsSync(category.Category_Sec_Image.path)
      ) {
        fs.unlinkSync(category.Category_Sec_Image.path);
      }

      await Category.findByIdAndDelete(categoryId);
      res
        .status(200)
        .json({ type: "success", message: "Category deleted successfully!" });
    }
  } catch (error) {
    res
      .status(500)
      .json({ type: "error", message: "Server Error!", errorMessage: error });
  }
});

// update only status
route.patch("/update/status/:id", checkAdminOrRole2, async (req, res) => {
  const CategoryId = await req.params.id;

  try {
    const { Category_Status } = req.body;
    const newCategory = await Category.findByIdAndUpdate(CategoryId);
    newCategory.Category_Status = await Category_Status;

    await newCategory.save();
    res
      .status(200)
      .json({
        type: "success",
        message: "Category Status update successfully!",
      });
  } catch (error) {
    res
      .status(500)
      .json({ type: "error", message: "Server Error!", errorMessage: error });
  }
});

// update only feature status
route.patch("/update/feature/:id", checkAdminOrRole2, async (req, res) => {
  const CategoryId = await req.params.id;

  try {
    const { Category_Feature } = req.body;
    const newCategory = await Category.findByIdAndUpdate(CategoryId);
    newCategory.Category_Feature = await Category_Feature;

    await newCategory.save();
    res
      .status(200)
      .json({
        type: "success",
        message: "Category Feature Status update successfully!",
      });
  } catch (error) {
    res
      .status(500)
      .json({ type: "error", message: "Server Error!", errorMessage: error });
  }
});

// Update category
route.patch(
  "/update/:id",
  checkAdminOrRole2,
  upload.fields([
    { name: "image", maxCount: 1 },
    { name: "secondaryImage", maxCount: 1 },
  ]),
  async (req, res) => {
    try {
      const categoryId = req.params.id;
      const { Category_Name, Category_Label } = req.body;

      const lowerCaseName = Category_Name.toLowerCase();
      const existingCategory = await Category.findOne({
        Category_Name: lowerCaseName,
        _id: { $ne: categoryId },
      });

      if (existingCategory) {
        // Handle category name conflict
        if (req.files && req.files.image) {
          fs.unlinkSync(req?.files?.image[0]?.path);
        }
        if (req?.files && req.files?.secondaryImage) {
          fs.unlinkSync(req?.files?.secondaryImage[0]?.path);
        }
        return res
          .status(409)
          .json({ type: "warning", message: "Category already exists!" });
      } else {
        const category = await Category.findById(categoryId);
        if (!category) {
          if (req.files && req.files.image) {
            try {
              fs.unlinkSync(req.files.image[0]?.path);
            } catch (err) { }
          }
          if (req.files && req.files.secondaryImage) {
            try {
              fs.unlinkSync(req.files.secondaryImage[0]?.path);
            } catch (err) { }
          }
          return res
            .status(404)
            .json({ type: "warning", message: "Category does not exist!" });
        }

        category.Category_Name = lowerCaseName;
        category.Category_Label = Category_Label;

        if (req.files && req.files.image) {
          const originalFilename = req.files.image[0].originalname;
          const extension = originalFilename.substring(
            originalFilename.lastIndexOf(".")
          );
          const timestamp = Date.now(); // Add current timestamp
          const imageFilename = `${lowerCaseName.replace(
            /\s/g,
            "_"
          )}_${timestamp}${extension}`;
          const imagePath = "imageUploads/backend/category/" + imageFilename;

          fs.renameSync(req.files.image[0].path, imagePath);

          if (category.Category_Image) {
            // fs.unlinkSync(category?.Category_Image?.path);
          }

          category.Category_Image.filename = imageFilename;
          category.Category_Image.path = imagePath;
          category.Category_Image.originalname = originalFilename;
        }

        if (req.files && req.files.secondaryImage) {
          const secondaryOriginalFilename =
            req.files.secondaryImage[0].originalname;
          const secondaryExtension = secondaryOriginalFilename.substring(
            secondaryOriginalFilename.lastIndexOf(".")
          );
          const secondaryTimestamp = Date.now(); // Add current timestamp
          const secondaryImageFilename = `${lowerCaseName.replace(
            /\s/g,
            "_"
          )}_sec_${secondaryTimestamp}${secondaryExtension}`;
          const secondaryImagePath =
            "imageUploads/backend/category/" + secondaryImageFilename;

          fs.renameSync(req.files.secondaryImage[0].path, secondaryImagePath);

          if (category.Category_Sec_Image) {
            // fs.unlinkSync(category.Category_Sec_Image.path);
          }

          category.Category_Sec_Image.filename = secondaryImageFilename;
          category.Category_Sec_Image.path = secondaryImagePath;
          category.Category_Sec_Image.originalname = secondaryOriginalFilename;
        }

        await category.save();
        res
          .status(200)
          .json({ type: "success", message: "Category updated successfully!" });
      }
    } catch (error) {
      // if (req.files && req.files.image) {
      //     fs?.unlinkSync(req?.files.image[0]?.path);
      // }
      // if (req.files && req.files.secondaryImage) {
      //     fs?.unlinkSync(req?.files?.secondaryImage[0]?.path);
      // }
      res
        .status(500)
        .json({ type: "error", message: "Server Error!", errorMessage: error });
      console.log(error);
    }
  }
);

module.exports = route;
