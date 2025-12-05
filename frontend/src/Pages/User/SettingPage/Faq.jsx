/* eslint-disable react-hooks/exhaustive-deps */
import React from "react";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getSettingApi } from "../../../Features/Setting/Setting";
import { Col, Row } from "antd";

function Faq() {
  const dispatch = useDispatch();
  const setting = useSelector((state) => state.setting?.settingData);

  useEffect(() => {
    dispatch(getSettingApi());
    window.scrollTo(0, 0);
  }, []);

  return (
    <div>
      <Row justify="center">
        <Col xs={22} md={22} lg={22} xl={22} xxl={22}>
          <div style={{ textAlign: "start", marginBottom: "80px" }}>
            <h1 style={{ textAlign: "center", marginBottom: "50px" }}>FAQ’s</h1>
            <p dangerouslySetInnerHTML={{ __html: setting?.app_faq }} />
          </div>
        </Col>
      </Row>
    </div>
  );
}

export default Faq;
