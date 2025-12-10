const express = require("express");
const route = express.Router();
const User = require("../../../Models/FrontendSide/user_model");
const authMiddleWare = require("../../../Middleware/authMiddleWares");
const fs = require("fs");
const path = require("path");
const Wallet = require("../../../Models/FrontendSide/wallet_model");
const Order = require("../../../Models/FrontendSide/order_model");
const MemberShipHistory = require("../../../Models/BackendSide/memberShipHistory_model");
const checkAdminRole = require("../../../Middleware/adminMiddleWares");
const checkAdminOrRole1 = require("../../../Middleware/checkAdminOrRole1");
const checkAdminOrRole2 = require("../../../Middleware/checkAdminOrRole2");
const checkAdminOrRole3 = require("../../../Middleware/checkAdminOrRole3");
const checkAdminOrRole5 = require("../../../Middleware/checkAdminOrRole5");
const {
  checkAdminWithMultRole354,
} = require("../../../Middleware/checkAdminWithMultRole");
const Notification = require("../../../Models/FrontendSide/notification_model");
const moment = require("moment-timezone");

const admin = require("firebase-admin");

// funcation for increment the end date of active membership
// async function incrementDateOfMembership(userId) {
//     console.log(userId)
//     try {
//         const memberShipHistory = await MemberShipHistory.findOne({ UserId: userId })

//         if (memberShipHistory) {
//             const latestMembership = memberShipHistory?.MemberShipData[0];
//             if (latestMembership) {
//                 const endDate = new Date(latestMembership.MemberShip.endDate);
//                 endDate.setMonth(endDate.getMonth() + 2);
//                 console.log(endDate)

//                 latestMembership.MemberShip.endDate = endDate;
//                 await memberShipHistory.save();
//                 console.log(memberShipHistory?.MemberShipData[0]?.MemberShip?.endDate)
//             }
//         }
//     } catch (error) {
//         console.error("Error incrementing membership end date:", error);
//     }
// }

async function incrementDateOfMembership(userId) {
  try {
    const memberShipHistory = await MemberShipHistory.findOne({
      UserId: userId,
    });
    if (memberShipHistory) {
      // Find the latest MemberShipData entry
      const latestMemberShip = memberShipHistory.MemberShipData[0];
      if (latestMemberShip) {
        const currentEndDate = new Date(latestMemberShip.MemberShip.endDate);
        const newEndDate = new Date(
          currentEndDate.getFullYear(),
          currentEndDate.getMonth() + 2,
          currentEndDate.getDate()
        );

        // Update the latest MemberShipData entry with the new endDate
        await MemberShipHistory.updateOne(
          {
            _id: memberShipHistory._id,
            "MemberShipData._id": latestMemberShip._id,
          },
          { $set: { "MemberShipData.$.MemberShip.endDate": newEndDate } }
        );
      }
    }
  } catch (error) {
    console.error("Error updating membership end date:", error);
  }
}

// funcation for send notification
const notifyUserOfWallet = async (
  userId,
  userType,
  amount,
  transType,
  description
) => {
  try {
    let sendFor;
    if (userType === "0") {
      sendFor = "3";
    } else {
      sendFor = "4";
    }

    const user = await User.findById(userId);
    const userName = user?.User_Name;

    const notificationToken = user?.Notification_Token;

    await notifyAdminOfNewOrder(
      userId,
      userName,
      userType,
      notificationToken,
      amount,
      transType,
      description
    );

    let message;
    let title;
    if (transType === "Credit") {
      title = "Amount Credited";
      message = description;
    } else if (transType === "Debit") {
      title = `Amount Debited`;
      message = description;
    }

    const newNotification = new Notification({
      sendFor: sendFor,
      title,
      message,
      userId: [userId],
      type: "0",
    });

    await newNotification.save();
  } catch (error) {
    console.log(error);
  }
};

