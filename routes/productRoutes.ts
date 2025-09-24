const expressProduct = require("express");
const routerProduct = expressProduct.Router();
const {
  createProduct,
  createProductProcess,
  processSequenceChange,
} = require("../controllers/productController");

routerProduct.route("/create/product").post(createProduct);
routerProduct.route("/create/product/process").put(createProductProcess);
routerProduct.route("/updown/process").put(processSequenceChange);

module.exports = routerProduct;
