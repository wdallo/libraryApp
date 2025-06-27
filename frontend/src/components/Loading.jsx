const Loading = () => {
  return (
    <>
      <div className="d-flex justify-content-center align-items-center vh-100 vw-100 bg-white">
        <div className="text-center">
          <div className="spinner-border text-dark" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      </div>
    </>
  );
};

export default Loading;
