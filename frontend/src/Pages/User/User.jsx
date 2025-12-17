import { useEffect } from "react";
import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { Button, Col, Form, Image, Input, Row } from "antd";
import logo from "../../Assets/PNG/logo.png";
import { routes } from "../../Routes/Routes";
import { sendotp } from "../../Features/User/User";

import styles from "./index.module.scss";

function User() {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [number, setNumber] = useState();
  const loader = useSelector((state) => state.user?.isLoginLoading);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const otp = () => {
    const obj = {
      mobileNumber: number,
    };
    const onSuccessCallback = (res) => {
      if (res.type === "success") {
        navigate(routes.otpUrl, {
          state: {
            mobileNumber: number,
          },
        });
      }
    };
    dispatch(sendotp(obj, onSuccessCallback));
  };

  const setting = () => {
    navigate(routes.settingUrl);
  };

  return (
    <div>
      <Row justify="center" className={styles.main}>
        <Col xl={7} xxl={7} className={styles.user}>
          <div className={styles.setuser}>
            <Image preview={false}
              src={logo}
              alt="logo"
              
              className={styles.logo}
            />
            <p className={styles.login}>Please enter your phone number</p>
            <Form
              onFinish={otp}
              form={form}
              name="sign-form"
              autoComplete="false"
            >
              <Form.Item
                name="mobileNumber"
                className={styles.name}
                rules={[
                  {
                    required: true,
                  },
                  {
                    pattern: new RegExp(
                      /^[\\+]?[(]?[0-9]{2}[)]?[-\s\\.]?[0-9]{2}[-\s\\.]?[0-9]{4,6}$/im
                    ),
                    message: "number not valid!",
                  },
                ]}
              >
                <Input
                  type="number"
                  placeholder="+91 | Mobile Number"
                  className={styles.phone}
                  onChange={(e) => setNumber(e.target.value)}
                />
              </Form.Item>

              <p className={styles.by}>
                By Continuing, I agree to the{" "}
                <span className={styles.use} onClick={setting}>
                  Terms
                </span>{" "}
                &
                <span className={styles.policy} onClick={setting}>
                  {" "}
                  Condition
                </span>
              </p>
              <Form.Item className={styles.mainbtn}>
                <Button
                  htmlType="submit"
                  className={styles.continue}
                  loading={loader}
                >
                  Continue
                </Button>
              </Form.Item>
            </Form>
          </div>
        </Col>
      </Row>
    </div>
  );
}

export default User;
