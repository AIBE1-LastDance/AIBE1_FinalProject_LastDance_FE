import { useState, useCallback } from 'react';

interface UseDeleteConfirmationOptions {
  onConfirm: () => void;
  message?: string;
}

export const useDeleteConfirmation = ({ onConfirm, message = '정말로 삭제하시겠습니까?' }: UseDeleteConfirmationOptions) => {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = useCallback(() => {
    if (isDeleting) return;
    
    setIsDeleting(true);
    
    // 즉시 실행하지 않고 다음 렌더링 사이클에서 실행
    requestAnimationFrame(() => {
      const confirmed = window.confirm(message);
      
      if (confirmed) {
        onConfirm();
      }
      
      setIsDeleting(false);
    });
  }, [isDeleting, message, onConfirm]);

  const reset = useCallback(() => {
    setIsDeleting(false);
  }, []);

  return {
    isDeleting,
    handleDelete,
    reset
  };
};
