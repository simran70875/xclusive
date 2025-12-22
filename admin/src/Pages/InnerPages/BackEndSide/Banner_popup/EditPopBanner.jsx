import { useState, useEffect } from "react";
import AlertBox from "../../../../Components/AlertComp/AlertBox";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";

let url = process.env.REACT_APP_API_URL;

const EditPopBanner = () => {
  const Navigate = useNavigate();
  const selectedBannerData = useSelector(
    (state) => state?.BannerDataChange?.payload
  );

  const [bannerName, setBannerName] = useState(selectedBannerData?.Banner_Name);
  const [bannerImage, setBannerImage] = useState(null);
  const previewImage = url + "/" + selectedBannerData?.Banner_Image.path;
  const [statusMessage, setStatusMessage] = useState("");
  const [bannerAddStatus, setBannerAddStatus] = useState();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (bannerName !== "" && bannerImage !== "") {
      const formData = new FormData();
      formData.append("Banner_Name", bannerName);
      formData.append("image", bannerImage);
      for (const [key, value] of formData.entries()) {
        console.log(key, value);
      }

      try {
        const adminToken = localStorage.getItem("token");
        const bannerId = selectedBannerData?._id;
        let response = await axios.put(
          `${url}/popup/banner/update/${bannerId}`,
          formData,
          {
            headers: {
              Authorization: `${adminToken}`,
            },
          }
        );

        console.log("updated banner response ", response);
        if (response.data.type === "success") {
          setBannerAddStatus(response.data.type);
          let alertBox = document.getElementById("alert-box");
          alertBox.classList.add("alert-wrapper");
          setStatusMessage(response.data.message);
          setBannerName("");
          setBannerImage("");
          setTimeout(() => {
            Navigate("/showPopBanner");
          }, 900);
        } else {
          setBannerAddStatus(response.data.type);
          let alertBox = document.getElementById("alert-box");
          alertBox.classList.add("alert-wrapper");
          setStatusMessage(response.data.message);
        }
      } catch (error) {
        setBannerAddStatus("error");
        let alertBox = document.getElementById("alert-box");
        alertBox.classList.add("alert-wrapper");
        setStatusMessage("Banner not Update !");
      }
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      setBannerAddStatus("");
      setStatusMessage("");
      let alertBox = document?.getElementById("alert-box");
      alertBox?.classList?.remove("alert-wrapper");
    }, 1500);

    return () => clearTimeout(timer);
  }, [bannerAddStatus, statusMessage]);

  return (
    <>
      <div className="main-content dark">
        <div className="page-content">
          <div className="container-fluid">
            <div className="row">
              <div className="col-12">
                <div className="page-title-box d-flex align-items-center justify-content-between">
                  <h4 className="mb-0">Edit Banner</h4>
                </div>
              </div>
            </div>
            <div className="row">
              <div className="col-12">
                <div className="card">
                  <div className="card-body">
                    <form onSubmit={handleSubmit}>
                      <div className="mb-3 row">
                        <label
                          htmlFor="example-text-input"
                          className="col-md-2 col-form-label"
                        >
                          Banner Name:
                        </label>
                        <div className="col-md-10">
                          <input
                            required
                            className="form-control"
                            type="text"
                            id="example-text-input"
                            value={bannerName}
                            onChange={(e) => {
                              setBannerName(e.target.value);
                            }}
                          />
                        </div>
                      </div>

                      <div className="mb-3 row">
                        <label
                          htmlFor="example-text-input"
                          className="col-md-2 col-form-label"
                        >
                          Banner Image:
                          <div className="imageSize">
                            (Recommended Resolution: W-856 x H-400 )
                          </div>
                        </label>
                        <div className="col-md-10">
                          <input
                            className="form-control"
                            type="file"
                            onChange={(e) => {
                              setBannerImage(e.target.files[0]);
                            }}
                            id="example-text-input"
                          />
                          <div className="fileupload_img col-md-10 mt-3 mb-2">
                            <img
                              type="image"
                              src={
                                bannerImage
                                  ? URL.createObjectURL(bannerImage)
                                  : `${previewImage}`
                              }
                              alt="user image"
                              height={"auto"}
                              width={300}
                            />
                          </div>
                        </div>
                      </div>

                      <div className="row mb-10">
                        <div className="col ms-auto">
                          <div className="d-flex flex-reverse flex-wrap gap-2">
                            <a
                              className="btn btn-danger"
                              onClick={() => Navigate("/showPopBanner")}
                            >
                              <i className="fas fa-window-close"></i> Cancel{" "}
                            </a>
                            <button className="btn btn-success" type="submit">
                              <i className="fas fa-save"></i> Save{" "}
                            </button>
                          </div>
                        </div>
                      </div>
                    </form>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <AlertBox status={bannerAddStatus} statusMessage={statusMessage} />
      </div>
    </>
  );
};

export default EditPopBanner;
