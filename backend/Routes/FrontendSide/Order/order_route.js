const express = require("express");
const route = express.Router();
const { Product } = require("../../../Models/BackendSide/product_model");
const { Variation } = require("../../../Models/BackendSide/product_model");
const Order = require("../../../Models/FrontendSide/order_model");
const Cart = require("../../../Models/FrontendSide/cart_model");
const Wallet = require("../../../Models/FrontendSide/wallet_model");
const User = require("../../../Models/FrontendSide/user_model");
const Coupons = require("../../../Models/FrontendSide/coupon_model");
const Review = require("../../../Models/FrontendSide/review_model");
const Coins = require("../../../Models/FrontendSide/coins_model");
const Notification = require("../../../Models/FrontendSide/notification_model");
const authMiddleware = require("../../../Middleware/authMiddleWares");
const checkAdminOrRole1 = require("../../../Middleware/checkAdminOrRole1");
const checkAdminRole = require("../../../Middleware/adminMiddleWares");
const axios = require("axios");
const admin = require("firebase-admin");
const moment = require("moment-timezone");

// ************************************************************************************************

async function generateUniqueKey() {
  const randomNum = Math.floor(Math.random() * 1000000);
  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const randomAlphabet = alphabet[Math.floor(Math.random() * alphabet.length)];
  const paddedRandomNum = String(randomNum).padStart(6, "0");
  const uniqueOrderId = `SL-${randomAlphabet}${paddedRandomNum}`;

  return uniqueOrderId;
}

// function for get cart data for user
async function getCartData(userId) {
  const cartData = await Cart.find({ userId });
  console.log("cartData ==>", cartData);
  if (cartData) {
    return cartData;
  } else {
    return [];
  }
}

// function for add wallet history
async function addWalletHistory(userId, orderId, FinalPrice) {
  const wallet = await new Wallet({
    Amount: FinalPrice || 0,
    userId: userId,
    paymentId: orderId || "",
    Trans_Type: "Debit",
    Description: `You have used Rs.${FinalPrice} from your wallet for Order ID ${orderId}.`,
    Type: "3",
  });

  await wallet.save();
}

// function for reducing stock
async function reduceStock(variationId, Sizename, Quantity) {
  try {
    const variation = await Variation.findById(variationId);

    if (!variation) {
      throw new Error("Variation not found");
    }

    const newSizeStock = variation.Variation_Size.map((size) => {
      if (size.Size_Name === Sizename) {
        const newStock = size.Size_Stock - Quantity;
        return { ...size, Size_Stock: newStock };
      }
      return size;
    });

    variation.Variation_Size = newSizeStock;

    await variation.save();
  } catch (error) {
    console.error("Error reducing stock:", error.message);
  }
}

// Add Order Route with Coupon and Coupon Usage
route.post("/add", authMiddleware, async (req, res) => {
  // 0 = wallet, 1 = online, 2 = cod
  try {
    let {
      Coupon,
      CouponPrice,
      PaymentType,
      FinalPrice,
      OriginalPrice,
      DiscountPrice,
      Address,
      Shipping_Charge,
      PaymentId,
      OrderType,
      reason,
      payment_mode,
      card_name,
      order_status,
      bank_ref_no,
      tracking_id,
      ActualPayment,
      cod_advance_amt,
      FinalAdavnceCodPrice,
      orderId,
      payment_status,
      cod_status,
      wallet,
      walletAmount,
      device,
    } = req.body;
    const userId = req.user.userId;


    if (device === "mobile") wallet = wallet.toLowerCase() === "true";
    if (!isNaN(CouponPrice)) CouponPrice = Number(CouponPrice);
    if (!isNaN(FinalPrice)) FinalPrice = Number(FinalPrice);
    if (!isNaN(OriginalPrice)) OriginalPrice = Number(OriginalPrice);
    if (!isNaN(DiscountPrice)) DiscountPrice = Number(DiscountPrice);
    if (!isNaN(Shipping_Charge)) Shipping_Charge = Number(Shipping_Charge);
    if (!isNaN(ActualPayment)) ActualPayment = Number(ActualPayment);
    if (!isNaN(FinalAdavnceCodPrice)) FinalAdavnceCodPrice = Number(FinalAdavnceCodPrice);
    if (!isNaN(walletAmount)) walletAmount = Number(walletAmount);
    if (!isNaN(cod_advance_amt)) walcod_advance_amtletAmount = Number(cod_advance_amt);

    console.log("Order Route", req.body, typeof wallet, wallet);
    if (PaymentType === "0" || (PaymentType === "1" && ActualPayment == 0) ||  (PaymentType === "2" && FinalAdavnceCodPrice === 0)) orderId = await generateUniqueKey();

    if (Coupon === "") Coupon = "not";

    let CartData = await getCartData(userId);
    if (CartData.length === 0) return res.status(404).json({ type: "error", message: "Cart is empty" });

    // something wrong with cart data

    let extraAmount = 0;
    console.log(CouponPrice, walletAmount);

    // Calculate the extra amount based on coupon and wallet
    if (Coupon && wallet == true) extraAmount = CouponPrice + walletAmount;
    else if (Coupon) extraAmount = CouponPrice;
    else if (wallet == true) extraAmount = walletAmount;
    else extraAmount = 0;


    console.log("extraAmount ==> ", extraAmount);

    let cartAmount;
    let currentOrderAmount;

    if (PaymentType === "1") {
      // Calculate the cart amount including shipping charge
      cartAmount = (CartData?.map((item) => item.discountPrice * item.Quantity).reduce((acc, curr) => acc + curr, 0)) + Shipping_Charge;
      currentOrderAmount = cartAmount - extraAmount;
    
      console.log("cartAmount (with shipping) ==> ", cartAmount);
      console.log("currentOrderAmount (after extraAmount deduction) ==> ", currentOrderAmount);
      console.log("ActualPayment ==> ", ActualPayment, "FinalPrice ==> ", FinalPrice);

      // Validate if the current order amount matches ActualPayment or FinalPrice
      let final_price = 0;

      if (Coupon && wallet === true) final_price = FinalPrice - walletAmount;
      else if(Coupon) final_price = FinalPrice;
      else final_price = FinalPrice - extraAmount;
      
      if ((currentOrderAmount != ActualPayment) || (currentOrderAmount != final_price)) {
        console.log("Error: Mismatch in payment calculations for PaymentType 1");
        return res.status(400).json({ type: "error", message: "Cart data has been modified" });
      }
    } else if (PaymentType === "2") {
       // Calculate the cart amount without discount (fixed price assumption)
        cartAmount = CartData?.map((item) => 100 * item.Quantity).reduce((acc, curr) => acc + curr, 0);
        currentOrderAmount = cartAmount - extraAmount;

        console.log("cartAmount (fixed price) ==> ", cartAmount);
        console.log("currentOrderAmount (after extraAmount deduction) ==> ", currentOrderAmount);
        console.log("ActualPayment ==> ", FinalAdavnceCodPrice || 0, "COD Advance ==> ", cod_advance_amt);

        // Ensure values are of the same type (convert to numbers if necessary)
        const codAdvanceAmtNum = Number(cod_advance_amt);

        // Validate if the current order amount matches ActualPayment or COD advance
        if ((cartAmount != codAdvanceAmtNum ) || (currentOrderAmount != (codAdvanceAmtNum - extraAmount))) {
          console.log("Error: Mismatch in payment calculations for PaymentType 2");
          return res.status(400).json({ type: "error", message: "Cart data has been modified" });
        }
    }
    // something wrong with cart data

    let newOrder;
    let appliedCoupon = null;
    let updatedCouponUsage = false;

    // Check if a valid coupon is provided
    if (Coupon !== "not") {
      const coupon = await Coupons.findOne({ _id: Coupon });
      const userCouponUsage = coupon.UserCouponUsage.find((usage) =>usage.userId.equals(userId));
      if (userCouponUsage) {
        // If user already used the coupon
        if (userCouponUsage.usageCount >= coupon.usageLimits) {
          return res.status(200).json({ type: "error", message: "Coupon usage limit exceeded." });
        }
        // Update coupon usage count
        userCouponUsage.usageCount += 1;
        updatedCouponUsage = true;
      } else {
        // If user is using the coupon for the first time
        coupon.UserCouponUsage.push({ userId, usageCount: 1 });
        updatedCouponUsage = true;
      }
      // Apply coupon discount
      appliedCoupon = coupon;
    }
    if (Coupon === "" || Coupon == "not" || Coupon === undefined) {
      newOrder = new Order({
        orderId,
        OrderType,
        userId,
        PaymentType,
        PaymentId: PaymentId || "0",
        CouponPrice,
        DiscountPrice,
        FinalPrice,
        OriginalPrice,
        Address,
        cartData: CartData,
        Shipping_Charge,
        is_Shipping_ChargeAdd: Shipping_Charge != 0 ? true : false,
        reason: reason || "",
        tracking_id,
        bank_ref_no,
        order_status,
        card_name,
        payment_mode,
        ActualPayment,
        cod_advance_amt,
        FinalAdavnceCodPrice,
        payment_status,
        wallet,
        walletAmount,
        device,
        cod_status,
      });
    } else if (!Coupon == "" || !Coupon == "not") {
      newOrder = new Order({
        orderId,
        OrderType,
        userId,
        Coupon: Coupon,
        PaymentType,
        PaymentId: PaymentId || "0",
        CouponPrice,
        DiscountPrice,
        FinalPrice,
        OriginalPrice,
        Address,
        cartData: CartData,
        Shipping_Charge,
        is_Shipping_ChargeAdd: Shipping_Charge != 0 ? true : false,
        reason: reason || "",
        tracking_id,
        bank_ref_no,
        order_status,
        card_name,
        payment_mode,
        ActualPayment,
        cod_advance_amt,
        FinalAdavnceCodPrice,
        payment_status,
        wallet,
        walletAmount,
        device,
        cod_status,
      });
    }
    const existUser = await User.findByIdAndUpdate({ _id: userId });
    const data = await newOrder.save();

    if (PaymentType === "0" && wallet === true) {
      // console.log("wallet", cod_advance_amt);
      // if(cod_advance_amt){
      //   existUser.Wallet -= cod_advance_amt;
      //   existUser.save();
      //   addWalletHistory(userId, orderId, cod_advance_amt);
      // }else{
        existUser.Wallet -= FinalPrice;
        existUser.save();
        addWalletHistory(userId, orderId, FinalPrice);
      //  }
    }

    if (PaymentType === "1" && wallet === true && ActualPayment === 0) {
      console.log("wallet", cod_advance_amt);
      existUser.Wallet -= FinalPrice;
      existUser.save();
      addWalletHistory(userId, orderId, FinalPrice);
    }

    if (PaymentType === "2" && wallet === true && ActualPayment === 0) {
        console.log("wallet", cod_advance_amt);
        existUser.Wallet -= cod_advance_amt;
        existUser.save();
        addWalletHistory(userId, orderId, cod_advance_amt);
    }
    

    await CartData?.forEach((data) => {
      reduceStock(data?.variation, data?.SizeName, data?.Quantity);
    });

    if (updatedCouponUsage) {
      await appliedCoupon.save();
    }

    CartData = [];
    await Cart.deleteMany({ userId });
    return res.status(200).json({ type: "success", data: data, message: "Order successfully!" });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ type: "error", message: "Server Error!", errorMessage: error });
  }
});

