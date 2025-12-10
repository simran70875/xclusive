const express = require("express");
const route = express.Router();
const Wallet = require("../../../Models/FrontendSide/wallet_model");
const User = require("../../../Models/FrontendSide/user_model");
const authMiddleWare = require("../../../Middleware/authMiddleWares");
const Coins = require("../../../Models/FrontendSide/coins_model");
const Settings = require("../../../Models/Settings/general_settings_model");
const checkAdminRole = require("../../../Middleware/adminMiddleWares");
const Notification = require("../../../Models/FrontendSide/notification_model");
const moment = require("moment-timezone");
const admin = require("firebase-admin");

// withdrawal coin in wallet
route.post("/withdrawal", authMiddleWare, async (req, res) => {
  try {
    const userId = req.user.userId;
    let { amount } = req.body;
    const user = await User.findById(userId);
    const settings = await Settings.find();

    amount = Number(amount);
    amount = Math.floor(amount);

    if (!user) {
      return res
        .status(200)
        .json({ type: "error", message: "User not found." });
    }

    const coinsConvert = settings?.[0]?.price_convert_coin;
    let coinsWithdrawalLimit = settings?.[0]?.coin_withdrawal_limit;
    coinsWithdrawalLimit = Number(coinsWithdrawalLimit);

    const newAmount = Math.floor(amount / coinsConvert);

    if (amount < coinsWithdrawalLimit) {
      return res.status(200).json({
        type: "warning",
        message: `Minimum withdrawal limit is ${coinsWithdrawalLimit} coins.`,
      });
    }

    // Create a new coupon
    const newCoinsRecord = new Coins({
      userId: userId,
      Amount: amount,
      Description: `Your ${amount} coins have been converted to your wallet balance. Refer more to earn more coins.`,
      Type: "1",
      Trans_Type: "Debit",
    });
    await newCoinsRecord.save();
    user.Coins -= amount;

    const newWallte = await new Wallet({
      Amount: newAmount || 0,
      userId,
      Trans_Type: "Credit",
      Description: `Congratulations! Your earned Coins ${amount} have been successfully converted to your wallet as Rs.${newAmount}.`,
      Type: "2",
    });

    user.Wallet = (await user?.Wallet) + amount;

    await newWallte.save();

    await user.save();

    res
      .status(200)
      .json({ type: "success", message: "Coins withdrawal successfully." });
  } catch (error) {
    res.status(500).json({ type: "error", message: "Internal server error." });
    console.log(error);
  }
});

