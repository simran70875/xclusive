import React from 'react'

const BankDetailsSettings = ({
    upiImage,
    branch,
    accountNo,
    ifscCode,
    bankName,
    address,
    panNo,
    gstNo,
    setBankName,
    setIfscCode,
    setAccountNo,
    setBranch,
    setaddress,
    setpanNo,
    setGstNo,
    bankImage,
    setUpiImage

}) => {
    return (
        <>
            <div className="mb-3 row">
                <label
                    htmlFor="example-text-input"
                    className="col-md-2 col-form-label"
                >
                    Address :-
                </label>
                <div className="col-md-10">
                    <input
                        required
                        className="form-control"
                        type="text"
                        id="example-text-input"
                        value={address}
                        onChange={(e) => {
                            setaddress(e.target.value);
                        }}
                    />
                </div>
            </div>
            <div className="mb-3 row">
                <label
                    htmlFor="example-text-input"
                    className="col-md-2 col-form-label"
                >
                    GSTIN :-
                </label>
                <div className="col-md-10">
                    <input
                        required
                        className="form-control"
                        type="text"
                        id="example-text-input"
                        value={gstNo}
                        onChange={(e) => {
                            setGstNo(e.target.value);
                        }}
                    />
                </div>
            </div>
            <div className="mb-3 row">
                <label
                    htmlFor="example-text-input"
                    className="col-md-2 col-form-label"
                >
                    PAN No :-
                </label>
                <div className="col-md-10">
                    <input
                        required
                        className="form-control"
                        type="text"
                        id="example-text-input"
                        value={panNo}
                        onChange={(e) => {
                            setpanNo(e.target.value);
                        }}
                    />
                </div>
            </div>
            <div className="mb-3 row">
                <label
                    htmlFor="example-text-input"
                    className="col-md-2 col-form-label"
                >
                    Bank Name :-
                </label>
                <div className="col-md-10">
                    <input
                        required
                        className="form-control"
                        type="text"
                        id="example-text-input"
                        value={bankName}
                        onChange={(e) => {
                            setBankName(e.target.value);
                        }}
                    />
                </div>
            </div>
            <div className="mb-3 row">
                <label
                    htmlFor="example-text-input"
                    className="col-md-2 col-form-label"
                >
                    Bank Account No :-
                </label>
                <div className="col-md-10">
                    <input
                        required
                        className="form-control"
                        type="text"
                        id="example-text-input"
                        value={accountNo}
                        onChange={(e) => {
                            setAccountNo(e.target.value);
                        }}
                    />
                </div>
            </div>
            <div className="mb-3 row">
                <label
                    htmlFor="example-text-input"
                    className="col-md-2 col-form-label"
                >
                    IFSC Code :-
                </label>
                <div className="col-md-10">
                    <input
                        required
                        className="form-control"
                        type="text"
                        id="example-text-input"
                        value={ifscCode}
                        onChange={(e) => {
                            setIfscCode(e.target.value);
                        }}
                    />
                </div>
            </div>
            <div className="mb-3 row">
                <label
                    htmlFor="example-text-input"
                    className="col-md-2 col-form-label"
                >
                    Branch Name :-
                </label>
                <div className="col-md-10">
                    <input
                        required
                        className="form-control"
                        type="text"
                        id="example-text-input"
                        value={branch}
                        onChange={(e) => {
                            setBranch(e.target.value);
                        }}
                    />
                </div>
            </div>
            <div className="mb-3 row">
                <label
                    htmlFor="example-text-input"
                    className="col-md-2 col-form-label"
                >
                    App Upi Image :-
                </label>
                <div className="col-md-10">
                    <input
                        className="form-control"
                        type="file"
                        onChange={(e) => {
                            setUpiImage(e.target.files[0])
                        }}
                        id="example-text-input"
                    />
                    <div className="fileupload_img col-md-10 mt-3">
                        <img
                            type="image"
                            src={
                                upiImage
                                    ? URL.createObjectURL(upiImage)
                                    : `${bankImage}`
                            }
                            alt="bank upi"
                            height={300}
                            width={300}
                        />
                    </div>
                </div>
            </div>
        </>
    )
}

export default BankDetailsSettings
