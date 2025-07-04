const expressRouteHr = require("express");
const routerHr = expressRouteHr.Router();

const {allEmployee} = require("../controllers/hrController")
const {isAuthenticatedUser:auth } = require("../middleware/auth")

routerHr.route("/all/user").get(allEmployee)
// router.route("/login/user").post(capture, loginUser)
// router.route("/login/auth").post(capture, loginAuth)
// router.route("/logout").get(logout)
// router.route("/user/login/history").get(isAuthenticatedUser, getLoginHistory)
// router.route("/user/profile").get(isAuthenticatedUser, getUser)


module.exports = routerHr