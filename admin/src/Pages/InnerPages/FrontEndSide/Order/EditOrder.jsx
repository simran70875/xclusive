import React, { useEffect, useState } from "react";
// import './ShowOrderDetails.css'
import { useSelector } from "react-redux";
import axios from "axios";
import { useNavigate } from "react-router-dom";
let url = process.env.REACT_APP_API_URL;

const ShowOrderDetails = () => {
  const adminToken = localStorage.getItem("token");
  // this data provided by redux store
  const selectOrderId = useSelector((state) => state?.OrderDataChange?.payload);
  const navigate = useNavigate();
  const [orderDetails, setOrderDetails] = useState([]);
  const [addressDetails, setAddressDetails] = useState([]);
  const [productDetails, setProductDetails] = useState([]);
  const [couponDetails, setCouponDetails] = useState([]);
  const [orderType, setOrderType] = useState();
  const [tracking_id, setTracking_id] = useState();

  useEffect(() => {
    // console.log(selectOrderId);
    async function getOrderDetails() {
      try {
        let response = await axios.get(
          `${url}/order/get/single/${selectOrderId}`,
          {
            headers: {
              Authorization: `${adminToken}`,
            },
          }
        );
        setOrderDetails(response?.data?.order);
        setAddressDetails(orderDetails.Address);
        setProductDetails(orderDetails?.cartData);
        setCouponDetails(orderDetails?.Coupon);
      } catch (error) {
        console.log(error);
      }
    }

    getOrderDetails();
  }, [
    adminToken,
    productDetails,
    selectOrderId,
    orderDetails,
    addressDetails,
    couponDetails,
  ]);

  // for create orderType
  const createOrderType = [
    "Pending",
    "Accepted",
    "Pick Up",
    "Rejected",
    "Delivered",
    // "Cancelled",
    "Returned",
  ];

  // for update orderType
  const handleUpdateOrderType = async () => {
    let paymentStatus;

    if (orderType === "5" && orderDetails?.cod_status === "Paid") {
      paymentStatus = "Paid";
    }

    console.log("orderType", orderType, paymentStatus);
    const data = {
      orderType: orderType,
      UserName: orderDetails?.User_Name,
      trackingId: tracking_id,
      payment_status: paymentStatus,
    };

    const urlApi = `${url}/order/update/type/${selectOrderId}`;
    console.log("data ==>", data, urlApi);
    let response = await axios.put(urlApi, data, {
      headers: {
        Authorization: `${adminToken}`,
      },
    });
    console.log("response ==>", response);
    if (response?.data?.type === "success") {
      navigate("/showOrders");
    } else {
      console.log(`error`);
    }
  };

  return (
    <>
      <div className="main-content dark">
        <div className="page-content">
          <div className="container-fluid">
            <div className="row">
              <div className="col-2 table-heading">Edit Orders</div>
              <div className="col-12 mt-2">
                <div className="card">
                  <div className="card-body">
                    <form>
                      <div className="mt-2">
                        <label
                          htmlFor="example-text-input"
                          className="col-md-3"
                          style={{
                            color: "#AB8000",
                            textDecoration: "underline",
                          }}
                        >
                          User Details :
                        </label>
                        <div className="mb-3 row">
                          <label
                            htmlFor="example-text-input"
                            className="col-md-2 col-form-label"
                          >
                            User Name :-
                          </label>
                          <div className="col-md-10 mt-1">
                            <input
                              type="text"
                              name="name"
                              id="name"
                              value={orderDetails?.User_Name}
                              className="form-control"
                              readOnly
                            />
                          </div>
                          <label
                            htmlFor="example-text-input"
                            className="col-md-2 col-form-label"
                          >
                            Mobile Number :-
                          </label>
                          <div className="col-md-10 mt-1">
                            <input
                              type="text"
                              name="phone"
                              id="phone"
                              value={orderDetails?.User_Mobile_No}
                              className="form-control"
                              readOnly
                            />
                          </div>
                        </div>
                      </div>

                      <div className="mt-2">
                        <label
                          htmlFor="example-text-input"
                          className="col-md-3"
                          style={{
                            color: "#AB8000",
                            textDecoration: "underline",
                          }}
                        >
                          Delivery Details :
                        </label>
                        <div className="mb-3 row">
                          <label
                            htmlFor="example-text-input"
                            className="col-md-2 col-form-label"
                          >
                            Type:-
                          </label>
                          <div className="col-md-10 mt-1">
                            <input
                              type="text"
                              name="name"
                              id="name"
                              value={addressDetails?.Type}
                              className="form-control"
                              readOnly
                            />
                          </div>
                          <label
                            htmlFor="example-text-input"
                            className="col-md-2 col-form-label"
                          >
                            {addressDetails?.Type} no :-
                          </label>
                          <div className="col-md-10 mt-1">
                            <input
                              type="text"
                              name="name"
                              id="name"
                              value={addressDetails?.House}
                              className="form-control"
                              readOnly
                            />
                          </div>
                          <label
                            htmlFor="example-text-input"
                            className="col-md-2 col-form-label"
                          >
                            Full Address:-
                          </label>
                          <div className="col-md-10 mt-1">
                            <textarea
                              type="text"
                              name="name"
                              id="name"
                              value={addressDetails?.Full_Address}
                              className="form-control"
                              readOnly
                            />
                          </div>
                          <label
                            htmlFor="example-text-input"
                            className="col-md-2 col-form-label"
                          ></label>
                          <div className="col-md-4 mt-1">
                            <input
                              type="text"
                              name="name"
                              id="name"
                              value={addressDetails?.City}
                              className="form-control"
                              readOnly
                            />
                          </div>
                          <div className="col-md-3 mt-1">
                            <input
                              type="text"
                              name="name"
                              id="name"
                              value={addressDetails?.State}
                              className="form-control"
                              readOnly
                            />
                          </div>
                          <div className="col-md-3 mt-1">
                            <input
                              type="text"
                              name="name"
                              id="name"
                              value={addressDetails?.Pincode}
                              className="form-control"
                              readOnly
                            />
                          </div>
                          <label
                            htmlFor="example-text-input"
                            className="col-md-2 col-form-label"
                          >
                            Contact Number :-
                          </label>
                          <div className="col-md-4 mt-1">
                            <input
                              type="text"
                              name="phone"
                              id="phone"
                              value={addressDetails?.Phone_Number}
                              className="form-control"
                              readOnly
                            />
                          </div>
                        </div>
                      </div>

                      <div className="mt-2">
                        <label
                          htmlFor="example-text-input"
                          className="col-md-3"
                          style={{
                            color: "#AB8000",
                            textDecoration: "underline",
                          }}
                        >
                          Order Details :
                        </label>
                        <div className="mb-3 row">
                          <label
                            htmlFor="example-text-input"
                            className="col-md-2 col-form-label"
                          >
                            Order Id :-
                          </label>
                          <div className="col-md-10 mt-1">
                            <input
                              type="text"
                              name="name"
                              id="name"
                              value={orderDetails?.orderId}
                              className="form-control"
                              readOnly
                            />
                          </div>
                        </div>
                      </div>

                      <div className="form-group mt-3">
                        <label className="col-md-2 control-label">
                          Product details :-
                        </label>
                        <div className="col-md-12 ">
                          <table id="t01" style={{ width: "100%" }} border="1">
                            <tr>
                              <th>Product</th>
                              <th>SKU Code</th>
                              <th>Image</th>
                              <th>Color</th>
                              <th>Size</th>
                              <th>Quantity</th>
                              <th>Price</th>
                              <th>Total Price</th>
                            </tr>

                            {productDetails &&
                              productDetails?.map((product, index) => {
                                return (
                                  <tr key={index}>
                                    <td>
                                      {product?.product?.Product_Name?.slice(
                                        0,
                                        30
                                      ) + "..."}
                                    </td>
                                    <td>{product?.product?.SKU_Code}</td>
                                    <td>
                                      {
                                        <img
                                          src={product.variationImage}
                                          alt="Product Image"
                                          style={{
                                            width: "50px",
                                            height: "50px",
                                          }}
                                        />
                                      }
                                    </td>
                                    <td>
                                      {product?.variation?.Variation_Name}
                                    </td>
                                    <td>{product?.SizeName}</td>
                                    <td>{product?.Quantity}</td>
                                    <td>₹ {product?.discountPrice}</td>
                                    <td>
                                      ₹{" "}
                                      {product?.Quantity *
                                        product?.discountPrice}
                                    </td>
                                  </tr>
                                );
                              })}
                          </table>
                        </div>
                      </div>

                      <div className="form-group mt-3">
                        <label className="col-md-2 control-label">
                          Amount Details :-
                        </label>
                        <div className="col-md-12 orderDetailsTable">
                          <table id="t01" style={{ width: "100%" }} border="1">
                            <tr>
                              <th>Total Amount</th>
                              <th>Shipping Charges</th>
                              <th>Final Amount</th>
                              {couponDetails?.couponCode && (
                                <th>Coupon Details</th>
                              )}
                              {orderDetails?.cod_advance_amt && (
                                <th>Charge in COD</th>
                              )}

                              {orderDetails?.wallet == true && (
                                <th>Wallet Amount</th>
                              )}
                              {orderDetails?.PaymentType != "Wallet" && (
                                <th>Online Paid Amount</th>
                              )}

                              {orderDetails?.PaymentType ==
                                "Cash On Delivery" && <th>Pending Amount</th>}

                              <th>Payment Status</th>
                            </tr>
                            <tr>
                              <td>
                                <b>₹ {orderDetails?.DiscountPrice}/-</b>
                              </td>
                              <td>
                                <b>₹ {orderDetails?.Shipping_Charge}/-</b>
                              </td>
                              <td>
                                <b>
                                  ₹{" "}
                                  {orderDetails?.FinalPrice +
                                    orderDetails?.CouponPrice}
                                  /-
                                </b>
                              </td>

                              {couponDetails?.couponCode && (
                                <td>
                                  <>
                                    {"#" + couponDetails?.couponCode} <br></br>₹
                                    {orderDetails?.CouponPrice}
                                  </>
                                </td>
                              )}

                              {orderDetails?.cod_advance_amt > 0 && (
                                <td>₹ {orderDetails?.cod_advance_amt}/-</td>
                              )}

                              {orderDetails?.wallet == true && (
                                <td>₹{orderDetails?.walletAmount}</td>
                              )}

                              {orderDetails?.PaymentType != "Wallet" && (
                                <th>
                                  ₹
                                  {orderDetails?.PaymentType == "Online Payment"
                                    ? orderDetails?.ActualPayment
                                    : orderDetails?.FinalAdavnceCodPrice}
                                </th>
                              )}

                              {orderDetails?.PaymentType ==
                                "Cash On Delivery" && (
                                <td>
                                  <b>
                                    ₹{" "}
                                    {orderDetails?.FinalPrice -
                                      orderDetails?.cod_advance_amt}
                                    /-
                                  </b>
                                </td>
                              )}

                              <td>
                                {orderDetails?.PaymentType ===
                                  "Cash On Delivery" && (
                                  <>
                                    <b>
                                      COD Payment Status :{" "}
                                      {orderDetails?.cod_status}
                                    </b>
                                    <br></br>
                                  </>
                                )}

                                <b>
                                  Payment Status :{" "}
                                  {orderDetails?.payment_status}
                                </b>
                              </td>
                            </tr>
                          </table>
                        </div>
                      </div>
                      <br />

                      <div className="mt-2">
                        <label
                          htmlFor="example-text-input"
                          className="col-md-3"
                          style={{
                            color: "#AB8000",
                            textDecoration: "underline",
                          }}
                        >
                          Payment Details :
                        </label>
                        <div className="mb-3 row">
                          <label
                            htmlFor="example-text-input"
                            className="col-md-2 col-form-label"
                          >
                            Payment Type :-
                          </label>
                          <div className="col-md-10 mt-1">
                            <input
                              type="text"
                              name="name"
                              id="name"
                              value={orderDetails?.PaymentType}
                              className="form-control"
                              readOnly
                            />
                          </div>
                          <label
                            htmlFor="example-text-input"
                            className="col-md-2 col-form-label"
                          >
                            Payment Id :-
                          </label>
                          <div className="col-md-10 mt-1">
                            <input
                              type="text"
                              name="name"
                              id="name"
                              value={
                                orderDetails?.PaymentId !== "0"
                                  ? orderDetails?.PaymentId
                                  : null
                              }
                              className="form-control"
                              readOnly
                            />
                          </div>

                          <label
                            htmlFor="example-text-input"
                            className="col-md-2 col-form-label"
                          >
                            Tracking Id :-
                          </label>
                          <div className="col-md-10 mt-1">
                            <input
                              type="text"
                              name="name"
                              id="name"
                              value={
                                orderDetails?.tracking_id
                                  ? orderDetails?.tracking_id
                                  : tracking_id
                              }
                              className="form-control"
                              onChange={(e) => setTracking_id(e.target.value)}
                            />
                          </div>

                          <label
                            htmlFor="example-text-input"
                            className="col-md-2 col-form-label"
                          >
                            Date & time :-
                          </label>
                          <div className="col-md-5 mt-1">
                            <input
                              type="text"
                              name="name"
                              id="name"
                              value={new Date(
                                orderDetails?.createdAt
                              ).toLocaleDateString()}
                              className="form-control"
                              readOnly
                            />
                          </div>
                          <div className="col-md-5 mt-1">
                            <input
                              type="text"
                              name="name"
                              id="name"
                              value={new Date(
                                orderDetails?.createdAt
                              ).toLocaleTimeString()}
                              className="form-control"
                              readOnly
                            />
                          </div>
                        </div>
                      </div>

                      <div className="mt-2">
                        <label
                          htmlFor="example-text-input"
                          className="col-md-3"
                          style={{
                            color: "#AB8000",
                            textDecoration: "underline",
                          }}
                        >
                          Order Status :
                        </label>
                        {!orderDetails?.OrderType ? (
                          <p style={{ color: "red", fontSize: "20px" }}>
                            Failed
                          </p>
                        ) : (
                          <div className="mb-3 row">
                            <label
                              htmlFor="example-text-input"
                              className="col-md-2 col-form-label"
                            >
                              Order Status :-
                            </label>
                            <div className="col-md-10 mt-1">
                              <select
                                name="o_type"
                                id="o_type"
                                style={{ width: "30%", height: "100%" }}
                                className="select2"
                                onChange={(e) => {
                                  setOrderType(e.target.value);
                                  console.log(e.target.value);
                                  console.log(orderDetails?.OrderType);
                                }}
                                required
                              >
                                {createOrderType?.map((orderType, index) => {
                                  if (orderDetails?.OrderType === orderType) {
                                    return (
                                      <option
                                        key={index}
                                        value={index + 1}
                                        selected
                                      >
                                        {orderType}
                                      </option>
                                    );
                                  } else {
                                    return (
                                      <option key={index} value={index + 1}>
                                        {orderType}
                                      </option>
                                    );
                                  }
                                })}
                              </select>
                            </div>
                            <label
                              htmlFor="example-text-input"
                              className="col-md-2 col-form-label"
                            >
                              Order Cancel Reason :-
                            </label>
                            <div className="col-md-10 mt-1">
                              <input
                                type="text"
                                name="name"
                                id="name"
                                value={orderDetails?.reason}
                                className="form-control"
                                readOnly
                              />
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="row mb-10">
                        <div className="col ms-auto">
                          <div className="d-flex flex-reverse flex-wrap gap-2">
                            <a
                              className="btn btn-danger"
                              onClick={() => navigate("/showOrders")}
                            >
                              {" "}
                              <i className="fas fa-window-close"></i> Cancel{" "}
                            </a>
                            {!orderDetails?.OrderType ? (
                              <a
                                className="btn btn-success"
                                onClick={() => navigate("/showOrders")}
                              >
                                <i className="fas fa-save"></i> Go to Orders{" "}
                              </a>
                            ) : (
                              <a
                                className="btn btn-success"
                                onClick={() => handleUpdateOrderType()}
                              >
                                {" "}
                                <i className="fas fa-save"></i> Save{" "}
                              </a>
                            )}
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
      </div>
    </>
  );
};

export default ShowOrderDetails;
