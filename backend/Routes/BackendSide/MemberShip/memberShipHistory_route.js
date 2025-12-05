const express = require("express");
const route = express.Router();
const User = require("../../../Models/FrontendSide/user_model");
const multer = require("multer");
const jwt = require("jsonwebtoken");
const authMiddleWare = require("../../../Middleware/authMiddleWares");
const fs = require("fs");
const path = require("path");
const MemberShipHistory = require("../../../Models/BackendSide/memberShipHistory_model");
const MemberShip = require("../../../Models/BackendSide/memberShip_model");
const Cart = require("../../../Models/FrontendSide/cart_model");
const checkAdminRole = require("../../../Middleware/adminMiddleWares");
const {
  checkAdminWithMultRole354,
} = require("../../../Middleware/checkAdminWithMultRole");
const checkAdminOrRole1 = require("../../../Middleware/checkAdminOrRole1");
const checkAdminOrRole2 = require("../../../Middleware/checkAdminOrRole2");
const checkAdminOrRole3 = require("../../../Middleware/checkAdminOrRole3");
const checkAdminOrRole4 = require("../../../Middleware/checkAdminOrRole4");
const checkAdminOrRole5 = require("../../../Middleware/checkAdminOrRole5");

// function for get memberShip data for user
async function getMemberShipData(type) {
  const MemberShipData = await MemberShip.find({ Type: type });
  if (MemberShipData) {
    return MemberShipData || [];
  } else {
    return [];
  }
}

// Create MemberShip history
route.post("/add", authMiddleWare, async (req, res) => {
  const userId = req?.user?.userId;

  try {
    let {
      paymentId,
      type,
      Certificate,
      Full_Address,
      Firm_Name,
      No_Order,
      Gst_No,
      Payment_Status
    } = req.body;


    console.log("Body ===> ", req.body);

    const user = await User.findById(userId);
    let cartData = await Cart.find({ userId });

    if (!user) {return res.status(404).json({ type: "error", message: "User not found." });}

    let startDate = new Date();
    let endDate = new Date();
    endDate.setMonth(startDate.getMonth() + 6);

    let memberShipData = await getMemberShipData(type);
    if(memberShipData){
      await User.findByIdAndUpdate(userId,{
        User_Type : type,
      },{new:true});
    }

    const firstMemberShip = memberShipData.length > 0 ? memberShipData[0] : null;

    if (Certificate == "0") {
      Certificate = false;
    } else {
      Certificate = true;
    }

    const memberShipObj = firstMemberShip
      ? {
          PaymentId: paymentId || "",
          Payment_Status: Payment_Status,
          Type: type,
          Certificate: Certificate || true,
          Full_Address: Full_Address || "",
          Firm_Name: Firm_Name || "",
          No_Order: No_Order || "",
          Gst_No: Gst_No || "",
          MemberShip: {
            MemberShip_Name: firstMemberShip?.MemberShip_Name,
            MemberShip_Price: firstMemberShip?.MemberShip_Price,
            Validity: firstMemberShip?.Validity,
            MemberShip_Status: firstMemberShip.MemberShip_Status,
            Sort_Desc: firstMemberShip?.Sort_Desc || "",
            Long_Desc: firstMemberShip?.Long_Desc || "",
            createdAt: firstMemberShip?.createdAt,
            updatedAt: firstMemberShip?.updatedAt,
            startDate: firstMemberShip?.startDate || startDate,
            endDate: firstMemberShip?.endDate || endDate,
          },
          
        }
      : {
          PaymentId: paymentId || "",
          Payment_Status:Payment_Status,
          Type: type,
          Certificate,
          Full_Address,
          Firm_Name,
          No_Order,
          Gst_No,
          startDate: startDate,
          endDate: endDate,
        };


    let memberShipHistory = await MemberShipHistory.findOne({ UserId: userId });

    if (memberShipHistory) {
      memberShipHistory.MemberShipData.unshift(memberShipObj);
    } else {
      memberShipHistory = new MemberShipHistory({
        UserId: userId,
        MemberShipData: [memberShipObj],
      });
    }

    await memberShipHistory.save();
    cartData = [];
    await Cart.deleteMany({ userId });

    res
      .status(200)
      .json({ type: "success", message: "MemberShip added successfully!" });
  } catch (error) {
    res.status(500).json({
      type: "error",
      message: "Server Error!",
      errorMessage: error.message,
    });
    console.log(error);
  }
});

// get all membership history
route.get("/get/all", checkAdminRole, async (req, res) => {
  // function for convert to date
  function formatDate(date) {
    const day = String(date.getUTCDate()).padStart(2, "0");
    const month = String(date.getUTCMonth() + 1).padStart(2, "0");
    const year = date.getUTCFullYear();

    return `${day}-${month}-${year}`;
  }

  try {
    const memberShipHistory = await MemberShipHistory.find()
      .sort({ updatedAt: -1 })
      .populate("UserId", "User_Name User_Mobile_No");
    const newMemberShipHistory = memberShipHistory?.map((history) => {
      return {
        ...history.toObject(),
        User_Name: history?.UserId?.User_Name,
        User_Mobile_No: history?.UserId?.User_Mobile_No,
        total_membership: history?.MemberShipData?.length,
        updatedAt: formatDate(new Date(history?.updatedAt)),
      };
    });
    res.status(200).json({
      type: "success",
      message: " MemberShip found successfully!",
      memberShipHistory: newMemberShipHistory || [],
    });
  } catch (error) {
    res
      .status(500)
      .json({ type: "error", message: "Server Error!", errorMessage: error });
    console.log(error);
  }
});

// get all memberShipHistory for user
route.get("/get", authMiddleWare, async (req, res) => {
  const userId = req?.user?.userId;

  try {
    const memberShipHistory = await MemberShipHistory.find({ UserId: userId })
      // .sort({ updatedAt: -1 })
      .lean(); // Convert the document to plain JavaScript object

    // // // Sort MemberShipData array in each document
    // memberShipHistory.forEach(history => {
    //     history.MemberShipData.sort((a, b) => b.MemberShip.startDate - a.MemberShip.startDate);
    // });

    res.status(200).json({
      type: "success",
      message: " MemberShip found successfully!",
      memberShipHistory: memberShipHistory || [],
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
  const { id } = req.params;

  function formatDate(date) {
    const day = String(date.getUTCDate()).padStart(2, "0");
    const month = String(date.getUTCMonth() + 1).padStart(2, "0");
    const year = date.getUTCFullYear();

    return `${day}-${month}-${year}`;
  }

  try {
    let memberShip = await MemberShipHistory.findById(id).populate(
      "UserId",
      "User_Name User_Mobile_No"
    );
    memberShip = [memberShip];
    const newMemberShipHistory = memberShip?.map((history) => {
      return {
        ...history.toObject(),
        User_Name: history?.UserId?.User_Name,
        User_Mobile_No: history?.UserId?.User_Mobile_No,
        updatedAt: formatDate(new Date(history?.updatedAt)),
      };
    });
    res.status(200).json({
      type: "success",
      message: " MemberShip found successfully!",
      memberShips: newMemberShipHistory || [],
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
    await MemberShipHistory.deleteMany();
    res.status(200).json({
      type: "success",
      message: "All MemberShipsHistory deleted successfully!",
    });
  } catch (error) {
    res
      .status(500)
      .json({ type: "error", message: "Server Error!", errorMessage: error });
  }
});

module.exports = route;