// funcation for send notification to user for order
const notifyAdminOfNewOrder = async (
  userId,
  userName,
  userType,
  notificationToken,
  amount,
  transType,
  description
) => {
  try {
    let message;

    if (transType === "Credit") {
      message = {
        notification: {
          title: `Amount Credited`,
          body: description,
        },
      };
    } else if (transType === "Debit") {
      message = {
        notification: {
          title: `Amount Debited`,
          body: description,
        },
      };
    }

    // An array of FCM tokens for the devices you want to notify
    const fcmTokens = [notificationToken];

    // Send a message to each device
    const sendPromises = fcmTokens.map((token) => {
      message.token = token;
      return admin.messaging().send(message);
    });

    // Wait for all notifications to be sent
    Promise.all(sendPromises)
      .then((responses) => {
        console.log("Successfully sent messages:", responses);
      })
      .catch((error) => {
        console.error("Error sending messages:", error);
      });
  } catch (error) {
    // console.log(error, "err")
  }
};

// add wallet history
route.post("/mob/add", authMiddleWare, async (req, res) => {
  const userId = req.user.userId;
  let { amount, paymentId } = req.body;

  amount = Number(amount);
  amount = Math.floor(amount);

  console.log(amount, paymentId,userId, "amount");
  let desc = `You have added Rs.${amount} to your wallet’s balance.`;

  try {
    const user = await User.findById(userId);
    const userType = user?.User_Type;
    const newUser = await User.findByIdAndUpdate(userId);

    const newWallte = await new Wallet({
      Amount: amount || 0,
      userId,
      paymentId: paymentId || "",
      Trans_Type: "Credit",
      Description: desc || "",
      Type: "0",
    });


    newUser.Wallet = amount <= 0 ? 0 : (await newUser?.Wallet) + amount;

    await newUser.save();
    await newWallte.save();
    if (userType !== "0") {
      await incrementDateOfMembership(userId);
    }
    res.status(200).json({ type: "success",data:newWallte, message:  `Rs.${amount} has been successfully added to your wallet.`});
  } catch (error) {
    res
      .status(500)
      .json({ type: "error", message: "Server Error!", errorMessage: error });
    console.log(error);
  }
});

// add wallet history by admin
route.post("/add/byadmin", checkAdminOrRole3, async (req, res) => {
  let { amount, transType, userId, paymentId, description } = req.body;
  amount = Number(amount);
  amount = Math.floor(amount);

  let desc;
  let type;
  if (transType === "Credit") {
    type = "5";
    desc = `Greetings! Budai Exclusive has credited your wallet with Rs.${amount}`;
  } else {
    type = "4";
    desc = `Your wallet’s balance has been debited with Rs.${amount} for Budai Exclusive.`;
  }

  try {
    const user = await User.findById(userId);

    if (transType === "Debit" && user?.Wallet < amount) {
      return res
        .status(200)
        .json({ type: "warning", message: "Insufficient Balance !" });
    }

    const userType = user?.User_Type;
    const newUser = await User.findByIdAndUpdate(userId);

    const newWallte = await new Wallet({
      Amount: amount || 0,
      userId,
      paymentId: paymentId || "",
      Trans_Type: transType,
      Description: description || "",
      Type: type,
    });

    if (transType === "Credit") {
      newUser.Wallet = (await newUser?.Wallet) + amount;
    } else {
      newUser.Wallet = (await newUser?.Wallet) - amount;
    }

    await newUser.save();
    await newWallte.save();
    await notifyUserOfWallet(userId, userType, amount, transType, description);
    if (userType !== "0") {
      await incrementDateOfMembership(userId);
    }
    res
      .status(200)
      .json({ type: "success", message: "wallet history added successfully!" });
  } catch (error) {
    res
      .status(500)
      .json({ type: "error", message: "Server Error!", errorMessage: error });
    console.log(error);
  }
});

