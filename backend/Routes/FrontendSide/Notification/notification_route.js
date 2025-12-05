const express = require("express");
const route = express.Router();
const Order = require("../../../Models/FrontendSide/order_model");
const Cart = require("../../../Models/FrontendSide/cart_model");
const Notification = require("../../../Models/FrontendSide/notification_model");
const { Variation } = require("../../../Models/BackendSide/product_model");
const Wallet = require("../../../Models/FrontendSide/wallet_model");
const User = require("../../../Models/FrontendSide/user_model");
const Coupon = require("../../../Models/FrontendSide/coupon_model");
const multer = require("multer");
const fs = require("fs");
const Charges = require("../../../Models/Settings/add_charges_model");
const authMiddleWare = require("../../../Middleware/authMiddleWares");
const checkAdminOrRole1 = require("../../../Middleware/checkAdminOrRole1");
const checkAdminOrRole2 = require("../../../Middleware/checkAdminOrRole2");
const checkAdminOrRole3 = require("../../../Middleware/checkAdminOrRole3");
const checkAdminOrRole4 = require("../../../Middleware/checkAdminOrRole4");
const checkAdminOrRole5 = require("../../../Middleware/checkAdminOrRole5");
const moment = require("moment-timezone");

const admin = require("firebase-admin");

// Set up multer middleware to handle file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./imageUploads/frontend/notification");
  },
  filename: function (req, file, cb) {
    cb(null, file?.originalname);
  },
});
const upload = multer({ storage: storage });

// // send the notification
// route.get('/send', async (req, res) => {
//     try {

//         admin.initializeApp({
//             credential: admin.credential.cert(serviceAccount)
//         });

//         const message = {
//             notification: {
//                 title: 'Tushar',
//                 body: 'This is a sample notification for tushar',
//             },
//             // data: {
//             //     orderId: '123456' // Add your order ID here
//             // }
//         };

//         // An array of FCM tokens for the devices you want to notify
//         const fcmTokens = [
//             'cEbnx24xTemfwq_Npb7sHy:APA91bGevhJc3yztTm9NhLOGw3C7komlPa5hi3PIS_mYGP8ytyEKKd3NFf9vmTOp4PjQ8Zpabz-ITwxhfTQDSJ0FGSV77RgYTHETI4Pk_2cADvdSJubc-qfhrmd0vdOq_uLF1zP4eiwC',
//             'c94SrejSSUClsyWxSi7fuZ:APA91bHoEOyv0E7lJW17scv1DtPf3TpkO9GKwBVD21FFFJ0Df21MegKuPCwlFPOQ1NNkNT3Ru2yb2lKdBXiUQJ8SFm_EBIyUDEQT-OpSW1-o5OslGO6KeLEpLX070jSAX-sMeqCnd5b1',
//         ];

//         // Send a message to each device
//         const sendPromises = fcmTokens.map(token => {
//             message.token = token;
//             return admin.messaging().send(message);
//         });

//         // Wait for all notifications to be sent
//         Promise.all(sendPromises)
//             .then(responses => {
//                 console.log('Successfully sent messages:', responses);
//             })
//             .catch(error => {
//                 console.error('Error sending messages:', error);
//             });

//     } catch (error) {
//         console.log(error)
//     }
// })

