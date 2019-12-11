var express = require('express');
var app = express();
app.set('view engine', 'ejs');
var path = require('path');
var logger = require('morgan');
var session = require('express-session')
var routes = require('./routes');
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({extended: false}));
app.use(express.json());
app.use(logger('dev'));
app.use(session({
    secret: 'ew@$FiuN@##@diwe213%@mniw380',
    resave: true,
    saveUninitialized: false
}))

//Authentication 3rd part middleware
var okta = require('@okta/okta-sdk-nodejs');
var ExpressOIDC = require('@okta/oidc-middleware').ExpressOIDC;

var oktaClient = new okta.Client({
    orgUrl: 'https://dev-577238.okta.com',
    token: '00oyGhpvQg4ZXF44f2IbPrkIBsJ50ulyd9X4xsdlf3'
});
const oidc = new ExpressOIDC({
    issuer: "https://dev-577238.okta.com/oauth2/default",
    client_id: "0oa25lt92uro51z77357",
    client_secret: "jrWYawpjfYqknILEzyo6SXMBKscViHjg5cULo1RR",
    redirect_uri: "http://localhost:3000/users/callback",
    scope: "openid profile",
    routes: {
        login: {
            path: "/users/login"
        },
        callback:{
            path: "/users/callback",
            defaultRedirect: '/client_panel'
        }
    }
})

//Get info about logged users middleware
app.use((req, res, next) => {
    if(!req.userinfo){
        return next();
    }
    oktaClient.getUser(req.userinfo.sub)
        .then(user => {
        req.user = user;
        res.local.user = user;
        next();
        }) .catch(err => {
            next(err);
        });
});

//Login require middleware
function loginRequired(req, res, next){
    if(!req.user){
       return res.status(404).render('unauthenticated');
    }
    next();
}

//Auth routing
const dashboardRouter = require('./routes/dashboard');
const publicRouter = require('./routes/public');
const usersRouter = require('./routes/users');

app.use(oidc.router);
app.use('/', publicRouter);
app.use('/users', usersRouter);
//injected required login middleware
app.use('/dashboard', loginRequired, dashboardRouter);

//General routing
app.get('/home', routes.home);
app.get('/offer', routes.offer);
app.get('/about', routes.about);
app.get('/contact', routes.contact);
app.get('/client_panel', routes.client_panel);

//JSON write
app.post('/add', routes.add);

//DB: add, remove, find row, show all
app.post('/addToDB', routes.addToDB);
app.post('/rmFromDB', routes.rmFromDB);
app.post('/takeElement', routes.takeElement);
app.get('/db', routes.db);


// parsing POST HTML to args like .name for takeElementInDb
var bodyParser = require('body-parser');
app.use(bodyParser()); //Now deprecated You now need to call the methods separately
app.use(bodyParser.urlencoded());
app.use(bodyParser.json()); //And so on.
app.use(bodyParser.urlencoded({
    extended: true
}))

module.exports = app;