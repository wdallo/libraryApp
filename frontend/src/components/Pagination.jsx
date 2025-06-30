import PropTypes from "prop-types";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faChevronLeft,
  faChevronRight,
} from "@fortawesome/free-solid-svg-icons";

function Pagination({
  currentPage = 1,
  totalPages = 1,
  onPageChange,
  showPrevNext = true,
  maxVisiblePages = 5,
  className = "",
}) {
  // Don't render if there's only one page or no pages
  if (totalPages <= 1) {
    return null;
  }

  // Calculate which page numbers to show
  const getVisiblePages = () => {
    const pages = [];
    const half = Math.floor(maxVisiblePages / 2);
    let start = Math.max(1, currentPage - half);
    let end = Math.min(totalPages, start + maxVisiblePages - 1);

    // Adjust start if we're near the end
    if (end - start + 1 < maxVisiblePages) {
      start = Math.max(1, end - maxVisiblePages + 1);
    }

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    return pages;
  };

  const visiblePages = getVisiblePages();
  const hasPrevious = currentPage > 1;
  const hasNext = currentPage < totalPages;

  const handlePageClick = (page, event) => {
    event.preventDefault();
    if (page !== currentPage && page >= 1 && page <= totalPages) {
      onPageChange(page);
    }
  };

  return (
    <nav
      aria-label="Pagination navigation"
      className={`modern-pagination ${className}`}
    >
      <div className="pagination-container">
        {/* Previous Button */}
        {showPrevNext && (
          <button
            className={`pagination-btn prev-btn ${
              !hasPrevious ? "disabled" : ""
            }`}
            onClick={(e) => handlePageClick(currentPage - 1, e)}
            disabled={!hasPrevious}
            aria-disabled={!hasPrevious}
          >
            <FontAwesomeIcon icon={faChevronLeft} />
            <span className="btn-text">Previous</span>
          </button>
        )}

        {/* Page Numbers Container */}
        <div className="page-numbers">
          {/* First Page + Ellipsis */}
          {visiblePages[0] > 1 && (
            <>
              <button
                className={`page-btn ${1 === currentPage ? "active" : ""}`}
                onClick={(e) => handlePageClick(1, e)}
              >
                1
              </button>
              {visiblePages[0] > 2 && (
                <span className="pagination-ellipsis">...</span>
              )}
            </>
          )}

          {/* Visible Page Numbers */}
          {visiblePages.map((page) => (
            <button
              key={page}
              className={`page-btn ${page === currentPage ? "active" : ""}`}
              onClick={(e) => handlePageClick(page, e)}
              aria-current={page === currentPage ? "page" : undefined}
            >
              {page}
            </button>
          ))}

          {/* Last Page + Ellipsis */}
          {visiblePages[visiblePages.length - 1] < totalPages && (
            <>
              {visiblePages[visiblePages.length - 1] < totalPages - 1 && (
                <span className="pagination-ellipsis">...</span>
              )}
              <button
                className={`page-btn ${
                  totalPages === currentPage ? "active" : ""
                }`}
                onClick={(e) => handlePageClick(totalPages, e)}
              >
                {totalPages}
              </button>
            </>
          )}
        </div>

        {/* Next Button */}
        {showPrevNext && (
          <button
            className={`pagination-btn next-btn ${!hasNext ? "disabled" : ""}`}
            onClick={(e) => handlePageClick(currentPage + 1, e)}
            disabled={!hasNext}
            aria-disabled={!hasNext}
          >
            <span className="btn-text">Next</span>
            <FontAwesomeIcon icon={faChevronRight} />
          </button>
        )}
      </div>
    </nav>
  );
}

Pagination.propTypes = {
  currentPage: PropTypes.number.isRequired,
  totalPages: PropTypes.number.isRequired,
  onPageChange: PropTypes.func.isRequired,
  showPrevNext: PropTypes.bool,
  maxVisiblePages: PropTypes.number,
  className: PropTypes.string,
};

export default Pagination;