// get all upcomin orders for particular user
route.get("/get/upcoming", authMiddleware, async (req, res) => {
  // upcoming = 1,2,3

  try {
    const userId = req.user.userId;
    console.log("userId ==>", userId);
    let OrderList = await Order.find({
      userId: userId,
      OrderType: { $in: [1, 2, 3] },
    })
      .populate({
        path: "cartData.product",
        model: "Products",
        select: "Product_Name",
      })
      .populate({
        path: "Address",
        model: "Address",
      })
      .populate({
        path: "cartData.variation",
        model: "Variations",
        select: "Variation_Images",
      })
      .sort({ createdAt: -1 });

    console.log("OrderList ==> ", OrderList.length);

    if (OrderList.length >= 1) {
      OrderList = OrderList?.map((order) => ({
        _id: order?._id,
        orderId: order?.orderId,
        userId: order?.userId,
        Coupon: order?.Coupon || "",
        PaymentType: order?.PaymentType,
        PaymentId: order?.PaymentId || "",
        OrderType: order?.OrderType,
        CouponPrice: order?.CouponPrice,
        DiscountPrice: order?.DiscountPrice,
        FinalPrice: order?.FinalPrice,
        OriginalPrice: order?.OriginalPrice,
        Address: order?.Address || {},
        reason: order?.reason || "",
        cartData: order?.cartData.map((cartItem) => ({
          ...cartItem,
          variationImage: `${
            process.env.IP_ADDRESS
          }/${cartItem?.variation?.Variation_Images[0]?.path?.replace(
            /\\/g,
            "/"
          )}`,
        })),
        Shipping_Charge: order?.Shipping_Charge,
        cod_advance_amt:order?.cod_advance_amt,
        Status: order?.Status,
        createdAt: order?.createdAt?.toISOString()?.substring(0, 10),
        PaymentStatus: order?.order_status || "",
      }));
    }

    res.status(200).json({
      type: "success",
      message: "All Upcoming Order get Successfully!",
      orderList: OrderList || [],
    });
  } catch (error) {
    res
      .status(500)
      .json({ type: "error", message: "Server Error!", errorMessage: error });
    console.log(error);
  }
});

// get all history orders for particular user
route.get("/get/history", authMiddleware, async (req, res) => {
  // history = 4,5,6,7
  const getOrderRatingStatus = async (orderId) => {
    const reviewsForOrder = await Review.find({ order: orderId });
    return reviewsForOrder.length > 0;
  };

  try {
    const userId = req.user.userId;
    let OrderList = await Order.find({
      userId: userId,
      OrderType: { $in: [4, 5, 6, 7] },
    })
      .populate({
        path: "cartData.product",
        model: "Products",
        select: "Product_Name",
      })
      .populate({
        path: "Address",
        model: "Address",
      })
      .populate({
        path: "cartData.variation",
        model: "Variations",
        select: "Variation_Images",
      })
      .sort({ updatedAt: -1 });

    if (OrderList.length >= 1) {
      OrderList = OrderList?.map(async (order) => ({
        _id: order?._id,
        orderId: order?.orderId,
        userId: order?.userId,
        Coupon: order?.Coupon || "",
        PaymentType: order?.PaymentType,
        PaymentId: order?.PaymentId || "",
        OrderType: order?.OrderType,
        CouponPrice: order?.CouponPrice,
        DiscountPrice: order?.DiscountPrice,
        FinalPrice: order?.FinalPrice,
        OriginalPrice: order?.OriginalPrice,
        reason: order?.reason || "",
        Address: order?.Address || {},
        cartData: order?.cartData.map((cartItem) => ({
          ...cartItem,
          variationImage: `${
            process.env.IP_ADDRESS
          }/${cartItem?.variation?.Variation_Images[0]?.path?.replace(
            /\\/g,
            "/"
          )}`,
        })),
        Shipping_Charge: order?.Shipping_Charge,
        cod_advance_amt:order?.cod_advance_amt,
        Status: order?.Status,
        createdAt: order?.createdAt?.toISOString()?.substring(0, 10),
        checkRating: await getOrderRatingStatus(order?._id),
        PaymentStatus: order?.order_status || "",
      }));

      OrderList = await Promise.all(OrderList);
    }

    res.status(200).json({
      type: "success",
      message: "All Order get Successfully!",
      orderList: OrderList || [],
    });
  } catch (error) {
    res
      .status(500)
      .json({ type: "error", message: "Server Error!", errorMessage: error });
    console.log(error);
  }
});

