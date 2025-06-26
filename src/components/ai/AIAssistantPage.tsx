import React, { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { Send, Bot, User, ThumbsUp, ThumbsDown, Copy } from "lucide-react";
import toast from "react-hot-toast";
import { judgeConflict } from "../../api/aijudgment/aiJudgment";

interface Message {
  id: string;
  type: "user" | "ai";
  content: string;
  timestamp: Date;
  rating?: "up" | "down" | null;
}

const AIAssistantPage: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      type: "ai",
      content:
        "안녕하세요! 저는 우리.zip AI 도우미입니다. 하우스메이트 생활에서 궁금한 것이 있으시면 언제든 물어보세요! 🏠✨",
      timestamp: new Date(),
      rating: null,
    },
  ]);
  const [inputMessage, setInputMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [shouldAutoScroll, setShouldAutoScroll] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (shouldAutoScroll) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, shouldAutoScroll]);

  const handleScroll = () => {
    if (messagesContainerRef.current) {
      const { scrollTop, scrollHeight, clientHeight } =
        messagesContainerRef.current;
      setShouldAutoScroll(scrollHeight - scrollTop - clientHeight < 50);
    }
  };

  const handleSendMessage = async (content: string) => {
    if (!content.trim()) {
      toast.error("메시지를 입력해주세요.");
      return;
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      type: "user",
      content,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputMessage("");
    setIsTyping(true);
    setShouldAutoScroll(true);

    try {
      const response = await judgeConflict(content);
      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        type: "ai",
        content: response.judgmentResult,
        timestamp: new Date(),
        rating: null,
      };
      setMessages((prev) => [...prev, aiResponse]);
    } catch (error: any) {
      toast.error(error.message || "AI 응답을 받아오는 데 실패했습니다.");
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          type: "ai",
          content:
            "죄송합니다. AI 응답을 받아오는 데 문제가 발생했습니다. 다시 시도해 주세요.",
          timestamp: new Date(),
          rating: null,
        },
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleRating = (messageId: string, rating: "up" | "down") => {
    setMessages((prev) =>
      prev.map((msg) =>
        msg.id === messageId
          ? { ...msg, rating: msg.rating === rating ? null : rating }
          : msg
      )
    );
  };

  const handleCopy = async (content: string) => {
    try {
      await navigator.clipboard.writeText(content);
      toast.success("메시지가 복사되었습니다!");
    } catch {
      toast.error("복사에 실패했습니다.");
    }
  };

  return (
    <div className="fixed inset-0 top-20 flex flex-col bg-gray-50 overflow-hidden">
      <div className="flex-1 flex flex-col max-w-7xl mx-auto w-full px-6 lg:px-8 py-8">
        {/* 헤더 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="bg-gradient-to-r from-primary-500 to-primary-600 rounded-2xl p-6 text-white mb-6 flex-shrink-0"
        >
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
              <Bot className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">AI 판단 도우미</h1>
              <p className="text-primary-100">
                하우스메이트 생활의 똑똑한 조언자
              </p>
            </div>
          </div>
        </motion.div>

        {/* 채팅 UI */}
        <div
          className="flex-1 bg-white rounded-xl border border-gray-200 flex flex-col overflow-hidden"
          style={{
            height: "calc(100vh - 280px)",
            maxHeight: "calc(100vh - 280px)",
            minHeight: "calc(100vh - 280px)",
          }}
        >
          <div
            ref={messagesContainerRef}
            onScroll={handleScroll}
            className="flex-1 overflow-y-auto p-4 space-y-4"
            style={{
              height: "calc(100% - 80px)",
              maxHeight: "calc(100% - 80px)",
            }}
          >
            {messages.map((message) => (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className={`flex ${
                  message.type === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`flex items-start space-x-3 max-w-[80%] ${
                    message.type === "user"
                      ? "flex-row-reverse space-x-reverse"
                      : ""
                  }`}
                >
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                      message.type === "user"
                        ? "bg-primary-600 text-white"
                        : "bg-gradient-to-r from-primary-500 to-primary-600 text-white"
                    }`}
                  >
                    {message.type === "user" ? (
                      <User className="w-4 h-4" />
                    ) : (
                      <Bot className="w-4 h-4" />
                    )}
                  </div>
                  <div
                    className={`rounded-2xl px-4 py-3 ${
                      message.type === "user"
                        ? "bg-primary-600 text-white"
                        : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    <div className="whitespace-pre-wrap text-sm leading-relaxed break-words">
                      {message.content}
                    </div>
                    {message.type === "ai" && (
                      <div className="flex items-center space-x-2 mt-3 pt-2 border-t border-gray-200">
                        <motion.button
                          className={`p-1 rounded transition-colors ${
                            message.rating === "up"
                              ? "bg-green-500 text-white"
                              : "hover:bg-gray-200 text-gray-500"
                          }`}
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => handleRating(message.id, "up")}
                        >
                          <ThumbsUp className="w-3 h-3" />
                        </motion.button>
                        <motion.button
                          className={`p-1 rounded transition-colors ${
                            message.rating === "down"
                              ? "bg-red-500 text-white"
                              : "hover:bg-gray-200 text-gray-500"
                          }`}
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => handleRating(message.id, "down")}
                        >
                          <ThumbsDown className="w-3 h-3" />
                        </motion.button>
                        <motion.button
                          className="p-1 rounded hover:bg-gray-200 transition-colors text-gray-500"
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => handleCopy(message.content)}
                        >
                          <Copy className="w-3 h-3" />
                        </motion.button>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
            {isTyping && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex justify-start"
              >
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-gradient-to-r from-primary-500 to-primary-600 rounded-full flex items-center justify-center text-white">
                    <Bot className="w-4 h-4" />
                  </div>
                  <div className="bg-gray-100 rounded-2xl px-4 py-3">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                      <div
                        className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                        style={{ animationDelay: "0.1s" }}
                      ></div>
                      <div
                        className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                        style={{ animationDelay: "0.2s" }}
                      ></div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* 입력창 */}
          <div
            className="border-t border-gray-200 p-4 flex-shrink-0"
            style={{ height: "80px" }}
          >
            <div className="flex items-center space-x-3">
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={(e) =>
                  e.key === "Enter" && handleSendMessage(inputMessage)
                }
                placeholder="궁금한 것을 물어보세요..."
                className="flex-1 px-4 py-2 border border-gray-300 rounded-full focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
              <motion.button
                className="p-2 bg-primary-600 text-white rounded-full hover:bg-primary-700 transition-colors disabled:opacity-50"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleSendMessage(inputMessage)}
                disabled={!inputMessage.trim() || isTyping}
              >
                <Send className="w-5 h-5" />
              </motion.button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIAssistantPage;
