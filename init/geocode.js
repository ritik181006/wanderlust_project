require("dotenv").config();

const mongoose = require("mongoose");
const axios = require("axios");
const Listing = require("../models/list");

const mapToken = process.env.MAP_TOKEN;

async function updateListings() {
    await mongoose.connect("mongodb://127.0.0.1:27017/wanderlust"); // change if your DB name is different

    const listings = await Listing.find({});

    for (let listing of listings) {
        try {
            const query = `${listing.location}, ${listing.country}`;

            const response = await axios.get(
                `https://api.maptiler.com/geocoding/${encodeURIComponent(query)}.json`,
                {
                    params: {
                        key: mapToken
                    }
                }
            );

            if (response.data.features.length > 0) {
                listing.geometry = {
                    type: "Point",
                    coordinates: response.data.features[0].center
                };

                await listing.save();
                console.log(`Updated: ${listing.title}`);
            } else {
                console.log(`Location not found: ${listing.title}`);
            }
        } catch (err) {
            console.log(`Error updating ${listing.title}:`, err.message);
        }
    }

    mongoose.connection.close();
}

updateListings();