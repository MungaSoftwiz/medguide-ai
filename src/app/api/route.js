import { Pinecone as PineconeClient } from '@pinecone-database/pinecone';
import OpenAI from 'openai';
import 'dotenv/config';
import PipelineSingleton from './pipeline';

const PINECONE_API_KEY = process.env.PINECONE_API_KEY;
const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;

export async function POST(req) {
  try {
    const pinecone = new PineconeClient({
      apiKey: PINECONE_API_KEY,
    });

    const index = pinecone.Index('medguide-ai');

    const body = await req.json();
    const query = body.query || '';
    console.log('Query:', query);

    const pipeline = await PipelineSingleton.getInstance();

    // Convert the query into an embedding
    const query_embedded = await pipeline(query, {
      pooling: 'mean',
      normalize: true,
    });
    const query_embedded_array = query_embedded.tolist()[0];
    console.log('Query embedded array:', query_embedded_array);
    console.log('Size is', query_embedded_array.length);

    // Query Pinecone for relevant matches
    const response = await index.query({
      topK: 5,
      vector: query_embedded_array,
      includeValues: true,
      includeMetadata: true,
    });

    console.log('Pinecone response:', response);

    // Create a context string from the retrieved matches
    let contextString;
    if (response.matches.length > 0) {
      contextString = response.matches
        .map((match) => match.metadata.text || 'No content available')
        .join('\n\n');
    } else {
      contextString = 'No relevant knowledge found.';
    }
    console.log('Context created:', contextString);

    // Generate the system prompt for the model with multi-step prompting
    const prompt = `You are an assistant for answering questions about MedGuide Hospital, a premier healthcare facility in Nairobi, Kenya. Your goal is to provide accurate, concise, and helpful information about the hospital's services, specialties, staff, amenities, and other relevant details:

When answering questions:
1. Use the provided knowledge (context) to answer the question. If the knowledge does not contain the answer, say "I don't know."
2. Keep your answers concise and to the point (maximum 2-3 sentences).
3. If the answer involves a list, format each item on its own line for clarity.
4. Use simple and clear language. Avoid overly complex medical terms unless necessary.
5. If the user says "thank you" or "no more questions," respond politely and conclude the conversation.
6. If the user asks a question unrelated to MedGuide Hospital, politely inform them that you can only answer questions about the hospital.

Always prioritize accuracy and professionalism in your responses.

Here is an example of how to answer a question:

Q: "What amenities does MedGuide Hospital offer?"
A: "MedGuide Hospital offers the following amenities:
- Comfortable private and semi-private rooms
- Free Wi-Fi
- Cafeteria with healthy meals
- Secure parking
- Prayer room"

Context:
${contextString}

Question: ${query}`;

    console.log('Prompt generated:', prompt);

    const openai = new OpenAI({
      apiKey: OPENROUTER_API_KEY,
      baseURL: 'https://openrouter.ai/api/v1',
    });
    console.log('OpenAI model defined');

    try {
      const completion = await openai.chat.completions.create({
        model: 'meta-llama/llama-3.3-70b-instruct:free',
        messages: [{ role: 'system', content: prompt }],
        stream: true,
      });

      // Create a ReadableStream for streaming the response
      const responseStream = new ReadableStream({
        async start(controller) {
          try {
            for await (const chunk of completion) {
              const content = chunk.choices[0]?.delta?.content || '';
              controller.enqueue(new TextEncoder().encode(content));
            }
            controller.close();
          } catch (error) {
            console.error('Error in streaming response:', error);
            controller.error(error);
          }
        },
      });

      return new Response(responseStream, {
        headers: { 'Content-Type': 'text/plain' },
      });
    } catch (streamError) {
      console.error('Streaming failed, falling back to non-streaming:', streamError);

      const completion = await openai.chat.completions.create({
        model: 'meta-llama/llama-3.3-70b-instruct:free',
        messages: [{ role: 'system', content: prompt }],
        stream: false,
      });

      const content = completion.choices[0]?.message?.content || 'No response from the model.';
      return new Response(content, {
        headers: { 'Content-Type': 'text/plain' },
      });
    }
  } catch (error) {
    console.error('Error in POST function:', error);
    return new Response('Internal Server Error', { status: 500 });
  }
}