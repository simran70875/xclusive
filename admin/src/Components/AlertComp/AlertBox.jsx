import React from "react";

const AlertBox = ({ status, statusMessage }) => {
  return (
    <>
      <div className="row" id="alert-box">
        <div className="col-sm-6 bg-custom">
          {status === "success" && (
            <div
              className="alert alert-success alert-dismissible fade show mt-4 px-4 mb-0 text-center"
              role="alert"
            >
              <i className="fas fa-check-circle d-block display-4 mt-2 mb-3 text-success"></i>
              <h5 className="text-success">Success</h5>
              <p>{statusMessage}</p>
            </div>
          )}

          {status === "error" && (
            <div
              className="alert alert-danger alert-dismissible fade show mt-4 px-4 mb-0 text-center"
              role="alert"
            >
              <i className="fa fa-exclamation-triangle d-block display-4 mt-2 mb-3 text-danger"></i>
              <h5 className="text-danger">Error</h5>
              <p>{statusMessage}</p>
            </div>
          )}

          {status === "warning" && (
            <div
              className="alert alert-border alert-border-warning alert-dismissible fade show mt-4 px-4 mb-0 text-center bg-white"
              role="alert"
            >
              <i className="fas fa-skull-crossbones d-block display-4 mt-2 mb-3 text-warning"></i>
              <h5 className="text-warning">Warning</h5>
              <p>{statusMessage}</p>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default AlertBox;
