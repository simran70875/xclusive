import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import axios from "axios";
import { useNavigate } from "react-router-dom";
let url = process.env.REACT_APP_API_URL;

const ShowOrderDetails = () => {
  const adminToken = localStorage.getItem("token");
  const selectOrderId = useSelector((state) => state?.OrderDataChange?.payload);
  const navigate = useNavigate();
  const [orderDetails, setOrderDetails] = useState([]);

  const [addressDetails, setAddressDetails] = useState([]);
  const [productDetails, setProductDetails] = useState([]);
  const [couponDetails, setCouponDetails] = useState([]);
  const [OrderStatus, setOrderStatus] = useState();
  const [tracking_id, setTracking_id] = useState();

  const [reason, setReason] = useState(orderDetails?.reason);
  const [paymentStatus, setPaymentStatus] = useState(
    orderDetails?.payment_status || "Unpaid"
  );
  const [paymentId, setPaymentId] = useState(orderDetails?.PaymentId || "");
  const [paymentType, setPaymentType] = useState(
    orderDetails?.payment_mode || "COD"
  );

  useEffect(() => {
    async function getOrderDetails() {
      try {
        const response = await axios.get(
          `${url}/order/get/single/${selectOrderId}`,
          {
            headers: { Authorization: adminToken },
          }
        );

        const order = response?.data?.order;

        setOrderDetails(order);
        setAddressDetails(order?.Address);
        setProductDetails(order?.cartData);
        setCouponDetails(order?.Coupon);

        // ✅ sync editable fields ONCE
        setOrderStatus(order?.order_status);
        setPaymentStatus(order?.payment_status);
        setPaymentType(order?.payment_mode);
        setPaymentId(order?.PaymentId || "");
        setReason(order?.reason || "");
      } catch (error) {
        console.log(error);
      }
    }

    if (selectOrderId) {
      getOrderDetails();
    }
  }, [selectOrderId, adminToken]);

  // for create OrderStatus
  const createOrderStatus = [
    "Pending",
    "Accepted",
    "Pick Up",
    "Rejected",
    "Delivered",
    "Cancelled",
    "Returned",
  ];

  // for update OrderStatus
  const handleUpdateOrderStatus = async () => {
    const data = {
      order_status: OrderStatus,
      reason,
      trackingId: tracking_id,

      // 🔥 NEW PAYMENT FIELDS
      payment_status: paymentStatus,
      payment_mode: paymentType,
      PaymentId: paymentId,
    };

    try {
      const response = await axios.put(
        `${url}/order/update/type/${selectOrderId}`,
        data,
        {
          headers: { Authorization: adminToken },
        }
      );

      if (response?.data?.type === "success") {
        navigate("/showOrders");
      }
    } catch (error) {
      console.error(error);
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
                                    <td>£ {product?.price}</td>
                                    <td>
                                      £ {product?.Quantity * product?.price}
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
                              {couponDetails?.couponCode && (
                                <th>Coupon Details</th>
                              )}
                              <th>Final Amount</th>

                              <th>Payment Status</th>
                            </tr>
                            <tr>
                              <td>
                                <b>£ {orderDetails?.OriginalPrice}/-</b>
                              </td>
                              <td>
                                <b> + £ {orderDetails?.Shipping_Charge}/-</b>
                              </td>
                              {couponDetails?.couponCode && (
                                <td>
                                  <>
                                    {"#" + couponDetails?.couponCode} <br></br>£
                                    {orderDetails?.CouponPrice}
                                  </>
                                </td>
                              )}
                              <td>
                                <b>
                                  £{" "}
                                  {orderDetails?.OriginalPrice -
                                    orderDetails?.CouponPrice}
                                  /-
                                </b>
                              </td>

                              <td>
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
                          className="col-md-3"
                          style={{
                            color: "#AB8000",
                            textDecoration: "underline",
                          }}
                        >
                          Payment Details :
                        </label>

                        <div className="mb-3 row">
                          {/* Payment Mode */}
                          <label className="col-md-2 col-form-label">
                            Payment Type :-
                          </label>
                          <div className="col-md-10 mt-1">
                            <select
                              className="form-control"
                              value={paymentType}
                              onChange={(e) => setPaymentType(e.target.value)}
                            >
                              <option value="COD">COD</option>
                              <option value="ONLINE">Online</option>
                              <option value="BANK">Bank Transfer</option>
                            </select>
                          </div>

                          {/* Payment Status */}
                          <label className="col-md-2 col-form-label">
                            Payment Status :-
                          </label>
                          <div className="col-md-10 mt-1">
                            <select
                              className="form-control"
                              value={paymentStatus}
                              onChange={(e) => setPaymentStatus(e.target.value)}
                            >
                              <option value="Unpaid">Unpaid</option>
                              <option value="Paid">Paid</option>
                              <option value="Failed">Failed</option>
                            </select>
                          </div>

                          {/* Payment ID */}
                          <label className="col-md-2 col-form-label">
                            Payment ID :-
                          </label>
                          <div className="col-md-10 mt-1">
                            <input
                              type="text"
                              className="form-control"
                              placeholder="Transaction ID / Ref No"
                              value={paymentId}
                              onChange={(e) => setPaymentId(e.target.value)}
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
                              value={OrderStatus}
                              onChange={(e) => setOrderStatus(e.target.value)}
                              required
                            >
                              <option value="">Select Status</option>
                              {createOrderStatus.map((status) => (
                                <option key={status} value={status}>
                                  {status}
                                </option>
                              ))}
                            </select>
                          </div>

                          <label
                            htmlFor="example-text-input"
                            className="col-md-2 col-form-label"
                          >
                            Reason :-
                          </label>
                          <div className="col-md-10 mt-1">
                            <input
                              type="text"
                              name="name"
                              id="name"
                              value={orderDetails?.reason}
                              onChange={(e) => setReason(e.target.value)}
                              className="form-control"
                            />
                          </div>
                        </div>
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

                            <a
                              className="btn btn-success"
                              onClick={() => handleUpdateOrderStatus()}
                            >
                              <i className="fas fa-save"></i> Save{" "}
                            </a>
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
