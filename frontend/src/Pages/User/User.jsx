import axios from "axios";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Button, Col, Form, Image, Input, Row } from "antd";
import { setIsLoginLoading, setToken, setUserID, setUserName } from "../../Features/User/User";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { routes } from "../../Routes/Routes";
import { apiUrl } from "../../Constant";
import logo from "../../Assets/PNG/logo.png";
import styles from "./index.module.scss";

function User() {
  const [form] = Form.useForm();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const loader = useSelector((state) => state.user?.isLoginLoading);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const loginHandler = async (values) => {
    const payload = {
      email: values.emailOrPhone.includes("@") ? values.emailOrPhone : undefined,
      phoneNumber: !values.emailOrPhone.includes("@") ? values.emailOrPhone : undefined,
      password: values.password,
    };

    try {
      dispatch(setIsLoginLoading(true));

      const res = await axios.post(apiUrl.LOGIN, payload);

      if (res.data.type === "success") {
        const { token, user } = res.data;

        // Save to localStorage
        localStorage.setItem("token", token);
        localStorage.setItem("userId", user.id);

        // Save to redux
        dispatch(setToken(token));
        dispatch(setUserID(user.id));
        dispatch(setUserName(user.name));

        toast.success("Login successful");
        navigate(routes.homepageUrl);
      }
    } catch (error) {
      toast.error(
        error?.response?.data?.message || "Login failed"
      );
    } finally {
      dispatch(setIsLoginLoading(false));
    }
  };

  const setting = () => {
    navigate(routes.settingUrl);
  };

  return (
    <div>
      <Row justify="center" className={styles.main}>
        <Col xl={7} xxl={7} className={styles.user}>
          <div className={styles.setuser}>
            <Image
              preview={false}
              src={logo}
              alt="logo"
              className={styles.logo}
            />

            <p className={styles.login}>
              Login with Email or Phone Number
            </p>

            <Form
              form={form}
              name="login-form"
              onFinish={loginHandler}
              autoComplete="off"
            >
              {/* Email / Phone */}
              <Form.Item
                name="emailOrPhone"
                className={styles.name}
                rules={[
                  { required: true, message: "Email or Phone is required" },
                ]}
              >
                <Input
                  placeholder="Email or Phone Number"
                  className={styles.phone}
                />
              </Form.Item>

              {/* Password */}
              <Form.Item
                name="password"
                rules={[
                  { required: true, message: "Password is required" },
                ]}
              >
                <Input.Password
                  placeholder="Password"
                  className={styles.phone}
                />
              </Form.Item>

              <p className={styles.by}>
                By Continuing, I agree to the{" "}
                <span className={styles.use} onClick={setting}>
                  Terms
                </span>{" "}
                &{" "}
                <span className={styles.policy} onClick={setting}>
                  Condition
                </span>
              </p>

              <Form.Item className={styles.mainbtn}>
                <Button
                  htmlType="submit"
                  className={styles.continue}
                  loading={loader}
                >
                  Login
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
