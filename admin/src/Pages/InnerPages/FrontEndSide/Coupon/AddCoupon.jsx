import React, { useState, useEffect } from "react";
import axios from "axios";
import AlertBox from "../../../../Components/AlertComp/AlertBox";
import { useNavigate } from "react-router-dom";

let url = process.env.REACT_APP_API_URL;

const AddCoupon = () => {

    const adminToken = localStorage.getItem('token');
    const Navigate = useNavigate()

    const [couponCode, setCouponCode] = useState("");
    const [discountAmount, setDiscountAmount] = useState(1);
    const [coinsReward, setCoinsReward] = useState(1)
    const [expiryDate, setExpiryDate] = useState("");
    const [createDate, setCreateDate] = useState("");
    const [usageLimits, setUsageLimits] = useState(1);
    const [userType, setUserType] = useState("0");
    const [couponAddStatus, setCouponAddStatus] = useState();
    const [statusMessage, setStatusMessage] = useState("");
    const [userList, setUserList] = useState([]);
    const [resellerList, setResellerList] = useState([])
    const [selectedUser, setSelectedUser] = useState("");

    useEffect(() => {
        async function getAllUsers() {
            try {
                const response = await axios.get(`${url}/user/get/alluser`,
                    {
                        headers: {
                            Authorization: `${adminToken}`,
                        },
                    });
                if (response.data.type === "success") {
                    setUserList(response?.data?.user || []);
                }
            } catch (error) {
                console.log(error);
            }
        }
        async function getAllResellers() {
            try {
                const response = await axios.get(`${url}/user/get/allreseller`,
                    {
                        headers: {
                            Authorization: `${adminToken}`,
                        },
                    });
                if (response.data.type === "success") {
                    setResellerList(response?.data?.user || []);
                }
            } catch (error) {
                console.log(error);
            }
        }
        getAllUsers();
        getAllResellers()
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (couponCode && discountAmount && expiryDate && usageLimits) {
            const formData = {
                couponCode: couponCode,
                discountAmount: discountAmount,
                creationDate: createDate,
                expiryDate: expiryDate,
                usageLimits: usageLimits,
                selectedUser: selectedUser,
                userType: userType,
                coinsReward: coinsReward
            }

            try {
                let response = await axios.post(
                    `${url}/coupon/createbyadmin`,
                    formData,
                    {
                        headers: {
                            Authorization: `${adminToken}`,
                        },
                    }
                );
                if (response.data.type === "success") {
                    setCouponAddStatus(response.data.type);
                    let alertBox = document.getElementById('alert-box');
                    alertBox.classList.add('alert-wrapper');
                    setStatusMessage(response.data.message);
                    setTimeout(() => {
                        Navigate('/showCoupon');
                    }, 900);
                } else {
                    setCouponAddStatus(response.data.type);
                    let alertBox = document.getElementById('alert-box');
                    alertBox.classList.add('alert-wrapper');
                    setStatusMessage(response.data.message);
                }
            } catch (error) {
                setCouponAddStatus("error");
                let alertBox = document.getElementById('alert-box');
                alertBox.classList.add('alert-wrapper');
                setStatusMessage("Coupon not added!");
            }
        }
    };

    useEffect(() => {
        const timer = setTimeout(() => {
            setCouponAddStatus("");
            setStatusMessage("");
            let alertBox = document?.getElementById('alert-box');
            alertBox?.classList?.remove('alert-wrapper');
        }, 1500);

        return () => clearTimeout(timer);
    }, [couponAddStatus, statusMessage]);

    return (
        <>
            <div className="main-content dark">
                <div className="page-content">
                    <div className="container-fluid">
                        <div className="row">
                            <div className="col-12">
                                <div className="page-title-box d-flex align-items-center justify-content-between">
                                    <h4 className="mb-0">Add Category</h4>
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
                                                    htmlFor="couponCode"
                                                    className="col-md-2 col-form-label"
                                                >
                                                    Coupon Code:
                                                </label>
                                                <div className="col-md-10">
                                                    <input
                                                        required
                                                        className="form-control"
                                                        type="text"
                                                        id="couponCode"
                                                        value={couponCode}
                                                        onChange={(e) => setCouponCode(e.target.value)}
                                                    />
                                                </div>
                                            </div>
                                            <div className="mb-3 row">
                                                <label
                                                    htmlFor="discountAmount"
                                                    className="col-md-2 col-form-label"
                                                >
                                                    Discount Amount:
                                                </label>
                                                <div className="col-md-10">
                                                    <input
                                                        min={1}
                                                        required
                                                        className="form-control"
                                                        type="number"
                                                        id="discountAmount"
                                                        value={discountAmount}
                                                        onChange={(e) => setDiscountAmount(e.target.value)}
                                                    />
                                                </div>
                                            </div>
                                            <div className="mb-3 row">
                                                <label
                                                    htmlFor="discountAmount"
                                                    className="col-md-2 col-form-label"
                                                >
                                                    Coins Reward:
                                                </label>
                                                <div className="col-md-10">
                                                    <input
                                                        min={1}
                                                        required
                                                        className="form-control"
                                                        type="number"
                                                        id="discountAmount"
                                                        value={coinsReward}
                                                        onChange={(e) => setCoinsReward(e.target.value)}
                                                    />
                                                </div>
                                            </div>
                                            <div className="mb-3 row">
                                                <label
                                                    htmlFor="createDate"
                                                    className="col-md-2 col-form-label"
                                                >
                                                    Start Date:
                                                </label>
                                                <div className="col-md-10">
                                                    <input
                                                        required
                                                        className="form-control"
                                                        type="date"
                                                        id="createDate"
                                                        value={createDate}
                                                        onChange={(e) => setCreateDate(e.target.value)}
                                                    />
                                                </div>
                                            </div>
                                            <div className="mb-3 row">
                                                <label
                                                    htmlFor="expiryDate"
                                                    className="col-md-2 col-form-label"
                                                >
                                                    End Date:
                                                </label>
                                                <div className="col-md-10">
                                                    <input
                                                        required
                                                        className="form-control"
                                                        type="date"
                                                        id="expiryDate"
                                                        value={expiryDate}
                                                        onChange={(e) => setExpiryDate(e.target.value)}
                                                    />
                                                </div>
                                            </div>
                                            <div className="mb-3 row">
                                                <label
                                                    htmlFor="usageLimits"
                                                    className="col-md-2 col-form-label"
                                                >
                                                    Usage Limits:
                                                </label>
                                                <div className="col-md-10">
                                                    <input
                                                        min={1}
                                                        required
                                                        className="form-control"
                                                        type="number"
                                                        id="usageLimits"
                                                        value={usageLimits}
                                                        onChange={(e) => setUsageLimits(e.target.value)}
                                                    />
                                                </div>
                                            </div>
                                            <div className="mb-3 row">
                                                <label
                                                    htmlFor="userType"
                                                    className="col-md-2 col-form-label"
                                                >
                                                    User Type:
                                                </label>
                                                <div className="col-md-10">
                                                    <select
                                                        className="form-select"
                                                        id="userType"
                                                        value={userType}
                                                        onChange={(e) => setUserType(e.target.value)}
                                                    >
                                                        <option value="0">All</option>
                                                        <option value="1">All Users</option>
                                                        <option value="2">All Resellers</option>
                                                        <option value="3">Particular User</option>
                                                        <option value="4">Particular Reseller</option>
                                                    </select>
                                                    {userType === "3" ? (
                                                        <select
                                                            required
                                                            className="form-select mt-3"
                                                            value={selectedUser}
                                                            onChange={(e) => setSelectedUser(e.target.value)}
                                                        >
                                                            <option value="">Select User</option>
                                                            {userList.map((user) => (
                                                                user?.User_Name ? (
                                                                    <option key={user?._id} value={user?._id}>
                                                                        {user?.User_Name}
                                                                    </option>
                                                                ) : null
                                                            ))}
                                                        </select>
                                                    ) : null}
                                                    {userType === "4" ? (
                                                        <select
                                                            required
                                                            className="form-select mt-3"
                                                            value={selectedUser}
                                                            onChange={(e) => setSelectedUser(e.target.value)}
                                                        >
                                                            <option value="">Select Reseller</option>
                                                            {resellerList.map((user) => (
                                                                user?.User_Name ? (
                                                                    <option key={user?._id} value={user?._id}>
                                                                        {user?.User_Name}
                                                                    </option>
                                                                ) : null
                                                            ))}
                                                        </select>
                                                    ) : null}
                                                </div>
                                            </div>
                                            <div className="row mb-10">
                                                <div className="col ms-auto">
                                                    <div className="d-flex flex-reverse flex-wrap gap-2">
                                                        <a className="btn btn-danger" onClick={() => Navigate('/showCoupon')}>
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
                <AlertBox status={couponAddStatus} statusMessage={statusMessage} />
            </div>
        </>
    );
};

export default AddCoupon;
