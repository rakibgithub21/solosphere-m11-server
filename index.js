const express = require('express')
const cors = require('cors')
require('dotenv').config()
const port = process.env.PORT || 5000

const app = express()
const corsOptions = {
    origin: [
        'http://localhost:5173',
        'http://localhost:5174',
        'https://solosphere.web.app',
    ],
    credentials: true,
    optionSuccessStatus: 200,
}
app.use(cors(corsOptions))
app.use(express.json())






const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.vq4rqer.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

async function run() {
    try {
        // Connect the client to the server	(optional starting in v4.7)
        // await client.connect();
        const jobsCollection = client.db('soloSphere').collection('jobs')
        const bidsCollection = client.db('soloSphere').collection('bids')
        // Get all data:
        app.get('/jobs', async (req, res) => {
            const result = await jobsCollection.find().toArray()
            res.send(result)
        })

        // get all jobs posted by specific user:
        app.get('/jobs/:email', async (req, res) => {
            const email = req.params.email;
            const query = { 'buyer.email': email }
            const result = await jobsCollection.find(query).toArray();
            res.send(result)
        })

        app.get('/job/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) }
            
            const result = await jobsCollection.findOne(query);
            res.send(result)
        })


        // save a job in db
        app.post('/job', async (req, res) => {
            const jobData = req.body;
            console.log(jobData);
            const result = await jobsCollection.insertOne(jobData);
            res.send(result)
        })



        // delete single job data from db using id::

        app.delete('/job/:id', async (req, res) => {
            const id = req.params.id
            const query = { _id: new ObjectId(id) }
            const result = await jobsCollection.deleteOne(query)
            res.send(result)
        })



        app.put('/job/:id', async (req, res) => {
            const id = req.params.id;
            const jobData = req.body;
            const query = { _id: new ObjectId(id) }
            const options = { upsert: true }
            const updateDoc = {
                $set: {
                   ...jobData, 
                },
            }
            const result = await jobsCollection.updateOne(query, updateDoc, options)
            res.send(result)
        })


        // save bid data in db
        app.post('/bid', async (req, res) => {
            const bidData = req.body;
            console.log(bidData);
            const result = await bidsCollection.insertOne(bidData);
            res.send(result)
        })

        // get all bids for a user by email from db:
        app.get('/my-bids/:email', async (req, res) => {
            const email = req.params.email;
            const query = { email: email }
            const result = await bidsCollection.find(query).toArray();
            res.send(result)
        })

        // get all bids request from db for job owner:
        app.get('/bid-requests/:email', async (req, res) => {
            const email = req.params.email;
            const query = { 'buyer.email': email }
            const result = await bidsCollection.find(query).toArray();
            res.send(result)
        })


        // Send a ping to confirm a successful connection
        // await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
        // Ensures that the client will close when you finish/error
        // await client.close();
    }
}
run().catch(console.dir);






app.get('/', (req, res) => {
    res.send('Hello From SoloSphere Server..........')
})

app.listen(port, () => {
    console.log(`server is running on port ${port}`);
})