/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  getNotificationApi,
  getWalletApi,
} from "../../../Features/Wallet&Coins/WalletCoins";
import { Button, Col, Row } from "antd";
import { getProfileApi } from "../../../Features/User/User";
import styles from "./index.module.scss";
import moment from "moment";
import { useNavigate } from "react-router-dom";
import { routes } from "../../../Routes/Routes";

function Notification() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const userToken = useSelector((state) => state.user?.token);
  // const walletData = useSelector((state) => state.walletCoins?.walletData);
  // console.log("walletData", walletData);
  //   const profileData = useSelector((state) => state.user?.profileData);
  const NotificationData = useSelector(
    (state) => state.walletCoins?.notificationData
  );
  // console.log("NotificationData", NotificationData);

  useEffect(() => {
    dispatch(getWalletApi(userToken));
    dispatch(getProfileApi(userToken));
    dispatch(getNotificationApi(userToken));
  }, []);

  const back = () => {
    navigate(routes.homepageUrl);
  };

  return (
    <div>
      {NotificationData?.length > 0 ? (
        <>
          <Row justify="center" className={styles.welMain}>
            <h2>Notifications</h2>
            {/* <Col xl={22} xxl={22} className={styles.setwallet}>
          <div className={styles.total}>₹{profileData?.Wallet}</div>
          <div className={styles.balance}>Your Wallet Balance</div>
        </Col> */}
            <Col
              xs={22}
              md={22}
              lg={22}
              xl={22}
              xxl={22}
              className={styles.setdata}
            >
              {/* <div className={styles.tran}>Notification History</div> */}
              <div className={styles.set}>
                {NotificationData?.map((item, index) => (
                  <>
                    <div className={styles.setting} key={index}>
                      <div>
                        <p className={styles.first}>{item?.title}</p>
                        <p className={styles.second}>{item?.message}</p>
                        <p>{moment(item?.createdAt).format("LL")}</p>
                      </div>
                      {/* <p
                    className={
                      item?.Trans_Type === "Debit"
                        ? styles.money
                        : styles.credit
                    }
                  >
                    {item?.Trans_Type === "Debit" ? "-" : "+"} ₹{item?.Amount}
                  </p> */}
                    </div>
                    <div className={styles.blank}></div>
                  </>
                ))}
              </div>
            </Col>
          </Row>
        </>
      ) : (
        <>
          <p
            style={{
              fontSize: "20px",
            }}
          >
            No Notification Found!
          </p>
          <Button
            style={{
              background: "black",
              color: "white",
              marginBottom: "50px",
            }}
            onClick={back}
          >
            Back to Home
          </Button>
        </>
      )}
    </div>
  );
}

export default Notification;
