const mongoose = require('mongoose');
const initData = require('./data.js');
const Listing = require('../models/list.js');


const MONGO_URL = 'mongodb://127.0.0.1:27017/wanderlust';

main()
    .then(res => {
        console.log("connected to db");
    })
    .catch(Err => {
        console.log("some problem in db");
    });

async function main() {
    await mongoose.connect(MONGO_URL);
}

const initDB=async()=>{
    await Listing.deleteMany({});
    initData.data = initData.data.map((obj)=>({...obj,owner:'6a566133c678ff411a49b70d'}));
    await Listing.insertMany(initData.data);
    console.log("data was initialized");
}
initDB();