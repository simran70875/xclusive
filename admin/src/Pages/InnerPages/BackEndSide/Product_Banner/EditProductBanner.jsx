import React, { useState } from "react";
import AlertBox from '../../../../Components/AlertComp/AlertBox'
import axios from "axios";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import Select from "react-select";

let url = process.env.REACT_APP_API_URL

const EditProductBanner = () => {

    const adminToken = localStorage.getItem('token');
    const Navigate = useNavigate();
    const selectedBannerData = useSelector((state) => state?.ProductBannerDataChange?.payload)

    const [bannerName, setBannerName] = useState(selectedBannerData?.Banner_Name);
    const [bannerImage, setBannerImage] = useState(null);
    const [previewImage, setPreviewImage] = useState(selectedBannerData?.Banner_Image)
    const [sequence, setSequence] = useState(selectedBannerData?.Banner_Sequence);
    const [productData, setProductData] = useState([])
    const [SelectedProduct, setSelectedProduct] = useState(selectedBannerData?.ProductId)
    const [statusMessage, setStatusMessage] = useState("");
    const [bannerAddStatus, setBannerAddStatus] = useState();

    // get all product
    useEffect(() => {
        async function getProduct() {
            try {
                const res = await axios.get(`${url}/product/get`,
                    {
                        headers: {
                            Authorization: `${adminToken}`,
                        },
                    })
                setProductData(res?.data?.product || [])
            } catch (error) {
                console.log(error)
            }
        }
        getProduct()
    }, [productData])

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (bannerName !== "" && bannerImage !== "") {
            const formData = new FormData();
            formData.append("Banner_Name", bannerName);
            formData.append("image", bannerImage);
            formData.append("Banner_Label", bannerName);
            formData.append("Banner_Sequence", sequence);
            formData.append("ProductId", SelectedProduct?.productId || "");

            try {
                let response = await axios.patch(
                    `${url}/product/banner/update/${selectedBannerData?._id}`,
                    formData,
                    {
                        headers: {
                            Authorization: `${adminToken}`,
                        },
                    }
                );
                if (response.data.type === "success") {
                    setBannerAddStatus(response.data.type);
                    let alertBox = document.getElementById("alert-box");
                    alertBox.classList.add("alert-wrapper");
                    setStatusMessage(response.data.message);
                    setBannerName("");
                    setBannerImage("");
                    setSequence("");
                    setTimeout(() => {
                        Navigate("/showProductBanner");
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

    // options for select product
    const options = productData?.map((option, index) => ({
        productId: option?._id,
        label: option?.Product_Name?.charAt(0)?.toUpperCase() + option?.Product_Name?.slice(1),
    }));

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

    return (
        <>
            <div className="main-content dark">
                <div className="page-content">
                    <div className="container-fluid">
                        <div className="row">
                            <div className="col-12">
                                <div className="page-title-box d-flex align-items-center justify-content-between">
                                    <h4 className="mb-0">Edit Product Banner</h4>
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
                                                    Banner Sequence:
                                                </label>
                                                <div className="col-md-10">
                                                    <input
                                                        min="1"
                                                        required
                                                        className="form-control"
                                                        type="number"
                                                        value={sequence}
                                                        onChange={(e) => setSequence(e.target.value)}
                                                        id="example-number-input"
                                                    />
                                                </div>
                                            </div>
                                            <div className="mb-3 row">
                                                <label
                                                    htmlFor="example-text-input"
                                                    className="col-md-2 col-form-label"
                                                >
                                                    Product Name:
                                                </label>
                                                <div className="col-md-10">
                                                    <Select
                                                        value={SelectedProduct}
                                                        defaultInputValue={selectedBannerData?.Product_Name}
                                                        defaultValue={selectedBannerData?.Product_Name}
                                                        onChange={(e) => {
                                                            setSelectedProduct(e);
                                                        }}
                                                        options={options}
                                                        styles={customStyles}
                                                    />
                                                </div>
                                            </div>
                                            <div className="mb-3 row">
                                                <label
                                                    htmlFor="example-text-input"
                                                    className="col-md-2 col-form-label"
                                                >
                                                    Banner Image:
                                                    <div className="imageSize">(Recommended Resolution: W-856 x H-400 )</div>
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
                                                            src={bannerImage ? URL.createObjectURL(bannerImage) : `${previewImage}`}
                                                            alt="user image"
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
                                                            onClick={() => Navigate("/showProductBanner")}
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

export default EditProductBanner;
