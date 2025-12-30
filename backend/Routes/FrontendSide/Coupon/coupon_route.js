const express = require("express");
const route = express.Router();
const User = require("../../../Models/FrontendSide/user_model");
const Coupon = require("../../../Models/FrontendSide/coupon_model");
const Charges = require("../../../Models/Settings/add_charges_model");
const authMiddleWare = require("../../../Middleware/authMiddleWares");
const checkAdminOrRole1 = require("../../../Middleware/checkAdminOrRole1");

// create coupon by admin
route.post("/createbyadmin", checkAdminOrRole1, async (req, res) => {
  try {
    const {
      couponCode,
      discountAmount,
      creationDate,
      expiryDate,
      usageLimits,
    } = req.body;

    // Check if the coupon code already exists
    const existingCoupon = await Coupon.findOne({ couponCode });
    if (existingCoupon) {
      return res.status(200).json({ type: "error", message: "Coupon code already exists." });
    }

    // Create a new coupon
    const newCouponData = new Coupon({
      couponCode,
      discountAmount,
      creationDate,
      expiryDate,
      usageLimits,
    });


    const newCoupon = new Coupon(newCouponData);
    await newCoupon.save();

    res.status(200).json({ type: "success", message: "Coupon created successfully." });
  } catch (error) {
    res.status(500).json({ type: "error", message: "Internal server error." });
    console.log(error);
  }
});

// Create Coupon by Reseller
route.post("/createbyreseller", authMiddleWare, async (req, res) => {
  try {
    const resellerId = req.user.userId;
    const { couponCode, creationDate, expiryDate } = req.body;

    // Check if the user is a reseller
    const reseller = await User.findOne({
      _id: resellerId,
      User_Type: { $ne: "0" },
    });
    if (!reseller) {
      return res
        .status(200)
        .json({ type: "error", message: "User is not a reseller." });
    }

    const resellerType = reseller?.User_Type;

    // Check if the coupon code already exists
    const existingCoupon = await Coupon.findOne({ couponCode });
    if (existingCoupon) {
      return res
        .status(200)
        .json({ type: "error", message: "Coupon code already exists." });
    }

    const charges = await Charges.findOne();
    let coinsReward =
      resellerType === "1"
        ? charges?.coins_reward_gold
        : resellerType === "2"
          ? charges?.coins_reward_silver
          : resellerType === "3"
            ? charges?.coins_reward_silver
            : charges?.coins_reward_user;
    let usageLimits = charges?.usage_limit_reseller;
    const discountAmount =
      resellerType === "1"
        ? charges?.Gold_Coup_Disc
        : resellerType === "2"
          ? charges?.Silver_Coup_Disc
          : resellerType === "3"
            ? charges?.PPO_Coup_Disc
            : charges?.Normal_Coup_Disc;

    // Create a new coupon
    const newCoupon = new Coupon({
      couponCode,
      type: "1",
      discountAmount,
      coinsReward,
      creationDate,
      expiryDate,
      usageLimits,
      createdBy: {
        type: "1",
        id: resellerId,
      },
    });

    await newCoupon.save();

    res
      .status(200)
      .json({ type: "success", message: "Coupon created successfully." });
  } catch (error) {
    res.status(500).json({ type: "error", message: "Internal server error." });
    console.log(error);
  }
});

// Update Coupon by Reseller
route.patch("/update/:couponId", authMiddleWare, async (req, res) => {
  try {
    const resellerId = req.user.userId;
    const couponId = req.params.couponId;
    let { creationDate, expiryDate, status } = req.body;
    status = status === "0" ? true : false;

    // Check if the user is a reseller
    const reseller = await User.findOne({
      _id: resellerId,
      User_Type: { $ne: "0" },
    });
    if (!reseller) {
      return res
        .status(200)
        .json({ type: "error", message: "User is not a reseller." });
    }

    // Find the coupon by ID
    const coupon = await Coupon.findById(couponId);
    if (!coupon) {
      return res
        .status(200)
        .json({ type: "error", message: "Coupon not found." });
    }

    // Check if the coupon was created by the same reseller
    if (coupon.createdBy.id.toString() !== resellerId) {
      return res.status(200).json({
        type: "error",
        message: "You are not authorized to update this coupon.",
      });
    }

    // Update coupon details
    coupon.status = status;
    coupon.creationDate = creationDate;
    coupon.expiryDate = expiryDate;

    await coupon.save();

    res
      .status(200)
      .json({ type: "success", message: "Coupon updated successfully." });
  } catch (error) {
    res.status(500).json({ type: "error", message: "Internal server error." });
    console.log(error);
  }
});

