import { Mail } from "lucide-react";
import { useState } from "react";
import SectionHeading from "../components/SectionHeading";

const NewsletterPage = () => {
    const [email, setEmail] = useState("");

    return (
        <div className="container-padding w-full h-screen flex flex-col items-center justify-center bg-white overflow-hidden px-4">
            
            {/* Heading */}
            <SectionHeading
                heading={
                    <>
                        Stay Informed & Protected <span className="span-word">Join Our Newsletter.</span>
                    </>
                }
                description="Get the latest updates on essential safety supplies, product launches, exclusive offers, and expert tips — straight to your inbox. Stay ahead, stay safe."

            />


            {/* Newsletter Input Container */}
            <div className="w-full max-w-4xl">
                <div className="relative flex items-center border-b border-gray-300 focus-within:border-purple-500 transition-colors">
                    {/* Left Icon */}
                    <Mail className="text-gray-500 w-6 h-6 mr-3" />

                    {/* Input */}
                    <input
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        type="email"
                        placeholder="Enter your email address..."
                        className="flex-1 bg-transparent focus:outline-none text-gray-600 text-lg md:text-xl py-2 placeholder-gray-300 placeholder:font-bold"
                    />

                    {/* Subscribe Button */}
                    {/* Subscribe Button with Slide-in */}
                    <div
                        className={`transition-all duration-300 ease-out transform ${email.trim()
                            ? "translate-x-0 opacity-100"
                            : "translate-x-4 opacity-0 pointer-events-none"
                            }`}
                    >
                        <button className="ml-3 text-sm md:text-base font-semibold text-primary hover:text-puple-500 transition-colors">
                            Subscribe
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default NewsletterPage;
