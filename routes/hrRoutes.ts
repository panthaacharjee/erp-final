const expressRouteHr = require("express");
const routerHr = expressRouteHr.Router();

const {allEmployee, employeeDetails, salaryCreate, singleSalary, pdfSalary} = require("../controllers/hrController")
const {isAuthenticatedUser:auth } = require("../middleware/auth")

routerHr.route("/all/user").get(allEmployee)
routerHr.route("/employee/details/:id").get(employeeDetails)
routerHr.route("/employee/salary/create").post(salaryCreate)
routerHr.route("/employee/single/salary/create").post(singleSalary)
routerHr.route("/employee/salary/pdf").post(pdfSalary)

module.exports = routerHr