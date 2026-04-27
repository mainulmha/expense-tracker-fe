// utils/pagination.jsx (ড্রপডাউন ভার্সন - মোবাইলের জন্য)
import { useState, useEffect } from "react";

export const Pagination = ({ pagination, onPageChange }) => {
  if (!pagination || pagination.totalPages <= 1) return null;

  const { currentPage, totalPages, hasNext, hasPrev } = pagination;
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 640);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // মোবাইলে ড্রপডাউন দেখাবে
  if (isMobile) {
    return (
      <div className="flex justify-center items-center gap-2 p-4">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={!hasPrev}
          className="px-3 py-2 bg-gray-800 hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg text-sm transition"
        >
          ←
        </button>

        <select
          value={currentPage}
          onChange={(e) => onPageChange(parseInt(e.target.value))}
          className="px-3 py-2 bg-gray-800 text-white rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-green-500"
        >
          {[...Array(totalPages)].map((_, i) => (
            <option key={i + 1} value={i + 1}>
              Page {i + 1} of {totalPages}
            </option>
          ))}
        </select>

        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={!hasNext}
          className="px-3 py-2 bg-gray-800 hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg text-sm transition"
        >
          →
        </button>
      </div>
    );
  }

  // ডেস্কটপে নরমাল পেজিনেশন
  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 5;

    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 4; i++) pages.push(i);
        pages.push('...');
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1);
        pages.push('...');
        for (let i = totalPages - 3; i <= totalPages; i++) pages.push(i);
      } else {
        pages.push(1);
        pages.push('...');
        for (let i = currentPage - 1; i <= currentPage + 1; i++) pages.push(i);
        pages.push('...');
        pages.push(totalPages);
      }
    }
    return pages;
  };

  return (
    <div className="flex justify-center items-center gap-2 p-4">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={!hasPrev}
        className="px-3 py-2 bg-gray-800 hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg text-sm transition"
      >
        ← Previous
      </button>

      <div className="flex gap-1">
        {getPageNumbers().map((page, idx) => (
          page === '...' ? (
            <span key={idx} className="px-3 py-2 text-gray-500">...</span>
          ) : (
            <button
              key={idx}
              onClick={() => onPageChange(page)}
              className={`w-9 h-9 rounded-lg text-sm transition ${currentPage === page
                ? 'bg-green-500 text-white'
                : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                }`}
            >
              {page}
            </button>
          )
        ))}
      </div>

      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={!hasNext}
        className="px-3 py-2 bg-gray-800 hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg text-sm transition"
      >
        Next →
      </button>
    </div>
  );
};
