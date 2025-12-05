import React, { useState } from "react";
import axios from "axios";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import AlertBox from "../../../../Components/AlertComp/AlertBox";

let url = process.env.REACT_APP_API_URL;

const EditCategory = () => {
    const Navigate = useNavigate();
    const selectedCategoryData = useSelector((state) => state?.CategoryDataChange?.payload);

    const [categoryName, setCategoryName] = useState(selectedCategoryData?.Category_Name);
    const [categoryImage, setCategoryImage] = useState(null);
    const [secondaryCategoryImage, setSecondaryCategoryImage] = useState(null);
    const [previewImage, setPreviewImage] = useState(selectedCategoryData?.Category_Image);
    const [previewSecondaryImage, setPreviewSecondaryImage] = useState(
        selectedCategoryData?.Category_Sec_Image
    );
    const [categoryAddStatus, setCategoryAddStatus] = useState(selectedCategoryData?.Category_Status);
    const [statusMessage, setStatusMessage] = useState("");

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (categoryName !== "") {
            const formData = new FormData();
            formData.append("Category_Name", categoryName);
            formData.append("image", categoryImage);
            formData.append("Category_Label", categoryName);
            formData.append("secondaryImage", secondaryCategoryImage);

            try {
                const adminToken = localStorage.getItem("token");
                let response = await axios.patch(
                    `${url}/category/update/${selectedCategoryData?._id}`,
                    formData,
                    {
                        headers: {
                            Authorization: `${adminToken}`,
                        },
                    }
                );
                if (response.data.type === "success") {
                    setCategoryAddStatus(response.data.type);
                    let alertBox = document.getElementById("alert-box");
                    alertBox.classList.add("alert-wrapper");
                    setStatusMessage(response.data.message);
                    setCategoryName("");
                    setCategoryImage(null);
                    setSecondaryCategoryImage(null);
                    setTimeout(() => {
                        Navigate("/showCategory");
                    }, 900);
                } else {
                    setCategoryAddStatus(response.data.type);
                    let alertBox = document.getElementById("alert-box");
                    alertBox.classList.add("alert-wrapper");
                    setStatusMessage(response.data.message);
                }
            } catch (error) {
                setCategoryAddStatus("error");
                let alertBox = document.getElementById("alert-box");
                alertBox.classList.add("alert-wrapper");
                setStatusMessage("Category not Update !");
            }
        }
    };

    useEffect(() => {
        const timer = setTimeout(() => {
            setCategoryAddStatus("");
            setStatusMessage("");
            let alertBox = document?.getElementById("alert-box");
            alertBox?.classList?.remove("alert-wrapper");
        }, 1500);

        return () => clearTimeout(timer);
    }, [categoryAddStatus, statusMessage]);

    return (
        <>
            <div className="main-content dark">
                <div className="page-content">
                    <div className="container-fluid">
                        <div className="row">
                            <div className="col-12">
                                <div className="page-title-box d-flex align-items-center justify-content-between">
                                    <h4 className="mb-0">Edit Category</h4>
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
                                                    Category Name:
                                                </label>
                                                <div className="col-md-10">
                                                    <input
                                                        required
                                                        className="form-control"
                                                        type="text"
                                                        id="example-text-input"
                                                        value={categoryName}
                                                        onChange={(e) => {
                                                            setCategoryName(e.target.value);
                                                        }}
                                                    />
                                                </div>
                                            </div>
                                            <div className="mb-3 row">
                                                <label
                                                    htmlFor="example-text-input"
                                                    className="col-md-2 col-form-label"
                                                >
                                                    Category Image:
                                                    <div className="imageSize">(Recommended Resolution: W-1000 x H-1000 or Square Image)</div>
                                                </label>
                                                <div className="col-md-10">
                                                    <input
                                                        className="form-control"
                                                        type="file"
                                                        onChange={(e) => {
                                                            setCategoryImage(e.target.files[0]);
                                                            setPreviewImage(
                                                                URL.createObjectURL(
                                                                    e.target.files[0]
                                                                )
                                                            );
                                                        }}
                                                        id="example-text-input"
                                                    />
                                                    <div className="fileupload_img col-md-10 mt-3">
                                                        <img
                                                            type="image"
                                                            src={
                                                                previewImage ||
                                                                `${url}/${selectedCategoryData?.Category_Image}`
                                                            }
                                                            alt="category image"
                                                            height={100}
                                                            width={100}
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="mb-3 row">
                                                <label
                                                    htmlFor="example-text-input"
                                                    className="col-md-2 col-form-label"
                                                >
                                                    Secondary Category Image:
                                                    <div className="imageSize">(Recommended Resolution: W-856 x H-200)</div>
                                                </label>
                                                <div className="col-md-10">
                                                    <input
                                                        className="form-control"
                                                        type="file"
                                                        onChange={(e) => {
                                                            setSecondaryCategoryImage(
                                                                e.target.files[0]
                                                            );
                                                            setPreviewSecondaryImage(
                                                                URL.createObjectURL(
                                                                    e.target.files[0]
                                                                )
                                                            );
                                                        }}
                                                        id="example-text-input"
                                                    />
                                                    <div className="fileupload_img col-md-10 mt-3">
                                                        <img
                                                            type="image"
                                                            src={
                                                                previewSecondaryImage ||
                                                                `${url}/${selectedCategoryData?.Category_Sec_Image}`
                                                            }
                                                            alt="secondary category image"
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
                                                            onClick={() =>
                                                                Navigate("/showCategory")
                                                            }
                                                        >
                                                            {" "}
                                                            <i className="fas fa-window-close"></i>{" "}
                                                            Cancel{" "}
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
                                        </form>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <AlertBox status={categoryAddStatus} statusMessage={statusMessage} />
            </div>
        </>
    );
};

export default EditCategory;
