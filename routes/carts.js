const express = require("express");
const router = express.Router();
const { check, validationResult } = require("express-validator");
const Cart = require("../models/cart");
const auth = require("../middleware/auth");

// @route GET /api/carts
// @desc Get Cart
// @acces Private
router.get("/", auth, async (req, res) => {
  try {
    const cart = await Cart.findOne({
      ownerID: req.user.id,
    }).select({ __v: 0 });
    res.status(200).json({ cart });
  } catch (err) {
    console.log("Error ", err);
    res.status(500).json({ msg: "Server Error" });
  }
});

// @route PUT /api/carts/:id
// @desc Update Cart
// @acces Private
router.put(
  "/:id",
  [auth, [check("products", "Please Enter a Title.").isArray()]],
  async (req, res) => {
    // Validate Data inside request body
    const errors = validationResult(req);
    if (!errors.isEmpty())
      return res.status(400).json({ errors: errors.array() });

    try {
      let cart = await Cart.findById(req.params.id);
      if (!cart) {
        return res.status(400).json({ msg: "Cart does not exist" });
      }

      if (cart.ownerID.toString() !== req.user.id) {
        return res
          .status(401)
          .json({ msg: "User is not Authorized to update this Cart" });
      }

      const { products } = req.body;

      // Check Products data
      products.forEach((product) => {
        if (!product.productID || !product.selectedQuantity) {
          return res.status(400).json({ msg: "Invalid Data Found." });
        }
      });

      cart = await Cart.findByIdAndUpdate(
        req.params.id,
        {
          $set: {
            products,
          },
        },
        { new: true }
      );
      res.status(200).json({
        cart,
      });
    } catch (err) {
      console.log("Error ", err);
      res.status(500).json({ msg: "Server Error" });
    }
  }
);

// @route DELETE /api/carts/:id
// @desc Delete Cart
// @acces Private
router.delete("/:id", auth, async (req, res) => {
  try {
    let cart = await Cart.findById(req.params.id);
    if (!cart) {
      return res.status(400).json({ msg: "Cart does not exist" });
    }

    if (cart.ownerID.toString() !== req.user.id) {
      return res
        .status(401)
        .json({ msg: "User is not Authorized to update this Cart" });
    }

    await Cart.findByIdAndRemove(req.params.id);

    res.status(200).json({
      msg: "The cart has been deleted",
    });
  } catch (err) {
    console.log("Error ", err);
    res.status(500).json({ msg: "Server Error" });
  }
});

module.exports = router;
