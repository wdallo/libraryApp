import PropTypes from "prop-types";

function Pagination({
  currentPage = 1,
  totalPages = 1,
  onPageChange,
  showPrevNext = true,
  maxVisiblePages = 5,
  className = "",
  variant = "dark", // dark, light, primary, etc.
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

  // Define button classes based on variant
  const getButtonClasses = (active = false, disabled = false) => {
    let baseClasses = "page-link";

    if (variant === "dark") {
      baseClasses += active
        ? " bg-dark text-white border-dark"
        : " bg-dark text-white border-dark";
    } else if (variant === "primary") {
      baseClasses += active
        ? " bg-primary text-white border-primary"
        : " text-primary border-primary";
    } else if (variant === "light") {
      baseClasses += active
        ? " bg-light text-dark border-secondary"
        : " text-dark border-secondary";
    } else {
      // Default Bootstrap styling
      baseClasses += active ? " active" : "";
    }

    if (disabled) {
      baseClasses += " disabled";
    }

    return baseClasses;
  };

  const handlePageClick = (page, event) => {
    event.preventDefault();
    if (page !== currentPage && page >= 1 && page <= totalPages) {
      onPageChange(page);
    }
  };

  return (
    <nav aria-label="Pagination navigation" className={className}>
      <ul className="pagination justify-content-center">
        {/* Previous Button */}
        {showPrevNext && (
          <li className={`page-item ${!hasPrevious ? "disabled" : ""}`}>
            <a
              className={getButtonClasses(false, !hasPrevious)}
              href="#"
              onClick={(e) => handlePageClick(currentPage - 1, e)}
              tabIndex={!hasPrevious ? "-1" : "0"}
              aria-disabled={!hasPrevious}
            >
              Previous
            </a>
          </li>
        )}

        {/* First Page + Ellipsis */}
        {visiblePages[0] > 1 && (
          <>
            <li className="page-item">
              <a
                className={getButtonClasses(1 === currentPage)}
                href="#"
                onClick={(e) => handlePageClick(1, e)}
              >
                1
              </a>
            </li>
            {visiblePages[0] > 2 && (
              <li className="page-item disabled">
                <span className={getButtonClasses(false, true)}>...</span>
              </li>
            )}
          </>
        )}

        {/* Visible Page Numbers */}
        {visiblePages.map((page) => (
          <li
            key={page}
            className={`page-item ${page === currentPage ? "active" : ""}`}
          >
            <a
              className={getButtonClasses(page === currentPage)}
              href="#"
              onClick={(e) => handlePageClick(page, e)}
              aria-current={page === currentPage ? "page" : undefined}
            >
              {page}
            </a>
          </li>
        ))}

        {/* Last Page + Ellipsis */}
        {visiblePages[visiblePages.length - 1] < totalPages && (
          <>
            {visiblePages[visiblePages.length - 1] < totalPages - 1 && (
              <li className="page-item disabled">
                <span className={getButtonClasses(false, true)}>...</span>
              </li>
            )}
            <li className="page-item">
              <a
                className={getButtonClasses(totalPages === currentPage)}
                href="#"
                onClick={(e) => handlePageClick(totalPages, e)}
              >
                {totalPages}
              </a>
            </li>
          </>
        )}

        {/* Next Button */}
        {showPrevNext && (
          <li className={`page-item ${!hasNext ? "disabled" : ""}`}>
            <a
              className={getButtonClasses(false, !hasNext)}
              href="#"
              onClick={(e) => handlePageClick(currentPage + 1, e)}
              tabIndex={!hasNext ? "-1" : "0"}
              aria-disabled={!hasNext}
            >
              Next
            </a>
          </li>
        )}
      </ul>
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
  variant: PropTypes.oneOf(["dark", "light", "primary", "default"]),
};

export default Pagination;
