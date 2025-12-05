import React from "react";
import { Image } from "antd";
import whatsapp from "../../Assets/PNG/whatsapp2.webp";
// import { UpOutlined } from "@ant-design/icons";

import styles from "./index.module.scss";

const ScrollToTop = ({ handleOnScrollTop, scrolled }) => {
  return (
    scrolled && (
      <div className={styles.scrollToTop} onClick={handleOnScrollTop}>
        {/* <UpOutlined /> */}
        <Image src={whatsapp} preview={false} />
      </div>
    )
  );
};

export default ScrollToTop;
