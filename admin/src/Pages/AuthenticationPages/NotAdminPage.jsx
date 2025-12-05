import React from 'react'
import { useNavigate } from 'react-router-dom'

const NotAdminPage = () => {

    const Navigate = useNavigate()

    return (
        <>
            <div className="main-content dark">
                <div className="page-content">
                    <div className="container-fluid">
                        <div className='row'>
                            <div className="col-12 mt-2">
                                <div className="mt-4 text-center">
                                    <div className="card-body">
                                        <div
                                            style={{
                                                color: "red",
                                                fontSize: "18px",
                                            }}>
                                            You are not an admin and can't access this page.
                                        </div>
                                        <div
                                            className='mt-2'
                                            style={{
                                                color: "blue",
                                                textDecoration: "underline",
                                                cursor: "pointer"
                                            }}
                                            onClick={() => Navigate('/login')}
                                        >
                                            Login
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

export default NotAdminPage
