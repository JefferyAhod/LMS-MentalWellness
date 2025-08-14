import React, { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, Bot, Loader2 } from "lucide-react";

// The import path is kept as '../hooks/useAi.js' as you confirmed its correctness.
// If the error persists after thorough cache clearing, the issue is external to this file's code.
import { useAICounselorChat } from '../hooks/useAi.js'; 

export default function CounselorChat() {
  const { 
    chatHistory, 
    isTyping, 
    error, 
    sendMessage, 
    clearChat 
  } = useAICounselorChat();

  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef(null); 

  useEffect(() => {
    // Scroll to bottom whenever chatHistory or isTyping changes
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatHistory, isTyping]);

  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;

    await sendMessage(newMessage); 
    setNewMessage(''); 
  };

  const formatTimestamp = (date) => {
    if (!date) return '';
    const d = typeof date === 'string' ? new Date(date) : date;
    if (isNaN(d.getTime())) return ''; 
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="w-full flex justify-center p-4"> 
      <Card className="flex flex-col h-[600px] w-full max-w-2xl bg-white dark:bg-gray-800 rounded-lg shadow-xl"> 
        <CardHeader className="border-b border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-xl font-semibold text-gray-900 dark:text-white">
              <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-teal-600 rounded-full flex items-center justify-center shadow-md">
                <Bot className="w-4 h-4 text-white" />
              </div>
              AI Counselor Support
            </CardTitle>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={clearChat}
                className="text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                Clear Chat
              </Button>
            </div>
          </div>
        </CardHeader>

        {/* CardContent is now explicitly flex-col to manage its children's heights */}
        {/* ADDED: overflow-hidden to CardContent to ensure it contains its children properly */}
        <CardContent className="flex flex-col p-0 flex-grow overflow-hidden"> 
          {/* Custom Scrollbar Styles (retained for visual slimness) */}
          <style>{`
            /* For Webkit-based browsers (Chrome, Safari, Edge, Brave) */
            .custom-scrollbar::-webkit-scrollbar {
              width: 8px;
            }
            .custom-scrollbar::-webkit-scrollbar-track {
              background: transparent;
            }
            .custom-scrollbar::-webkit-scrollbar-thumb {
              background-color: #a8a8a8;
              border-radius: 4px;
              border: 2px solid transparent;
              background-clip: padding-box;
            }
            .custom-scrollbar::-webkit-scrollbar-thumb:hover {
              background-color: #888;
            }
            /* For Firefox */
            .custom-scrollbar {
              scrollbar-width: thin;
              scrollbar-color: #a8a8a8 transparent;
            }
          `}</style>
          
          {/* Chat Messages Container */}
          {/* This div uses flex-grow and overflow-y-auto to create the scrollable area */}
          <div className="flex-grow overflow-y-auto p-4 space-y-4 custom-scrollbar"> 
            {chatHistory.map((message, index) => (
              <div
                key={index} 
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[85%] rounded-xl p-3 shadow-sm ${
                    message.role === 'user'
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white'
                  }`}
                >
                  <p className="text-sm md:text-base break-words">{message.content}</p> 
                  <p className={`text-xs mt-1 opacity-75 ${
                    message.role === 'user' ? 'text-blue-100' : 'text-gray-500 dark:text-gray-400'
                  }`}>
                    {formatTimestamp(message.timestamp)}
                  </p>
                </div>
              </div>
            ))}
            {/* Loading indicator for counselor response */}
            {isTyping && (
              <div className="flex justify-start">
                <div className="max-w-[85%] rounded-xl p-3 bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm">
                  <Loader2 className="h-5 w-5 animate-spin text-gray-500" />
                  <span className="ml-2 text-sm">Counselor thinking...</span>
                </div>
              </div>
            )}
            {error && (
              <div className="flex justify-center">
                <p className="text-red-500 text-sm mt-2">{error}</p>
              </div>
            )}
            <div ref={messagesEndRef} /> {/* Scroll target */}
          </div>

          {/* Message Input - now outside the scrollable area but still within CardContent */}
          <div className="border-t border-gray-200 dark:border-gray-700 p-4 shrink-0"> 
            <div className="flex gap-3">
              <Input
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type your message..."
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white"
                disabled={isTyping} 
              />
              <Button 
                onClick={handleSendMessage} 
                disabled={!newMessage.trim() || isTyping}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-md transition-all duration-200 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isTyping ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
              </Button>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 text-center">
              This is an AI-powered demo chat for well-being support. For real professional help, please seek a certified counselor.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