// get all orders for particular user
route.get("/getAll", authMiddleware, async (req, res) => {
  const getOrderRatingStatus = async (orderId) => {
    const reviewsForOrder = await Review.find({
      order: orderId,
      OrderType: { $ne: "9" },
    });
    return reviewsForOrder.length > 0;
  };

  try {
    const userId = req.user.userId;
    console.log("userId", userId);
    let OrderList = await Order.find({userId: userId, $or: [{ payment_status: "Paid" }, { cod_status: "Paid" }]})
      .populate({
        path: "cartData.product",
        model: "Products",
        select: "Product_Name",
      })
      .populate({
        path: "Address",
        model: "Address",
      })
      .populate({
        path: "cartData.variation",
        model: "Variations",
        select: "Variation_Images",
      })
      .sort({ updatedAt: -1 });

 
    if (OrderList.length >= 1) {
      OrderList = OrderList?.map(async (order) => ({
        _id: order?._id,
        orderId: order?.orderId,
        userId: order?.userId,
        Coupon: order?.Coupon || "",
        PaymentType: order?.PaymentType,
        PaymentId: order?.PaymentId || "",
        OrderType: order?.OrderType,
        CouponPrice: order?.CouponPrice,
        DiscountPrice: order?.DiscountPrice,
        FinalPrice: order?.FinalPrice,
        OriginalPrice: order?.OriginalPrice,
        reason: order?.reason || "",
        Address: order?.Address || {},
        walletAmount: order?.walletAmount,
        cartData: order?.cartData.map((cartItem) => ({
          ...cartItem,
          variationImage: `${process.env.IP_ADDRESS}/${cartItem?.variation?.Variation_Images[0]?.path?.replace(/\\/g,"/")}`,
        })),
        Shipping_Charge: order?.Shipping_Charge,
        Status: order?.Status,
        createdAt: order?.createdAt?.toISOString()?.substring(0, 10),
        checkRating: await getOrderRatingStatus(order?._id),
        PaymentStatus: order?.payment_status || "",
        cod_status:order?.cod_status || "",
        ActualPayment:order?.ActualPayment || 0,
        cod_advance_amt:order?.cod_advance_amt || 0,
      }));

      OrderList = await Promise.all(OrderList);
    }

  
  
    return res.status(200).json({
      type: "success",
      message: "All Order get Successfully!",
      orderList: OrderList || [],
    });
  } catch (error) {
    res
      .status(500)
      .json({ type: "error", message: "Server Error!", errorMessage: error });
    console.log(error);
  }
});

// get orders by id
route.get("/get/singleOrder/:id", authMiddleware, async (req, res) => {
  const id = req.params.id;

  try {
    let order = await Order.findById(id)
      .populate({
        path: "cartData.product",
        model: "Products",
        select: "Product_Name",
      })
      .populate({
        path: "Address",
        model: "Address",
      })
      .populate({
        path: "userId",
        model: "Users",
        select: "User_Name",
      })
      .populate({
        path: "cartData.variation",
        model: "Variations",
        select: "Variation_Images",
      })
      .populate({
        path: "Coupon",
        model: "Coupon",
        select: "couponCode",
      });

    if (order) {
      order.cartData = order.cartData.map((cartItem) => {
        const { Quantity, discountPrice, originalPrice } = cartItem;
        return {
          ...cartItem,
          discountPrice: discountPrice * Quantity,
          originalPrice: originalPrice * Quantity,
          variationImage: `${
            process.env.IP_ADDRESS
          }/${cartItem.variation?.Variation_Images[0]?.path?.replace(
            /\\/g,
            "/"
          )}`,
        };
      });

      order = {
        _id: order?._id,
        orderId: order?.orderId,
        userId: order?.userId,
        Coupon: order?.Coupon?.couponCode || "",
        PaymentType: order?.PaymentType,
        PaymentId: order?.PaymentId || "",
        OrderType: order?.OrderType,
        tracking_id: order?.tracking_id || "",
        CouponPrice: order?.CouponPrice || 0,
        DiscountPrice: order?.DiscountPrice || 0,
        cod_advance_amt: order?.cod_advance_amt || 0,
        FinalPrice: order?.FinalPrice || 0,
        OriginalPrice: order?.OriginalPrice || 0,
        reason: order?.reason || "",
        Address: order?.Address || {},
        cartData: order?.cartData || [],
        Shipping_Charge: order?.Shipping_Charge,
        createdAt: order?.createdAt?.toISOString()?.substring(0, 10),
        PaymentStatus: order?.order_status || "",
        walletAmount: order?.walletAmount || 0,
      };
    }

    res.status(200).json({
      type: "success",
      message: "Order get Successfully!",
      orderList: [order] || [],
    });
  } catch (error) {
    res
      .status(500)
      .json({ type: "error", message: "Server Error!", errorMessage: error });
    console.log(error);
  }
});

// get all orders
route.get("/get/all", async (req, res) => {
  const status = req.query.status;
  const page = parseInt(req.query.page); // Current page number, default to 1
  const pageSize = parseInt(req.query.pageSize); // Page size, default to 10

  try {
    let baseQuery;

    // Define the query based on the status
    if (status === "Unpaid") {
      baseQuery = Order.find({ OrderType: "9" })
        .populate({
          path: "cartData.product",
          model: "Products",
          select: "Product_Name",
        })
        .populate({
          path: "userId",
          model: "Users",
          select: "User_Name User_Mobile_No User_Type",
        });
    } else {
      baseQuery = Order.find({
        OrderType: { $in: ["1", "2", "3","4", "5", "6"] }  
      })
        .populate({
          path: "cartData.product",
          model: "Products",
          select: "Product_Name",
        })
        .populate({
          path: "userId",
          model: "Users",
          select: "User_Name User_Mobile_No User_Type",
        });
    }

    // First, get the total count of documents for pagination
    const totalOrders = await Order.countDocuments(baseQuery.getFilter());

    // Apply sorting, pagination (skip & limit) to the original query
    const orders = await baseQuery
      .sort({ createdAt: -1 })
      .skip((page - 1) * pageSize)
      .limit(pageSize);

    const modifiedOrders = orders.map((order) => {
      // Mapping logic as before...
      let OrderType = "";
      if (order.OrderType === "1") {
        OrderType = "Pending";
      } else if (order.OrderType === "2") {
        OrderType = "Accepted";
      } else if (order.OrderType === "3") {
        OrderType = "Pick Up";
      } else if (order.OrderType === "4") {
        OrderType = "Rejected";
      } else if (order.OrderType === "5") {
        OrderType = "Delivered";
      } else if (order.OrderType === "6") {
        OrderType = "Cancelled";
      } else if (order.OrderType === "7") {
        OrderType = "Returned";
      } else if (order.OrderType === "9") {
        OrderType = "Failed";
      }

      let PaymentType = "";
      if (order.PaymentType === "0") {
        PaymentType = "Wallet";
      } else if (order.PaymentType === "1") {
        PaymentType = "Online Payment";
      } else if (order.PaymentType === "2") {
        PaymentType = "Cash On Delivery";
      }

      let PaymentId = "";
      if (order.PaymentId === "0") {
        PaymentId = "";
      } else {
        PaymentId = order.PaymentId;
      }

      let UserType = "";
      if (order?.userId?.User_Type === "0") {
        UserType = "User";
      } else if (order?.userId?.User_Type === "1") {
        UserType = "Gold";
      } else if (order?.userId?.User_Type === "2") {
        UserType = "Silver";
      } else {
        UserType = "PPO";
      }

      return {
        ...order.toObject(),
        userId: order?.userId?._id,
        User_Name: order?.userId?.User_Name,
        User_Type: UserType,
        User_Mobile_No: order?.userId?.User_Mobile_No,
        OrderType: OrderType,
        PaymentType: PaymentType,
        PaymentId: PaymentId,
        Date: new Date(order?.createdAt)?.toLocaleDateString("en-IN"),
        Time: moment(order?.createdAt).tz("Asia/Kolkata").format("hh:mm:ss A"),
        PaymentStatus: order?.order_status || "",
      };
    });

    return res.status(200).json({
      type: "success",
      message: "Orders fetched successfully!",
      orderList: modifiedOrders || [],
      totalOrders, // Total number of orders for pagination
      currentPage: page, // Current page
      pageSize, // Page size
    });
  } catch (error) {
    return res.status(500).json({
      type: "error",
      message: "Server Error!",
      errorMessage: error,
    });
  }
});

