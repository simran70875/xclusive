const express = require("express");
const route = express.Router();
const multer = require("multer");
const {
  Variation,
  Product,
} = require("../../../Models/BackendSide/product_model");
const fs = require("fs");
const checkAdminOrRole2 = require("../../../Middleware/checkAdminOrRole2");
const diamondPriceMaster = require("../../../Models/FrontendSide/diamondPriceMaster");
const metalPriceMaster = require("../../../Models/FrontendSide/metalPriceMaster");

// Set up multer storage and limits
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "imageUploads/backend/variation");
  },
  filename: (req, file, cb) => {
    const extension = file.originalname.split(".").pop();
    cb(
      null,
      `${Date.now()}_${Math.random().toString(36).substr(2, 9)}.${extension}`,
    );
  },
});
const upload = multer({ storage, limits: { fileSize: 5 * 1024 * 1024 } }); // 5 MB limit

// Create variations
route.post(
  "/add/:productId",
  checkAdminOrRole2,
  upload.array("images", 5),
  async (req, res) => {
    try {
      const productId = req.params.productId;

      if (!productId || productId === "undefined") {
        return res.status(400).json({
          type: "error",
          message: "Invalid productId",
        });
      }
      const {
        variationName,
        variationStock, // ✅ STRING
        metalSizes,
        diamondInvolved,
        diamondSizes,
        existingImages, // ✅ JSON array
      } = req.body;

      // 1️⃣ Find product
      const product = await Product.findById(productId);
      if (!product) {
        return res.status(404).json({
          type: "error",
          message: "Product not found",
        });
      }

      // 2️⃣ Newly uploaded images
      const uploadedImages = (req.files || []).map((file) => ({
        filename: file.filename,
        path: file.path,
        originalname: file.originalname,
      }));

      // 3️⃣ Existing images (parse JSON safely)
      let selectedImages = [];
      if (existingImages) {
        try {
          selectedImages = JSON.parse(existingImages);
        } catch (err) {
          return res.status(400).json({
            type: "error",
            message: "Invalid existingImages format",
          });
        }
      }

      // 4️⃣ Merge both image sources
      const finalImages = [...selectedImages, ...uploadedImages];

      // 5️⃣ Create variation
      const variation = await Variation.create({
        variationName,
        VariationStock: variationStock, // ✅ string
        variationImages: finalImages,
        metalSizes: metalSizes ? JSON.parse(metalSizes) : [],
        diamondInvolved: diamondInvolved === "true",
        diamondSizes: diamondSizes ? JSON.parse(diamondSizes) : [],
      });

      // 6️⃣ Attach variation to product
      product.Variation.push(variation._id);
      await product.save();

      res.status(200).json({
        type: "success",
        message: "Variation added successfully",
        data: variation,
      });
    } catch (error) {
      console.error("Add variation error:", error);

      // 🔥 DELETE ONLY NEWLY UPLOADED FILES
      if (req.files?.length) {
        req.files.forEach((file) => {
          try {
            fs.unlinkSync(file.path);
          } catch (err) {
            console.warn("Failed to cleanup file:", file.path);
          }
        });
      }

      res.status(500).json({
        type: "error",
        message: "Failed to add variation",
      });
    }
  },
);

function calculateMetalPrice(metalComponent, metalMaster) {
  const { purity, weight } = metalComponent;

  const basePurity = metalMaster.basePurity; // usually 24
  const baseRate = metalMaster.baseRate; // live rate per gram (24K)

  const purityFactor = purity / basePurity;

  const price = baseRate * purityFactor * weight;

  return Number(price.toFixed(2));
}

