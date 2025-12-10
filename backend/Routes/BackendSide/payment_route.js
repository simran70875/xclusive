const express = require("express");
const route = express.Router();
const Orders = require("../../Models/FrontendSide/order_model");
const user_model = require("../../Models/FrontendSide/user_model");
const config = require("../../config.json");
const { JuspaySetup } = require("../../services/juspayService");
const { APIError } = require("expresscheckout-nodejs");
const { generateUniqueKey } = require("../../utils/generateUniqueKey");
const {makeJuspayResponse, makeError} = require("../../utils/paymentUtilities");
const wallet_model = require("../../Models/FrontendSide/wallet_model");
const paymentPageClientId = config.PAYMENT_PAGE_CLIENT_ID;
const multer = require('multer');
const upload = multer();

// Middleware for handling form data without files
const handleFormData = (req, res, next) => {
  upload.none()(req, res, next);
}
// function for add wallet history
async function addWalletHistory(userId, orderId, FinalPrice) {
  const wallet = await new wallet_model({
    Amount: FinalPrice || 0,
    userId: userId,
    paymentId: orderId || "",
    Trans_Type: "Debit",
    Description: `You have used Rs.${FinalPrice} from your wallet for Order ID ${orderId}.`,
    Type: "3",
  });
  console.log("wallet ==>" , wallet);

  await wallet.save();
}

route.post("/processPayment", async (req, res) => {
  const orderId = await generateUniqueKey();
  const amount = req.query.amounts;
  const paymentsFor = req.body.paymentsFor;
  const device = req.body.device;

  let returnUrl;
  if (paymentsFor === "membership") {
    returnUrl = `${process.env.IP_ADDRESS}/handleJuspayMembershipResponse`;
  } else if (paymentsFor === "wallet") {
    returnUrl = device === "web" ? `${process.env.IP_ADDRESS}/handleJuspayWalletResponseWeb` : `${process.env.IP_ADDRESS}/handleJuspayWalletResponse`;
  } else {
    returnUrl = `${process.env.IP_ADDRESS}/handleJuspayResponse`;
  }
  console.log("returnUrl ==> ", returnUrl);

  try {
    const sessionResponse = await JuspaySetup.orderSession.create({
      order_id: orderId,
      amount: amount,
      payment_page_client_id: paymentPageClientId,
      customer_id: "hdfc-testing-customer-one",
      action: "paymentPage",
      return_url: returnUrl,
      currency: "INR",
    });

    console.log("sessionResponse ==> ", sessionResponse);

    return res.json(makeJuspayResponse(sessionResponse));
  } catch (error) {
    console.log("error =====> ", error);
    if (error instanceof APIError) {
      return res.json(makeError(error.message));
    }
    return res.json(makeError());
  }
});

