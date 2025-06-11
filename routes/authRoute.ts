const expressRoute = require("express");
const router = expressRoute.Router();
const capture = require("../middleware/captureIp")

const {registerEmployee, loginUser, logout, getLoginHistory} = require("../controllers/authController")

const {isAuthenticatedUser} = require("../middleware/auth")

router.route("/register/user").post(registerEmployee)
router.route("/login/user").post(capture, loginUser)
router.route("/logout").get(logout)
router.route("/user/login/history").get(isAuthenticatedUser, getLoginHistory)

module.exports = router