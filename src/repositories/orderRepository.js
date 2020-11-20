const mongoose = require("mongoose");
const Order = mongoose.model("Order");

exports.create = async (data) => {
  var order = new Order(data);
  await order.save();
};

exports.get = async () => {
  var res = await Order.find({}, "number status")
    .populate("customer", "name")
    .populate("items.product", "title");
  return res;
};
