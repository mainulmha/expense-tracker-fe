import { useState, useEffect } from "react";

export const Pagination = ({ pagination, onPageChange }) => {
  const { currentPage = 1, totalPages = 1, hasNext = false, hasPrev = false } = pagination || {};
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 640);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  if (!pagination || totalPages <= 1) return null;

  // common button style
  const btnBase = "px-3 py-1.5 bg-[#0f172a] border border-gray-800 text-gray-400 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all hover:border-blue-500/50 hover:text-white disabled:opacity-30 disabled:hover:border-gray-800 disabled:cursor-not-allowed active:scale-95";

  // মোবাইলে ড্রপডাউন ভার্সন (Compact)
  if (isMobile) {
    return (
      <div className="flex justify-center items-center gap-3 p-2">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={!hasPrev}
          className={btnBase}
        >
          Prev
        </button>

        <div className="relative">
          <select
            value={currentPage}
            onChange={(e) => onPageChange(parseInt(e.target.value))}
            className="appearance-none pl-4 pr-8 py-1.5 bg-[#0f172a] text-blue-400 border border-blue-500/20 rounded-xl text-[11px] font-black uppercase tracking-widest focus:outline-none focus:ring-2 focus:ring-blue-500/10 cursor-pointer"
          >
            {[...Array(totalPages)].map((_, i) => (
              <option key={i + 1} value={i + 1} className="bg-[#0f172a] text-white">
                {i + 1} / {totalPages}
              </option>
            ))}
          </select>
          {/* Custom Arrow for select */}
          <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-blue-400/50 text-[8px]">
            ▼
          </div>
        </div>

        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={!hasNext}
          className={btnBase}
        >
          Next
        </button>
      </div>
    );
  }

  // ডেস্কটপে মডার্ন ডট ভার্সন
  const getPageNumbers = () => {
    const pages = [];
    if (totalPages <= 5) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      if (currentPage <= 3) {
        pages.push(1, 2, 3, 4, '...', totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1, '...', totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
      } else {
        pages.push(1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages);
      }
    }
    return pages;
  };

  return (
    <div className="flex justify-center items-center gap-4 p-2">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={!hasPrev}
        className={btnBase}
      >
        Previous
      </button>

      <div className="flex gap-1.5">
        {getPageNumbers().map((page, idx) => (
          page === '...' ? (
            <span key={idx} className="px-2 py-1 text-gray-600 font-black tracking-widest text-[10px]">...</span>
          ) : (
            <button
              key={idx}
              onClick={() => onPageChange(page)}
              className={`w-8 h-8 rounded-lg text-[11px] font-black transition-all duration-300 border ${currentPage === page
                ? 'bg-blue-600 border-blue-500 text-white shadow-lg shadow-blue-600/20'
                : 'bg-transparent border-gray-800 text-gray-500 hover:border-gray-600 hover:text-gray-300'
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
        className={btnBase}
      >
        Next
      </button>
    </div>
  );
};
