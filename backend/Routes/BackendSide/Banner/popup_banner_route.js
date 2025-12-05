const express = require("express");
const route = express.Router();
const multer = require("multer");
const Banner = require("../../../Models/BackendSide/popup_banner_model");
const fs = require("fs");
const checkAdminOrRole2 = require("../../../Middleware/checkAdminOrRole2");

// Set up multer middleware to handle file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./imageUploads/backend/popUpBanner");
  },
  filename: function (req, file, cb) {
    cb(null, file?.originalname);
  },
});
const upload = multer({ storage: storage });

// Create Banner
route.post(
  "/add",
  checkAdminOrRole2,
  upload.single("image"),
  async (req, res) => {
    try {
      const { Banner_Name } = req.body;
      const existingBanner = await Banner.findOne({ Banner_Name });

      if (existingBanner) {
        // Delete the uploaded image if the banner already exists
        fs.unlinkSync(req.file?.path);
        return res
          .status(202)
          .json({ type: "warning", message: "Banner already exists!" });
      }
      const banner = new Banner({
        Banner_Name,
        Banner_Label: Banner_Name,
      });

      if (req?.file) {
        const originalFilename = req.file.originalname;
        const extension = originalFilename.substring(
          originalFilename.lastIndexOf(".")
        );
        const imageFilename = `${Banner_Name.replace(/\s/g, "_")}${extension}`;
        const imagePath = "imageUploads/backend/popUpBanner/" + imageFilename;
        fs.renameSync(req?.file?.path, imagePath);
        const image = {
          filename: imageFilename,
          path: imagePath,
          originalname: originalFilename,
        };
        banner.Banner_Image = image;
      }

      const bannerData = await banner.save();
      return res
        .status(200)
        .json({
          type: "success",
          bannerData,
          message: "Popup Banner added successfully!",
        });
    } catch (error) {
      // if (req?.file) fs.unlinkSync(req?.file?.path);
      return res
        .status(500)
        .json({ type: "error", message: "Server Error!", errorMessage: error });
    }
  }
);

// get all banner
route.get("/get", async (req, res) => {
  try {
    const banner = await Banner.find();
    return res.send(banner);
  } catch (error) {
    return res
      .status(500)
      .json({ type: "error", message: "Server Error!", errorMessage: error });
  }
});

// update only Bannerstatus
route.patch("/update/status/:id", checkAdminOrRole2, async (req, res) => {
  const BannerId = req.params.id;

  try {
    const { Banner_Status } = req.body;
    const newBanner = await Banner.findByIdAndUpdate(BannerId, {
      Banner_Status: Banner_Status,
    });
    if (!newBanner) {
      return res
        .status(404)
        .json({ type: "error", message: "Banner not found!" });
    }
    await newBanner.save();
    return res
      .status(200)
      .json({ type: "success", message: "Banner Status update successfully!" });
  } catch (error) {
    return res
      .status(500)
      .json({ type: "error", message: "Server Error!", errorMessage: error });
  }
});

// Update a specific banner by ID
route.put(
  "/update/:id",
  checkAdminOrRole2,
  upload.single("image"),
  async (req, res) => {
    const bannerId = req.params.id;
    const { Banner_Name } = req.body;

    try {
      const banner = await Banner.findById(bannerId);

      if (!banner) {
        fs.unlinkSync(req.file?.path);
        return res
          .status(404)
          .json({ type: "warning", message: "Banner does not exist!" });
      }

      banner.Banner_Name = Banner_Name;
      banner.Banner_Label = Banner_Name;

      if (req.file) {
        // Delete the previous image file if it exists
        if (banner.Banner_Image && fs.existsSync(banner.Banner_Image.path)) {
          fs.unlinkSync(banner.Banner_Image.path);
        }

        // Update the image details
        const originalFilename = req.file.originalname;
        const extension = originalFilename.substring(
          originalFilename.lastIndexOf(".")
        );
        const imageFilename = `${Banner_Name.replace(/\s/g, "_")}${extension}`;
        const imagePath = "imageUploads/backend/banner/" + imageFilename;
        fs.renameSync(req?.file?.path, imagePath);
        banner.Banner_Image.filename = imageFilename;
        banner.Banner_Image.path = imagePath;
        banner.Banner_Image.originalname = originalFilename;
      }

      await banner.save();
      return res
        .status(200)
        .json({ type: "success", message: "Banner updated successfully!" });
    } catch (error) {
      console.log(error);
      if (req.file) fs.unlinkSync(req?.file?.path);
      return res
        .status(500)
        .json({ type: "error", message: "Server Error!", errorMessage: error });
    }
  }
);

// Delete a specific banner by ID
route.delete("/delete/:id", checkAdminOrRole2, async (req, res) => {
  const bannerId = req.params.id;
  try {
    const banner = await Banner.findById(bannerId);
    if (!banner) {
      return res
        .status(404)
        .json({ type: "error", message: "Banner not found!" });
    }
    // Delete the image file from the folder if it exists
    if (banner.Banner_Image && fs.existsSync(banner.Banner_Image.path)) {
      fs.unlinkSync(banner.Banner_Image.path);
    }

    await Banner.findByIdAndDelete(bannerId);
    return res
      .status(200)
      .json({ type: "success", message: "Banner deleted successfully!" });
  } catch (error) {
    return res
      .status(500)
      .json({ type: "error", message: "Server Error!", errorMessage: error });
  }
});

module.exports = route;
