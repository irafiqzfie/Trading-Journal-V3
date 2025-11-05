
import { GoogleGenAI } from "@google/genai";
import { NextResponse } from 'next/server';

const API_KEY = process.env.GEMINI_API_KEY;

if (!API_KEY) {
  console.error("GEMINI_API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: API_KEY! });

// Helper to create a readable stream from an async iterator
function iteratorToStream(iterator: AsyncGenerator<any>) {
    const encoder = new TextEncoder();
    return new ReadableStream({
        async pull(controller) {
            try {
                const { value, done } = await iterator.next();
                if (done) {
                    controller.close();
                } else {
                    controller.enqueue(encoder.encode(value.text));
                }
            } catch(e) {
                controller.error(e)
            }
        },
    });
}

export async function POST(request: Request) {
    if (!API_KEY) {
        return NextResponse.json({ error: 'Server is not configured with an API key.' }, { status: 500 });
    }

    try {
        const { ticker, buyReasons, chartImage } = await request.json();

        if (!ticker || !buyReasons || !chartImage) {
            return NextResponse.json({ error: 'Ticker, buy reasons, and chart image are required.' }, { status: 400 });
        }
        
        // Data URL format: "data:image/png;base64,iVBORw0KGgo..."
        const match = chartImage.match(/^data:(image\/.+);base64,(.+)$/);
        if (!match) {
            return NextResponse.json({ error: 'Invalid image format. Expected a data URL.' }, { status: 400 });
        }
        
        const mimeType = match[1];
        const base64Data = match[2];

        const prompt = `
You are an expert trading analyst providing a "second opinion" on a trade setup.
Your tone should be objective, balanced, and educational, like a mentor.
Do not give direct financial advice to buy or sell.
Analyze the provided chart image and the trader's stated reasons for entry.
Provide a concise analysis in Markdown format.

**Ticker:** ${ticker.toUpperCase()}
**Stated Buy Reasons:** ${buyReasons.join(', ')}

Based on the chart and reasons, provide the following:
- **Strengths:** 2-3 bullet points on what looks promising about this setup.
- **Potential Risks:** 2-3 bullet points on potential weaknesses, risks, or things to watch out for.
- **Key Level to Watch:** Identify one critical price level (e.g., support, resistance, breakout point) and explain its significance.

Keep the entire analysis brief and to the point.
        `;

        const imagePart = {
            inlineData: {
                mimeType: mimeType,
                data: base64Data,
            },
        };

        const textPart = {
            text: prompt,
        };

        const responseStream = await ai.models.generateContentStream({
            model: 'gemini-2.5-flash',
            contents: { parts: [textPart, imagePart] },
        });

        const stream = iteratorToStream(responseStream);
        return new Response(stream);

    } catch (error) {
        console.error("Error in second-opinion API route:", error);
        return NextResponse.json({ error: 'Failed to get analysis from the AI service.' }, { status: 500 });
    }
}
