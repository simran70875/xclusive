import React, { useState, useEffect } from "react";
import { Modal, Button } from "antd";
import { IsOpened } from "../../Features/Banner/getPopUpBanner";
import { useDispatch, useSelector } from "react-redux";
import axios from "axios";
import { apiUrl, BASE_URL } from "../../Constant";
import { useNavigate } from "react-router";

const PopupModal = () => {
  const [visible, setVisible] = useState(false);
  const [bannerData, setBannerData] = useState();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const bannerOpened = useSelector((state) => state.popUp.opened);
  console.log("bannerOpened ==> ", bannerOpened);
  const userToken = useSelector((state) => state.user?.token);

  const getBanner = async () => {
    const res = await axios.get(apiUrl.GET_POPUP_BANNER);
    console.log("res ==> ", res);
    if (res) {
      setBannerData(res.data[0]);
    }
  };

  useEffect(() => {
    if (bannerOpened === false) {
      setVisible(true);
      dispatch(IsOpened());
    }
    getBanner();
  }, [bannerOpened, dispatch]);


  const handleOk = () => {
    setVisible(false);
    if (userToken) {
      navigate("/");
    } else {
      navigate("/user");
    }
  };

  const handleCancel = () => {
    setVisible(false);
  };

  if (bannerData?.Banner_Status === true) {
    return (
      <Modal
        width={"60%"}
        title="Welcome! To Xclusive Diamonds"
        open={visible}
        onOk={handleOk}
        onCancel={handleCancel}
        footer={[
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <p
              style={{
                paddingRight: "10px",
                fontSize: "20px",
                color: "#000000",
                fontWeight: "bold",
                marginBottom: 20,
              }}
            >
              {userToken
                ? "Continue Shopping With Us"
                : bannerData?.Banner_Name}
            </p>

            <Button key="submit" type="primary" onClick={handleOk}>
              Get Started
            </Button>
          </div>,
        ]}
      >
        <img
          src={BASE_URL + "/" + bannerData?.Banner_Image?.path} // Replace this with your banner image
          alt="Banner"
          style={{ width: "100%" }}
        />
      </Modal>
    );
  }
};

export default PopupModal;
