import { Pinecone as PineconeClient } from '@pinecone-database/pinecone';
import PipelineSingleton from '../api/pipeline.js';
import brochureData from './medguide-brochure.json' assert { type: 'json' };

const PINECONE_API_KEY = process.env.PINECONE_API_KEY;

async function insertIntoPinecone() {
  try {
    const pinecone = new PineconeClient({
      apiKey: PINECONE_API_KEY,
    });

    const index = pinecone.Index('medguide-ai');

    const pipeline = await PipelineSingleton.getInstance();

    // Generate embeddings for each chunk of the brochure data
    const embeddings = await Promise.all(
      brochureData.map(async (chunk) => {
        const embedding = await pipeline(chunk.text, {
          pooling: 'mean',
          normalize: true,
        });
        return {
          id: chunk.id,
          values: embedding.tolist()[0], // Convert tensor to array
          metadata: { text: chunk.text }, // Store the original text as metadata
        };
      })
    );

    await index.upsert(embeddings);
    console.log('Data successfully inserted into Pinecone.');
  } catch (error) {
    console.error('Error inserting data into Pinecone:', error);
  }
}

insertIntoPinecone();