/**
 * Server-side Gemini AI Client Configuration
 * Uses @google/genai TypeScript SDK with required telemetry headers.
 */
import { GoogleGenAI } from '@google/genai';

let aiClient: GoogleGenAI | null = null;

export function getGeminiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
    return null;
  }

  if (!aiClient) {
    aiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }

  return aiClient;
}

export async function generateBusinessAssistantResponse(params: {
  businessName: string;
  category: string;
  services: string[];
  products: string[];
  businessHours: string;
  supportEmail: string;
  whatsappHandoffNumber: string;
  customInstructions: string;
  userMessage: string;
  chatHistory: Array<{ role: 'user' | 'assistant'; text: string }>;
}): Promise<{ text: string; source: 'gemini' | 'rules_engine' }> {
  const ai = getGeminiClient();

  const systemInstruction = `You are the official AI Business Assistant representing "${params.businessName}", a verified business listed on GOYE Web3 Business Hub.
Business Domain: ${params.category}
Verified Services: ${params.services.join(', ')}
Verified Products: ${params.products.join(', ')}
Operational Hours: ${params.businessHours}
Support Contact: ${params.supportEmail}
WhatsApp Escalation Number: ${params.whatsappHandoffNumber}
Custom Directives: ${params.customInstructions}

CRITICAL RULES:
1. Speak in a confident, polished, and factual tone suitable for modern commerce.
2. Only make factual statements regarding the business's listed services, products, and operational parameters.
3. If an inquiry is outside the verified information or asks about details you do not know, clearly state: "I do not have verified records on that specific topic in our profile. Would you like me to connect you with our human team at ${params.supportEmail} or via WhatsApp at ${params.whatsappHandoffNumber}?"
4. Do NOT promise investment returns, crypto profits, or claim unverified certifications.
5. Offer to capture their name and email for our business team to follow up.
6. Keep answers concise, clear, and actionable.`;

  if (ai) {
    try {
      const contents = params.chatHistory.map((item) => ({
        role: item.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: item.text }],
      }));

      contents.push({
        role: 'user',
        parts: [{ text: params.userMessage }],
      });

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents,
        config: {
          systemInstruction,
          temperature: 0.7,
        },
      });

      const text = response.text || 'Thank you for your inquiry. Our team is available to assist you.';
      return { text, source: 'gemini' };
    } catch (err: unknown) {
      console.warn('Gemini API call failed, falling back to business rules engine:', err);
    }
  }

  // Graceful rule-based domain response when API key is not yet configured or offline
  const query = params.userMessage.toLowerCase();
  let text = '';

  if (query.includes('service') || query.includes('offer') || query.includes('do you do')) {
    text = `At ${params.businessName}, our verified services include:\n• ${params.services.join('\n• ')}\n\nWould you like a formal quotation or to discuss a specific project scope?`;
  } else if (query.includes('product') || query.includes('pricing') || query.includes('cost') || query.includes('price')) {
    text = `Our catalog features:\n• ${params.products.join('\n• ')}\n\nPricing depends on your specific delivery milestones and volume. You can reach our commercial team directly at ${params.supportEmail} or via WhatsApp at ${params.whatsappHandoffNumber}.`;
  } else if (query.includes('hour') || query.includes('open') || query.includes('time')) {
    text = `Our operational hours are ${params.businessHours}. Outside these hours, inquiries are logged and answered the next business morning.`;
  } else if (query.includes('contact') || query.includes('whatsapp') || query.includes('phone') || query.includes('email')) {
    text = `You can connect with us directly:\n• Email: ${params.supportEmail}\n• WhatsApp: ${params.whatsappHandoffNumber}\n\nYou may also submit your inquiry through our portal lead capture for an expedited callback.`;
  } else {
    text = `Thank you for contacting ${params.businessName}. We specialize in ${params.category}, specifically offering ${params.services.slice(0, 2).join(' and ')}. How can we assist your business goals today? (You may also contact human support directly at ${params.supportEmail}).`;
  }

  return { text, source: 'rules_engine' };
}
