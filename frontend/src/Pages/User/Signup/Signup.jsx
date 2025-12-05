/* eslint-disable no-unused-vars */
/* eslint-disable react-hooks/exhaustive-deps */
import { EditFilled } from "@ant-design/icons";
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useLocation, useNavigate } from "react-router-dom";
import { Button, Col, Form, Image, Input, Row } from "antd";
import {
  getProfileApi,
  updateFirstTimeApi,
  updateProfileApi,
} from "../../../Features/User/User";
import logo from "../../../Assets/PNG/logo.png";
import { routes } from "../../../Routes/Routes";
import styles from "./index.module.scss";
import { apiUrl } from "../../../Constant";
import axios from "axios";
import { toast } from "react-toastify";

function Signup() {
  const [form] = Form.useForm();
  const { state } = useLocation();
  const [previewImage, setImg] = useState("");
  const [uploadedImage, setImg2] = useState("");
  const [updatedPreviewImage, setImg3] = useState("");
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const token = useSelector((state) => state.user?.token);
  const profileData = useSelector((state) => state.user?.profileData);
  console.log("profileData ==> ", profileData);
  const loader = useSelector((state) => state.user?.isLoginLoading);

  useEffect(() => {
    dispatch(getProfileApi(token));
    window.scrollTo(0, 0);
  }, []);

  const login = async (value) => {
    console.log("uploadedImage formdata ==> ", uploadedImage);
    const formData = new FormData();
    formData.append("email", value?.User_Email);
    formData.append("image", uploadedImage);
    formData.append(
      "mobileNumber",
      state?.User_Mobile_No || value?.User_Mobile_No
    );
    formData.append("name", value?.User_Name);

    try {
      const response = await axios.patch(`${apiUrl.UPDATE_PROFILE}`, formData, {
        headers: {
          Authorization: token,
        },
      });
      console.log("response ==> ", response);
      if (response.data.type == "success") {
        navigate(routes.homepageUrl);
        form.resetFields();
        toast.success(response.data.message);
      }
    } catch (error) {
      console.error("Error updating profile:", error);
    }
  };

  const onImageChange = (e) => {
    // console.log("essss", e);
    setImg(URL.createObjectURL(e.target?.files?.[0]));
    setImg2(e.target?.files?.[0]);
  };

  const handleUpdateImage = (e) => {
    // console.log("essss", e.target?.files);
    setImg3(URL.createObjectURL(e.target?.files?.[0]));
    setImg2(e.target?.files?.[0]);
  };

  return (
    <div>
      <Row justify="center" className={styles.main}>
        <Col xl={7} xxl={7} className={styles.user}>
          <div className={styles.setuser}>
            <Image
              src={logo}
              alt="logo"
              preview={false}
              className={styles.logo}
            />
            {state?.update === true ? (
              <p className={styles.profile}>
                Enter details to complete your <br /> <b>Update profile</b>
              </p>
            ) : (
              <p className={styles.profile}>
                Enter details to complete your profile
              </p>
            )}
            <Form
              onFinish={login}
              form={form}
              name="sign-form"
              autoComplete="false"
              initialValues={profileData}
            >
              <Form.Item name="User_Image">
                <div
                  className={
                    previewImage || state?.update === true
                      ? styles.upload
                      : styles.upload2
                  }
                >
                  <input
                    type="file"
                    name="file"
                    className={styles.uploadImg}
                    onChange={(e) => onImageChange(e)}
                  />
                  {previewImage ||
                  updatedPreviewImage ||
                  state?.update === true ? (
                    <>
                      {updatedPreviewImage ? (
                        ""
                      ) : (
                        <Image
                          src={
                            state?.update === true
                              ? profileData?.User_Image
                              : previewImage
                          }
                          alt="setImg"
                          preview={false}
                          name="User_Image"
                          className={styles.showImg}
                        />
                      )}
                      {updatedPreviewImage ? (
                        <>
                          <Image
                            src={updatedPreviewImage}
                            alt="setImg"
                            preview={false}
                            name="User_Image"
                            className={styles.showImg}
                          />
                        </>
                      ) : (
                        ""
                      )}
                    </>
                  ) : (
                    <>
                      <div className={styles.selectImg}>Click to upload</div>
                    </>
                  )}
                  {state?.update === true ? (
                    <>
                      <EditFilled
                        style={{
                          marginTop: "113px",
                          cursor: "pointer",
                          fontSize: "24px",
                        }}
                      />
                      <input
                        type="file"
                        name="file"
                        onChange={(e) => handleUpdateImage(e)}
                        style={{
                          width: "20px",
                          height: "20px",
                          position: "relative",
                          marginTop: "113px",
                          marginLeft: "-22px",
                          opacity: "0",
                          cursor: "pointer",
                        }}
                      />
                    </>
                  ) : (
                    <>
                      {previewImage ? (
                        <div>
                          <EditFilled
                            style={{
                              fontSize: "24px",
                              marginTop: "118px",
                              marginLeft: "-12px",
                              cursor: "pointer",
                            }}
                          />
                          <input
                            type="file"
                            name="file"
                            onChange={(e) => onImageChange(e)}
                            style={{
                              width: "20px",
                              height: "20px",
                              position: "relative",
                              marginTop: "-23px",
                              marginLeft: "-10px",
                              opacity: "0",
                              cursor: "pointer",
                            }}
                          />
                        </div>
                      ) : (
                        <EditFilled
                          style={{
                            marginTop: "113px",
                            marginLeft: "-19px",
                            cursor: "pointer",
                            fontSize: "24px",
                          }}
                        />
                      )}
                    </>
                  )}
                </div>
              </Form.Item>
              <Form.Item
                name="User_Name"
                className={styles.name}
                rules={[{ required: true }]}
              >
                <Input placeholder="Fullname" />
              </Form.Item>
              <Form.Item
                name="User_Mobile_No"
                className={styles.name}
                // rules={[
                //   {
                //     required: true,
                //   },
                //   {
                //     pattern: new RegExp(
                //       /^[\\+]?[(]?[0-9]{2}[)]?[-\s\\.]?[0-9]{2}[-\s\\.]?[0-9]{4,6}$/im
                //     ),
                //     message: "number not valid!",
                //   },
                // ]}
              >
                <Input
                  type="number"
                  placeholder="+91 | Mobile Number"
                  defaultValue={state?.User_Mobile_No}
                  disabled
                />
              </Form.Item>
              <Form.Item
                name="User_Email"
                className={styles.name}
                rules={[
                  { required: true },
                  {
                    pattern: new RegExp(
                      /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+.[A-Za-z]{2,}$/
                    ),
                    message: "email not valid!",
                  },
                ]}
              >
                <Input placeholder="Email Address" />
              </Form.Item>
              {/* {state?.update === true ? (
                ""
              ) : (
                <Form.Item className={styles.select}>
                  <Select
                    className={styles.selectinput}
                    placeholder="City"
                    style={{ width: "100%" }}
                    onChange={handleChange}
                    tokenSeparators={[","]}
                    options={[
                      {
                        value: "Surat",
                        label: "Surat",
                      },
                    ]}
                  />
                </Form.Item>
              )} */}
              <Form.Item className={styles.mainbtn}>
                <Button
                  htmlType="submit"
                  className={styles.save}
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

export default Signup;
