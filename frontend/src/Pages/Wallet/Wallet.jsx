/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getWalletApi } from "../../Features/Wallet&Coins/WalletCoins";
import { Button, Col, Input, Modal, Row } from "antd";
import { getProfileApi } from "../../Features/User/User";
import styles from "./index.module.scss";
import moment from "moment";
import { useNavigate } from "react-router-dom";
import { routes } from "../../Routes/Routes";
import axios from "axios";
import { apiUrl } from "../../Constant";
import { toast } from "react-toastify";

function Wallet() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const userToken = useSelector((state) => state.user?.token);
  const walletData = useSelector((state) => state.walletCoins?.walletData);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [amount, setAmount] = useState();
  const profileData = useSelector((state) => state.user?.profileData);
  console.log("profileData", profileData);

  useEffect(() => {
    dispatch(getWalletApi(userToken));
    dispatch(getProfileApi(userToken));
  }, []);

  const back = () => {
    navigate(routes.homepageUrl);
  };

  const addMoney = async () => {
    if (amount > 0) {
      try {
        const response = await axios.post(
          `${apiUrl.GET_PAYMENT_GETWAY}?amounts=${amount}`,
          {
            paymentsFor: "wallet",
            device: "web",
          }
        );
        console.log("response ==> ", response);
        if (response.data.status === "NEW") {
          window.location.href = response.data.payment_links.web;
        }
      } catch (error) {
        console.log("error ==> ", error);
      }
    } else {
      toast.error("Please enter valid amount");
    }
  };

  return (
    <div>
      <>
        <h2
          style={{
            marginLeft: "45px",
          }}
        >
          Wallet
        </h2>
        <Row justify="center" className={styles.welMain}>
          <Col
            xs={22}
            md={22}
            lg={22}
            xl={22}
            xxl={22}
            className={styles.setwallet}
            style={{ display: "flex", alignItems: "center" }}
          >
            <div style={{ flex: 1 }}>
              <div className={styles.total}>₹{profileData?.Wallet}</div>
              <div className={styles.balance}>Your Wallet Balance</div>
            </div>
            <button
              onClick={() => setIsModalOpen(true)}
              className={styles.proced}
              // disabled={isRedeeming} // Disable button while redeeming
            >
              Add Money
            </button>
          </Col>

          {walletData?.length > 0 ? (
            <Col
              xs={22}
              md={22}
              lg={22}
              xl={22}
              xxl={22}
              className={styles.setdata}
            >
              <div className={styles.tran}>Transaction History</div>
              <div className={styles.set}>
                {walletData?.map((item, index) => (
                  <>
                    <div className={styles.setting} key={index}>
                      <div>
                        <p>{item?.Description}</p>
                        <p>{moment(item?.createdAt).format("LL")}</p>
                      </div>
                      <p
                        className={
                          item?.Trans_Type === "Debit"
                            ? styles.money
                            : styles.credit
                        }
                      >
                        {item?.Trans_Type === "Debit" ? "-" : "+"} ₹
                        {item?.Amount}
                      </p>
                    </div>
                    <div className={styles.blank}></div>
                  </>
                ))}
              </div>
            </Col>
          ) : (
            <div style={{display: "flex", justifyContent: "center",flexDirection:'column'}}>
              <p
                style={{
                  fontSize: "20px",
                }}
              >
                No Wallet History Found!
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
            </div>
          )}
        </Row>
      </>

      <Modal
        open={isModalOpen}
        onCancel={() => {
          setIsModalOpen(false);
        }}
        footer={null}
      >
        <div>
          {profileData?.User_Type === "1" ? (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-evenly",
              }}
            >
              <button
                onClick={() => setAmount(25000)}
                style={{
                  backgroundColor: amount === 25000 ? "green" : "grey",
                }}
                className={styles.proced2}
              >
                25000
              </button>
              <button
                onClick={() => setAmount(50000)}
                style={{
                  backgroundColor: amount === 50000 ? "green" : "grey",
                }}
                className={styles.proced2}
              >
                50000
              </button>
            </div>
          ) : profileData?.User_Type === "2" ? (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-evenly",
              }}
            >
              <button
                onClick={() => setAmount(500)}
                style={{
                  backgroundColor: amount === 500 ? "green" : "grey",
                }}
                className={styles.proced2}
              >
                500
              </button>
              <button
                onClick={() => setAmount(2000)}
                style={{
                  backgroundColor: amount === 2000 ? "green" : "grey",
                }}
                className={styles.proced2}
              >
                2000
              </button>
              <button
                onClick={() => setAmount(5000)}
                style={{
                  backgroundColor: amount === 5000 ? "green" : "grey",
                }}
                className={styles.proced2}
              >
                5000
              </button>
            </div>
          ) : (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Input
                type="number"
                size="large"
                style={{ width: "80%" }}
                placeholder="Enter amount"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
            </div>
          )}
          <div
            style={{
              marginTop: "20px",
              display: "flex",
              justifyContent: "center",
            }}
          >
            <button
              onClick={() => addMoney()}
              className={styles.proced}
              // disabled={isRedeeming} // Disable button while redeeming
            >
              Add to wallet
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

export default Wallet;
