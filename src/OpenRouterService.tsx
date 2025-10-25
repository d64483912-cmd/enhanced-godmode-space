import { ISettings } from "./Agent";

export interface OpenRouterModel {
  id: string;
  name: string;
  description: string;
  pricing: {
    prompt: string;
    completion: string;
  };
  context_length: number;
  architecture: {
    modality: string;
    tokenizer: string;
    instruct_type?: string;
  };
  top_provider: {
    max_completion_tokens?: number;
    is_moderated: boolean;
  };
  per_request_limits?: {
    prompt_tokens: string;
    completion_tokens: string;
  };
}

// Free models available on OpenRouter
export const FREE_MODELS: OpenRouterModel[] = [
  {
    id: "deepseek/deepseek-chat-v3.1:free",
    name: "DeepSeek V3.1 (Free)",
    description: "DeepSeek V3.1 is a large hybrid reasoning model (671B parameters, 37B active) that supports both thinking and non-thinking modes.",
    pricing: { prompt: "$0", completion: "$0" },
    context_length: 164000,
    architecture: { modality: "text", tokenizer: "deepseek" },
    top_provider: { is_moderated: false }
  },
  {
    id: "deepseek/deepseek-r1:free",
    name: "DeepSeek R1 (Free)",
    description: "DeepSeek R1 with performance on par with OpenAI o1, but open-sourced and with fully open reasoning tokens.",
    pricing: { prompt: "$0", completion: "$0" },
    context_length: 164000,
    architecture: { modality: "text", tokenizer: "deepseek" },
    top_provider: { is_moderated: false }
  },
  {
    id: "deepseek/deepseek-chat-v3-0324:free",
    name: "DeepSeek V3 (Free)",
    description: "DeepSeek V3, a 685B-parameter, mixture-of-experts model, latest iteration of the flagship chat model family.",
    pricing: { prompt: "$0", completion: "$0" },
    context_length: 164000,
    architecture: { modality: "text", tokenizer: "deepseek" },
    top_provider: { is_moderated: false }
  },
  {
    id: "tngtech/deepseek-r1t2-chimera:free",
    name: "DeepSeek R1T2 Chimera (Free)",
    description: "The checkpoint supports contexts up to 60k tokens and maintains consistent reasoning token behaviour.",
    pricing: { prompt: "$0", completion: "$0" },
    context_length: 164000,
    architecture: { modality: "text", tokenizer: "deepseek" },
    top_provider: { is_moderated: false }
  },
  {
    id: "zai/glm-4.5-air:free",
    name: "GLM 4.5 Air (Free)",
    description: "GLM 4.5 Air is a fast and efficient model for general-purpose tasks.",
    pricing: { prompt: "$0", completion: "$0" },
    context_length: 128000,
    architecture: { modality: "text", tokenizer: "glm" },
    top_provider: { is_moderated: false }
  }
];

export class OpenRouterService {
  private apiKey: string;
  private baseUrl = "https://openrouter.ai/api/v1";

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async chatCompletion(
    model: string,
    messages: Array<{ role: string; content: string }>,
    options: {
      temperature?: number;
      max_tokens?: number;
      top_p?: number;
      stream?: boolean;
    } = {}
  ) {
    const response = await fetch(`${this.baseUrl}/chat/completions`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${this.apiKey}`,
        "Content-Type": "application/json",
        "HTTP-Referer": window.location.origin,
        "X-Title": "Godmode Enhanced"
      },
      body: JSON.stringify({
        model,
        messages,
        temperature: options.temperature || 0.7,
        max_tokens: options.max_tokens || 2000,
        top_p: options.top_p || 1,
        stream: options.stream || false
      })
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: { message: "Unknown error" } }));
      throw new Error(error.error?.message || `HTTP ${response.status}`);
    }

    return response.json();
  }

  async getModels(): Promise<OpenRouterModel[]> {
    try {
      const response = await fetch(`${this.baseUrl}/models`, {
        headers: {
          "Authorization": `Bearer ${this.apiKey}`,
          "Content-Type": "application/json"
        }
      });

      if (!response.ok) {
        // Return free models if API call fails
        return FREE_MODELS;
      }

      const data = await response.json();
      return data.data || FREE_MODELS;
    } catch (error) {
      console.warn("Failed to fetch models from OpenRouter, using free models:", error);
      return FREE_MODELS;
    }
  }

  static getFreeModels(): OpenRouterModel[] {
    return FREE_MODELS;
  }

  static isValidApiKey(apiKey: string): boolean {
    return !!(apiKey && apiKey.startsWith("sk-or-") && apiKey.length > 20);
  }

  async validateApiKey(): Promise<boolean> {
    try {
      const response = await this.chatCompletion(
        "deepseek/deepseek-chat-v3.1:free",
        [{ role: "user", content: "Hello" }],
        { max_tokens: 5 }
      );
      return !!response.choices?.[0]?.message?.content;
    } catch (error) {
      console.error("API key validation failed:", error);
      return false;
    }
  }
}

export function createOpenRouterService(settings: ISettings): OpenRouterService | null {
  if (!settings.openRouterKey || !settings.useOpenRouter) {
    return null;
  }
  return new OpenRouterService(settings.openRouterKey);
}