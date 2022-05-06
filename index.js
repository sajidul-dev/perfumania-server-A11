const express = require('express');
const cors = require('cors');
const app = express()
require('dotenv').config()
const port = process.env.PORT || 5000
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');

// middleware
app.use(cors())
app.use(express.json())





const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.k5ac2.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run() {
    try {
        await client.connect()
        const perfumeCollection = client.db("warehouse").collection("items");


        // get all data
        app.get('/allItems', async (req, res) => {
            const query = {}
            const cursor = perfumeCollection.find(query)
            const allItems = await cursor.toArray()
            res.send(allItems)
        })

        // get six data
        app.get('/items', async (req, res) => {
            const query = {}
            const cursor = perfumeCollection.find(query)
            const items = await cursor.limit(6).toArray()
            res.send(items)
        })

        // get one data
        app.get('/item/:id', async (req, res) => {
            const id = req.params.id
            const query = { _id: ObjectId(id) }
            const item = await perfumeCollection.findOne(query)
            res.send(item)
        })

        // update data
        app.put('/item/:id', async (req, res) => {
            const id = req.params.id
            const updateItem = req.body
            const filter = { _id: ObjectId(id) }
            const options = { upsert: true }
            const updatedDOC = {
                $set: {
                    quantity: updateItem.quantity
                }
            }
            const result = await perfumeCollection.updateOne(filter, updatedDOC, options)
            res.send(result)
        })

    }
    finally {
        // await client.close()
    }
}
run().catch(console.dir)




app.get('/', (req, res) => {
    res.send('Runnging warehouse server')
})

app.listen(port, () => {
    console.log("Listening", port);
})
