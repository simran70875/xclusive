const express = require("express");
const route = express.Router();
const {
  Variation,
  Product,
} = require("../../../Models/BackendSide/product_model");
const Order = require("../../../Models/FrontendSide/order_model");
const Cart = require("../../../Models/FrontendSide/cart_model");
const User = require("../../../Models/FrontendSide/user_model");
const Review = require("../../../Models/FrontendSide/review_model");
const authMiddleware = require("../../../Middleware/authMiddleWares");
const checkAdminOrRole1 = require("../../../Middleware/checkAdminOrRole1");
const checkAdminRole = require("../../../Middleware/adminMiddleWares");
const moment = require("moment-timezone");
const order_counter_model = require("../../../Models/BackendSide/order_counter_model");
const jwt = require("jsonwebtoken");
const { transporter } = require("../../../utils/mailTransporter");

async function enrichCartProducts(cartData = []) {
  return Promise.all(
    cartData.map(async (item) => {
      const product = await Product.findById(item.product).lean();
      const variation = await Variation.findById(item.variation).lean();

      // find exact size + purity inside variation
      let matchedSize = null;

      if (variation?.Variation_Size?.length) {
        matchedSize = variation.Variation_Size.find(
          (s) => s.Size_Name === item.SizeName && s.Size_purity === item.purity
        );
      }

      return {
        productName: product?.Product_Name || "N/A",
        sku: product?.SKU_Code || "-",
        variationName: variation?.Variation_Name || "-",
        size: item.SizeName || "-",
        purity: item.purity || "-",
        quantity: item.Quantity,
        unitPrice: item.price,
        totalPrice: item.totalPrice || item.price * item.Quantity,
      };
    })
  );
}

const sendCustomerQuotationEmail = async ({
  email,
  firstName,
  products, // raw cartData
  subtotal,
  tax,
  coupon,
  deliveryCharges,
  orderId,
  userId,
}) => {
  let frontendUrl = process.env.frontendUrl;
  let confirmOrderUrl = frontendUrl;

  if (userId) {
    const token = jwt.sign({ userId, orderId }, process.env.JWT_TOKEN, {
      expiresIn: "48h",
      audience: "order-confirm",
    });
    confirmOrderUrl = `${frontendUrl}/confirm-order/${token}`;
  }

  /* ---------------- ENRICH CART DATA ---------------- */
  const detailedProducts = await enrichCartProducts(products);

  /* ---------------- PRODUCT TABLE ---------------- */
  const productRows = detailedProducts
    .map(
      (item) => `
<tr>
  <td>${item.productName}</td>
  <td>${item.sku}</td>
  <td>${item.variationName}</td>
  <td>${item.size}</td>
  <td>${item.purity}</td>
  <td style="text-align:center">${item.quantity}</td>
  <td style="text-align:right">£${item.unitPrice.toFixed(2)}</td>
  <td style="text-align:right">£${item.totalPrice.toFixed(2)}</td>
</tr>`
    )
    .join("");

  const html = `
<p>Hi ${firstName || "Customer"},</p>

<p>Thank you for choosing <b>Xclusive Diamonds</b>. Please review your order details below:</p>

<h3>🛒 Order Summary</h3>

<table style="border-collapse:collapse;width:100%" border="1" cellpadding="8">
<tr>
  <th>Product</th>
  <th>SKU</th>
  <th>Color</th>
  <th>Size</th>
  <th>Purity</th>
  <th>Qty</th>
  <th>Unit</th>
  <th>Total</th>
</tr>
${productRows}
</table>

<p>
<strong>Subtotal:</strong> £${subtotal.toFixed(2)}<br/>
<strong>Tax:</strong> £${(tax || 0).toFixed(2)}<br/>
<strong>Coupon:</strong> £${(coupon || 0).toFixed(2)}<br/>
<strong>Delivery:</strong> £${(deliveryCharges || 0).toFixed(2)}<br/>
<strong>Total Payable:</strong>
<b>£${(subtotal + deliveryCharges - coupon).toFixed(2)}</b>
</p>

<p>
👉 <a href="${confirmOrderUrl}" target="_blank">
Confirm Your Order
</a>
</p>

<p>
Regards,<br/>
<b>Xclusive Diamonds Team</b>
</p>
`;

  await transporter.sendMail({
    from: process.env.SMTP_FROM_EMAIL,
    to: email,
    subject: `Order Confirmation – ${orderId}`,
    html,
  });
};

