'use client';

import * as React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Send, Bot, User, Sparkles, Copy, Check, ShieldAlert } from 'lucide-react';

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  topic?: string;
  engine?: string;
  errorNotice?: string;
}

interface ChatWindowProps {
  agentType: 'learning' | 'support';
  title: string;
  subtitle: string;
  suggestedQuestions?: string[];
  endpoint: string;
  privacyNotice?: string;
}

export function ChatWindow({
  agentType,
  title,
  subtitle,
  suggestedQuestions = [],
  endpoint,
  privacyNotice,
}: ChatWindowProps) {
  const [messages, setMessages] = React.useState<ChatMessage[]>([]);
  const [input, setInput] = React.useState('');
  const [isLoading, setIsLoading] = React.useState(false);
  const [copiedIndex, setCopiedIndex] = React.useState<number | null>(null);
  const messagesEndRef = React.useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  React.useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSend = async (messageText?: string) => {
    const textToSend = messageText || input;
    if (!textToSend.trim() || isLoading) return;

    const userMessage: ChatMessage = { role: 'user', content: textToSend };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: textToSend,
          history: messages.map((m) => ({ role: m.role, content: m.content })),
        }),
      });

      const data = await res.json();
      if (res.ok && data.response) {
        setMessages((prev) => [
          ...prev,
          {
            role: 'assistant',
            content: data.response,
            topic: data.topic,
            engine: data.engine,
            errorNotice: data.errorNotice,
          },
        ]);
      } else {
        throw new Error(data.error || 'Failed to get answer');
      }
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: `Unable to process request: ${err.message || 'Connection error'}. Please try again.`,
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <div className="flex flex-col h-[650px] bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
      {/* Chat Header */}
      <div className="p-4 border-b border-slate-200 bg-slate-50/70 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div
            className={`h-10 w-10 rounded-xl flex items-center justify-center text-white shadow-xs ${
              agentType === 'learning' ? 'bg-indigo-600' : 'bg-emerald-600'
            }`}
          >
            <Bot className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-bold text-sm text-slate-900 leading-tight">{title}</h3>
            <p className="text-xs text-slate-500">{subtitle}</p>
          </div>
        </div>

      </div>

      {/* Privacy Notice Banner */}
      {privacyNotice && (
        <div className="px-4 py-2 bg-amber-50/80 border-b border-amber-100 flex items-center gap-2 text-[11px] text-amber-800">
          <ShieldAlert className="h-3.5 w-3.5 shrink-0 text-amber-600" />
          <span>{privacyNotice}</span>
        </div>
      )}

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col justify-center items-center text-center p-6">
            <div
              className={`h-12 w-12 rounded-full flex items-center justify-center mb-3 ${
                agentType === 'learning' ? 'bg-indigo-50 text-indigo-600' : 'bg-emerald-50 text-emerald-600'
              }`}
            >
              <Bot className="h-6 w-6" />
            </div>
            <h4 className="text-base font-semibold text-slate-800">
              {agentType === 'learning'
                ? 'Ask Any Academic Doubt or Syllabus Question'
                : 'Need Guidance or Connecting to Campus Support?'}
            </h4>
            <p className="text-xs text-slate-500 max-w-sm mt-1">
              {agentType === 'learning'
                ? 'Answers are grounded in official course materials, lecture notes, and engineering curriculum.'
                : 'Feel free to ask about on-campus counsellors, student wellness, or academic support facilities.'}
            </p>

            {suggestedQuestions.length > 0 && (
              <div className="mt-6 w-full max-w-md">
                <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2">
                  Suggested topics:
                </div>
                <div className="flex flex-wrap gap-2 justify-center">
                  {suggestedQuestions.map((q, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSend(q)}
                      className="text-xs text-left px-3 py-1.5 rounded-lg border border-slate-200 bg-slate-50/60 hover:bg-indigo-50 hover:border-indigo-200 hover:text-indigo-700 transition-colors text-slate-700"
                    >
                      {q}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          messages.map((m, idx) => {
            const isUser = m.role === 'user';
            return (
              <div
                key={idx}
                className={`flex gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}
              >
                {!isUser && (
                  <div
                    className={`h-8 w-8 rounded-lg flex items-center justify-center text-white shrink-0 mt-0.5 ${
                      agentType === 'learning' ? 'bg-indigo-600' : 'bg-emerald-600'
                    }`}
                  >
                    <Bot className="h-4 w-4" />
                  </div>
                )}
                <div
                  className={`relative max-w-[85%] rounded-xl px-4 py-3 text-sm shadow-xs ${
                    isUser
                      ? 'bg-indigo-600 text-white rounded-br-none'
                      : 'bg-slate-50 border border-slate-200 text-slate-900 rounded-bl-none'
                  }`}
                >
                  <div className="whitespace-pre-wrap leading-relaxed font-normal">
                    {m.content}
                  </div>
                  {!isUser && (
                    <div className="mt-2 pt-2 border-t border-slate-200/60 flex items-center justify-between text-[11px] text-slate-400">
                      <span>{m.engine ? `${m.engine} • ${m.topic || 'General'}` : (m.topic || 'Academic Guidance')}</span>
                      <button
                        onClick={() => copyToClipboard(m.content, idx)}
                        className="hover:text-slate-600 transition-colors flex items-center gap-1"
                      >
                        {copiedIndex === idx ? (
                          <>
                            <Check className="h-3 w-3 text-emerald-600" />
                            <span className="text-emerald-600 font-medium">Copied</span>
                          </>
                        ) : (
                          <>
                            <Copy className="h-3 w-3" />
                            <span>Copy</span>
                          </>
                        )}
                      </button>
                    </div>
                  )}
                </div>
                {isUser && (
                  <div className="h-8 w-8 rounded-lg bg-slate-200 flex items-center justify-center text-slate-700 shrink-0 mt-0.5">
                    <User className="h-4 w-4" />
                  </div>
                )}
              </div>
            );
          })
        )}

        {isLoading && (
          <div className="flex gap-3 items-center text-slate-400 text-xs">
            <div className="h-8 w-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center animate-pulse">
              <Bot className="h-4 w-4" />
            </div>
            <div className="flex items-center gap-1 bg-slate-100 px-3 py-2 rounded-xl">
              <span className="h-1.5 w-1.5 rounded-full bg-slate-400 animate-bounce" />
              <span className="h-1.5 w-1.5 rounded-full bg-slate-400 animate-bounce [animation-delay:0.2s]" />
              <span className="h-1.5 w-1.5 rounded-full bg-slate-400 animate-bounce [animation-delay:0.4s]" />
              <span className="ml-2">Synthesizing curriculum answer...</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Form */}
      <div className="p-3 border-t border-slate-200 bg-white">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="flex items-center gap-2"
        >
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={
              agentType === 'learning'
                ? 'Type your academic doubt (e.g. "Explain 3NF vs BCNF")...'
                : 'Ask a support question or ask about counsellor hours...'
            }
            disabled={isLoading}
            className="flex-1 bg-slate-50/50"
          />
          <Button type="submit" disabled={!input.trim() || isLoading} isLoading={isLoading}>
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </div>
    </div>
  );
}