// send Notification
route.post("/sendbyadmin",
  checkAdminOrRole2,
  upload.single("image"),
  async (req, res) => {
    try {
      const { title, message, userType, selectedUser } = req.body;

      const userIds = selectedUser.split(",");

      const newNotification = new Notification({
        sendFor: userType,
        message,
        title,
        type: 0,
      });

      if (userType === "3" || userType === "4") {
        newNotification.userId = userIds;
      }

      if (req?.file) {
        const originalFilename = req.file.originalname;
        const extension = originalFilename.substring(
          originalFilename.lastIndexOf(".")
        );
        const imageFilename = `${req.body.title.replace(
          /\s/g,
          "_"
        )}${extension}`;
        const imagePath = "imageUploads/frontend/notification/" + imageFilename;

        fs.renameSync(req?.file?.path, imagePath);

        const image = {
          filename: imageFilename,
          path: imagePath,
          originalname: originalFilename,
        };
        newNotification.Notification_Image = image;
      }

      await newNotification.save();

      try {
        // Send push notifications
        let userTokens = [];
        if (userType === "0") {
          const users = await User.find({
            Notification_Token: { $exists: true, $ne: "" },
          }); // Filter out empty tokens
          userTokens.push(...users.map((user) => user.Notification_Token));
        } else if (userType === "1") {
          const users = await User.find({
            User_Type: "0",
            Notification_Token: { $exists: true, $ne: "" },
          });
          userTokens.push(...users.map((user) => user.Notification_Token));
        } else if (userType === "2") {
          const resellers = await User.find({
            User_Type: { $in: ["1", "2", "3"] },
            Notification_Token: { $exists: true, $ne: "" },
          });
          userTokens.push(
            ...resellers.map((reseller) => reseller.Notification_Token)
          );
        } else if (userType === "3" || userType === "4") {
          const selectedUsers = await User.find({
            _id: { $in: userIds },
            Notification_Token: { $exists: true, $ne: "" },
          });
          userTokens.push(
            ...selectedUsers.map((user) => user.Notification_Token)
          );
        }

        // const sendPromises = userTokens.map(token => {
        //     return admin.messaging().send({
        //         token: token,
        //         notification: {
        //             title: title,
        //             body: message,
        //         }
        //     });
        // });

        const sendPromises = userTokens.map((token) => {
          const notificationPayload = {
            token: token,
            notification: {
              title: title,
              body: message,
            },
          };
          if (newNotification.Notification_Image) {
            notificationPayload.data = {
              picture:
                `${
                  process.env.IP_ADDRESS
                }/${newNotification.Notification_Image.path?.replace(
                  /\\/g,
                  "/"
                )}` || "",
            };
          }
          return admin.messaging().send(notificationPayload);
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
        console.log("Error sending push notifications", error);
      }

      res
        .status(200)
        .json({ type: "success", message: "Notification send successfully!" });
    } catch (error) {
      if (req?.file) {
        fs.unlinkSync(req?.file?.path);
      }
      res
        .status(500)
        .json({ type: "error", message: "Server Error!", errorMessage: error });
      console.log(error);
    }
  }
);

// send Notification at notify
route.post("/notify/byadmin", async (req, res) => {
  try {
    // const { title, message, userType, selectedUser } = req.body;
    const { userMobNo, productName } = req.body.datas;

    let userId = await User.find({ User_Mobile_No: userMobNo });
    const user = await User.findById(userId);
    const userType = user?.User_Type;
    const notificationToken = user?.Notification_Token;

    let sendFor;
    if (userType === "0") {
      sendFor = "3";
    } else {
      sendFor = "4";
    }

    const newNotification = new Notification({
      sendFor: sendFor,
      title: "Notify",
      message: `The product ${productName} you were looking for is back in stock, you can purchase it now. Thank you for your interest!`,
      type: "2",
      userId: userId,
    });

    await newNotification.save();

    let message = {
      notification: {
        title: `Notify`,
        body: `The product ${productName} you were looking for is back in stock, you can purchase it now. Thank you for your interest!`,
      },
    };

    try {
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
      console.log("Error sending push notifications", error);
    }

    res
      .status(200)
      .json({ type: "success", message: "Notification send successfully!" });
  } catch (error) {
    res
      .status(500)
      .json({ type: "error", message: "Server Error!", errorMessage: error });
    console.log(error);
  }
});

// get all notification
route.get("/getAll", checkAdminOrRole2, async (req, res) => {
  try {
    let NotificationList = await Notification.find()
      .populate({
        path: "userId",
        model: "Users",
        select: "User_Name",
      })
      .populate({
        path: "orderId",
        model: "Orders",
      })
      .sort({ updatedAt: -1 });

    if (NotificationList.length >= 1) {
      NotificationList = NotificationList?.map((notification) => {
        let sendFor = "";
        if (notification.sendFor === "0") {
          sendFor = "All";
        } else if (notification.sendFor === "1") {
          sendFor = "All Users";
        } else if (notification.sendFor === "2") {
          sendFor = "All Resellers";
        } else if (notification.sendFor === "3") {
          sendFor = "Particular Users";
        } else if (notification.sendFor === "4") {
          sendFor = "Particular Resellers";
        }

        let type = "";
        if (notification.type === "0") {
          type = "Admin";
        } else if (notification.type === "1") {
          type = "For Order Time";
        } else if (notification.type === "2") {
          type = "Notify";
        }

        return {
          ...notification.toObject(),
          SendFor: sendFor,
          Type: type,
          notificationImage:
            `${
              process.env.IP_ADDRESS
            }/${notification?.Notification_Image?.path?.replace(/\\/g, "/")}` ||
            "",
          Date: new Date(notification?.createdAt)?.toLocaleDateString("en-IN"),
          Time: moment(notification?.createdAt)
            .tz("Asia/Kolkata")
            .format("hh:mm:ss A"),
        };
      });
    }

    res
      .status(200)
      .json({
        type: "success",
        message: "All Notification get Successfully!",
        notificationList: NotificationList || [],
      });
  } catch (error) {
    res
      .status(500)
      .json({ type: "error", message: "Server Error!", errorMessage: error });
    console.log(error);
  }
});

// delete notification by id
route.delete("/delete/:id", checkAdminOrRole2, async (req, res) => {
  const notificationId = await req.params.id;
  try {
    const result = await Notification.findByIdAndDelete(notificationId);
    if (!result) {
      res
        .status(404)
        .json({ type: "error", message: "Notification not found!" });
    }
    res
      .status(200)
      .json({ type: "error", message: "Notification deleted Successfully!" });
  } catch (error) {
    res
      .status(500)
      .json({ type: "error", message: "Server Error!", errorMessage: error });
  }
});

// delete many notification
route.delete("/deletes", checkAdminOrRole2, async (req, res) => {
  try {
    const { ids } = req.body;
    await Notification.deleteMany({ _id: { $in: ids } });
    res
      .status(200)
      .json({
        type: "success",
        message: "All Notification deleted Successfully!",
      });
  } catch (error) {
    res
      .status(500)
      .json({ type: "error", message: "Server Error!", errorMessage: error });
  }
});

// delete or remove all notification
route.delete("/delete", checkAdminOrRole2, async (req, res) => {
  try {
    await Notification.deleteMany();
    res
      .status(200)
      .json({
        type: "success",
        message: "All Notification deleted Successfully!",
      });
  } catch (error) {
    res
      .status(500)
      .json({ type: "error", message: "Server Error!", errorMessage: error });
  }
});

// Get all notification for a particular user
route.get("/get/byuser", authMiddleWare, async (req, res) => {
  try {
    const userId = req.user.userId;
    const user = await User.findById(userId);

    const notifications = await Notification.find({
      $or: [
        { userId: userId },
        { sendFor: "0" },
        {
          $and: [
            { sendFor: user.User_Type },
            { $or: [{ userType: "all" }, { userType: user.User_Type }] },
          ],
        },
      ],
    }).sort({ updatedAt: -1 });

    res.status(200).send({
        type: "success",
        message: "All Notification get Successfully!",
        total_count: notifications?.length || 0,
        notificationList: notifications || [],
      });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

module.exports = route;
