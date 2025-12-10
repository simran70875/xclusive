import { useRef, useState } from "react";
import axios from "axios";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import Select from "react-select";
import { useSelector } from "react-redux";
import AlertBox from "../../../../Components/AlertComp/AlertBox";

let url = process.env.REACT_APP_API_URL;

const EditProduct = () => {
  const adminToken = localStorage.getItem("token");
  const Navigate = useNavigate();
  const selectedProductData = useSelector(
    (state) => state?.ProductDataChange?.payload
  );

  const [productData, setProductData] = useState({});
  const [productName, setProductName] = useState("");
  const [SKUCode, setSKUCode] = useState("");
  const [productImage, setProductImage] = useState();
  const [categoryOptions, setCategoryOptions] = useState([]);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [data, setData] = useState([]);
  const [selectedBrand, setSelectedBrand] = useState("");
  const [selectedCollection, setSelectedCollection] = useState("");
  const [originalPrice, setOriginalPrice] = useState(0);
  const [discountPrice, setDiscountPrice] = useState(0);
  const [maxDisPrice, setMaxDiscPrice] = useState(0);
  const [description, setDescription] = useState("");
  const [productAddStatus, setProductAddStatus] = useState();
  const [statusMessage, setStatusMessage] = useState("");
  const [previewImages, setPreviewImages] = useState([]);

  useEffect(() => {
    async function getProduct() {
      try {
        const res = await axios.get(
          `${url}/product/get/${selectedProductData?._id}`,
          {
            headers: {
              Authorization: `${adminToken}`,
            },
          }
        );
        setProductData(res?.data?.products || {});
      } catch (error) {
        console.log(error);
      }
    }
    getProduct();
  }, [selectedProductData]);

  useEffect(() => {
    setProductName(productData?.Product_Name);
    setSKUCode(productData?.SKU_Code);
    setOriginalPrice(productData?.Product_Ori_Price || 0);
    setDiscountPrice(productData?.Product_Dis_Price || 0);
    setMaxDiscPrice(productData?.Max_Dis_Price || 0);
    setDescription(productData?.Description || "");

    if (Array.isArray(productData?.Category)) {
      const selectedCategoriesIds = productData.Category.map((category) => ({
        value: category?._id,
        label: category?.Category_Name,
      }));
      setSelectedCategories(selectedCategoriesIds);
    }

    setSelectedBrand({
      dataId: productData?.Brand_Name?._id,
      label: productData?.Brand?.Brand_Name,
    });

    setSelectedCollection({
      dataId: productData?.Collections?._id,
      label: productData?.Collections?.Collections,
    });

    setPreviewImages(productData?.Product_Images || []);
  }, [productData]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append("Product_Name", productName);
    formData.append("SKU_Code", SKUCode);

    // 🔥 send NEW images (if any)
    if (productImage?.length > 0) {
      productImage.forEach((img) => {
        formData.append("images", img);
      });
    }

    // 🔥 send remaining OLD images as JSON
    formData.append("existingImages", JSON.stringify(previewImages));

    formData.append(
      "Category",
      selectedCategories.map((c) => c.value).join(",")
    );

    if (selectedBrand?.dataId) {
      formData.append("Brand_Name", selectedBrand?.dataId);
    }
    if (selectedCollection?.dataId) {
      formData.append("Collection_Name", selectedCollection?.dataId);
    }

    formData.append("Product_Dis_Price", discountPrice);
    formData.append("Product_Ori_Price", originalPrice);
    formData.append("Max_Dis_Price", maxDisPrice);
    formData.append("Description", description);

    try {
      const response = await axios.patch(
        `${url}/product/update/${selectedProductData?._id}`,
        formData,
        { headers: { Authorization: adminToken } }
      );

      if (response.data.type === "success") {
        setProductAddStatus("success");
        setStatusMessage("Product updated successfully");
        setTimeout(() => Navigate("/showProduct"), 900);
      }
    } catch (err) {
      setProductAddStatus("error");
      setStatusMessage("Product not updated!");
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

  // get all category
  useEffect(() => {
    async function fetchCategoryData() {
      try {
        const categoryResponse = await axios.get(`${url}/category/get`, {
          headers: {
            Authorization: `${adminToken}`,
          },
        });
        const options = categoryResponse?.data?.category_data?.map(
          (option) => ({
            value: option._id,
            label:
              option.Category_Name.charAt(0).toUpperCase() +
              option.Category_Name.slice(1),
          })
        );
        setCategoryOptions(options);
      } catch (error) {
        console.error("Failed to fetch categories:", error);
      }
    }

    fetchCategoryData();
  }, []);

  // get all brand ,collections
  useEffect(() => {
    async function fetchData() {
      try {
        const Response = await axios.get(`${url}/data/get`, {
          headers: {
            Authorization: `${adminToken}`,
          },
        });
        setData(Response?.data?.dataType);
      } catch (error) {
        console.error("Failed to fetch categories:", error);
      }
    }

    fetchData();
  }, []);

  // Filter data for each data type
  const brandData = data?.filter((option) => option?.Data_Type === "Brand");
  const collectionsData = data?.filter(
    (option) => option?.Data_Type === "Collection"
  );

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

  //   Quill.register(quillTable.TableCell);
  //   Quill.register(quillTable.TableRow);
  //   Quill.register(quillTable.Table);
  //   Quill.register(quillTable.Contain);
  //   Quill.register("modules/table", quillTable.TableModule);

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

  const removeOldImage = (index) => {
    const updated = [...previewImages];
    updated.splice(index, 1);
    setPreviewImages(updated);
  };

  return (
    <>
      <div className="main-content dark">
        <div className="page-content">
          <div className="container-fluid">
            <div className="row">
              <div className="col-12">
                <div className="page-title-box d-flex align-items-center justify-content-between">
                  <h4 className="mb-0">Edit Product</h4>
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
                            required
                            value={selectedCategories} // Change this to selectedCategories
                            onChange={(selectedOptions) => {
                              setSelectedCategories(selectedOptions); // Change this to setSelectedCategories
                            }}
                            options={categoryOptions}
                            styles={customStyles}
                            isMulti // Enable multi-select
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
                            required
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
                            required
                            value={selectedCollection}
                            onChange={(e) => setSelectedCollection(e)}
                            options={collectionOptions}
                            styles={customStyles}
                          />
                        </div>
                      </div>

                      <div className="mb-3 row">
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
                      </div>

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
                        <label className="col-md-2 col-form-label">
                          Product Images:
                          <div className="imageSize">
                            (W-971 X H-1500, W-1295 X H-2000, W-1618 X H-2500)
                          </div>
                        </label>

                        <div className="col-md-10">
                          {/* --- Upload New Images --- */}
                          <input
                            className="form-control"
                            type="file"
                            multiple
                            onChange={(e) => {
                              setProductImage(Array.from(e.target.files));
                            }}
                          />

                          {/* --- Preview Existing Images --- */}
                          <div className="fileupload_img col-md-10 mt-3 d-flex gap-2 flex-wrap">
                            {previewImages?.map((image, index) => (
                              <div key={index} style={{ position: "relative" }}>
                                <img
                                  src={`${process.env.REACT_APP_API_URL}/${image.path}`}
                                  alt="product"
                                  height={100}
                                  width={100}
                                  style={{ borderRadius: 6 }}
                                />

                                {/* Remove old image */}
                                <button
                                  type="button"
                                  onClick={() => removeOldImage(index)}
                                  style={{
                                    position: "absolute",
                                    top: -8,
                                    right: -8,
                                    background: "red",
                                    border: "none",
                                    color: "white",
                                    borderRadius: "50%",
                                    width: 22,
                                    height: 22,
                                    cursor: "pointer",
                                  }}
                                >
                                  ×
                                </button>
                              </div>
                            ))}

                            {/* --- Preview Newly Added Images --- */}
                            {productImage?.map((file, index) => (
                              <img
                                key={index}
                                src={URL.createObjectURL(file)}
                                height={100}
                                width={100}
                                style={{ borderRadius: 6 }}
                                alt="new"
                              />
                            ))}
                          </div>
                        </div>
                      </div>

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
                        </div>
                      </div>
                    </form>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <AlertBox status={productAddStatus} statusMessage={statusMessage} />
      </div>
    </>
  );
};

export default EditProduct;
