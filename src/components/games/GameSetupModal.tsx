import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Users, AlertTriangle, Plus, Minus, ChevronDown } from 'lucide-react';
import { useAppStore } from '../../store/appStore';

interface GameSetupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStart: (players: string[], penalty: string) => void;
  gameTitle: string;
  minPlayers?: number;
  maxPlayers?: number;
}

const GameSetupModal: React.FC<GameSetupModalProps> = ({
  isOpen,
  onClose,
  onStart,
  gameTitle,
  minPlayers = 2,
  maxPlayers = 8
}) => {
  const { mode, currentGroup } = useAppStore();
  const [players, setPlayers] = useState<string[]>(['']);
  const [penalty, setPenalty] = useState('');
  const [activeDropdownIndex, setActiveDropdownIndex] = useState<number | null>(null);
  const dropdownRefs = useRef<(HTMLDivElement | null)[]>([]);

  // 그룹 멤버 목록 가져오기
  const groupMembers = mode === 'group' && currentGroup ? currentGroup.members : [];

  // 모달이 열릴 때 상태 초기화
  useEffect(() => {
    if (isOpen) {
      setPlayers(['']);
      setPenalty('');
      setActiveDropdownIndex(null);
    }
  }, [isOpen]);

  // 드롭다운 외부 클릭 감지
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (activeDropdownIndex !== null) {
        const ref = dropdownRefs.current[activeDropdownIndex];
        if (ref && !ref.contains(event.target as Node)) {
          setActiveDropdownIndex(null);
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [activeDropdownIndex]);

  const addPlayer = () => {
    if (players.length < maxPlayers) {
      setPlayers([...players, '']);
    }
  };

  const removePlayer = (index: number) => {
    if (players.length > 1) {
      setPlayers(players.filter((_, i) => i !== index));
      // 해당 인덱스의 드롭다운이 열려있다면 닫기
      if (activeDropdownIndex === index) {
        setActiveDropdownIndex(null);
      }
    }
  };

  const updatePlayer = (index: number, name: string) => {
    const newPlayers = [...players];
    newPlayers[index] = name;
    setPlayers(newPlayers);
  };

  const selectGroupMember = (index: number, memberName: string) => {
    updatePlayer(index, memberName);
    setActiveDropdownIndex(null);
  };

  const toggleDropdown = (index: number) => {
    setActiveDropdownIndex(activeDropdownIndex === index ? null : index);
  };

  // 입력값에 따른 필터링된 그룹 멤버 (중복 제외)
  const getFilteredMembers = (inputValue: string) => {
    // 이미 선택된 참여자들 목록
    const selectedPlayers = players.filter(p => p.trim() !== '');
    
    let filtered = groupMembers;
    
    // 입력값이 있으면 필터링
    if (inputValue) {
      filtered = filtered.filter(member => 
        member.nickname.toLowerCase().includes(inputValue.toLowerCase())
      );
    }
    
    // 이미 선택된 참여자는 제외 (단, 현재 입력 중인 참여자는 포함)
    return filtered.filter(member => 
      !selectedPlayers.includes(member.nickname) || member.nickname === inputValue
    );
  };

  const handleStart = () => {
    const validPlayers = players.filter(name => name.trim() !== '');
    if (validPlayers.length >= minPlayers && penalty.trim() !== '') {
      onStart(validPlayers, penalty.trim());
    }
  };

  const isValid = () => {
    const validPlayers = players.filter(name => name.trim() !== '');
    return validPlayers.length >= minPlayers && penalty.trim() !== '';
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-white rounded-2xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-800">{gameTitle} 설정</h2>
            <button
              onClick={onClose}
              className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center hover:bg-gray-200 transition-colors"
            >
              <X className="w-5 h-5 text-gray-600" />
            </button>
          </div>

          {/* Players Section */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-800 flex items-center">
                <Users className="w-5 h-5 mr-2 text-primary-600" />
                참여자
              </h3>
              <span className="text-sm text-gray-500">
                {minPlayers}-{maxPlayers}명
              </span>
            </div>

            <div className="space-y-3">
              {players.map((player, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <div className="flex-1 relative" ref={el => dropdownRefs.current[index] = el}>
                    <div className="relative">
                      <input
                        type="text"
                        value={player}
                        onChange={(e) => updatePlayer(index, e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'ArrowDown' && mode === 'group' && groupMembers.length > 0) {
                            e.preventDefault();
                            setActiveDropdownIndex(index);
                          } else if (e.key === 'Escape') {
                            setActiveDropdownIndex(null);
                          }
                        }}
                        placeholder={`참여자 ${index + 1}`}
                        className="w-full px-4 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                        onFocus={() => mode === 'group' && groupMembers.length > 0 && setActiveDropdownIndex(index)}
                      />
                      {/* 그룹 모드일 때만 드롭다운 버튼 표시 */}
                      {mode === 'group' && groupMembers.length > 0 && (
                        <button
                          type="button"
                          onClick={() => toggleDropdown(index)}
                          className="absolute right-2 top-1/2 transform -translate-y-1/2 p-1 hover:bg-gray-100 rounded transition-colors"
                        >
                          <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${
                            activeDropdownIndex === index ? 'rotate-180' : ''
                          }`} />
                        </button>
                      )}
                    </div>

                    {/* 드롭다운 메뉴 */}
                    {mode === 'group' && activeDropdownIndex === index && groupMembers.length > 0 && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-40 overflow-y-auto"
                      >
                        {getFilteredMembers(player).map((member, memberIndex) => {
                          // 이미 선택된 멤버인지 확인
                          const isAlreadySelected = players.some((p, pIndex) => 
                            pIndex !== index && p === member.nickname
                          );
                          
                          return (
                            <button
                              key={memberIndex}
                              type="button"
                              onClick={() => selectGroupMember(index, member.nickname)}
                              disabled={isAlreadySelected}
                              className={`w-full px-4 py-2 text-left transition-colors flex items-center space-x-2 ${
                                isAlreadySelected 
                                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                                  : 'hover:bg-gray-50'
                              }`}
                            >
                              <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                                isAlreadySelected ? 'bg-gray-200' : 'bg-primary-100'
                              }`}>
                                <span className={`text-xs font-medium ${
                                  isAlreadySelected ? 'text-gray-400' : 'text-primary-600'
                                }`}>
                                  {member.nickname.charAt(0)}
                                </span>
                              </div>
                              <span className={`text-sm ${
                                isAlreadySelected ? 'text-gray-400' : 'text-gray-700'
                              }`}>
                                {member.nickname}
                              </span>
                              {member.role === 'OWNER' && (
                                <span className={`text-xs px-2 py-1 rounded-full ${
                                  isAlreadySelected 
                                    ? 'bg-gray-200 text-gray-400' 
                                    : 'bg-primary-100 text-primary-700'
                                }`}>
                                  그룹장
                                </span>
                              )}
                              {isAlreadySelected && (
                                <span className="text-xs text-gray-400 ml-auto">이미 선택됨</span>
                              )}
                            </button>
                          );
                        })}
                        {getFilteredMembers(player).length === 0 && (
                          <div className="px-4 py-2 text-sm text-gray-500">
                            검색 결과가 없습니다
                          </div>
                        )}
                      </motion.div>
                    )}
                  </div>
                  {players.length > 1 && (
                    <button
                      onClick={() => removePlayer(index)}
                      className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center hover:bg-red-200 transition-colors"
                    >
                      <Minus className="w-4 h-4 text-red-600" />
                    </button>
                  )}
                </div>
              ))}
            </div>

            {players.length < maxPlayers && (
              <button
                onClick={addPlayer}
                className="w-full mt-3 py-2 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-primary-400 hover:text-primary-600 transition-colors flex items-center justify-center"
              >
                <Plus className="w-4 h-4 mr-2" />
                참여자 추가
              </button>
            )}

            {/* 그룹 모드일 때 안내 메시지 */}
            {mode === 'group' && groupMembers.length > 0 && (
              <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                <p className="text-sm text-blue-700">
                  💡 그룹 멤버를 선택하거나 직접 입력할 수 있습니다. 
                  입력창을 클릭하거나 화살표↓ 키를 누르면 그룹 멤버 목록이 표시됩니다.
                </p>
              </div>
            )}

            {/* 개인 모드일 때 안내 메시지 */}
            {mode === 'personal' && (
              <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600">
                  개인 모드에서는 참여자 이름을 직접 입력해주세요.
                </p>
              </div>
            )}
          </div>

          {/* Penalty Section */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-800 flex items-center mb-4">
              <AlertTriangle className="w-5 h-5 mr-2 text-accent-600" />
              벌칙
            </h3>
            <input
              type="text"
              value={penalty}
              onChange={(e) => setPenalty(e.target.value)}
              placeholder="예: 설거지, 청소, 쓰레기 배출 등"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent-500 focus:border-transparent outline-none"
            />
          </div>

          {/* Buttons */}
          <div className="flex space-x-3">
            <button
              onClick={onClose}
              className="flex-1 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
            >
              취소
            </button>
            <button
              onClick={handleStart}
              disabled={!isValid()}
              className={`flex-1 py-3 rounded-lg font-medium transition-colors ${
                isValid()
                  ? 'bg-primary-600 text-white hover:bg-primary-700'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              게임 시작
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default GameSetupModal;
