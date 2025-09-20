
import { GoogleGenAI, Type } from "@google/genai";
import type { Position, AnalysisResult } from "../types";

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

const analysisSchema = {
  type: Type.OBJECT,
  properties: {
    positiveHabits: {
      type: Type.ARRAY,
      description: "List of observed positive trading habits or patterns, including scaling in/out strategies. Each item should be a concise sentence.",
      items: { type: Type.STRING }
    },
    areasForImprovement: {
      type: Type.ARRAY,
      description: "List of potential biases or negative patterns observed (e.g., FOMO, revenge trading, poor scaling). Each item should be a concise sentence.",
      items: { type: Type.STRING }
    },
    actionableFeedback: {
      type: Type.STRING,
      description: "A summary paragraph providing concrete, actionable advice for improvement based on the analysis. Be encouraging but direct."
    }
  },
  required: ["positiveHabits", "areasForImprovement", "actionableFeedback"]
};


export const analyzeTradingHabits = async (positions: Position[]): Promise<AnalysisResult> => {
  const positionSummaries = positions.map(p => {
    let summary = `\nPosition: ${p.ticker}`;
    
    const totalLotsBought = p.buys.reduce((sum, b) => sum + b.lotSize, 0);
    const totalBuyCost = p.buys.reduce((sum, b) => sum + b.totalBuyPrice, 0);
    const avgBuyPricePerUnit = totalLotsBought > 0 ? totalBuyCost / (totalLotsBought * 100) : 0;

    summary += "\n- Buy Transactions:";
    p.buys.forEach(buy => {
        const reasonText = Array.isArray(buy.buyReason) ? buy.buyReason.join(', ') : buy.buyReason;
        summary += `\n  - Bought ${buy.lotSize} lots on ${buy.buyDate} at RM${buy.buyPrice.toFixed(2)}. Reason: "${reasonText}"`;
    });

    if (p.sells.length > 0) {
      summary += "\n- Sell Transactions:";
      p.sells.forEach(sell => {
        const costOfLotsSold = avgBuyPricePerUnit * sell.lotSize * 100;
        const pl = sell.totalSellPrice - costOfLotsSold;
        const sellDate = new Date(sell.sellDate);
        // Find the latest buy date before this sell for hold duration
        const relevantBuyDate = p.buys
            .map(b => new Date(b.buyDate))
            .filter(d => d <= sellDate)
            .sort((a,b) => b.getTime() - a.getTime())[0] || new Date(p.buys[0].buyDate);

        const holdDuration = Math.max(0, Math.round((sellDate.getTime() - relevantBuyDate.getTime()) / (1000 * 60 * 60 * 24)));
        summary += `\n  - Sold ${sell.lotSize} lots on ${sell.sellDate} for a P/L of RM${pl.toFixed(2)}. Held for approx ${holdDuration} days. Sell Reason: "${sell.sellReason}"`;
        if (sell.notes) {
          summary += `\n    - Lesson Learnt: "${sell.notes}"`;
        }
      });
    } else {
        summary += "\n- Position is still open (no sells yet)."
    }
    return summary;
  }).join('');

  const prompt = `
    You are a professional trading psychologist. Analyze the following trading journal entries and identify behavioral patterns.
    Provide an analysis of the trader's habits based on their reasoning for buying and selling, how they scale in (partial buys) and scale out (partial sells), lot sizes, P/L, and hold durations.
    Also consider their self-reflected "Lesson Learnt" notes, as they provide critical insight into their mindset.
    Do not invent information. Base your analysis strictly on the data provided.
    Focus on the psychological aspects suggested by their reasoning, position sizing, and entry/exit strategies.

    Here are the positions:
    ${positionSummaries}

    Please provide your analysis in the structured JSON format.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: analysisSchema,
      },
    });

    const jsonText = response.text.trim();
    const parsedResult: AnalysisResult = JSON.parse(jsonText);
    return parsedResult;

  } catch (error) {
    console.error("Error calling Gemini API:", error);
    throw new Error("Failed to get analysis from Gemini API.");
  }
};