// Get First Auto-Generated Coupon for User
route.get("/get/auto/gen/coupon", authMiddleWare, async (req, res) => {
  try {
    const userId = req.user.userId;

    // Find the user's first auto-generated coupon
    const coupon = await Coupon.findOne({ type: "0", "createdBy.id": userId })
      .sort({ creationDate: 1 })
      .limit(1);

    if (!coupon) {
      return res.status(200).json({
        type: "error",
        message: "No auto-generated coupon found for this user.",
        coupon: [],
      });
    }

    res.status(200).json({ type: "success", coupon: [coupon] || [] });
  } catch (error) {
    res.status(500).json({ type: "error", message: "Internal server error." });
    console.log(error);
  }
});

// get All Coupon
route.get("/get", checkAdminOrRole1, async (req, res) => {
  const page = parseInt(req.query.page);
  const pageSize = parseInt(req.query.pageSize);
  try {
    const total = await Coupon.countDocuments();
    const coupons = await Coupon.find().sort({ createdAt: -1 }).skip((page - 1) * pageSize).limit(pageSize);

    if (coupons.length === 0) {
      return res.status(200).json({ type: "error", message: "No coupons found", coupon: [] });
    }

    const populatedCoupons = coupons.map((coupon) => {

      return {
        ...coupon.toObject(),
        creationDate: new Date(coupon?.creationDate)?.toLocaleDateString(
          "en-IN"
        ),
        expiryDate: new Date(coupon?.expiryDate)?.toLocaleDateString("en-IN"),
      };
    });

    return res.status(200).json({ type: "success", coupon: populatedCoupons, total, currentPage: page, pageSize });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ type: "error", message: "Internal server error" });
  }
});

// get particular coupon
route.get("/get/single/:id", checkAdminOrRole1, async (req, res) => {
  const couponId = req.params?.id;

  try {
    const coupon = await Coupon.findById(couponId).sort({ createdAt: -1 });

    if (!coupon) {
      return res.status(200).json({ type: "error", message: "No coupon found", coupon: null });
    }


    res.status(200).json({ type: "success", coupon });
  } catch (error) {
    console.error(error);
    res.status(500).json({ type: "error", message: "Internal server error" });
  }
});

// get all coupon created by particular user
route.get("/get/createbyreseller", authMiddleWare, async (req, res) => {
  try {
    const userId = req?.user?.userId;
    const coupon = await Coupon.find({ "createdBy.id": userId, type: "1" });

    if (!coupon) {
      return res
        .status(200)
        .json({ type: "error", message: "Coupon not found", coupon: [] });
    }

    if (coupon.length <= 0) {
      return res
        .status(200)
        .json({ type: "error", message: "Coupon not found", coupon: [] });
    }

    res.status(200).json({ type: "success", message: "Coupon found", coupon });
  } catch (error) {
    res.status(500).json({ type: "error", message: "Internal server error" });
    console.log(error);
  }
});

// Get All the Coupons for User at Order Time
route.get("/get/all/forordertime", authMiddleWare, async (req, res) => {
  try {
    const userId = req?.user?.userId;

    const currentDate = new Date();

    const coupons = await Coupon.find({
      creationDate: { $lte: currentDate },
      expiryDate: { $gte: currentDate },
      status: true,
    });

    if (!coupons || coupons.length === 0) {
      return res.status(200).json({ type: "error", message: "No coupons found.", coupon: [] });
    }

    // Filter out coupons where usage limit is exceeded
    const validCoupons = await Promise.all(
      coupons.map(async (coupon) => {
        const userCouponUsage = coupon.UserCouponUsage.find(
          (item) => item.userId.toString() === userId.toString()
        );
        if (
          !userCouponUsage ||
          userCouponUsage.usageCount < coupon.usageLimits
        ) {
          return coupon;
        }
      })
    );

    const filteredCoupons = validCoupons.filter(
      (coupon) => coupon !== undefined
    );

    if (filteredCoupons.length === 0) {
      return res.status(200).json({
        type: "error",
        message: "No valid coupons found.",
        coupon: [],
      });
    }

    res.status(200).json({
      type: "success",
      message: "Coupons found.",
      coupon: filteredCoupons,
    });
  } catch (error) {
    res.status(500).json({ type: "error", message: "Internal server error." });
    console.log(error);
  }
});

