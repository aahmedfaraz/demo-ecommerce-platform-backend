const express = require("express");
const router = express.Router();
const { check, validationResult } = require("express-validator");
const Order = require("../models/orders");
const auth = require("../middleware/auth");

// @route GET /api/orders
// @desc Get Orders
// @acces Private
router.get("/", auth, async (req, res) => {
  try {
    const orders = await Order.findOne({
      ownerID: req.user.id,
    }).select({ __v: 0 });
    res.status(200).json({ orders });
  } catch (err) {
    console.log("Error ", err);
    res.status(500).json({ msg: "Server Error" });
  }
});

// @route PUT /api/orders/:id
// @desc Update orders
// @acces Private
router.put(
  "/:id",
  [auth, [check("products", "Please Enter valid Data.").isArray()]],
  async (req, res) => {
    // Validate Data inside request body
    const errors = validationResult(req);
    if (!errors.isEmpty())
      return res.status(400).json({ errors: errors.array() });

    try {
      let orders = await Order.findById(req.params.id);
      if (!orders) {
        return res.status(400).json({ msg: "Orders does not exist" });
      }

      if (orders.ownerID.toString() !== req.user.id) {
        return res
          .status(401)
          .json({ msg: "User is not Authorized to update these Orders" });
      }

      const { products } = req.body;

      // Check Products data
      products.forEach((product) => {
        if (!product.productID || !product.soldQuantity || !product.buyerID) {
          return res.status(400).json({ msg: "Invalid Data Found." });
        }
      });

      orders = await Order.findByIdAndUpdate(
        req.params.id,
        {
          $set: {
            products,
          },
        },
        { new: true }
      );
      res.status(200).json({
        orders,
      });
    } catch (err) {
      console.log("Error ", err);
      res.status(500).json({ msg: "Server Error" });
    }
  }
);

// @route DELETE /api/orders/:id
// @desc Delete Orders
// @acces Private
router.delete("/:id", auth, async (req, res) => {
  try {
    let orders = await Order.findById(req.params.id);
    if (!orders) {
      return res.status(400).json({ msg: "Orders does not exist" });
    }

    if (orders.ownerID.toString() !== req.user.id) {
      return res
        .status(401)
        .json({ msg: "User is not Authorized to update this orders" });
    }

    await Order.findByIdAndRemove(req.params.id);

    res.status(200).json({
      msg: "The orders has been deleted",
    });
  } catch (err) {
    console.log("Error ", err);
    res.status(500).json({ msg: "Server Error" });
  }
});

module.exports = router;
