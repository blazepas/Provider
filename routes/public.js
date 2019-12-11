const express = require('express');
const router = express.Router();
var officeJSON = require('../webElements.json');
var office = officeJSON.offices;
var title = office.title


router.get('/', (req, res) => {
    res.render('home', {
        title : title,
        office : office
    });
});

module.exports = router;