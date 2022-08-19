

// created for test installations 

// #region server_testcode
/*let http = require('http')
const PORT = 9000
http.createServer(function(req,res){
    res.writeHead(200);
    res.end(JSON.stringify([1,2,3,4,5,6]));
}).listen(PORT);
console.log("Server started at port "+PORT)
*/
// //#endregion serv

// #region  mongodb
const mongoose = require("mongoose");
const autoIncrement = require("mongoose-auto-increment");

//1.mongodb connection
const mongodb_url="mongodb://localhost:27017/expensedb";
const mongo_opts={
    "useNewUrlParser":true,
    "socketTimeoutMS":0,
    "keepAlive":true,
    "useUnifiedTopology":true
}

mongoose.connect(mongodb_url,mongo_opts);

autoIncrement.initialize(mongoose.connection); // initalize auto increment


//2 mongoose Schema->Entity
const expenseSchema = new mongoose.Schema({
    "_id":{
        type:String
    },
    "category":{
        type:String,
        required:false,
        enum:["Market","Extra","Food","Restaurant"],
        default:"Food"
    },
    "amount":{
        type:Number,
        required:true
    },
    "operationDate":{
        type:Date,
        required:true
    },
    "description":{
        type:String
    }

});

expenseSchema.plugin(autoIncrement.plugin, '_id'); // set auto increment to _id

let collectionName="expenses"
//3. Crud persistence object
const Expense = mongoose.model(collectionName,expenseSchema);

console.log("Mongo connection completed!");
// #endregion


// #region express_config
const express = require("express");
const logger = require("morgan");
const swagerUI = require("swagger-ui-express");
const bodyParser = require("body-parser")

const port = 7001;
const api = express();
api.use(bodyParser.json({limit:"2mb"})); //
api.use(logger('dev')); // logger ile api arasında bağlantı kuruyoruz
//CORS filter
api.use(function(req,res,next){
    res.header("Access-Control-Allow-Orign","*");
    res.header("Access-Control-Allow-Methods","HEAD,POST,PUT,DELETE,PATCH,GET");
    res.header("Access-Control-Allow-Headers","Origin,X-Requested-With,Content-Type,Accept");
    next();
})
// #endregion express_config

// #region rest over http
/*Requirements of rest over https
    1.Resource expense -> URL :  http(s)://server.example.com:8080 /budgetapp/api/v1 /expenses
    2.Methods : GET, POST, PUT, PATCH, DELETE
    3.Representation XML,JSON,CSV ...
*/

//POST http://localhost:7001/budgetapp/api/v1/expenses
api.post("/budgetapp/api/v1/expenses", (req,res)=>{
    let exp =req.body; // body den post edilecek objeyi alıyoruz. body parser otomatik olarak json a çeviriyor.
    let expense = new Expense(exp);
    expense.save((err,new_expense)=>{//call back fonksiyon db bize döndüğünde tetiklenir.
        res.set("Content-Type","application/json");
        if(err){
            console.log("Hata oluştu."+err.message);
            res.status(400).send({status: err});
        } else{
            console.log("İşlem kaydedildi.")
            res.status(200).send(new_expense);
        }
    }); 
});

const updatableExpenseFields=["category","amount","operationDate","description"];

//PUT http://localhost:7001/budgetapp/api/v1/expenses/11
api.put("/budgetapp/api/v1/expenses/:id", (req,res)=>{
    let id=req.params.id;
    //full resource
    let exp =req.body; // body den post edilecek objeyi alıyoruz. body parser otomatik olarak json a çeviriyor.
    exp._id=id;

    let updatedExpense={};

    //reflection
    for(let field in exp){//body den almış olduğumuz obje içinde iterate ediyoruz.
        if(updatableExpenseFields.includes(field))
            updatedExpense[field]=exp[field];

    }
    
    //expense içindeki sadece updatable fieldarın update edilmesine izin vereceğiz.
    Expense.update(
        {"_id":id},
        {"$set":updatedExpense},
        {"upsert":false},
        (err,updated_expense)=>{ //call back fonksiyon db bize döndüğünde tetiklenir.
            res.set("Content-Type","application/json");
           
            if(err){
                console.log("Hata oluştu."+err.message);
                res.status(400).send({status: err});
            } else{
                console.log("İşlem kaydedildi.")
                res.status(200).send({"status": "ok"});
            }
        }); 
});


//PATCH http://localhost:7001/budgetapp/api/v1/expenses/11
api.patch("/budgetapp/api/v1/expenses/:id", (req,res)=>{
    let id=req.params.id;

    let exp =req.body; // body den post edilecek objeyi alıyoruz. body parser otomatik olarak json a çeviriyor.
    exp._id=id;

    let updatedExpense={};

    //reflection
    for(let field in exp){//body den almış olduğumuz obje içinde iterate ediyoruz.
        if(updatableExpenseFields.includes(field))
            updatedExpense[field]=exp[field];

    }
    
    //expense içindeki sadece updatable fieldarın update edilmesine izin vereceğiz.
    Expense.update(
        {"_id":id},
        {"$set":updatedExpense},
        {"upsert":false},
        (err,updated_expense)=>{ //call back fonksiyon db bize döndüğünde tetiklenir.
            res.set("Content-Type","application/json");
           
            if(err){
                console.log("Hata oluştu."+err.message);
                res.status(400).send({status: err});
            } else{
                console.log("İşlem kaydedildi.")
                res.status(200).send({"status": "ok"});
            }
        }); 
});



//DELETE http://localhost:7001/budgetapp/api/v1/expenses/11
api.delete("/budgetapp/api/v1/expenses/:id",(req,res)=>{
    let id = req.params.id;
    Expense.findOneAndDelete(
        {"_id":id},
        {_id:true},
        (err,exp)=>{
            
            res.set("Content-Type","application/json");
           
            if(err){
                res.status(404).send({status: err});
            } else{
                res.status(200).send(exp);
            }
        })

});


//GET http://localhost:7001/budgetapp/api/v1/expenses/11
api.get("/budgetapp/api/v1/expenses/:id",(req,res)=>{
    let id = req.params.id;
    Expense.findOne(
        {"_id":id},
       
        (err,exp)=>{
            
            res.set("Content-Type","application/json");
            
            if(err){
                res.status(404).send({status: err});
            } else{
                console.log(exp);
                res.status(200).send(exp);
            }
        })

});

//GET http://localhost:7001/budgetapp/api/v1/expenses?page=10&size=15
api.get("/budgetapp/api/v1/expenses",(req,res)=>{


    console.log("Called get!")

    let page = Number(req.query.page || 0); // yoksa 0 
    let size = Number(req.query.size || 10); //yoksa 10 tane getir.
    let offset = page*size;
    
    Expense.find(
        {},
        {},
        {skip:offset,limit:size},
        (err,expenses)=>{
            console.log(expenses);
            res.set("Content-Type","application/json");
           
            if(err){
                res.status(404).send({status: err});
            } else{
                res.status(200).send(expenses);
            }
        })
        

});

let server = api.listen(port);
console.log("Server is up an running! Port number is "+port);

// #endregion rest over http