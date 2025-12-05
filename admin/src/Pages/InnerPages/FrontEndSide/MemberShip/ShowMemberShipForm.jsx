import React from "react";

const ShowMemberShipForm = ({ handleCloseModal, selectedForm }) => {
  return (
    <>
      <div className="main-content-model dark">
        <div className="page-content">
          <div className="container-fluid">
            <div className="row">
              <div className="col-12">
                <div className="card model-card">
                  <div className="card-body">
                    <div className="page-title-box d-flex align-items-center justify-content-between">
                      <h4 className="mb-0">MemberShip Form</h4>
                      <i
                        className="fas fa-window-close"
                        style={{ cursor: "pointer", color: "red" }}
                        onClick={handleCloseModal}
                      ></i>
                    </div>
                    <div className="mb-3 row">
                      <label
                        htmlFor="example-text-input"
                        className="col-md-2 col-form-label"
                      >
                        Firm Name:
                      </label>
                      <div className="col-md-10">
                        <input
                          required
                          className="form-control"
                          type="text"
                          id="example-text-input"
                          value={selectedForm?.Firm_Name}
                          readOnly
                        />
                      </div>
                    </div>
                    <div className="mb-3 row">
                      <label
                        htmlFor="example-text-input"
                        className="col-md-2 col-form-label"
                      >
                        Full Address:
                      </label>
                      <div className="col-md-10">
                        <textarea
                          required
                          className="form-control"
                          id="example-text-input"
                          value={selectedForm?.Full_Address}
                          readOnly
                        />
                      </div>
                    </div>
                    <div className="mb-3 row">
                      <label
                        htmlFor="example-text-input"
                        className="col-md-2 col-form-label"
                      >
                        GST No:
                      </label>
                      <div className="col-md-10">
                        <input
                          required
                          className="form-control"
                          type="text"
                          id="example-text-input"
                          value={selectedForm?.Gst_No}
                          readOnly
                        />
                      </div>
                    </div>
                    <div className="mb-3 row">
                      <label
                        htmlFor="example-text-input"
                        className="col-md-2 col-form-label"
                      >
                        Number of Order:
                      </label>
                      <div className="col-md-10">
                        <input
                          required
                          className="form-control"
                          type="text"
                          id="example-text-input"
                          value={selectedForm?.No_Order}
                          readOnly
                        />
                      </div>
                    </div>
                    <div className="mb-3 row">
                      <label
                        htmlFor="example-text-input"
                        className="col-md-2 col-form-label"
                      >
                        Certificate:
                      </label>
                      <div className="col-md-10">
                        <input
                          required
                          className="form-control"
                          type="text"
                          id="example-text-input"
                          value={
                            selectedForm?.Certificate === "1" ? "Yes" : "No"
                          }
                          readOnly
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ShowMemberShipForm;
