import moment from "moment";
import { useSelector } from "react-redux";
import { Button, Col, Image, Row } from "antd";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import {
  FacebookFilled,
  FacebookOutlined,
  LoginOutlined,
  YoutubeFilled,
  YoutubeOutlined,
} from "@ant-design/icons";
import { routes } from "../../Routes/Routes";
import logo2 from "../../Assets/PNG/logo.png";
import facebook from "../../Assets/PNG/facebook.png";
import youtube from "../../Assets/PNG/youtube.png";
import axios from "axios";
import styles from "./index.module.scss";
import { apiUrl } from "../../Constant";

function Footer() {
  const navigate = useNavigate();
  const [date, setDate] = useState();
  const userToken = useSelector((state) => state.user?.token);

  const [email, setEmail] = useState(""); // State to manage email input
  const [error, setError] = useState(""); // State to manage errors
  const [successMessage, setSuccessMessage] = useState(""); // State for success message

  const handleSubscribe = async () => {
    // Basic email validation
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Please enter a valid email address");
      setSuccessMessage(""); // Clear success message if any
      return;
    }

    try {
      const obj = { email };

      // Clear error message before making the request
      setError("");

      // Make the POST request to the API

      const response = await axios.post(apiUrl.ADD_NEWSLETTER, obj);
      console.log(response);
      if (response.data.type === "success") {
        setSuccessMessage("Successfully subscribed!");
        setEmail("");
      } else {
        setError(response.data.message || "Failed to subscribe");
      }
    } catch (error) {
      setError(error + "Failed to subscribe. Please try again later.");
    }
  };

  useEffect(() => {
    setDate(moment(new Date()).format("YYYY"));
  }, []);

  return (
    <div className={styles.footer}>
      <div className={styles.footerStyle}>
        <Row justify="space-between" className={styles.footermanage}>
          <Col xs={12} md={10} lg={10} xl={6} xxl={6}>
            <div className={styles.main}>
              <div className={styles.logo}>
                <img src={logo2} alt="logo" />
              </div>
              <div className={styles.about}>
                As a UK-based house with a global presence, we are proud to
                serve clients around the world, offering not only exceptional
                jewellery but also a promise
              </div>
              <div className={styles.icon}>
                <div
                  onClick={() =>
                    window.open("https://www.youtube.com/@xclusivediamonds")
                  }
                >
                  <YoutubeFilled
                    style={{
                      fontSize: 40,
                      cursor:"pointer"
                    }}
                  />
                </div>
                <div
                  onClick={() =>
                    window.open("https://www.facebook.com/xclusivediamonds")
                  }
                >
                  <FacebookFilled
                    style={{
                      fontSize: 30,
                       cursor:"pointer"
                    }}
                  />
                </div>
              </div>
            </div>
          </Col>
          <Col
            xs={12}
            md={10}
            lg={10}
            xl={5}
            xxl={5}
            className={styles.development}
          >
            <div className={styles.Quick_Links}>
              <p>
                <b>Quick Links</b>
              </p>
            </div>
            <div className={styles.Services_main}>
              <div className={styles.Services_head_one}>
                <div className={styles.Services_footer}>
                  <div onClick={() => navigate(routes.aboutUrl)}>About Us</div>
                </div>
                <div className={styles.Services_footer}>
                  <div onClick={() => navigate(routes.contactUrl)}>
                    Contact Us
                  </div>
                </div>
                <div className={styles.Services_footer}>
                  <div onClick={() => navigate(routes.privacyUrl)}>
                    Privacy Policy
                  </div>
                </div>
                <div className={styles.Services_footer}>
                  <div onClick={() => navigate(routes.settingUrl)}>
                    Terms and Conditions
                  </div>
                </div>
                <div className={styles.Services_footer}>
                  <div onClick={() => navigate(routes.refundUrl)}>
                    Refund and Exchanges Policy
                  </div>
                </div>
              </div>
            </div>
          </Col>
          <Col
            xs={13}
            md={10}
            lg={10}
            xl={5}
            xxl={5}
            className={styles.development}
          >
            <div className={styles.Quick_Links}>
              <p>
                <b>Other Details</b>
              </p>
            </div>
            <div className={styles.Services_main}>
              <div className={styles.Services_head_one}>
                <>
                  <div className={styles.Services_footer}>
                    <div
                      onClick={() =>
                        navigate(
                          userToken ? routes.addressUrl : routes.loginUrl
                        )
                      }
                    >
                      My Address
                    </div>
                  </div>
                  <div className={styles.Services_footer}>
                    <div
                      onClick={() =>
                        navigate(
                          userToken ? routes.addressUrl : routes.loginUrl
                        )
                      }
                    >
                      Shopping Cart
                    </div>
                  </div>
                  <div className={styles.Services_footer}>
                    <div
                      onClick={() =>
                        navigate(
                          userToken ? routes.addressUrl : routes.loginUrl
                        )
                      }
                    >
                      Wishlist
                    </div>
                  </div>
                  <div className={styles.Services_footer}>
                    <div onClick={() => navigate(routes.faqUrl)}>FAQ’s</div>
                  </div>
                </>
              </div>
            </div>
          </Col>
          <Col xs={22} md={10} lg={10} xl={6} xxl={6} className={styles.news}>
            <div>
              <div className={styles.newsLatter}>
                <p>
                  <b>Newsletter</b>
                </p>
              </div>
              <div>
                <p className={styles.newsParagraph}>
                  Get updates by subscribe our weekly <br /> newsletter
                </p>
              </div>
              <div className={styles.emailType}>
                <input
                  type="email"
                  placeholder="Enter Your email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)} // Update state on input change
                />
                <div className={styles.backtop_main}>
                  <Button
                    type="primary"
                    icon={<LoginOutlined />}
                    onClick={handleSubscribe}
                  >
                    Subscribe
                  </Button>
                </div>
              </div>
              {/* Error message */}
              {error && <p style={{ color: "red" }}>{error}</p>}
              {/* Success message */}
              {successMessage && (
                <p style={{ color: "green" }}>{successMessage}</p>
              )}
            </div>
          </Col>
        </Row>
        <div className={styles.Footer_last_line}>
          <div className={styles.footerLast}>
            <div>
              <div>
                <p className={styles.copyright_main}>
                  Copyright © {date} Xclusive Diamonds . All Rights Reserved
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Footer;