function calculateRoundDiamond(component, diamondPriceMaster) {
  const { shape, mmSize, stones, qualityVariants } = component;

  const master = diamondPriceMaster.find(
    (d) => d.shape === shape && d.mmFrom <= mmSize && d.mmTo >= mmSize,
  );

  if (!master) return null;

  const avgCaratPerStone = (master.caratWeightFrom + master.caratWeightTo) / 2;

  const totalCarat = avgCaratPerStone * stones;

  const calculatedQualities = qualityVariants.map((q) => {
    const ratePerCrt = master.qualityRates[q.quality] || 0;

    return {
      quality: q.quality,
      pricePerCrt: ratePerCrt,
      finalPrice: Number((ratePerCrt * totalCarat).toFixed(2)),
      active: q.active,
    };
  });

  return {
    avgCaratPerStone: Number(avgCaratPerStone.toFixed(4)),
    totalCrt: Number(totalCarat.toFixed(3)),
    qualityVariants: calculatedQualities,
  };
}

// get all variation
route.get("/get", checkAdminOrRole2, async (req, res) => {
  try {
    // 1️⃣ Load all master data
    const metalMasters = await metalPriceMaster.find(); // Gold, Silver, etc.
    const diamondMasters = await diamondPriceMaster.find(); // Round slabs

    const variations = await Variation.find().sort({ createdAt: -1 });

    const result = variations.map((variation) => {
      // ===============================
      // METAL SIZE CALCULATIONS
      // ===============================
      const calculatedMetalSizes = variation.metalSizes.map((size) => {
        let metalSubTotal = 0;

        const calculatedComponents = size.metalComponents.map((component) => {
          const metalMaster = metalMasters.find(
            (m) =>
              m.metalName.toLowerCase() === component.metalType.toLowerCase(),
          );

          if (!metalMaster) {
            return {
              ...component,
              price: 0,
            };
          }

          const price = calculateMetalPrice(component, metalMaster);
          metalSubTotal += price;

          return {
            ...component,
            price,
          };
        });

        const labour = size.metalCharges?.labour || 0;
        const making = size.metalCharges?.making || 0;

        return {
          sizeLabel: size.sizeLabel,
          active: size.active,
          metalComponents: calculatedComponents,
          metalCharges: {
            subTotalPrice: Number(metalSubTotal.toFixed(2)),
            labour,
            making,
            finalPrice: Number((metalSubTotal + labour + making).toFixed(2)),
          },
        };
      });

      // ===============================
      // DIAMOND SIZE CALCULATIONS
      // ===============================
      const calculatedDiamondSizes = variation.diamondSizes.map((size) => {
        const calculatedComponents = size.diamondComponents.map((component) => {
          if (component.shape !== "Round") return component;

          const calc = calculateRoundDiamond(component, diamondMasters);

          return {
            ...component,
            ...calc,
          };
        });

        return {
          sizeLabel: size.sizeLabel,
          active: size.active,
          diamondComponents: calculatedComponents,
          diamondCharges: size.diamondCharges,
        };
      });

      // ===============================
      // FINAL VARIATION RESPONSE
      // ===============================
      return {
        _id: variation._id,
        variationName: variation.variationName,
        VariationStock: variation.VariationStock,
        variationStatus: variation.variationStatus,

        variationImages: (variation.variationImages || []).map((img) => ({
          url: `${process.env.IP_ADDRESS}/${img.path.replace(/\\/g, "/")}`,
          filename: img.filename,
        })),

        metalSizes: calculatedMetalSizes,
        diamondInvolved: variation.diamondInvolved,
        diamondSizes: calculatedDiamondSizes,

        createdAt: variation.createdAt,
      };
    });

    res.status(200).json({
      type: "success",
      message: "Variations fetched successfully",
      data: result,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      type: "error",
      message: "Server error",
      errorMessage: error.message,
    });
  }
});

