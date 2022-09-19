//jshint esversion:6
//installing and connecting with express and bodyParser
const express = require("express");
const bodyParser = require("body-parser");
//requiring the mongooes to nodejs
const mongoose = require("mongoose");
const _=require("lodash");

const app = express();
app.set('view engine', 'ejs');

//seting the bodyparser
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

//connecting with database
mongoose.connect("mongodb+srv://admin-malavika:Test123@cluster0.2tssiqi.mongodb.net/todolistDB");
//creating the schema
const itemsSchema={
  name:String
};
//creating the model const <modelName>=mongoose.model(>singularname for collection>,SchemaName)
const Item=mongoose.model("Item",itemsSchema);
//assining values
const item1=new Item({
  name:"Welcome to todolist"
});
const item2 = new Item({
  name:"Hit + to add"
});
const  item3= new Item({
  name:"<-- backspace to delete"
});
const defaultItems=[item1,item2,item3]
const listSchema={
  name:String,
  items:[itemsSchema]
};
const List=mongoose.model("List",listSchema)

app.get("/", function(req, res) {
  Item.find({},function(err,foundItems){
    if(foundItems.length===0){
      //inserting array into database
      Item.insertMany(defaultItems,function(err){
        if(err){
          console.log(err);
        }
        else{
          console.log("sucessfully added");
        }
      });
      res.redirect("/");
    }else{
    res.render("list", {listTitle: "Today", newListItems: foundItems});
  }
  })
});


app.get("/:customListName", function(req,res){
  const customListName=_.capitalize(req.params.customListName);
  List.findOne({name:customListName},function(err,foundList){
    if(!err){
      if(!foundList){
        //create new list
          const list=new List({
          name:customListName,
          items:defaultItems
        });
        list.save();
        res.redirect("/"+customListName)
    }else{
        //show existing list
        res.render("list", {listTitle: foundList.name, newListItems: foundList.items});
      }
    }
  });
});


app.post("/", function(req, res){

  const itemName= req.body.newItem;
  const listName=req.body.list;
  const item=new Item({
    name:itemName
  });
  if(listName==="Today"){
    item.save();
    res.redirect("/");
  }else{
    List.findOne({name:listName},function(err,foundList){
      foundList.items.push(item);
      foundList.save();
      res.redirect("/"+listName);
    });
  }
});

//deleting the values
app.post("/delete",function(req,res){
  const checkedItemId= req.body.checkbox;
  const listName=req.body.listName;
  if(listName==="Today")
  {
    Item.findByIdAndRemove(checkedItemId,function(err){
    if(!err){
      console.log("Delete");
      res.redirect("/");
    }
    });
  }else{
    List.findOneAndUpdate({name:listName},{$pull:{items:{_id:checkedItemId}}},function(err,foundList){
      if(!err){
        res.redirect("/"+listName);
      }
    })
  }
});

app.get("/about", function(req, res){
  res.render("about");
});

app.listen(3000, function() {
  console.log("Server started on port 3000");
});
