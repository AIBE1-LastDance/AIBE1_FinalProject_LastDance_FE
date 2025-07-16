import React from 'react';
import Modal from '../common/Modal';

interface LegalModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

const LegalModal: React.FC<LegalModalProps> = ({ isOpen, onClose, title, children }) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title}>
      <div className="prose max-w-none p-4">
        {children}
      </div>
    </Modal>
  );
};

export default LegalModal;
