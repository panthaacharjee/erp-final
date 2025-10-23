const expressProduct = require("express");
const routerProduct = expressProduct.Router();
const {
  createProduct,
  createProductProcess,
  processSampleSequenceChange,
  productValidation,
  productImageUpload,
  productDetails,

  sampleProduct,
  processSequenceChange,
  createSampleProductProcess,
  sampleProductValidation,
  sampleProductImageUpload,
  sampleProductDetails,
} = require("../controllers/productController");

routerProduct.route("/create/product").post(createProduct);
routerProduct.route("/create/product/process").put(createProductProcess);
routerProduct.route("/updown/process").put(processSequenceChange);
routerProduct.route("/product/validation").put(productValidation);
routerProduct.route("/product/image/upload").put(productImageUpload);
routerProduct.route("/product/details/:id").get(productDetails);

/* ============== Sample ============== */
routerProduct.route("/create/sample/product").post(sampleProduct);
routerProduct
  .route("/create/sample/product/process")
  .put(createSampleProductProcess);
routerProduct.route("/updown/sample/process").put(processSampleSequenceChange);
routerProduct.route("/sample/product/validation").put(sampleProductValidation);
routerProduct
  .route("/sample/product/image/upload")
  .put(sampleProductImageUpload);
routerProduct.route("/sample/product/details/:id").get(sampleProductDetails);

module.exports = routerProduct;
