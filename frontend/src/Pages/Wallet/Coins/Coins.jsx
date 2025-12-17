/* eslint-disable react-hooks/exhaustive-deps */
import moment from "moment";
import { Button, Col, Image, Row } from "antd";
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

import { getProfileApi } from "../../../Features/User/User";
import coin from "../../../Assets/PNG/coin.png";
import { getCoinsApi } from "../../../Features/Wallet&Coins/WalletCoins";

import styles from "./index.module.scss";

import { useNavigate } from "react-router-dom";
import { routes } from "../../../Routes/Routes";
import axios from "axios";
import { apiUrl } from "../../../Constant";
import { toast } from "react-toastify";

function Coins() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const userToken = useSelector((state) => state.user?.token);
  const coinsData = useSelector((state) => state.walletCoins?.coinsData);
  // console.log("coinsData", coinsData);
  const profileData = useSelector((state) => state.user?.profileData);

  // State to manage the redeem button status
  const [isRedeeming, setIsRedeeming] = useState(false);

  // console.log("profileData", profileData);
  useEffect(() => {
    dispatch(getCoinsApi(userToken));
    dispatch(getProfileApi(userToken));
  }, [dispatch, userToken]);

  const back = () => {
    navigate(routes.homepageUrl);
  };

  const handleRedeem = async () => {
    setIsRedeeming(true); // Disable button during redeem
    console.log("pressed");

    try {
      const response = await axios.post(
        apiUrl.REDEEM_COINS,
        {
          amount: profileData?.Coins,
        },
        {
          headers: {
            Authorization: userToken,
          },
        }
      );

      // Handle successful response
      console.log(response.data);
      toast.success("Coins redeemed successfully");

      // Navigate and reload coins history
      navigate("/walletHistory");
    } catch (error) {
      // Handle error
      console.error("Error redeeming coins:", error);
      if (error.response) {
        // Server responded with a status other than 2xx
        console.error("Error response data:", error.response.data);
      } else {
        // Network or other errors
        console.error("Network error or other issues");
      }
    }
  };

  return (
    <div>
      {coinsData?.length > 0 ? (
        <>
          <h2
            style={{
              marginLeft: "45px",
            }}
          >
            My Rewards
            <Image preview={false}
              src={coin}
              alt="coin"
              className={styles.setimg}
              width={30}
              height={30}
              
              style={{
                marginLeft: "10px",
              }}
            />
          </h2>
          <Row justify="center" className={styles.welMain}>
            <Col
              xs={22}
              md={22}
              lg={22}
              xl={22}
              xxl={22}
              style={{
                flexDirection: "row",
                display: "flex",
                alignItems: "center",
              }}
              className={styles.setwallet}
            >
              <div style={{ flex: 1 }}>
                <div className={styles.total}>₹{profileData?.Coins}</div>
                <div className={styles.balance}>Your Rewarded Coins</div>
              </div>
              {profileData?.Coins >= 1000 && (
                <button
                  onClick={handleRedeem}
                  className={styles.proced}
                  disabled={isRedeeming} // Disable button while redeeming
                >
                  Redeem
                </button>
              )}
            </Col>
            <Col
              xs={22}
              md={22}
              lg={22}
              xl={22}
              xxl={22}
              className={styles.setdata}
            >
              <div className={styles.tran}>Reward History</div>
              <div className={styles.set}>
                {coinsData?.map((item, index) => (
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
                        <Image preview={false}
                          src={coin}
                          alt="coin"
                          className={styles.setimg}
                          width={30}
                          height={30}
                          
                          style={{
                            marginLeft: "10px",
                          }}
                        />
                      </p>
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
            No Coins History Found!
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

export default Coins;
