const expressRouteBusiness = require("express")
const routerBusiness = expressRouteBusiness.Router()
const {buyerCreate, vendorCreate, contactCreate, getOrganization} = require("../controllers/businessController")

routerBusiness.route("/create/buyer").post(buyerCreate)
routerBusiness.route("/create/vendor").post(vendorCreate)
routerBusiness.route("/create/contact").post(contactCreate)
routerBusiness.route("/get/organization").get(getOrganization)

module.exports = routerBusiness