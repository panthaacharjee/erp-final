const expressRouteOrder = require("express");
const routerOrder = expressRouteOrder.Router();

const {
  orderCreate,
  orderProduct,
  attachBooking,
} = require("../controllers/orderController");

routerOrder.route("/create/order").post(orderCreate);
routerOrder.route("/order/product").put(orderProduct);
routerOrder.route("/booking/file/upload").put(attachBooking);

module.exports = routerOrder;
