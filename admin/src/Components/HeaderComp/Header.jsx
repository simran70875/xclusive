import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

let url = process.env.REACT_APP_API_URL;

const Header = () => {
  const adminToken = localStorage.getItem("token");
  const Navigate = useNavigate();

  const [settingsData, setSettingsData] = useState({});

  useEffect(() => {
    async function getSettings() {
      try {
        const res = await axios.get(`${url}/app/settings/get`, {
          headers: {
            Authorization: `${adminToken}`,
          },
        });
        setSettingsData(res?.data?.Settings);
      } catch (error) {
        console.log(error);
      }
    }
    getSettings();
  }, [settingsData]);

  const [userRole, setUserRole] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminName, setAdminName] = useState("");

  useEffect(() => {
    let adminToken = localStorage.getItem("token");
    async function checkAdmin() {
      try {
        const res = await axios.get(`${url}/auth/checkAdmin`, {
          headers: {
            Authorization: `${adminToken}`,
          },
        });
        if (res?.data?.type === "success") {
          const userRoleFromServer = "admin";
          setUserRole(userRoleFromServer);
          setIsAdmin(true);
        }
      } catch (error) {
        console.log(error);
      }
    }

    async function checkName() {
      try {
        const res = await axios.get(`${url}/auth/userName`, {
          headers: {
            Authorization: `${adminToken}`,
          },
        });
        if (res?.data?.type === "success") {
          setAdminName(res?.data?.name);
        }
      } catch (error) {
        console.log(error);
      }
    }

    checkName();
    checkAdmin();
  }, []);

  const handleSingOut = () => {
    localStorage.removeItem("token");
    Navigate("/login");
  };

  return (
    <>
      <header id="page-topbar">
        <div className="navbar-header">
          <div className="d-flex">
            <button
              type="button"
              className="btn btn-sm px-3 font-size-16 header-item waves-effect vertical-menu-btn"
              onClick={() => {
                document
                  .querySelector(".vertical-menu")
                  .classList.toggle("active");
                document.body.setAttribute("data-sidebar-size", "lg");
                document.body.classList.add("lg");
                document.body.classList.remove("sm");
              }}
            >
              <i className="fa fa-fw fa-bars"></i>
            </button>

            <form className="app-search d-none d-lg-block">
              <div className="position-relative">
                <input
                  type="text"
                  className="form-control"
                  placeholder="Search..."
                />
                <span className="uil-search">
                  <i className="fa fa-search" aria-hidden="true"></i>
                </span>
              </div>
            </form>
          </div>

          <div className="d-flex">
            <div className="dropdown d-inline-block d-lg-none ms-2">
              <button
                type="button"
                className="btn header-item noti-icon waves-effect"
                id="page-header-search-dropdown"
                data-bs-toggle="dropdown"
                aria-haspopup="true"
                aria-expanded="false"
              >
                <i className="uil-search"></i>
                <i className="fa fa-search" aria-hidden="true"></i>
              </button>
              <div
                className="dropdown-menu dropdown-menu-lg dropdown-menu-end p-0"
                aria-labelledby="page-header-search-dropdown"
              >
                <form className="p-3">
                  <div className="m-0">
                    <div className="input-group">
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Search ..."
                        aria-label="Recipient's username"
                      />
                      <div className="input-group-append">
                        <button className="btn btn-primary" type="submit">
                          <i className="mdi mdi-magnify"></i>
                        </button>
                      </div>
                    </div>
                  </div>
                </form>
              </div>
            </div>

            {/* <div className="dropdown d-inline-block language-switch">
                            <button type="button" className="btn header-item waves-effect"
                                data-bs-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                                <img src="" alt="Header Language" height="16" />
                            </button>
                            <div className="dropdown-menu dropdown-menu-end">

                                <a  className="dropdown-item notify-item">
                                    <img src="assets/images/flags/spain.jpg" alt="user-image" className="me-1" height="12" /> <span className="align-middle">Spanish</span>
                                </a>

                                <a  className="dropdown-item notify-item">
                                    <img src="assets/images/flags/germany.jpg" alt="user-image" className="me-1" height="12" /> <span className="align-middle">German</span>
                                </a>

                                <a  className="dropdown-item notify-item">
                                    <img src="assets/images/flags/italy.jpg" alt="user-image" className="me-1" height="12" /> <span className="align-middle">Italian</span>
                                </a>

                                <a  className="dropdown-item notify-item">
                                    <img src="assets/images/flags/russia.jpg" alt="user-image" className="me-1" height="12" /> <span className="align-middle">Russian</span>
                                </a>
                            </div>
                        </div> */}

            {/* <div className="dropdown d-none d-lg-inline-block ms-1">
                            <button type="button" className="btn header-item noti-icon waves-effect"
                                data-bs-toggle="dropdown" aria-haspopup="true" aria-expanded="false" >
                                <i className="uil-apps"></i>
                                hello
                                <i className="fa-light fa-grid-2"></i>
                            </button>
                            <div className="dropdown-menu dropdown-menu-lg dropdown-menu-end">
                                <div className="px-lg-2">
                                    <div className="row g-0">
                                        <div className="col">
                                            <a className="dropdown-icon-item" href="#">
                                                <img src={github} alt="Github" />
                                                <span>GitHub</span>
                                            </a>
                                        </div>
                                        <div className="col">
                                            <a className="dropdown-icon-item" href="#">
                                                <img src={bigbucket} alt="bitbucket" />
                                                <span>Bitbucket</span>
                                            </a>
                                        </div>
                                        <div className="col">
                                            <a className="dropdown-icon-item" href="#">
                                                <img src={dribbble} alt="dribbble" />
                                                <span>Dribbble</span>
                                            </a>
                                        </div>
                                    </div>

                                    <div className="row g-0">
                                        <div className="col">
                                            <a className="dropdown-icon-item" href="#">
                                                <img src="assets/images/brands/dropbox.png" alt="dropbox" />
                                                <span>Dropbox</span>
                                            </a>
                                        </div>
                                        <div className="col">
                                            <a className="dropdown-icon-item" href="#">
                                                <img src="assets/images/brands/mail_chimp.png" alt="mail_chimp" />
                                                <span>Mail Chimp</span>
                                            </a>
                                        </div>
                                        <div className="col">
                                            <a className="dropdown-icon-item" href="#">
                                                <img src="assets/images/brands/slack.png" alt="slack" />
                                                <span>Slack</span>
                                            </a>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div> */}

            {/* <div className="dropdown d-none d-lg-inline-block ms-1">
                            <button type="button" className="btn header-item noti-icon waves-effect" data-bs-toggle="fullscreen">
                                <i className="fas fa-expand"></i>
                            </button>
                        </div> */}

            <div className="dropdown d-inline-block">
              {/* <button
                                type="button"
                                className="btn header-item noti-icon waves-effect"
                                id="page-header-notifications-dropdown"
                                data-bs-toggle="dropdown"
                                aria-haspopup="true"
                                aria-expanded="false"
                            >
                                <i className="far fa-bell"></i>
                                <span className="badge bg-danger rounded-pill">3</span>
                            </button>
                            <div
                                className="dropdown-menu dropdown-menu-lg dropdown-menu-end p-0"
                                aria-labelledby="page-header-notifications-dropdown"
                            >
                                <div className="p-3">
                                    <div className="row align-items-center">
                                        <div className="col">
                                            <h5 className="m-0 font-size-16"> Notifications </h5>
                                        </div>
                                        <div className="col-auto">
                                            <a className="small"> Mark all as read</a>
                                        </div>
                                    </div>
                                </div>
                                <div data-simplebar style={{ maxHeight: "230px" }}>
                                    <a className="text-reset notification-item">
                                        <div className="d-flex align-items-start">
                                            <div className="flex-shrink-0 me-3">
                                                <div className="avatar-xs">
                                                    <span className="avatar-title bg-primary rounded-circle font-size-16">
                                                        <i className="uil-shopping-basket"></i>
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="flex-grow-1">
                                                <h6 className="mb-1">Your order is placed</h6>
                                                <div className="font-size-12 text-muted">
                                                    <p className="mb-1">
                                                        If several languages coalesce the grammar
                                                    </p>
                                                    <p className="mb-0">
                                                        <i className="mdi mdi-clock-outline"></i> 3 min ago
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </a>
                                </div>
                                <div className="p-2 border-top">
                                    <div className="d-grid">
                                        <a className="btn btn-sm btn-link font-size-14 text-center">
                                            <i className="uil-arrow-circle-right me-1"></i> View
                                            More..
                                        </a>
                                    </div>
                                </div>
                            </div> */}
            </div>

            <div className="dropdown d-inline-block">
              <button
                type="button"
                className="btn header-item waves-effect d-flex align-items-center gap-10"
                id="page-header-user-dropdown"
                data-bs-toggle="dropdown"
                aria-haspopup="true"
                aria-expanded="false"
              >
                <div
                  className="rounded-circle header-profile-user d-flex align-items-center justify-content-center"
                  style={{
                    fontWeight: "bolder",
                  }}
                  alt="Admin"
                >
                  XD
                </div>
                <span className="d-none d-xl-inline-block ms-1 fw-medium font-size-15">
                  {adminName}
                </span>
                <i className="uil-angle-down d-none d-xl-inline-block font-size-15"></i>
              </button>
              <div className="dropdown-menu dropdown-menu-end">
                <a
                  className="dropdown-item"
                  onClick={() => Navigate("/generalSettings")}
                >
                  <i className="uil uil-user-circle font-size-18 align-middle text-muted me-1"></i>{" "}
                  <span className="align-middle">View Profile</span>
                </a>

                {isAdmin && (
                  <a
                    className="dropdown-item"
                    onClick={() => Navigate("/showSubAdmin")}
                  >
                    <i className="uil uil-sign-out-alt font-size-18 align-middle me-1 text-muted"></i>{" "}
                    <span className="align-middle">Sub Admin</span>
                  </a>
                )}

                <a
                  className="dropdown-item d-block"
                  onClick={() => Navigate("/addChargesSettings")}
                >
                  <i className="uil uil-cog font-size-18 align-middle me-1 text-muted"></i>{" "}
                  <span className="align-middle">Settings</span>{" "}
                  {/* <span className="badge bg-success-subtle rounded-pill mt-1 ms-2">
                                        03
                                    </span> */}
                </a>
                <a className="dropdown-item" onClick={() => handleSingOut()}>
                  <i className="uil uil-sign-out-alt font-size-18 align-middle me-1 text-muted"></i>{" "}
                  <span className="align-middle">Sign out</span>
                </a>
              </div>
            </div>

            <div className="dropdown d-inline-block">
              <button
                type="button"
                className="btn header-item noti-icon right-bar-toggle waves-effect"
                onClick={() => {
                  document.body.classList.add("right-bar-enabled");
                }}
              >
                <i className="uil-cog fa fa-cog"></i>
              </button>
            </div>
          </div>
        </div>
      </header>
    </>
  );
};

export default Header;
