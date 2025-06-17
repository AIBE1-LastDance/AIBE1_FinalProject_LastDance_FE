import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Send, Bot, User, ThumbsUp, ThumbsDown, Copy } from 'lucide-react';
import toast from 'react-hot-toast';

interface Message {
  id: string;
  type: 'user' | 'ai';
  content: string;
  timestamp: Date;
  rating?: 'up' | 'down' | null;
}

const AIAssistantPage: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      type: 'ai',
      content: '안녕하세요! 저는 우리.zip AI 도우미입니다. 하우스메이트 생활에서 궁금한 것이 있으시면 언제든 물어보세요! 🏠✨',
      timestamp: new Date(),
      rating: null,
    },
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [shouldAutoScroll, setShouldAutoScroll] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  const aiResponses = {
    '청소 당번 어떻게 정할까?': `청소 당번을 정하는 공정한 방법들을 제안드릴게요:

**1. 로테이션 방식**
• 주간 단위로 순서를 정해서 돌아가며 담당
• 각자의 스케줄을 고려해서 요일 배정

**2. 구역별 분담**
• 거실, 주방, 화장실 등 구역을 나누어 담당
• 한 달마다 구역을 바꿔서 공평하게

**3. 포인트 시스템**
• 청소 완료 시 포인트 적립
• 월말에 포인트가 적은 사람이 추가 청소

**4. 게임으로 정하기**
• 우리.zip의 룰렛이나 가위바위보 게임 활용
• 재미있게 당번을 정할 수 있어요!

어떤 방식이 가장 마음에 드시나요?`,

    '생활비 어떻게 나눌까?': `생활비 분담의 공정한 방법들을 알려드릴게요:

**1. 균등 분할**
• 모든 공통 비용을 인원수로 나누어 분담
• 가장 간단하고 명확한 방법

**2. 소득 비례 분담**
• 각자의 소득에 비례해서 분담 비율 결정
• 경제적 부담을 고려한 공정한 방법

**3. 사용량 기준**
• 전기, 가스 등은 사용량에 따라 분담
• 공용 물품은 균등 분할

**4. 카테고리별 분담**
• 공과금: 균등 분할
• 생필품: 구매자가 영수증 공유 후 정산
• 음식: 함께 먹은 사람들끼리 분담

우리.zip 가계부 기능을 활용하면 쉽게 관리할 수 있어요!`,

    '집안일 규칙 정해줘': `하우스메이트를 위한 기본 집안일 규칙을 제안드려요:

**🧹 청소 규칙**
• 주 1회 대청소 (토요일 오전)
• 사용 후 즉시 정리 원칙
• 공용 공간은 마지막 사용자가 정리

**🍽️ 주방 규칙**
• 설거지는 24시간 내 완료
• 냉장고 음식에 이름과 날짜 표시
• 공용 조미료는 다 쓰면 구매 후 정산

**🚿 화장실 규칙**
• 사용 후 환기 필수
• 휴지, 세제 떨어지면 공지
• 주 1회 돌아가며 청소

**📦 쓰레기 규칙**
• 분리수거 철저히
• 음식물 쓰레기는 당일 처리
• 쓰레기 배출은 당번제로

이 규칙들을 우리.zip 할일 목록에 추가해서 관리해보세요!`,

    '이 상황 누구 잘못이야?': `상황을 공정하게 판단하기 위해 몇 가지 질문을 드릴게요:

**🤔 상황 파악을 위한 질문들**
1. 어떤 일이 일어났나요?
2. 사전에 정해진 규칙이 있었나요?
3. 의도적인 행동이었나요, 실수였나요?
4. 피해를 본 사람이 있나요?

**⚖️ 공정한 판단 기준**
• 기존 약속이나 규칙 위반 여부
• 의도성과 반복성
• 다른 사람에게 미친 영향
• 사과나 해결 의지

**🤝 해결 방안**
• 당사자들이 직접 대화
• 규칙을 명확히 정하기
• 재발 방지 방안 마련

구체적인 상황을 말씀해주시면 더 정확한 조언을 드릴 수 있어요!`,

    '공과금 분담 방법 알려줘': `공과금을 공정하게 분담하는 방법들을 알려드릴게요:

**💡 전기요금**
• 기본요금: 균등 분할
• 사용량: 개인 사용 패턴 고려 (에어컨, 히터 등)
• 공용 전기: 균등 분할

**🔥 가스요금**
• 난방비: 균등 분할 (공용 공간)
• 취사용: 요리 빈도에 따라 조정 가능

**💧 수도요금**
• 기본적으로 균등 분할
• 세탁기 사용량이 많이 다르면 고려

**📱 인터넷/케이블**
• 균등 분할 (모두가 사용)

**🗑️ 관리비**
• 균등 분할

**💰 분담 팁**
• 매월 정산일 정하기 (예: 매월 5일)
• 우리.zip 가계부로 투명하게 관리
• 영수증 사진 공유하기

이렇게 하면 투명하고 공정하게 관리할 수 있어요!`,

    '냉장고 정리 규칙 만들어줘': `냉장고를 깔끔하게 관리하는 규칙을 제안드려요:

**🏷️ 라벨링 규칙**
• 개인 음식: 이름 + 날짜 표시
• 공용 음식: "공용" 표시
• 유통기한 임박 시 "빨리 드세요" 표시

**📍 구역 분담**
• 개인별 냉장고 구역 배정
• 공용 구역 따로 지정
• 냉동실도 동일하게 구역 나누기

**🗓️ 정리 규칙**
• 주 1회 냉장고 정리의 날 (일요일 저녁)
• 유통기한 지난 음식 즉시 처리
• 냄새 나는 음식은 밀폐 보관

**🛒 공용 음식 관리**
• 공용 조미료, 소스류 관리
• 다 쓰면 구매 후 정산
• 공용 음식 구매 전 사전 협의

**⚠️ 주의사항**
• 남의 음식 무단 섭취 금지
• 냉장고 문 오래 열어두지 않기
• 냄새 나는 음식은 이중 포장

이 규칙들로 냉장고 분쟁을 예방할 수 있어요!`,
  };

  // 메시지가 추가될 때만 자동 스크롤 (사용자가 보낸 메시지나 AI 응답일 때만)
  useEffect(() => {
    if (shouldAutoScroll) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, shouldAutoScroll]);

  // 스크롤 위치 감지해서 자동 스크롤 여부 결정
  const handleScroll = () => {
    if (messagesContainerRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = messagesContainerRef.current;
      const isAtBottom = scrollHeight - scrollTop - clientHeight < 50;
      setShouldAutoScroll(isAtBottom);
    }
  };

  const handleSendMessage = (content: string) => {
    if (!content.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsTyping(true);
    setShouldAutoScroll(true); // 새 메시지 전송 시 자동 스크롤 활성화

    // Simulate AI response
    setTimeout(() => {
      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        content: aiResponses[content as keyof typeof aiResponses] || 
                `"${content}"에 대해 좋은 질문이네요! 하우스메이트 생활에서는 소통이 가장 중요해요. 

구체적인 상황을 더 자세히 말씀해주시면, 더 정확하고 도움이 되는 조언을 드릴 수 있어요. 

예를 들어:
• 어떤 문제가 발생했는지
• 현재 어떤 규칙이 있는지  
• 몇 명이 함께 살고 있는지

이런 정보들이 있으면 맞춤형 해결책을 제안드릴 수 있답니다! 😊`,
        timestamp: new Date(),
        rating: null,
      };
      setMessages(prev => [...prev, aiResponse]);
      setIsTyping(false);
    }, 1500);
  };

  const handleRating = (messageId: string, rating: 'up' | 'down') => {
    setMessages(prev => 
      prev.map(msg => 
        msg.id === messageId 
          ? { ...msg, rating: msg.rating === rating ? null : rating }
          : msg
      )
    );
    // 평가 시에는 자동 스크롤하지 않음
  };

  const handleCopy = async (content: string) => {
    try {
      await navigator.clipboard.writeText(content);
      toast.success('메시지가 복사되었습니다!');
    } catch (error) {
      toast.error('복사에 실패했습니다.');
    }
  };

  return (
    <div className="fixed inset-0 top-20 flex flex-col bg-gray-50 overflow-hidden">
      <div className="flex-1 flex flex-col max-w-7xl mx-auto w-full px-6 lg:px-8 py-8">
        {/* Header */}
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
              <p className="text-primary-100">하우스메이트 생활의 똑똑한 조언자</p>
            </div>
          </div>
        </motion.div>

        {/* Chat Messages - 완전히 고정된 높이 */}
        <div className="flex-1 bg-white rounded-xl border border-gray-200 flex flex-col overflow-hidden"
             style={{ 
               height: 'calc(100vh - 280px)',
               maxHeight: 'calc(100vh - 280px)',
               minHeight: 'calc(100vh - 280px)'
             }}>
          <div 
            ref={messagesContainerRef}
            onScroll={handleScroll}
            className="flex-1 overflow-y-auto p-4 space-y-4"
            style={{ 
              height: 'calc(100% - 80px)',
              maxHeight: 'calc(100% - 80px)'
            }}
          >
          {messages.map((message) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`flex items-start space-x-3 max-w-[80%] ${
                message.type === 'user' ? 'flex-row-reverse space-x-reverse' : ''
              }`}>
                {/* Avatar */}
                <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                  message.type === 'user' 
                    ? 'bg-primary-600 text-white' 
                    : 'bg-gradient-to-r from-primary-500 to-primary-600 text-white'
                }`}>
                  {message.type === 'user' ? (
                    <User className="w-4 h-4" />
                  ) : (
                    <Bot className="w-4 h-4" />
                  )}
                </div>

                {/* Message Bubble */}
                <div className={`rounded-2xl px-4 py-3 ${
                  message.type === 'user'
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-100 text-gray-800'
                }`}>
                  <div className="whitespace-pre-wrap text-sm leading-relaxed break-words">
                    {message.content}
                  </div>

                  {/* AI Message Actions */}
                  {message.type === 'ai' && (
                    <div className="flex items-center space-x-2 mt-3 pt-2 border-t border-gray-200">
                      <motion.button
                        className={`p-1 rounded transition-colors ${
                          message.rating === 'up' 
                            ? 'bg-green-500 text-white' 
                            : 'hover:bg-gray-200 text-gray-500'
                        }`}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRating(message.id, 'up');
                        }}
                      >
                        <ThumbsUp className="w-3 h-3" />
                      </motion.button>
                      <motion.button
                        className={`p-1 rounded transition-colors ${
                          message.rating === 'down' 
                            ? 'bg-red-500 text-white' 
                            : 'hover:bg-gray-200 text-gray-500'
                        }`}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRating(message.id, 'down');
                        }}
                      >
                        <ThumbsDown className="w-3 h-3" />
                      </motion.button>
                      <motion.button
                        className="p-1 rounded hover:bg-gray-200 transition-colors text-gray-500"
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleCopy(message.content);
                        }}
                      >
                        <Copy className="w-3 h-3" />
                      </motion.button>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          ))}

          {/* Typing Indicator */}
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
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
          
          {/* 스크롤을 위한 참조점 */}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="border-t border-gray-200 p-4 flex-shrink-0" style={{ height: '80px' }}>
          <div className="flex items-center space-x-3">
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage(inputMessage)}
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
