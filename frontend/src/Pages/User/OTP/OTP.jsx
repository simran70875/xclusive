/* eslint-disable no-unused-vars */
/* eslint-disable eqeqeq */
import { toast } from "react-toastify";
import { InputOTP } from "antd-input-otp";
import { Button, Col, Form, Row } from "antd";
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useLocation, useNavigate } from "react-router-dom";

import { routes } from "../../../Routes/Routes";
import { sendotp, verifyotp } from "../../../Features/User/User";

import styles from "./index.module.scss";

function OTP() {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { state } = useLocation();
  const [count, setCount] = useState(30);
  const userName = useSelector((state) => state.user?.userName);
  const loader = useSelector((state) => state.user?.isLoginLoading);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    setTimeout(() => {
      if (count >= 0) {
        setCount((count) => count - 1);
      }
    }, 1000);
  });

  const handleFinish = (values) => {
    console.log(values.otp.join(""));
    const obj = {
      mobileNumber: state?.mobileNumber,
      otp: values?.otp.join(""),
    };
    const onSuccessCallback = (res) => {
      if (res.type === "success") {
        if (res.userName === "") {
          navigate(routes.signupUrl, {
            state: {
              User_Mobile_No: state?.mobileNumber,
            },
          });
        } else if (res.userName) {
          navigate(routes.homepageUrl);
        }
      }
    };
    dispatch(verifyotp(obj, onSuccessCallback));
  };

  const resendOtp = () => {
    const obj = {
      mobileNumber: state.mobileNumber,
    };
    const onSuccessCallback = (res) => {
      form.resetFields();
      setCount(30);
    };
    dispatch(sendotp(obj, onSuccessCallback));
  };

  return (
    <div>
      <Row justify="center" className={styles.main}>
        <Col xl={7} xxl={7} className={styles.user}>
          <main className={styles.app}>
            <section className={styles.card}>
              <h2>Verify your phone number</h2>
              <h3>
                We have forwarded a verification code to <br />
                +91 {state?.mobileNumber}
              </h3>
              <Form
                form={form}
                onFinish={handleFinish}
                className={styles.forms}
              >
                <Form.Item
                  name="otp"
                  className="center-error-message"
                  rules={[{ validator: async () => Promise.resolve() }]}
                >
                  <InputOTP autoFocus inputType="numeric" length={4} />
                </Form.Item>
                {count === 0 ? "" : <p>Resend OTP in {count}</p>}
                <p className={styles.recieve}>
                  Didn’t receive an OTP?{" "}
                  <span onClick={() => resendOtp()}>Resend</span>
                </p>
                <Form.Item>
                  <Button
                    block
                    htmlType="submit"
                    type="primary"
                    className={styles.submit}
                    loading={loader}
                  >
                    Submit
                  </Button>
                </Form.Item>
              </Form>
            </section>
          </main>
        </Col>
      </Row>
    </div>
  );
}

export default OTP;
