const express = require("express");
const route = express.Router();
const Cart = require("../../../Models/FrontendSide/cart_model");
const User = require("../../../Models/FrontendSide/user_model");
const {
  Product,
  Variation,
} = require("../../../Models/BackendSide/product_model");
const Charges = require("../../../Models/Settings/add_charges_model");
const authMiddleware = require("../../../Middleware/authMiddleWares");
const checkAdminRole = require("../../../Middleware/adminMiddleWares");

// get charges from Charges Model
const getShippingCharges = async () => {
  try {
    const charges = await Charges.find();
    const newCharges = charges?.[0];
    return newCharges;
  } catch (error) {
    console.error(error);
    return null;
  }
};

// add cartItems
route.post("/add", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.userId;
    const { product, variation, SizeName, purity, Quantity } = req.body;

    if (!Quantity || Quantity <= 0) {
      return res
        .status(400)
        .json({ type: "error", message: "Invalid quantity" });
    }

    const productData = await Product.findById(product);
    if (!productData)
      return res
        .status(404)
        .json({ type: "error", message: "Product not found" });

    const variationData = await Variation.findById(variation);
    if (!variationData)
      return res
        .status(404)
        .json({ type: "error", message: "Variation not found" });

    // Find size
    const sizeObj = variationData.Variation_Size.find(
      (s) => s.Size_Name === SizeName && s.Size_purity === purity
    );

    if (!sizeObj) {
      return res
        .status(400)
        .json({ type: "error", message: "Invalid size or purity" });
    }

    if (Quantity > sizeObj.Size_Stock) {
      return res.status(400).json({
        type: "error",
        message: `Only ${sizeObj.Size_Stock} items available`,
      });
    }

    const price = sizeObj.Size_Price;

    // check existing cart item
    const existing = await Cart.findOne({
      userId,
      product,
      variation,
      SizeName,
      purity,
    });

    if (existing) {
      existing.Quantity += Quantity;
      existing.totalPrice = existing.Quantity * price;
      await existing.save();
      return res.json({ type: "success", message: "Cart updated" });
    }

    // create new cart item
    const cart = new Cart({
      userId,
      product,
      variation,
      SizeName,
      purity,
      Quantity,
      price,
      totalPrice: Quantity * price,
    });

    await cart.save();

    res.json({ type: "success", message: "Item added to cart" });
  } catch (err) {
    console.log(err);
    res.status(500).json({ type: "error", message: "Server error" });
  }
});

