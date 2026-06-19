/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from 'react';
import { useMetro } from '../../contexts/MetroContext';
import { Button } from '../atoms/Button';
import { Send, Sparkles, Bot, User, Trash2, HelpCircle } from 'lucide-react';

interface AssistantChatProps {
  id?: string;
  className?: string;
}

export const AssistantChat: React.FC<AssistantChatProps> = ({
  id,
  className = ''
}) => {
  const { chatHistory, sendChatMessage, clearChat } = useMetro();
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Auto scroll to latest chat bubble without scrolling the outer window
  const scrollToBottom = () => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatHistory, isTyping]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    sendChatMessage(inputText);
    setInputText('');
    
    // Simulate thinking state
    setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);
    }, 750);
  };

  const handleSuggestionClick = (suggestion: string) => {
    sendChatMessage(suggestion);
    
    setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);
    }, 750);
  };

  return (
    <div id={id} className={`bg-white border border-slate-100 rounded-xl shadow-xs flex flex-col overflow-hidden h-[450px] md:h-[500px] ${className}`}>
      
      {/* Dynamic header of Chatbot */}
      <div className="bg-linear-to-r from-violet-600 to-indigo-600 text-white px-4 py-3.5 flex items-center justify-between shadow-xs">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-white/10 rounded-lg backdrop-blur-xs">
            <Bot className="w-5 h-5 text-violet-100 animate-bounce" style={{ animationDuration: '3s' }} />
          </div>
          <div>
            <h4 className="font-bold text-sm leading-tight flex items-center gap-1">
              Asistente MetroFlow AI
              <Sparkles className="w-3.5 h-3.5 text-yellow-300 fill-yellow-300" />
            </h4>
            <span className="text-[10px] text-violet-100/90 font-medium">Soporte y rutas inteligentes</span>
          </div>
        </div>

        <button
          onClick={clearChat}
          title="Reiniciar conversación"
          className="p-1.5 text-violet-150 hover:text-white hover:bg-white/10 rounded-lg transition"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      {/* Messages list area */}
      <div ref={containerRef} className="flex-1 overflow-y-auto p-4 space-y-3.5 bg-slate-50/50">
        {chatHistory.map((msg, index) => {
          const isAi = msg.sender === 'ai';
          return (
            <div 
              key={msg.id || index} 
              className={`flex gap-2.5 max-w-[85%] ${isAi ? 'mr-auto' : 'ml-auto flex-row-reverse'}`}
            >
              <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 text-white font-bold shadow-xs ${
                isAi ? 'bg-linear-to-br from-violet-500 to-indigo-500' : 'bg-blue-600'
              }`}>
                {isAi ? <Bot className="w-4.5 h-4.5" /> : <User className="w-4.5 h-4.5" />}
              </div>

              <div className="space-y-1">
                <div className={`p-3 rounded-2xl text-xs leading-relaxed border shadow-3xs ${
                  isAi 
                    ? 'bg-white text-slate-700 border-slate-100 rounded-tl-none' 
                    : 'bg-blue-600 text-white border-blue-500 rounded-tr-none'
                }`}>
                  {/* Parsing simple bold markdown **text** */}
                  {msg.text.split('\n').map((paragraph, pIdx) => (
                    <p key={pIdx} className={pIdx > 0 ? 'mt-1' : ''}>
                      {paragraph.split('**').map((chunk, cIdx) => {
                        if (cIdx % 2 === 1) {
                          return <strong key={cIdx} className={isAi ? "text-slate-900 font-extrabold" : "text-white font-extrabold"}>{chunk}</strong>;
                        }
                        return chunk;
                      })}
                    </p>
                  ))}
                </div>
                
                {/* Micro timestamps */}
                <span className={`text-[10px] text-slate-400 block px-1 ${!isAi && 'text-right'}`}>
                  {msg.timestamp}
                </span>

                {/* Suggestions embedded inside message */}
                {isAi && msg.suggestions && msg.suggestions.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-1.5 max-w-full">
                    {msg.suggestions.map((sug, sIdx) => (
                      <button
                        key={sIdx}
                        onClick={() => handleSuggestionClick(sug)}
                        className="text-[10px] px-2.5 py-1 rounded-full bg-violet-50 hover:bg-violet-100 text-violet-700 font-semibold border border-violet-150 transition-all duration-150 text-left truncate active:scale-95"
                      >
                        {sug}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {isTyping && (
          <div className="flex gap-2.5 max-w-[80%] mr-auto">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center bg-linear-to-br from-violet-500 to-indigo-500 text-white shadow-xs">
              <Bot className="w-4.5 h-4.5 animate-[ping_2s_infinite]" />
            </div>
            <div className="bg-white border border-slate-100 p-3 rounded-2xl rounded-tl-none flex items-center gap-1 shadow-3xs">
              <span className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-bounce" style={{ animationDelay: '0ms' }} />
              <span className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-bounce" style={{ animationDelay: '150ms' }} />
              <span className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
          </div>
        )}
      </div>

      {/* Footer message editor */}
      <form onSubmit={handleSubmit} className="border-t border-slate-100 p-3 bg-white flex gap-2">
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="Ej: ¿Hay algún retraso en la ruta R3?"
          className="flex-1 px-3 py-2 border border-slate-200 rounded-lg text-xs font-semibold text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-500 bg-slate-50/50"
        />
        
        <Button
          type="submit"
          variant="intelligence"
          size="sm"
          className="px-3"
          icon={<Send className="w-4 h-4" />}
        >
          Enviar
        </Button>
      </form>
    </div>
  );
};
