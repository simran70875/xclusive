import React, { useEffect, useState } from "react";
import down_arrow from "../../resources/assets/images/down-arrow.svg";
import { useNavigate } from "react-router-dom";
import axios from "axios";

let url = process.env.REACT_APP_API_URL;

const LeftSide = () => {
  const adminToken = localStorage.getItem("token");
  const Navigate = useNavigate();
  const [activeMenu, setActiveMenu] = useState("");

  // get current url
  useEffect(() => {
    const currentURL = window.location.href;
    const url = new URL(currentURL);
    const point = url.pathname.split("/").pop();
    setActiveMenu(point);
  });

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
  }, [settingsData, adminToken]);

  return (
    <>
      <div className="vertical-menu">
        <div className="navbar-brand-box">
          <a className="logo logo-dark">
            <span
              className="logo-sm"
              style={{
                textTransform: "uppercase",
                fontWeight: "bolder",
                fontSize: 30,
                color: "#000",
              }}
            >
              XD
            </span>
            <span
              className="logo-lg"
              style={{
                textTransform: "uppercase",
                fontWeight: "bolder",
                fontSize: 18,
                color: "#000",
              }}
            >
              XClusive Diamonds
            </span>
          </a>

          <a className="logo logo-light">
            <span
              className="logo-sm"
              style={{
                textTransform: "uppercase",
                fontWeight: "bolder",
                fontSize: 50,
              }}
            >
              XClusive Diamonds
            </span>
            <span
              className="logo-lg"
              style={{
                textTransform: "uppercase",
                fontWeight: "bolder",
                fontSize: 50,
              }}
            >
              XClusive Diamonds
            </span>
          </a>
        </div>

        <button
          type="button"
          className="btn btn-sm px-3 font-size-16 header-item waves-effect vertical-menu-btn"
          onClick={() => {
            document.body.setAttribute("data-sidebar-size", "sm");
            document.body.classList.add("sidebar-enable");
            document.body.classList.add("sm");
            document.body.classList.remove("lg");
          }}
        >
          <i className="fa fa-fw fa-bars"></i>
        </button>

        <div data-simplebar className="sidebar-menu-scroll">
          <div id="sidebar-menu">
            <ul className="metismenu list-unstyled" id="side-menu">
              <li className="menu-title">Menu</li>

              <li
                className={`${activeMenu === "" ? "mm-active" : ""}`}
                onClick={() => {
                  Navigate("/");
                }}
              >
                <a className={`${activeMenu === "" ? "active" : ""}`}>
                  <i className="uil-home-alt">
                    <i className="fas fa-home" aria-hidden="true"></i>
                  </i>
                  {/* <span className="badge rounded-pill bg-primary float-end">
                                        01
                                    </span> */}
                  <span>Dashboard</span>
                </a>
              </li>

              <li
                className={`${
                  activeMenu === "addMarquee" ||
                  activeMenu === "addChargesSettings" ||
                  activeMenu === "memberShipSettings" ||
                  activeMenu === "generalSettings" ||
                  activeMenu === "pageSettings"
                    ? "mm-active"
                    : ""
                }`}
              >
                <a
                  className={`${
                    activeMenu === "addMarquee" ||
                    activeMenu === "addChargesSettings" ||
                    activeMenu === "memberShipSettings" ||
                    activeMenu === "generalSettings" ||
                    activeMenu === "pageSettings"
                      ? "active"
                      : ""
                  } waves-effect d-flex sub-drop`}
                  onClick={() => {
                    document
                      .querySelector(".sub-menu1")
                      .classList.toggle("active");
                    document.querySelector("#w-243").classList.toggle("active");
                  }}
                >
                  <div>
                    <i className="uil-store">
                      <i className="fas fa-cogs" aria-hidden="true"></i>
                    </i>
                    <span style={{ marginLeft: "3px" }}>Settings</span>
                  </div>
                  <img className="w-24" id="w-243" src={down_arrow} />
                </a>
                <ul className="sub-menu sub-menu1" aria-expanded="false">
                  <li
                    onClick={() => {
                      Navigate("/addMarquee");
                    }}
                    style={{ cursor: "pointer" }}
                    className={`${
                      activeMenu === "addMarquee" ? "mm-active" : ""
                    }`}
                  >
                    <a>Add Marquee Text</a>
                  </li>
                  <li
                    onClick={() => {
                      Navigate("/addChargesSettings");
                    }}
                    style={{ cursor: "pointer" }}
                    className={`${
                      activeMenu === "addChargesSettings" ? "mm-active" : ""
                    }`}
                  >
                    <a>Add Charges Settings</a>
                  </li>

                  <li
                    onClick={() => {
                      Navigate("/generalSettings");
                    }}
                    style={{ cursor: "pointer" }}
                    className={`${
                      activeMenu === "generalSettings" ? "mm-active" : ""
                    }`}
                  >
                    <a>General Settings</a>
                  </li>
                  <li
                    onClick={() => {
                      Navigate("/pageSettings");
                    }}
                    style={{ cursor: "pointer" }}
                    className={`${
                      activeMenu === "pageSettings" ? "mm-active" : ""
                    }`}
                  >
                    <a>Page Settings</a>
                  </li>
                </ul>
              </li>

              <li className="menu-title">User</li>

              <li
                className={`${activeMenu === `showUser` ? "mm-active" : ""}`}
                onClick={() => {
                  Navigate("/showUser");
                }}
              >
                <a
                  className={`${
                    activeMenu === `showUser` ? "active" : ""
                  } waves-effect`}
                >
                  <i className="uil-book-alt">
                    <i className="fas fa-user"></i>
                  </i>
                  <span>Retailers</span>
                </a>
              </li>

              <li
                className={`${activeMenu === `showReview` ? "mm-active" : ""}`}
                onClick={() => {
                  Navigate("/showReview");
                }}
              >
                <a
                  className={`${
                    activeMenu === `showReview` ? "active" : ""
                  } waves-effect`}
                >
                  <i className="uil-book-alt">
                    <i className="fas fa-user-edit"></i>
                  </i>
                  <span>Rating & Review</span>
                </a>
              </li>

              <li
                className={`${
                  activeMenu === `showCoupon` ||
                  activeMenu === `addCoupon` ||
                  activeMenu === `editCoupon`
                    ? "mm-active"
                    : ""
                }`}
                onClick={() => {
                  Navigate("/showCoupon");
                }}
              >
                <a
                  className={`${
                    activeMenu === `showCoupon` ||
                    activeMenu === `addCoupon` ||
                    activeMenu === `editCoupon`
                      ? "active"
                      : ""
                  } waves-effect`}
                >
                  <i className="uil-book-alt">
                    <i className="fas fa-ticket-alt"></i>
                  </i>
                  <span>Coupon</span>
                </a>
              </li>

              <li className="menu-title">Orders</li>

              <li
                className={`${
                  activeMenu === `showOrders` || activeMenu === `editOrders`
                    ? // activeMenu === `showSpecification`
                      "mm-active"
                    : ""
                }`}
                onClick={() => {
                  Navigate("/showOrders");
                }}
              >
                <a
                  className={`${
                    activeMenu === `showOrders` || activeMenu === `editOrders`
                      ? // activeMenu === `editSpecification`
                        "active"
                      : ""
                  } waves-effect`}
                >
                  <i className="uil-book-alt">
                    <i className="fas fa-shopping-bag"></i>
                  </i>
                  <span>Orders</span>
                </a>
              </li>

              <li
                className={`${activeMenu === "newOrder" ? "mm-active" : ""}`}
                onClick={() => {
                  Navigate("/newOrder");
                }}
              >
                <a
                  className={` ${
                    activeMenu === "newOrder" ? "active" : ""
                  } waves-effect`}
                >
                  <i className="uil-book-alt">
                    <i className="fas fa-shopping-bag"></i>
                  </i>
                  <span>Create New Order</span>
                </a>
              </li>

              <li className="menu-title">Product</li>

              <li
                className={`${
                  activeMenu === `showSpecification` ||
                  activeMenu === `showSpecification` ||
                  activeMenu === `showSpecification`
                    ? "mm-active"
                    : ""
                }`}
                onClick={() => {
                  Navigate("/showSpecification");
                }}
              >
                <a
                  className={`${
                    activeMenu === `showSpecification` ||
                    activeMenu === `addSpecification` ||
                    activeMenu === `editSpecification`
                      ? "active"
                      : ""
                  } waves-effect`}
                >
                  <i className="uil-book-alt">
                    <i className="fas fa-clipboard-list"></i>
                  </i>
                  <span>Collection & Brands</span>
                </a>
              </li>

              <li
                className={`${
                  activeMenu === `showCategory` ||
                  activeMenu === `addCategory` ||
                  activeMenu === `editCategory`
                    ? "mm-active"
                    : ""
                }`}
                onClick={() => {
                  Navigate("/showCategory");
                }}
              >
                <a
                  className={`${
                    activeMenu === `showCategory` ||
                    activeMenu === `addCategory` ||
                    activeMenu === `editCategory`
                      ? "active"
                      : ""
                  } waves-effect`}
                >
                  <i className="uil-book-alt">
                    <i className="fas fa-th-large"></i>
                  </i>
                  <span>Category</span>
                </a>
              </li>

              <li
                className={`${
                  activeMenu === `showProduct` ||
                  activeMenu === `addProduct` ||
                  activeMenu === `editProduct` ||
                  activeMenu === `addVariation` ||
                  activeMenu === `showVariation` ||
                  activeMenu === `editVariation` ||
                  activeMenu === `addVariationSize` ||
                  activeMenu === `showVariationSize` ||
                  activeMenu === `editVariationSize`
                    ? "mm-active"
                    : ""
                }`}
                onClick={() => {
                  Navigate("/showProduct");
                }}
              >
                <a
                  className={`${
                    activeMenu === `showProduct` ||
                    activeMenu === `addProduct` ||
                    activeMenu === `editProduct` ||
                    activeMenu === `addVariation` ||
                    activeMenu === `showVariation` ||
                    activeMenu === `editVariation` ||
                    activeMenu === `addVariationSize` ||
                    activeMenu === `showVariationSize` ||
                    activeMenu === `editVariationSize`
                      ? "active"
                      : ""
                  } waves-effect`}
                >
                  <i className="uil-book-alt">
                    <i className="fas fa-box-open"></i>
                  </i>
                  <span>Product</span>
                </a>
              </li>

              <li
                className={`${
                  activeMenu === `showBanner` ||
                  activeMenu === `addBanner` ||
                  activeMenu === `editBanner`
                    ? "mm-active"
                    : ""
                }`}
                onClick={() => {
                  Navigate("/showBanner");
                }}
              >
                <a
                  className={`${
                    activeMenu === `showBanner` ||
                    activeMenu === `addBanner` ||
                    activeMenu === `editBanner`
                      ? "active"
                      : ""
                  } waves-effect`}
                >
                  <i className="uil-book-alt">
                    {/* <i className="fas fa-images"></i> */}
                    <i className="fas fa-window-maximize"></i>
                  </i>
                  <span>Banner</span>
                </a>
              </li>
              <li
                className={`${
                  activeMenu === `showPopBanner` ||
                  activeMenu === `addPopBanner` ||
                  activeMenu === `editPopBanner`
                    ? "mm-active"
                    : ""
                }`}
                onClick={() => {
                  Navigate("/showPopBanner");
                }}
              >
                <a
                  className={`${
                    activeMenu === `showPopBanner` ||
                    activeMenu === `addPopBanner` ||
                    activeMenu === `editPopBanner`
                      ? "active"
                      : ""
                  } waves-effect`}
                >
                  <i className="uil-book-alt">
                    {/* <i className="fas fa-images"></i> */}
                    <i className="fas fa-window-maximize"></i>
                  </i>
                  <span>Pop-up Banner</span>
                </a>
              </li>

              <li
                className={`${
                  activeMenu === `showProductBanner` ||
                  activeMenu === `addProductBanner` ||
                  activeMenu === `editProductBanner`
                    ? "mm-active"
                    : ""
                }`}
                onClick={() => {
                  Navigate("/showProductBanner");
                }}
              >
                <a
                  className={`${
                    activeMenu === `showProductBanner` ||
                    activeMenu === `addProductBanner` ||
                    activeMenu === `editProductBanner`
                      ? "active"
                      : ""
                  } waves-effect`}
                >
                  <i className="uil-book-alt">
                    <i className="fas fa-window-restore"></i>
                  </i>
                  <span>Product Banner</span>
                </a>
              </li>

              <li className="menu-title">Stock Management</li>

              <li
                className={`${
                  activeMenu === `showLowStockProduct` ? "mm-active" : ""
                }`}
                onClick={() => {
                  Navigate("/showLowStockProduct");
                }}
              >
                <a
                  className={`${
                    activeMenu === `showLowStockProduct` ? "active" : ""
                  } waves-effect`}
                >
                  <i className="uil-book-alt">
                    {/* <i className="fas fa-images"></i> */}
                    <i className="fas fa-boxes"></i>
                  </i>
                  <span>Low Stock Product</span>
                </a>
              </li>

              <li
                className={`${
                  activeMenu === `showProductNotify` ? "mm-active" : ""
                }`}
                onClick={() => {
                  Navigate("/showProductNotify");
                }}
              >
                <a
                  className={`${
                    activeMenu === `showProductNotify` ? "active" : ""
                  } waves-effect`}
                >
                  <i className="uil-book-alt">
                    {/* <i className="fas fa-images"></i> */}
                    <i className="fas fa-hand-holding-medical"></i>
                  </i>
                  <span>User Notify Product</span>
                </a>
              </li>

              <li className="menu-title">Notification</li>

              <li
                className={`${
                  activeMenu === `sendNotification` ||
                  activeMenu === `showNotification`
                    ? "mm-active"
                    : ""
                }`}
                onClick={() => {
                  Navigate("/showNotification");
                }}
              >
                <a
                  className={`${
                    activeMenu === `sendNotification` ||
                    activeMenu === `showNotification`
                      ? "active"
                      : ""
                  } waves-effect`}
                >
                  <i className="uil-book-alt">
                    <i className="fas fa-paper-plane"></i>
                  </i>
                  <span>Notification</span>
                </a>
              </li>

              <li
                className={`${
                  activeMenu === `showNewsletter` ? "mm-active" : ""
                }`}
                onClick={() => {
                  Navigate("/showNewsletter");
                }}
              >
                <a
                  className={`${
                    activeMenu === `showNewsletter` ? "active" : ""
                  } waves-effect`}
                >
                  <i className="uil-book-alt">
                    <i className="fas fa-paper-plane"></i>
                  </i>
                  <span>Newsletter</span>
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </>
  );
};

export default LeftSide;