route.post("/handleJuspayResponse", handleFormData, async (req, res) => {
  const orderId = req.body.order_id || req.body.orderId;
  console.log(req.body);
  console.log("orderId handleJuspayResponse ==> ", orderId);

  if (!orderId) {
    return res.status(404).send("order_id not present or cannot be empty");
  }

  try {
    const statusResponse = await JuspaySetup.order.status(orderId);
    const orderStatus = statusResponse.status;
    const currentOrder = await Orders.findOne({ orderId });
    const userId = currentOrder.userId;

    console.log("statusResponse ==> ", statusResponse);
    console.log("orderStatus ==> ", orderStatus);
    console.log("currentOrder ==> ", currentOrder);

    async function handleWalletAmount() {
      const existUser = await user_model.findByIdAndUpdate({ _id: userId });
      if (!existUser) return res.json(makeError("user not found"));     

      try {
        //wallet deduction if payment type is online and wallet is true
        if (currentOrder.PaymentType == "1" && currentOrder.wallet == true) {
          console.log("before deduction existUser.Wallet ==> ", existUser.Wallet);
          existUser.Wallet -= currentOrder.walletAmount;
          console.log("after deduction existUser.Wallet ==> ", existUser.Wallet, "currentOrder.walletAmount => ", currentOrder.walletAmount);
          if(existUser.Wallet >= 0){
            existUser.save();
            addWalletHistory(userId, orderId, currentOrder.walletAmount);
          }
        }

        //wallet deduction if payment type is cod and wallet is true
        if (currentOrder.PaymentType == "2" && currentOrder.wallet == true) {
          let used_Wallet_Amt;

          if (currentOrder.cod_advance_amt >= existUser.Wallet) used_Wallet_Amt = existUser.Wallet;
          else used_Wallet_Amt = currentOrder.cod_advance_amt;
          
          console.log("used_Wallet_Amt ==> ", used_Wallet_Amt, "cod_advance_amt ==> ", currentOrder.cod_advance_amt);
          existUser.Wallet -= used_Wallet_Amt;
          console.log("existUser.Wallet ==> ", existUser.Wallet);
          if(existUser.Wallet >= 0){ 
            existUser.save();
            addWalletHistory(userId, orderId, used_Wallet_Amt);
          }
        }

      } catch (error) {
        console.error( "Error updating wallet or adding wallet history: ", error);
      }
    }

    async function paymentFailedRes(message, path) {
      if (currentOrder.device === "mobile") return res.send({status: orderStatus, message: message,data: statusResponse});
      return res.redirect(`${process.env.FRONTEND_URL}/${path}?orderId=${orderId}`);
    }

    switch (orderStatus) {
      case "CHARGED":
        if ((currentOrder.PaymentType === "1" && currentOrder.ActualPayment + currentOrder.walletAmount === currentOrder.FinalPrice) ||
            (currentOrder.PaymentType === "2" && currentOrder.FinalAdavnceCodPrice + currentOrder.walletAmount === currentOrder.cod_advance_amt)) {

          //update order status
          const updateData = currentOrder.PaymentType !== "2" ? { payment_status: "Paid", OrderType: "1" } : { cod_status: "Paid", OrderType: "1" };
          await Orders.findOneAndUpdate({ orderId }, updateData, { new: true });

          //update wallet and wallet history if wallet is true
          if (currentOrder.wallet === true) await handleWalletAmount();

          // send response to mobile app
          if (currentOrder.device === "mobile") return res.send({status: orderStatus, message: "Payment Successfull", data: statusResponse});

          // send response to web frontend
          return res.redirect(`${process.env.FRONTEND_URL}/thankyou?orderId=${orderId}`);
        } else {
          //if payment is not successfull or not exact amount
          await Orders.findOneAndUpdate({ orderId },{ payment_status: "Partial" },{ new: true });

           // send response to mobile app
          if (currentOrder.device === "mobile") return res.send({status: "Partial", message: "Payment Partial", data: statusResponse});

          // send response to web frontend
          return res.redirect( `${process.env.FRONTEND_URL}/payment-error?orderId=${orderId}`);
        }
      case "PENDING":
        await paymentFailedRes("Payment Pending","payment-pending");
        break;
      case "PENDING_VBV":
        await paymentFailedRes("Payment Pending","payment-pending");
        break;
      case "AUTHORIZING":
        await paymentFailedRes("Payment Pending","payment-error");
        break;
      case "AUTHORIZATION_FAILED":
        await paymentFailedRes("Payment Failed","payment-error");
        break;
      case "AUTHENTICATION_FAILED":
        await paymentFailedRes("Payment Failed","payment-error");
        break;
      default:
        await paymentFailedRes("Payment Failed","payment-error");
        break;
    }
  } catch (error) {
    console.log("error =============> ", error);
    if (error instanceof APIError) {
      return res.json(makeError(error.message));
    }
    return res.json(makeError());
  }
});

route.post("/handleJuspayWalletResponse", async (req, res) => {
  const orderId = req.body.order_id || req.body.orderId;
  console.log("orderId handleJuspayResponse ==> ", orderId);
  if (!orderId) {
    return res.json(makeError("order_id not present or cannot be empty"));
  }

  try {
    const statusResponse = await JuspaySetup.order.status(orderId);
    console.log("wallet statusResponse ==> ", statusResponse);
    const walletStatus = statusResponse.status;

    switch (walletStatus) {
      case "CHARGED":
        return res.send({status: walletStatus,message: "Payment Done!", data: statusResponse});
      case "PENDING":
        return res.send({status: walletStatus,message: "Payment Pending!", data: statusResponse});
      case "PENDING_VBV":
        return res.send({status: walletStatus,message: "Payment Pending!", data: statusResponse});
      case "AUTHORIZATION_FAILED":
        return res.send({status: walletStatus,message: "Payment Authentication Failed!", data: statusResponse});
      case "AUTHENTICATION_FAILED":
        return res.send({status: walletStatus,message: "Payment Authentication Failed!", data: statusResponse});
      default:
        return res.send({ status: "Failed", message: "Peyment Failed", data: statusResponse });
    }
  } catch (error) {
    console.log("error =============> ", error);
    if (error instanceof APIError) {
      return res.json(makeError(error.message));
    }
    return res.json(makeError());
  }
});

