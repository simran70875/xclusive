const express = require("express");
const Marquee = require("../../Models/FrontendSide/marquee_model");
const checkAdminRole = require("../../Middleware/adminMiddleWares");
const authenticates = require("../../Middleware/authMiddleWares");
const route = express.Router();

route.post("/addMarquee", checkAdminRole, async (req, res) => {
  const text = req.body.text;

  console.log("text ==>", text,  req.admin.id);
  if (!text) {
    return res.status(400).send({ type: "error", message: "Please provide marquee text" });
  }
  try {
    const newMarquee = new Marquee({ text });
    await newMarquee.save();
    return res.status(200).send({type: "success", message: "Marquee added successfully" });
  } catch (error) {
    console.log(error);
    return res.status(500).send({type: "error", message: "Error adding marquee", error });
  }
});

route.get("/getMarquee", async (req, res) => {
  try {
    const marquee = await Marquee.findOne();
    return res.status(200).send({ message: "Marquee fetched successfully", marquee });
  } catch (error) {
    console.log(error);
    return res.status(500).send({ message: "Error fetching marquee", error });
  }
});

route.delete("/deleteMarquee/:id",checkAdminRole, async (req, res) => {
  const id = req.params.id;
  try {
    const deletedMarquee = await Marquee.findByIdAndDelete(id);
    if (!deletedMarquee) {
      return res.status(404).send({ message: "Marquee not found" });
    }
    return res.status(200).send({ message: "Marquee deleted successfully" });
  }catch (error) {
    console.log(error);
    return res.status(500).send({ message: "Error deleting marquee", error });
  }

});

route.put("/update/Marquee/:id", checkAdminRole, async (req, res) => {
    const id = req.params.id;
    const text = req.body.text;

    console.log("Updating marquee id:", id, "with text:", text);
    try {
      const updateMarquee = await Marquee.findByIdAndUpdate(id, {text:text}, {new:true});
      if (!updateMarquee) {
        return res.status(404).send({type: "error", message: "Marquee not found" });
      }
      return res.status(200).send({ type: "success",message: "Marquee updated successfully" });
    }catch (error) {
      console.log(error);
      return res.status(500).send({type: "error", message: "Error updating marquee", error });
    }
});


module.exports = route;