const expressRoute = require("express");
const router = expressRoute.Router();
const capture = require("../middleware/captureIp")

const {registerEmployee, loginUser} = require("../controllers/authController")

router.route("/register/user").post(registerEmployee)
router.route("/login/user").post(capture, loginUser)

module.exports = router