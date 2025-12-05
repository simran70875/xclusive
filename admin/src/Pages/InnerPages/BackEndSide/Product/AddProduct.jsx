import React, { useRef, useState } from "react";
import defualtImage from "../../../../resources/assets/images/add-image.png";
import axios from "axios";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import AddVariation from "../Variation/AddVariation";
import AlertBox from "../../../../Components/AlertComp/AlertBox";
import Modal from "react-modal";
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import Select from "react-select";

let url = process.env.REACT_APP_API_URL

const AddProduct = () => {

    const adminToken = localStorage.getItem('token');
    const Navigate = useNavigate();

    // product
    const [productName, setProductName] = useState("");
    const [SKUCode, setSKUCode] = useState("")
    const [productImage, setProductImage] = useState("");
    const [selectedCategories, setSelectedCategories] = useState([]);
    const [categoryOptions, setCategoryOptions] = useState([]);
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

    // variation
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [variations, setVariations] = useState([]);

    useEffect(() => {
        Modal.setAppElement(document.body); // Set the appElement to document.body
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (productName !== "" && productImage !== "") {
            if (variations.length <= 0) {
                setProductAddStatus("warning")
                setStatusMessage("Please Add atleast one variations")
            }
            else {
                const formData = new FormData();
                formData.append("Product_Name", productName);
                formData.append("SKU_Code", SKUCode);
                formData.append("image", productImage);
                const selectedCategoryIds = selectedCategories.map(category => category.value);
                formData.append("Category", selectedCategoryIds);
                formData.append("Brand_Name", selectedBrand?.dataId);
                formData.append("Fabric_Type", selectedFabric?.dataId);
                formData.append("Occasions", selectedOccasion?.dataId);
                formData.append("Product_Dis_Price", discountPrice);
                formData.append("Product_Ori_Price", originalPrice);
                formData.append("Max_Dis_Price", maxDisPrice);
                formData.append("Gold_Price", goldPrice);
                formData.append("Silver_Price", silverPrice);
                formData.append("PPO_Price", ppoPrice);
                formData.append("Description", description);

                try {
                    let response = await axios.post(
                        `${url}/product/add`,
                        formData,
                        {
                            headers: {
                                Authorization: `${adminToken}`,
                            },
                        }
                    );
                    if (response.data.type === "success") {
                        setProductAddStatus(response.data.type);
                        let alertBox = document.getElementById("alert-box");
                        alertBox.classList.add("alert-wrapper");
                        setStatusMessage(response.data.message);

                        //  for create variations
                        const productId = response?.data?.productId

                        try {
                            for (const variation of variations) {
                                const variationFormData = new FormData();
                                variationFormData.append('Variation_Name', variation?.name);
                                variation?.sizes?.forEach((size) => {
                                    variationFormData.append('Size_Name', size?.size);
                                    variationFormData.append('Size_Stock', size?.stock);
                                });
                                variation?.images?.forEach((image) => {
                                    variationFormData.append('images', image);
                                });

                                await axios.post(`${url}/product/variation/add/${productId}`, variationFormData,
                                    {
                                        headers: {
                                            Authorization: `${adminToken}`,
                                        },
                                    });
                                setVariations("")
                            }

                        } catch (error) {
                            console.log(error)
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
                const response = await axios.get(`${url}/category/get`,
                    {
                        headers: {
                            Authorization: `${adminToken}`,
                        },
                    });
                const options = response?.data?.category_data?.map((option) => ({
                    value: option._id,
                    label: option.Category_Name.charAt(0).toUpperCase() + option.Category_Name.slice(1),
                }));
                setCategoryOptions(options);
            } catch (error) {
                console.error('Failed to fetch categories:', error);
            }
        }
        fetchCategoryData();
    }, []);

    const handleCategoryChange = (selectedOptions) => {
        setSelectedCategories(selectedOptions);
    };

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
                                                        value={selectedCategories}
                                                        onChange={handleCategoryChange}
                                                        options={categoryOptions}
                                                        isMulti
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
                                                        required
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
                                                            src={
                                                                productImage
                                                                    ? URL.createObjectURL(productImage)
                                                                    : defualtImage
                                                            }
                                                            alt="product image"
                                                            height={100}
                                                            width={100}
                                                        />
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
                                                            {" "}
                                                            <i className="fas fa-plus-circle"></i> Add{" "}
                                                        </a>
                                                    </div>
                                                </div>
                                            </div>

                                            <Modal
                                                className="main-content dark"
                                                isOpen={isModalOpen}
                                                onRequestClose={handleCloseModal}
                                            >
                                                <AddVariation />
                                            </Modal>

                                            {!variations.length <= 0 &&
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
                                                                                value={variation?.selectedSize || defaultSize}
                                                                                onChange={(e) => {
                                                                                    const selectedSize = e.target.value;
                                                                                    const updatedVariations = variations.map((v, i) => {
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
                                                                                {variation?.sizes?.map((vari, sizeIndex) => {
                                                                                    return (
                                                                                        <option key={sizeIndex} value={vari?.size}>
                                                                                            {vari?.size}
                                                                                        </option>
                                                                                    );
                                                                                })}
                                                                            </select>
                                                                        </td>
                                                                        <td>
                                                                            {variation?.sizes?.map((vari) => {
                                                                                if (vari?.size === (variation?.selectedSize || defaultSize)) {
                                                                                    return vari?.stock;
                                                                                }
                                                                                return null;
                                                                            })}
                                                                        </td>
                                                                        <td>
                                                                            <i class="fa fa-trash"
                                                                                onClick={() => handleDeleteVariation(index)}
                                                                                aria-hidden="true"
                                                                                style={{ color: "red", cursor: "pointer" }}
                                                                            ></i>
                                                                        </td>
                                                                    </tr>
                                                                </>
                                                            );
                                                        })}
                                                    </table>
                                                </div>
                                            }

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
                                                    <AlertBox status={productAddStatus} statusMessage={statusMessage} />
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
                    />
                </Modal>
            </div>
        </>
    );
};

export default AddProduct;