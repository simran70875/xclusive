import axios from "axios";
import Modal from "react-modal";
import Select from "react-select";
import ReactQuill from "react-quill";
import { useNavigate } from "react-router-dom";
import { useEffect, useRef, useState } from "react";

import defualtImage from "../../../../resources/assets/images/add-image.png";
import AddVariation from "../Variation/AddVariation";
import AlertBox from "../../../../Components/AlertComp/AlertBox";

let url = process.env.REACT_APP_API_URL;

const AddProductDemo = () => {
  const adminToken = localStorage.getItem("token");
  const Navigate = useNavigate();

  // product
  const [productName, setProductName] = useState("");
  const [SKUCode, setSKUCode] = useState("");

  const [productImages, setProductImages] = useState([]);

  useEffect(() => {
    console.log("productImages ==>", productImages);
  }, [productImages]);

  const [selectedCategories, setSelectedCategories] = useState([]);
  const [categoryOptions, setCategoryOptions] = useState([]);
  const [data, setData] = useState([]);
  const [selectedBrand, setSelectedBrand] = useState("");
  const [selectedCollection, setSelectedCollection] = useState("");
  const [description, setDescription] = useState("");
  const [productAddStatus, setProductAddStatus] = useState();
  const [statusMessage, setStatusMessage] = useState("");

  // variation
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [variations, setVariations] = useState([]);

  useEffect(() => {
    Modal.setAppElement(document.body); // Set the appElement to document.body
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (productName !== "" && productImages !== "") {
      if (variations.length <= 0) {
        setProductAddStatus("warning");
        setStatusMessage("Please Add atleast one variations");
      } else {
        const formData = new FormData();
        formData.append("Product_Name", productName);
        formData.append("SKU_Code", SKUCode);

        // 🔥 FIX: append images one-by-one
        productImages.forEach((img) => {
          formData.append("images", img);
        });

        console.log("selectedCategories ==>", selectedCategories);
        formData.append("Category", selectedCategories.value);

        if (selectedBrand?.dataId) {
          formData.append("Brand_Name", selectedBrand?.dataId);
        }

        formData.append("Collection_Name", selectedCollection?.dataId);

        formData.append("Description", description);

        try {
          let response = await axios.post(`${url}/product/add`, formData, {
            headers: {
              Authorization: `${adminToken}`,
            },
          });

          if (response.data.type === "success") {
            setProductAddStatus(response.data.type);
            let alertBox = document.getElementById("alert-box");
            alertBox.classList.add("alert-wrapper");
            setStatusMessage(response.data.message);

            //  for create variations
            const productId = response?.data?.productId;

            try {
              for (const variation of variations) {
                const variationFormData = new FormData();
                variationFormData.append("Variation_Name", variation?.name);

                variation?.sizes?.forEach((size) => {
                  variationFormData.append("Size_Name", size?.size);
                  variationFormData.append("Size_Stock", size?.stock);
                  variationFormData.append("Size_Price", size?.price);
                  variationFormData.append("Size_Purity", size?.purity);
                });

                variation?.images?.forEach((image) => {
                  variationFormData.append("images", image);
                });

                const response = await axios.post(
                  `${url}/product/variation/add/${productId}`,
                  variationFormData,
                  {
                    headers: {
                      Authorization: `${adminToken}`,
                    },
                  }
                );
                console.log("Variation added successfully", response);
                setVariations("");
              }
            } catch (error) {
              console.log(error);
            }

            setTimeout(() => {
              Navigate("/showProduct");
            }, 900);
          } else {
            setProductAddStatus(response.data.type);
            let alertBox = document.getElementById("alert-box");
            alertBox.classList.add("alert-wrapper");
            setStatusMessage(response.data.message);
          }
        } catch (error) {
          setProductAddStatus("error");
          let alertBox = document.getElementById("alert-box");
          alertBox.classList.add("alert-wrapper");
          setStatusMessage("Product not Add !");
        }
      }
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      setProductAddStatus("");
      setStatusMessage("");
      let alertBox = document?.getElementById("alert-box");
      alertBox?.classList?.remove("alert-wrapper");
    }, 1500);

    return () => clearTimeout(timer);
  }, [productAddStatus, statusMessage]);

  useEffect(() => {
    // Fetch category data from your API
    async function fetchCategoryData() {
      try {
        const response = await axios.get(`${url}/category/get`, {
          headers: {
            Authorization: `${adminToken}`,
          },
        });

        const options = response?.data?.category?.map((option) => ({
          value: option._id,
          label:
            option.Category_Name.charAt(0).toUpperCase() +
            option.Category_Name.slice(1),
        }));

        setCategoryOptions(options);
      } catch (error) {
        console.error("Failed to fetch categories:", error);
      }
    }
    fetchCategoryData();
  }, []);

  const handleCategoryChange = (selectedOptions) => {
    setSelectedCategories(selectedOptions);
  };

  // get all brand , collections
  useEffect(() => {
    async function fetchData() {
      try {
        const Response = await axios.get(`${url}/data/get`, {
          headers: {
            Authorization: `${adminToken}`,
          },
        });
        console.log("Response Data ==>", Response?.data);
        setData(Response?.data?.data);
      } catch (error) {
        console.error("Failed to fetch categories:", error);
      }
    }
    fetchData();
  }, []);

  const handleOpenModal = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleDeleteVariation = (index) => {
    const updatedVariations = [...variations];
    updatedVariations.splice(index, 1);
    setVariations(updatedVariations);
  };

  // Filter data for each data type
  const brandData = data?.filter((option) => option?.Data_Type === "Brand");
  const collectionsData = data?.filter(
    (option) => option?.Data_Type === "Collection"
  );

  console.log("collectionsData ==>", collectionsData);

  const brandOptions = brandData?.map((option) => {
    return {
      dataId: option?._id,
      label:
        option?.Data_Name?.charAt(0)?.toUpperCase() +
        option?.Data_Name?.slice(1),
    };
  });

  const collectionOptions = collectionsData?.map((option) => {
    return {
      dataId: option?._id,
      label:
        option?.Data_Name?.charAt(0)?.toUpperCase() +
        option?.Data_Name?.slice(1),
    };
  });

  // custom style for react quill
  const customStyles = {
    singleValue: (provided) => ({
      ...provided,
      color: "black",
    }),
    option: (provided, state) => ({
      ...provided,
      backgroundColor: state.isFocused ? "white" : "white",
      color: state.isSelected ? "black" : "black",
      ":hover": {
        backgroundColor: "#e6f7ff",
      },
    }),
  };

  //  for react quill (long desc)
  const editor = useRef();

  const handleTextChange = (value) => {
    setDescription(value);
  };

  const tableOptions = [];
  const maxRows = 8;
  const maxCols = 5;
  for (let r = 1; r <= maxRows; r++) {
    for (let c = 1; c <= maxCols; c++) {
      tableOptions.push("newtable_" + r + "_" + c);
    }
  }

  const editorModules = {
    toolbar: [
      [
        { header: "1" },
        { header: "2" },
        { header: [3, 4, 5, 6] },
        { font: [] },
      ],
      [{ size: [] }],
      ["bold", "italic", "underline", "strike", "blockquote"],
      [{ list: "ordered" }, { list: "bullet" }],
      ["link", "video", "image"],
      ["clean"],
      ["code-block"],
      [{ color: [] }, { background: [] }],
      [{ font: [] }],
      [{ align: [] }],
      [{ script: "sub" }, { script: "super" }],
      [{ indent: "-1" }, { indent: "+1" }],
      [{ direction: "rtl" }, { table: tableOptions }],
    ],
  };

  return (
    <>
      <div className="main-content dark">
        <div className="page-content">
          <div className="container-fluid">
            <div className="row">
              <div className="col-12">
                <div className="page-title-box d-flex align-items-center justify-content-between">
                  <h4 className="mb-0">Add Product</h4>
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
                          Product Name:
                        </label>
                        <div className="col-md-10">
                          <input
                            required
                            className="form-control"
                            type="text"
                            id="example-text-input"
                            value={productName}
                            onChange={(e) => {
                              setProductName(e.target.value);
                            }}
                          />
                        </div>
                      </div>

                      <div className="mb-3 row">
                        <label
                          htmlFor="example-text-input"
                          className="col-md-2 col-form-label"
                        >
                          SKU Code:
                        </label>
                        <div className="col-md-10">
                          <input
                            required
                            className="form-control"
                            type="text"
                            id="example-text-input"
                            value={SKUCode}
                            onChange={(e) => {
                              setSKUCode(e.target.value);
                            }}
                          />
                        </div>
                      </div>

                      <div className="mb-3 row">
                        <label
                          htmlFor="example-text-input"
                          className="col-md-2 col-form-label"
                        >
                          Category Name:
                        </label>
                        <div className="col-md-10">
                          <Select
                            name="categories"
                            value={selectedCategories}
                            onChange={handleCategoryChange}
                            options={categoryOptions}
                            placeholder="Select Categories"
                            className="w-full md:w-20rem"
                          />
                        </div>
                      </div>

                      <div className="mb-3 row">
                        <label
                          htmlFor="example-text-input"
                          className="col-md-2 col-form-label"
                        >
                          Brand Name:
                        </label>
                        <div className="col-md-10">
                          <Select
                            name="brands"
                            value={selectedBrand}
                            onChange={(e) => setSelectedBrand(e)}
                            options={brandOptions}
                            styles={customStyles}
                          />
                        </div>
                      </div>

                      <div className="mb-3 row">
                        <label
                          htmlFor="example-text-input"
                          className="col-md-2 col-form-label"
                        >
                          Collection :
                        </label>
                        <div className="col-md-10">
                          <Select
                            name="collections"
                            value={selectedCollection}
                            onChange={(e) => setSelectedCollection(e)}
                            options={collectionOptions}
                            styles={customStyles}
                          />
                        </div>
                      </div>

                      {/* <div className="mb-3 row">
                        <label
                          htmlFor="example-text-input"
                          className="col-md-2 col-form-label"
                        >
                          Original Price:
                        </label>
                        <div className="col-md-10">
                          <input
                            min="0"
                            required
                            className="form-control"
                            type="number"
                            id="example-number-input"
                            value={originalPrice}
                            onChange={(e) => {
                              setOriginalPrice(e.target.value);
                            }}
                          />
                        </div>
                      </div>

                      <div className="mb-3 row">
                        <label
                          htmlFor="example-text-input"
                          className="col-md-2 col-form-label"
                        >
                          Discount Price:
                        </label>
                        <div className="col-md-10">
                          <input
                            min="0"
                            required
                            className="form-control"
                            type="number"
                            id="example-number-input"
                            value={discountPrice}
                            onChange={(e) => {
                              setDiscountPrice(e.target.value);
                            }}
                          />
                        </div>
                      </div>

                      <div className="mb-3 row">
                        <label
                          htmlFor="example-text-input"
                          className="col-md-2 col-form-label"
                        >
                          Max Selling Price (MSP):
                        </label>
                        <div className="col-md-10">
                          <input
                            min="0"
                            required
                            className="form-control"
                            type="number"
                            id="example-number-input"
                            value={maxDisPrice}
                            onChange={(e) => {
                              setMaxDiscPrice(e.target.value);
                            }}
                          />
                        </div>
                      </div> */}

                      <div className="mb-3 row">
                        <label
                          htmlFor="example-text-input"
                          className="col-md-2 col-form-label"
                        >
                          Long Description:
                        </label>
                        <div className="col-md-10">
                          <ReactQuill
                            ref={editor}
                            value={description}
                            onChange={handleTextChange}
                            modules={editorModules}
                            className="custom-quill-editor"
                          />
                        </div>
                      </div>

                      <div className="mb-3 row">
                        <label
                          htmlFor="example-text-input"
                          className="col-md-2 col-form-label"
                        >
                          Product Images:
                          <div className="imageSize">
                            (Recommended Resolution: W-971 X H-1500, W-1295 X
                            H-2000, W-1618 X H-2500)
                          </div>
                        </label>
                        <div className="col-md-10">
                          <input
                            required
                            className="form-control"
                            type="file"
                            multiple
                            onChange={(e) => {
                              setProductImages([...e.target.files]);
                            }}
                            id="example-text-input"
                          />
                          <div
                            className="fileupload_img col-md-10 mt-3"
                            style={{ display: "flex", gap: "10px" }}
                          >
                            {productImages.length > 0 ? (
                              productImages.map((img, i) => (
                                <img
                                  key={i}
                                  src={URL.createObjectURL(img)}
                                  alt="product"
                                  height={100}
                                  style={{ objectFit: "cover", width: "auto" }}
                                />
                              ))
                            ) : (
                              <img
                                src={defualtImage}
                                height={100}
                                width={100}
                                alt="default"
                              />
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="mb-3 mt-3 row">
                        <label
                          htmlFor="example-text-input"
                          className="col-md-2 col-form-label"
                        >
                          Add Variation:
                        </label>
                        <div className="col-md-10">
                          <div className="d-flex flex-reverse flex-wrap gap-2">
                            <a
                              className="btn btn-primary"
                              onClick={handleOpenModal}
                            >
                              <i className="fas fa-plus-circle"></i> Add{" "}
                            </a>
                          </div>
                        </div>
                      </div>

                      {!variations.length <= 0 && (
                        <div className="mb-3 row">
                          <label
                            htmlFor="example-text-input"
                            className="col-md-2 col-form-label"
                          >
                            Variation :
                          </label>
                          <table>
                            <tr>
                              <th>No.</th>
                              <th>Name</th>
                              <th>Size</th>
                              <th>Stock</th>
                              <th>Action</th>
                            </tr>
                            {variations?.map((variation, index) => {
                              const defaultSize = variation?.sizes?.[0]?.size; // Get the first size as the default value

                              return (
                                <>
                                  <tr key={index}>
                                    <td>{index + 1}</td>
                                    <td>{variation?.name}</td>
                                    <td>
                                      <select
                                        style={{ width: "50px" }}
                                        value={
                                          variation?.selectedSize || defaultSize
                                        }
                                        onChange={(e) => {
                                          const selectedSize = e.target.value;
                                          const updatedVariations =
                                            variations.map((v, i) => {
                                              if (i === index) {
                                                return {
                                                  ...v,
                                                  selectedSize: selectedSize,
                                                };
                                              }
                                              return v;
                                            });
                                          setVariations(updatedVariations);
                                        }}
                                      >
                                        {variation?.sizes?.map(
                                          (vari, sizeIndex) => {
                                            return (
                                              <option
                                                key={sizeIndex}
                                                value={vari?.size}
                                              >
                                                {vari?.size}
                                              </option>
                                            );
                                          }
                                        )}
                                      </select>
                                    </td>
                                    <td>
                                      {variation?.sizes?.map((vari) => {
                                        if (
                                          vari?.size ===
                                          (variation?.selectedSize ||
                                            defaultSize)
                                        ) {
                                          return vari?.stock;
                                        }
                                        return null;
                                      })}
                                    </td>
                                    <td>
                                      <i
                                        class="fa fa-trash"
                                        onClick={() =>
                                          handleDeleteVariation(index)
                                        }
                                        aria-hidden="true"
                                        style={{
                                          color: "red",
                                          cursor: "pointer",
                                        }}
                                      ></i>
                                    </td>
                                  </tr>
                                </>
                              );
                            })}
                          </table>
                        </div>
                      )}

                      <div className="mb-3 row">
                        <div className="col-md-10 offset-md-2">
                          <div className="row mb-10">
                            <div className="col ms-auto">
                              <div className="d-flex flex-reverse flex-wrap gap-2">
                                <a
                                  className="btn btn-danger"
                                  onClick={() => Navigate("/showProduct")}
                                >
                                  {" "}
                                  <i className="fas fa-window-close"></i> Cancel{" "}
                                </a>
                                <button
                                  className="btn btn-success"
                                  type="submit"
                                >
                                  {" "}
                                  <i className="fas fa-save"></i> Save{" "}
                                </button>
                              </div>
                            </div>
                          </div>
                          <AlertBox
                            status={productAddStatus}
                            statusMessage={statusMessage}
                          />
                        </div>
                      </div>
                    </form>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <Modal
          className="main-content dark"
          isOpen={isModalOpen}
          onRequestClose={handleCloseModal}
        >
          <AddVariation
            variations={variations}
            setVariations={setVariations}
            handleCloseModal={handleCloseModal}
            addOnBtnClick={false}
          />
        </Modal>
      </div>
    </>
  );
};

export default AddProductDemo;
