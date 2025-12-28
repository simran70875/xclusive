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
  const userId = req.user.userId;

  const cartItems = await Cart.find({ userId }).populate("product").populate("variation");

  if (!cartItems.length) {
    return res.json({ type: "warning", message: "Cart empty", cartItems: [] });
  }

  const formatted = cartItems.map((item) => ({
    _id: item._id,
    productName: item.product?.Product_Name,
    variationName: item.variation?.Variation_Name,
    size: item.SizeName,
    purity: item.purity,
    quantity: item.Quantity,
    price: item.price,
    total: item.price * item.Quantity,
    image: item.variation?.Variation_Images?.[0]?.path
      ? `${process.env.IP_ADDRESS}/${item.variation.Variation_Images[0].path}`
      : "",
  }));

  const totalAmount = formatted.reduce((s, i) => s + i.total, 0);

  res.json({
    type: "success",
    cartItems: formatted,
    totalAmount,
  });
});

// update the cart item Quantity
route.put("/cartItems/update/:id", authMiddleware, async (req, res) => {
  const { Quantity } = req.body;

  if (Quantity <= 0) {
    return res.status(400).json({ type: "error", message: "Invalid quantity" });
  }

  const cart = await Cart.findById(req.params.id).populate("variation");
  if (!cart) return res.status(404).json({ type: "error", message: "Item not found" });

  console.log("cart ==> ", cart);

  const size = cart.variation.Variation_Size.find(
    (s) => s.Size_Name === cart.SizeName && s.Size_purity === cart.purity
  );

  if (!size || Quantity > size.Size_Stock) {
    return res.status(400).json({ type: "error", message: "Stock exceeded" });
  }

  cart.Quantity = Quantity;
  cart.totalPrice = Quantity * size.Size_Price;
  await cart.save();

  res.json({ type: "success", message: "Cart updated" });
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
