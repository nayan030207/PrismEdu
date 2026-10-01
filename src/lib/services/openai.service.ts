import axios from 'axios';

export interface ChatHistoryItem {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface OpenAICompletionOptions {
  systemPrompt: string;
  message: string;
  history?: ChatHistoryItem[];
  model?: string;
  temperature?: number;
  maxTokens?: number;
}

export interface OpenAICompletionResult {
  success: boolean;
  content?: string;
  error?: string;
  isQuotaError?: boolean;
}

/**
 * Robust OpenAI Chat Completion Integration Service
 * Uses process.env.OPENAI_API_KEY to call OpenAI API with graceful fallback.
 */
export async function generateOpenAIChatCompletion(
  options: OpenAICompletionOptions
): Promise<OpenAICompletionResult> {
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey || !apiKey.trim() || apiKey.includes('your-openai-api-key')) {
    return {
      success: false,
      error: 'OPENAI_API_KEY is not configured in environment variables.',
    };
  }

  const cleanKey = apiKey.trim();
  const model = options.model || 'gpt-4o-mini';
  const temperature = options.temperature ?? 0.7;
  const maxTokens = options.maxTokens ?? 800;

  // Format messages list for OpenAI Chat Completion endpoint
  const formattedMessages: Array<{ role: string; content: string }> = [
    { role: 'system', content: options.systemPrompt },
  ];

  if (options.history && Array.isArray(options.history)) {
    // Add up to last 10 turns of history for context
    const recentHistory = options.history.slice(-10);
    recentHistory.forEach((item) => {
      if (item.content && typeof item.content === 'string') {
        formattedMessages.push({
          role: item.role === 'assistant' ? 'assistant' : 'user',
          content: item.content,
        });
      }
    });
  }

  // Add current user message
  formattedMessages.push({
    role: 'user',
    content: options.message,
  });

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${cleanKey}`,
      },
      body: JSON.stringify({
        model,
        messages: formattedMessages,
        temperature,
        max_tokens: maxTokens,
      }),
    });

    const data = await response.json();

    if (response.ok && data?.choices?.[0]?.message?.content) {
      return {
        success: true,
        content: data.choices[0].message.content.trim(),
      };
    }

    // Handle API Error payloads (e.g. quota, invalid key)
    const errorMessage = data?.error?.message || `OpenAI API returned status ${response.status}`;
    const errorCode = data?.error?.code;
    const isQuotaError = errorCode === 'credit_balance_exhausted' || errorCode === 'insufficient_quota';

    console.warn(`[OpenAI Service Warning] ${errorMessage} (code: ${errorCode || 'N/A'})`);

    return {
      success: false,
      error: errorMessage,
      isQuotaError,
    };
  } catch (err: any) {
    console.error('[OpenAI Service Error]:', err?.message || err);
    return {
      success: false,
      error: err?.message || 'Failed to connect to OpenAI API',
    };
  }
}
