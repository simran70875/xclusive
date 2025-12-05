const express = require("express");
const route = express.Router();
const User = require("../../../Models/FrontendSide/user_model");
const multer = require("multer");
const jwt = require("jsonwebtoken");
const authMiddleWare = require("../../../Middleware/authMiddleWares");
const fs = require("fs");
const path = require("path");
const MemberShip = require("../../../Models/BackendSide/memberShip_model");
const MemberShipHistory = require("../../../Models/BackendSide/memberShipHistory_model");
const checkAdminRole = require("../../../Middleware/adminMiddleWares");
const {
  checkAdminWithMultRole354,
} = require("../../../Middleware/checkAdminWithMultRole");
const checkAdminOrRole1 = require("../../../Middleware/checkAdminOrRole1");
const checkAdminOrRole2 = require("../../../Middleware/checkAdminOrRole2");
const checkAdminOrRole3 = require("../../../Middleware/checkAdminOrRole3");
const checkAdminOrRole4 = require("../../../Middleware/checkAdminOrRole4");
const checkAdminOrRole5 = require("../../../Middleware/checkAdminOrRole5");

//  funcation for get active membership
async function getActiveMemberShip(userId) {
  try {
    const activeMembership = await MemberShipHistory.findOne({
      UserId: userId,
    }).limit(1);
    // const lastActiveTypeIndex = activeMembership.MemberShipData.length - 1;
    const activeType = activeMembership?.MemberShipData?.[0]?.Type;
    return activeType;
  } catch (error) {
    return "";
  }
}

// Create MemberShip
route.post("/add", async (req, res) => {
  try {
    const { name, price, longDesc, sortDesc } = req.body;
    const memberShip = new MemberShip({
      MemberShip_Name: name,
      MemberShip_Price: price,
      Long_Desc: longDesc || "",
      Sort_Desc: sortDesc || "",
    });

    await memberShip.save();
    res.status(200).json({ type: "success", message: "MemberShip added successfully!" });
  } catch (error) {
    res.status(500).json({ type: "error", message: "Server Error!", errorMessage: error });
  }
});

// get all memberShip
route.get("/get", async (req, res) => {
  try {
    const memberShip = await MemberShip.find();
    res
      .status(201)
      .json({
        type: "success",
        message: " MemberShip found successfully!",
        memberShip: memberShip,
      });
  } catch (error) {
    res
      .status(500)
      .json({ type: "error", message: "Server Error!", errorMessage: error });
  }
});

// get all memberShip for mobile
route.get("/mob/get", authMiddleWare, async (req, res) => {
  const userId = await req?.user?.userId;
  const activeMemberShip = await getActiveMemberShip(userId);

  try {
    const memberShip = await MemberShip.find();

    const updatedMemberShip = memberShip?.map((plan) => ({
      _id: plan?._id || "",
      MemberShip_Name: plan?.MemberShip_Name || "",
      MemberShip_Price: plan?.MemberShip_Price || "",
      Sort_Desc: plan?.Sort_Desc || "",
      Long_Desc: plan?.Long_Desc || "",
      Validity: plan?.Validity || "",
      MemberShip_Status: plan?.Type == activeMemberShip ? true : false,
      createdAt: plan?.createdAt,
      updatedAt: plan?.updatedAt,
      Type: plan?.Type,
    }));

    res
      .status(200)
      .json({
        type: "success",
        message: "MemberShip found successfully!",
        memberShip: updatedMemberShip || [],
      });
  } catch (error) {
    res
      .status(500)
      .json({ type: "error", message: "Server Error!", errorMessage: error });
    console.log(error);
  }
});

// find memberShip by id
route.get("/get/:id", async (req, res) => {
  const { memberShipId } = req.params;
  try {
    const memberShip = await MemberShip.findOne({ _id: memberShipId });
    res
      .status(201)
      .json({
        type: "success",
        message: " MemberShip found successfully!",
        memberShips: memberShip || [],
      });
  } catch (error) {
    res
      .status(500)
      .json({ type: "error", message: "Server Error!", errorMessage: error });
  }
});

// Delete all memberShips
route.delete("/delete", checkAdminRole, async (req, res) => {
  try {
    await MemberShip.deleteMany();
    res
      .status(200)
      .json({
        type: "success",
        message: "All MemberShips deleted successfully!",
      });
  } catch (error) {
    res
      .status(500)
      .json({ type: "error", message: "Server Error!", errorMessage: error });
  }
});

// Delete many memberShips
route.delete("/deletes", checkAdminRole, async (req, res) => {
  try {
    const { ids } = req.body;
    const memberShips = await MemberShip.find({ _id: { $in: ids } });
    await memberShips.deleteMany({ _id: { $in: ids } });
    res
      .status(200)
      .json({
        type: "success",
        message: "All MemberShips deleted successfully!",
      });
  } catch (error) {
    res
      .status(500)
      .json({ type: "error", message: "Server Error!", errorMessage: error });
  }
});

// Delete memberShip by ID
route.delete("/delete/:id", async (req, res) => {
  const memberShipId = req.params.id;
  try {
    await MemberShip.findByIdAndDelete(memberShipId);
    res
      .status(200)
      .json({ type: "success", message: "MemberShip deleted successfully!" });
  } catch (error) {
    res
      .status(500)
      .json({ type: "error", message: "Server Error!", errorMessage: error });
  }
});

// update
route.patch("/update/:id", async (req, res) => {
  const memberShipId = req.params.id;

  const { name, price, longDesc, sortDesc, type } = req.body;

  try {
    const existingMemberShips = await MemberShip.findByIdAndUpdate(
      memberShipId,
      {
        MemberShip_Name: name || "",
        MemberShip_Price: price || 0,
        Long_Desc: longDesc || "",
        Sort_Desc: sortDesc || "",
        Type: type || "1",
      },
      { new: true }
    );

    if (!existingMemberShips) {
      return res
        .status(404)
        .json({ type: "error", message: "MemberShips not found!" });
    }

    res
      .status(200)
      .json({ type: "success", message: "MemberShips updated successfully!" });
  } catch (error) {
    res
      .status(500)
      .json({ type: "error", message: "Server Error!", errorMessage: error });
  }
});

module.exports = route;
