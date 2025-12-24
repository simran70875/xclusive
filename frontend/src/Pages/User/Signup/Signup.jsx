import { useEffect, useState } from "react";
import { Button, Col, Form, Image, Input, Row } from "antd";
import { useNavigate } from "react-router-dom";
import logo from "../../../Assets/PNG/logo.png";
import styles from "./index.module.scss";
import axios from "axios";
import { toast } from "react-toastify";
import { apiUrl } from "../../../Constant";
import { routes } from "../../../Routes/Routes";
import {
  getProfileApi,
  setToken,
  setUserID,
  setUserName,
  updateProfileApi,
} from "../../../Features/User/User";
import { useDispatch, useSelector } from "react-redux";

function Signup() {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);

  const reduxToken = useSelector((state) => state.user.token);

  console.log(reduxToken);
  const profileData = useSelector((state) => state.user.profileData);
  const token = reduxToken || localStorage.getItem("token");

  const isEditMode = Boolean(token);

  // 🔹 useState for inputs
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    company: "",
    password: "",
    confirmPassword: "",
  });

  const handleChange = (name, value) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    form.setFieldsValue({ [name]: value });
  };

  // 🔹 Fetch profile if token exists
  useEffect(() => {
    if (isEditMode) {
      dispatch(getProfileApi(token));
    }
  }, [isEditMode, token, dispatch]);

  // 🔹 Prefill form in edit mode
  useEffect(() => {
    if (isEditMode && profileData) {
      const filledData = {
        name: profileData.User_Name || "",
        email: profileData.User_Email || "",
        phone: profileData.User_Mobile_No || "",
        company: "",
        password: "",
        confirmPassword: "",
      };

      setFormData(filledData);
      form.setFieldsValue(filledData);
    }
  }, [profileData, isEditMode, form]);

  // 🔹 Submit handler (SIGNUP / UPDATE)
  const onSubmit = async () => {
    if (isEditMode) {
      // 🔁 UPDATE PROFILE
      const payload = new FormData();
      payload.append("name", formData.name);
      payload.append("email", formData.email);
      payload.append("mobileNumber", formData.phone);

      dispatch(
        updateProfileApi(payload, token, () => {
          toast.success("Profile updated successfully");
        })
      );
      return;
    }

    // 🆕 SIGNUP
    try {
      setLoading(true);

      const payload = {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        phoneNumber: formData.phone,
        companyName: formData.company,
      };

      const response = await axios.post(apiUrl.SIGNUP, payload);

      if (response.data.type === "success") {
        const { token, user, message } = response.data;
        toast.success(message);

        localStorage.setItem("token", token);

        dispatch(setToken(token));
        dispatch(setUserID(user.id));
        dispatch(setUserName(user.name));

        dispatch(getProfileApi(token));

        navigate(routes.homepageUrl);
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
          <Image
            preview={false}
            src={logo}
            alt="logo"
            className={styles.logo}
          />

          <p className={styles.profile}>
            {isEditMode ? (
              <>
                Edit your <b>Profile</b>
              </>
            ) : (
              <>
                Create your <b>Account</b>
              </>
            )}
          </p>

          <Form
            form={form}
            name="signup-form"
            layout="vertical"
            onFinish={onSubmit}
          >
            {/* Name */}
            <Form.Item
              name="name"
              rules={[{ required: true, message: "Please enter your name" }]}
            >
              <Input
                placeholder="Full Name"
                value={formData.name}
                onChange={(e) => handleChange("name", e.target.value)}
              />
            </Form.Item>

            {/* Email */}
            <Form.Item
              name="email"
              rules={[
                { required: true, message: "Please enter email" },
                {
                  pattern: /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/,
                  message: "Invalid email address",
                },
              ]}
            >
              <Input
                placeholder="Email Address"
                value={formData.email}
                onChange={(e) => handleChange("email", e.target.value)}
                disabled={isEditMode}
              />
            </Form.Item>

            {/* Phone */}
            <Form.Item
              name="phone"
              rules={[
                { required: true, message: "Please enter phone number" },
                { len: 10, message: "Enter valid 10-digit number" },
              ]}
            >
              <Input
                type="number"
                placeholder="+91 | Phone Number"
                value={formData.phone}
                onChange={(e) => handleChange("phone", e.target.value)}
              />
            </Form.Item>

            {/* Company (signup only) */}
            {!isEditMode && (
              <Form.Item
                name="company"
                rules={[
                  { required: true, message: "Please enter company name" },
                ]}
              >
                <Input
                  placeholder="Company Name"
                  value={formData.company}
                  onChange={(e) => handleChange("company", e.target.value)}
                />
              </Form.Item>
            )}

            {/* Password fields (signup only) */}
            {!isEditMode && (
              <>
                <Form.Item
                  name="password"
                  rules={[
                    { required: true, message: "Please enter password" },
                    { min: 6, message: "Minimum 6 characters required" },
                  ]}
                  hasFeedback
                >
                  <Input.Password
                    placeholder="Password"
                    value={formData.password}
                    onChange={(e) => handleChange("password", e.target.value)}
                  />
                </Form.Item>

                <Form.Item
                  name="confirmPassword"
                  dependencies={["password"]}
                  hasFeedback
                  rules={[
                    { required: true, message: "Please confirm password" },
                    ({ getFieldValue }) => ({
                      validator(_, value) {
                        if (!value || getFieldValue("password") === value) {
                          return Promise.resolve();
                        }
                        return Promise.reject(
                          new Error("Passwords do not match")
                        );
                      },
                    }),
                  ]}
                >
                  <Input.Password
                    placeholder="Repeat Password"
                    value={formData.confirmPassword}
                    onChange={(e) =>
                      handleChange("confirmPassword", e.target.value)
                    }
                  />
                </Form.Item>
              </>
            )}

            {/* Submit */}
            <Form.Item className={styles.mainbtn}>
              <Button
                htmlType="submit"
                className={styles.save}
                loading={loading}
              >
                {isEditMode ? "Update Profile" : "Sign Up"}
              </Button>
            </Form.Item>
          </Form>
        </div>
      </Col>
    </Row>
  );
}

export default Signup;
