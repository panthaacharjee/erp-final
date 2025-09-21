const expressProduct = require("express");
const routerProduct = expressProduct.Router();
const {
  createProduct,
  createProductProcess,
} = require("../controllers/productController");

routerProduct.route("/create/product").post(createProduct);
routerProduct.route("/create/product/process").put(createProductProcess);

module.exports = routerProduct;
