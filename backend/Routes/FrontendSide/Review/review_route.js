const express = require("express");
const route = express.Router();
const Order = require("../../../Models/FrontendSide/order_model");
const Review = require("../../../Models/FrontendSide/review_model");
const authMiddleWare = require("../../../Middleware/authMiddleWares");
const checkAdminRole = require("../../../Middleware/adminMiddleWares");
const Settings = require("../../../Models/Settings/general_settings_model");

// Create review
route.post("/add", authMiddleWare, async (req, res) => {
  try {
    const userId = req?.user?.userId;

    const { order, comment, text, rating } = req.body;

    const ordersWithProduct = await Order.findById(order);

    const productIds = ordersWithProduct.cartData.map((item) =>
      item.product._id?.toString()
    );

    const review = await new Review({
      user: userId,
      order,
      comment,
      text,
      rating,
      productIds,
    });

    await review.save();

    const settings = await Settings.find();

    let amount = settings?.[0]?.review_reward_amount;
    res
      .status(200)
      .json({ type: "success", message: "Review add successfully!" });
  } catch (error) {
    res
      .status(500)
      .json({ type: "error", message: "Server Error!", errorMessage: error });
    console.log(error);
  }
});

// Get all reviews
route.get("/get/all", checkAdminRole, async (req, res) => {
  try {
    const reviews = await Review.find()
      .populate({
        path: "user",
        model: "Users",
        select: "User_Name User_Image User_Mobile_No",
      })
      .sort({ createdAt: -1 });

    const populatedReview = reviews.map((review) => {
      return {
        ...review.toObject(),
        createdAt: new Date(review?.createdAt)?.toLocaleDateString("en-IN"),
        Time: new Date(review?.createdAt)?.toLocaleTimeString("en-IN", {
          hour12: true,
        }),
        User_Name: review?.user?.User_Name,
        // User_Image: `${process.env.IP_ADDRESS}/${review?.user?.User_Image?.path?.replace(/\\/g, '/')}`,
        User_Mobile_No: review?.user?.User_Mobile_No,
      };
    });

    res.status(200).json({
      type: "success",
      message: "Reviews Get successfully!",
      reviews: populatedReview || [],
    });
  } catch (error) {
    res
      .status(500)
      .json({ type: "error", message: "Server Error!", errorMessage: error });
    console.log(error);
  }
});

// Get all reviews for mobile
route.get("/mob/get/all", async (req, res) => {
  try {
    const reviews = await Review.find({ status: true })
      .populate({
        path: "user",
        model: "Users",
        select: "User_Name User_Image User_Mobile_No",
      })
      .sort({ createdAt: -1 });

    if (reviews.length <= 0) {
      return res
        .status(200)
        .json({ type: "success", message: "Reviews Not Found!", reviews: [] });
    }

    const populatedReview = reviews.map((review) => {
      return {
        ...review.toObject(),
        createdAt: new Date(review?.createdAt)?.toLocaleDateString("en-IN"),
        Time: new Date(review?.createdAt)?.toLocaleTimeString("en-IN", {
          hour12: true,
        }),
        User_Name: review?.user?.User_Name,
        User_Image:
          `${process.env.IP_ADDRESS}/${review?.user?.User_Image?.path?.replace(
            /\\/g,
            "/"
          )}` || "",
        User_Mobile_No: review?.user?.User_Mobile_No,
      };
    });

    res.status(200).json({
      type: "success",
      message: "Reviews Get successfully!",
      reviews: populatedReview || [],
    });
  } catch (error) {
    res
      .status(500)
      .json({ type: "error", message: "Server Error!", errorMessage: error });
    console.log(error);
  }
});

// Get single review by ID
route.get("/get/single/:id", authMiddleWare, async (req, res) => {
  try {
    const orderId = req.params.id;

    const review = await Review.findOne({ order: orderId });

    if (!review) {
      return res
        .status(200)
        .json({ type: "error", message: "Review not found" });
    }

    res.status(200).json({
      type: "success",
      message: "Reviews Get successfully!",
      reviews: [review] || [],
    });
  } catch (error) {
    res
      .status(500)
      .json({ type: "error", message: "Server Error!", errorMessage: error });
    console.log(error);
  }
});

route.get("/get/product/:productId", async (req, res) => {
  try {
    const productId = req.params.productId;

    const reviewsForProduct = await Review.find({
      productIds: productId,
    }).populate("user", "User_Name User_Image");

    let dummy = `${process.env.IP_ADDRESS}/imageUploads/frontend/users/profile-pic-dummy.png`;

    const reviewsWithUser = reviewsForProduct.map((review) => ({
      ...review._doc,
      User_Name: review?.user?.User_Name,
      // User_Image: review.user.User_Image,
      User_Image:
        !review?.user?.User_Image?.path ||
          review?.user?.User_Image?.path === "undefined"
          ? dummy
          : `${process.env.IP_ADDRESS
          }/${review?.user?.User_Image?.path?.replace(/\\/g, "/")}`,
    }));

    // Remove the user field from each review
    reviewsWithUser.forEach((review) => {
      delete review?.user;
    });

    res.status(200).json({
      type: "success",
      message: "Reviews Get successfully!",
      reviews: reviewsWithUser || [],
    });
  } catch (error) {
    res
      .status(500)
      .json({ type: "error", message: "Server Error!", errorMessage: error });
    console.log(error);
  }
});

// update only status
route.patch("/update/status/:id", checkAdminRole, async (req, res) => {
  const reviewId = req.params.id;

  try {
    const { status } = req.body;

    await Review.findByIdAndUpdate(
      reviewId,
      {
        status: status,
      },
      {
        new: true,
      }
    );

    return res
      .status(200)
      .json({ type: "success", message: "Review Status update successfully!" });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ type: "error", message: "Server Error!", errorMessage: error });
  }
});

// delete all review history
route.delete("/delete", checkAdminRole, async (req, res) => {
  try {
    const review = await Review.find();

    await Review.deleteMany();
    res
      .status(200)
      .json({ type: "error", message: "All Review deleted Successfully!" });
  } catch (error) {
    res
      .status(500)
      .json({ type: "error", message: "Server Error!", errorMessage: error });
    console.log(error);
  }
});

// delete review by id
route.delete("/delete/:id", checkAdminRole, async (req, res) => {
  const reviewId = await req.params.id;
  try {
    const result = await Review.findByIdAndDelete(reviewId);
    if (!result) {
      res.status(200).json({ type: "error", message: "Review not found!" });
    }
    res
      .status(200)
      .json({ type: "error", message: "Review deleted Successfully!" });
  } catch (error) {
    res
      .status(500)
      .json({ type: "error", message: "Server Error!", errorMessage: error });
  }
});

// delete many wallet
route.delete("/deletes", checkAdminRole, async (req, res) => {
  try {
    const { ids } = req.body;
    await Review.deleteMany({ _id: { $in: ids } });
    res
      .status(200)
      .json({ type: "success", message: "All Review deleted Successfully!" });
  } catch (error) {
    res
      .status(500)
      .json({ type: "error", message: "Server Error!", errorMessage: error });
  }
});

module.exports = route;