// find variation by id
route.get("/get/:id", checkAdminOrRole2, async (req, res) => {
  try {
    // 1️⃣ Load masters
    const metalMasters = await metalPriceMaster.find();
    const diamondMasters = await diamondPriceMaster.find();

    // 2️⃣ Load variation
    const variation = await Variation.findById(req.params.id);
    if (!variation) {
      return res.status(404).json({
        type: "warning",
        message: "Variation not found",
      });
    }

    // ===============================
    // METAL SIZE CALCULATIONS
    // ===============================
    const calculatedMetalSizes = variation.metalSizes.map((size) => {
      let metalSubTotal = 0;

      const calculatedComponents = size.metalComponents.map((component) => {
        const metalMaster = metalMasters.find(
          (m) =>
            m.metalName.toLowerCase() === component.metalType.toLowerCase(),
        );

        if (!metalMaster) {
          return {
            ...component,
            price: 0,
          };
        }

        const price = calculateMetalPrice(component, metalMaster);
        metalSubTotal += price;

        return {
          ...component,
          price,
        };
      });

      const labour = size.metalCharges?.labour || 0;
      const making = size.metalCharges?.making || 0;

      return {
        sizeLabel: size.sizeLabel,
        active: size.active,
        metalComponents: calculatedComponents,
        metalCharges: {
          subTotalPrice: Number(metalSubTotal.toFixed(2)),
          labour,
          making,
          finalPrice: Number((metalSubTotal + labour + making).toFixed(2)),
        },
      };
    });

    // ===============================
    // DIAMOND SIZE CALCULATIONS
    // ===============================
    const calculatedDiamondSizes = variation.diamondSizes.map((size) => {
      const calculatedComponents = size.diamondComponents.map((component) => {
        if (component.shape !== "Round") return component;

        const calc = calculateRoundDiamond(component, diamondMasters);

        return {
          ...component,
          ...calc,
        };
      });

      return {
        sizeLabel: size.sizeLabel,
        active: size.active,
        diamondComponents: calculatedComponents,
        diamondCharges: size.diamondCharges,
      };
    });

    // ===============================
    // FINAL RESPONSE
    // ===============================
    res.status(200).json({
      type: "success",
      message: "Variation found",
      data: {
        _id: variation._id,
        variationName: variation.variationName,
        VariationStock: variation.VariationStock,
        variationStatus: variation.variationStatus,

        variationImages: (variation.variationImages || []).map((img) => ({
          url: `${process.env.IP_ADDRESS}/${img.path.replace(/\\/g, "/")}`,
          filename: img.filename,
        })),

        metalSizes: calculatedMetalSizes,
        diamondInvolved: variation.diamondInvolved,
        diamondSizes: calculatedDiamondSizes,

        createdAt: variation.createdAt,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      type: "error",
      message: "Server error",
      errorMessage: error.message,
    });
  }
});

// Delete variation by ID
route.delete("/:id", checkAdminOrRole2, async (req, res) => {
  try {
    const variation = await Variation.findByIdAndDelete(req.params.id);

    if (!variation) {
      return res.status(404).json({
        type: "warning",
        message: "Variation not found",
      });
    }

    res.status(200).json({
      type: "success",
      message: "Variation deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      type: "error",
      message: "Server error",
      errorMessage: error.message,
    });
  }
});

// Delete many variations
route.delete("/deletes", checkAdminOrRole2, async (req, res) => {
  try {
    const { ids } = req.body;

    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({
        type: "warning",
        message: "No variation IDs provided",
      });
    }

    await Variation.deleteMany({ _id: { $in: ids } });

    res.status(200).json({
      type: "success",
      message: "Selected variations deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      type: "error",
      message: "Server error",
      errorMessage: error.message,
    });
  }
});

// Delete all variations
route.delete("/delete", checkAdminOrRole2, async (req, res) => {
  try {
    await Variation.deleteMany();

    res.status(200).json({
      type: "success",
      message: "All variations deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      type: "error",
      message: "Server error",
      errorMessage: error.message,
    });
  }
});

// update only status
route.patch("/update/status/:id", checkAdminOrRole2, async (req, res) => {
  try {
    const { variationStatus } = req.body;

    const variation = await Variation.findByIdAndUpdate(
      req.params.id,
      { variationStatus },
      { new: true },
    );

    if (!variation) {
      return res.status(404).json({
        type: "error",
        message: "Variation not found",
      });
    }

    res.status(200).json({
      type: "success",
      message: "Variation status updated",
    });
  } catch (error) {
    res.status(500).json({
      type: "error",
      message: "Server error",
      errorMessage: error.message,
    });
  }
});

