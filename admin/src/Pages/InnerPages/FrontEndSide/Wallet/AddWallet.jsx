import React, { useState, useEffect } from "react";
import axios from "axios";
import AlertBox from "../../../../Components/AlertComp/AlertBox";
import { useNavigate } from "react-router-dom";

let url = process.env.REACT_APP_API_URL;

const AddWallet = () => {

    const adminToken = localStorage.getItem('token');
    const Navigate = useNavigate()

    const [transType, setTransType] = useState("Credit");
    const [amount, setAmount] = useState(1);
    const [userType, setUserType] = useState("0");
    const [walletAddStatus, setWalletAddStatus] = useState();
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
                    setResellerList(response?.data?.user);
                }
            } catch (error) {
                console.log(error);
            }
        }
        getAllUsers();
        getAllResellers()
    }, [adminToken]);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (amount) {
            const formData = {
                amount: amount,
                userId: selectedUser,
                userType: userType,
                transType: transType,
            }

            try {
                let response = await axios.post(
                    `${url}/wallet/history/add/byadmin`,
                    formData,
                    {
                        headers: {
                            Authorization: `${adminToken}`,
                        },
                    }
                );
                if (response.data.type === "success") {
                    setWalletAddStatus(response.data.type);
                    let alertBox = document.getElementById('alert-box');
                    alertBox.classList.add('alert-wrapper');
                    setStatusMessage(response.data.message);
                    setTimeout(() => {
                        Navigate('/showWalletHistory');
                    }, 900);
                } else {
                    setWalletAddStatus(response.data.type);
                    let alertBox = document.getElementById('alert-box');
                    alertBox.classList.add('alert-wrapper');
                    setStatusMessage(response.data.message);
                }
            } catch (error) {
                setWalletAddStatus("error");
                let alertBox = document.getElementById('alert-box');
                alertBox.classList.add('alert-wrapper');
                setStatusMessage("Wallet not added!");
            }
        }
    };

    useEffect(() => {
        const timer = setTimeout(() => {
            setWalletAddStatus("");
            setStatusMessage("");
            let alertBox = document?.getElementById('alert-box');
            alertBox?.classList?.remove('alert-wrapper');
        }, 1500);

        return () => clearTimeout(timer);
    }, [walletAddStatus, statusMessage]);

    return (
        <>
            <div className="main-content dark">
                <div className="page-content">
                    <div className="container-fluid">
                        <div className="row">
                            <div className="col-12">
                                <div className="page-title-box d-flex align-items-center justify-content-between">
                                    <h4 className="mb-0">Add Wallet</h4>
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
                                                    htmlFor="walletCode"
                                                    className="col-md-2 col-form-label"
                                                >
                                                    Type:
                                                </label>
                                                <div className="col-md-10">
                                                    <select
                                                        required
                                                        className="form-select"
                                                        id="userType"
                                                        value={transType}
                                                        onChange={(e) => setTransType(e.target.value)}
                                                    >
                                                        <option value="Credit">Credit</option>
                                                        <option value="Debit">Debit</option>
                                                    </select>
                                                </div>
                                            </div>
                                            <div className="mb-3 row">
                                                <label
                                                    htmlFor="amount"
                                                    className="col-md-2 col-form-label"
                                                >
                                                    Amount:
                                                </label>
                                                <div className="col-md-10">
                                                    <input
                                                        min={1}
                                                        required
                                                        className="form-control"
                                                        type="number"
                                                        id="amount"
                                                        value={amount}
                                                        onChange={(e) => setAmount(e.target.value)}
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
                                                        required
                                                        className="form-select"
                                                        id="userType"
                                                        value={userType}
                                                        onChange={(e) => setUserType(e.target.value)}
                                                    >
                                                        {/* <option value="0">All</option> */}
                                                        {/* <option value="1">All Retailer</option> */}
                                                        {/* <option value="2">All Resellers</option> */}
                                                        <option value="">Please Select One</option>
                                                        <option value="3">User</option>
                                                        <option value="4">Reseller</option>
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
                                                                        {user?.User_Name}-({user?.User_Mobile_No})
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
                                                                        {user?.User_Name}-({user?.User_Mobile_No})
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
                                                        <button className="btn btn-danger" onClick={() => Navigate('/showWalletHistory')}>
                                                            {" "}
                                                            <i className="fas fa-window-close"></i> Cancel{" "}
                                                        </button>
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
                <AlertBox status={walletAddStatus} statusMessage={statusMessage} />
            </div>
        </>
    );
};

export default AddWallet;