// Check Coupon Code for User at Order Time
route.post("/check/couponcode/forordertime",
  authMiddleWare,
  async (req, res) => {
    try {
      const userId = req.user.userId;
      const user = await User.findById(userId);
      const couponCode = req.body.couponCode;

      const coupon = await Coupon.findOne({ couponCode: couponCode });
      const couponsStatus = await Coupon.findOne({
        couponCode: couponCode,
        status: true,
      });

      const currentDate = new Date();
      const startDate = new Date(coupon?.creationDate);
      const endDate = new Date(coupon?.expiryDate);
      if (!coupon) {
        return res
          .status(200)
          .json({ type: "error", message: "Invalid coupon code.", coupon: [] });
      }

      if (!couponsStatus) {
        return res.status(200).json({
          type: "error",
          message: "This coupon is currently inactive.",
          coupon: [],
        });
      }

      if (currentDate < startDate || currentDate > endDate) {
        return res.status(200).json({
          type: "error",
          message: "Coupon valid within its designated dates.",
          coupon: [],
        });
      }

      if (coupon?.createdBy?.id?.toString() === user?._id?.toString()) {
        return res.status(200).json({
          type: "error",
          message: "Oops! this coupon is not valid for placing order",
          coupon: [],
        });
      }


      res.status(200).json({
        type: "success",
        message: "Coupon applied successfully",
        coupon: [coupon] || [],
      });
    } catch (error) {
      res
        .status(500)
        .json({ type: "error", message: "Internal server error." });
      console.log(error);
    }
  }
);

// Delete many coupons
route.delete("/deletes", checkAdminOrRole1, async (req, res) => {
  try {
    const { ids } = req.body;
    await Coupon.deleteMany({ _id: { $in: ids } });
    res
      .status(200)
      .json({ type: "success", message: "All Coupons deleted successfully!" });
  } catch (error) {
    res
      .status(500)
      .json({ type: "error", message: "Server Error!", errorMessage: error });
  }
});

// Delete coupon by ID
route.delete("/delete/:id", checkAdminOrRole1, async (req, res) => {
  const couponId = req.params.id;
  try {
    const coupon = await Coupon.findById(couponId);
    if (!coupon) {
      res.status(404).json({ type: "error", message: "Coupon not found!" });
    } else {
      await Coupon.findByIdAndDelete(couponId);
      res
        .status(200)
        .json({ type: "success", message: "Coupon deleted successfully!" });
    }
  } catch (error) {
    res
      .status(500)
      .json({ type: "error", message: "Server Error!", errorMessage: error });
  }
});

// delete all Coupon
route.delete("/delete/all", checkAdminOrRole1, async (req, res) => {
  try {
    await Coupon.deleteMany();
    res
      .status(200)
      .json({ type: "error", message: "All Coupons deleted Successfully!" });
  } catch (error) {
    res
      .status(500)
      .json({ type: "error", message: "Server Error!", errorMessage: error });
    console.log(error);
  }
});

// update only status
route.patch("/update/status/:id", checkAdminOrRole1, async (req, res) => {
  const CouponId = req.params.id;

  try {
    const { status } = req.body;

    const newCoupon = await Coupon.findByIdAndUpdate(CouponId);
    newCoupon.status = await status;

    await newCoupon.save();
    res
      .status(200)
      .json({ type: "success", message: "Coupon Status update successfully!" });
  } catch (error) {
    res
      .status(500)
      .json({ type: "error", message: "Server Error!", errorMessage: error });
    console.log(error);
  }
});

// Update Coupon by ID
route.put("/update/admin/:id", checkAdminOrRole1, async (req, res) => {
  const couponId = req.params.id;

  try {
    const existingCoupon = await Coupon.findById(couponId);

    if (!existingCoupon) {
      return res
        .status(404)
        .json({ type: "error", message: "Coupon not found." });
    }

    const updateFields = req.body;

    // Update fields from the request body
    for (const key in updateFields) {
      if (Object.prototype.hasOwnProperty.call(updateFields, key)) {
        existingCoupon[key] = updateFields[key];
      }
    }

    await existingCoupon.save();

    res
      .status(200)
      .json({ type: "success", message: "Coupon updated successfully." });
  } catch (error) {
    res.status(500).json({ type: "error", message: "Internal server error." });
    console.log(error);
  }
});

module.exports = route;
