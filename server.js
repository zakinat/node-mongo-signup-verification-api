//dependencies
const express=require('express')
const dotenv=require('dotenv')
const cors=require('cors')
const cookieParser = require('cookie-parser')

//functions
const connectDB=require('./_config/db')
const errorHandler = require('./_middleware/error-handler');



//Load config
dotenv.config({path:'./_config/config.env'})

connectDB()

//init server app
const app=express()

// body parser
app.use(express.urlencoded({extended:false}))
app.use(express.json())
app.use(cookieParser())

// allow cors requests from any origin and with credentials
app.use(cors({ origin: (origin, callback) => callback(null, true), credentials: true }))


//use routes
app.use('/api/auth',require('./user.auth/user.routes'))
app.get('/',(req,res)=> res.send('please go to : /api/docs to see documentaion'))

// swagger docs route
app.use('/api/docs', require('./_helpers/swagger'))


// global error handler
app.use(errorHandler)

//start server
const PORT=process.env.PORT || 5000


app.listen(PORT,console.log(`server running in ${process.env.NODE_ENV} mode on port ${PORT}`))