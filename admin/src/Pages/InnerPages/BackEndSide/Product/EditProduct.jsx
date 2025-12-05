import React, { useRef, useState } from "react";
import axios from "axios";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import ReactQuill, { Quill } from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import Select from "react-select";
import quillTable from 'quill-table';
import { useSelector } from "react-redux";
import AlertBox from "../../../../Components/AlertComp/AlertBox";

let url = process.env.REACT_APP_API_URL

const EditProduct = () => {

    const adminToken = localStorage.getItem('token');
    const Navigate = useNavigate()
    const selectedProductData = useSelector((state) => state?.ProductDataChange?.payload)
    const [productData, setProductData] = useState({})

    useEffect(() => {
        async function getProduct() {
            try {
                const res = await axios.get(`${url}/product/get/${selectedProductData?._id}`,
                    {
                        headers: {
                            Authorization: `${adminToken}`,
                        },
                    });
                setProductData(res?.data?.products || {});
            } catch (error) {
                console.log(error)
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
        setGoldPrice(productData?.Gold_Price || 0);
        setSilverPrice(productData?.Silver_Price || 0);
        setPpoPrice(productData?.PPO_Price || 0);
        setDescription(productData?.Description || "");

        // Make sure productData?.Category is an array before mapping
        if (Array.isArray(productData?.Category)) {
            const selectedCategoriesIds = productData?.Category?.map(category => ({
                value: category?._id,
                label: category?.Category_Name
            }));
            setSelectedCategories(selectedCategoriesIds);
        } else {
            setSelectedCategories([]);
        }

        setSelectedBrand({ dataId: productData?.Brand_Name?._id, label: productData?.Brand?.Brand_Name });
        setSelectedFabric({ dataId: productData?.Fabric_Type?._id, label: productData?.Fabric?.Fabric_Type });
        setSelectedOccasion({ dataId: productData?.Occasions?._id, label: productData?.Occasions?.Occasions });
        setPreviewImage(productData?.Product_Image)
    }, [productData])

    const [productName, setProductName] = useState("");
    const [SKUCode, setSKUCode] = useState("")
    const [productImage, setProductImage] = useState();
    const [categoryOptions, setCategoryOptions] = useState([]);
    const [selectedCategories, setSelectedCategories] = useState([]);
    const [data, setData] = useState([])
    const [selectedBrand, setSelectedBrand] = useState("")
    const [selectedFabric, setSelectedFabric] = useState("")
    const [selectedOccasion, setSelectedOccasion] = useState("")
    const [originalPrice, setOriginalPrice] = useState(0)
    const [discountPrice, setDiscountPrice] = useState(0)
    const [maxDisPrice, setMaxDiscPrice] = useState(0)
    const [goldPrice, setGoldPrice] = useState(0)
    const [silverPrice, setSilverPrice] = useState(0)
    const [ppoPrice, setPpoPrice] = useState(0)
    const [description, setDescription] = useState("");
    const [productAddStatus, setProductAddStatus] = useState();
    const [statusMessage, setStatusMessage] = useState("");
    const [previewImage, setPreviewImage] = useState(productData?.Product_Image)


    const handleSubmit = async (e) => {
        e.preventDefault();
        if (productName !== "") {

            const formData = new FormData();
            formData.append("Product_Name", productName);
            formData.append("SKU_Code", SKUCode);
            formData.append("image", productImage || "");

            console.log("Selected Categories:", selectedCategories);
            const selectedCategoryIds = selectedCategories.map(category => category.value);
            formData.append("Category", selectedCategoryIds.join(',') || "");

            formData.append("Brand_Name", selectedBrand?.dataId || "");
            formData.append("Fabric_Type", selectedFabric?.dataId || "");
            formData.append("Occasions", selectedOccasion?.dataId || "");
            formData.append("Product_Dis_Price", discountPrice);
            formData.append("Product_Ori_Price", originalPrice);
            formData.append("Max_Dis_Price", maxDisPrice);
            formData.append("Gold_Price", goldPrice);
            formData.append("Silver_Price", silverPrice);
            formData.append("PPO_Price", ppoPrice);
            formData.append("Description", description);

            try {
                let response = await axios.patch(
                    `${url}/product/update/${selectedProductData?._id}`,
                    formData,
                    {
                        headers: {
                            Authorization: `${adminToken}`,
                        },
                    }
                );
                console.log(response)
                if (response.data.type === "success") {
                    setProductAddStatus(response.data.type);

                    let alertBox = document.getElementById("alert-box");
                    alertBox.classList.add("alert-wrapper");
                    setStatusMessage(response.data.message);

                    //  for create variations
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
                setStatusMessage("Product not Update !");
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

    // get all category
    useEffect(() => {
        async function fetchCategoryData() {
            try {
                const categoryResponse = await axios.get(
                    `${url}/category/get`,
                    {
                        headers: {
                            Authorization: `${adminToken}`,
                        },
                    }
                );
                const options = categoryResponse?.data?.category_data?.map((option) => ({
                    value: option._id,
                    label: option.Category_Name.charAt(0).toUpperCase() + option.Category_Name.slice(1),
                }));
                setCategoryOptions(options);

            } catch (error) {
                console.error("Failed to fetch categories:", error);
            }
        }

        fetchCategoryData();
    }, []);

    // get all brand , fabric type and occasions
    useEffect(() => {
        async function fetchData() {
            try {
                const Response = await axios.get(
                    `${url}/data/get`,
                    {
                        headers: {
                            Authorization: `${adminToken}`,
                        },
                    }
                );
                setData(Response?.data?.dataType);
            } catch (error) {
                console.error("Failed to fetch categories:", error);
            }
        }

        fetchData();
    }, []);


    // Filter data for each data type
    const brandData = data?.filter(option => option?.Data_Type === "Brand Name");
    const fabricData = data?.filter(option => option?.Data_Type === "FABRIC TYPE");
    const occasionData = data?.filter(option => option?.Data_Type === "OCCASIONS");

    const brandOptions = brandData?.map((option) => {
        return {
            dataId: option?._id,
            label: option?.Data_Name?.charAt(0)?.toUpperCase() + option?.Data_Name?.slice(1)
        };
    });

    const fabricOptions = fabricData?.map((option) => {
        return {
            dataId: option?._id,
            label: option?.Data_Name?.charAt(0)?.toUpperCase() + option?.Data_Name?.slice(1)
        };
    });

    const occasionOptions = occasionData?.map((option) => {
        return {
            dataId: option?._id,
            label: option?.Data_Name?.charAt(0)?.toUpperCase() + option?.Data_Name?.slice(1)
        };
    });

    // custom style for react quill
    const customStyles = {
        singleValue: (provided) => ({
            ...provided,
            color: 'black',
        }),
        option: (provided, state) => ({
            ...provided,
            backgroundColor: state.isFocused ? 'white' : 'white',
            color: state.isSelected ? 'black' : 'black',
            ':hover': {
                backgroundColor: '#e6f7ff',
            },
        }),
    };


    //  for react quill (long desc)
    const editor = useRef();

    const handleTextChange = (value) => {
        setDescription(value);
    };


    Quill.register(quillTable.TableCell);
    Quill.register(quillTable.TableRow);
    Quill.register(quillTable.Table);
    Quill.register(quillTable.Contain);
    Quill.register('modules/table', quillTable.TableModule);

    const tableOptions = [];
    const maxRows = 8;
    const maxCols = 5;
    for (let r = 1; r <= maxRows; r++) {
        for (let c = 1; c <= maxCols; c++) {
            tableOptions.push('newtable_' + r + '_' + c);
        }
    }

    const editorModules = {
        toolbar: [
            [{ header: '1' }, { header: '2' }, { header: [3, 4, 5, 6] }, { font: [] }],
            [{ size: [] }],
            ['bold', 'italic', 'underline', 'strike', 'blockquote'],
            [{ list: 'ordered' }, { list: 'bullet' }],
            ['link', 'video', 'image'],
            ['clean'],
            ['code-block'],
            [{ color: [] }, { background: [] }],
            [{ font: [] }],
            [{ align: [] }],
            [{ script: 'sub' }, { script: 'super' }],
            [{ indent: '-1' }, { indent: '+1' }],
            [{ direction: 'rtl' }, { table: tableOptions }],
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
                                                    Fabric Type :
                                                </label>
                                                <div className="col-md-10">
                                                    <Select
                                                        required
                                                        value={selectedFabric}
                                                        onChange={(e) => setSelectedFabric(e)}
                                                        options={fabricOptions}
                                                        styles={customStyles}
                                                    />
                                                </div>
                                            </div>

                                            <div className="mb-3 row">
                                                <label
                                                    htmlFor="example-text-input"
                                                    className="col-md-2 col-form-label"
                                                >
                                                    Occasions :
                                                </label>
                                                <div className="col-md-10">
                                                    <Select
                                                        required
                                                        value={selectedOccasion}
                                                        onChange={(e) => setSelectedOccasion(e)}
                                                        options={occasionOptions}
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
                                                    Gold Price:
                                                </label>
                                                <div className="col-md-10">
                                                    <input
                                                        min="0"
                                                        required
                                                        className="form-control"
                                                        type="number"
                                                        id="example-number-input"
                                                        value={goldPrice}
                                                        onChange={(e) => {
                                                            setGoldPrice(e.target.value);
                                                        }}
                                                    />
                                                </div>
                                            </div>

                                            <div className="mb-3 row">
                                                <label
                                                    htmlFor="example-text-input"
                                                    className="col-md-2 col-form-label"
                                                >
                                                    Silver Price:
                                                </label>
                                                <div className="col-md-10">
                                                    <input
                                                        min="0"
                                                        required
                                                        className="form-control"
                                                        type="number"
                                                        id="example-number-input"
                                                        value={silverPrice}
                                                        onChange={(e) => {
                                                            setSilverPrice(e.target.value);
                                                        }}
                                                    />
                                                </div>
                                            </div>

                                            <div className="mb-3 row">
                                                <label
                                                    htmlFor="example-text-input"
                                                    className="col-md-2 col-form-label"
                                                >
                                                    PPO Price:
                                                </label>
                                                <div className="col-md-10">
                                                    <input
                                                        min="0"
                                                        required
                                                        className="form-control"
                                                        type="number"
                                                        id="example-number-input"
                                                        value={ppoPrice}
                                                        onChange={(e) => {
                                                            setPpoPrice(e.target.value);
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
                                                <label
                                                    htmlFor="example-text-input"
                                                    className="col-md-2 col-form-label"
                                                >
                                                    Product Image:
                                                    <div className="imageSize">(Recommended Resolution:
                                                        W-971 X H-1500,
                                                        W-1295 X H-2000,
                                                        W-1618 X H-2500 )</div>
                                                </label>
                                                <div className="col-md-10">
                                                    <input
                                                        className="form-control"
                                                        type="file"
                                                        onChange={(e) => {
                                                            setProductImage(e.target.files[0]);
                                                        }}
                                                        id="example-text-input"
                                                    />
                                                    <div className="fileupload_img col-md-10 mt-3">
                                                        <img
                                                            type="image"
                                                            src={productImage ? URL.createObjectURL(productImage) : `${previewImage}`}
                                                            alt="product image"
                                                            height={100}
                                                            width={100}
                                                        />
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
    )
}

export default EditProduct
