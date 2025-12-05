import React, { useState } from 'react';
import axios from 'axios';
let url = process.env.REACT_APP_API_URL

const EditVariationSizeStock = ({ handleCloseModal, selectedSizeData, variationId, handleSizeUpdate }) => {
    const [stock, setStock] = useState(selectedSizeData?.Size_Stock || '');

    const handleUpdateSize = async (e) => {
        e.preventDefault();

        try {
            const adminToken = localStorage.getItem('token');
            const response = await axios.put(
                `${url}/product/edit/variation/size/stock/${variationId}/${selectedSizeData?.Size_Id}`,
                {
                    Size_Stock: stock,
                },
                {
                    headers: {
                        Authorization: `${adminToken}`,
                    },
                }
            );

            if (response?.data?.type === 'success') {
                handleSizeUpdate(selectedSizeData?._id, { Size_Stock: stock });
                handleCloseModal();
            } else {
                console.log('Error updating size:', response?.data?.message);
            }
        } catch (error) {
            console.log('Error updating size:', error);
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
                                            <h4 className="mb-0">Edit Variation Size Stock</h4>
                                            <i
                                                className="fas fa-window-close"
                                                style={{ cursor: "pointer", color: "red" }}
                                                onClick={handleCloseModal}
                                            ></i>
                                        </div>
                                        <form onSubmit={handleUpdateSize}>
                                            <div className="mb-3 row">
                                                <label htmlFor="example-text-input" className="col-md-2 col-form-label">
                                                    Size Stock:
                                                </label>
                                                <div className="col-md-3">
                                                    <input
                                                        min="0"
                                                        required
                                                        className="form-control"
                                                        type="number"
                                                        id="example-number-input"
                                                        value={stock}
                                                        onChange={(e) => setStock(e.target.value)}
                                                    />
                                                </div>
                                            </div>
                                            <div className="col-md-2">
                                                <button type="submit" className="btn btn-primary">
                                                    Update Size Stock
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

export default EditVariationSizeStock;
