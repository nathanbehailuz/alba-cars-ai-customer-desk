export const INTENTS = [
  {
    id: "buy",
    label: "Buy a car",
    category: "vehicle_purchase",
    prompt: "Tell us the make, model, budget, or features you are looking for.",
  },
  {
    id: "sell",
    label: "Sell or trade in my car",
    category: "trade_in",
    prompt: "Tell us your car's make, model, year, mileage, and condition.",
  },
  {
    id: "test_drive",
    label: "Book a test drive",
    category: "test_drive",
    prompt: "Which vehicle would you like to test-drive, and when?",
  },
  {
    id: "financing",
    label: "Ask about financing",
    category: "financing",
    prompt: "Which vehicle are you interested in, and what would you like to know?",
  },
  {
    id: "find",
    label: "Help me find a car",
    category: "vehicle_search",
    prompt: "Tell us your budget, preferred body type, and must-have features.",
  },
  {
    id: "question",
    label: "Ask a question",
    category: "general_sales_question",
    prompt: "What would you like to know about our vehicles or buying process?",
  },
] as const;

export type IntentId = (typeof INTENTS)[number]["id"];
export type ReplyChannel = "email" | "whatsapp" | "both";

export type InquiryPayload = {
  submission_id: string;
  intent: IntentId;
  category_seed: string;
  name?: string;
  email?: string;
  phone?: string;
  preferred_channel: ReplyChannel;
  message?: string;
  contact_consent: boolean;
  whatsapp_consent: boolean;
  voice_consent: boolean;
  page_context: {
    source: string;
    page_url: string;
    page_type: string;
    vehicle_id?: string;
    vehicle_name?: string;
    filters?: Record<string, string>;
    submitted_at: string;
  };
};
