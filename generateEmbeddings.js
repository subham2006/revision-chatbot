require('dotenv').config();
const { MongoClient, ServerApiVersion } = require('mongodb');
const axios = require('axios');

const MONGO_URI = process.env.MONGO_URI;
const DATABASE_NAME = 'Revision';
const COLLECTION_NAME = 'Scientists';
const EMBEDDINGS_COLLECTION_NAME = 'ScientistsEmbeddingsLight';
const OPENAI_EMBEDDING_URL = 'https://api.openai.com/v1/embeddings';

const client = new MongoClient(MONGO_URI, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function generateEmbeddings() {
  try {
    await client.connect();
    const db = client.db(DATABASE_NAME);
    const collection = db.collection(COLLECTION_NAME);
    const embeddingsCollection = db.collection(EMBEDDINGS_COLLECTION_NAME);

    const scientists = await collection.find().toArray();

    for (const scientist of scientists) {
      const response = await axios.post(OPENAI_EMBEDDING_URL, {
        input: `${scientist.name} ${scientist.field} ${scientist.bio}`,
        model: 'text-embedding-ada-002'
      }, {
        headers: {
          'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
          'Content-Type': 'application/json'
        }
      });

      const embedding = response.data.data[0].embedding;
      await embeddingsCollection.insertOne({ ...scientist, embedding });
    }

    console.log('Embeddings generated and stored successfully!');
  } catch (error) {
    console.error('Error generating embeddings:', error);
  } finally {
    await client.close();
  }
}

generateEmbeddings().catch(console.dir);