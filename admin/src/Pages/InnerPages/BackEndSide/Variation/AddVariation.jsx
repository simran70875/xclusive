import { useEffect, useState } from "react";
import defualtImage from "../../../../resources/assets/images/add-image.png";
import axios from "axios";

const AddVariation = ({
  handleCloseModal,
  variations,
  setVariations,
  productId,
  addOnBtnClick,
}) => {
  const [colorName, setColorName] = useState("");

  const [variationImages, setVariationImages] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [metalPurity, setMetalPurity] = useState("");
  const [sizeInputs, setSizeInputs] = useState([
    { index: 1, size: "", stock: 0, price: 0 },
  ]);

  let url = process.env.REACT_APP_API_URL;
  const adminToken = localStorage.getItem("token");

  const handleFileSelect = (event) => {
    const files = Array.from(event.target.files);
    setVariationImages((prevVariationImages) =>
      prevVariationImages.concat(files)
    );
    setImagePreviews(files.map((file) => URL.createObjectURL(file)));
  };

  const handleAddSizeInput = () => {
    const newSizeInput = {
      index: sizeInputs.length + 1,
      size: "",
      stock: 0,
      price: 0,
    };
    setSizeInputs([...sizeInputs, newSizeInput]);
  };

  const handleRemoveSizeInput = (index) => {
    const updatedSizeInputs = sizeInputs.filter(
      (sizeInput) => sizeInput.index !== index
    );
    setSizeInputs(
      updatedSizeInputs.map((sizeInput, i) => ({ ...sizeInput, index: i + 1 }))
    );
  };

  const handleAddVariation = (e) => {
    e.preventDefault();

    const newVariation = {
      name: colorName,
      images: variationImages,
      label: colorName,
      sizes: sizeInputs,
    };

    setVariations([...variations, newVariation]);

    setColorName("");
    setVariationImages([]);
    setSizeInputs([{ index: 1, size: "", stock: 0, price: 0 }]);
    setImagePreviews([]);

    handleCloseModal();
  };

  useEffect(() => {
    console.log(variationImages, colorName, metalPurity, sizeInputs);
  }, [colorName, variationImages, metalPurity, sizeInputs]);

  const handleAddVariationDirect = async (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append("Variation_Name", colorName);

    sizeInputs?.forEach((size) => {
      formData.append("Size_Name", size?.size);
      formData.append("Size_Stock", size?.stock);
      formData.append("Size_Price", size?.price);
    });

    variationImages?.forEach((image) => {
      formData.append("images", image);
    });

    try {
      const response = await axios.post(
        `${url}/product/variation/add/${productId}`,
        formData,
        {
          headers: {
            Authorization: `${adminToken}`,
          },
        }
      );
      if (response.data.type === "success") {
        setVariations([...variations, response.data.variation]);
        setColorName("");
        setVariationImages([]);
        setSizeInputs([{ index: 1, size: "", stock: 0, price: 0 }]);
        handleCloseModal();
      } else {
        console.error("Failed to add variation:", response.data.message);
      }
    } catch (error) {
      console.error("Failed to add variation:", error);
    }
  };

  return (
    <div className="main-content-model dark">
      <div className="page-content">
        <div className="container-fluid">
          <div className="row">
            <div className="col-12">
              <div className="card model-card">
                <div className="card-body">
                  <div className="page-title-box d-flex align-items-center justify-content-between">
                    <h4 className="mb-0">Add Variation</h4>
                    <i
                      className="fas fa-window-close"
                      style={{ cursor: "pointer", color: "red" }}
                      onClick={handleCloseModal}
                    ></i>
                  </div>
                  <form
                    onSubmit={
                      addOnBtnClick
                        ? handleAddVariationDirect
                        : handleAddVariation
                    }
                  >
                    <div className="mb-3 row">
                      <label
                        htmlFor="example-text-input"
                        className="col-md-2 col-form-label"
                      >
                        Color Name:
                      </label>
                      <div className="col-md-10">
                        <input
                          required
                          className="form-control"
                          type="text"
                          id="example-text-input"
                          value={colorName}
                          onChange={(e) => {
                            setColorName(e.target.value);
                          }}
                        />
                      </div>
                    </div>
                    <div className="mb-3 row">
                      <label
                        htmlFor="example-text-input"
                        className="col-md-2 col-form-label"
                      >
                        Color Images:
                      </label>
                      <div className="col-md-10">
                        <div className="fileupload_block">
                          <input
                            type="file"
                            max={5}
                            name="banner_image"
                            className="form-control"
                            multiple
                            onChange={handleFileSelect}
                            id="example-text-input"
                            required
                          />
                        </div>
                        <div className="imageSize">
                          (Recommended Resolution: W-971 X H-1500, W-1295 X
                          H-2000, W-1618 X H-2500 )
                        </div>
                        <div className="fileupload_img col-md-10 mt-3">
                          {imagePreviews.length <= 0 && (
                            <img
                              type="image"
                              src={defualtImage}
                              alt="product image"
                              height={100}
                              width={100}
                            />
                          )}
                          {imagePreviews?.map((preview, index) => (
                            <img
                              key={index}
                              src={preview}
                              alt="Preview"
                              style={{ marginTop: "15px", marginLeft: "15px" }}
                              height={100}
                              width={100}
                            />
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="mb-3 row">
                      <label
                        htmlFor="example-text-input"
                        className="col-md-2 col-form-label"
                      >
                        Metal Purity:
                      </label>
                      <div className="col-md-10">
                        <input
                          required
                          className="form-control"
                          type="text"
                          id="example-text-input"
                          value={metalPurity}
                          onChange={(e) => {
                            setMetalPurity(e.target.value);
                          }}
                        />
                      </div>
                    </div>

                    {sizeInputs.map((sizeInput, index) => (
                      <div className="mb-3 row" key={sizeInput.index}>
                        <div className="col-md-3">
                          <label
                            htmlFor="example-text-input"
                            className="col-form-label"
                          >
                            Size {sizeInput.index}:
                          </label>
                          <input
                            required
                            className="form-control"
                            type="text"
                            id="subcategory-control"
                            value={sizeInput.size}
                            onChange={(e) => {
                              const updatedSizeInputs = [...sizeInputs];
                              updatedSizeInputs[index].size = e.target.value;
                              setSizeInputs(updatedSizeInputs);
                            }}
                          />
                        </div>
                        <div className="col-md-3">
                          <label
                            htmlFor="example-text-input"
                            className="col-form-label"
                          >
                            Stock:
                          </label>
                          <input
                            min="0"
                            required
                            className="form-control"
                            type="number"
                            id="example-number-input"
                            value={sizeInput.stock}
                            onChange={(e) => {
                              const updatedSizeInputs = [...sizeInputs];
                              updatedSizeInputs[index].stock = e.target.value;
                              setSizeInputs(updatedSizeInputs);
                            }}
                          />
                        </div>
                        <div className="col-md-3">
                          <label
                            htmlFor="example-text-input"
                            className="col-form-label"
                          >
                            Price:
                          </label>
                          <input
                            min="0"
                            required
                            className="form-control"
                            type="number"
                            id="example-number-input"
                            value={sizeInput.price}
                            onChange={(e) => {
                              const updatedSizeInputs = [...sizeInputs];
                              updatedSizeInputs[index].price = e.target.value;
                              setSizeInputs(updatedSizeInputs);
                            }}
                          />
                        </div>
                        {sizeInputs.length > 1 && (
                          <div className="col-md-2">
                            <i
                              className="fa fa-times mt-1"
                              style={{
                                fontSize: "34px",
                                cursor: "pointer",
                                color: "red",
                              }}
                              onClick={() =>
                                handleRemoveSizeInput(sizeInput.index)
                              }
                            ></i>
                          </div>
                        )}
                        {index === sizeInputs.length - 1 && (
                          <>
                            <div className="col-md-1">
                              <i
                                className="fa fa-plus mt-1"
                                style={{
                                  fontSize: "32px",
                                  cursor: "pointer",
                                  color: "#672e93",
                                }}
                                onClick={handleAddSizeInput}
                              ></i>
                            </div>
                          </>
                        )}
                      </div>
                    ))}

                    <div className="d-flex flex-reverse flex-wrap gap-2">
                      <a className="btn btn-danger" onClick={handleCloseModal}>
                        <i className="fas fa-window-close"></i> Cancel{" "}
                      </a>
                      <button className="btn btn-success" type="submit">
                        <i className="fas fa-save"></i> Save{" "}
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
  );
};

export default AddVariation;
