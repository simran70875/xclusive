const express = require("express");
const multer = require("multer");
const route = express.Router();
const GeneralSettingsModel = require("../../../Models/Settings/general_settings_model");
const AdminModel = require("../../../Models/Admin/admin_model");
const bcrypt = require("bcrypt");
const fs = require("fs");
const checkAdminRole = require("../../../Middleware/adminMiddleWares");

// Set up multer middleware to handle file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./imageUploads/backend/setting");
  },
  filename: function (req, file, cb) {
    cb(null, file?.originalname);
  },
});

const upload = multer({ storage: storage });

// Updated multer middleware to handle multiple file uploads
const uploadFields = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
    if (file.fieldname === "image" || file.fieldname === "upi_image") {
      cb(null, true);
    } else {
      cb(new Error("Invalid field name"));
    }
  },
});

// Add route for adding data from request body
route.post("/add", checkAdminRole,
  upload.fields([
    { name: "image", maxCount: 1 },
    { name: "upi_image", maxCount: 1 },
  ]),
  async (req, res) => {
    const {
      app_name,
      app_author,
      app_contact,
      app_email,
      app_website,
      app_description,
      app_developed_by,
      app_privacy_policy,
      app_return_refund_policy,
      app_cod_policy,
      app_terms_condition,
      app_cancellation_refund,
      app_about_us,
      app_youtube_video,
      app_memberShip_video,
      app_contact_us,
      app_faq,
      min_order,
      delivery_charge,
      min_delivery_free,
      onesignal_app_id,
      onesignal_rest_key,
      app_version,
      app_maintenance_status,
      app_maintenance_description,
      app_update_description,
      app_update_cancel_button,
      factor_apikey,
      app_update_factor_button,
      firebase_server_key,
      razorpay_key,
      map_api_key,
      cash_on_delivery_available,
      gst_charge,
      price_convert_coin,
      min_wallet_amount_limit,
      coin_withdrawal_limit,
      address,
      pan_no,
      gst_no,
      bank_name,
      account_no,
      ifsc_code,
      branch_name,
      review_reward_amount,
    } = req.body;

    try {
      const newDocument = new GeneralSettingsModel({
        app_name: app_name || "",
        app_author: app_author || "",
        app_contact: app_contact || "",
        app_email: app_email || "",
        app_website: app_website || "",
        app_description: app_description || "",
        app_developed_by: app_developed_by || "",
        app_privacy_policy: app_privacy_policy || "",
        app_cod_policy: app_cod_policy || "",
        app_youtube_video: app_youtube_video || "",
        app_memberShip_video: app_memberShip_video || "",
        app_return_refund_policy: app_return_refund_policy || "",
        app_terms_condition: app_terms_condition || "",
        app_cancellation_refund: app_cancellation_refund || "",
        app_about_us: app_about_us || "",
        app_contact_us: app_contact_us || "",
        app_faq: app_faq || "",
        min_order: min_order || "",
        delivery_charge: delivery_charge || "",
        min_delivery_free: min_delivery_free || "",
        onesignal_app_id: onesignal_app_id || "",
        onesignal_rest_key: onesignal_rest_key || "",
        app_version: app_version || "",
        app_maintenance_status: app_maintenance_status || false,
        app_maintenance_description: app_maintenance_description || "",
        app_update_description: app_update_description || "",
        app_update_cancel_button: app_update_cancel_button || false,
        factor_apikey: factor_apikey || "",
        app_update_factor_button: app_update_factor_button || false,
        firebase_server_key: firebase_server_key || "",
        razorpay_key: razorpay_key || "",
        map_api_key: map_api_key || "",
        cash_on_delivery_available: cash_on_delivery_available || "",
        gst_charge: gst_charge || "",
        coin_withdrawal_limit: coin_withdrawal_limit || 0,
        min_wallet_amount_limit: min_wallet_amount_limit || 0,
        price_convert_coin: price_convert_coin || 1,
        address: address || "",
        pan_no: pan_no || "",
        gst_no: gst_no || "",
        bank_name: bank_name || "",
        account_no: account_no || "",
        ifsc_code: ifsc_code || "",
        branch_name: branch_name || "",
        review_reward_amount: review_reward_amount || 0,
      });

      await newDocument.save();

      if (req.files && req.files["image"]) {
        const originalFilename = req.files["image"][0].originalname;
        const extension = originalFilename.substring(
          originalFilename.lastIndexOf(".")
        );
        const imageFilename = `${app_name.replace(/\s/g, "_")}${extension}`;
        const imagePath = "imageUploads/backend/setting/" + imageFilename;

        fs.renameSync(req.files["image"][0]?.path, imagePath);

        const image = {
          filename: imageFilename,
          path: imagePath,
          originalname: originalFilename,
        };
        newDocument.app_logo = image;

        await newDocument.save();
      }

      if (req.files && req.files["upi_image"]) {
        const originalFilename = req.files["upi_image"][0].originalname;
        const extension = originalFilename.substring(
          originalFilename.lastIndexOf(".")
        );
        const imageFilename = `${app_name.replace(/\s/g, "_")}_upi${extension}`;
        const imagePath = "imageUploads/backend/setting/" + imageFilename;

        fs.renameSync(req.files["upi_image"][0]?.path, imagePath);

        const images = {
          filename: imageFilename,
          path: imagePath,
          originalname: originalFilename,
        };
        newDocument.app_upi_image = images;

        await newDocument.save();
      }

      res
        .status(200)
        .json({ type: "success", message: "Data added successfully" });
    } catch (error) {
      // if (req.files && req.files['image']) {
      //     fs.unlinkSync(req.files['image'][0]?.path);
      // }
      // if (req.files && req.files['upi_image']) {
      //     fs.unlinkSync(req.files['upi_image'][0]?.path);
      // }
      res
        .status(500)
        .json({
          type: "error",
          message: "Failed to add data",
          error: error.message,
        });
    }
  }
);

