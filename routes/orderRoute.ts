const expressRouteOrder = require("express");
const routerOrder = expressRouteOrder.Router();

const {
  orderCreate,
  orderProduct,
  attachBooking,
  attachArtwork,
  orderValidation,
  orderDetailsDelete,
  orderJobBag,
} = require("../controllers/orderController");

routerOrder.route("/create/order").post(orderCreate);
routerOrder.route("/order/product").put(orderProduct);
routerOrder.route("/booking/file/upload").put(attachBooking);
routerOrder.route("/artwork/file/upload").put(attachArtwork);
routerOrder.route("/order/validation").put(orderValidation);
routerOrder.route("/order/details/delete").put(orderDetailsDelete);
routerOrder.route("/order/job/bag").put(orderJobBag);

module.exports = routerOrder;