// get all cartItem (second method)
route.get("/cartItems/get", authMiddleware, async (req, res) => {
  try {
    const userId = req.user?.userId;
    const cartItems = await Cart.find({ userId }).populate("product").populate({ path: "variation" });
    console.log("cartItems ==> ", cartItems);

    if (cartItems?.length <= 0) {
      return res.status(200).json({ type: "warning", message: "CartItem Not Found!", cartItems: [] });
    }

    const result = cartItems.map((cart) => ({
      _id: cart?._id,
      userId: cart?.userId || "",
      originalPrice: cart?.price * cart?.Quantity || 0,
      discountPrice: cart?.discountPrice * cart?.Quantity || 0,
      originalPrice_product: cart?.price || 0,
      discountPrice_product: cart?.discountPrice || 0,
      Quantity: cart?.Quantity || 0,
      SizeName: cart?.SizeName || "",
      Stock: cart?.variation?.Variation_Size?.find((size) => size?.Size_Name === cart?.SizeName)?.Size_Stock || 0,
      Product: {
        product_id: cart?.product?._id || "",
        product_Name: cart?.product?.Product_Name || "",
      },
      Variation: {
        variation_id: cart?.variation?._id || "",
        variation_name: cart?.variation?.Variation_Name || "",
        variation_Image: cart?.variation?.Variation_Images?.[0]?.path
          ? `${process.env.IP_ADDRESS
          }/${cart?.variation?.Variation_Images[0]?.path.replace(
            /\\/g,
            "/"
          )}`
          : "",
      },
    }));

    const Charges = await getShippingCharges();
    let ShippingCharge = Charges?.Normal_Ship_Charge;

    // Calculate total discount
    const totalDiscount = cartItems.reduce((total, cart) => {
      return total + cart?.discountPrice * cart?.Quantity || 0;
    }, 0);

    // Calculate total original Amount
    const totalOriginalAmount = cartItems.reduce((total, cart) => {
      return total + cart?.price * cart?.Quantity || 0;
    }, 0);

    // Calculate total amount
    // const SubTotalAmount = cartItems.reduce((total, cart) => {
    //   return total + cart?.discountPrice * cart?.Quantity;
    // }, 0);

    const totalAmount = totalOriginalAmount + totalDiscount + ShippingCharge;

    // Check cart for shippingStatus
    const readyToShip = cartItems.every(
      (cart) => cart.product?.Shipping === "READY TO SHIP"
    );

    let shippingStatus;

    if (readyToShip) {
      shippingStatus = "DISPATCH IN 24-48HRS";
    } 
     else {
      shippingStatus =
        "DISPATCH STARTS WITHIN 3-7 DAYS (If Shipped Together)";
    }

    return res.status(200).json({
      type: "success",
      message: "All CartItem get successfully!",
      totalAmount: totalAmount,
      totalDiscount: totalDiscount,
      totalOriginalAmount: totalOriginalAmount,
      ShippingCharge: ShippingCharge,
      cartItems: result || [],
      Count: result?.length || 0,
      shippingStatus,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ type: "error", message: "Server Error!", errorMessage: error });
  }
});


// update the cart item Quantity
route.put("/cartItems/update/:cartItemId", authMiddleware, async (req, res) => {
  const cartItemId = req.params.cartItemId;
  const { Quantity } = req.body;

  try {
    const updatedCartItem = await Cart.findByIdAndUpdate(
      cartItemId,
      { $set: { Quantity: Quantity } },
      { new: true }
    );

    if (!updatedCartItem) {
      res.status(200).json({ type: "error", message: "CartItem Not Found!" });
      return;
    }

    res.status(200).json({ type: "success", message: "CartItem update successfully!" });
  } catch (error) {
    res.status(500).json({ type: "error", message: "Server Error!", errorMessage: error });
    console.log(error);
  }
});


// remove or delete item on cart
route.delete("/cartItems/delete/:id", authMiddleware, async (req, res) => {
  const cartItemId = await req.params.id;
  const userId = req.user.userId;
  try {
    const result = await Cart.findByIdAndDelete({ _id: cartItemId, userId });
    if (!result) {
      return res
        .status(200)
        .json({ type: "error", message: "Item not found!" });
    }
    res
      .status(200)
      .json({ type: "success", message: "Item Remove Successfully!" });
  } catch (error) {
    res
      .status(500)
      .json({ type: "error", message: "Server Error!", errorMessage: error });
    console.log(error);
  }
});

// remove or delete all item on cart by user
route.delete("/all/cartItems/delete", authMiddleware, async (req, res) => {
  const userId = req.user.userId;
  try {
    let result = await Cart.deleteMany({ userId });

    if (result.deletedCount === 0) {
      return res
        .status(200)
        .json({ type: "error", message: "Items not found!" });
    }

    res
      .status(200)
      .json({ type: "success", message: "Items removed successfully!" });
  } catch (error) {
    res
      .status(500)
      .json({ type: "error", message: "Server Error!", errorMessage: error });
    console.log(error);
  }
});

// delete or remove all cart
route.delete("/cartItems/delete", checkAdminRole, async (req, res) => {
  try {
    await Cart.deleteMany();
    res
      .status(200)
      .json({ type: "error", message: "All Item deleted Successfully!" });
  } catch (error) {
    res
      .status(500)
      .json({ type: "error", message: "Server Error!", errorMessage: error });
  }
});

module.exports = route;