const sendAdminOrderEmail = async ({ order, user }) => {
  /* ---------------- ENRICH CART DATA ---------------- */
  const detailedProducts = await enrichCartProducts(order.cartData);

  /* ---------------- PRODUCT TABLE ---------------- */
  const productRows = detailedProducts
    .map(
      (item, index) => `
<tr>
  <td style="border:1px solid #ddd;padding:8px">${index + 1}</td>
  <td style="border:1px solid #ddd;padding:8px">${item.productName}</td>
  <td style="border:1px solid #ddd;padding:8px">${item.sku}</td>
  <td style="border:1px solid #ddd;padding:8px">${item.variationName}</td>
  <td style="border:1px solid #ddd;padding:8px">${item.size}</td>
  <td style="border:1px solid #ddd;padding:8px">${item.purity}</td>
  <td style="border:1px solid #ddd;padding:8px;text-align:center">${
    item.quantity
  }</td>
  <td style="border:1px solid #ddd;padding:8px;text-align:right">£${item.unitPrice.toFixed(
    2
  )}</td>
  <td style="border:1px solid #ddd;padding:8px;text-align:right">£${item.totalPrice.toFixed(
    2
  )}</td>
</tr>`
    )
    .join("");

  /* ---------------- EMAIL HTML ---------------- */
  const html = `
<h2>🛎️ New Order Received</h2>

<h3>Order Information</h3>
<p>
<b>Order ID:</b> ${order.orderId}<br/>
<b>DB Order ID:</b> ${order._id}<br/>
<b>Payment Mode:</b> ${order.payment_mode}<br/>
<b>Payment Status:</b> ${order.payment_status}<br/>
<b>Order Status:</b> ${order.order_status}
</p>

<h3>Customer Details</h3>
<p>
<b>Name:</b> ${user.User_Name}<br/>
<b>Email:</b> ${user.User_Email}<br/>
<b>User ID:</b> ${user._id}
</p>

<h3>Product & Variation Details</h3>

<table style="border-collapse:collapse;width:100%" cellpadding="8" border="1">
<thead>
<tr>
  <th>#</th>
  <th>Product</th>
  <th>SKU</th>
  <th>Color</th>
  <th>Size</th>
  <th>Purity</th>
  <th>Qty</th>
  <th>Unit Price</th>
  <th>Total</th>
</tr>
</thead>
<tbody>
${productRows}
</tbody>
</table>

<h3>Price Breakdown</h3>
<p>
<b>Subtotal:</b> £${order.OriginalPrice.toFixed(2)}<br/>
<b>Coupon Discount:</b> £${order.CouponPrice.toFixed(2)}<br/>
<b>Shipping:</b> £${order.Shipping_Charge.toFixed(2)}<br/>
<b>Final Price:</b> £${order.FinalPrice.toFixed(2)}
</p>

<p style="color:#888;font-size:12px">
⚠️ Internal admin notification only
</p>
`;

  await transporter.sendMail({
    from: process.env.SMTP_FROM_EMAIL,
    to: process.env.SMTP_FROM_EMAIL,
    subject: `🛎️ New Order Received – ${order.orderId}`,
    html,
  });
};

async function sendOrderCancelledEmail(order) {
  const user = await User.findById(order.userId);

  const html = `
  <p>Hi ${user.name},</p>

  <p>Your order <b>${order.orderId}</b> has been successfully cancelled.</p>

  <p>If payment was already made, the refund will be processed within 5–7 working days.</p>

  <p>If you have any questions, feel free to reply to this email.</p>

  <p>
    Regards,<br/>
    <b>Workwear Team</b>
  </p>
  `;

  await transporter.sendMail({
    to: user.email,
    from: process.env.SMTP_FROM_EMAIL,
    subject: `Order Cancelled – ${order.orderId}`,
    html,
  });
}

