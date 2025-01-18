const express = require("express");
const app = express();
const path = require("path");
const port = 3000;
const { v4: uuidv4 } = require('uuid');
const methodOverride = require('method-override');
const mongoose = require('mongoose');
const Post = require("./models/post.js");

main()
.then((res)=>{
    console.log("connection successful");
})
.catch(err => console.log(err));

async function main() {
  await mongoose.connect('mongodb://127.0.0.1:27017/Tweeple');
}

app.use(methodOverride('_method'));
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));
app.use(express.static(path.join(__dirname, 'public')));


app.set("view engine","ejs");
app.set("views", path.join(__dirname,"views"));

// let posts = [{
//     id: uuidv4(),
//     title: "Post 1",
//     content: "Telugu is found recorded as early as the 7th century AD but as a literary language it came into its own probably in the 11th century when Nannaya translated the Mahabharata into this language. In the period 500-1100, Telugu was confined to the poetic works and flourished in the courts of kings and among scholars. This period also saw the translation of Ganitasara, a mathematical treatise of Mahivaracharya, into Telugu by Pavuluri Mallana." 
//     }, {
//         id: uuidv4(),
//         title: "Post 2",
//         content: "The tiger is a wild animal. It lives in forests. It belongs to the family of mammals. The tiger is also referred to as a big cat. The tiger is marked by stripes on its coat. Each tiger has a unique pattern of stripes, and one tiger can be distinguished from another by its stripe pattern. The tiger is a carnivorous animal. It preys on animals like the different species of deer, wild buffaloes, goats and boar that also inhabit the forest. There are different sub-species of the tiger such as the royal Bengal tiger, Sumatran tiger and Siberian tiger."
//     }, {
//         id: uuidv4(),
//         title: "Post 3",
//         content: "Welcome to the ultimate guide to Tollywood, the vibrant world of Telugu cinema. In this comprehensive article, we'll take you on a journey through the heart of the Telugu film industry, exploring its rich history, iconic stars, memorable films, and much more. Tollywood, based in Hyderabad, India, has earned its place as one of the major hubs of Indian cinema, known for its captivating storytelling, colorful characters, and spectacular productions"
//     }, {
//         id: uuidv4(),
//         title: "Post 4",
//         content: "The stock market is a place where stocks are bought and sold. A stock is a share of ownership in a company. When you buy a stock, you are becoming a part-owner of that company. The stock market is a complex system, but the basic idea is that buyers and sellers come together to agree on a price for a stock. The price of a stock is determined by supply and demand. When there are more buyers than sellers, the price of the stock goes up. When there are more sellers than buyers, the price of the stock goes down."
//     }, {
//         id: uuidv4(),
//         title: "Post 5",
//         content: "Cybersecurity means protecting data, networks, programs and other information from unauthorized or unattended access, destruction or change. In today’s world, cybersecurity is very important because of some security threats and cyber-attacks. For data protection, many companies develop software. This software protects the data. Cybersecurity is important because not only it helps to secure information but also our system from virus attack. After the U.S.A. and China, India has the highest number of internet users."
//     }
// ];

app.get("/", async (req,res)=>{
    let posts = await Post.find();
    // console.log(posts);
    res.render("index.ejs",{posts});
});

app.get("/post/new", (req, res)=>{
    console.log("Printing /posts/new");
    const {title} = req.query;
    res.render("new.ejs",{title});
});

app.post("/posting", (req,res)=>{
    let { title, content } = req.body;
    let id = uuidv4();
    console.log(req.body);
    // posts.push({id, title,content});
    let newPosts = new Post({
        title: title,
        content: content
    });

    newPosts.save()
        .then((res)=>{
            console.log("Saved succesfully");
        })
        .catch((err)=>{
            console.log(err);
        })

    // console.log(newPosts);
    res.redirect("/");
});

app.get("/post/:id", async (req,res)=>{
    let { id }= req.params;
    let post = await Post.findById(id);
    if (!post) {
        return res.status(404).send("Post not found");
    }
    // console.log(post);
    res.render("showUser.ejs",{post});
});

app.patch("/post/:id", async(req, res)=>{
    let { id } = req.params;
    let {content} = req.body;
    let updatedPost = await Post.findByIdAndUpdate(id,
        {content},
        {runValidators: true, new: true}
    );
    // let newContent = req.body.content;
    // let post = posts.find(post => post.id === id);
    // post.content = newContent;
    console.log(updatedPost);
    // res.redirect(`/post/${id}`);
    // res.send("Updated");
    res.redirect(`/`);
    // res.redirect("/post/:id");
});


app.get("/post/:id/edit", async (req,res)=>{
    let { id } = req.params;
    // let post = posts.find(post => post.id === id);
    let post = await Post.findById(id);
    console.log(post);
    res.render("edit.ejs",{post});
});

app.delete("/post/:id", async (req,res)=>{
    let { id } = req.params;
    console.log(id);
    // posts = posts.filter(post => post.id !== id);
    let deletedPost = await Post.findByIdAndDelete(id);
    console.log(deletedPost);
    res.redirect("/");
});

app.get("/subscription",(req,res)=>{
    res.render("subscription.ejs");
});

app.get("/login",(req,res)=>{
    res.render("login.ejs");
});

app.listen(port, ()=>{
    console.log("Server is running on port " + port);
});