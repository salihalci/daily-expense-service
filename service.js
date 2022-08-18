

// created for test installations 
/*let http = require('http')
const PORT = 9000
http.createServer(function(req,res){
    res.writeHead(200);
    res.end(JSON.stringify([1,2,3,4,5,6]));
}).listen(PORT);
console.log("Server started at port "+PORT)
*/

// #region  mongodb
const mongoose = require("mongoose");
//1.mongodb connection
const mongodb_url="mongodb://localhost:27017/expensedb";
const mongo_opts={
    "useNewUrlParser":true,
    "socketTimeoutMS":0,
    "keepAlive":true,
    "useUnifiedTopology":true
}

mongoose.connect(mongodb_url,mongo_opts);
//2 mongoose Schema->Entity
const expenseSchema = new mongoose.Schema({
    "_id":{
        type:String,
        retuired:true
    },
    "category":{
        type:String,
        retuired:false,
        enum:["Market","Extra","Food","Restaurant"],
        default:"Food"
    },
    "amount":{
        type:Number,
        retuired:true
    },
    "operationDate":{
        type:Date,
        retuired:true
    },
    "description":{
        type:String
    }

});

let collectionName="expenses"
//3. Crud persistence object
const Expense = mongoose.model(collectionName,expenseSchema);

console.log("Server is up and running!");
// #endregion