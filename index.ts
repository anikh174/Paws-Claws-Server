// import express, { Request, Response } from "express";
// import dotenv from "dotenv";
// import corsMiddleware from "cors";
// import { MongoClient, ServerApiVersion, ObjectId } from "mongodb";

// dotenv.config();

// const app = express();
// const port = process.env.PORT || 5000;

// // CORS configuration
// app.use(
//   corsMiddleware({
//     origin: ["http://localhost:3000", "https://paws-claws-beta.vercel.app"],
//     credentials: true,
//   })
// );

// app.use(express.json());

// // MongoDB connection setup
// const uri = process.env.MONGODB_URI;
// if (!uri) {
//   throw new Error("MONGODB_URI is not defined in .env file");
// }

// const client = new MongoClient(uri, {
//   serverApi: {
//     version: ServerApiVersion.v1,
//     strict: true,
//     deprecationErrors: true,
//   },
// });

// async function run() {
//   try {
//     await client.connect();
//     console.log("Successfully connected to MongoDB! 🎉");

//     const db = client.db("paws-claws");
//     const petsCollection = db.collection("pets");
//     const adoptionCollection = db.collection("adoptions");

//     // Root Endpoint
//     app.get("/", (req: Request, res: Response) => {
//       res.send("Paws & Claws Server is Running!");
//     });

//     // // 1. Get all pets with optional search
//     // app.get("/pets", async (req: Request, res: Response) => {
//     //   try {
//     //     const { search } = req.query;
//     //     let query: any = { status: "available" };

//     //     if (search) {
//     //       const searchRegex = new RegExp(search as string, "i");
//     //       query.$and = [
//     //         { status: "available" },
//     //         {
//     //           $or: [
//     //             { name: searchRegex },
//     //             { breed: searchRegex },
//     //             { location: searchRegex }
//     //           ]
//     //         }
//     //       ];
//     //     }

//     //     const result = await petsCollection.find(query).toArray();
//     //     res.send(result);
//     //   } catch (error) {
//     //     res.status(500).json({ message: "Internal server error" });
//     //   }
//     // });

//     // /pets রাউট
// // app.get("/pets", async (req: Request, res: Response) => {
// //   try {
// //     const { search, page = 1, limit = 6 } = req.query;
// //     const pageNum = parseInt(page as string);
// //     const limitNum = parseInt(limit as string);
    
// //     let query: any = { status: "available" };

// //     if (search) {
// //       const searchRegex = new RegExp(search as string, "i");
// //       query.$and = [
// //         { status: "available" },
// //         { $or: [{ name: searchRegex }, { breed: searchRegex }, { location: searchRegex }] }
// //       ];
// //     }

// //     const total = await petsCollection.countDocuments(query);
// //     const pets = await petsCollection
// //       .find(query)
// //       .skip((pageNum - 1) * limitNum)
// //       .limit(limitNum)
// //       .toArray();

// //     res.send({ 
// //       pets, 
// //       totalPages: Math.ceil(total / limitNum) 
// //     });
// //   } catch (error) {
// //     res.status(500).json({ message: "Internal server error" });
// //   }
// // });

// app.get("/pets", async (req: Request, res: Response) => {
//   try {
//     const { search, category, sort, page = 1, limit = 6 } = req.query;
//     const pageNum = parseInt(page as string);
//     const limitNum = parseInt(limit as string);

//     let query: any = { status: "available" };

//     // সার্চ ফিল্টার (এখন 'search' key কাজ করবে)
//     if (search) {
//       const searchRegex = new RegExp(search as string, "i");
//       query.$or = [
//         { name: searchRegex },
//         { breed: searchRegex },
//         { location: searchRegex }
//       ];
//     }

//     // ক্যাটাগরি ফিল্টার
//     if (category) {
//       query.category = category;
//     }

//     // সর্টিং অপশন
//     let sortOption: any = {};
//     if (sort === "newest") {
//       sortOption.createdAt = -1;
//     } else if (sort === "oldest") {
//       sortOption.createdAt = 1;
//     }

