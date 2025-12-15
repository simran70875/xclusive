import { useState, useEffect } from "react";
import axios from "axios";
import AlertBox from "../../../../Components/AlertComp/AlertBox";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";

let url = process.env.REACT_APP_API_URL;
// chrom job

const EditCoupon = () => {
  const adminToken = localStorage.getItem("token");
  const selectedCouponData = useSelector(
    (state) => state?.CouponDataChange?.payload
  );
  const Navigate = useNavigate();
  const couponId = selectedCouponData;
  const [couponCode, setCouponCode] = useState("");
  const [discountAmount, setDiscountAmount] = useState(1);
  const [expiryDate, setExpiryDate] = useState("");
  const [createDate, setCreateDate] = useState("");
  const [usageLimits, setUsageLimits] = useState(1);
  const [couponUpdateStatus, setCouponUpdateStatus] = useState();
  const [statusMessage, setStatusMessage] = useState("");

  useEffect(() => {
    async function getCouponDetails() {
      try {
        const response = await axios.get(
          `${url}/coupon/get/single/${couponId}`,
          {
            headers: {
              Authorization: `${adminToken}`,
            },
          }
        );

        if (response.data.type === "success") {
          const couponData = response.data.coupon;
          setCouponCode(couponData.couponCode);
          setDiscountAmount(couponData.discountAmount);
          setExpiryDate(formatDate(couponData.expiryDate));
          setCreateDate(formatDate(couponData.creationDate));
          setUsageLimits(couponData.usageLimits);
        }
      } catch (error) {
        console.log(error);
      }
    }

    function formatDate(dateString) {
      const date = new Date(dateString);
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const day = String(date.getDate()).padStart(2, "0");
      return `${year}-${month}-${day}`;
    }

    getCouponDetails();
  }, [couponId]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (couponCode && discountAmount && expiryDate && usageLimits) {
      const formData = {
        couponCode: couponCode,
        discountAmount: discountAmount,
        creationDate: createDate,
        expiryDate: expiryDate,
        usageLimits: usageLimits,
      };

      try {
        let response = await axios.put(
          `${url}/coupon/update/admin/${couponId}`,
          formData,
          {
            headers: {
              Authorization: `${adminToken}`,
            },
          }
        );
        if (response.data.type === "success") {
          setCouponUpdateStatus(response.data.type);
          let alertBox = document.getElementById("alert-box");
          alertBox.classList.add("alert-wrapper");
          setStatusMessage(response.data.message);
          setTimeout(() => {
            Navigate("/showCoupon");
          }, 900);
        } else {
          setCouponUpdateStatus(response.data.type);
          let alertBox = document.getElementById("alert-box");
          alertBox.classList.add("alert-wrapper");
          setStatusMessage(response.data.message);
        }
      } catch (error) {
        setCouponUpdateStatus("error");
        let alertBox = document.getElementById("alert-box");
        alertBox.classList.add("alert-wrapper");
        setStatusMessage("Coupon not updated!");
      }
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      setCouponUpdateStatus("");
      setStatusMessage("");
      let alertBox = document?.getElementById("alert-box");
      alertBox?.classList?.remove("alert-wrapper");
    }, 1500);

    return () => clearTimeout(timer);
  }, [couponUpdateStatus, statusMessage]);

  return (
    <>
      <div className="main-content dark">
        <div className="page-content">
          <div className="container-fluid">
            <div className="row">
              <div className="col-12">
                <div className="page-title-box d-flex align-items-center justify-content-between">
                  <h4 className="mb-0">Edit Coupon</h4>
                </div>
              </div>
            </div>
            <div className="row">
              <div className="col-12">
                <div className="card">
                  <div className="card-body">
                    <form onSubmit={handleSubmit}>
                      <div className="mb-3 row">
                        <label
                          htmlFor="couponCode"
                          className="col-md-2 col-form-label"
                        >
                          Coupon Code:
                        </label>
                        <div className="col-md-10">
                          <input
                            required
                            className="form-control"
                            type="text"
                            id="couponCode"
                            value={couponCode}
                            disabled
                            onChange={(e) => setCouponCode(e.target.value)}
                          />
                        </div>
                      </div>
                      <div className="mb-3 row">
                        <label
                          htmlFor="discountAmount"
                          className="col-md-2 col-form-label"
                        >
                          Discount Amount:
                        </label>
                        <div className="col-md-10">
                          <input
                            min={1}
                            required
                            className="form-control"
                            type="number"
                            id="discountAmount"
                            value={discountAmount}
                            onChange={(e) => setDiscountAmount(e.target.value)}
                          />
                        </div>
                      </div>

                      <div className="mb-3 row">
                        <label
                          htmlFor="createDate"
                          className="col-md-2 col-form-label"
                        >
                          Start Date:
                        </label>
                        <div className="col-md-10">
                          <input
                            required
                            className="form-control"
                            type="date"
                            id="createDate"
                            value={createDate}
                            onChange={(e) => setCreateDate(e.target.value)}
                          />
                        </div>
                      </div>
                      <div className="mb-3 row">
                        <label
                          htmlFor="expiryDate"
                          className="col-md-2 col-form-label"
                        >
                          End Date:
                        </label>
                        <div className="col-md-10">
                          <input
                            required
                            className="form-control"
                            type="date"
                            id="expiryDate"
                            value={expiryDate}
                            onChange={(e) => setExpiryDate(e.target.value)}
                          />
                        </div>
                      </div>
                      <div className="mb-3 row">
                        <label
                          htmlFor="usageLimits"
                          className="col-md-2 col-form-label"
                        >
                          Usage Limits:
                        </label>
                        <div className="col-md-10">
                          <input
                            min={1}
                            required
                            className="form-control"
                            type="number"
                            id="usageLimits"
                            value={usageLimits}
                            onChange={(e) => setUsageLimits(e.target.value)}
                          />
                        </div>
                      </div>

                      <div className="row mb-10">
                        <div className="col ms-auto">
                          <div className="d-flex flex-reverse flex-wrap gap-2">
                            <a
                              className="btn btn-danger"
                              onClick={() => Navigate(`/showCoupon`)}
                            >
                              {" "}
                              <i className="fas fa-window-close"></i> Cancel{" "}
                            </a>
                            <button className="btn btn-success" type="submit">
                              {" "}
                              <i className="fas fa-save"></i> Update{" "}
                            </button>
                          </div>
                        </div>
                      </div>
                    </form>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <AlertBox status={couponUpdateStatus} statusMessage={statusMessage} />
      </div>
    </>
  );
};

export default EditCoupon;
