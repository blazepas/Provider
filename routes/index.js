var officeJSON = require('../webElements.json');
var iteeJSON = require('../todoItems.json');
var workOnFile = require('fs');
const { Client } = require('pg');
const connectionString = 'postgres://postgres:postgres@localhost:5432/postgres';
var office = officeJSON.offices;
var title = office.title
var ite = iteeJSON.itee;
global.row_result = "";

exports.home = function(receive, repl){
    repl.render('home', {
        title : title,
        office : office
    });
};
exports.offer = function(receive, repl){
    var title = office[0].title;
    repl.render('offer', {
        title : title,
        office : office
    });
};

exports.about = function(receive, repl){
    var title = office[1].title;
    repl.render('about', {
        title : title,
        office : office,
    });
};

exports.contact = function(receive, repl){
    var title = office[2].title;

    repl.render('contact', {
        title : title,
        office : office,
    })
};

exports.client_panel = function(receive, repl){
    var title = office[3].title;
    var item = iteeJSON.itee;
    repl.render('client_panel', {
        title : title,
        office : office,
        item: item
    })
}

//JSON
exports.add = function(req, res) {
    var inteamNew = req.body.inteamNew;  
    //update object
    ite.push({
        id: ite.length + 1,
        desc: inteamNew
    });
    //save to json file
    var jsonString = ' {"itee": ';
    console.log(jsonString);
    jsonString = jsonString + JSON.stringify(ite) + "}";
    console.log(jsonString);
    workOnFile.writeFile('./todoItems.json', jsonString, err => {
        if(err){
            console.log("Error occured");
        }else{
            console.log("JSON updated succesfully")
        }
    })
    res.redirect('/offer');
};

const client = new Client({
    connectionString: connectionString
});
client.connect();

//DB
exports.db = function (req, res, next) {
    client.query("INSERT INTO manufacture(name, country) VALUES('nissan' , 'japan')", function (err, result) {
        if(err){
            console.log(err);
        }
        console.log('Querry sucesfully added');
    });

    client.query("SELECT * FROM manufacture", function (err, result) {
        if (err) {
            console.log(err);
            res.status(400).send(err);
        }
        res.status(200).send(result.rows);
    });
};  


exports.addToDB = function(req, res, next){
    var itemNew2 = req.body.inteamNew2;
    console.log(itemNew2);
    var queryString = 'INSERT INTO manufacture(name) VALUES($1) RETURNING *';
    var values = [itemNew2];
    client.query(queryString, values, function (err, result) {
        if(err){
            console.log(err);
        }
        console.log('Querry sucesfully added');
    });
    res.redirect('/offer')
};

exports.takeElement = function(req, res, next){
    var takeIteam = req.body.name;
    var queryString = "SELECT name, country FROM manufacture Where name=$1";
    var value = [takeIteam];
    
    client
    .query(queryString, value, function (req, res, fields){
        if(req){
            console.log('Error ocurred')
        }  
        var counter = 0;
        Object.keys(res).forEach(function(key){
            if(counter <1){           
            row_result += res.rows[0].name;
            row_result += " ";
            row_result += res.rows[0].country;
            counter++;          
            }
        });
        showRes(); 
    })
}

function showRes(){
    console.log('Taked Element CAR: ' + row_result);
}

exports.rmFromDB = function(req, res, next){
    var deleteItem = req.body.name;
    console.log(deleteItem);
    var queryStringDel = 'Delete From manufacture Where name = $1';
    var valuesDel = [deleteItem];

    client.query(queryStringDel, valuesDel, function(err, result){
        if(err){
            console.log(err);
        }
        console.log('Querry succesfully deleted');
    });
    res.redirect('/offer');
};
