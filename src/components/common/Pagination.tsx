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
        const pageNumbers: (number | null)[] = [];
        const pageRange = 2; // 현재 페이지 양옆으로 보여줄 페이지 수
        const pagesToShow = new Set<number>();

        // 1. 항상 첫 페이지와 마지막 페이지는 포함
        pagesToShow.add(1);
        pagesToShow.add(totalPages);

        // 2. 현재 페이지와 주변 페이지들 포함
        for (let i = -pageRange; i <= pageRange; i++) {
            const page = currentPage + i;
            if (page > 0 && page <= totalPages) {
                pagesToShow.add(page);
            }
        }

        // 3. 정렬된 페이지 번호 배열 생성
        const sortedPages = Array.from(pagesToShow).sort((a, b) => a - b);

        // 4. 생략(...) 기호 추가
        let lastPage: number | null = null;
        for (const page of sortedPages) {
            if (lastPage !== null && page - lastPage > 1) {
                pageNumbers.push(null); // 연속되지 않으면 생략 기호 추가
            }
            pageNumbers.push(page);
            lastPage = page;
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

            {/* 페이지 번호들 */}
            {pageNumbers.map((number, index) =>
                number ? (
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
                ) : (
                    <span key={`ellipsis-${index}`} className="text-gray-400 px-2">...</span>
                )
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