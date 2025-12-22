import { useState } from "react";
import defualtImage from "../../../../resources/assets/images/add-image.png";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import AlertBox from "../../../../Components/AlertComp/AlertBox";
let url = process.env.REACT_APP_API_URL;

const AddPopBanner = () => {
  const Navigate = useNavigate();
  const [bannerName, setBannerName] = useState("");
  const [bannerImage, setBannerImage] = useState("");
  const [categoryData, setCategoryData] = useState([]);
  const [statusMessage, setStatusMessage] = useState("");
  const [bannerAddStatus, setBannerAddStatus] = useState();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (bannerName !== "" && bannerImage !== "") {
      const formData = new FormData();
      formData.append("Banner_Name", bannerName);
      formData.append("image", bannerImage);

      try {
        const adminToken = localStorage.getItem("token");

        let response = await axios.post(`${url}/popup/banner/add`, formData, {
          headers: {
            Authorization: `${adminToken}`,
          },
        });
        console.log("response add banner==>", response  )
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
        setStatusMessage("Banner not Add !");
      }
    }
  };

  return (
    <>
      <div className="main-content dark">
        <div className="page-content">
          <div className="container-fluid">
            <div className="row">
              <div className="col-12">
                <div className="page-title-box d-flex align-items-center justify-content-between">
                  <h4 className="mb-0">Add Banner</h4>
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
                            (Recommended Resolution: W-856 x H-400)
                          </div>
                        </label>
                        <div className="col-md-10">
                          <input
                            required
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
                                  : defualtImage
                              }
                              alt="banner image"
                              height={100}
                              width={100}
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
                              {" "}
                              <i className="fas fa-window-close"></i> Cancel{" "}
                            </a>
                            <button className="btn btn-success" type="submit">
                              {" "}
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

export default AddPopBanner;
