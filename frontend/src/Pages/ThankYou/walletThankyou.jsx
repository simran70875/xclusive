import React, { useState } from "react";
import { useEffect } from "react";
import { useSelector } from "react-redux";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { routes } from "../../Routes/Routes";
import styles from "./index.module.scss";
import axios from "axios";
import { apiUrl } from "../../Constant";
import { toast } from "react-toastify";

function WalletThankYou() {
  const navigate = useNavigate();
  const location = useLocation();
  const [walletDetails, setWalletDetails] = useState(null);
  const [searchParams] = useSearchParams();
  const amount = searchParams.get("amount") || location.state?.amount;
  const paymentId = searchParams.get("paymentId") || location.state?.paymentId;
  const message = searchParams.get("message") || location.state?.message;
  const userToken = useSelector((state) => state.user?.token);

  useEffect(() => {
    const fetchwalletDetails = async () => {
      try {
        if (message) {
          navigate(routes.walletUrl);
          toast.error(message);
        } else {
          const response = await axios.post(
            `${apiUrl.ADD_WALLET}`,
            { amount, paymentId },
            {
              headers: {
                Authorization: userToken,
              },
            }
          );
          console.log("response ===>", response);
          if (response) {
            setWalletDetails(response.data);
            navigate(routes.walletUrl);
            toast.success(response.data.message);
          }
        }
      } catch (error) {
        console.error("Error fetching wallet details:", error);
        navigate(routes.walletUrl);
        toast.error("Failed to fetch wallet details. Please try again.");
      }
    };

    fetchwalletDetails();
  }, [userToken, amount, paymentId, message, navigate]);

  if (!walletDetails) {
    return <div>Loading order details...</div>;
  }

  const handleSubmit = () => {
    navigate(routes.walletUrl);
    
  };
  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <div className={styles.successIcon}>
          <span>✔</span>
        </div>
        <h1>Payment added to wallet successful!</h1>
        <p className={styles.message}>
          Thank you! Your payment {walletDetails.amount} has been added to
          wallet check you wallet.
        </p>

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
          <span>Check Wallet</span>
        </button>

        <p className={styles.contact}>
          Please email to budaiexclusive@gmail.com for any queries.
        </p>
      </div>
    </div>
  );
}

export default WalletThankYou;
