import { Row, Col } from "antd";
import styles from "./MegaMenu.module.css";

export default function MegaMenu({ data }) {
  return (
    <div className={styles.megaMenu}>
      <Row gutter={[40, 20]}>
        {data.map((cat, index) => (
          <Col key={index} span={8}>
            <h4 className={styles.categoryTitle}>{cat.title}</h4>
            {cat.items.map((sub, idx) => (
              <p key={idx} className={styles.subItem}>{sub}</p>
            ))}
          </Col>
        ))}
      </Row>
    </div>
  );
}
