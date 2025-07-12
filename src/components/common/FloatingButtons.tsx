"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Users } from "lucide-react";
import { useLocation } from "react-router-dom";
import ModeToggleSidebar from "../ai/ModeToggleSidebar";

const FloatingButtons: React.FC = () => {
  const [isModeToggleOpen, setIsModeToggleOpen] = useState(false);
  const location = useLocation();

  const toggleModeToggle = () => {
    setIsModeToggleOpen((prev) => !prev);
  };

  return (
    <>
      {/* Mode Toggle Button - 오른쪽 하단 */}
      <motion.button
        className="fixed w-14 h-14 bg-gradient-to-br from-primary-500 to-primary-600 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center z-40 bottom-24 right-6 lg:bottom-6 lg:right-6"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={toggleModeToggle}
        initial={{ opacity: 0, x: 100 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.7, duration: 0.5 }}
      >
        <Users className="w-6 h-6" />
      </motion.button>

      {/* Sidebar */}
      <ModeToggleSidebar
        isOpen={isModeToggleOpen}
        toggle={toggleModeToggle}
      />
    </>
  );
};

export default FloatingButtons;
