"use client";

import type React from "react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Settings,
  ChevronRight,
  ToggleLeft,
  ToggleRight,
  Users,
  UserRound,
  Plus,
  UserPlus,
} from "lucide-react";
import { useAppStore } from "../../store/appStore";
import CreateGroupModal from "../groups/CreateGroupModal";
import JoinGroupModal from "../groups/JoinGroupModal";
import GroupSettingsModal from "../groups/GroupSettingsModal";
import toast from "react-hot-toast";

interface ModeToggleSidebarProps {
  isOpen: boolean;
  toggle: () => void;
}

const ModeToggleSidebar: React.FC<ModeToggleSidebarProps> = ({
  isOpen,
  toggle,
}) => {
  const {
    mode,
    setMode,
    currentGroup,
    joinedGroups,
    setCurrentGroup,
    loadMyGroups,
  } = useAppStore();
  
  const [showCreateGroupModal, setShowCreateGroupModal] = useState(false);
  const [showJoinGroupModal, setShowJoinGroupModal] = useState(false);
  const [showGroupSettingsModal, setShowGroupSettingsModal] = useState(false);

  // 그룹 모드 전환 가능 여부 확인
  const canSwitchToGroup = joinedGroups.length > 0;
  const isDisabled = mode === "group" && !canSwitchToGroup;

  const handleModeToggle = () => {
    // 그룹 모드 전환시 그룹 없으면 차단
    if (mode === "personal" && joinedGroups.length === 0) {
      toast.error("먼저 그룹을 만들거나 참여해 주세요!");
      return;
    }

    setMode(mode === "personal" ? "group" : "personal");
  };

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/30 z-50"
              onClick={toggle}
            />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="fixed right-0 top-0 h-full w-96 bg-white z-50 overflow-hidden flex flex-col rounded-l-2xl shadow-lg"
            >
              <div className="bg-primary-300 p-5 text-white rounded-tl-2xl relative overflow-hidden">
                <div className="flex items-center justify-between relative z-10">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                      <Users className="w-5 h-5" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold">그룹 설정</h2>
                      <p className="text-primary-100 text-sm">
                        개인모드와 그룹모드를 변경하세요
                      </p>
                    </div>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={toggle}
                    className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </motion.button>
                </div>
                <div className="absolute top-3 right-3 w-2 h-2 bg-white/30 rounded-full animate-pulse"></div>
                <div className="absolute top-6 right-6 w-1 h-1 bg-white/20 rounded-full animate-pulse delay-300"></div>
                <div className="absolute bottom-3 right-4 w-1.5 h-1.5 bg-white/25 rounded-full animate-pulse delay-700"></div>
              </div>

              <div className="flex-1 overflow-y-auto p-6">
                {/* Mode Toggle Section */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-6 bg-white rounded-2xl p-6 shadow-sm border border-primary-200"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      {mode === "personal" ? (
                        <UserRound className="w-6 h-6 text-primary-600" />
                      ) : (
                        <Users className="w-6 h-6 text-primary-600" />
                      )}
                      <div>
                        <h3 className="text-lg font-bold text-gray-800">
                          현재 모드
                        </h3>
                        <p className="text-sm text-gray-600">
                          {mode === "personal" ? "개인 모드" : "그룹 모드"}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {mode === "personal" ? (
                        <ToggleLeft className="w-8 h-8 text-primary-600" />
                      ) : (
                        <ToggleRight className="w-8 h-8 text-primary-600" />
                      )}
                    </div>
                  </div>
                  
                  <motion.button
                    className={`w-full px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                      isDisabled
                        ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                        : mode === "personal"
                        ? "bg-white text-primary-600 border-2 border-primary-600 hover:bg-primary-50"
                        : "bg-primary-600 text-white hover:bg-primary-700"
                    }`}
                    whileHover={isDisabled ? {} : { scale: 1.02 }}
                    whileTap={isDisabled ? {} : { scale: 0.98 }}
                    onClick={handleModeToggle}
                    disabled={isDisabled}
                  >
                    {mode === "personal" ? "그룹 모드로 전환" : "개인 모드로 전환"}
                  </motion.button>
                  
                  {mode === "personal" && !canSwitchToGroup && (
                    <p className="text-xs text-gray-500 mt-2 text-center">
                      그룹에 먼저 참여하세요
                    </p>
                  )}
                </motion.div>

                {/* Group Section */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="mb-6"
                >
                  <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
                    <Users className="w-5 h-5 mr-2 text-primary-600" />
                    그룹 관리
                  </h3>

                  {/* Current Group - only show in group mode */}
                  {mode === "group" && joinedGroups.length > 0 && (
                    <div className="mb-4 bg-white rounded-2xl p-4 shadow-sm border border-primary-200">
                      <div className="text-sm font-medium text-gray-500 mb-3">
                        현재 선택된 그룹
                      </div>
                      {currentGroup && (
                        <div className="bg-primary-50 border border-primary-200 rounded-xl p-3">
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="font-semibold text-gray-900">
                                {currentGroup.name}
                              </div>
                              <div className="text-sm text-gray-600">
                                {currentGroup.members.length}명의 멤버
                              </div>
                            </div>
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              onClick={() => {
                                setShowGroupSettingsModal(true);
                              }}
                              className="p-2 text-primary-600 hover:bg-primary-100 transition-colors rounded-lg"
                            >
                              <Settings className="w-5 h-5" />
                            </motion.button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Available Groups */}
                  {joinedGroups.length > 0 && (
                    <div className="mb-4 bg-white rounded-2xl p-4 shadow-sm border border-primary-200">
                      <div className="text-sm font-medium text-gray-500 mb-3">
                        참여중인 그룹
                      </div>
                      <div className="space-y-2 max-h-40 overflow-y-auto">
                        {joinedGroups.map((group) => (
                          <motion.div
                            key={group.id}
                            className={`flex items-center justify-between px-3 py-2 hover:bg-gray-50 transition-colors rounded-lg cursor-pointer ${
                              currentGroup?.id === group.id
                                ? "bg-primary-50 border border-primary-200"
                                : ""
                            }`}
                            whileHover={{ x: 2 }}
                            onClick={() => {
                              setCurrentGroup(group);
                            }}
                          >
                            <div className="flex-1 min-w-0">
                              <div className="text-sm font-medium text-gray-900 truncate">
                                {group.name}
                              </div>
                              <div className="text-xs text-gray-500">
                                {group.members.length}명
                              </div>
                            </div>
                            {currentGroup?.id === group.id && (
                              <div className="w-2 h-2 bg-primary-600 rounded-full flex-shrink-0"></div>
                            )}
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Group Actions */}
                  <div className="space-y-3">
                    <motion.button
                      className="w-full flex items-center justify-center space-x-2 px-4 py-3 text-primary-600 bg-white border-2 border-primary-600 hover:bg-primary-50 transition-all duration-200 rounded-xl font-medium"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => {
                        setShowCreateGroupModal(true);
                      }}
                    >
                      <Plus className="w-5 h-5" />
                      <span>새 그룹 만들기</span>
                    </motion.button>
                    
                    <motion.button
                      className="w-full flex items-center justify-center space-x-2 px-4 py-3 text-primary-600 bg-white border-2 border-primary-600 hover:bg-primary-50 transition-all duration-200 rounded-xl font-medium"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => {
                        setShowJoinGroupModal(true);
                      }}
                    >
                      <UserPlus className="w-5 h-5" />
                      <span>그룹 참여하기</span>
                    </motion.button>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* 모달들 */}
      <CreateGroupModal
        isOpen={showCreateGroupModal}
        onClose={() => setShowCreateGroupModal(false)}
      />
      <JoinGroupModal
        isOpen={showJoinGroupModal}
        onClose={() => setShowJoinGroupModal(false)}
      />
      {currentGroup && (
        <GroupSettingsModal
          isOpen={showGroupSettingsModal}
          onClose={() => setShowGroupSettingsModal(false)}
          group={currentGroup}
          onGroupUpdate={loadMyGroups}
        />
      )}
    </>
  );
};

export default ModeToggleSidebar;