async function sendOrderEmails(orderId, user) {
  const order = await Order.findById(orderId);

  await sendCustomerQuotationEmail({
    email: user.User_Email,
    firstName: user.User_Name,
    products: order.cartData,
    subtotal: order.OriginalPrice,
    coupon: order.CouponPrice,
    tax: order.tax || 0,
    deliveryCharges: order.Shipping_Charge,
    orderId: order.orderId,
    userId: user._id,
  });

  await sendAdminOrderEmail({ order, user });
}

// function for get cart data for user
async function getCartData(userId) {
  const cartData = await Cart.find({ userId });
  if (cartData) {
    return cartData;
  } else {
    return [];
  }
}

async function generateOrderId() {
  const now = new Date();
  const dd = String(now.getDate()).padStart(2, "0");
  const mm = String(now.getMonth() + 1).padStart(2, "0");
  const yy = String(now.getFullYear()).slice(-2);
  const dateStr = `${dd}${mm}${yy}`;
  const prefix = `XD${dateStr}`;

  // Find or create the counter for today
  const counter = await order_counter_model.findOneAndUpdate(
    { date: dateStr },
    { $inc: { sequence: 1 } },
    { new: true, upsert: true }
  );

  const sequenceStr = String(counter.sequence).padStart(2, "0");
  return `${prefix}-${sequenceStr}`;
}

const checkStockAvailability = async (products) => {
  const checks = products.map((item) =>
    Variation.exists({
      _id: item.variationId,
      "Variation_Size.Size_Name": item.SizeName,
      "Variation_Size.Size_Stock": { $gte: item.quantity },
    })
  );

  const results = await Promise.all(checks);

  const failedIndex = results.findIndex((r) => !r);

  if (failedIndex !== -1) {
    const failedItem = products[failedIndex];
    throw new Error(
      `Insufficient stock for ${failedItem.SKU_Code || "product"}`
    );
  }
};

const deductStock = async (products) => {
  const bulkOps = products.map((item) => ({
    updateOne: {
      filter: {
        _id: item.variationId,
        "Variation_Size.Size_Name": item.SizeName,
      },
      update: {
        $inc: { "Variation_Size.$.Size_Stock": -item.quantity },
      },
    },
  }));

  await Variation.bulkWrite(bulkOps);
};

async function restoreStock(cartData) {
  const bulkOps = cartData.map((item) => ({
    updateOne: {
      filter: {
        _id: item.variation,
        "Variation_Size.Size_Name": item.SizeName,
      },
      update: {
        $inc: { "Variation_Size.$.Size_Stock": item.Quantity },
      },
    },
  }));

  await Variation.bulkWrite(bulkOps);
}

