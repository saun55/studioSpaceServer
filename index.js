import express from 'express';
import cors from "cors"
import "dotenv/config";
import { MongoClient, ObjectId } from 'mongodb';


const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// mongodb uri+function


const client = new MongoClient(process.env.MONGODB_URI);
console.log(process.env.MONGODB_URI);
export async function connectToMongoDB() {
  try {
    await client.connect();
    console.log("You successfully connected to MongoDB!");
    return client;
  } catch (err) {
    console.dir(err);
  }
}
const mongoClient = await connectToMongoDB()
const db = mongoClient.db("studioSpace")
const studiosConnection = db.collection("studio")

// http://localhost:5000/studios/
// first 
app.get("/studios", async(req, res)=>{
  const result = await studiosConnection.find().toArray()
  res.send(result)
})

app.get("/studios/:id",async(req, res)=>{
const id = req.params.id;
const result = await studiosConnection.findOne({_id:new ObjectId(id)})
res.send(result)
})

// update data
app.patch("/studios/:id", async(req, res)=>{
  const id = req.params.id
  const updateData = req.body
  const result = await studiosConnection.updateOne({_id:new ObjectId(id)},
{$set:updateData}
)
  res.send(result)
}) 

// add data 
// http://localhost:5000/add-studios
app.post("/add-studios", async (req, res) => {
  try {
    const data = req.body;

    // Check duplicate studio
    const existingStudio = await studiosConnection.findOne({
      title: data.title,
      location: data.location,
    });

    if (existingStudio) {
      return res.status(409).send({
        success: false,
        message: "This studio already exists!",
      });
    }

    const result = await studiosConnection.insertOne({
      ...data,
      createdAt: new Date(),
    });

    res.status(201).send({
      success: true,
      message: "Studio added successfully!",
      insertedId: result.insertedId,
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: "Something went wrong!",
    });
  }
});








app.get('/', (req, res) => {
  res.send('Server Running');
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});