import React from 'react';
import {ChevronLeft, ChevronRight} from 'lucide-react';

interface PaginationProps {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
    className?: string;
    showPageInfo?: boolean; // 페이지 정보 표시 여부
}

const Pagination: React.FC<PaginationProps> = ({
                                                   currentPage,
                                                   totalPages,
                                                   onPageChange,
                                                   className = "",
                                                   showPageInfo = false
                                               }) => {
    if (totalPages <= 1) return null;

    const getPageNumbers = () => {
        const pageNumbers = [];
        const maxPageButtons = 5;
        let startPage = Math.max(1, currentPage - Math.floor(maxPageButtons / 2));
        let endPage = Math.min(totalPages, startPage + maxPageButtons - 1);

        if (endPage - startPage + 1 < maxPageButtons) {
            startPage = Math.max(1, endPage - maxPageButtons + 1);
        }

        for (let i = startPage; i <= endPage; i++) {
            pageNumbers.push(i);
        }
        return pageNumbers;
    };

    const pageNumbers = getPageNumbers();

    return (
        <div className={`flex justify-center items-center space-x-2 py-6 ${className}`}>
            {/* 이전 버튼 */}
            <button
                onClick={() => onPageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                aria-label="이전 페이지"
            >
                <ChevronLeft className="w-5 h-5 text-gray-600"/>
            </button>

            {/* 첫 페이지 바로가기 */}
            {currentPage > 3 && (
                <>
                    <button
                        onClick={() => onPageChange(1)}
                        className="px-4 py-2 rounded-full font-medium bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors"
                    >
                        1
                    </button>
                    {currentPage > 4 && <span className="text-gray-400">...</span>}
                </>
            )}

            {/* 페이지 번호들 */}
            {pageNumbers.map((number) => (
                <button
                    key={number}
                    onClick={() => onPageChange(number)}
                    className={`px-4 py-2 rounded-full font-medium transition-colors ${
                        currentPage === number
                            ? "bg-primary-600 text-white shadow-md"
                            : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                    aria-current={currentPage === number ? "page" : undefined}
                >
                    {number}
                </button>
            ))}

            {/* 마지막 페이지 바로가기 */}
            {currentPage < totalPages - 2 && (
                <>
                    {currentPage < totalPages - 3 && <span className="text-gray-400">...</span>}
                    <button
                        onClick={() => onPageChange(totalPages)}
                        className="px-4 py-2 rounded-full font-medium bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors"
                    >
                        {totalPages}
                    </button>
                </>
            )}

            {/* 다음 버튼 */}
            <button
                onClick={() => onPageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                aria-label="다음 페이지"
            >
                <ChevronRight className="w-5 h-5 text-gray-600"/>
            </button>

            {/* 페이지 정보 (옵션) */}
            {showPageInfo && (
                <div className="ml-4 text-sm text-gray-600">
                    {currentPage} / {totalPages} 페이지
                </div>
            )}
        </div>
    );
};

export default Pagination;