// add wallet history (for add delivery charge on reseller order) by admin
route.post(
  "/add/deliveryCharge/byadmin",
  checkAdminOrRole3,
  async (req, res) => {
    try {
      let { amount, userId, orderId } = req.body;
      amount = Number(amount);
      amount = Math.floor(amount);

      let type = "4";
      // let desc = `Your wallet’s balance has been debited with Rs.${amount} for Budai Exclusive on Order id ${orderId}.`
      let desc = `Amount Rs.${amount} Deduct for order id:- ${orderId}.`;

      const newUser = await User.findByIdAndUpdate(userId);

      if (newUser.Wallet < amount) {
        return res
          .status(200)
          .send({ type: "warning", message: "Insufficient Wallet Balance!" });
      }

      const order = await Order.findOne({ orderId: orderId });

      const newWallte = await new Wallet({
        Amount: amount || 0,
        userId,
        paymentId: "",
        Trans_Type: "Debit",
        Description: desc || "",
        Type: type,
      });

      newUser.Wallet = (await newUser?.Wallet) - amount;

      order.is_Shipping_ChargeAdd = true;

      await newUser.save();
      await newWallte.save();
      await order.save();

      const transType = "Debit";
      const user = await User.findById(userId);
      const userType = user?.User_Type;
      await notifyUserOfWallet(userId, userType, amount, transType, desc);

      res.status(200).json({
        type: "success",
        message: "Delivery Charge added successfully!",
      });
    } catch (error) {
      res
        .status(500)
        .json({ type: "error", message: "Server Error!", errorMessage: error });
      console.log(error);
    }
  }
);

// get All Wallet history
route.get("/get", checkAdminOrRole3, async (req, res) => {
  const page = parseInt(req.query.page);        
  const pageSize = parseInt(req.query.pageSize); 
  try {
    const total = await Wallet.countDocuments();
    const wallets = await Wallet.find().populate({
        path: "userId",
        model: "Users",
        select: "User_Name User_Mobile_No",
      }).sort({ createdAt: -1 }).skip((page - 1) * pageSize).limit(pageSize);

     console.log(page, pageSize);

    if (wallets.length === 0) {
      return res.status(200).json({
        type: "error",
        message: "No wallets transactions found",
        coupon: [],
      });
    }

    const populatedWallet = wallets.map((wallet) => {
      let Type = "";
      if (wallet.Type === "0") {
        Type = "Wallet Transfer";
      } else if (wallet.Type === "1") {
        Type = "Become A Reseller";
      } else if (wallet.Type === "2") {
        Type = "Convert Coins to Wallet";
      } else if (wallet.Type === "3") {
        Type = "Use At Order time";
      } else if (wallet.Type === "4") {
        Type = "Admin Debit";
      } else if (wallet.Type === "5") {
        Type = "Admin Credit";
      }

      return {
        ...wallet.toObject(),
        Type: Type,
        User_Name: wallet?.userId?.User_Name,
        User_Mobile_No: wallet?.userId?.User_Mobile_No,
        Date: new Date(wallet?.createdAt)?.toLocaleDateString("en-IN"),
        Time: moment(wallet?.createdAt).tz("Asia/Kolkata").format("hh:mm:ss A"),
      };
    });

    return res.status(200).json({
      type: "success",
      message: " Wallet found successfully!",
      wallet: populatedWallet || [],
      total : total,
      currentPage: page,
      pageSize,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ type: "error", message: "Server Error!", errorMessage: error });
    
  }
});

