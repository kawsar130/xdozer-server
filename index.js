const express = require("express");
const app = express();
const cors = require("cors");
require("dotenv").config();
const { MongoClient } = require("mongodb");
const ObjectId = require("mongodb").ObjectId;

const port = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Connection to the cluster
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.ihos6.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

async function run() {
    try {
        await client.connect();
        const database = client.db("XDozer");
        const equipmentsCollection = database.collection("equipments");
        const usersCollection = database.collection("users");
        const quotationsCollection = database.collection("quotations");
        const listedCollection = database.collection("listed");

        // Getting Equipments
        app.get("/equipmentRent", async (req, res) => {
            const cursor = equipmentsCollection.find({});
            const equipment = await cursor.toArray();
            res.send(equipment);
        });

        // Getting specific equipments with id
        app.get("/equipmentRent/:id", async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await equipmentsCollection.findOne(query);
            res.json(result);
        });

        // Posting To Listed Collection
        app.post("/listed", async (req, res) => {
            const listed = req.body;
            const result = await listedCollection.insertOne(listed);
            res.json({ result });
        });

        // Getting listed item with Email
        app.get("/listed", async (req, res) => {
            const email = req.query.email;
            let query = {};
            if (email) {
                query = { clientEmail: email };
            }
            const cursor = listedCollection.find(query);
            const listed = await cursor.toArray();
            res.json(listed);
        });

        // Equipment Search for single listed item
        app.get("/equipmentSearch", async (req, res) => {
            const equipmentId = req.query.equipmentId;
            let query = {};
            if (equipmentId) {
                query = { _id: ObjectId(equipmentId) };
            }
            const foundEquipment = await equipmentsCollection.findOne(query);
            res.json(foundEquipment);
        });

        // Removing single item from Cart
        app.delete("/removeItem/:id", async (req, res) => {
            const id = req.params.id;
            const item = {
                _id: ObjectId(id)
            };
            const result = await listedCollection.deleteOne(item);
            res.send(result);
        });
    } finally {
        // await client.close();
    }
}

run().catch(console.dir);

app.get("/", (req, res) => {
    res.send("Hello XDozer!");
});

app.listen(port, () => {
    console.log(`XDozer running at http://localhost:${port}`);
});
