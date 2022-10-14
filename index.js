const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const express = require("express");
const cors = require("cors");
const app = express();
require("dotenv").config();
let port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.gmy2esg.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
});

async function run() {
  try {
    await client.connect();
    const reviewCollection = client.db("register_login").collection("review");
    const usersCollection = client.db("register_login").collection("users");

    app.get("/ok", async (req, res) => {
      const result = await reviewCollection.find({}).toArray();
      // console.log('result')
      res.send(result);
    });

    // if user register then again user can not register again
    app.post("/register", async (req, res) => {
      const addUser = req.body;
      const email = addUser.email;
      const checkUser = await reviewCollection.findOne({
        email: email,
      });
      if (checkUser) {
        res.send({ acknowledged: true });
      } else {
        const result = await reviewCollection.insertOne(addUser);
        res.send(result);
      }
    });

    // if user register then he can login or not

    app.post("/login", async (req, res) => {
      const data = req.body;
      const email = data.email;
      const password = data.password;
      // console.log(data)
      const checkUser = await reviewCollection.findOne({
        email: email,
      });
      if (checkUser.password === password && checkUser.email === email) {
        res.send({ acknowledged: true });
      } else {
        res.send({ acknowledged: false });
      }
    });

    //Reset user Name and password

    app.post("/reset", async (req, res) => {
      const data = req.body;
      const email = data.email;
      const password = data.password;
      const newPassword = data.newPassword;
      const checkUser = await reviewCollection.findOne({
        email: email,
      });
      // console.log(checkUser.password===password ,checkUser.email===email)
      //       console.log(email)
      if (checkUser.password === password && checkUser.email === email) {
        const filter = { email: email };
        const options = { upsert: true };
        const updateDoc = {
          $set: {
            password: newPassword,
            name: data.name,
          },
        };
        const result = await reviewCollection.updateOne(
          filter,
          updateDoc,
          options
        );
        res.send({ acknowledged: true });
      } else {
        res.send({ acknowledged: false });
      }
    });

    // for user add and update
    app.get("/users", async (req, res) => {
      const result = await usersCollection.find({}).toArray();
      // console.log('result')
      res.send(result);
    });
    app.post("/addUser", async (req, res) => {
      const addUser = req.body;
      // console.log(addUser)
      const result = await usersCollection.insertOne(addUser);
      res.send(result);
    });

    app.post("/updateUser/:userId", async (req, res) => {
      const userInfo = req.body;
      const id = req.params.userId;
      const filter = { _id: ObjectId(id) };
      const options = { upsert: true };
      const updateDoc = {
        $set: userInfo,
      };
      const result = await usersCollection.updateOne(
        filter,
        updateDoc,
        options
      );
      res.send(result);
    });
    // delete user
    app.delete("/user/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: ObjectId(id) };
      const cursor = await usersCollection.deleteOne(filter);
      res.send(cursor);
    });
  } finally {
  }
}
run().catch(console.dir);

app.get("/", async (req, res) => {
  res.send("All good  server is  running");
});
app.listen(port, () => {
  console.log(" server  running on port", port);
});
