import { useEffect } from "react";

function Modal({
  show,
  onHide,
  title,
  children,
  type = "alert",
  onConfirm,
  confirmText = "Confirm",
  cancelText = "Cancel",
  confirmButtonClass = "btn-primary",
  size = "modal-dialog-centered",
}) {
  // Handle escape key press
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === "Escape" && show) {
        onHide();
      }
    };

    if (show) {
      document.addEventListener("keydown", handleEscape);
      // Prevent body scroll when modal is open
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "unset";
    };
  }, [show, onHide]);

  const handleConfirm = () => {
    if (type === "confirm" && onConfirm) {
      onConfirm();
    }
    onHide();
  };

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onHide();
    }
  };

  if (!show) return null;

  return (
    <div
      className="modal show d-block"
      tabIndex="-1"
      style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
      onClick={handleBackdropClick}
    >
      <div className={`modal-dialog ${size}`}>
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">{title}</h5>
            <button
              type="button"
              className="btn-close"
              onClick={onHide}
              aria-label="Close"
            ></button>
          </div>
          <div className="modal-body">
            {typeof children === "string" ? <p>{children}</p> : children}
          </div>
          <div className="modal-footer">
            {type === "confirm" ? (
              <>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={onHide}
                >
                  {cancelText}
                </button>
                <button
                  type="button"
                  className={`btn ${confirmButtonClass}`}
                  onClick={handleConfirm}
                >
                  {confirmText}
                </button>
              </>
            ) : (
              <button
                type="button"
                className="btn btn-primary"
                onClick={onHide}
              >
                OK
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Modal;
