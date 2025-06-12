const expressRoute = require("express");
const router = expressRoute.Router();
const capture = require("../middleware/captureIp")

const {
            registerEmployee, 
            loginUser, 
            logout, 
            getLoginHistory, 
            getUser, 
            loginGithub
    } = require("../controllers/authController")

const {isAuthenticatedUser} = require("../middleware/auth")

router.route("/register/user").post(registerEmployee)
router.route("/login/user").post(capture, loginUser)
router.route("/login/github").post(capture, loginGithub)
router.route("/logout").get(logout)
router.route("/user/login/history").get(isAuthenticatedUser, getLoginHistory)
router.route("/user/profile").get(isAuthenticatedUser, getUser)


module.exports = router