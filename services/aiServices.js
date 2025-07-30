import axios from 'axios';
import { logger } from '../utilis/logger.js';

export class AIService {
  static async analyzeMessage(messageText) {
    try {
      const prompt = `
Analyze this customer message and provide a JSON response with:
- intent: (inquiry, complaint, compliment, support, sales, other)
- sentiment: (positive, negative, neutral)
- confidence: (0.0 to 1.0)
- urgency: (low, medium, high)
- category: (product_question, pricing, support, complaint, general)

Message: "${messageText}"

Respond only with valid JSON:
`;

      const response = await axios.post(`${process.env.OLLAMA_BASE_URL}/api/generate`, {
        model: process.env.OLLAMA_MODEL,
        prompt: prompt,
        stream: false,
        format: 'json'
      });

      const analysis = JSON.parse(response.data.response);
      logger.info(`Message analyzed: ${JSON.stringify(analysis)}`);
      return analysis;
    } catch (error) {
      logger.error('AI analysis failed:', error);
      return {
        intent: 'other',
        sentiment: 'neutral',
        confidence: 0.3,
        urgency: 'medium',
        category: 'general'
      };
    }
  }

  static async generateResponse(messageText, analysis) {
    try {
      const prompt = `
You are a helpful customer service representative. Generate a professional, friendly response to this customer message.

Customer message: "${messageText}"
Intent: ${analysis.intent}
Sentiment: ${analysis.sentiment}
Category: ${analysis.category}

Guidelines:
- Be professional and friendly
- Address their specific concern
- Keep it concise (under 200 words)
- If you need more information, ask specific questions
- If it's a complaint, acknowledge and show empathy

Response:
`;

      const response = await axios.post(`${process.env.OLLAMA_BASE_URL}/api/generate`, {
        model: process.env.OLLAMA_MODEL,
        prompt: prompt,
        stream: false
      });

      const responseText = response.data.response.trim();
      
      return {
        text: responseText,
        confidence: analysis.confidence,
        generatedAt: new Date().toISOString()
      };
    } catch (error) {
      logger.error('Response generation failed:', error);
      return {
        text: "Thank you for your message. We'll get back to you soon!",
        confidence: 0.5,
        generatedAt: new Date().toISOString()
      };
    }
  }
}