import { ArrowRight } from "lucide-react";
import images from "../components/imagesPath";
import OrangeOutlineButton from "../components/Button/OrangeOutlineButton";
import BrandLayout from "../layouts/BrandLayout";
import SectionHeading from "../components/SectionHeading";

// src/pages/AboutPage.tsx
const AboutPage = () => {
    return (
        <>
            <div className="bg-[#f5f5f5] relative overflow-hidden  col-aligned-center">
                <div className="container-padding container-padding-mid flex">
                    {/* Left Text Section */}
                    <div className="flex-2 py-5 md:py-30">
                        <p className="site-heading text-left mb-3 uppercase">
                            About Us
                        </p>

                        <p className="text-gray-700 text-sm md:text-base font-semibold uppercase">
                            Gear Up for Safety with Confidence
                        </p>
                        <div className="w-20 h-2 bg-primary rounded-sm my-5"></div>

                        <OrangeOutlineButton
                            label="Explore Products"
                            icon={<ArrowRight className="w-4 h-4" />}
                            onClick={() => console.log("Button clicked!")}
                        />
                    </div>

                    {/* Right Image - Hidden on Mobile */}
                    <div className="flex-1">
                        <img
                            src={images.about_top} // Replace with actual image path
                            alt="Work Safety Gear"
                            className="max-w-md object-contain absolute bottom-0"
                        />
                    </div>

                </div>
            </div>

            <div className="container-padding container-padding-mid section-space">
                {/* Heading */}
                <SectionHeading
                    heading={
                        <>
                            About — <span className="span-word">WorkSafety.</span>
                        </>
                    }
                    description="Welcome to Work Safety, where safeguarding your work environment is our utmost priority. Our company was born out of a passion for providing top-tier workwear that ensures safety, comfort, and style for professionals across all industries. We understand that workwear is not just about protection; it’s about empowering you to perform your best, day in and day out."

                />

                <div className="flex items-center">
                    {/* Left Text Section */}
                    <div className="flex-1 py-5 md:py-30 md:pr-5 relative">
                        <div className="md:absolute top-0 md:top-16 left-0 md:-left-20 -z-10 about-index">
                            <p className="site-heading text-gray-100 text-7xl md:text-8xl text-left">01</p>
                        </div>
                        <div className="z-10">
                            <p className="span-word text-sm md:text-sm font-normal uppercase mb-3">
                                Our Mission
                            </p>
                            <p className="site-heading text-2xl text-left">
                                To deliver superior workwear solutions that prioritize your safety
                            </p>

                            <p className="app-text my-5">At Work Safety, our mission is clear: to deliver superior workwear solutions that prioritize your safety without compromising on style or comfort. We are dedicated to equipping you with the gear that allows you to focus on what truly matters—your work.</p>

                            {/* <div className="flex items-center">
                                <div className="w-20 h-1 bg-primary"></div>
                                <div className="flex-1 h-0.5 bg-gray-300"></div>
                            </div> */}
                        </div>
                    </div>

                    {/* Right Image - Hidden on Mobile */}
                    <div className="flex-1 hidden md:flex items-end justify-end">
                        <img
                            src={images.a1}
                            alt="Work Safety Gear"
                            className="max-w-md object-contain"
                        />
                    </div>

                </div>

                <div className="flex items-center">

                    {/* Right Image - Hidden on Mobile */}
                    <div className="flex-1 hidden md:flex items-start justify-start">
                        <img
                            src={images.a2}
                            alt="Work Safety Gear"
                            className="max-w-md object-contain"
                        />
                    </div>


                    {/* Left Text Section */}
                    <div className="flex-1 py-5 md:py-30 md:pl-5 relative">
                        <div className="md:absolute top-0 md:top-16 left-0 md:-left-20 -z-10 about-index">
                            <p className="site-heading text-gray-100 text-7xl md:text-8xl text-left">02</p>
                        </div>
                        <div className="z-10">
                            <p className="span-word text-sm md:text-sm font-normal uppercase mb-3">
                                Our Values
                            </p>
                            <p className="site-heading text-2xl text-left">
                                We continuously innovate to meet the evolving needs of our clients
                            </p>

                            <ul className="my-5">
                                <li className="app-text-normal mb-2"><span className="span-word font-semibold"> Safety First - </span>Every product we offer is designed with your safety in mind, adhering to the highest industry standards.</li>
                                <li className="app-text-normal mb-2"><span className="span-word font-semibold">Quality Assurance - </span> We use only the finest materials and craftsmanship to ensure our workwear withstands the harshest conditions.</li>
                                <li className="app-text-normal"><span className="span-word font-semibold">Innovation and Design - </span> Combining cutting-edge technology with modern aesthetics, we continuously innovate to meet the evolving needs of our clients.
                                </li>
                            </ul>


                            {/* <div className="flex items-center">
                                <div className="w-20 h-1 bg-primary"></div>
                                <div className="flex-1 h-0.5 bg-gray-300"></div>
                            </div> */}
                        </div>


                    </div>


                </div>

                <div className="flex items-center">
                    {/* Left Text Section */}
                    <div className="flex-1 py-5 md:py-30 md:pr-5 relative">
                        <div className="md:absolute top-0 md:top-16 left-0 md:-left-20 -z-10 about-index">
                            <p className="site-heading text-gray-100 text-7xl md:text-8xl text-left">03</p>
                        </div>
                        <div className="z-10">
                            <p className="span-word text-sm md:text-sm font-normal uppercase mb-3">
                                Our Products
                            </p>
                            <p className="site-heading text-2xl text-left">
                                Our comprehensive range of workwear is tailored to meet the diverse demands
                            </p>

                            <p className="app-text my-5">From heavy-duty safety boots to ergonomic high-visibility jackets, our comprehensive range of workwear is tailored to meet the diverse demands of various professions. Whether you’re in construction, logistics, or any other industry, Work Safety has you covered.</p>

                            {/* <div className="flex items-center">
                                <div className="w-20 h-1 bg-primary"></div>
                                <div className="flex-1 h-0.5 bg-gray-300"></div>
                            </div> */}
                        </div>


                    </div>

                    {/* Right Image - Hidden on Mobile */}
                    <div className="flex-1 hidden md:flex items-end justify-end">
                        <img
                            src={images.full_width_1}
                            alt="Work Safety Gear"
                            className="max-w-md object-contain"
                        />
                    </div>

                </div>

                <div className="flex items-center">

                    {/* Right Image - Hidden on Mobile */}
                    <div className="flex-1 hidden md:flex items-start justify-start">
                        <img
                            src={images.a4}
                            alt="Work Safety Gear"
                            className="max-w-md object-contain"
                        />
                    </div>


                    {/* Left Text Section */}
                    <div className="flex-1 py-5 md:py-30 md:pl-5 relative">
                        <div className="md:absolute top-0 md:top-16 left-0 md:-left-20 -z-10 about-index">
                            <p className="site-heading text-gray-100 text-7xl md:text-8xl text-left">04</p>
                        </div>
                        <div className="z-10">
                            <p className="span-word text-sm md:text-sm font-normal uppercase mb-3">
                                Our Team
                            </p>
                            <p className="site-heading text-2xl text-left">
                                We bring a wealth of knowledge and creativity to every product we create.
                            </p>
                            <p className="app-text my-5">Our team at Work Safety is a dynamic group of experts dedicated to revolutionizing the workwear industry. With backgrounds in safety engineering, fashion design, and customer service, we bring a wealth of knowledge and creativity to every product we create.</p>
                            <p className="site-heading text-2xl text-left">
                                Why Choose Work Safety?                            </p>
                            <ul className="my-5">
                                <li className="app-text-normal mb-2"><span className="span-word font-semibold">Proven Reliability - </span>Trusted by professionals across numerous sectors, our workwear is synonymous with reliability and performance.</li>
                                <li className="app-text-normal mb-2"><span className="span-word font-semibold">Customer-Centric Philosophy - </span> We value our customers’ feedback and continuously refine our offerings to better serve their needs.</li>
                                <li className="app-text-normal"><span className="span-word font-semibold">Commitment to Excellence - </span> Our commitment to excellence ensures that every piece of workwear not only meets but exceeds your expectations.
                                </li>
                            </ul>


                            {/* <div className="flex items-center">
                                <div className="w-20 h-1 bg-primary"></div>
                                <div className="flex-1 h-0.5 bg-gray-300"></div>
                            </div> */}
                        </div>
                    </div>
                </div>
            </div>

            <BrandLayout />
        </>
    )
};

export default AboutPage;
