import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import axios from "axios";
import { apiUrl } from "../../Constant";
import styles from "./index.module.scss";

function PaymentError() {
  const [orderDetails, setOrderDetails] = useState(null);
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get("orderId");

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
    const seconds = String(date.getSeconds()).padStart(2, "0");

    return `${day}-${month}-${year} ${hours}:${minutes}:${seconds}`;
  };

  useEffect(() => {
    const fetchOrderDetails = async () => {
      try {
        const response = await axios.get(
          `${apiUrl.SINGLE_ORDER_DETAILS}/${orderId}`
        );
        setOrderDetails(response.data.data);
      } catch (error) {
        console.error("Error fetching order details:", error);
      }
    };

    if (orderId) {
      fetchOrderDetails();
    }
  }, [orderId]);

  if (!orderDetails) {
    return <div style={{ padding: "40px" }}>Loading order details...</div>;
  }

  return (
    <div className={styles.container}>
      <div className={styles.cardCancle}>
        <div className={styles.successIcon}>
          <span style={{ color: "red" }}>ⓘ</span>
        </div>
        <h1 style={{ color: "red" }}>Payment Pending</h1>
        <p className={styles.message}>
          Thank you for your order. Unfortunately, we were unable to process the
          full payment of Rs. {orderDetails?.ActualPayment}. The transaction
          remains incomplete.
        </p>
        <p style={{ fontSize: 13 }}>
          <strong>Transaction ID:</strong> {orderDetails?.PaymentId}
        </p>

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
            <span>£ {orderDetails?.ActualPayment}</span>
          </div>
          <div className={styles.detailRow}>
            <span>Discount Price:</span>
            <span>£ {orderDetails?.DiscountPrice || 0}</span>
          </div>
          <div className={styles.detailRow}>
            <span>Shipping Charges:</span>
            <span>£ {orderDetails?.Shipping_Charge || 0}</span>
          </div>
          <div className={styles.detailRow}>
            <span>Payment Status:</span>
            <span>{orderDetails?.payment_status || "Pending"}</span>
          </div>
        </div>

        <p className={styles.contact}>
          Please reach out to our support team at budaiexclusive@gmail.com for
          assistance.
        </p>
      </div>
    </div>
  );
}

export default PaymentError;