//     const total = await petsCollection.countDocuments(query);
//     const pets = await petsCollection
//       .find(query)
//       .sort(sortOption)
//       .skip((pageNum - 1) * limitNum)
//       .limit(limitNum)
//       .toArray();

//     res.send({
//       pets,
//       totalPages: Math.ceil(total / limitNum),
//     });
//   } catch (error) {
//     res.status(500).json({ message: "Internal server error" });
//   }
// });

//     // 2. Featured Pets
//     app.get("/featuredPets", async (req: Request, res: Response) => {
//       try {
//         const query = { status: "available" };
//         const result = await petsCollection.find(query).limit(3).toArray();
//         res.send(result);
//       } catch (error) {
//         res.status(500).json({ message: "Failed to fetch featured pets" });
//       }
//     });

//     // 3. Get single pet details
//     app.get("/pets/:id", async (req: Request, res: Response) => {
//       try {
//         const { id } = req.params;
//         if (!ObjectId.isValid(id)) {
//           return res.status(400).json({ message: "Invalid ID format" });
//         }
//         const query = { _id: new ObjectId(id) };
//         const result = await petsCollection.findOne(query);
//         if (!result) return res.status(404).json({ message: "Pet not found" });
//         res.send(result);
//       } catch (error) {
//         res.status(500).json({ message: "Internal server error" });
//       }
//     });

//     // 4. Get all adoptions
//     app.get("/adoptions", async (req: Request, res: Response) => {
//       try {
//         const result = await adoptionCollection.find().toArray();
//         res.send(result);
//       } catch (error) {
//         res.status(500).json({ message: "Failed to fetch adoptions" });
//       }
//     });

//     // 5. Submit adoption request
//     app.post("/adoptions", async (req: Request, res: Response) => {
//       try {
//         const adoptionData = req.body;
//         const result = await adoptionCollection.insertOne({
//           ...adoptionData,
//           status: "pending",
//           createdAt: new Date()
//         });
//         res.status(201).json(result);
//       } catch (error) {
//         res.status(500).json({ message: "Failed to submit request" });
//       }
//     });

//     // 6. Admin Stats
//     app.get("/admin/adoption-stats", async (req: Request, res: Response) => {
//       try {
//         const stats = await adoptionCollection.aggregate([
//           {
//             $group: {
//               _id: { $dateToString: { format: "%Y-%m", date: "$createdAt" } },
//               count: { $sum: 1 }
//             }
//           },
//           { $sort: { _id: 1 } }
//         ]).toArray();
//         res.json(stats);
//       } catch (error) {
//         res.status(500).json({ message: "Failed to fetch stats" });
//       }
//     });

//     // 7. Get all pets (For Management Page)
//     app.get("/admin/all-pets", async (req: Request, res: Response) => {
//       try {
//         const result = await petsCollection.find().toArray();
//         res.send(result);
//       } catch (error) {
//         res.status(500).json({ message: "Failed to fetch pets" });
//       }
//     });

//     // 8. Delete a pet (For Management Page)
//     app.delete("/pets/:id", async (req: Request, res: Response) => {
//       try {
//         const { id } = req.params;
//         if (!ObjectId.isValid(id)) {
//           return res.status(400).json({ message: "Invalid ID format" });
//         }
//         const query = { _id: new ObjectId(id) };
//         const result = await petsCollection.deleteOne(query);
//         if (result.deletedCount === 1) {
//           res.json({ message: "Pet deleted successfully" });
//         } else {
//           res.status(404).json({ message: "Pet not found" });
//         }
//       } catch (error) {
//         res.status(500).json({ message: "Failed to delete pet" });
//       }
//     });

//   } catch (error) {
//     console.error("Database connection error: ❌", error);
//   }
// }

// run().catch(console.dir);

// app.listen(port, () => {
//   console.log(`Server is running on port ${port}`);
// });

import express, { Request, Response } from "express";
import dotenv from "dotenv";
import corsMiddleware from "cors";
import { MongoClient, ServerApiVersion, ObjectId, Db } from "mongodb";

dotenv.config();

