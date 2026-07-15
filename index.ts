import express, { Request, Response } from "express";
import dotenv from "dotenv";
import corsMiddleware from "cors";
import { MongoClient, ServerApiVersion, ObjectId } from "mongodb";

dotenv.config();

const app = express();

app.use(corsMiddleware({
  origin: ["http://localhost:3000", "https://paws-claws-beta.vercel.app"],
  credentials: true,
}));
app.use(express.json());

const uri = process.env.MONGODB_URI as string;
const client = new MongoClient(uri, {
  serverApi: { version: ServerApiVersion.v1, strict: true, deprecationErrors: true },
});

let db: any = null;

async function getDb() {
  if (db) return db;
  await client.connect();
  db = client.db("paws-claws");
  return db;
}

// --- API Endpoints ---

app.get("/", (req: Request, res: Response) => {
  res.send("Paws & Claws Server is Running!");
});

app.get("/pets", async (req: Request, res: Response) => {
  try {
    const database = await getDb();
    const { search, category, sort, page = "1", limit = "6" } = req.query;
    
    const pageNum = parseInt(page as string) || 1;
    const limitNum = parseInt(limit as string) || 6;

    let query: any = { status: "available" };
    if (search) {
      const regex = new RegExp(search as string, "i");
      query.$or = [{ name: regex }, { breed: regex }, { location: regex }];
    }
    if (category) query.category = category;

    let sortOption: any = {};
    if (sort === "newest") sortOption.createdAt = -1;
    else if (sort === "oldest") sortOption.createdAt = 1;

    const total = await database.collection("pets").countDocuments(query);
    const pets = await database.collection("pets")
      .find(query)
      .sort(sortOption)
      .skip((pageNum - 1) * limitNum)
      .limit(limitNum)
      .toArray();

    res.json({ pets, totalPages: Math.ceil(total / limitNum) });
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
});

app.get("/pets/:id", async (req: Request, res: Response) => {
  try {
    const database = await getDb();
    const id = req.params.id as string;
    
    if (!ObjectId.isValid(id)) return res.status(400).json({ message: "Invalid ID" });
    
    const result = await database.collection("pets").findOne({ _id: new ObjectId(id) });
    result ? res.json(result) : res.status(404).json({ message: "Not found" });
  } catch (error) {
    res.status(500).json({ message: "Error" });
  }
});

app.get("/featuredPets", async (req: Request, res: Response) => {
  try {
    const database = await getDb();
    // এখানে আমরা 'available' স্ট্যাটাস থাকা পেটগুলো থেকে লিমিট ৩টি নিচ্ছি
    const pets = await database.collection("pets")
      .find({ status: "available" })
      .limit(3)
      .toArray();
    res.json(pets);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch featured pets" });
  }
});

app.post("/adoptions", async (req: Request, res: Response) => {
  try {
    const database = await getDb();
    const result = await database.collection("adoptions").insertOne({
      ...req.body,
      status: "pending",
      createdAt: new Date(),
    });
    res.status(201).json(result);
  } catch (error) {
    res.status(500).json({ message: "Failed" });
  }
});

app.get("/adoptions", async (req: Request, res: Response) => {
  try {
    const database = await getDb();
    // যদি নির্দিষ্ট ইউজারের ইমেইল ফিল্টার করতে হয় তবে:
    // const { email } = req.query;
    // const query = email ? { applicantEmail: email } : {};
    const result = await database.collection("adoptions").find({}).toArray();
    res.json(result);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch" });
  }
});

app.delete("/pets/:id", async (req: Request, res: Response) => {
  try {
    const database = await getDb();
    const id = req.params.id as string;
    
    if (!ObjectId.isValid(id)) return res.status(400).json({ message: "Invalid ID" });
    
    const result = await database.collection("pets").deleteOne({ _id: new ObjectId(id) });
    result.deletedCount === 1 
      ? res.json({ message: "Success" }) 
      : res.status(404).json({ message: "Not found" });
  } catch (error) {
    res.status(500).json({ message: "Failed" });
  }
});

// Admin stats
app.get("/admin/adoption-stats", async (req: Request, res: Response) => {
  try {
    const database = await getDb();
    const stats = await database.collection("adoptions").aggregate([
      { $group: { _id: { $dateToString: { format: "%Y-%m", date: "$createdAt" } }, count: { $sum: 1 } } },
      { $sort: { _id: 1 } }
    ]).toArray();
    res.json(stats);
  } catch (error) {
    res.status(500).json({ message: "Failed" });
  }
});

app.get("/admin/all-pets", async (req: Request, res: Response) => {
  try {
    const database = await getDb();
    const pets = await database.collection("pets").find({}).toArray();
    res.json(pets);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch pets" });
  }
});

export default app;