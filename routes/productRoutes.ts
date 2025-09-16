const expressProduct = require("express");
const routerProduct = expressProduct.Router();
const { createProduct } = require("../controllers/productController");

routerProduct.route("/create/product").post(createProduct);

module.exports = routerProduct;
