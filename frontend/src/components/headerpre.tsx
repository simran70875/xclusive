import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Search, ShoppingCart, User, Menu, ChevronDown } from "lucide-react";
import clsx from "clsx";

const HeaderPre = () => {
    const [menuOpen, setMenuOpen] = useState(false);
    const [shopOpen, setShopOpen] = useState(false);
    const { pathname } = useLocation();

    const navItems = [
        { name: "Home", path: "/" },
        { name: "About", path: "/about" },
        {
            name: "Shop",
            dropdown: true,
            subItems: [
                "PPE & Clothing",
                "Paper",
                "Janitorial",
                "Files Pockets Binders",
                "Computer Hardware",
                "Catering",
                "Adhesives & Tapes",
            ],
        },
        { name: "Categories", path: "/categories" },
        { name: "Contact", path: "/sendQuotation" },
    ];

    const navigate = useNavigate();
    return (
        <>
            {/* Header */}
            <header className="bg-white shadow-[0_4px_20px_rgba(38,38,38,0.1)] fixed top-0 w-full z-50">
                <nav className="container mx-auto flex items-center justify-between h-16">
                    {/* Mobile menu button */}
                    <div className="flex-1 flex md:hidden">
                        <button onClick={() => setMenuOpen(true)} aria-label="Open menu">
                            <Menu className="w-6 h-6 text-gray-700" />
                        </button>
                    </div>

                    {/* Logo */}
                    <div className="flex-1 flex justify-center md:justify-start">
                        <Link to="/" className="font-bold text-xxl md:text-lg text-gray-800">
                            WorkSafety<span className="w-1 h-1 bg-primary inline-block" />
                        </Link>
                    </div>

                    {/* Desktop nav */}
                    <div className="flex-1 hidden md:flex justify-center space-x-16 items-center h-full">
                        {navItems.map((item) =>
                            item.dropdown ? (
                                <div key={item.name} className="relative group h-full">
                                    <button className="nav-link flex items-center gap-1">
                                        {item.name}
                                        <ChevronDown className="w-4 h-4 text-gray-600 group-hover:rotate-180 transition-transform" />
                                    </button>
                                    <div className="absolute left-0 bg-white shadow-md border border-gray-200 z-50 hidden group-hover:block min-w-[200px]">
                                        <ul className="flex flex-col py-2">
                                            {item.subItems?.map((label) => (
                                                <li key={label}>
                                                    <Link
                                                        to={`/shop/${label.toLowerCase().replace(/ & /g, "-").replace(/\s+/g, "-")}`}
                                                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-pink-50 hover-item"
                                                    >
                                                        {label}
                                                    </Link>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>
                            ) : item.path ? (
                                <Link key={item.path} to={item.path} className="nav-link">
                                    {item.name}
                                </Link>
                            ) : null
                        )}

                    </div>

                    {/* Right icons */}
                    <div className="flex-1 flex justify-end items-center space-x-4">
                        <div className="hidden md:flex space-x-6">
                            <Search onClick={() => {
                                navigate("/search");
                            }} className="icon-btn" />
                            <User onClick={() => {
                                navigate("/account");
                            }} className="icon-btn" />
                        </div>
                        <ShoppingCart className="icon-btn" />
                    </div>
                </nav>
            </header>

            {/* Sidebar Menu (Mobile) */}
            <div
                className={clsx(
                    "fixed top-0 left-0 h-full w-64 bg-gray-900 text-white z-50 transform transition-transform duration-300",
                    menuOpen ? "translate-x-0" : "-translate-x-full"
                )}
            >
                <div className="flex flex-col h-full">
                    <div className="flex flex-col h-full p-6 space-y-6">
                        {/* Logo */}
                        <Link
                            to="/"
                            onClick={() => setMenuOpen(false)}
                            className="text-2xl font-bold text-white"
                        >
                            WorkSafety<span className="w-1 h-1 bg-primary inline-block"></span>
                        </Link>

                        {/* Navigation Items */}
                        <nav className="flex flex-col space-y-4 mt-4">
                            {navItems.map(({ name, path, dropdown, subItems }) => {
                                const isActive = pathname === path;

                                if (dropdown) {
                                    return (
                                        <div key={name} className="flex flex-col">
                                            <button
                                                onClick={() => setShopOpen(!shopOpen)}
                                                className="flex justify-between items-center text-left w-full text-base text-white/80 hover:text-white"
                                            >
                                                {name}
                                                <ChevronDown
                                                    className={clsx(
                                                        "w-4 h-4 transition-transform",
                                                        shopOpen && "rotate-180"
                                                    )}
                                                />
                                            </button>
                                            {shopOpen && (
                                                <ul className="ml-4 mt-2 space-y-1">
                                                    {subItems?.map((label) => (
                                                        <li key={label} className="my-5">
                                                            <Link
                                                                to={`/shop/${label.toLowerCase().replace(/ & /g, "-").replace(/\s+/g, "-")}`}
                                                                onClick={() => setMenuOpen(false)}
                                                                className="block text-sm text-white/70 hover:text-white"
                                                            >
                                                                {label}
                                                            </Link>
                                                        </li>
                                                    ))}
                                                </ul>
                                            )}
                                        </div>
                                    );
                                }

                                return path ? (
                                    <Link
                                        key={name}
                                        to={path}
                                        onClick={() => setMenuOpen(false)}
                                        className={clsx(
                                            "transition-all",
                                            isActive
                                                ? "text-xl font-semibold"
                                                : "text-base text-sm text-white/80 hover:text-white"
                                        )}
                                    >
                                        {name}
                                    </Link>
                                ) : null;
                            })}
                        </nav>
                    </div>

                    {/* My Account at bottom */}
                    <Link
                        to="/account"
                        onClick={() => setMenuOpen(false)}
                        className="mt-auto w-full bg-black text-white py-4 px-6 text-center cursor-pointer block"
                    >
                        My Account
                    </Link>
                </div>
            </div>

            {/* Overlay */}
            {menuOpen && (
                <div
                    onClick={() => setMenuOpen(false)}
                    className="fixed inset-0 bg-opacity-40 z-40"
                />
            )}
        </>
    );
};

export default HeaderPre;
