import axios from 'axios';
import React, { useEffect, useState } from 'react'
import AlertBox from '../../Components/AlertComp/AlertBox';
import { useNavigate, useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';

let url = process.env.REACT_APP_API_URL

const EditSubAdminPage = () => {
    const adminToken = localStorage.getItem('token');

    const selectedSubAdminData = useSelector((state) => state?.AdminDataChange?.payload)

    const Navigate = useNavigate();


    const [subAdminData, setSubAdmindata] = useState()
    const [settingsData, setSettingsData] = useState({});
    const [username, setUsername] = useState(selectedSubAdminData?.username);
    const [name, setName] = useState(selectedSubAdminData?.name);
    const [password, setPassword] = useState("");
    const [role, setRole] = useState(selectedSubAdminData?.role);
    const [error, setError] = useState("");

    // useEffect(() => {
    //     async function getSettings() {
    //         try {
    //             const res = await axios.get(`${url}/app/settings/get`, {
    //                 headers: {
    //                     Authorization: `${adminToken}`,
    //                 },
    //             });
    //             setSettingsData(res?.data?.Settings);
    //         } catch (error) {
    //             console.log(error);
    //         }
    //     }
    //     getSettings();
    // }, [adminToken]);

    // useEffect(() => {
    //     async function getSubAdmin() {
    //         try {
    //             const res = await axios.get(`${url}/subAdmin/get/${selectedSubAdminData?._id}`, {
    //                 headers: {
    //                     Authorization: `${adminToken}`,
    //                 },
    //             });
    //             setSubAdmindata(res.data.subAdmin);
    //         } catch (error) {
    //             console.log(error);
    //         }
    //     }
    //     getSubAdmin();
    // }, [adminToken, id]);

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const response = await axios.patch(
                `${url}/subAdmin/edit/byAdmin/${selectedSubAdminData?._id}`,
                { username, password, name, role },
                {
                    headers: {
                        Authorization: `${adminToken}`,
                    },
                }
            );

            if (response.data.type === "success") {
                Navigate('/showSubAdmin');
                closeError();
            } else if (response.data.type === "error") {
                setError(response?.data?.message);
                closeError();
            }
        } catch (error) {
            let alertBox = document.getElementById('alert-box');
            alertBox?.classList?.add('alert-wrapper')
            setError("SubAdmin not updated!");
            closeError();
        }
    }


    function closeError() {
        setTimeout(() => {
            setError("");
        }, 1500);
    }

    return (
        <>
            <div className="authentication-bg">
                <div className="account-pages  pt-sm-1">
                    <div className="container">
                        <div className="row align-items-center justify-content-center">
                            <div className="col-md-8 col-lg-6 col-xl-5">
                                <div className="card">
                                    <a className="d-block auth-logo">
                                        <img src={settingsData?.app_logo} alt="" height={80} className="logo logo-dark" />
                                        <img src={settingsData?.app_logo} alt="" height={80} className="logo logo-light" />
                                    </a>
                                    <div className="card-body p-4">

                                        <div className="text-center mt-2">
                                            <h5 className="text-primary">Sub Admin Account</h5>
                                            <p className="text-muted">Edit Sub Admin account now.</p>
                                        </div>
                                        <div className="p-2 mt-4">
                                            <form onSubmit={handleSubmit}>

                                                <div style={{ color: "red", fontSize: "13px" }}>{error ? '*' + error : ""}</div>

                                                <div className="mb-3">
                                                    <label className="form-label" htmlFor="useremail">Name</label>
                                                    <input required type="text" className="form-control" value={name} onChange={(e) => setName(e.target.value)} id="useremail" placeholder="Enter Name" />
                                                </div>

                                                <div className="mb-3">
                                                    <label className="form-label" htmlFor="username">Role</label>
                                                    <select className="form-select" value={role} onChange={(e) => setRole(e.target.value)}>
                                                        <option value={"role_1"}>role_1</option>
                                                        <option value={"role_2"}>role_2</option>
                                                        <option value={"role_3"}>role_3</option>
                                                        <option value={"role_4"}>role_4</option>
                                                        <option value={"role_5"}>role_5</option>
                                                    </select>
                                                </div>

                                                <div className="mb-3">
                                                    <label className="form-label" htmlFor="username">Username</label>
                                                    <input required type="text" className="form-control" id="username" value={username} onChange={(e) => setUsername(e.target.value)} placeholder="Enter username" />
                                                </div>

                                                <div className="mb-3">
                                                    <label className="form-label" htmlFor="userpassword">Password</label>
                                                    <input type="password" className="form-control" id="userpassword" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Enter password" />
                                                </div>

                                                <div className="mt-3 text-end">
                                                    <button className="btn btn-danger w-sm waves-effect waves-light" onClick={() => Navigate("/showSubAdmin")}>Cancel</button>
                                                    <button className="btn btn-primary w-sm waves-effect waves-light" style={{ marginLeft: "5px" }} type="submit">Save</button>
                                                </div>


                                                <div className="mt-4 text-center">
                                                    <p className="text-muted mb-0">Back to Home?
                                                        <a onClick={() => Navigate("/")}
                                                            style={{ cursor: "pointer" }}
                                                            className="fw-medium text-primary"> Home</a></p>
                                                </div>

                                            </form>
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

export default EditSubAdminPage;
