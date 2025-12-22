/* eslint-disable no-unused-vars */
import { useState } from "react";
import { Button, Col, Form, Image, Input, Row } from "antd";
import { useNavigate } from "react-router-dom";
import logo from "../../../Assets/PNG/logo.png";
import styles from "./index.module.scss";
import axios from "axios";
import { toast } from "react-toastify";
import { apiUrl } from "../../../Constant";
import { routes } from "../../../Routes/Routes";

function Signup() {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const onSignup = async (values) => {
    try {
      setLoading(true);

      const payload = {
        name: values.name,
        email: values.email,
        password: values.password,
        phoneNumber: values.phone,
        companyName: values.company,
      };

      const response = await axios.post(apiUrl.SIGNUP, payload);

      if (response.data.type === "success") {
        toast.success(response.data.message);
        form.resetFields();
        navigate(routes.userUrl); // login page
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || "Signup failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Row justify="center" className={styles.main}>
      <Col xl={7} xxl={7} className={styles.user}>
        <div className={styles.setuser}>
          <Image preview={false} src={logo} alt="logo" className={styles.logo} />

          <p className={styles.profile}>
            Create your <b>Account</b>
          </p>

          <Form
            form={form}
            name="signup-form"
            layout="vertical"
            onFinish={onSignup}
          >
            {/* Name */}
            <Form.Item
              name="name"
              rules={[{ required: true, message: "Please enter your name" }]}
            >
              <Input placeholder="Full Name" />
            </Form.Item>

            {/* Email */}
            <Form.Item
              name="email"
              rules={[
                { required: true, message: "Please enter email" },
                {
                  pattern:
                    /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/,
                  message: "Invalid email address",
                },
              ]}
            >
              <Input placeholder="Email Address" />
            </Form.Item>

            {/* Phone */}
            <Form.Item
              name="phone"
              rules={[
                { required: true, message: "Please enter phone number" },
                { len: 10, message: "Enter valid 10-digit number" },
              ]}
            >
              <Input type="number" placeholder="+91 | Phone Number" />
            </Form.Item>

            {/* Company */}
            <Form.Item
              name="company"
              rules={[
                { required: true, message: "Please enter company name" },
              ]}
            >
              <Input placeholder="Company Name" />
            </Form.Item>

            {/* Password */}
            <Form.Item
              name="password"
              rules={[
                { required: true, message: "Please enter password" },
                { min: 6, message: "Minimum 6 characters required" },
              ]}
              hasFeedback
            >
              <Input.Password placeholder="Password" />
            </Form.Item>

            {/* Confirm Password */}
            <Form.Item
              name="confirmPassword"
              dependencies={["password"]}
              hasFeedback
              rules={[
                { required: true, message: "Please confirm password" },
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    if (
                      !value ||
                      getFieldValue("password") === value
                    ) {
                      return Promise.resolve();
                    }
                    return Promise.reject(
                      new Error("Passwords do not match")
                    );
                  },
                }),
              ]}
            >
              <Input.Password placeholder="Repeat Password" />
            </Form.Item>

            {/* Submit */}
            <Form.Item className={styles.mainbtn}>
              <Button
                htmlType="submit"
                className={styles.save}
                loading={loading}
                block
              >
                Sign Up
              </Button>
            </Form.Item>
          </Form>
        </div>
      </Col>
    </Row>
  );
}

export default Signup;
