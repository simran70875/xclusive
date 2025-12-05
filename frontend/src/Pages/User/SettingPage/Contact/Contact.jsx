/* eslint-disable react-hooks/exhaustive-deps */
import React from "react";
import { useEffect } from "react";
import { Col, Image, Row } from "antd";
import { useDispatch, useSelector } from "react-redux";

import mail from "../../../../Assets/PNG/mail.png";
import time from "../../../../Assets/PNG/time.png";
import phone from "../../../../Assets/PNG/phone.png";
import address from "../../../../Assets/PNG/address.png";
import { getSettingApi } from "../../../../Features/Setting/Setting";

import styles from "./index.module.scss";

function Contact() {
  const dispatch = useDispatch();
  const setting = useSelector((state) => state.setting?.settingData);
  // console.log("setting", setting);

  useEffect(() => {
    dispatch(getSettingApi());
    window.scrollTo(0, 0);
  }, []);
  return (
    <div>
      <Row justify="center">
        <Col xs={22} md={22} lg={22} xl={22} xxl={22}>
          <div style={{ textAlign: "start", marginBottom: "80px" }}>
            <h1 style={{ textAlign: "center", marginBottom: "50px" }}>
              Contact-Us
            </h1>
            <Row justify="center">
              <Col
                xs={22}
                md={22}
                lg={22}
                xl={22}
                xxl={22}
                className={styles.setMain}
              >
                <div className={styles.setbox}>
                  <Image
                    src={address}
                    alt="address"
                    className={styles.setimg}
                    preview={false}
                  />
                  <p className={styles.address}>Address</p>
                  <p className={styles.plaza}>FF-7 shive plaza</p>
                </div>
                <div className={styles.setbox}>
                  <Image
                    src={mail}
                    alt="mail"
                    className={styles.setimg}
                    preview={false}
                  />
                  <p className={styles.address}>E-Mail :</p>
                  <p className={styles.plaza}>{setting?.app_email}</p>
                </div>
                <div className={styles.setbox}>
                  <Image
                    src={phone}
                    alt="phone"
                    className={styles.setimg}
                    preview={false}
                  />
                  <p className={styles.address}>Phone :</p>
                  <p className={styles.plaza}>{setting?.app_contact}</p>
                </div>
                <div className={styles.setbox}>
                  <Image
                    src={time}
                    alt="time"
                    className={styles.setimg}
                    preview={false}
                  />
                  <p className={styles.address}>Office Hours :</p>
                  <p className={styles.plaza}>09:00 am to 7:00 pm</p>
                </div>
              </Col>
            </Row>
          </div>
        </Col>
      </Row>
    </div>
  );
}

export default Contact;