// get all orders (pagination)
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
          { orderId: { $regex: regexSearch } },
          { userId: { $in: userIds } },
          { OrderType: { $ne: "9" } },
        ],
      };
    }

    const totalCount = await Order.countDocuments(query);

    let orders = await Order.find(query)
      .skip(skip)
      .limit(Number(limit))
      .populate({
        path: "cartData.product",
        model: "Products",
        select: "Product_Name",
      })
      .populate({
        path: "userId",
        model: "Users",
        select: "User_Name User_Mobile_No User_Type",
      })
      .sort({ createdAt: -1 });

    const modifiedOrders = orders.map((order) => {
      let OrderType = "";
      if (order.OrderType === "1") {
        OrderType = "Pending";
      } else if (order.OrderType === "2") {
        OrderType = "Accepted";
      } else if (order.OrderType === "3") {
        OrderType = "Pick Up";
      } else if (order.OrderType === "4") {
        OrderType = "Rejected";
      } else if (order.OrderType === "5") {
        OrderType = "Delivered";
      } else if (order.OrderType === "6") {
        OrderType = "Cancelled";
      } else if (order.OrderType === "7") {
        OrderType = "Returned";
      }

      let PaymentType = "";
      if (order.PaymentType === "0") {
        PaymentType = "Wallet";
      } else if (order.PaymentType === "1") {
        PaymentType = "Online Payment";
      } else if (order.PaymentType === "2") {
        PaymentType = "Cash On Delivery";
      }

      let PaymentId = "";
      if (order.PaymentId === "0") {
        PaymentId = "";
      } else {
        PaymentId = order.PaymentId;
      }

      let UserType = "";
      if (order?.userId?.User_Type === "0") {
        UserType = "User";
      } else if (order?.userId?.User_Type === "1") {
        UserType = "Gold";
      } else if (order?.userId?.User_Type === "2") {
        UserType = "Silver";
      } else {
        UserType = "PPO";
      }

      return {
        ...order.toObject(),
        userId: order.userId?._id,
        User_Name: order.userId?.User_Name,
        User_Mobile_No: order.userId?.User_Mobile_No,
        User_Type: UserType,
        OrderType: OrderType,
        PaymentType: PaymentType,
        PaymentId: PaymentId,
        Date: new Date(order?.createdAt)?.toLocaleDateString("en-IN"),
        Time: moment(order?.createdAt).tz("Asia/Kolkata").format("hh:mm:ss A"),
        PaymentStatus: order?.order_status || "",
      };
    });

    res.status(200).json({
      type: "success",
      message: "All Order get Successfully!",
      orderList: modifiedOrders || [],
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

// get all recent orders
route.get("/get/today/all", async (req, res) => {
  try {
    const todayStart = moment().startOf("day");
    const todayEnd = moment().endOf("day");

    let orders = await Order.find({
      createdAt: { $gte: todayStart, $lte: todayEnd },
      OrderType: { $ne: "9" },
    })
      .populate({
        path: "cartData.product",
        model: "Products",
        select: "Product_Name",
      })
      .populate({
        path: "userId",
        model: "Users",
        select: "User_Name User_Mobile_No User_Type",
      })
      .sort({ createdAt: -1 });

    const modifiedOrders = orders.map((order) => {
      let OrderType = "";
      if (order.OrderType === "1") {
        OrderType = "Pending";
      } else if (order.OrderType === "2") {
        OrderType = "Accepted";
      } else if (order.OrderType === "3") {
        OrderType = "Pick Up";
      } else if (order.OrderType === "4") {
        OrderType = "Rejected";
      } else if (order.OrderType === "5") {
        OrderType = "Delivered";
      } else if (order.OrderType === "6") {
        OrderType = "Cancelled";
      } else if (order.OrderType === "7") {
        OrderType = "Returned";
      }

      let PaymentType = "";
      if (order.PaymentType === "0") {
        PaymentType = "Wallet";
      } else if (order.PaymentType === "1") {
        PaymentType = "Online Payment";
      } else if (order.PaymentType === "2") {
        PaymentType = "Cash On Delivery";
      }

      let PaymentId = "";
      if (order.PaymentId === "0") {
        PaymentId = "";
      } else {
        PaymentId = order.PaymentId;
      }

      let UserType = "";
      if (order?.userId?.User_Type === "0") {
        UserType = "User";
      } else if (order?.userId?.User_Type === "1") {
        UserType = "Gold";
      } else if (order?.userId?.User_Type === "2") {
        UserType = "Silver";
      } else {
        UserType = "PPO";
      }

      return {
        ...order.toObject(),
        userId: order.userId?._id,
        User_Name: order.userId?.User_Name,
        User_Mobile_No: order.userId?.User_Mobile_No,
        User_Type: UserType,
        OrderType: OrderType,
        PaymentType: PaymentType,
        PaymentId: PaymentId,
        Date: new Date(order?.createdAt)?.toLocaleDateString("en-IN"),
        Time: moment(order?.createdAt).tz("Asia/Kolkata").format("hh:mm:ss A"),
        PaymentStatus: order?.order_status || "",
      };
    });

    res.status(200).json({
      type: "success",
      message: "All Order get Successfully!",
      orderList: modifiedOrders || [],
    });
  } catch (error) {
    res
      .status(500)
      .json({ type: "error", message: "Server Error!", errorMessage: error });
    console.log(error);
  }
});

// get single order by orderId
route.get("/get/single/:orderId", checkAdminOrRole1, async (req, res) => {
  try {
    const orderId = req.params.orderId;

    const order = await Order.findById(orderId)
      .populate({
        path: "cartData.product",
        model: "Products",
        select: "Product_Name SKU_Code",
      })
      .populate({
        path: "Coupon",
        model: "Coupon",
        // select: 'Product_Name SKU_Code'
      })
      .populate({
        path: "Address",
        model: "Address",
        // select: 'User_Name User_Mobile_No'
      })
      .populate({
        path: "cartData.variation",
        model: "Variations",
        // select: 'User_Name User_Mobile_No'
      })
      .populate({
        path: "userId",
        model: "Users",
        select: "User_Name User_Mobile_No User_Email",
      });

    if (!order) {
      return res
        .status(404)
        .json({ type: "error", message: "Order not found" });
    }

    const OrderTypeMap = {
      1: "Pending",
      2: "Accepted",
      3: "Pick Up",
      4: "Rejected",
      5: "Delivered",
      6: "Cancelled",
      7: "Returned",
    };

    const PaymentTypeMap = {
      0: "Wallet",
      1: "Online Payment",
      2: "Cash On Delivery",
    };

    // const variationFirstImageUrl = order.cartData.map(cartItem => (
    //     cartItem?.variation?.Variation_Images[0]?.path
    //         ? `${process.env.IP_ADDRESS}/${cartItem?.variation?.Variation_Images[0]?.path.replace(/\\/g, '/')}`
    //         : ''
    // ))[0];

    const modifiedOrder = {
      ...order.toObject(),
      Date: new Date(order?.createdAt)?.toLocaleDateString("en-IN"),
      Time: new Date(order?.createdAt)?.toLocaleTimeString("en-IN", {
        hour12: true,
      }),
      userId: order.userId?._id,
      User_Name: order.userId?.User_Name,
      User_Mobile_No: order.userId?.User_Mobile_No,
      User_Email: order.userId?.User_Email,
      OrderType: OrderTypeMap[order.OrderType] || "",
      PaymentStatus: order?.order_status || "",
      PaymentType: PaymentTypeMap[order.PaymentType] || "",
      cartData: order.cartData.map((cartItem) => ({
        ...cartItem,
        variationImage: cartItem?.variation?.Variation_Images[0]?.path
          ? `${
              process.env.IP_ADDRESS
            }/${cartItem?.variation?.Variation_Images[0]?.path.replace(
              /\\/g,
              "/"
            )}`
          : "",
      })),
    };

    res.status(200).json({
      type: "success",
      message: "Order retrieved successfully",
      order: modifiedOrder || {},
    });
  } catch (error) {
    res
      .status(500)
      .json({ type: "error", message: "Server Error!", errorMessage: error });
    console.log(error);
  }
});

// get single order all details by orderId
route.get("/get/singleDetail/:orderId", async (req, res) => {
  try {
    const orderId = req.params.orderId;

    const order = await Order.findOne({ orderId });
    if (!order) {
      return res
        .status(404)
        .json({ type: "error", message: "Order not found" });
    }
    res.status(200).json({
      type: "success",
      data: order,
    });
  } catch (error) {
    res
      .status(500)
      .json({ type: "error", message: "Server Error!", errorMessage: error });
    console.log(error);
  }
});

// delete order by id
route.delete("/delete/:id", checkAdminOrRole1, async (req, res) => {
  const orderId = await req.params.id;
  try {
    const result = await Order.findByIdAndDelete(orderId);
    if (!result) {
      res.status(404).json({ type: "error", message: "Order not found!" });
    }
    res
      .status(200)
      .json({ type: "error", message: "Order deleted Successfully!" });
  } catch (error) {
    res
      .status(500)
      .json({ type: "error", message: "Server Error!", errorMessage: error });
  }
});

// delete many order
route.delete("/deletes", checkAdminOrRole1, async (req, res) => {
  try {
    const { ids } = req.body;
    await Order.deleteMany({ _id: { $in: ids } });
    res
      .status(200)
      .json({ type: "success", message: "All Order deleted Successfully!" });
  } catch (error) {
    res
      .status(500)
      .json({ type: "error", message: "Server Error!", errorMessage: error });
  }
});

// delete or remove all order
route.delete("/delete", checkAdminOrRole1, async (req, res) => {
  try {
    await Order.deleteMany();
    res
      .status(200)
      .json({ type: "success", message: "All Order deleted Successfully!" });
  } catch (error) {
    res
      .status(500)
      .json({ type: "error", message: "Server Error!", errorMessage: error });
  }
});

// coins reward
const processOrderResponse = async (orderId, UserName) => {
  try {
    const order = await Order.findById(orderId)
      .populate("cartData.product", "Product_Name")
      .populate("userId", "User_Name User_Mobile_No")
      .populate("Coupon");

    if (order.Coupon && order.Coupon.createdBy) {
      const userId = order.Coupon.createdBy?.id
        ? order.Coupon.createdBy?.id
        : null;
      const coinsReward = order.Coupon.coinsReward;
      const couponCode = order.Coupon.couponCode;
      const orderId = order._id;
      const showOrderId = order.orderId;
      const user = await User.findById(userId);
      const userName = UserName;

      // Calculate the amount based on coinsReward and cartData
      const amount =
        coinsReward *
        order.cartData.reduce((total, item) => total + (item.Quantity || 0), 0);

      // Check if the user already has a coins record for the same coupon and order
      const existingCoinsRecord = await Coins.findOne({
        userId: userId,
        Coupon: couponCode,
        orderId: orderId,
      });

      if (!userId === null || userId !== null) {
        if (!existingCoinsRecord) {
          // Create a new Coins record
          const newCoinsRecord = new Coins({
            userId: userId,
            Amount: amount,
            Description: `Greetings! You earned ${amount} coins on order placed by ${userName} with Order ID ${showOrderId}.`,
            orderId: orderId,
            Coupon: couponCode,
            Type: "0",
            Trans_Type: "Credit",
          });
          await newCoinsRecord.save();
          if (user) {
            user.Coins += amount;
            await user.save();
          }
        } else {
          console.log(
            `Coins reward already added for user ${userName} and coupon ${couponCode}`
          );
        }
      }
    } else {
      console.log("Conditions not met for adding coins reward.");
    }
  } catch (error) {
    console.error("Error processing order response:", error);
  }
};

// cancel coins reward
const processOrderResponseinReturn = async (orderId, UserName) => {
  try {
    const order = await Order.findById(orderId)
      .populate("cartData.product", "Product_Name")
      .populate("userId", "User_Name User_Mobile_No")
      .populate("Coupon");

    if (order.Coupon && order.Coupon.createdBy) {
      const userId = order.Coupon.createdBy?.id
        ? order.Coupon.createdBy?.id
        : null;
      const coinsReward = order.Coupon.coinsReward;
      const couponCode = order.Coupon.couponCode;
      const orderId = order._id;
      const showOrderId = order.orderId;
      const user = await User.findById(userId);
      const userName = UserName;

      // Calculate the amount based on coinsReward and cartData
      const amount =
        coinsReward *
        order.cartData.reduce((total, item) => total + (item.Quantity || 0), 0);

      // Check if the user already has a coins record for the same coupon and order
      // const existingCoinsRecord = await Coins.findOne({
      //     userId: userId,
      //     Coupon: couponCode,
      //     orderId: orderId,
      // });

      // Create a new Coins record
      const newCoinsRecord = new Coins({
        userId: userId,
        Amount: amount,
        // Description: `Sorry! Your ${amount} coins deduct, beacause of ${userName} Cancelled their order , Order ID ${showOrderId}.`,
        Description: `We regret having to deduct the credited ${amount} reward coins owing to the return of an order with Order ID ${showOrderId} placed by ${userName}.`,
        orderId: orderId,
        Coupon: couponCode,
        Type: "0",
        Trans_Type: "Debit",
      });
      await newCoinsRecord.save();
      if (user) {
        user.Coins -= amount;
        await user.save();
      }
    } else {
      console.log("Conditions not met for adding coins reward.");
    }
  } catch (error) {
    console.error("Error processing order response:", error);
  }
};

// funcation for send SMS
const sendSMS = async (to, orderId, templateId) => {
  const msg91AuthKey = "412707AdE2f6UHYXWq65993b88P1";

  try {
    const response = await axios.post(
      "https://api.msg91.com/api/v5/flow/sms/send/",
      {
        authkey: msg91AuthKey,
        template_id: templateId,
        short_url: "1",
        recipients: [{ mobiles: to, var: orderId, VAR2: "VALUE2" }],
      }
    );

    console.log("SMS Sent Successfully:", response.data);
  } catch (error) {
    console.error("Error sending SMS:", error.response.data);
  }
};

// funcation for send notification
const notifyUserOfOrderStatusChange = async (orderId, orderType) => {
  try {
    const order = await Order.findById(orderId)
      .populate("cartData.product", "Product_Name")
      .populate("userId", "User_Name User_Mobile_No")
      .populate("Coupon");

    const OrderId = order?.orderId;
    const userId = order?.userId;
    const user = await User.findById(userId);
    const userName = user?.User_Name;
    const userType = user?.User_Type;
    const userMobile = user?.User_Mobile_No;
    const toPhoneNumber = "91" + userMobile;
    const notificationToken = user?.Notification_Token;
    const mainOrderId = order?._id;

    await notifyAdminOfNewOrder(
      mainOrderId,
      OrderId,
      userId,
      userName,
      orderType,
      notificationToken
    );

    let sendFor;
    if (userType === "0") {
      sendFor = "3";
    } else {
      sendFor = "4";
    }

    let message;
    let title;
    if (orderType === "2") {
      const templateId = "65940fead6fc053236350e32";
      sendSMS(toPhoneNumber, OrderId, templateId);
      title = "Order Placed";
      message = `Greetings, ${userName}! We appreciate your order at Budai Exclusive. Order ID: ${OrderId} has been successfully placed. Thank you for choosing us!`;
    } else if (orderType === "3") {
      const templateId = "659410a8d6fc052ec5516172";
      sendSMS(toPhoneNumber, OrderId, templateId);
      title = `Order Picked Up`;
      message = `Hello, ${userName}! We're pleased to inform you that your order with Order ID: ${OrderId} has been successfully picked up and is now en route to you. Expect it to arrive on time according to the planned schedule. Thank you for selecting our services!`;
    } else if (orderType === "4") {
      title = "Order Rejected";
      message = `Hi, ${userName}! We regret to inform you that Budai Exclusive has rejected your order bearing Order ID: ${OrderId}.`;
    } else if (orderType === "5") {
      title = "Order Deliverd";
      message = `Greetings, ${userName}! We'd like to inform you that your order bearing Order ID: ${OrderId} has been successfully delivered by Budai Exclusive. Shop Again!.`;
    } else if (orderType === "6") {
      title = "Order Cancelled";
      message = `Hi, ${userName}! We regret to inform you that Budai Exclusive has cancelled your order with Order ID: ${OrderId}. Feel free to explore our offerings and shop again.`;
    } else if (orderType === "7") {
      title = "Order Returend";
      message = `Greetings, ${userName}! We'd like to inform you that your order bearing Order ID: ${orderId} is currently undergoing the return process initiated by Budai Exclusive.`;
    }

    const newNotification = new Notification({
      sendFor: sendFor,
      userType,
      title,
      message,
      userId: [userId],
      orderId: mainOrderId,
      type: "1",
    });

    await newNotification.save();
  } catch (error) {
    console.log(error);
  }
};

// funcation for send notification to user for order
const notifyAdminOfNewOrder = async (
  mainOrderId,
  orderId,
  userId,
  userName,
  orderType,
  notificationToken
) => {
  try {
    let message;

    if (orderType === "2") {
      message = {
        notification: {
          title: `Order Placed`,
          body: `Greetings, ${userName}! We appreciate your order at Budai Exclusive. Order ID: ${orderId} has been successfully placed. Thank you for choosing us!`,
        },
        data: {
          orderId: `${mainOrderId}`,
        },
      };
    } else if (orderType === "3") {
      message = {
        notification: {
          title: `Order Picked Up`,
          body: `Hello, ${userName}! We're pleased to inform you that your order with Order ID: ${orderId} has been successfully picked up and is now en route to you. Expect it to arrive on time according to the planned schedule. Thank you for selecting our services!`,
        },
        data: {
          orderId: `${mainOrderId}`,
        },
      };
    } else if (orderType === "4") {
      message = {
        notification: {
          title: `Order Rejected`,
          body: `Hi, ${userName}! We regret to inform you that Budai Exclusive has rejected your order bearing Order ID: ${orderId}.`,
        },
        data: {
          orderId: `${mainOrderId}`,
        },
      };
    } else if (orderType === "5") {
      message = {
        notification: {
          title: `Order Deliverd`,
          body: `Greetings, ${userName}! We'd like to inform you that your order bearing Order ID: ${orderId} has been successfully delivered by Budai Exclusive. Shop Again!.`,
        },
        data: {
          orderId: `${mainOrderId}`,
        },
      };
    } else if (orderType === "6") {
      message = {
        notification: {
          title: `Order Cancelled`,
          body: `Hi, ${userName}! We regret to inform you that Budai Exclusive has cancelled your order with Order ID: ${orderId}. Feel free to explore our offerings and shop again.`,
        },
        data: {
          orderId: `${mainOrderId}`,
        },
      };
    } else if (orderType === "7") {
      message = {
        notification: {
          title: `Order Returend`,
          body: `Greetings, ${userName}! We'd like to inform you that your order bearing Order ID: ${orderId} is currently undergoing the return process initiated by Budai Exclusive.`,
        },
        data: {
          orderId: `${mainOrderId}`,
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

// push order into ship rocket
// const pushOrderIntoShipRocket = async (id) => {
//     try {

//         const order = await Order.findById(id)
//             .populate('cartData.product', 'Product_Name')
//             .populate('userId', 'User_Name User_Mobile_No')

//         const OrderId = order?.orderId
//         const mainOrderId = order?._id
//         const userId = order?.userId
//         const user = await User.findById(userId);
//         const userName = user?.User_Name
//         const userType = user?.User_Type

//     } catch (error) {

//     }
// }

const pushOrderIntoShipRocket = async (id) => {
  try {
    const order = await Order.findById(id)
      .populate("cartData.product", "Product_Name")
      .populate("userId", "User_Name User_Mobile_No")
      .populate(
        "Address",
        "landmark Full_Address State City Name Pincode Phone_Number"
      );

    const OrderId = order?.orderId;
    const mainOrderId = order?._id;
    const userId = order?.userId;
    const user = await User.findById(userId);
    const userName = user?.User_Name;
    const userType = user?.User_Type;
    const PaymentType = user?.PaymentType;
    let paymentMethod = "";
    if (PaymentType === "2") {
      paymentMethod = "COD";
    } else {
      paymentMethod = "Prepaid";
    }

    // Fetch products separately
    const products = await Product.find({
      _id: { $in: order.cartData.map((item) => item.product) },
    });

    // "billing_customer_name": order?.Address?.Name,
    //     "billing_last_name": "Not",
    //     "billing_address": order?.Address?.Full_Address,
    //     "billing_address_2":  order?.Address?.landmark,
    //     "billing_city": order?.Address?.City,
    //     "billing_pincode": order?.Address?.Pincode,
    //     "billing_state": order?.Address?.State,
    //     "billing_country": "India",
    //     "billing_email": user?.User_Email,
    //     "billing_phone": order?.Address?.Phone_Number,

    // Construct the payload for Shiprocket API
    // const shiprocketPayload = {
    //     "order_id": OrderId.toString(),
    //     "order_date": order.createdAt.toISOString(),
    //     "pickup_location": "shankey chawla",
    //     "channel_id": "",
    //     "comment": "Reseller: M/s Goku",
    //     "billing_customer_name": order?.Address?.Name,
    //     "billing_last_name": order?.Address?.Name,
    //     "billing_address": order?.Address?.Full_Address,
    //     "billing_address_2": order?.Address?.landmark,
    //     "billing_city": order?.Address?.City,
    //     "billing_pincode": order?.Address?.Pincode,
    //     "billing_state": order?.Address?.State,
    //     "billing_country": "India",
    //     "billing_email": user?.User_Email,
    //     "billing_phone": order?.Address?.Phone_Number,
    //     "shipping_is_billing": true,
    //     "shipping_customer_name": userName,
    //     "shipping_last_name": "",
    //     "shipping_address": order.shippingAddress,
    //     "shipping_address_2": order.shippingAddress2,
    //     "shipping_city": order?.Address?.City,
    //     "shipping_pincode": order?.Address?.Pincode,
    //     "shipping_country": 'India',
    //     "shipping_state": order?.Address?.State,
    //     "shipping_email": user?.User_Email,
    //     "shipping_phone": user?.User_Mobile_No,
    //     // "order_items": order.cartData.map(item => {
    //     //     const product = products.find(p => p._id.toString() === item.product.toString());
    //     //     return {
    //     //         "name": product?.Product_Name,
    //     //         "sku": product?.SKU_Code,
    //     //         "units": item?.Quantity || 1,
    //     //         "selling_price": item?.discountPrice?.toString(),
    //     //         "discount": "",
    //     //         "tax": "",
    //     //         "hsn": 441122,
    //     //     };
    //     // }),
    //     "order_items": [
    //         {
    //             "name": "Kunai",
    //             "sku": "chakra123",
    //             "units": 10,
    //             "selling_price": "900",
    //             "discount": "",
    //             "tax": "",
    //             "hsn": 441122
    //         }
    //     ],
    //     "payment_method": "COD",
    //     "shipping_charges": 0,
    //     "giftwrap_charges": 0,
    //     "transaction_charges": 0,
    //     "total_discount": 0,
    //     "sub_total": order?.FinalPrice,
    //     "length": 10,
    //     "breadth": 15,
    //     "height": 20,
    //     "weight": 2.5,
    // };

    const shiprocketPayload = {
      order_id: OrderId.toString(),
      order_date: order.createdAt.toISOString(),
      pickup_location: "shankey chawla",
      channel_id: "",
      comment: "Reseller: M/s Goku",
      billing_customer_name: order?.Address?.Name,
      billing_last_name: "",
      billing_address: order?.Address?.Full_Address,
      billing_address_2: order?.Address?.landmark,
      billing_city: order?.Address?.City,
      billing_pincode: order?.Address?.Pincode,
      billing_state: order?.Address?.State,
      billing_country: "India",
      billing_email: user?.User_Email || "",
      billing_phone: order?.Address?.Phone_Number,
      shipping_is_billing: true,
      shipping_customer_name: "",
      shipping_last_name: "",
      shipping_address: "",
      shipping_address_2: "",
      shipping_city: "",
      shipping_pincode: "",
      shipping_country: "",
      shipping_state: "",
      shipping_email: "",
      shipping_phone: "",
      order_items: order.cartData.map((item) => {
        const product = products.find(
          (p) => p._id.toString() === item.product.toString()
        );
        return {
          name: product?.Product_Name,
          sku: product?.SKU_Code,
          units: item?.Quantity || 1,
          selling_price: item?.discountPrice?.toString(),
          discount: "",
          tax: "",
          hsn: 441122,
        };
      }),
      payment_method: paymentMethod,
      shipping_charges: 0,
      giftwrap_charges: 0,
      transaction_charges: 0,
      total_discount: 0,
      sub_total: order?.FinalPrice,
      length: 10,
      breadth: 15,
      height: 20,
      weight: 2.5,
    };

    // Make a POST request to Shiprocket API
    const response = await axios.post(
      "https://apiv2.shiprocket.in/v1/external/orders/create/adhoc",
      shiprocketPayload,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization:
            "Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJodHRwczovL2FwaXYyLnNoaXByb2NrZXQuaW4vdjEvZXh0ZXJuYWwvYXV0aC9sb2dpbiIsImlhdCI6MTcwMDIxMjM0NSwiZXhwIjoxNzAxMDc2MzQ1LCJuYmYiOjE3MDAyMTIzNDUsImp0aSI6Ikw1ekxUZU5Ma0g0UmRqN2UiLCJzdWIiOjM4MjQ3NjUsInBydiI6IjA1YmI2NjBmNjdjYWM3NDVmN2IzZGExZWVmMTk3MTk1YTIxMWU2ZDkifQ.IYY-5oLgJY0Kazeu6CZYXQSaKCCCH7QcC_C8SK3USgY",
        },
      }
    );

    // Handle the Shiprocket API response as needed
    console.log(response.data);
  } catch (error) {
    // console.error(error);
    // Handle the error as needed
  }
};

// update the orderType by admin
route.put("/update/type/:id", checkAdminOrRole1, async (req, res) => {
  const id = req.params.id;
  console.log("id == ", id);

  try {
    const { orderType, UserName, trackingId, payment_status } = req.body;
    let newType = await Order.findByIdAndUpdate(id);
    console.log("newType ==> ", orderType, UserName, trackingId, payment_status);

    if (orderType !== undefined) {
      let oldOrder = await Order.findById(id);
      newType.OrderType = await orderType;
      newType.tracking_id = await trackingId;
      newType.payment_status = await payment_status ? payment_status : newType.payment_status;


      if (orderType === "2") {
        // await pushOrderIntoShipRocket(id)
      }

      if (orderType === "2" && oldOrder?.processed === false) {
        await processOrderResponse(id, UserName);
        oldOrder.processed = true;
        await oldOrder.save();
      }

      if (orderType === "7") {
        await processOrderResponseinReturn(id, UserName);
      }

      // const ordersToProcess = await Order.find({
      //     OrderType: '2',
      //     processed: false,
      // });

      await notifyUserOfOrderStatusChange(id, orderType);

      await newType.save();
      return res.status(200).json({ type: "success", message: "OrderType update Successfully!" });
    } else {
      newType.tracking_id = await trackingId;
      await newType.save();
      return res.status(200).json({ type: "success", message: "OrderType update Successfully!" });
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json({ type: "error", message: "Server Error!", errorMessage: error });
  }
});

// update status by user
route.patch(
  "/update/singleOrder/type/:id",
  authMiddleware,
  async (req, res) => {
    const id = await req.params.id;

    try {
      const { orderType, reason } = req.body;
      if (orderType !== undefined) {
        let newType = await Order.findByIdAndUpdate(id);
        newType.OrderType = await orderType;
        newType.reason = await reason;

        await newType.save();
        res
          .status(200)
          .json({ type: "success", message: "Order Cancelled Successfully!" });
      }
    } catch (error) {
      res
        .status(500)
        .json({ type: "error", message: "Server Error!", errorMessage: error });
      console.log(error);
    }
  }
);

// Define the route to get orders between two dates
route.get("/get/all/betweendates", authMiddleware, async (req, res) => {
  const userId = req.user.userId;

  const getOrderRatingStatus = async (orderId) => {
    const reviewsForOrder = await Review.find({
      order: orderId,
      OrderType: { $ne: "9" },
    });
    return reviewsForOrder.length > 0;
  };

  try {
    const { startDate, endDate } = req.query;

    const startDateObj = new Date(startDate);
    const endDateObj = new Date(endDate);
    endDateObj.setHours(23, 59, 59, 999);

    // Query the database for orders between the provided start and end dates
    let ordersBetweenDates;
    if (startDate === "") {
      ordersBetweenDates = await Order.find({
        userId: userId,
      })
        .populate({
          path: "cartData.product",
          model: "Products",
          select: "Product_Name",
        })
        .populate({
          path: "Address",
          model: "Address",
        })
        .populate({
          path: "cartData.variation",
          model: "Variations",
          select: "Variation_Images",
        })
        .sort({ updatedAt: -1 });
    } else {
      endDateObj.setHours(23, 59, 59, 999);

      ordersBetweenDates = await Order.find({
        userId: userId,
        createdAt: { $gte: startDateObj, $lte: endDateObj },
      })
        .populate({
          path: "cartData.product",
          model: "Products",
          select: "Product_Name",
        })
        .populate({
          path: "Address",
          model: "Address",
        })
        .populate({
          path: "cartData.variation",
          model: "Variations",
          select: "Variation_Images",
        })
        .sort({ updatedAt: -1 });
    }

    if (ordersBetweenDates.length <= 0) {
      return res.status(200).json({
        type: "success",
        message: "Orders between the specified dates not found!",
        orderList: [],
      });
    }

    if (ordersBetweenDates.length >= 1) {
      ordersBetweenDates = ordersBetweenDates?.map(async (order) => ({
        _id: order?._id,
        orderId: order?.orderId,
        userId: order?.userId,
        Coupon: order?.Coupon || "",
        PaymentType: order?.PaymentType,
        PaymentId: order?.PaymentId || "",
        OrderType: order?.OrderType,
        CouponPrice: order?.CouponPrice,
        DiscountPrice: order?.DiscountPrice,
        FinalPrice: order?.FinalPrice,
        OriginalPrice: order?.OriginalPrice,
        reason: order?.reason || "",
        Address: order?.Address || {},
        cartData: order?.cartData.map((cartItem) => ({
          ...cartItem,
          variationImage: `${
            process.env.IP_ADDRESS
          }/${cartItem?.variation?.Variation_Images[0]?.path?.replace(
            /\\/g,
            "/"
          )}`,
        })),
        Shipping_Charge: order?.Shipping_Charge,
        Status: order?.Status,
        createdAt: order?.createdAt?.toISOString()?.substring(0, 10),
        checkRating: await getOrderRatingStatus(order?._id),
        PaymentStatus: order?.order_status || "",
      }));

      ordersBetweenDates = await Promise.all(ordersBetweenDates);
    }

    res.status(200).json({
      type: "success",
      message: "Orders between the specified dates retrieved successfully!",
      orderList: ordersBetweenDates || [],
    });
  } catch (error) {
    res.status(500).json({
      type: "error",
      message: "Server Error!",
      errorMessage: error.message,
    });
    console.error(error);
  }
});

//  total of orders for reseller
route.get("/get/byStatus", authMiddleware, async (req, res) => {
  const userId = req.user.userId;

  try {
    // Fetch the user's isReseller status
    // const user = await User.findById(userId);
    const { startDate, endDate } = req.query;
    const startDateObj = new Date(startDate);
    const endDateObj = new Date(endDate);
    endDateObj.setHours(23, 59, 59, 999);

    let deliveredOrders;
    let pendingOrders;
    let acceptedOrders;
    let pickupOrders;
    let rejectedOrders;
    let returnedOrders;
    let cancelledOrders;

    if (startDate === "") {
      deliveredOrders = await Order.find({
        userId: userId,
        OrderType: "5",
      }).sort({ updatedAt: -1 });

      pendingOrders = await Order.find({
        userId: userId,
        OrderType: "1",
      }).sort({ updatedAt: -1 });

      acceptedOrders = await Order.find({
        userId: userId,
        OrderType: "2",
      }).sort({ updatedAt: -1 });

      pickupOrders = await Order.find({
        userId: userId,
        OrderType: "3",
      }).sort({ updatedAt: -1 });

      rejectedOrders = await Order.find({
        userId: userId,
        OrderType: "4",
      }).sort({ updatedAt: -1 });

      cancelledOrders = await Order.find({
        userId: userId,
        OrderType: "6",
      }).sort({ updatedAt: -1 });

      returnedOrders = await Order.find({
        userId: userId,
        OrderType: "7",
      }).sort({ updatedAt: -1 });
    } else {
      deliveredOrders = await Order.find({
        userId: userId,
        OrderType: "5",
        createdAt: { $gte: startDateObj, $lte: endDateObj },
      }).sort({ updatedAt: -1 });

      pendingOrders = await Order.find({
        userId: userId,
        OrderType: "1",
        createdAt: { $gte: startDateObj, $lte: endDateObj },
      }).sort({ updatedAt: -1 });

      acceptedOrders = await Order.find({
        userId: userId,
        OrderType: "2",
        createdAt: { $gte: startDateObj, $lte: endDateObj },
      }).sort({ updatedAt: -1 });

      pickupOrders = await Order.find({
        userId: userId,
        OrderType: "3",
        createdAt: { $gte: startDateObj, $lte: endDateObj },
      }).sort({ updatedAt: -1 });

      rejectedOrders = await Order.find({
        userId: userId,
        OrderType: "4",
        createdAt: { $gte: startDateObj, $lte: endDateObj },
      }).sort({ updatedAt: -1 });

      cancelledOrders = await Order.find({
        userId: userId,
        OrderType: "6",
        createdAt: { $gte: startDateObj, $lte: endDateObj },
      }).sort({ updatedAt: -1 });

      returnedOrders = await Order.find({
        userId: userId,
        OrderType: "7",
        createdAt: { $gte: startDateObj, $lte: endDateObj },
      }).sort({ updatedAt: -1 });
    }

    const totalDeliveredAmount = deliveredOrders.reduce(
      (total, order) => total + order.FinalPrice,
      0
    );

    res.status(200).json({
      type: "success",
      message: "Orders retrieved successfully!",
      acceptedOrders: acceptedOrders?.length || 0,
      pickupOrders: pickupOrders?.length || 0,
      cancelledOrders: cancelledOrders?.length || 0,
      deliveredOrders: deliveredOrders?.length || 0,
      rejectedOrders: rejectedOrders?.length || 0,
      returnedOrders: returnedOrders?.length || 0,
      pendingOrders: pendingOrders?.length || 0,
      totalDeliveredAmount: totalDeliveredAmount || 0,
    });
  } catch (error) {
    res.status(500).json({
      type: "error",
      message: "Server Error!",
      errorMessage: error.message,
    });
    console.error(error);
  }
});

//  total of orders for admin
route.post("/get/byStatus/forAdmin", checkAdminRole, async (req, res) => {
  try {
    const { startDate, endDate } = req.body;
    const startDateObj = new Date(startDate);
    const endDateObj = new Date(endDate);
    endDateObj.setHours(23, 59, 59, 999);
    let failedOrders;
    let deliveredOrders;
    let pendingOrders;
    let acceptedOrders;
    let pickupOrders;
    let rejectedOrders;
    let returnedOrders;
    let cancelledOrders;
    let totalOrders;

    if (startDate === "" || endDate === "") {
      totalOrders = await Order.find({
        OrderType: { $ne: "9" }, // $ne is "not equal" operator
      }).sort({ updatedAt: -1 });

      failedOrders = await Order.find({
        OrderType: "9",
      }).sort({ updatedAt: -1 });

      deliveredOrders = await Order.find({
        OrderType: "5",
      }).sort({ updatedAt: -1 });

      pendingOrders = await Order.find({
        OrderType: "1",
      }).sort({ updatedAt: -1 });

      acceptedOrders = await Order.find({
        OrderType: "2",
      }).sort({ updatedAt: -1 });

      pickupOrders = await Order.find({
        OrderType: "3",
      }).sort({ updatedAt: -1 });

      rejectedOrders = await Order.find({
        OrderType: "4",
      }).sort({ updatedAt: -1 });

      cancelledOrders = await Order.find({
        OrderType: "6",
      }).sort({ updatedAt: -1 });

      returnedOrders = await Order.find({
        OrderType: "7",
      }).sort({ updatedAt: -1 });
    } else if (startDate !== "" && endDate !== "") {
      failedOrders = Order.find({
        payment_status: "Unpaid",
        createdAt: { $gte: startDateObj, $lte: endDateObj },
      }).sort({ updatedAt: -1 });

      totalOrders = await Order.find({
        OrderType: { $ne: "9" },
        createdAt: { $gte: startDateObj, $lte: endDateObj },
      }).sort({ updatedAt: -1 });

      deliveredOrders = await Order.find({
        OrderType: "5",
        createdAt: { $gte: startDateObj, $lte: endDateObj },
      }).sort({ updatedAt: -1 });

      pendingOrders = await Order.find({
        OrderType: "1",
        createdAt: { $gte: startDateObj, $lte: endDateObj },
      }).sort({ updatedAt: -1 });

      acceptedOrders = await Order.find({
        OrderType: "2",
        createdAt: { $gte: startDateObj, $lte: endDateObj },
      }).sort({ updatedAt: -1 });

      pickupOrders = await Order.find({
        OrderType: "3",
        createdAt: { $gte: startDateObj, $lte: endDateObj },
      }).sort({ updatedAt: -1 });

      rejectedOrders = await Order.find({
        OrderType: "4",
        createdAt: { $gte: startDateObj, $lte: endDateObj },
      }).sort({ updatedAt: -1 });

      cancelledOrders = await Order.find({
        OrderType: "6",
        createdAt: { $gte: startDateObj, $lte: endDateObj },
      }).sort({ updatedAt: -1 });

      returnedOrders = await Order.find({
        OrderType: "7",
        createdAt: { $gte: startDateObj, $lte: endDateObj },
      }).sort({ updatedAt: -1 });
    }

    //const deliveredOrdersPaid = deliveredOrders.filter(order => order.payment_status === 'Paid');
    const totalDeliveredAmount = deliveredOrders.reduce(
      (total, order) => total + order.FinalPrice,
      0
    );
    const ctotalOrders = totalOrders?.length || 0;
    const totalOrdersCODPaid = totalOrders.filter((order) => ["1", "2", "3", "5"].includes(order.OrderType) && order.cod_status=="Paid" && order.payment_status == "Unpaid" );
    const totalOrdersPaid = totalOrders.filter((order) => ["1", "2", "3", "5"].includes(order.OrderType) && order.payment_status == "Paid");

    console.log("totalOrdersCODPaid:", totalOrdersCODPaid?.length);
    console.log("totalOrdersOnlinePaid:", totalOrdersPaid?.length);


    const totalOrderCODAmount = totalOrdersCODPaid.reduce((total, order) => total + order.cod_advance_amt, 0);
    const totalOrderOnlineAmount = totalOrdersPaid.reduce((total, order) => total + order.FinalPrice + order.CouponPrice, 0);
    const totalOrderAmount = totalOrderCODAmount + totalOrderOnlineAmount;
    console.log("totalOrderAmount:", totalOrderAmount);


    res.status(200).json({
      type: "success",
      message: "Orders retrieved successfully!",
      failedOrders: failedOrders?.length || 0,
      acceptedOrders: acceptedOrders?.length || 0,
      pickupOrders: pickupOrders?.length || 0,
      cancelledOrders: cancelledOrders?.length || 0,
      deliveredOrders: deliveredOrders?.length || 0,
      rejectedOrders: rejectedOrders?.length || 0,
      returnedOrders: returnedOrders?.length || 0,
      pendingOrders: pendingOrders?.length || 0,
      totalOrders: ctotalOrders,
      totalDeliveredAmount: totalDeliveredAmount || 0,
      totalOrderAmount: totalOrderAmount || 0,
    });
  } catch (error) {
    res.status(500).json({
      type: "error",
      message: "Server Error!",
      errorMessage: error.message,
    });
    console.error(error);
  }
});

// update order traking id with order id
route.post(
  "/update/singleOrder/trackingId/:id",
  authMiddleware,
  async (req, res) => {
    const orderId = await req.params.id;

    try {
      const { trackingId } = req.body;
      const order = await Order.findOne({ orderId: orderId });

      if (!order) {
        res
          .status(200)
          .json({ type: "warning", message: "This orderId is not found!" });
      }
      if (order) {
        let newType = await Order.findOne({ orderId: orderId });
        newType.tracking_id = await trackingId;

        await newType.save();
        res.status(200).json({
          type: "success",
          message: "Tracking Id Update Successfully!",
        });
      }
    } catch (error) {
      res
        .status(500)
        .json({ type: "error", message: "Server Error!", errorMessage: error });
      console.log(error);
    }
  }
);

module.exports = route;
