/* eslint-disable no-unused-vars */
/* eslint-disable react-hooks/exhaustive-deps */
import {
  Button,
  Col,
  Form,
  Image,
  Input,
  Modal,
  Popconfirm,
  Radio,
  Row,
  Select,
} from "antd";
import {
  HomeOutlined,
  InsertRowLeftOutlined,
  ProjectOutlined,
  DeleteTwoTone,
  EditTwoTone,
} from "@ant-design/icons";
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

import {
  addAddressApi,
  deleteAddressApi,
  geAddressApi,
  updateAddressApi,
} from "../../Features/Address/Address";
import TextArea from "antd/es/input/TextArea";
import { geCartListApi } from "../../Features/AddCart/AddCart";

import styles from "./index.module.scss";
import { getProfileApi } from "../../Features/User/User";

function Address() {
  const [form] = Form.useForm();
  const dispatch = useDispatch();
  const [Add, setAdd] = useState();
  const [isEdit, setIsEdit] = useState(false);
  const [editId, setEditId] = useState("");
  const [addType, setAddType] = useState("");
  const [radioWallet, setRadioWallet] = useState();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const userToken = useSelector((state) => state.user?.token);
  const profileData = useSelector((state) => state.user?.profileData);
  const addressList = useSelector((state) => state.address?.addressData);
  const loaderAddress = useSelector((state) => state.address?.isAddressLoading);

  useEffect(() => {
    dispatch(geAddressApi(userToken));
    dispatch(geCartListApi(userToken));
    dispatch(getProfileApi(userToken));
    window.scrollTo(0, 0);
  }, []);

  const handleAddressSubmit = (value) => {
    const values = {
      Type: addType,
      Phone_Number: value.Phone_Number,
      Name: value.name,
      landmark: value.landmark,
      Full_Address: value.address,
      House: value.housenumber,
      State: value.state,
      City: value.city,
      Pincode: value.pincode,
    };

    const onSuccessCallback = () => {
      dispatch(geAddressApi(userToken));
      form.resetFields();
      setIsModalOpen(false);
      setIsEdit(false);
      setAddType("");
      setEditId("");
    };
    if (isEdit)
      dispatch(updateAddressApi(values, userToken, editId, onSuccessCallback));
    else dispatch(addAddressApi(values, userToken, onSuccessCallback));
  };

  const handleAddressType = (addressType) => {
    setAddType(addressType);
  };

  const showModal = () => {
    setIsModalOpen(true);
  };

  const handleOk = () => {
    // setIsModalOpen(false);
  };

  const handleCancel = () => {
    setIsModalOpen(false);
    form.resetFields();
    setIsEdit(false);
    setAddType("");
    setEditId("");
  };

  const handleChange = (e) => {
    setAdd(e);
  };

  const handleAddreesRemove = (item) => {
    dispatch(deleteAddressApi(item?._id, userToken));
  };

  const handleAddressUpdate = (item) => {
    console.log("item", item);
    setEditId(item._id);
    form.setFieldsValue({
      name: item.Name,
      housenumber: item.House,
      landmark: item.landmark,
      Phone_Number: item.Phone_Number,
      address: item.Full_Address,
      state: item.State,
      city: item.City,
      pincode: item.Pincode,
    });
    setAddType(item.Type);
    setIsModalOpen(true);
    setIsEdit(true);
  };

  const cancel = (e) => {
    // console.log(e);
  };

  return (
    <div>
      <Row justify="center">
        <Col xs={22} md={22} lg={22} xl={22} xxl={22}>
          <Row className={styles.main}>
            <Col
              xs={23}
              md={22}
              lg={22}
              xl={22}
              xxl={22}
              className={styles.shopping}
            >
              <div>
                <p className={styles.cart}>Add Your Address</p>
                <div className={styles.product}>
                  <p>Preference</p>
                  <div>
                    <p>Name/ph. no.</p>
                    <p className={styles.p2}>Address</p>
                  </div>
                </div>
                <div className={styles.blank}></div>
                {addressList?.map((item, index) => (
                  <>
                    <div className={styles.setitem} key={index}>
                      <div>
                        <div className={styles.showItem}>
                          <Radio
                            className={styles.radio}
                            checked={item?._id === Add?._id}
                            // onClick={() => setAdd(item)}
                            onChange={() => handleChange(item)}
                          />
                          <div className={styles.add}>
                            <p>{item?.Type}</p>
                          </div>
                          <div className={styles.tailor}>
                            <p className={styles.arpit}>{item?.Name}</p>
                            <p className={styles.no}>{item?.Phone_Number}</p>
                          </div>
                          <div className={styles.address}>
                            {item?.Full_Address}
                          </div>
                          <div className={styles.seticons}>
                            <Popconfirm
                              title="Are you sure you want to delete?"
                              onConfirm={() => handleAddreesRemove(item)}
                              onCancel={cancel}
                              okText="Yes"
                              cancelText="No"
                            >
                              <DeleteTwoTone
                                twoToneColor="red"
                                className={styles.delete}
                              />
                            </Popconfirm>
                            <EditTwoTone
                              className={styles.edit}
                              onClick={() => handleAddressUpdate(item)}
                            />
                          </div>
                        </div>
                        <div className={styles.address0}>
                          {item?.Full_Address}
                        </div>
                      </div>
                    </div>
                  </>
                ))}
                <div className={styles.continue}>
                  <Button className={styles.addaddress} onClick={showModal}>
                    ADD ADDRESS
                  </Button>
                </div>
              </div>
            </Col>
          </Row>
        </Col>
      </Row>
      <Modal  open={isModalOpen} onCancel={handleCancel} footer={null}>
        <Row justify="center">
          <Col xl={22} xxl={22} className={styles.setmodal}>
            <p>{isEdit ? "Edit" : "Add"} Address</p>
            <Form
              onFinish={handleAddressSubmit}
              form={form}
              name="address-form"
              autoComplete="false"
            >
              <Form.Item
                name="name"
                className={styles.name}
                rules={[{ required: true, message: "" }]}
              >
                <Input placeholder="Name" />
              </Form.Item>
              <Form.Item
                name="housenumber"
                className={styles.name}
                rules={[{ required: true, message: "" }]}
              >
                <Input placeholder="House number / street / Area" />
              </Form.Item>
              <Form.Item
                name="landmark"
                className={styles.name}
                rules={[{ required: true, message: "" }]}
              >
                <Input placeholder="Landmark" />
              </Form.Item>
              <Form.Item
                name="Phone_Number"
                className={styles.name}
                rules={[{ required: true, message: "" }]}
              >
                <Input type="number" placeholder="Enter Phone Number" />
              </Form.Item>
              <Form.Item
                name="address"
                className={styles.name}
                rules={[{ required: true, message: "" }]}
              >
                <TextArea placeholder="Address" />
              </Form.Item>
              <Form.Item
                name="state"
                className={styles.name}
                rules={[{ required: true, message: "" }]}
              >
                <Input placeholder="state" />
              </Form.Item>
              <Form.Item
                name="city"
                className={styles.name}
                rules={[{ required: true, message: "" }]}
              >
                <Input placeholder="city" />
              </Form.Item>
              <Form.Item
                name="pincode"
                className={styles.name}
                rules={[{ required: true, message: "" }]}
              >
                <Input type="number" placeholder="pincode" />
              </Form.Item>

              <div className={styles.home}>
                <Form.Item className={styles.homebtn1}>
                  <Button
                    icon={<HomeOutlined />}
                    className={
                      addType === "Home" ? styles.homebtn : styles.homebtn2
                    }
                    onClick={() => handleAddressType("Home")}
                  >
                    HOME
                  </Button>
                </Form.Item>
                <Form.Item className={styles.homebtn1}>
                  <Button
                    icon={<InsertRowLeftOutlined />}
                    className={
                      addType === "Work" ? styles.homebtn : styles.homebtn2
                    }
                    onClick={() => handleAddressType("Work")}
                  >
                    WORK
                  </Button>
                </Form.Item>
                <Form.Item className={styles.homebtn1}>
                  <Button
                    icon={<ProjectOutlined />}
                    className={
                      addType === "Other" ? styles.homebtn : styles.homebtn2
                    }
                    onClick={() => handleAddressType("Other")}
                  >
                    OTHER
                  </Button>
                </Form.Item>
              </div>
              <Form.Item className={styles.mainbtn}>
                <Button
                  htmlType="submit"
                  onClick={handleOk}
                  className={styles.save}
                  loading={loaderAddress}
                >
                  SAVE
                </Button>
              </Form.Item>
            </Form>
          </Col>
        </Row>
      </Modal>
    </div>
  );
}

export default Address;
