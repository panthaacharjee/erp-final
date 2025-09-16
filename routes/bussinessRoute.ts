const expressRouteBusiness = require("express");
const routerBusiness = expressRouteBusiness.Router();
const {
  buyerCreate,
  vendorCreate,
  contactCreate,
  getOrganization,
  createLine,
  createCategory,
  createProgram,
  getLine,
  createProcess,
  createSpecification,
  createSerial,
  createItem,
} = require("../controllers/businessController");

/*============ ORGANIZATION ============= */
routerBusiness.route("/create/buyer").post(buyerCreate);
routerBusiness.route("/create/vendor").post(vendorCreate);
routerBusiness.route("/create/contact").post(contactCreate);
routerBusiness.route("/get/organization").get(getOrganization);

/*============ BUSSINESS LINE ============= */
routerBusiness.route("/create/product/line").post(createLine);
routerBusiness.route("/create/product/category").post(createCategory);
routerBusiness.route("/create/program").post(createProgram);
routerBusiness.route("/get/product/line").get(getLine);

/*============ PRODUCT PROCEDURE ============= */
routerBusiness.route("/create/product/process").post(createProcess);
routerBusiness.route("/create/process/spec").post(createSpecification);
routerBusiness.route("/create/process/serial").post(createSerial);
routerBusiness.route("/create/process/item").post(createItem);

module.exports = routerBusiness;
