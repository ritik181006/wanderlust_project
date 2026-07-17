const Listing = require("../models/list.js");
const axios = require("axios");
const mapToken = process.env.MAP_TOKEN;

module.exports.index = async (req, res) => {
    const allListings = await Listing.find({});
    res.render("./listings/index.ejs", { allListings });

};

module.exports.renderNewForm = (req, res) => {

    res.render("./listings/new.ejs");
};

module.exports.showListing = async (req, res) => {
    let { id } = req.params;
    const listings = await Listing.findById(id).populate({ path: "reviews", populate: { path: "author" } }).populate("owner");
    if (!listings) {
        req.flash("error", "the listing you are searching for does not exist!");
        return res.redirect("/listing");
    }

    console.log(listings.geometry);

    res.render("./listings/show.ejs", { listings, mapToken });
};

module.exports.createListing = async (req, res, next) => {

    // if(!req.body.listing){
    //     throw new ExpressError(400,"Please enter valid data");
    // }

    let url = req.file.path;
    let filename = req.file.filename;

    const newListing = new Listing(req.body.listing);
    // if(!newListing.title){
    //     throw new ExpressError(400,"Title is required");
    // }
    // if(!newListing.description){
    //     throw new ExpressError(400,"Description is required");
    // }
    const query = `${newListing.location}, ${newListing.country}`;
    const response = await axios.get(
        `https://api.maptiler.com/geocoding/${encodeURIComponent(query)}.json`,
        {
            params: {
                key: mapToken
            }
        }
    );
    if (!response.data.features.length) {
        req.flash("error", "Location not found");
        return res.redirect("/listing/new");
    }
    console.log("Center:", response.data.features[0].center);
    newListing.geometry = {
        type: "Point",
        coordinates: response.data.features[0].center
    };
    newListing.owner = req.user._id;
    newListing.image = { url, filename };

    console.log("Geometry:", newListing.geometry);

    await newListing.save();

    const savedListing = await Listing.findById(newListing._id);
    console.log("Saved geometry:", savedListing.geometry);

    
    req.flash("success", "New listing created!");
    res.redirect("/listing");


};

module.exports.renderEditForm = async (req, res) => {
    let { id } = req.params;
    const listings = await Listing.findById(id);
    if (!listings) {
        req.flash("error", "the listing you are searching for does not exist!");
        return res.redirect("/listing");
    }
    let originalUrl = listings.image.url;
    originalUrl = originalUrl.replace("/upload", "/upload/w_250");
    res.render("./listings/edit.ejs", { listings, originalUrl });
};

module.exports.updateListing = async (req, res) => {
    let { id } = req.params;
    let listing = await Listing.findByIdAndUpdate(id, { ...req.body.listing });

    if (typeof req.file !== "undefined") {
        let url = req.file.path;
        let filename = req.file.filename;
        listing.image = { url, filename };
        await listing.save();
    }
    req.flash("success", "Listing updated!");
    res.redirect(`/listing/${id}`);
};

module.exports.destroyListing = async (req, res) => {
    let { id } = req.params;
    await Listing.findByIdAndDelete(id);
    req.flash("success", "Listing deleted!");

    res.redirect("/listing");
};