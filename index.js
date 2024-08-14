const express = require("express");
const cors = require("cors");
const app = express();
require("dotenv").config();
const port = process.env.PORT || 5000;
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');

// Middleware
app.use(cors());
app.use(express.json());


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.g4yea9q.mongodb.net/?appName=Cluster0`;

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




    const userCollection = client.db("bistroBoss").collection("user");
    const menuItemsCollection = client.db("bistroBoss").collection("menu");
    const reviewsCollection = client.db("bistroBoss").collection("review");
    const cartsCollection = client.db("bistroBoss").collection("carts");


    // Get oparation for find menus

    app.get("/menu", async (req, res) => {
      const result = await menuItemsCollection.find().toArray();
      res.send(result);
    })

    // Grt opatarion for find reviews

    app.get("/review", async (req, res) => {
      const result = await reviewsCollection.find().toArray();
      res.send(result);
    })


    // Post and get oparation for carts item

    app.post("/carts", async (req, res) => {
      const cartItem = req.body;
      const result = await cartsCollection.insertOne(cartItem);
      res.send(result);
    })

  app.get("/carts", async (req, res) => {
    const email = req.query.email;
    const query =  {email: email};
    const result = await cartsCollection.find(query).toArray();
    res.send(result);
  })

  // Delete oparation for carts

  app.delete("/carts/:id", async (req, res) => {
    const id = req.params.id;
    const query = {_id: new ObjectId(id)};
    const result = await cartsCollection.deleteOne(query);
    res.send(result); 
  })


  // Post oparation for insert user

  app.post("/user", async (req, res) => {
    const user = req.body;

    // Insert use if it's not exists,,,

    const query = req.body;
    const isExists = await userCollection.findOne(query);
    if(isExists) {
      return res.send({message: "user alrady exists", insertedId: null})
    }

    const result = await userCollection.insertOne(user);
    res.send(result);
  })




    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);




app.get("/", (req, res) => {
  res.send("Bistro Boss Server is rinning");
});

app.listen(port, () => {
  console.log(`Server is runnig on ${port} port`);
});
