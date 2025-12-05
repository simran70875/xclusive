import React, { useState } from "react";
import axios from "axios";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import AlertBox from "../../../../Components/AlertComp/AlertBox";

let url = process.env.REACT_APP_API_URL;

const EditUser = () => {
  const Navigate = useNavigate();
  const selectedUserData = useSelector(
    (state) => state?.UserDataChange?.payload
  );
  console.log("selectedUserData ==> ", selectedUserData);
  const [userName, setUserName] = useState(selectedUserData?.User_Name);
  const [userType, setUserType] = useState(selectedUserData?.User_Type);
  const [mobileNumber, setMobileNumber] = useState(
    selectedUserData?.User_Mobile_No
  );
  const [email, setEmail] = useState(selectedUserData?.User_Email);
  const [Wallet, setWallet] = useState(selectedUserData?.Wallet);
  const [coin, setCoin] = useState(selectedUserData?.Coins);
  const [previewImage, setPreviewImage] = useState(
    selectedUserData?.User_Image
  );
  const [userAddStatus, setUserAddStatus] = useState(
    selectedUserData?.User_Status
  );
  const [statusMessage, setStatusMessage] = useState("");

  console.log(previewImage);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (userType !== "") {
      const formData = {
        wallet: Wallet,
        coins: coin,
        type: userType,
      };

      try {
        let response = await axios.patch(
          `${url}/user/update/byAdmin/${selectedUserData?._id}`,
          formData
        );
        if (response.data.type === "success") {
          setUserAddStatus(response.data.type);
          let alertBox = document.getElementById("alert-box");
          alertBox.classList.add("alert-wrapper");
          setStatusMessage(response.data.message);
          setTimeout(() => {
            Navigate("/showUser");
          }, 900);
        } else {
          setUserAddStatus(response.data.type);
          let alertBox = document.getElementById("alert-box");
          alertBox.classList.add("alert-wrapper");
          setStatusMessage(response.data.message);
        }
      } catch (error) {
        setUserAddStatus("error");
        let alertBox = document.getElementById("alert-box");
        alertBox.classList.add("alert-wrapper");
        setStatusMessage("User not Update !");
      }
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      setUserAddStatus("");
      setStatusMessage("");
      let alertBox = document?.getElementById("alert-box");
      alertBox?.classList?.remove("alert-wrapper");
    }, 1500);

    return () => clearTimeout(timer);
  }, [userAddStatus, statusMessage]);

  return (
    <>
      <div className="main-content dark">
        <div className="page-content">
          <div className="container-fluid">
            <div className="row">
              <div className="col-12">
                <div className="page-title-box d-flex align-items-center justify-content-between">
                  <div className="col-2 table-heading">Edit List</div>
                </div>
              </div>
            </div>
            <div className="row">
              <div className="col-12">
                <div className="">
                  <div className="card-body">
                    <form onSubmit={handleSubmit}>
                      <div className="mb-3 row">
                        <label
                          htmlFor="example-text-input"
                          className="col-md-2 col-form-label"
                        >
                          User Name:
                        </label>
                        <div className="col-md-10">
                          <input
                            readOnly
                            required
                            className="form-control"
                            type="text"
                            id="example-text-input"
                            value={userName}
                            onChange={(e) => {
                              setUserName(e.target.value);
                            }}
                          />
                        </div>
                      </div>
                      <div className="mb-3 row">
                        <label
                          htmlFor="example-text-input"
                          className="col-md-2 col-form-label"
                        >
                          User Mobile No:
                        </label>
                        <div className="col-md-10">
                          <input
                            readOnly
                            required
                            className="form-control"
                            type="text"
                            id="example-text-input"
                            value={mobileNumber}
                            onChange={(e) => {
                              setMobileNumber(e.target.value);
                            }}
                          />
                        </div>
                      </div>
                      <div className="mb-3 row">
                        <label
                          htmlFor="example-text-input"
                          className="col-md-2 col-form-label"
                        >
                          User Email:
                        </label>
                        <div className="col-md-10">
                          <input
                            readOnly
                            required
                            className="form-control"
                            type="text"
                            id="example-text-input"
                            value={email}
                            onChange={(e) => {
                              setEmail(e.target.value);
                            }}
                          />
                        </div>
                      </div>
                      <div className="mb-3 row">
                        <label
                          htmlFor="example-text-input"
                          className="col-md-2 col-form-label"
                        >
                          User Type:
                        </label>
                        <div className="col-md-10">
                          <input
                            readOnly
                            required
                            className="form-control"
                            type="text"
                            id="example-text-input"
                            value={userType}
                            // onChange={(e) => {
                            //   setEmail(e.target.value);
                            // }}
                          />
                          {/* <select */}
                            {/* required */}
                            {/* className="form-select" */}
                            {/* id="user-select" */}
                            {/* value={selectedUserData} */}
                            {/* onChange={(e) => { */}
                              {/* setUserType(e.target.value); */}
                            {/* }} */}
                          {/* > */}
                            {/* <option value="">{userType}</option> */}
                            {/* <option value="0">Normal</option> */}
                            {/* <option value="1">Gold</option> */}
                            {/* <option value="2">Silver</option> */}
                            {/* <option value="3">PPO</option> */}
                          {/* </select> */}
                        </div>
                      </div>
                      <div className="mb-3 row">
                        <label
                          htmlFor="example-text-input"
                          className="col-md-2 col-form-label"
                        >
                          User Wallet:
                        </label>
                        <div className="col-md-10">
                          <input
                            min={0}
                            required
                            className="form-control"
                            type="number"
                            id="example-number-input"
                            value={Wallet}
                            onChange={(e) => {
                              setWallet(e.target.value);
                            }}
                          />
                        </div>
                      </div>
                      <div className="mb-3 row">
                        <label
                          htmlFor="example-text-input"
                          className="col-md-2 col-form-label"
                        >
                          User Coins:
                        </label>
                        <div className="col-md-10">
                          <input
                            min={0}
                            required
                            className="form-control"
                            type="number"
                            id="example-number-input"
                            value={coin}
                            onChange={(e) => {
                              setCoin(e.target.value);
                            }}
                          />
                        </div>
                      </div>
                      <div className="mb-3 row">
                        <label
                          htmlFor="example-text-input"
                          className="col-md-2 col-form-label"
                        >
                          User Image:
                        </label>
                        <div className="col-md-10">
                          <div className="fileupload_img col-md-10 mt-2">
                            <img
                              type="image"
                              src={`${url}/${previewImage?.path}`}
                              alt="user image"
                              height={100}
                              width={100}
                            />
                          </div>
                        </div>
                      </div>
                      <div className="row mb-10">
                        <div className="col ms-auto">
                          <div className="d-flex flex-reverse flex-wrap gap-2">
                            <a
                              className="btn btn-danger"
                              onClick={() => Navigate("/showUser")}
                            >
                              {" "}
                              <i className="fas fa-window-close"></i> Cancel{" "}
                            </a>
                            <button className="btn btn-success" type="submit">
                              {" "}
                              <i className="fas fa-save"></i> Save{" "}
                            </button>
                          </div>
                        </div>
                      </div>
                    </form>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <AlertBox status={userAddStatus} statusMessage={statusMessage} />
      </div>
    </>
  );
};

export default EditUser;
