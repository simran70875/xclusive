import React, { useEffect, useState } from "react";

const RightSide = () => {

    const [layoutMode, setLayoutMode] = useState("light")
    const [layoutWidth, setLayoutWidth] = useState("fluid")
    const [topbarColor, setTopbarColor] = useState("light")
    const [sidebarColor, setSidebarColor] = useState("light")
    const [sidebarSize, setSidebarSize] = useState(document.body.getAttribute('data-sidebar-size'))

    useEffect(() => {
        setSidebarSize(document.body.getAttribute('data-sidebar-size'))
    }, [sidebarSize])

    return (
        <>
            <div className="right-bar">
                <div data-simplebar className="h-100">
                    <div className="rightbar-title d-flex align-items-center p-3">
                        <h5 className="m-0 me-2">Settings</h5>

                        <a className="right-bar-toggle ms-auto" style={{ cursor: "pointer" }} onClick={() => {
                            document.body.classList.remove('right-bar-enabled')
                        }}>
                            <i
                                className="fa fa-times"
                                aria-hidden="true"
                            ></i>
                        </a>
                    </div>

                    <hr className="m-0" />

                    <div className="p-4">
                        <h6 className="mb-3">Layout Mode</h6>

                        <div className="form-check form-check-inline">
                            <input
                                className="form-check-input"
                                type="radio"
                                name="layout-mode"
                                id="layout-mode-light"
                                value="light"
                                onChange={() => {
                                    setLayoutMode("light")
                                    document.body.setAttribute('data-bs-theme', 'light')
                                    document.body.setAttribute('data-topbar', 'light')
                                    document.body.setAttribute('data-sidebar', 'light')
                                    document.body.classList.add('light')
                                    document.body.classList.remove('dark')
                                }}
                                checked={layoutMode === "light"}
                            />
                            <label className="form-check-label" htmlFor="layout-mode-light">
                                Light
                            </label>
                        </div>
                        <div className="form-check form-check-inline">
                            <input
                                className="form-check-input"
                                type="radio"
                                name="layout-mode"
                                id="layout-mode-dark"
                                value="dark"
                                onChange={() => {
                                    setLayoutMode("dark")
                                    document.body.setAttribute('data-bs-theme', 'dark')
                                    document.body.setAttribute('data-topbar', 'dark')
                                    document.body.setAttribute('data-sidebar', 'dark')
                                    document.body.classList.add('dark')
                                    document.body.classList.remove('light')
                                }}
                                checked={layoutMode === "dark"}
                            />
                            <label className="form-check-label" htmlFor="layout-mode-dark">
                                Dark
                            </label>
                        </div>

                        <h6 className="mt-4 mb-3 pt-2">Layout Width</h6>

                        <div className="form-check form-check-inline">
                            <input
                                className="form-check-input"
                                type="radio"
                                name="layout-width"
                                id="layout-width-fuild"
                                value="fuild"
                                onChange={() => {
                                    setLayoutWidth("fluid")
                                    document.body.setAttribute('data-layout-size', 'fluid')
                                }}
                                checked={layoutWidth === "fluid"}
                            />
                            <label className="form-check-label" htmlFor="layout-width-fuild">
                                Fluid
                            </label>
                        </div>
                        <div className="form-check form-check-inline">
                            <input
                                className="form-check-input"
                                type="radio"
                                name="layout-width"
                                id="layout-width-boxed"
                                value="boxed"
                                onChange={() => {
                                    setLayoutWidth("boxed")
                                    document.body.setAttribute('data-layout-size', 'boxed')
                                }}
                                checked={layoutWidth === "boxed"}
                            />
                            <label className="form-check-label" htmlFor="layout-width-boxed">
                                Boxed
                            </label>
                        </div>

                        <h6 className="mt-4 mb-3 pt-2">Layout Position</h6>

                        <h6 className="mt-4 mb-3 pt-2">Topbar Color</h6>

                        <div className="form-check form-check-inline">
                            <input
                                className="form-check-input"
                                type="radio"
                                name="topbar-color"
                                id="topbar-color-light"
                                value="light"
                                onChange={() => {
                                    setTopbarColor("light")
                                    document.body.setAttribute("data-topbar", "light")
                                }}
                                checked={topbarColor === "light"}
                            />
                            <label className="form-check-label" htmlFor="topbar-color-light">
                                Light
                            </label>
                        </div>
                        <div className="form-check form-check-inline">
                            <input
                                className="form-check-input"
                                type="radio"
                                name="topbar-color"
                                id="topbar-color-dark"
                                value="dark"
                                onChange={() => {
                                    setTopbarColor("dark")
                                    document.body.setAttribute("data-topbar", "dark")
                                }}
                                checked={topbarColor === "dark"}
                            />
                            <label className="form-check-label" htmlFor="topbar-color-dark">
                                Dark
                            </label>
                        </div>

                        <h6 className="mt-4 mb-3 pt-2 sidebar-setting">Sidebar Size</h6>

                        <div className="form-check sidebar-setting">
                            <input
                                className="form-check-input"
                                type="radio"
                                name="sidebar-size"
                                id="sidebar-size-default"
                                value="lg"
                                onChange={() => {
                                    setSidebarSize("lg")
                                    document.body.setAttribute("data-sidebar-size", "lg")
                                    document.body.classList.add("lg")
                                    document.body.classList.remove("sm")
                                }}
                                checked={sidebarSize === "lg"}
                            />
                            <label
                                className="form-check-label"
                                htmlFor="sidebar-size-default"
                            >
                                Default
                            </label>
                        </div>
                        <div className="form-check sidebar-setting">
                            <input
                                className="form-check-input"
                                type="radio"
                                name="sidebar-size"
                                id="sidebar-size-small"
                                value="sm"
                                onChange={() => {
                                    setSidebarSize("sm")
                                    document.body.setAttribute("data-sidebar-size", "sm")
                                    document.body.classList.add("sm")
                                    document.body.classList.remove("lg")
                                }}
                                checked={sidebarSize === "sm"}
                            />
                            <label className="form-check-label" htmlFor="sidebar-size-small">
                                Small (Icon View)
                            </label>
                        </div>

                        <h6 className="mt-4 mb-3 pt-2 sidebar-setting">Sidebar Color</h6>

                        <div className="form-check sidebar-setting">
                            <input
                                className="form-check-input"
                                type="radio"
                                name="sidebar-color"
                                id="sidebar-color-light"
                                value="light"
                                onChange={() => {
                                    setSidebarColor(("light"))
                                    document.body.setAttribute("data-sidebar", "light")
                                }}
                                checked={sidebarColor === "light"}
                            />
                            <label className="form-check-label" htmlFor="sidebar-color-light">
                                Light
                            </label>
                        </div>
                        <div className="form-check sidebar-setting">
                            <input
                                className="form-check-input"
                                type="radio"
                                name="sidebar-color"
                                id="sidebar-color-dark"
                                value="dark"
                                onChange={() => {
                                    setSidebarColor(("dark"))
                                    document.body.setAttribute("data-sidebar", "dark")
                                }}
                                checked={sidebarColor === "dark"}
                            />
                            <label className="form-check-label" htmlFor="sidebar-color-dark">
                                Dark
                            </label>
                        </div>
                        <div className="form-check sidebar-setting">
                            <input
                                className="form-check-input"
                                type="radio"
                                name="sidebar-color"
                                id="sidebar-color-colored"
                                value="colored"
                                onChange={() => {
                                    setSidebarColor(("colored"))
                                    document.body.setAttribute("data-sidebar", "colored")
                                }}
                                checked={sidebarColor === "colored"}
                            />
                            <label
                                className="form-check-label"
                                htmlFor="sidebar-color-colored"
                            >
                                Colored
                            </label>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default RightSide;
