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

let allPosts = [{
    title: "Post 1",
    content: "Telugu is found recorded as early as the 7th century AD but as a literary language it came into its own probably in the 11th century when Nannaya translated the Mahabharata into this language. In the period 500-1100, Telugu was confined to the poetic works and flourished in the courts of kings and among scholars. This period also saw the translation of Ganitasara, a mathematical treatise of Mahivaracharya, into Telugu by Pavuluri Mallana."
},{
    title: "Post 1",
    content: "The tiger is a wild animal. It lives in forests. It belongs to the family of mammals. The tiger is also referred to as a big cat. The tiger is marked by stripes on its coat. Each tiger has a unique pattern of stripes, and one tiger can be distinguished from another by its stripe pattern. The tiger is a carnivorous animal. It preys on animals like the different species of deer, wild buffaloes, goats and boar that also inhabit the forest. There are different sub-species of the tiger such as the royal Bengal tiger, Sumatran tiger and Siberian tiger."
}];

Post.insertMany(allPosts);