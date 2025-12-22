import { ArrowUpOutlined } from "@ant-design/icons";

import styles from "./index.module.scss";

const ScrollToTop = ({ handleOnScrollTop, scrolled }) => {
  return (
    scrolled && (
      <div className={styles.scrollToTop} onClick={handleOnScrollTop}>
        <ArrowUpOutlined />
      </div>
    )
  );
};

export default ScrollToTop;
