import React from 'react'
import Modal from "@mui/material/Modal";

const ImageModel = ({ isOpen, onClose, imageURL }) => {

    return (
        <>
            <div className="main-content-model dark">
                <div className="page-content">
                    <div className="container-fluid">
                        <div className="row">
                            <div className="col-12">
                                <div className="">
                                    <div className="card-body">
                                        <div style={{ textAlign: 'end', cursor: "pointer", color: "red" }} onClick={onClose}>
                                            <i class="fas fa-window-close" aria-hidden="true"></i>
                                        </div>
                                        <div style={{ textAlign: 'center' }}>
                                            <img
                                                src={imageURL}
                                                alt="Category Image"
                                                style={{ maxWidth: '100%', maxHeight: '80vh' }}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}


export default ImageModel
