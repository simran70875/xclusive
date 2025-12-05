import React, { useState } from 'react';
import axios from 'axios';
let url = process.env.REACT_APP_API_URL;

const AddVariationSize = ({ variationId, handleCloseModal, handleSizeAdd }) => {
    const adminToken = localStorage.getItem('token');
    const [sizeName, setSizeName] = useState('');
    const [stock, setStock] = useState('');

    const handleAddSize = async (e) => {
        e.preventDefault();

        try {
            // Send the new size data to the server
            const response = await axios.post(`${url}/product/variation/add/size/${variationId}`, {
                Size_Name: sizeName,
                Size_Stock: stock,
            }, {
                headers: {
                    Authorization: `${adminToken}`,
                },
            });

            if (response?.data?.type === 'success') {
                handleSizeAdd(response.data.size);
                handleCloseModal();
            } else {
                console.log('Error adding size:', response?.data?.message);
            }
        } catch (error) {
            // Handle any other errors that may occur during the API call
            console.log('Error adding size:', error);
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
                                        <h4 className="mb-0">Add New Size</h4>
                                        <i
                                            className="fas fa-window-close"
                                            style={{ cursor: 'pointer', color: 'red' }}
                                            onClick={handleCloseModal}
                                        ></i>
                                    </div>
                                    <form onSubmit={handleAddSize}>
                                        <div className="mb-3 row">
                                            <label htmlFor="sizeName" className="col-md-2 col-form-label">
                                                Size Name:
                                            </label>
                                            <div className="col-md-4">
                                                <select
                                                    required
                                                    className="form-select"
                                                    id="subcategory-select"
                                                    value={sizeName}
                                                    onChange={(e) => {
                                                        setSizeName(e.target.value)
                                                    }}
                                                >
                                                    <option value="">Select Size</option>
                                                    <option value="One Size ">One Size</option>
                                                    <option value="Unstitched Material">UNSTITCHED MATERIAL</option>
                                                    <option value="xs">xs</option>
                                                    <option value="s">s</option>
                                                    <option value="m">m</option>
                                                    <option value="l">l</option>
                                                    <option value="xl">xl</option>
                                                    <option value="xxl">xxl</option>
                                                </select>
                                            </div>
                                        </div>
                                        <div className="mb-3 row">
                                            <label htmlFor="stock" className="col-md-2 col-form-label">
                                                Stock:
                                            </label>
                                            <div className="col-md-4">
                                                <input
                                                    min="0"
                                                    required
                                                    className="form-control"
                                                    type="number"
                                                    id="stock"
                                                    placeholder='Add Stock'
                                                    value={stock}
                                                    onChange={(e) => setStock(e.target.value)}
                                                />
                                            </div>
                                        </div>
                                        <div className="col-md-2">
                                            <button type="submit" className="btn btn-primary">
                                                Add Size
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

export default AddVariationSize;