route.post("/cancel/:orderId", authMiddleware, async (req, res) => {
  try {
    const { orderId } = req.params;

    const order = await Order.findById(orderId);

    if (!order) return res.status(404).json({ message: "Order not found" });

    // Prevent double cancel
    if (order.order_status === "Cancelled") {
      return res.status(400).json({ message: "Order already cancelled" });
    }

    // Prevent cancelling shipped orders
    if (["Shipped", "Delivered"].includes(order.order_status)) {
      return res
        .status(400)
        .json({ message: "Order already shipped, cannot cancel" });
    }

    // Restore stock
    await restoreStock(order.cartData);

    // Update order
    order.order_status = "Cancelled";
    order.payment_status = "Refund Pending";
    await order.save();

    // Send mail
    await sendOrderCancelledEmail(order);

    res.json({
      success: true,
      message: "Order cancelled successfully",
    });
  } catch (error) {
    console.error("Cancel order error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

async function createOrder({
  userId,
  cartData,
  address,
  pricing,
  couponId,
  payment_mode,
  order_status,
  reason,
}) {
  const orderId = await generateOrderId();

  // Check stock
  const stockItems = cartData.map((item) => ({
    variationId: item.variation,
    SizeName: item.SizeName,
    quantity: item.Quantity,
    SKU_Code: item.SKU_Code,
  }));

  await checkStockAvailability(stockItems);
  await deductStock(stockItems);

  const order = new Order({
    orderId,
    userId,
    Coupon: couponId || null,
    CouponPrice: pricing.coupon || 0,
    cartData,
    Address: address,
    OriginalPrice: pricing.subtotal,
    DiscountPrice: pricing.discount,
    Shipping_Charge: pricing.shipping,
    FinalPrice: pricing.total,
    payment_mode,
    order_status,
    reason,
  });

  return await order.save();
}

// Add Order Route with Coupon and Coupon Usage from retailer side
route.post("/add", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.userId;
    const cartData = await getCartData(userId);

    if (!cartData.length) {
      return res.status(400).json({ message: "Cart is empty" });
    }

    const order = await createOrder({
      userId,
      cartData,
      address: req.body.Address,
      pricing: {
        subtotal: req.body.OriginalPrice,
        discount: req.body.DiscountPrice,
        shipping: req.body.Shipping_Charge,
        total: req.body.FinalPrice,
        coupon: req.body.CouponPrice,
      },
      couponId: req.body.Coupon,
      payment_mode: req.body.payment_mode,
      order_status: req.body.order_status,
      reason: req.body.reason,
    });

    const user = await User.findById(userId);

    await sendOrderEmails(order._id, user);
    await Cart.deleteMany({ userId });

    return res.json({
      type: "success",
      message: "Order placed successfully",
      data: order,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: err.message });
  }
});

// create orsder by admin for retailer
route.post("/admin/create-order", authMiddleware, async (req, res) => {
  try {
    let userId = req.body.userId;

    // Create user if not exists
    if (!userId) {
      const newUser = await User.create({
        name: req.body.name,
        email: req.body.email,
        phone: req.body.phone,
      });
      userId = newUser._id;
    }

    const order = await createOrder({
      userId,
      cartData: req.body.cartData,
      address: req.body.address,
      pricing: req.body.pricing,
      couponId: req.body.couponId,
      payment_mode: "Admin",
      order_status: "Confirmed",
      reason: "Admin Created Order",
    });

    await sendOrderEmails(order._id, userId);

    res.json({
      success: true,
      message: "Order created successfully",
      order,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
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
        cod_advance_amt: order?.cod_advance_amt,
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
    })
      // .populate({
      //   path: "cartData.product",
      //   model: "Products",
      //   select: "Product_Name",
      // })
      // .populate({
      //   path: "Address",
      //   model: "Address",
      // })
      // .populate({
      //   path: "cartData.variation",
      //   model: "Variations",
      //   select: "Variation_Images",
      // })
      .sort({ updatedAt: -1 });

    if (OrderList.length >= 1) {
      OrderList = OrderList?.map(async (order) => ({
        _id: order?._id,
        orderId: order?.orderId,
        userId: order?.userId,
        Coupon: order?.Coupon || "",
        PaymentType: order?.PaymentType,
        PaymentId: order?.PaymentId || "",
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
        cod_advance_amt: order?.cod_advance_amt,
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
    });
    return reviewsForOrder.length > 0;
  };

  try {
    const userId = req.user.userId;

    let OrderList = await Order.find({
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

    if (OrderList.length >= 1) {
      OrderList = OrderList?.map(async (order) => ({
        _id: order?._id,
        orderId: order?.orderId,
        userId: order?.userId,
        Coupon: order?.Coupon || "",
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
        Status: order?.order_status,
        createdAt: order?.createdAt?.toISOString()?.substring(0, 10),
        checkRating: await getOrderRatingStatus(order?._id),
        PaymentStatus: order?.payment_status || "",
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
        CouponPrice: order?.CouponPrice || 0,
        DiscountPrice: order?.DiscountPrice || 0,
        OriginalPrice: order?.OriginalPrice || 0,
        reason: order?.reason || "",
        Address: order?.Address || {},
        cartData: order?.cartData || [],
        Shipping_Charge: order?.Shipping_Charge,
        createdAt: order?.createdAt?.toISOString()?.substring(0, 10),
        PaymentStatus: order?.order_status || "",
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

// get all orders with pagination
route.get("/get/all", async (req, res) => {
  try {
    const { status = "Paid", page = 1, pageSize = 10 } = req.query;

    const pageNumber = parseInt(page);
    const limit = parseInt(pageSize);

    /* ---------------- BUILD FILTER ---------------- */
    // const filter = {};

    // if (status === "Unpaid") {
    //   filter.payment_status = "Unpaid";
    // } else if (status === "Paid") {
    //   filter.payment_status = "Paid";
    // }

    /* ---------------- TOTAL COUNT ---------------- */
    const totalOrders = await Order.countDocuments();

    /* ---------------- FETCH ORDERS ---------------- */
    const orders = await Order.find()
      .populate({
        path: "cartData.product",
        model: "Products",
        select: "Product_Name",
      })
      .populate({
        path: "userId",
        model: "Users",
        select: "User_Name User_Mobile_No",
      })
      .sort({ createdAt: -1 })
      .skip((pageNumber - 1) * limit)
      .limit(limit);

    /* ---------------- RESPONSE MAPPING ---------------- */
    const modifiedOrders = orders.map((order) => ({
      ...order.toObject(),
      userId: order?.userId?._id || null,
      User_Name: order?.userId?.User_Name || "",
      User_Mobile_No: order?.userId?.User_Mobile_No || "",
      OrderStatus: order?.order_status || "",
      Date: new Date(order?.createdAt).toLocaleDateString("en-IN"),
      Time: moment(order?.createdAt).tz("Asia/Kolkata").format("hh:mm:ss A"),
      PaymentStatus: order?.payment_status || "",
    }));

    return res.status(200).json({
      type: "success",
      message: "Orders fetched successfully!",
      orderList: modifiedOrders,
      totalOrders,
      currentPage: pageNumber,
      pageSize: limit,
      totalPages: Math.ceil(totalOrders / limit),
    });
  } catch (error) {
    return res.status(500).json({
      type: "error",
      message: "Server Error!",
      errorMessage: error.message,
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
// const processOrderResponse = async (orderId, UserName) => {
//   try {
//     const order = await Order.findById(orderId)
//       .populate("cartData.product", "Product_Name")
//       .populate("userId", "User_Name User_Mobile_No")
//       .populate("Coupon");

//     if (order.Coupon && order.Coupon.createdBy) {
//       const userId = order.Coupon.createdBy?.id
//         ? order.Coupon.createdBy?.id
//         : null;
//       const coinsReward = order.Coupon.coinsReward;
//       const couponCode = order.Coupon.couponCode;
//       const orderId = order._id;
//       const showOrderId = order.orderId;
//       const user = await User.findById(userId);
//       const userName = UserName;

//       // Calculate the amount based on coinsReward and cartData
//       const amount =
//         coinsReward *
//         order.cartData.reduce((total, item) => total + (item.Quantity || 0), 0);

//       if (!userId === null || userId !== null) {
//         if (!existingCoinsRecord) {
//           // Create a new Coins record
//           const newCoinsRecord = new Coins({
//             userId: userId,
//             Amount: amount,
//             Description: `Greetings! You earned ${amount} coins on order placed by ${userName} with Order ID ${showOrderId}.`,
//             orderId: orderId,
//             Coupon: couponCode,
//             Type: "0",
//             Trans_Type: "Credit",
//           });
//           await newCoinsRecord.save();
//           if (user) {
//             user.Coins += amount;
//             await user.save();
//           }
//         } else {
//           console.log(
//             `Coins reward already added for user ${userName} and coupon ${couponCode}`
//           );
//         }
//       }
//     } else {
//       console.log("Conditions not met for adding coins reward.");
//     }
//   } catch (error) {
//     console.error("Error processing order response:", error);
//   }
// };

// cancel coins reward
// const processOrderResponseinReturn = async (orderId, UserName) => {
//   try {
//     const order = await Order.findById(orderId)
//       .populate("cartData.product", "Product_Name")
//       .populate("userId", "User_Name User_Mobile_No")
//       .populate("Coupon");

//     if (order.Coupon && order.Coupon.createdBy) {
//       const userId = order.Coupon.createdBy?.id
//         ? order.Coupon.createdBy?.id
//         : null;
//       const coinsReward = order.Coupon.coinsReward;
//       const couponCode = order.Coupon.couponCode;
//       const orderId = order._id;
//       const showOrderId = order.orderId;
//       const user = await User.findById(userId);
//       const userName = UserName;

//       // Calculate the amount based on coinsReward and cartData
//       const amount =
//         coinsReward *
//         order.cartData.reduce((total, item) => total + (item.Quantity || 0), 0);

//       // Check if the user already has a coins record for the same coupon and order
//       // const existingCoinsRecord = await Coins.findOne({
//       //     userId: userId,
//       //     Coupon: couponCode,
//       //     orderId: orderId,
//       // });

//       // Create a new Coins record
//       const newCoinsRecord = new Coins({
//         userId: userId,
//         Amount: amount,
//         // Description: `Sorry! Your ${amount} coins deduct, beacause of ${userName} Cancelled their order , Order ID ${showOrderId}.`,
//         Description: `We regret having to deduct the credited ${amount} reward coins owing to the return of an order with Order ID ${showOrderId} placed by ${userName}.`,
//         orderId: orderId,
//         Coupon: couponCode,
//         Type: "0",
//         Trans_Type: "Debit",
//       });
//       await newCoinsRecord.save();
//       if (user) {
//         user.Coins -= amount;
//         await user.save();
//       }
//     } else {
//       console.log("Conditions not met for adding coins reward.");
//     }
//   } catch (error) {
//     console.error("Error processing order response:", error);
//   }
// };

// update the orderType by admin
route.put("/update/type/:id", async (req, res) => {
  const orderId = req.params.id;

  const {
    order_status,
    reason,
    trackingId,

    // 🔥 payment fields
    payment_status,
    payment_mode,
    PaymentId,
  } = req.body;

  console.log("update order", req.body)

  try {
    const updateData = {
      order_status,
      reason,
      tracking_id: trackingId,

      payment_status,
      payment_mode,
      PaymentId,
    };

    // Remove undefined values
    Object.keys(updateData).forEach(
      (key) => updateData[key] === undefined && delete updateData[key]
    );

    const updatedOrder = await Order.findByIdAndUpdate(orderId, updateData, {
      new: true,
    });

    if (!updatedOrder) {
      return res.status(404).json({
        type: "error",
        message: "Order not found",
      });
    }

    return res.status(200).json({
      type: "success",
      message: "Order updated successfully",
      order: updatedOrder,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      type: "error",
      message: "Server error",
    });
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
    const totalOrdersCODPaid = totalOrders.filter(
      (order) =>
        ["1", "2", "3", "5"].includes(order.OrderType) &&
        order.cod_status == "Paid" &&
        order.payment_status == "Unpaid"
    );
    const totalOrdersPaid = totalOrders.filter(
      (order) =>
        ["1", "2", "3", "5"].includes(order.OrderType) &&
        order.payment_status == "Paid"
    );

    console.log("totalOrdersCODPaid:", totalOrdersCODPaid?.length);
    console.log("totalOrdersOnlinePaid:", totalOrdersPaid?.length);

    const totalOrderCODAmount = totalOrdersCODPaid.reduce(
      (total, order) => total + order.cod_advance_amt,
      0
    );
    const totalOrderOnlineAmount = totalOrdersPaid.reduce(
      (total, order) => total + order.FinalPrice + order.CouponPrice,
      0
    );
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