const app = express();

// Middleware
app.use(
  corsMiddleware({
    origin: ["http://localhost:3000", "https://paws-claws-beta.vercel.app"],
    credentials: true,
  })
);
app.use(express.json());

// MongoDB connection
const uri = process.env.MONGODB_URI as string;
if (!uri) {
  throw new Error("MONGODB_URI is not defined in .env file");
}

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

let cachedDb: Db | null = null;

async function getDb() {
  if (cachedDb) return cachedDb;
  await client.connect();
  const db = client.db("paws-claws");
  cachedDb = db;
  return db;
}

// --- API Endpoints ---

// 1. Root
app.get("/", (req: Request, res: Response) => {
  res.send("Paws & Claws Server is Running!");
});

// 2. Get all pets
app.get("/pets", async (req: Request, res: Response) => {
  try {
    const db = await getDb();
    const { search, category, sort, page = 1, limit = 6 } = req.query;
    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);

    let query: any = { status: "available" };
    if (search) {
      const searchRegex = new RegExp(search as string, "i");
      query.$or = [{ name: searchRegex }, { breed: searchRegex }, { location: searchRegex }];
    }
    if (category) query.category = category;

    let sortOption: any = {};
    if (sort === "newest") sortOption.createdAt = -1;
    else if (sort === "oldest") sortOption.createdAt = 1;

    const total = await db.collection("pets").countDocuments(query);
    const pets = await db.collection("pets")
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

// 3. Featured Pets
app.get("/featuredPets", async (req: Request, res: Response) => {
  try {
    const db = await getDb();
    const result = await db.collection("pets").find({ status: "available" }).limit(3).toArray();
    res.json(result);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch featured pets" });
  }
});

// 4. Single pet details
app.get("/pets/:id", async (req: Request, res: Response) => {
  try {
    const db = await getDb();
    const { id } = req.params;
    if (!ObjectId.isValid(id)) return res.status(400).json({ message: "Invalid ID format" });
    const result = await db.collection("pets").findOne({ _id: new ObjectId(id) });
    if (!result) return res.status(404).json({ message: "Pet not found" });
    res.json(result);
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
});

// 5. Adoptions (GET)
app.get("/adoptions", async (req: Request, res: Response) => {
  try {
    const db = await getDb();
    const result = await db.collection("adoptions").find().toArray();
    res.json(result);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch adoptions" });
  }
});

// 6. Submit adoption
app.post("/adoptions", async (req: Request, res: Response) => {
  try {
    const db = await getDb();
    const result = await db.collection("adoptions").insertOne({
      ...req.body,
      status: "pending",
      createdAt: new Date(),
    });
    res.status(201).json(result);
  } catch (error) {
    res.status(500).json({ message: "Failed to submit request" });
  }
});

// 7. Admin Stats
app.get("/admin/adoption-stats", async (req: Request, res: Response) => {
  try {
    const db = await getDb();
    const stats = await db.collection("adoptions").aggregate([
      { $group: { _id: { $dateToString: { format: "%Y-%m", date: "$createdAt" } }, count: { $sum: 1 } } },
      { $sort: { _id: 1 } }
    ]).toArray();
    res.json(stats);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch stats" });
  }
});

// 8. Admin Get all pets
app.get("/admin/all-pets", async (req: Request, res: Response) => {
  try {
    const db = await getDb();
    const result = await db.collection("pets").find().toArray();
    res.json(result);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch pets" });
  }
});

// 9. Delete pet
app.delete("/pets/:id", async (req: Request, res: Response) => {
  try {
    const db = await getDb();
    const { id } = req.params;
    if (!ObjectId.isValid(id)) return res.status(400).json({ message: "Invalid ID format" });
    const result = await db.collection("pets").deleteOne({ _id: new ObjectId(id) });
    result.deletedCount === 1 
      ? res.json({ message: "Pet deleted successfully" }) 
      : res.status(404).json({ message: "Pet not found" });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete pet" });
  }
});

// Vercel-এর জন্য এক্সপোর্ট
export default app;