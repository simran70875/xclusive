import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./index.module.scss";
import { toast } from "react-toastify";
import { routes } from "../../Routes/Routes";

function Error() {
  const navigate = useNavigate();
  useEffect(() => {
    const fetchwalletDetails = async () => {
      try {
        navigate(routes.walletUrl);
        toast.error("Paymnet Failed");
      } catch (error) {
        console.error("Error fetching wallet details:", error);
      }
    };

    fetchwalletDetails();
  }, []);

  return (
    <div className={styles.container}>
    </div>
  );
}

export default Error;
