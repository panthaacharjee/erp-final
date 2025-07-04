const server  = require("./app")
const dotenv = require("dotenv")
const connectDB = require("./config/Datebase")

//DOTENV CONFIGURATION
dotenv.config({path:"./config.env"})


connectDB()

server.listen(process.env.PORT, ()=>{
    console.log(`Server is listen on ${process.env.PORT}`)
})


