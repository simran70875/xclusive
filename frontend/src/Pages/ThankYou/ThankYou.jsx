import React, { useState } from "react";
import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { routes } from "../../Routes/Routes";
import { setCartCount } from "../../Features/User/User";
import styles from "./index.module.scss";
import axios from "axios";
import { apiUrl } from "../../Constant";

function ThankYou() {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const [orderDetails, setOrderDetails] = useState(null);
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get("orderId") || location.state?.orderId;

  function formatDate(dateString) {
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
    const seconds = String(date.getSeconds()).padStart(2, "0");

    return `${day}-${month}-${year} ${hours}:${minutes}:${seconds}`;
  }

  useEffect(() => {
    console.log(`${apiUrl.SINGLE_ORDER_DETAILS}/${orderId}`);
    const fetchOrderDetails = async () => {
      try {
        const response = await axios.get(
          `${apiUrl.SINGLE_ORDER_DETAILS}/${orderId}`
        );
        if (response) {
          setOrderDetails(response.data.data);
          dispatch(setCartCount(0));
        }

        console.log("response = >  ", response.data.data);
      } catch (error) {
        console.error("Error fetching order details:", error);
      }
    };

    fetchOrderDetails();
  }, [orderId]);

  if (!orderDetails) {
    return <div>Loading order details...</div>;
  }

  const handleSubmit = () => {
    navigate(routes.homepageUrl);
    window.location.reload();
  };

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <div className={styles.successIcon}>
          <span>✔</span>
        </div>
        <h1>Payment Successful!</h1>
        <p className={styles.message}>
          Thank you! Your payment of Rs.{" "}
          {orderDetails?.PaymentType === "0"
            ? orderDetails?.FinalPrice
            : orderDetails?.PaymentType === "1"
            ? orderDetails?.ActualPayment + orderDetails?.walletAmount + orderDetails?.CouponPrice || orderDetails?.walletAmount + orderDetails?.CouponPrice
            : orderDetails?.cod_advance_amt}{" "}
          has been received.
        </p>

        {orderDetails?.PaymentId !== "0" && (
          <p style={{ fontSize: 13 }}>
            <strong>Transaction ID:</strong> {orderDetails?.PaymentId}
          </p>
        )}

        <div className={styles.paymentDetails}>
          <div className={styles.detailRow}>
            <span>Date:</span>
            <span>{formatDate(orderDetails?.createdAt)}</span>
          </div>
          <div className={styles.detailRow}>
            <span>Order ID:</span>
            <span>{orderDetails?.orderId}</span>
          </div>
        
          <div className={styles.detailRow}>
            <span>Total Amount:</span>
            <span>
              ₹ {orderDetails?.FinalPrice + orderDetails?.CouponPrice}{" "}
            </span>
          </div>


          {orderDetails?.cod_advance_amt > 0 && (
            <div className={styles.detailRow}>
              <span>COD advance amount:</span>
              <span>₹ {orderDetails?.cod_advance_amt}</span>
            </div>
          )}

          {orderDetails?.CouponPrice > 0 && (
            <div className={styles.detailRow}>
              <span>Coupon Amount:</span>
              <span>₹ {orderDetails?.CouponPrice}</span>
            </div>
          )}

          {orderDetails?.walletAmount > 0 && (
            <div className={styles.detailRow}>
              <span>Wallet Amount:</span>
              <span>₹ {orderDetails?.walletAmount}</span>
            </div>
          )}

         

          {orderDetails?.PaymentType != "0" &&
            orderDetails?.ActualPayment != 0 &&
            orderDetails?.FinalAdavnceCodPrice != 0 && (
              <div className={styles.detailRow}>
                <span>Online Paid:</span>
                <span>
                  ₹{" "}
                  {orderDetails?.cod_advance_amt
                    ? orderDetails?.FinalAdavnceCodPrice
                    : orderDetails?.ActualPayment}
                </span>
              </div>
            )}

          <div className={styles.detailRow}>
            <span>Payment Type:</span>
            <span>
              {orderDetails?.PaymentType === "0"
                ? "Wallet"
                : orderDetails?.PaymentType === "1"
                ? "Online"
                : "COD"}
            </span>
          </div>
          <div className={styles.detailRow}>
            <span>Payment Status:</span>
            <span>
              {orderDetails?.cod_status
                ? orderDetails?.cod_status
                : orderDetails?.payment_status}
            </span>
          </div>
        </div>

        <button
          onClick={() => handleSubmit()}
          type="button"
          className="ant-btn css-dev-only-do-not-override-1pg9a38 ant-btn-default"
          style={{
            backgroundColor: "#000",
            color: "#fff",
            marginBottom: "50px",
          }}
        >
          <span>Back to Home</span>
        </button>

        <p className={styles.contact}>
          Please email to budaiexclusive@gmail.com for any queries.
        </p>
      </div>
    </div>
  );
}

export default ThankYou;
