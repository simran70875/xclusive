import { useEffect, useState } from "react";

import "react-quill/dist/quill.snow.css";
import AlertBox from "../../../Components/AlertComp/AlertBox";
import axios from "axios";
import GeneralSettings from "./GeneralSettings";
import AppSettings from "./AppSettings";
// import NotificationSettings from "./NotificationSettings";
// import WalletCoinSettings from "./WalletCoinSettings";
// import PaymentSettings from "./PaymentSettings";
// import BankDetailsSettings from "./BankDetailsSettings";
import PasswordChange from "./PasswordChange";

let url = process.env.REACT_APP_API_URL;

const GeneralSettingsMain = () => {
  const adminToken = localStorage.getItem("token");

  const [existingSettings, setExistingSettings] = useState({});
  const [activeTab, setActiveTab] = useState("general");

  // general
  const [appName, setAppName] = useState("");
  const [hostEmail, setHostEmail] = useState("");
  const [appLogo, setAppLogo] = useState("");
  const [previewImage, setPreviewImage] = useState("");
  const [author, setAuthor] = useState("");
  const [contact, setContact] = useState("");
  const [website, setWebsite] = useState("");
  const [developeBy, setDevelopeBy] = useState("");
  const [youtubeVideo, setYoutubeVideo] = useState("");
  const [memberShipVideo, setMemberShipVideo] = useState("");

  // app settings
  const [version, setVersion] = useState("");
  const [mainDesc, setMainDesc] = useState("");
  const [updateDesc, setUpdateDesc] = useState("");
  const [maintenance, setMetMaintenance] = useState(false);
  const [cancelOption, setCancelOption] = useState(false);

  // // notification settings
  // const [oneAppId, setOneAppId] = useState("");
  // const [restKey, setRestKey] = useState("");
  // const [serverKey, setServerKey] = useState("");
  // const [twoFecApiKey, setTwoFecApiKey] = useState("");
  // const [twoFecoptions, setTwoFecoptions] = useState(false);

  // // coins & wallet settings
  // const [minCoinsAmount, setMinCoinsAmount] = useState(0);
  // const [minWalletAmount, setMinWalletAmount] = useState(0);
  // const [priceCovertCoins, setPriceCovertCoins] = useState(0);
  // const [reviewAmount, setReviewAmount] = useState(0);

  // // payment settings
  // const [razorKey, setRazorKey] = useState("");
  // const [mapkey, setMapkey] = useState("");

  // // Banking Settings
  // const [address, setaddress] = useState("");
  // const [gstNo, setGstNo] = useState("");
  // const [panNo, setpanNo] = useState("");
  // const [bankName, setBankName] = useState("");
  // const [accountNo, setAccountNo] = useState("");
  // const [ifscCode, setIfscCode] = useState("");
  // const [branch, setBranch] = useState("");
  // const [upiImage, setUpiImage] = useState("");
  // const [bankImage, setBankImage] = useState("");

  const handleTabClick = (value) => {
    setActiveTab(value);
  };

  useEffect(() => {
    async function getExistingSettings() {
      try {
        const response = await axios.get(`${url}/app/settings/get`, {
          headers: {
            Authorization: `${adminToken}`,
          },
        });
        setExistingSettings(response?.data?.Settings || {});
      } catch (error) {
        console.error(error);
      }
    }
    getExistingSettings();
  }, [adminToken]);

  useEffect(() => {
    // general
    setHostEmail(existingSettings?.app_email);
    setAppName(existingSettings?.app_name);
    setAuthor(existingSettings?.app_author);
    setDevelopeBy(existingSettings?.app_developed_by);
    setContact(existingSettings?.app_contact);
    setWebsite(existingSettings?.app_website);
    setPreviewImage(existingSettings?.app_logo);
    setYoutubeVideo(existingSettings?.app_youtube_video);
    setMemberShipVideo(existingSettings?.app_memberShip_video);

    // app setting
    setVersion(existingSettings?.app_version);
    setMainDesc(existingSettings?.app_maintenance_description);
    setUpdateDesc(existingSettings?.app_update_description);
    setMetMaintenance(existingSettings?.app_maintenance_status);
    setCancelOption(existingSettings?.app_update_cancel_button);

    // // notification_setting
    // setOneAppId(existingSettings?.onesignal_app_id);
    // setRestKey(existingSettings?.onesignal_rest_key);
    // setServerKey(existingSettings?.firebase_server_key);
    // setTwoFecApiKey(existingSettings?.factor_apikey);
    // setTwoFecoptions(existingSettings?.app_update_factor_button);

    // // coins & wallet settings
    // setMinCoinsAmount(existingSettings?.coin_withdrawal_limit);
    // setMinWalletAmount(existingSettings?.min_wallet_amount_limit);
    // setPriceCovertCoins(existingSettings?.price_convert_coin);
    // setReviewAmount(existingSettings?.review_reward_amount);

    // // payment settings
    // setRazorKey(existingSettings?.razorpay_key);
    // setMapkey(existingSettings?.map_api_key);

    // // banking settings
    // setBankName(existingSettings?.bank_name);
    // setIfscCode(existingSettings?.ifsc_code);
    // setAccountNo(existingSettings?.account_no);
    // setBranch(existingSettings?.branch_name);
    // setBankImage(existingSettings?.app_upi_image);
    // setaddress(existingSettings?.address);
    // setpanNo(existingSettings?.pan_no);
    // setGstNo(existingSettings?.gst_no);
  }, [existingSettings]);

  const [settingsAddStatus, setSettingsAddStatus] = useState("");
  const [statusMessage, setStatusMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formData = new FormData();

    // general
    formData.append("app_email", hostEmail);
    formData.append("image", appLogo);
    formData.append("app_name", appName);
    formData.append("app_developed_by", developeBy);
    formData.append("app_author", author);
    formData.append("app_website", website);
    formData.append("app_contact", contact);
    formData.append("app_youtube_video", youtubeVideo);
    formData.append("app_memberShip_video", memberShipVideo);

    // app
    formData.append("app_version", version);
    formData.append("app_maintenance_description", mainDesc);
    formData.append("app_update_description", updateDesc);
    formData.append("app_maintenance_status", maintenance);
    formData.append("app_update_cancel_button", cancelOption);

    // // notification
    // formData.append("factor_apikey", twoFecApiKey);
    // formData.append("firebase_server_key", serverKey);
    // formData.append("onesignal_rest_key", restKey);
    // formData.append("onesignal_app_id", oneAppId);
    // formData.append("app_update_factor_button", twoFecoptions);

    // // wallete & coins
    // formData.append("price_convert_coin", priceCovertCoins);
    // formData.append("min_wallet_amount_limit", minWalletAmount);
    // formData.append("coin_withdrawal_limit", minCoinsAmount);
    // formData.append("review_reward_amount", reviewAmount);

    // // payment
    // formData.append("map_api_key", mapkey);
    // formData.append("razorpay_key", razorKey);

    // // bank details
    // formData.append("upi_image", upiImage);
    // formData.append("branch_name", branch);
    // formData.append("account_no", accountNo);
    // formData.append("ifsc_code", ifscCode);
    // formData.append("bank_name", bankName);
    // formData.append("address", address);
    // formData.append("gst_no", gstNo);
    // formData.append("pan_no", panNo);

    try {
      const response = await axios.patch(
        `${url}/app/settings/update`,
        formData,
        {
          headers: {
            Authorization: `${adminToken}`,
          },
        }
      );
      if (response.data.type === "success") {
        setSettingsAddStatus(response.data.type);
        setStatusMessage(response.data.message);
        setTimeout(() => { }, 900);
      } else {
        setSettingsAddStatus(response.data.type);
        setStatusMessage(response.data.message);
      }
    } catch (error) {
      console.error(error);
      setSettingsAddStatus("error");
      setStatusMessage("Page Settings not update!");
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      setSettingsAddStatus("");
      setStatusMessage("");
    }, 1500);

    return () => clearTimeout(timer);
  }, [settingsAddStatus, statusMessage]);

  return (
    <div className="main-content dark">
      <div className="page-content">
        <div className="container-fluid">
          <div className="row">
            <div className="col-12">
              <div className="page-title-box d-flex align-items-center justify-content-between">
                <div className="col-3 table-heading">General Settings</div>
              </div>
            </div>
          </div>
          <div className="row">
            <div className="col-12">
              <div className="card">
                <ul className="nav nav-tabs settingsContainer" role="tablist">
                  <li
                    style={{ padding: "4px 22px" }}
                    role="presentation"
                    className={
                      activeTab === "general" ? "active activateSettings" : ""
                    }
                  >
                    <a
                      href="#general"
                      aria-controls="general"
                      role="tab"
                      onClick={() => handleTabClick("general")}
                    >
                      General Settings
                    </a>
                  </li>
                  <li
                    style={{ padding: "4px 22px" }}
                    role="presentation"
                    className={
                      activeTab === "app_setting"
                        ? "active activateSettings"
                        : ""
                    }
                  >
                    <a
                      href="#app_setting"
                      aria-controls="app_setting"
                      role="tab"
                      onClick={() => handleTabClick("app_setting")}
                    >
                      App Settings
                    </a>
                  </li>
                  {/* <li
                    style={{ padding: "4px 22px" }}
                    role="presentation"
                    className={
                      activeTab === "notification_setting"
                        ? "active activateSettings"
                        : ""
                    }
                  >
                    <a
                      href="#notification_setting"
                      aria-controls="notification_setting"
                      role="tab"
                      onClick={() => handleTabClick("notification_setting")}
                    >
                      Notification Setting
                    </a>
                  </li> */}
                  {/* <li
                    style={{ padding: "4px 22px" }}
                    role="presentation"
                    className={
                      activeTab === "wallet&coins_setting"
                        ? "active activateSettings"
                        : ""
                    }
                  >
                    <a
                      href="#wallet&coins_setting"
                      aria-controls="wallet&coins_setting"
                      role="tab"
                      onClick={() => handleTabClick("wallet&coins_setting")}
                    >
                      Wallet/Coins Setting
                    </a>
                  </li>
                  <li
                    style={{ padding: "4px 22px" }}
                    role="presentation"
                    className={
                      activeTab === "payment_settings"
                        ? "active activateSettings"
                        : ""
                    }
                  >
                    <a
                      href="#payment_settings"
                      aria-controls="payment_settings"
                      role="tab"
                      onClick={() => handleTabClick("payment_settings")}
                    >
                      Payment Settings
                    </a>
                  </li>
                  <li
                    style={{ padding: "4px 22px" }}
                    role="presentation"
                    className={
                      activeTab === "bank_details"
                        ? "active activateSettings"
                        : ""
                    }
                  >
                    <a
                      href="#bank_details"
                      aria-controls="bank_details"
                      role="tab"
                      onClick={() => handleTabClick("bank_details")}
                    // style={{color: activeTab === 'bank_details' ? 'white' : ""}}
                    >
                      Bank Details
                    </a>
                  </li> */}
                  <li
                    style={{ padding: "4px 22px" }}
                    role="presentation"
                    className={
                      activeTab === "password_change"
                        ? "active activateSettings"
                        : ""
                    }
                  >
                    <a
                      href="#password_change"
                      aria-controls="password_change"
                      role="tab"
                      onClick={() => handleTabClick("password_change")}
                    >
                      Password Change
                    </a>
                  </li>
                </ul>

                <div className="card-body">
                  <form onSubmit={handleSubmit}>
                    {activeTab === "general" && (
                      <GeneralSettings
                        setAppName={setAppName}
                        setHostEmail={setHostEmail}
                        appName={appName}
                        hostEmail={hostEmail}
                        appLogo={appLogo}
                        setAppLogo={setAppLogo}
                        author={author}
                        setAuthor={setAuthor}
                        contact={contact}
                        setContact={setContact}
                        website={website}
                        setWebsite={setWebsite}
                        developBy={developeBy}
                        setDevelopBy={setDevelopeBy}
                        previewImage={previewImage}
                        youtubeVideo={youtubeVideo}
                        setYoutubeVideo={setYoutubeVideo}
                        memberShipVideo={memberShipVideo}
                        setMemberShipVideo={setMemberShipVideo}
                      />
                    )}

                    {activeTab === "app_setting" && (
                      <AppSettings
                        setVersion={setVersion}
                        version={version}
                        mainDesc={mainDesc}
                        setMainDesc={setMainDesc}
                        updateDesc={updateDesc}
                        setUpdateDesc={setUpdateDesc}
                        maintenance={maintenance}
                        setMetMaintenance={setMetMaintenance}
                        cancelOption={cancelOption}
                        setCancelOption={setCancelOption}
                      />
                    )}

                    {/* {activeTab === "notification_setting" && (
                      <NotificationSettings
                        oneAppId={oneAppId}
                        restKey={restKey}
                        twoFecApiKey={twoFecApiKey}
                        serverKey={serverKey}
                        setOneAppId={setOneAppId}
                        setRestKey={setRestKey}
                        setServerKey={setServerKey}
                        setTwoFecApiKey={setTwoFecApiKey}
                        twoFecoptions={twoFecoptions}
                        setTwoFecoptions={setTwoFecoptions}
                      />
                    )}

                    {activeTab === "wallet&coins_setting" && (
                      <WalletCoinSettings
                        minCoinsAmount={minCoinsAmount}
                        minWalletAmount={minWalletAmount}
                        CoinsAmount={priceCovertCoins}
                        setMinCoinsAmount={setMinCoinsAmount}
                        setMinWalletAmount={setMinWalletAmount}
                        setCoinsAmount={setPriceCovertCoins}
                        setReviewAmount={setReviewAmount}
                        reviewAmount={reviewAmount}
                      />
                    )}

                    {activeTab === "payment_settings" && (
                      <PaymentSettings
                        razorKey={razorKey}
                        mapkey={mapkey}
                        setMapKey={setMapkey}
                        setRazorKey={setRazorKey}
                      />
                    )}

                    {activeTab === "bank_details" && (
                      <BankDetailsSettings
                        address={address}
                        setaddress={setaddress}
                        gstNo={gstNo}
                        setGstNo={setGstNo}
                        panNo={panNo}
                        setpanNo={setpanNo}
                        bankName={bankName}
                        setBankName={setBankName}
                        accountNo={accountNo}
                        setAccountNo={setAccountNo}
                        ifscCode={ifscCode}
                        setIfscCode={setIfscCode}
                        branch={branch}
                        setBranch={setBranch}
                        upiImage={upiImage}
                        setUpiImage={setUpiImage}
                        bankImage={bankImage}
                      />
                    )} */}

                    {activeTab != "password_change" && (
                      <div className="row mb-10">
                        <div className="col ms-auto">
                          <div className="d-flex flex-reverse flex-wrap gap-2">
                            <button className="btn btn-success" type="submit">
                              <i className="fas fa-save"></i> Save
                            </button>
                            {/* <a className="btn btn-danger" onClick={() => Navigate('/showCategory')}>
                                                    <i className="fas fa-window-close"></i> Cancel
                                                </a> */}
                          </div>
                          <AlertBox
                            status={settingsAddStatus}
                            statusMessage={statusMessage}
                          />
                        </div>
                      </div>
                    )}
                  </form>

                  {activeTab === "password_change" && (
                    <PasswordChange />
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GeneralSettingsMain;
