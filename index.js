const express = require("express");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const app = express();
require("dotenv").config();
const port = process.env.PORT || 5000;
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');

// Middleware__
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


    // jwt related api__

    app.post("/jwt", async (req, res) => {
      const user = req.body;
      const token = jwt.sign(user, process.env.ASSESS_TOKEN_SECRET, {expiresIn: "1h"});
      res.send({ token });
    })


    // Get and Post oparation for find menus__

    app.get("/menu", async (req, res) => {
      const result = await menuItemsCollection.find().toArray();
      res.send(result);
    })

    app.post("/menu", async (req, res) => {
      console.log(req.body);
      const item = req.body;
      const result = await menuItemsCollection.insertOne(item);
      res.send(result);
    })

    // Grt opatarion for find reviews__

    app.get("/review", async (req, res) => {
      const result = await reviewsCollection.find().toArray();
      res.send(result);
    })


    // Post and get oparation for carts item__

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

  // Delete oparation for carts__

  app.delete("/carts/:id", async (req, res) => {
    const id = req.params.id;
    const query = {_id: new ObjectId(id)};
    const result = await cartsCollection.deleteOne(query);
    res.send(result); 
  })


  // Post and get oparation for user__

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

  // jwt maiddlewares__

  const veryfiToken = (req, res, next) => {
    // console.log("Inside veryfied token", req.headers.authorization);
    
    if(!req.headers.authorization) {
      return res.status(401).send({message: "unsuthorized access"});
    }

    const token = req.headers.authorization.split(" ")[1];
    jwt.verify(token, process.env.ASSESS_TOKEN_SECRET, (err, decoded) => {
      if(err) {
        return res.status(401).send({message: "unsuthorized access"});
      }
      req.decoded = decoded;
      next();
    })
  }


  // Admin maiddlewares__

  const veryfiAdmin = async (req, res, next) => {
    const email = req.decoded.email;
    const query = {email: email};
    const user = await userCollection.findOne(query);
    const isAdmin = user?.role === "admin";
    if(!isAdmin) {
      return res.status(403).send({message: "forbidden access"});
    }

    next();
  }

  // Get oparation for user with veryfi token__

  app.get("/user", veryfiToken, veryfiAdmin, async (req, res) => {
    const result = await userCollection.find().toArray();
    res.send(result);
  })

  // Find who is admin__

  app.get("/user/admin/:email", veryfiToken, async (req, res) => {
    const email = req.params.email;
    if(email !== req.decoded.email) {
      console.log("Youe email is match with", req.decoded.email);
      return res.status(403).send({message: "forbidden access"});
    }
    
    const query = {email: email};
    const user = await userCollection.findOne(query);
    let admin = false;
    if(user) {
      admin = user?.role === "admin"
    }

    res.send({admin});
  })


  // Delete oparation for user__

  app.delete("/user/:id", veryfiToken, veryfiAdmin, async (req, res) => {
    const id = req.params.id;
    const query = {_id: new ObjectId(id)}
    const result = await userCollection.deleteOne(query);
    res.send(result);
  })

  // Patch oparation for admin__

  app.patch("/user/admin/:id", veryfiToken, veryfiAdmin, async (req, res) => {
    const id = req.params.id;
    const filter = {_id: new ObjectId(id)};
    const updateDoc =  {
      $set: {
        role: "admin"
      }
    };
    const result = await userCollection.updateOne(filter, updateDoc);
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
