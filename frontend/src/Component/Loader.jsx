import { useEffect, useState } from "react";
import { Spin, Button } from "antd";
import { LoadingOutlined } from "@ant-design/icons";
import "./Loader.css";

const AnimationPhase = {
  WHITE_LOGO: "white-logo",
  GOLD_FLASH: "gold-flash",
  GOLD_CONTENT: "gold-content",
};

const antIcon = (
  <LoadingOutlined style={{ fontSize: 34, color: "#d4af37" }} spin />
);

const LoadingScreen = ({ isAppLoading = true, onFinish }) => {
  const [phase, setPhase] = useState(AnimationPhase.WHITE_LOGO);
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    const t1 = setTimeout(() => setPhase(AnimationPhase.GOLD_FLASH), 1400);
    const t2 = setTimeout(() => setPhase(AnimationPhase.GOLD_CONTENT), 2200);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, []);

  useEffect(() => {
    if (!isAppLoading && phase === AnimationPhase.GOLD_CONTENT) {
      const t3 = setTimeout(() => setFadeOut(true), 1400);
      const t4 = setTimeout(() => onFinish?.(), 2100);

      return () => {
        clearTimeout(t3);
        clearTimeout(t4);
      };
    }
  }, [isAppLoading, phase, onFinish]);

  return (
    <div
      className={`loading-wrapper 
        ${phase !== AnimationPhase.WHITE_LOGO ? "gold-bg" : ""}
        ${fadeOut ? "fade-out" : ""}`}
    >
      {/* GRID BACKGROUND */}
      <div className="grid-bg" />

      {/* DIAMOND FALL BACKGROUND */}
      <div className="diamond-bg">
        {[...Array(18)].map((_, i) => (
          <span key={i} className="diamond" />
        ))}
      </div>

      {/* LOGO */}
      <div
        className={`logo-container ${
          phase === AnimationPhase.WHITE_LOGO ? "logo-center" : "logo-top"
        }`}
      >
        <img src="/logo.png" alt="Xclusive Diamond Jewellery" />
      </div>

      {/* GOLD FLASH */}
      {phase === AnimationPhase.GOLD_FLASH && <div className="gold-flash" />}

      {/* CONTENT */}
      {phase === AnimationPhase.GOLD_CONTENT && (
        <div className="content">
          <h1>
            XCLUSIVE <span>DIAMONDS</span>
          </h1>

          <p>
            Crafted to shine for a lifetime.
            <br />
            Discover timeless diamond elegance.
          </p>

          {/* <Spin indicator={antIcon} /> */}
          <img style={{
            height:100
          }} src="/loading.gif" alt="loading-diamondg gif" />

          {/* <Button size="large" className="cta-btn">
            Explore Collection
          </Button> */}

          <small>Luxury Jewellery • Certified Diamonds • Trusted Craft</small>
        </div>
      )}
    </div>
  );
};

export default LoadingScreen;
