import { Search } from "lucide-react";
import { useEffect } from "react";
import SectionHeading from "../components/SectionHeading";

const SearchPage = () => {
    useEffect(() => {
        // Disable scrolling
        const originalOverflow = document.body.style.overflow;
        document.body.style.overflow = "hidden";

        // Re-enable scrolling on unmount
        return () => {
            document.body.style.overflow = originalOverflow;
        };
    }, []);

    return (
        <div className="container-padding w-full h-screen flex flex-col items-center justify-center bg-white overflow-hidden px-4">

            {/* Heading */}
            <SectionHeading
                heading={
                    <>
                        Your Safety Starts Here — <span className="span-word">Search Now.</span>
                    </>
                }
                description="Explore a comprehensive range of safety-focused supplies — from PPE & Clothing to Janitorial essentials, Office Paper, Files & Binders, Computer Hardware, Catering disposables, and strong Adhesives & Tapes. Everything you need to keep your workplace clean, compliant, and protected."

            />


            {/* Search Bar Container */}
            <div className="w-full max-w-4xl">
                <div className="relative border-b border-gray-300 focus-within:border-pink-500 transition-colors">
                    <input
                        type="text"
                        placeholder="Search Product..."
                        className="w-full bg-transparent focus:outline-none text-gray-600 text-lg md:text-2xl py-2 pr-10 placeholder-gray-300 placeholder:font-bold"
                    />

                    <Search className="absolute right-0 top-1/2 -translate-y-1/2 text-gray-500 w-5 h-5" />
                </div>
            </div>
        </div>
    );
};

export default SearchPage;