route.post("/handleJuspayWalletResponseWeb", async (req, res) => {
  const orderId = req.body.order_id || req.body.orderId;
  console.log("orderId web handleJuspayResponse ==> ", orderId);
  if (!orderId) {
    return res.json(makeError("order_id not present or cannot be empty"));
  }

  try {
    const statusResponse = await JuspaySetup.order.status(orderId);
    console.log("wallet web statusResponse ==> ", statusResponse);
    const walletStatus = statusResponse.status;

    switch (walletStatus) {
      case "CHARGED":
        return res.redirect(`${process.env.FRONTEND_URL}/walletAdded?amount=${statusResponse.amount}&paymentId=${statusResponse.id}`);
      case "PENDING":
        return res.redirect(`${process.env.FRONTEND_URL}/walletAdded?message=Wallet amount not added! Please try again.`);
      case "PENDING_VBV":
        return res.redirect(`${process.env.FRONTEND_URL}/walletAdded?message=Wallet amount not added! Please try again.`);
      case "AUTHORIZATION_FAILED":
        return res.redirect(`${process.env.FRONTEND_URL}/walletAdded?message=Wallet amount not added! Authorization Failed.`);
      case "AUTHENTICATION_FAILED":
        return res.redirect(`${process.env.FRONTEND_URL}/walletAdded?message=Wallet amount not added! Authentication Failed.`);
      default:
        return res.redirect(`${process.env.FRONTEND_URL}/walletAdded?message=Wallet amount not added! Please try again.`);
    }
  } catch (error) {
    console.log("error =============> ", error);
    if (error instanceof APIError) {
      return res.redirect(`${process.env.FRONTEND_URL}/walletAdded?message=${error.message}`);
    }
    return res.redirect(`${process.env.FRONTEND_URL}/walletAdded?message=Something went wrong!`);
  }
});

route.post("/handleJuspayMembershipResponse", async (req, res) => {
  const orderId = req.body.order_id || req.body.orderId;
  console.log("orderId handleJuspayResponse ==> ", orderId);

  if (!orderId) {
    return res.json(makeError("order_id not present or cannot be empty"));
  }

  try {
    const statusResponse = await JuspaySetup.order.status(orderId);
    const membershipStatus = statusResponse.status;
    let message = "";
    let type;
    if (statusResponse.amount == 25000) {
      type = "1";
      message = "You have successfully subscribed to the gold Plan";
    } else if (statusResponse.amount == 500) {
      type = "2";
      message = "You have successfully subscribed to the silver Plan";
    } else {
      type = "3";
      message = "You have successfully subscribed to the PPO Plan";
    }
    console.log("membershipStatus ==> ", statusResponse);

    switch (membershipStatus) {
      case "CHARGED":
        return res.send({status: membershipStatus, message: message, data: statusResponse});
      case "PENDING":
        return res.send({status: membershipStatus, message: "Payment Pending", data: statusResponse});
      case "PENDING_VBV":
        return res.send({status: membershipStatus, message: "Payment PENDING_VBV", data: statusResponse});
      case "AUTHORIZATION_FAILED":
        return res.send({status: membershipStatus, message: "AUTHORIZATION_FAILED", data: statusResponse});
      case "AUTHENTICATION_FAILED":
        return res.send({status: membershipStatus, message: "AUTHENTICATION_FAILED", data: statusResponse});
      default:
        return res.send({ status: membershipStatus, message: "Payment Failed",data: statusResponse });
    }
  } catch (error) {
    console.log("error =============> ", error);
    if (error instanceof APIError) {
      return res.json(makeError(error.message));
    }
    return res.json(makeError());
  }
});



module.exports = route;
