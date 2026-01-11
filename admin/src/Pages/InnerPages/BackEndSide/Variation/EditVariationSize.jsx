import { useState } from "react";
import axios from "axios";
let url = process.env.REACT_APP_API_URL;

const EditVariationSize = ({
  handleCloseModal,
  selectedSizeData,
  variationId,
  handleSizeUpdate,
}) => {
  const adminToken = localStorage.getItem("token");
  const [size, setSize] = useState(selectedSizeData?.Size_Name || "");
  const [stock, setStock] = useState(selectedSizeData?.Size_Stock || "");
  const [price, setPrice] = useState(selectedSizeData?.Size_Price || "");
  const [purity, setPurity] = useState(selectedSizeData?.Size_purity || "");

  const handleUpdateSize = async (e) => {
    e.preventDefault();

    try {
      // Send the updated size data to the server
      const response = await axios.patch(
        `${url}/product/variation/update/size/${variationId}/${selectedSizeData?._id}`,
        {
          Size_Name: size,
          Size_Stock: stock,
          Size_Price: price,
          Size_purity: purity,
        },
        {
          headers: {
            Authorization: `${adminToken}`,
          },
        }
      );

      if (response?.data?.type === "success") {
        handleSizeUpdate(selectedSizeData?._id, {
          Size_Name: size,
          Size_Stock: stock,
          Size_Price: price,
          Size_purity: purity,
        });
        handleCloseModal();
      } else {
        console.log("Error updating size:", response?.data?.message);
      }
    } catch (error) {
      console.log("Error updating size:", error);
    }
  };

  return (
    <>
      <div className="main-content-model dark">
        <div className="page-content">
          <div className="container-fluid">
            <div className="row">
              <div className="col-12">
                <div className="card model-card">
                  <div className="card-body">
                    <div className="page-title-box d-flex align-items-center justify-content-between">
                      <h4 className="mb-0">Edit Variation Size</h4>
                      <i
                        className="fas fa-window-close"
                        style={{ cursor: "pointer", color: "red" }}
                        onClick={handleCloseModal}
                      ></i>
                    </div>
                    <form onSubmit={handleUpdateSize}>
                      <div className="mb-3 row">
                        {/* <label
                          htmlFor="example-text-input"
                          className="col-md-2 col-form-label"
                        >
                          Size:
                        </label> */}
                        <div className="col-md-3">
                          <label
                            htmlFor="size"
                            className="col-form-label"
                          >
                            Size:
                          </label>
                          <input
                            required
                            className="form-control"
                            id="size"
                            value={size}
                            onChange={(e) => setSize(e.target.value)}
                          />
                        </div>
                        <div className="col-md-3">
                          <label
                            htmlFor="stock"
                            className="col-form-label"
                          >
                            Stock:
                          </label>
                          <input
                            min="0"
                            required
                            className="form-control"
                            type="number"
                            id="stock"
                            value={stock}
                            placeholder="Add Stock"
                            onChange={(e) => setStock(e.target.value)}
                          />
                        </div>
                        <div className="col-md-3">
                           <label
                            htmlFor="price"
                            className="col-form-label"
                          >
                            Price:
                          </label>
                          <input
                            min="0"
                            required
                            className="form-control"
                            type="number"
                            id="price"
                            value={price}
                            placeholder="Add Price"
                            onChange={(e) => setPrice(e.target.value)}
                          />
                        </div>
                        <div className="col-md-3">
                            <label
                            htmlFor="metal-purity"
                            className="col-form-label"
                          >
                            Metal PUrity:
                          </label>
                          <input
                            required
                            className="form-control"
                            type="text"
                            id="metal-purity"
                            value={purity}
                            placeholder="Add Metal Purity"
                            onChange={(e) => setPurity(e.target.value)}
                          />
                        </div>
                      </div>
                      <div className="col-md-2">
                        <button type="submit" className="btn btn-primary">
                          Update Size
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default EditVariationSize;