// update only metal size status
route.patch(
  "/update/metal-size/status/:variationId/:sizeId",
  checkAdminOrRole2,
  async (req, res) => {
    try {
      const { active } = req.body;

      const variation = await Variation.findById(req.params.variationId);
      if (!variation) {
        return res.status(404).json({ message: "Variation not found" });
      }

      const size = variation.metalSizes.id(req.params.sizeId);
      if (!size) {
        return res.status(404).json({ message: "Metal size not found" });
      }

      size.active = active;
      await variation.save();

      res.status(200).json({
        type: "success",
        message: "Metal size status updated",
      });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },
);

// add new metal size
route.post(
  "/add/metal-size/:variationId",
  checkAdminOrRole2,
  async (req, res) => {
    try {
      const { sizeLabel, metalComponents, metalCharges } = req.body;

      const variation = await Variation.findById(req.params.variationId);
      if (!variation) {
        return res.status(404).json({ message: "Variation not found" });
      }

      variation.metalSizes.push({
        sizeLabel,
        metalComponents,
        metalCharges,
        active: true,
      });

      await variation.save();

      res.status(201).json({
        type: "success",
        message: "Metal size added successfully",
      });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },
);

// Delete metal size
route.delete(
  "/delete/metal-size/:variationId/:sizeId",
  checkAdminOrRole2,
  async (req, res) => {
    try {
      const variation = await Variation.findById(req.params.variationId);
      if (!variation) {
        return res.status(404).json({ message: "Variation not found" });
      }

      variation.metalSizes = variation.metalSizes.filter(
        (s) => s._id.toString() !== req.params.sizeId,
      );

      await variation.save();

      res.status(200).json({
        type: "success",
        message: "Metal size deleted",
      });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },
);

// Update variation by id
route.patch(
  "/update/:variationId",
  checkAdminOrRole2,
  upload.array("images", 5),
  async (req, res) => {
    try {
      const { variationName, VariationStock, existingImages } = req.body;

      const variation = await Variation.findById(req.params.variationId);
      if (!variation) {
        return res.status(404).json({ message: "Variation not found" });
      }

      // Existing images (from media library)
      let images = [];
      if (existingImages) {
        images = JSON.parse(existingImages);
      }

      // New uploads
      if (req.files?.length) {
        const uploaded = req.files.map((file) => ({
          filename: file.filename,
          path: file.path,
          originalname: file.originalname,
        }));
        images.push(...uploaded);
      }

      variation.variationName = variationName;
      variation.VariationStock = VariationStock;
      variation.variationImages = images;

      await variation.save();

      res.status(200).json({
        type: "success",
        message: "Variation updated successfully",
      });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },
);

// Add a new size to a variation
route.post(
  "/add/:productId",
  checkAdminOrRole2,
  upload.array("images", 5),
  async (req, res) => {
    try {
      const {
        variationName,
        VariationStock,
        metalSizes,
        diamondInvolved,
        diamondSizes,
        qualityVariants,
        existingImages,
      } = req.body;

      let images = existingImages ? JSON.parse(existingImages) : [];

      if (req.files?.length) {
        images.push(
          ...req.files.map((f) => ({
            filename: f.filename,
            path: f.path,
            originalname: f.originalname,
          })),
        );
      }

      const variation = await Variation.create({
        variationName,
        VariationStock,
        variationImages: images,
        metalSizes: JSON.parse(metalSizes || "[]"),
        diamondInvolved,
        diamondSizes: JSON.parse(diamondSizes || "[]"),
        qualityVariants: JSON.parse(qualityVariants || "[]"),
      });

      await Product.findByIdAndUpdate(req.params.productId, {
        $push: { Variation: variation._id },
      });

      res.status(201).json({
        type: "success",
        message: "Variation added successfully",
        variation,
      });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },
);

module.exports = route;
