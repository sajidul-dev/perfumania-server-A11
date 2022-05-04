const express = require('express');
const cors = require('cors');
const app = express()
require('dotenv').config()
const port = process.env.PORT || 5000
const { MongoClient, ServerApiVersion } = require('mongodb');

// middleware
app.use(cors())
app.use(express.json())

// warehouseManagement
// Vc5o7pqdzBTZTg3y



const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.k5ac2.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
console.log(uri);
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run() {
    try {
        await client.connect()
        const perfumeCollection = client.db("warehouse").collection("items");


        // get all data
        app.get('/items', async (req, res) => {
            const query = {}
            const cursor = perfumeCollection.find(query)
            const items = await cursor.toArray()
            res.send(items)
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