// get all settings
route.get("/get", async (req, res) => {
  try {
    const settings = await GeneralSettingsModel.find();
    let newsettings;
    if (settings?.length >= 1) {
      newsettings = {
        ...settings?.[0].toObject(),
        app_logo:
          `${process.env.IP_ADDRESS}/${settings?.[0]?.app_logo?.path}` ||
          "",
        app_upi_image:
          `${process.env.IP_ADDRESS}/${settings?.[0]?.app_upi_image?.path}` ||
          "",
      };
    }
    res
      .status(200)
      .json({
        type: "success",
        message: "Settings get successfully!",
        Settings: newsettings || {},
      });
  } catch (error) {
    res
      .status(500)
      .json({ type: "error", message: "Server Error!", errorMessage: error });
  }
});

// get settings by id
route.get("/get/:id", async (req, res) => {
  const settingId = req.params.id;
  try {
    const settings = await GeneralSettingsModel.findById(settingId);
    if (!settings) {
      return res
        .status(200)
        .json({ type: "error", message: "settings not found!" });
    }
    res
      .status(200)
      .json({
        type: "success",
        message: "settings get successfully!",
        settings: settings,
      });
  } catch (error) {
    res
      .status(500)
      .json({ type: "error", message: "Server Error!", errorMessage: error });
    console.log(error);
  }
});

// delete All charges
route.delete("/delete", checkAdminRole, async (req, res) => {
  try {
    await GeneralSettingsModel.deleteMany();
    res
      .status(200)
      .json({ type: "success", message: "All settings deleted successfully!" });
  } catch (error) {
    res
      .status(500)
      .json({ type: "error", message: "Server Error!", errorMessage: error });
    console.log(error);
  }
});

// Update route for updating specific fields of general settings
route.patch( "/update", checkAdminRole,
  uploadFields.fields([
    { name: "image", maxCount: 1 },
    { name: "upi_image", maxCount: 1 },
  ]),
  async (req, res) => {
    const updateFields = req.body;
    const updateImage = req.files && req.files["image"] ? req.files["image"][0] : null;
    let updateUpiImage = req.files && req.files["upi_image"] ? req.files["upi_image"][0] : null;

    try {
      const existingSetting = await GeneralSettingsModel.findOne({});

      if (!existingSetting) {
        return res
          .status(200)
          .json({ type: "error", message: "General settings not found" });
      }

      // Update fields from the request body
      for (const key in updateFields) {
        if (Object.prototype.hasOwnProperty.call(updateFields, key)) {
          existingSetting[key] = updateFields[key];
        }
      }

      if (updateImage) {
        const originalFilename = updateImage.originalname;
        const extension = originalFilename.substring(
          originalFilename.lastIndexOf(".")
        );
        const imageFilename = `${existingSetting.app_name.replace(
          /\s/g,
          "_"
        )}${extension}`;
        const imagePath = "imageUploads/backend/setting/" + imageFilename;

        fs.renameSync(updateImage?.path, imagePath);

        const image = {
          filename: imageFilename,
          path: imagePath,
          originalname: originalFilename,
        };
        existingSetting.app_logo = image;
      }

      if (!updateUpiImage) {
        // Retain the existing app_upi_image if not provided in the request
        updateUpiImage = existingSetting.app_upi_image;
      } else {
        // Handle the new app_upi_image
        const originalFilename = updateUpiImage.originalname;
        const extension = originalFilename.substring(
          originalFilename.lastIndexOf(".")
        );
        const imageFilename = `${existingSetting.app_name.replace(
          /\s/g,
          "_"
        )}_upi${extension}`;
        const imagePath = "imageUploads/backend/setting/" + imageFilename;

        fs.renameSync(updateUpiImage.path, imagePath);

        const images = {
          filename: imageFilename,
          path: imagePath,
          originalname: originalFilename,
        };
        existingSetting.app_upi_image = images;
      }

      await existingSetting.save();

      res
        .status(200)
        .json({
          type: "success",
          message: "General settings updated successfully",
          data: existingSetting,
        });
    } catch (error) {
      // if (updateImage) {
      //     fs.unlinkSync(updateImage?.path);
      // }
      // if (updateUpiImage && updateUpiImage.path) {
      //     fs.unlinkSync(updateUpiImage.path);
      // }
      res
        .status(500)
        .json({
          type: "error",
          message: "Failed to update general settings",
          error: error.message,
        });
      console.log(error);
    }
  }
);

