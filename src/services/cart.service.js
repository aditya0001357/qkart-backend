const httpStatus = require("http-status");
const { Cart, Product } = require("../models");
const ApiError = require("../utils/ApiError");
const config = require("../config/config");
const getCartByUser = async (user) => {
  let cart = await Cart.findOne({ email: user.email });
  if (cart === null) {
    throw new ApiError(httpStatus.NOT_FOUND, "User does not have a cart");
  }
  return cart;
};
const addProductToCart = async (user, productId, quantity) => {
  let cart = await Cart.findOne({ email: user.email });
  if (!cart) {
    try {
      cart = await Cart.create({
        email: user.email,
        cartItems: [],
        paymentOption: config.default_payment_option,
      });
    } catch (err) {
      throw new ApiError(
        httpStatus.INTERNAL_SERVER_ERROR,
        "User cart creation failed because user already have a cart"
      );
    }
  }

  if (cart == null) {
    throw new ApiError(
      httpStatus.INTERNAL_SERVER_ERROR
    );
  }

  let productIndex = -1;
  for (let i = 0; i < cart.cartItems.length; i++) {
    if (productId == cart.cartItems[i].product._id) {
      productIndex = i;
    }
  }

  if (productIndex == -1) {
    let product = await Product.findOne({ _id: productId });

    if (product == null) {
      throw new ApiError(
        httpStatus.BAD_REQUEST
      );
    }

    cart.cartItems.push({ product: product, quantity: quantity });
  } else {
    throw new ApiError(
      httpStatus.BAD_REQUEST
    );
  }
  await cart.save();
  return cart;
};

const updateProductInCart = async (user, productId, quantity) => {
  let cart = await Cart.findOne({ email: user.email });
  if (cart == null) {
    throw new ApiError(
      httpStatus.BAD_REQUEST
    );
  }
  let product = await Product.findOne({ _id: productId });
  if (product == null) {
    throw new ApiError(
      httpStatus.BAD_REQUEST
    );
  }
  let productIndex = -1;
  for (let i = 0; i < cart.cartItems.length; i++) {
    if (productId == cart.cartItems[i].product._id) {
      productIndex = i;
    }
  }
  if (productIndex == -1) {
    throw new ApiError(httpStatus.BAD_REQUEST);
  } else {
    cart.cartItems[productIndex].quantity = quantity;
  }
  await cart.save();
  return cart;
};
const deleteProductFromCart = async (user, productId) => {
  let cart = await Cart.findOne({ email: user.email });
  if (cart == null) {
    throw new ApiError(httpStatus.BAD_REQUEST);
  }
  let productIndex = -1;
  for (let i = 0; i < cart.cartItems.length; i++) {
    if (productId == cart.cartItems[i].product._id) {
      productIndex = i;
    }
  }
  if (productIndex == -1) {
    throw new ApiError(httpStatus.BAD_REQUEST);
  } else {
    cart.cartItems.splice(productIndex, 1);
  }
  await cart.save();
};
const checkout = async (user) => {
  let cart = await Cart.findOne({ email: user.email });
  if (cart == null) {
    throw new ApiError(httpStatus.NOT_FOUND);
  }
  if (cart.cartItems.length === 0) {
    throw new ApiError(httpStatus.BAD_REQUEST);
  }
  let hasSetNonDefaultAddress = await user.hasSetNonDefaultAddress();
  if (!hasSetNonDefaultAddress) {
    throw new ApiError(httpStatus.BAD_REQUEST);
  }
  let total = 0;
  for (let i = 0; i < cart.cartItems.length; i++) {
    total += cart.cartItems[i].product.cost * cart.cartItems[i].quantity;
  }
  if (total > user.walletMoney) {
    throw new ApiError(
      httpStatus.BAD_REQUEST
    );
  }
  user.walletMoney -= total;
  await user.save();
  cart.cartItems = [];
  await cart.save();
};
module.exports = {
  getCartByUser,
  addProductToCart,
  updateProductInCart,
  deleteProductFromCart,
  checkout,
};
