require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');
const cors = require('cors');
const { MongoClient, ServerApiVersion } = require('mongodb');

const app = express();
app.use(cors());
app.use(bodyParser.json());

const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions';
const OPENAI_EMBEDDING_URL = 'https://api.openai.com/v1/embeddings';
const MONGO_URI = process.env.MONGO_URI;
const DATABASE_NAME = 'Revision';
const COLLECTION_NAME = 'ScientistsEmbeddingsLight';

let db, collection;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(MONGO_URI, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // Connect the client to the server
    await client.connect();
    db = client.db(DATABASE_NAME);
    collection = db.collection(COLLECTION_NAME);
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } catch (error) {
    console.error(error);
  }
}
run().catch(console.dir);

app.post('/api/chat', async (req, res) => {
  try {
    const { message } = req.body;
    console.log('Received message:', message);

    // Generate embedding for the user's query
    const response = await axios.post(OPENAI_EMBEDDING_URL, {
      input: message,
      model: 'text-embedding-ada-002'
    }, {
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json'
      }
    });

    const queryEmbedding = response.data.data[0].embedding;

    // Fetch all embeddings from the database
    const scientists = await collection.find().toArray();

    // Calculate cosine similarity between the query embedding and each scientist's embedding
    const similarities = scientists.map(scientist => ({
      ...scientist,
      similarity: cosineSimilarity(queryEmbedding, scientist.embedding)
    }));

    // Sort by similarity and select the top N most relevant entries
    const topScientists = similarities.sort((a, b) => b.similarity - a.similarity).slice(0, 2);

    let prompt = `You are an AI assistant trained on information about scientists. Use the following data to answer questions:\n\n`;
    prompt += `${JSON.stringify(topScientists)}\n\n`;
    prompt += `User: ${message}\nAI:`;
    console.log('Generated prompt:', prompt);

    const chatResponse = await axios.post(OPENAI_API_URL, {
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: "You are a helpful assistant." },
        { role: "user", content: prompt }
      ]
    }, {
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json'
      }
    });

    res.json(chatResponse.data);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to process the request' });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

// Utility function for cosine similarity
function cosineSimilarity(vecA, vecB) {
  const dotProduct = vecA.reduce((sum, a, idx) => sum + a * vecB[idx], 0);
  const magnitudeA = Math.sqrt(vecA.reduce((sum, a) => sum + a * a, 0));
  const magnitudeB = Math.sqrt(vecB.reduce((sum, b) => sum + b * b, 0));
  return dotProduct / (magnitudeA * magnitudeB);
}