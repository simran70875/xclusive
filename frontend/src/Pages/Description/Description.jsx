import { Col, Row } from "antd";
import styles from "./index.module.scss";

function Description(descriptions) {
  const data = descriptions;

  return (
    <div>
      <Row justify="center">
        <Col xs={24} md={24} lg={24} xl={24} xxl={24} className={styles.desc}>
          <div />
          <p
            className={styles.desc1}
            dangerouslySetInnerHTML={{ __html: data?.descriptions }}
          />
        </Col>
        <div className={styles.line}></div>
      </Row>
    </div>
  );
}

export default Description;
