const path = require('path')
const express = require('express')
const mongoose = require('mongoose')
const dotenv = require('dotenv')
const morgan = require('morgan')
const exphbs = require('express-handlebars')
const methodOverride = require('method-override')
const passport = require('passport')
const session = require('express-session')
const MongoStore = require('connect-mongo')(session)
const connectDB = require('./config/db')

//Load config
dotenv.config({ path: './config/config.env' })

//Passport config
require('./config/passport')(passport)

connectDB()

const app = express()

//Body Parser
app.use(express.urlencoded({ extended: false }))
app.use(express.json())

//Method override
app.use(methodOverride(function (req, res) {
    if (req.body && typeof req.body === 'object' && '_method' in req.body) {
      // look in urlencoded POST bodies and delete it
      let method = req.body._method
      delete req.body._method
      return method
    }
  }))

//Logging
if(process.env.NODE_ENV === 'development'){
    app.use(morgan('dev'))
}


//Handlebars Helpers
const { formatDate,stripTags, truncate, editIcon, select, ifEquals } = require('./helpers/hbs')

//Handlebars
app.engine('.hbs', exphbs({ 
    helpers: {
        formatDate,
        stripTags,
        truncate,
        editIcon,
        select,
        ifEquals,
    },
    defaultLayout: 'main', 
    extname: '.hbs' 
})
)
app.set('view engine', '.hbs')

//Sessions
const MONGO_PASSWORD = process.env.MONGO_PASSWORD 
app.use(session({
    secret: `${MONGO_PASSWORD}`,
    resave: false,
    saveUninitialized: false,
    store: new MongoStore({ mongooseConnection: mongoose.connection})
}))

//Passpost middleware
app.use(passport.initialize())
app.use(passport.session())

//Set Global variable
app.use(function (req, res, next){
    res.locals.user = req.user || null
    next()
})

//flash message middleware
app.use((req, res, next)=>{
    res.locals.message = req.session.message
    delete req.session.message
    next()
  })

//Static folder
app.use(express.static(path.join(__dirname, 'public')))

//Routes
const indexRoute = require('./routes/index')
app.use('/', indexRoute)
const authRoute = require('./routes/auth')
app.use('/auth', authRoute)
const blogRoute = require('./routes/blogs')
app.use('/blogs', blogRoute)

const PORT = process.env.PORT || 3000

app.listen(
    PORT, 
    console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`)
)