// Update route for updating specific fields of general settings
route.put(
  "/update",
  checkAdminRole,
  uploadFields.fields([
    { name: "image", maxCount: 1 },
    { name: "upi_image", maxCount: 1 },
  ]),
  async (req, res) => {
    const updateFields = req.body;
    const updateImage =
      req.files && req.files["image"] ? req.files["image"][0] : null;
    let updateUpiImage =
      req.files && req.files["upi_image"] ? req.files["upi_image"][0] : null;

    try {
      const existingSetting = await GeneralSettingsModel.findOne({});

      if (!existingSetting) {
        return res
          .status(200)
          .json({ type: "error", message: "General settings not found" });
      }

      // Update fields from the request body
      for (const key in updateFields) {
        if (Object.prototype.hasOwnProperty.call(updateFields, key)) {
          existingSetting[key] = updateFields[key];
        }
      }

      if (updateImage) {
        const originalFilename = updateImage.originalname;
        const extension = originalFilename.substring(
          originalFilename.lastIndexOf(".")
        );
        const imageFilename = `${existingSetting.app_name.replace(
          /\s/g,
          "_"
        )}${extension}`;
        const imagePath = "imageUploads/backend/setting/" + imageFilename;

        fs.renameSync(updateImage?.path, imagePath);

        const image = {
          filename: imageFilename,
          path: imagePath,
          originalname: originalFilename,
        };
        existingSetting.app_logo = image;
      }

      if (!updateUpiImage) {
        // Retain the existing app_upi_image if not provided in the request
        updateUpiImage = existingSetting.app_upi_image;
      } else {
        // Handle the new app_upi_image
        const originalFilename = updateUpiImage.originalname;
        const extension = originalFilename.substring(
          originalFilename.lastIndexOf(".")
        );
        const imageFilename = `${existingSetting.app_name.replace(
          /\s/g,
          "_"
        )}_upi${extension}`;
        const imagePath = "imageUploads/backend/setting/" + imageFilename;

        fs.renameSync(updateUpiImage.path, imagePath);

        const images = {
          filename: imageFilename,
          path: imagePath,
          originalname: originalFilename,
        };
        existingSetting.app_upi_image = images;
      }

      await existingSetting.save();

      res
        .status(200)
        .json({
          type: "success",
          message: "General settings updated successfully",
          data: existingSetting,
        });
    } catch (error) {
      // if (updateImage) {
      //     fs.unlinkSync(updateImage?.path);
      // }
      // if (updateUpiImage && updateUpiImage.path) {
      //     fs.unlinkSync(updateUpiImage.path);
      // }
      res
        .status(500)
        .json({
          type: "error",
          message: "Failed to update general settings",
          error: error.message,
        });
      console.log(error);
    }
  }
);

route.post("/passwordChange", checkAdminRole, async (req, res) => {
  const { old_password, password, confirm_password } = req.body;
  console.log(req.admin);
  try {
    // Fetch the admin user from the database (assuming user is authenticated and you have their ID)
    const admin = await AdminModel.findById(req.admin.id); // Replace `req.user.id` with actual admin identifier

    // Check if old password matches the stored hashed password
    const isMatch = await bcrypt.compare(old_password, admin.password);
    if (!isMatch) {
      return res.status(200).json({ type: "error", message: "Old password is incorrect" });
    }

    // Check if new password and confirm password match
    if (password !== confirm_password) {
      return res.status(200).json({ type: "error", message: "Password and Confirm Password do not match" });
    }

    // Hash the new password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Update the password in the database
    admin.password = hashedPassword;
    await admin.save();

    // Send success response
    res.status(200).json({ type: "success", message: "Password changed successfully" });
  } catch (error) {
    res.status(500).json({
      type: "error",
      message: "Failed to change Password",
      error: error.message,
    });
  }
});
module.exports = route;