// funcation for send notification
const notifyUserOfCoins = async ( userId, userType, amount, transType, description) => {
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
      title = `Coins Credited of amount ${amount}`;
      message = description;
    } else if (transType === "Debit") {
      title = `Coins Debited of amount ${amount}`;
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
          title: `Coins Credited of amount ${amount}`,
          body: description,
        },
      };
    } else if (transType === "Debit") {
      message = {
        notification: {
          title: `Coins Debited of amount ${amount}`,
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

// add coins history by admin
route.post("/add/byadmin", checkAdminRole, async (req, res) => {
  let { amount, transType, userId, paymentId, description } = req.body;
  amount = Number(amount);
  amount = Math.floor(amount);

  console.log("req.body =====> ", req.body, amount);

  let desc;
  let type;
  if (transType === "Credit") {
    type = "4";
    desc = `Greetings! You earned ${amount} coins by Budai Exclusive.`;
  } else {
    type = "3";
    desc = `Your ${amount} coins has been debited by Budai Exclusive.`;
  }

  try {
    const user = await User.findById(userId);
    console.log("User found:", user);
    if (!user) {
      return res.status(400).json({ type: "error", message: "User not found" });
    }
    const userType = user?.User_Type;
    const newUser = await User.findByIdAndUpdate(userId);
    console.log("New User before update:", newUser);

    if (!newUser.Coins) {
      newUser.Coins = 0;
    }

    const newCoins = await new Coins({
      Amount: amount || 0,
      userId,
      paymentId: paymentId || "",
      Trans_Type: transType,
      Description: description || "",
      Type: type,
    });

    if (transType === "Credit") {
      newUser.Coins = (await newUser?.Coins) + amount;
    } else {
      newUser.Coins = (await newUser?.Coins) - amount;
    }

    await newUser.save();
    await newCoins.save();
    await notifyUserOfCoins(userId, userType, amount, transType, description);

    res
      .status(200)
      .json({ type: "success", message: "Coins history added successfully!" });
  } catch (error) {
    res
      .status(500)
      .json({ type: "error", message: "Server Error!", errorMessage: error });
    console.log(error);
  }
});

// get All Coins history
route.get("/get", checkAdminRole, async (req, res) => {
  const page = parseInt(req.query.page);
  const pageSize = parseInt(req.query.pageSize);
  try {
    const total = await Coins.countDocuments();
    const coins = await Coins.find()
      .populate({
        path: "userId",
        model: "Users",
        select: "User_Name User_Mobile_No",
      })
      .sort({ createdAt: -1 })
      .skip(pageSize * (page - 1))
      .limit(pageSize);

    console.log(page, pageSize, total);

    if (coins.length === 0) {
      return res.status(200).json({
        type: "error",
        message: "No coins transactions found",
        coupon: [],
      });
    }

    const populatedCoins = coins.map((coin) => {
      let Type = "";
      if (coin.Type === "0") {
        Type = "Reward At Order Time";
      } else if (coin.Type === "1") {
        Type = "Coins Withdrawal";
      } else if (coin.Type === "2") {
        Type = "Reward At Review Time";
      } else if (coin.Type === "3") {
        Type = "Admin Debit";
      } else if (coin.Type === "4") {
        Type = "Admin Credit";
      }

      return {
        ...coin.toObject(),
        Type: Type,
        User_Name: coin?.userId?.User_Name || "",
        User_Mobile_No: coin?.userId?.User_Mobile_No || "",
        Date: new Date(coin?.createdAt)?.toLocaleDateString("en-IN"),
        Time: moment(coin?.createdAt).tz("Asia/Kolkata").format("hh:mm:ss A"),
      };
    });

    return res.status(200).json({
      type: "success",
      message: " Wallet found successfully!",
      coins: populatedCoins || [],
      total,
      currentPage: page,
      pageSize,
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
    const coins = await Coins.find({ userId: userId }).sort({ createdAt: -1 });
    res.status(200).json({
      type: "success",
      message: " Coins found successfully!",
      coins: coins || [],
    });
  } catch (error) {
    res
      .status(500)
      .json({ type: "error", message: "Server Error!", errorMessage: error });
  }
});

// delete all coins history
route.delete("/delete", checkAdminRole, async (req, res) => {
  try {
    const coins = await Coins.find();

    await Coins.deleteMany();
    res.status(200).json({
      type: "error",
      message: "All Coins History deleted Successfully!",
    });
  } catch (error) {
    res
      .status(500)
      .json({ type: "error", message: "Server Error!", errorMessage: error });
    console.log(error);
  }
});

// delete order by id
route.delete("/delete/:id", checkAdminRole, async (req, res) => {
  const coinId = await req.params.id;
  try {
    const result = await Coins.findByIdAndDelete(coinId);
    if (!result) {
      res
        .status(200)
        .json({ type: "error", message: "Coins history not found!" });
    }
    res
      .status(200)
      .json({ type: "error", message: "Coins history deleted Successfully!" });
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
    await Coins.deleteMany({ _id: { $in: ids } });
    res.status(200).json({
      type: "success",
      message: "All Coins history deleted Successfully!",
    });
  } catch (error) {
    res
      .status(500)
      .json({ type: "error", message: "Server Error!", errorMessage: error });
  }
});

module.exports = route;
