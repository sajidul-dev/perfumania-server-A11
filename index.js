const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const app = express()
require('dotenv').config()
const port = process.env.PORT || 5000
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');

// middleware
const corsConfig = {
    origin: '*',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE']
}
app.use(cors(corsConfig))
app.options("*", cors(corsConfig))
app.use(express.json())
app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*")
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept,authorization")
    next()
})





const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.k5ac2.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run() {
    try {
        await client.connect()
        const perfumeCollection = client.db("warehouse").collection("items");


        // Auth
        app.post('/login', async (req, res) => {
            const user = req.body
            const accessToken = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {
                expiresIn: '1d'
            })
            res.send({ accessToken })
        })

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

        // Add item
        app.post('/addItem', async (req, res) => {
            const newItem = req.body
            const tokenInfo = req.headers.authorization
            const [email, accessToken] = tokenInfo.split(' ')
            const decoded = verifyToken(accessToken)
            if (email === decoded.email) {
                const result = await perfumeCollection.insertOne(newItem)
                res.send(result)
            }
            else {
                res.send({ success: 'unAuthorized Access' })
            }

        })

        // delete an item
        app.delete('/item/:id', async (req, res) => {
            const id = req.params.id
            const query = { _id: ObjectId(id) }
            const result = await perfumeCollection.deleteOne(query)
            res.send(result)
        })

        app.get('/myitems', async (req, res) => {
            const email = req.query.email
            console.log(email);
            const query = { email: email }
            const cursor = perfumeCollection.find(query)
            const myItems = await cursor.toArray()
            res.send(myItems)
        })

    }
    finally {
        // await client.close()
    }
}
run().catch(console.dir)

function verifyToken(token) {
    let email
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, function (error, decoded) {
        if (error) {
            email = 'Invalid Email'
        }
        if (decoded) {
            email = decoded
        }
    });
    return email
}



app.get('/', (req, res) => {
    res.send('Runnging warehouse server')
})

app.listen(port, () => {
    console.log("Listening", port);
})
