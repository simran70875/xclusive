import React, { useEffect, useRef, useState } from "react";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import AlertBox from "../../../Components/AlertComp/AlertBox";
import axios from "axios";

let url = process.env.REACT_APP_API_URL;

const PageSettings = () => {
  const adminToken = localStorage.getItem("token");
  const [existingSettings, setExistingSettings] = useState({});
  const [activeTab, setActiveTab] = useState("about_us");
  const [aboutUs, setAboutUs] = useState("");
  const [contactUs, setContactUs] = useState("");
  const [privacyPolicy, setPrivacyPolicy] = useState("");
  const [terms, setTerms] = useState("");
  const [refunds, setRefunds] = useState("");
  const [returnpolicy, setReturnPolicy] = useState("");
  const [codPolicy, setCodPolicy] = useState("");
  const [faq, setFaq] = useState("");

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
    setAboutUs(existingSettings?.app_about_us);
    setContactUs(existingSettings?.app_contact_us);
    setPrivacyPolicy(existingSettings?.app_privacy_policy);
    setTerms(existingSettings?.app_terms_condition);
    setRefunds(existingSettings?.app_cancellation_refund);
    setCodPolicy(existingSettings?.app_cod_policy);
    setReturnPolicy(existingSettings?.app_return_refund_policy);
    setFaq(existingSettings?.app_faq);
  }, [existingSettings]);

  const [settingsAddStatus, setSettingsAddStatus] = useState("");
  const [statusMessage, setStatusMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    const settings = {
      app_contact_us: contactUs,
      app_about_us: aboutUs,
      app_terms_condition: terms,
      app_cancellation_refund: refunds,
      app_privacy_policy: privacyPolicy,
      app_cod_policy: codPolicy,
      app_return_refund_policy: returnpolicy,
      app_faq: faq,
    };

    try {
      const response = await axios.patch(
        `${url}/app/settings/update`,
        settings,
        {
          headers: {
            Authorization: `${adminToken}`,
          },
        }
      );
      if (response.data.type === "success") {
        setSettingsAddStatus(response.data.type);
        setStatusMessage(response.data.message);
        setTimeout(() => {}, 900);
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

  const editor = useRef();

  const handleAboutUs = (value) => {
    setAboutUs(value);
  };

  const handleContactUs = (value) => {
    setContactUs(value);
  };

  const handlePolicy = (value) => {
    setPrivacyPolicy(value);
  };

  const handleRefund = (value) => {
    setRefunds(value);
  };

  const handleTerms = (value) => {
    setTerms(value);
  };

  const handleReturn = (value) => {
    setReturnPolicy(value);
  };

  const handleCod = (value) => {
    setCodPolicy(value);
  };

  const handleFaq = (value) => {
    setFaq(value);
  };

  // Quill.register(quillTable.TableCell);
  // Quill.register(quillTable.TableRow);
  // Quill.register(quillTable.Table);
  // Quill.register(quillTable.Contain);
  // Quill.register('modules/table', quillTable.TableModule);

  const tableOptions = [];
  const maxRows = 8;
  const maxCols = 5;
  for (let r = 1; r <= maxRows; r++) {
    for (let c = 1; c <= maxCols; c++) {
      tableOptions.push("newtable_" + r + "_" + c);
    }
  }

  const editorModules = {
    toolbar: [
      [
        { header: "1" },
        { header: "2" },
        { header: [3, 4, 5, 6] },
        { font: [] },
      ],
      [{ size: [] }],
      ["bold", "italic", "underline", "strike", "blockquote"],
      [{ list: "ordered" }, { list: "bullet" }],
      ["link", "video", "image"],
      ["clean"],
      ["code-block"],
      [{ color: [] }, { background: [] }],
      [{ font: [] }],
      [{ align: [] }],
      [{ script: "sub" }, { script: "super" }],
      [{ indent: "-1" }, { indent: "+1" }],
      [{ direction: "rtl" }, { table: tableOptions }],
    ],
  };

  return (
    <div className="main-content dark">
      <div className="page-content">
        <div className="container-fluid">
          <div className="row">
            <div className="col-12">
              <div className="page-title-box d-flex align-items-center justify-content-between">
                <div className="col-3 table-heading">App Pages Settings</div>
              </div>
            </div>
          </div>
          <div className="row">
            <div className="col-12">
              <div className="card">
                <ul className="nav nav-tabs settingsContainer" role="tablist">
                  <li
                    style={{ padding: "4px 20px", fontSize: "18px" }}
                    role="presentation"
                    className={
                      activeTab === "about_us" ? "active activateSettings" : ""
                    }
                  >
                    <a
                      href="#about_us"
                      aria-controls="about_us"
                      role="tab"
                      onClick={() => handleTabClick("about_us")}
                    >
                      About us
                    </a>
                  </li>
                  <li
                    style={{ padding: "4px 20px", fontSize: "18px" }}
                    role="presentation"
                    className={
                      activeTab === "contact_us"
                        ? "active activateSettings"
                        : ""
                    }
                  >
                    <a
                      href="#contact_us"
                      aria-controls="contact_us"
                      role="tab"
                      onClick={() => handleTabClick("contact_us")}
                    >
                      Contact Us
                    </a>
                  </li>
                  <li
                    style={{ padding: "4px 20px", fontSize: "18px" }}
                    role="presentation"
                    className={
                      activeTab === "privacy_policy"
                        ? "active activateSettings"
                        : ""
                    }
                  >
                    <a
                      href="#privacy_policy"
                      aria-controls="privacy_policy"
                      role="tab"
                      onClick={() => handleTabClick("privacy_policy")}
                    >
                      Privacy Policy
                    </a>
                  </li>
                  <li
                    style={{ padding: "4px 20px", fontSize: "18px" }}
                    role="presentation"
                    className={
                      activeTab === "terms&condition"
                        ? "active activateSettings"
                        : ""
                    }
                  >
                    <a
                      href="#terms&condition"
                      aria-controls="terms&condition"
                      role="tab"
                      onClick={() => handleTabClick("terms&condition")}
                    >
                      Terms&Condition
                    </a>
                  </li>
                  <li
                    style={{ padding: "4px 20px", fontSize: "18px" }}
                    role="presentation"
                    className={
                      activeTab === "cancellation"
                        ? "active activateSettings"
                        : ""
                    }
                  >
                    <a
                      href="#cancellation"
                      aria-controls="cancellation"
                      role="tab"
                      onClick={() => handleTabClick("cancellation")}
                    >
                      Cancellation
                    </a>
                  </li>
                  <li
                    style={{ padding: "4px 20px", fontSize: "18px" }}
                    role="presentation"
                    className={
                      activeTab === "return&refund"
                        ? "active activateSettings"
                        : ""
                    }
                  >
                    <a
                      href="#return&refund"
                      aria-controls="return&refund"
                      role="tab"
                      onClick={() => handleTabClick("return&refund")}
                    >
                      Return&Refund Policy
                    </a>
                  </li>
                  <li
                    style={{ padding: "4px 20px", fontSize: "18px" }}
                    role="presentation"
                    className={
                      activeTab === "cod" ? "active activateSettings" : ""
                    }
                  >
                    <a
                      href="#cod"
                      aria-controls="cod"
                      role="tab"
                      onClick={() => handleTabClick("cod")}
                    >
                      COD Policy
                    </a>
                  </li>
                  <li
                    style={{ padding: "4px 20px", fontSize: "18px" }}
                    role="presentation"
                    className={
                      activeTab === "faq" ? "active activateSettings" : ""
                    }
                  >
                    <a
                      href="#faq"
                      aria-controls="faq"
                      role="tab"
                      onClick={() => handleTabClick("faq")}
                    >
                      App FAQs
                    </a>
                  </li>
                </ul>

                <div className="card-body">
                  <form onSubmit={handleSubmit}>
                    {activeTab === "about_us" && (
                      <div className="mb-3 row">
                        <label
                          htmlFor="example-text-input"
                          className="col-md-2 col-form-label"
                        >
                          App About us :-
                        </label>
                        <div className="col-md-10">
                          <ReactQuill
                            ref={editor}
                            value={aboutUs}
                            onChange={handleAboutUs}
                            modules={editorModules}
                            className="custom-quill-editor"
                          />
                        </div>
                      </div>
                    )}

                    {activeTab === "contact_us" && (
                      <div className="mb-3 row">
                        <label
                          htmlFor="example-text-input"
                          className="col-md-2 col-form-label"
                        >
                          App Contact us :-
                        </label>
                        <div className="col-md-10">
                          <ReactQuill
                            ref={editor}
                            value={contactUs}
                            onChange={handleContactUs}
                            modules={editorModules}
                            className="custom-quill-editor"
                          />
                        </div>
                      </div>
                    )}

                    {activeTab === "privacy_policy" && (
                      <div className="mb-3 row">
                        <label
                          htmlFor="example-text-input"
                          className="col-md-2 col-form-label"
                        >
                          App Privacy Policy :-
                        </label>
                        <div className="col-md-10">
                          <ReactQuill
                            ref={editor}
                            value={privacyPolicy}
                            onChange={handlePolicy}
                            modules={editorModules}
                            className="custom-quill-editor"
                          />
                        </div>
                      </div>
                    )}

                    {activeTab === "terms&condition" && (
                      <div className="mb-3 row">
                        <label
                          htmlFor="example-text-input"
                          className="col-md-2 col-form-label"
                        >
                          App Terms & Condition :-
                        </label>
                        <div className="col-md-10">
                          <ReactQuill
                            ref={editor}
                            value={terms}
                            onChange={handleTerms}
                            modules={editorModules}
                            className="custom-quill-editor"
                          />
                        </div>
                      </div>
                    )}

                    {activeTab === "cancellation" && (
                      <div className="mb-3 row">
                        <label
                          htmlFor="example-text-input"
                          className="col-md-2 col-form-label"
                        >
                          App Cancellation Policies :-
                        </label>
                        <div className="col-md-10">
                          <ReactQuill
                            ref={editor}
                            value={refunds}
                            onChange={handleRefund}
                            modules={editorModules}
                            className="custom-quill-editor"
                          />
                        </div>
                      </div>
                    )}

                    {activeTab === "return&refund" && (
                      <div className="mb-3 row">
                        <label
                          htmlFor="example-text-input"
                          className="col-md-2 col-form-label"
                        >
                          App Return/Refund Policies :-
                        </label>
                        <div className="col-md-10">
                          <ReactQuill
                            ref={editor}
                            value={returnpolicy}
                            onChange={handleReturn}
                            modules={editorModules}
                            className="custom-quill-editor"
                          />
                        </div>
                      </div>
                    )}

                    {activeTab === "cod" && (
                      <div className="mb-3 row">
                        <label
                          htmlFor="example-text-input"
                          className="col-md-2 col-form-label"
                        >
                          App COD Policies :-
                        </label>
                        <div className="col-md-10">
                          <ReactQuill
                            ref={editor}
                            value={codPolicy}
                            onChange={handleCod}
                            modules={editorModules}
                            className="custom-quill-editor"
                          />
                        </div>
                      </div>
                    )}

                    {activeTab === "faq" && (
                      <div className="mb-3 row">
                        <label
                          htmlFor="example-text-input"
                          className="col-md-2 col-form-label"
                        >
                          App FAQs :-
                        </label>
                        <div className="col-md-10">
                          <ReactQuill
                            ref={editor}
                            value={faq}
                            onChange={handleFaq}
                            modules={editorModules}
                            className="custom-quill-editor"
                          />
                        </div>
                      </div>
                    )}

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
                      </div>
                      <AlertBox
                        status={settingsAddStatus}
                        statusMessage={statusMessage}
                      />
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PageSettings;
