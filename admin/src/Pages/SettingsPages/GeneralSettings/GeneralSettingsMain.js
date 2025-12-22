import { useEffect, useState } from "react";

import "react-quill/dist/quill.snow.css";
import AlertBox from "../../../Components/AlertComp/AlertBox";
import axios from "axios";
import GeneralSettings from "./GeneralSettings";
import AppSettings from "./AppSettings";
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

                    {activeTab != "password_change" && (
                      <div className="row mb-10">
                        <div className="col ms-auto">
                          <div className="d-flex flex-reverse flex-wrap gap-2">
                            <button className="btn btn-success" type="submit">
                              <i className="fas fa-save"></i> Save
                            </button>

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
