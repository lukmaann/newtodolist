const express=require("express");
const bodyParser=require('body-parser');
const date=require(__dirname+'/date.js');
require("dotenv").config()

const app=express();
app.use(bodyParser.urlencoded({extended:true}));
app.set('view engine','ejs');
app.use(express.static("public"));

// ------------------------database--------------------------------
const mongoose = require("mongoose");

const mongoAtlasUri =process.env.URI;

try {
  // Connect to the MongoDB cluster
  mongoose.connect(mongoAtlasUri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
  console.log("mongodb connected");
} catch (e) {
  console.log("could not connect");
}
const itemSchema=new mongoose.Schema({
    task:String
})
const listSchema=new mongoose.Schema({
    name:String,
    items:[itemSchema]
})
const item=new mongoose.model('maintask',itemSchema);
const list=new mongoose.model("list",listSchema);


// let item=["eat","sleep","code"];
// let workList=[];

let today=date.getDay();
app.get("/",(req,res)=>{
    item.find({}).then((list)=>{
    res.render("list",{list:list,title:today});


    })
})

app.post("/",(req,res)=>{
    const newItem=req.body.additem;
    const listname=req.body.list;

    const newentry= new item({task:newItem})

    if(listname===today){
        newentry.save().then(()=>{
            console.log("new entry added to work list");
            res.redirect('/')
        }
        )

    }else{
        list.findOne({name:listname}).then((found)=>{
            found.items.push(newentry);
            found.save();
            res.redirect('/'+found.name)
        })
    }
    
    


   
})



app.get("/:newlist",(req,res)=>{
    let listname=req.params.newlist;

    list.findOne({name:listname}).then((found)=>{
        if(!found){
            const newlist= new list({name:listname});
            newlist.save().then(()=>{
            res.redirect('/'+listname)
    })
    
        }else{
            list.findOne({name:listname}).then((found)=>{
                res.render("list",{list:found.items,title:found.name})
            })
        }
    })
    


})

app.post('/delete',(req,res)=>{
    const id=req.body.input;
    const listname=req.body.listname;

    if(listname===today){
        item.findByIdAndDelete(id).then(()=>{
            res.redirect('/');
        })

    }else{
        list.findOneAndUpdate({name:listname},{$pull:{items:{_id:id}}}).then((found)=>{
            res.redirect('/'+listname)
        })
    }
 
    
})

const PORT = process.env.PORT || 3030;
app.listen(PORT,()=>{
    console.log("server started at port 3030");
})