// get All Wallet history (pagination)
route.get("/list/getAll", async (req, res) => {
  try {
    let { page, limit, search } = req.query;
    page = page || 1;
    limit = limit || 10;
    const skip = (page - 1) * limit;
    let query = {};
    if (search) {
      const regexSearch = new RegExp(search, "i");
      // Check if the search term is a number
      const isNumeric = /^\d+$/.test(search);
      // If search term is numeric, convert it to a number
      const searchValue = isNumeric ? parseInt(search) : "";
      const userIds = await User.find({
        User_Mobile_No: { $in: searchValue },
      }).select("_id");
      query = {
        $or: [
          { paymentId: { $regex: regexSearch } },
          { userId: { $in: userIds } },
        ],
      };
    }
    const totalCount = await Wallet.countDocuments(query);

    const wallets = await Wallet.find(query)
      .skip(skip)
      .limit(Number(limit))
      .populate({
        path: "userId",
        model: "Users",
        select: "User_Name User_Mobile_No",
      })
      .sort({ createdAt: -1 });

    if (wallets.length === 0) {
      return res.status(200).json({
        type: "error",
        message: "No wallets transactions found",
        coupon: [],
      });
    }

    const populatedWallet = wallets.map((wallet) => {
      let Type = "";
      if (wallet.Type === "0") {
        Type = "Wallet Transfer";
      } else if (wallet.Type === "1") {
        Type = "Become A Reseller";
      } else if (wallet.Type === "2") {
        Type = "Convert Coins to Wallet";
      } else if (wallet.Type === "3") {
        Type = "Use At Order time";
      } else if (wallet.Type === "4") {
        Type = "Admin Debit";
      } else if (wallet.Type === "5") {
        Type = "Admin Credit";
      }

      return {
        ...wallet.toObject(),
        Type: Type,
        User_Name: wallet?.userId?.User_Name,
        User_Mobile_No: wallet?.userId?.User_Mobile_No,
        Date: new Date(wallet?.createdAt)?.toLocaleDateString("en-IN"),
        Time: moment(wallet?.createdAt).tz("Asia/Kolkata").format("hh:mm:ss A"),
      };
    });

    res.status(200).json({
      type: "success",
      message: " Wallet found successfully!",
      wallet: populatedWallet || [],
      total: totalCount,
      currentPage: parseInt(page),
      pageSize: Number(limit) || 0,
    });
  } catch (error) {
    res
      .status(500)
      .json({ type: "error", message: "Server Error!", errorMessage: error });
    console.log(error);
  }
});

// get All Wallet history fot particular user
route.get("/user/get", authMiddleWare, async (req, res) => {
  const userId = await req?.user?.userId;

  try {
    const wallet = await Wallet.find({ userId: userId }).sort({
      createdAt: -1,
    });
    const newWallet = wallet?.map((wallet) => ({
      ...wallet.toObject(),
      Amount: Math.floor(wallet?.Amount) || 0,
    }));
    res.status(200).json({
      type: "success",
      message: " Wallet found successfully!",
      wallet: newWallet || [],
    });
  } catch (error) {
    res
      .status(500)
      .json({ type: "error", message: "Server Error!", errorMessage: error });
  }
});

// delete all wallet history
route.delete("/delete", checkAdminOrRole3, async (req, res) => {
  try {
    const wallet = await Wallet.find();

    await Wallet.deleteMany();
    res.status(200).json({
      type: "error",
      message: "All Wallet History deleted Successfully!",
    });
  } catch (error) {
    res
      .status(500)
      .json({ type: "error", message: "Server Error!", errorMessage: error });
    console.log(error);
  }
});

// delete order by id
route.delete("/delete/:id", checkAdminOrRole3, async (req, res) => {
  const walletId = await req.params.id;
  try {
    const result = await Wallet.findByIdAndDelete(walletId);
    if (!result) {
      res
        .status(200)
        .json({ type: "error", message: "Wallet history not found!" });
    }
    res
      .status(200)
      .json({ type: "error", message: "Wallet history deleted Successfully!" });
  } catch (error) {
    res
      .status(500)
      .json({ type: "error", message: "Server Error!", errorMessage: error });
  }
});

// delete many wallet
route.delete("/deletes", checkAdminOrRole3, async (req, res) => {
  try {
    const { ids } = req.body;
    await Wallet.deleteMany({ _id: { $in: ids } });
    res.status(200).json({
      type: "success",
      message: "All Wallet history deleted Successfully!",
    });
  } catch (error) {
    res
      .status(500)
      .json({ type: "error", message: "Server Error!", errorMessage: error });
  }
});

module.exports = route;
