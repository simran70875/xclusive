const mongoose = require("mongoose");

// Variation Schema
const variationSchema = new mongoose.Schema(
  {
    variationName: String, // Yellow Gold, White Gold
    VariationStock: {
      type: String, // "Available", "Few Left", "Last Piece"
    }, //this could be string , admin can add anithing here.

    // ======================
    // VARIATION IMAGES
    // ======================
    variationImages: [
      {
        filename: String,
        path: String,
        originalname: String,
      },
    ],

    // ======================
    // VARIATION STATUS
    // ======================
    variationStatus: {
      type: Boolean,
      default: true,
    },

    // ======================
    // METAL SIZES (UI LEVEL)
    // ======================
    metalSizes: [
      {
        _uiId: String,
        sizeLabel: String, // 12, 14, 16 OR Small / Medium
        active: { type: Boolean, default: true },

        // ======================
        // METAL COMPONENTS
        // ======================
        metalComponents: [
          {
            metalType: String, // Gold, Silver
            purity: String, // 18, 22, 925

            size: String, // size used for calculation (can match sizeLabel)
            weight: Number, // grams
          },
        ],

        metalCharges: {
          labour: Number,
          making: Number,
        },
      },
    ],

    // ======================
    // DIAMOND TOGGLE
    // ======================
    diamondInvolved: {
      type: Boolean,
      default: false,
    },

    // ======================
    // DIAMOND SIZES
    // ======================
    diamondSizes: [
      {
        _uiId: String,
        sizeLabel: String, // Small / Medium / Large OR 0.5 / 1.0 / 1.5
        active: { type: Boolean, default: true },

        diamondComponents: [
          {
            type: { type: String, default: "Diamond" },
            shape: String, // Round
            mmSize: Number, // 1.5
            stones: Number, // count
            qualityVariants: [
              {
                quality: String, // LAB VVS/VS, Natural FG VS
                active: Boolean,
              },
            ],
          },
        ],

        diamondCharges: {
          labour: Number,
          making: Number,
        },
      },
    ],
  },
  { timestamps: true },
);

// Product Schema
const productSchema = mongoose.Schema(
  {
    Product_Name: {
      type: String,
    },
    SKU_Code: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      uppercase: true,
    },

    Category: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Categories",
      },
    ],
    Brand_Name: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Data",
    },
    Collections: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Data",
    },
    Product_Images: [
      {
        filename: {
          type: String,
        },
        path: {
          type: String,
        },
        originalname: {
          type: String,
        },
      },
    ],
    Variation: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Variations",
      },
    ],
    Description: {
      type: String,
    },
    Product_Label: {
      type: String,
    },
    Trendy_collection: {
      type: Boolean,
      default: false,
    },
    Popular_pick: {
      type: Boolean,
      default: false,
    },
    HomePage: {
      type: Boolean,
      default: false,
    },
    Product_Status: {
      type: Boolean,
      default: true,
    },
    Shipping: {
      type: String,
      default: "PRE LAUNCH",
    },
  },
  {
    timestamps: true,
  },
);

const Product = mongoose.model("Products", productSchema);
const Variation = mongoose.model("Variations", variationSchema);

module.exports = { Product, Variation };
