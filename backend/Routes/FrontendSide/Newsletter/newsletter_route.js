const express = require("express");
const route = express.Router();
const Newsletter = require("../../../Models/FrontendSide/newsletter_model");
const checkAdminOrRole2 = require("../../../Middleware/checkAdminOrRole2");

// send Notification at notify
route.post("/post/subscribe", async (req, res) => {
  const { email } = req.body; // Accessing the email from the request body

  if (!email) {
    return res
      .status(200)
      .json({ type: "error", message: "Email is required" });
  }

  try {
    // Check if the email is already in the database
    const existingSubscriber = await Newsletter.findOne({ email });

    if (existingSubscriber) {
      // Email already subscribed
      return res
        .status(200)
        .json({ type: "error", message: "Email is already subscribed" });
    }

    // Add new subscriber if email is not already subscribed
    const newSubscriber = new Newsletter({
      email,
    });

    await newSubscriber.save(); // Saving the subscriber to the database
    console.log("Subscriber added successfully!");

    // Send success response
    res
      .status(200)
      .json({ type: "success", message: "Subscription successful" });
  } catch (error) {
    console.error("Error adding subscriber:", error.message);

    // Send error response
    res
      .status(500)
      .json({ type: "error", message: "Failed to add subscriber" });
  }
});

// get all category
route.get("/get", checkAdminOrRole2, async (req, res) => {
  try {
    console.log("newsletter");
    const category = await Newsletter.find().sort({ createdAt: -1 });
    console.log(category);
    if (category) {
      // for data table (admin)
      const result = category.map((category) => ({
        _id: category._id,
        email: category.email,
      }));

      res.status(200).json({
        type: "success",
        message: " Newsletter found successfully!",
        category: result || [],
      });
    } else {
      res.status(404).json({
        type: "warning",
        message: " Newsletter not found !",
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

// Delete all categories
route.delete("/delete", checkAdminOrRole2, async (req, res) => {
  try {
    await Newsletter.deleteMany();
    res.status(200).json({
      type: "success",
      message: "All Newsletter deleted successfully!",
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

    await Newsletter.deleteMany({ _id: { $in: ids } });
    res.status(200).json({
      type: "success",
      message: "All Newsletter deleted successfully!",
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
  console.log(categoryId);
  try {
    const category = await Newsletter.findById(categoryId);
    if (!category) {
      res.status(404).json({ type: "error", message: "Newsletter not found!" });
    } else {
      await Newsletter.findByIdAndDelete(categoryId);
      res
        .status(200)
        .json({ type: "success", message: "Newsletter deleted successfully!" });
    }
  } catch (error) {
    res
      .status(500)
      .json({ type: "error", message: "Server Error!", errorMessage: error });
  }
});

module.exports = route;
