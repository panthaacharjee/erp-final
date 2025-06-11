const expressRoute = require("express");
const router = expressRoute.Router();

const {registerEmployee, getUsers} = require("../controllers/authController")

router.route("/register/user").post(registerEmployee)
router.route("/users").get(getUsers)


module.exports = router