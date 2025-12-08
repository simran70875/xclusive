import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Navigation, Pagination } from "swiper/modules";
import CardLayout from "../layouts/CardLayout";
import images from "../components/imagesPath";
import SectionHeading from "../components/SectionHeading";
import OrangeOutlineButton from "../components/Button/OrangeOutlineButton";
import ProductGrid from "../layouts/ProductGrid";
import { useState } from "react";
import useProducts from "../hooks/useProduct";
import useFetch from "../hooks/useFetch";
import { API_PATHS, IMAGE_URL } from "../utils/config";
import useCategories from "../hooks/useCat";
import { useNavigate } from "react-router-dom";

interface bannerTypes {
    title: string,
    banner: string
}

interface Category {
    _id: string;
    image?: string;
    icon?: string;
    Category1?: string;
    Category2?: string;
    "Image Ref"?: string;
    Category1Id?: string;
    Category2Id?: string;
}

export interface ProductType {
    _id: string;
    Code: string;
    Description: string;
    Pack: number;
    rrp: number;
    GrpSupplier: string;
    GrpSupplierCode: string;
    Manufacturer: string;
    ManufacturerCode: string;
    ISPCCombined: number;
    VATCode: number;
    Brand: {
        Brand: string;
        _id?: string
    };
    ExtendedCharacterDesc: string;
    CatalogueCopy: string;
    ImageRef: string;
    Style: string;
    Category1: Category;
    Category2: Category;
    Category3: Category;
}

const reviews = [
    {
        title: "Andrew Wilson",
        destination: "Owner",
        description: `WorkSafety offers a huge variety of certified products to choose from. I especially appreciate their team, who stay in regular contact and make our lives easier with their quick and reliable service. Their professionalism and support have been invaluable.​`,
        img: images.review1,
    },
    {
        title: "Jonathan Stokes",
        destination: "Senior Buyer",
        description: `WorkSafety consistently delivers excellent service and high-quality products. Their team is thorough and makes ordering seamless. We now exclusively source all our PPE and office supplies from them and highly recommend their professionalism and reliability.`,
        img: images.review2,
    },
    {
        title: "Amelia Bosko",
        destination: "Procurement Manager",
        description: `After comparing suppliers, I was impressed by the savings WorkSafety offered. Beyond competitive pricing, their product quality is superb. Their service ensures we get high-quality PPE and office supplies at some of the best market rates. WorkSafety is now our trusted partner.​`,
        img: images.review3,
    },
];

const HomePage = () => {
    const navigate = useNavigate();

    //home page products
    const [page, setPage] = useState(1);
    const limit = 20;

    const { products, productLoading, totalPages } = useProducts({ page, limit, topSelling: true });

    //top banners
    const url = API_PATHS.TOP_BANNERS;
    const { data } = useFetch<bannerTypes[]>(url);
    const slides = data;

    //top categories
    const { categories, categoryLoading } = useCategories("Top");
    const topCategories = categories;

    return (
        <div className="w-full relative bg-white">
            <div>
                {slides && slides.length > 0 && (
                    <Swiper
                        modules={[Navigation, Autoplay, Pagination]}
                        slidesPerView={1}
                        loop={true}
                        autoplay={{
                            delay: 3000, // autoplay every 3 seconds
                            disableOnInteraction: false, // keep autoplay even if user interacts
                            pauseOnMouseEnter: true,
                        }}
                        pagination={{
                            clickable: true,
                        }}
                        navigation={{
                            nextEl: ".swiper-button-next",
                            prevEl: ".swiper-button-prev",
                        }}
                        breakpoints={{
                            768: { slidesPerView: 1 },
                            1024: { slidesPerView: 1 },
                        }}

                    >
                        {slides?.map((item, index) => (
                            <SwiperSlide key={index}>
                                <div onClick={() => {
                                    navigate("/shop")
                                }} className="mx-auto relative w-full cursor-pointer">
                                    <img
                                        src={`${IMAGE_URL + item.banner}`}
                                        alt="Banner"
                                        className="w-full h-auto object-fill"
                                    />
                                </div>
                            </SwiperSlide>
                        ))}

                        {/* Navigation Arrows */}
                        <div className="swiper-button-prev !text-black !bg-white w-5 h-5 md:w-12 md:h-12 rounded-full shadow-lg flex items-center justify-center absolute left-2 top-1/2 -translate-y-1/2 z-10">
                            <ChevronLeft className="w-4 h-4 md:w-6 md:h-6" />
                        </div>
                        <div className="swiper-button-next !text-black !bg-white w-5 h-5 md:w-12 md:h-12 rounded-full shadow-lg flex items-center justify-center absolute right-2 top-1/2 -translate-y-1/2 z-10">
                            <ChevronRight className="w-4 h-4 md:w-6 md:h-6" />
                        </div>

                    </Swiper>
                )}
            </div>

            <div className="container-padding section-space">
                {/* Heading */}
                <SectionHeading
                    heading={
                        <>
                            Shop By <span className="span-word">Categories.</span>
                        </>
                    }
                    description="Explore a comprehensive range of safety-focused supplies from PPE & Clothing to Janitorial essentials, Office Paper, Files & Binders, and more."

                />

                {/* Card Layout */}
                <div>
                    <CardLayout
                        cardContent={topCategories}
                        loading={categoryLoading}
                    />
                </div>
            </div>

            <div className="bg-[#f5f5f5] py-16 md:py-30 relative overflow-hidden  col-aligned-center">
                <div className="container-padding">
                    {/* Left Text Section */}
                    <div className="md:max-w-[64%]">
                        <p className="text-gray-700 text-sm md:text-base font-semibold uppercase">
                            Your Trusted Workwear
                        </p>

                        <p className="site-heading text-left mt-3 uppercase">
                            Gear Up for Safety with Confidence
                        </p>

                        <div className="w-20 h-2 bg-primary rounded-sm my-5"></div>

                        <p className="app-text">
                            Explore our range of top-tier workwear designed to keep you protected and comfortable on the job. From durable
                            safety boots to high-visibility apparel, Work-Safety ensures you have the right gear for every challenge.
                        </p>

                        <OrangeOutlineButton
                            className="mt-10"
                            label="View More"
                            icon={<ArrowRight className="w-4 h-4" />}
                            onClick={() => navigate("/about")}
                        />
                    </div>
                </div>

                {/* Right Image - Hidden on Mobile */}
                <div className="hidden md:block absolute right-0">
                    <img
                        src={images.full_width_1} // Replace with actual image path
                        alt="Xclusive Diamond Gear"
                        className="w-[550px] max-w-md object-contain"
                    />
                </div>

            </div>

            <div className="container-padding section-space">
                {/* Heading */}
                <SectionHeading
                    heading={
                        <>
                            Top Selling  <span className="span-word">Products.</span>
                        </>
                    }
                    description="Shop the best in safety and workplace essentials, featuring premium PPE, cleaning supplies, office organization, and more to power your productivity."
                />


                <ProductGrid products={products ?? []} loading={productLoading} gridCols={4} />


                <div className="flex justify-center mt-20 space-x-2">
                    <button
                        disabled={page === 1}
                        onClick={() => setPage((p) => Math.max(p - 1, 1))}
                        className="px-4 py-2 border text-sm rounded disabled:opacity-50"
                    >
                        Previous
                    </button>

                    <span className="px-4 py-2 text-sm">{`Page ${page} of ${totalPages}`}</span>

                    <button
                        disabled={page === totalPages}
                        onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
                        className="px-4 text-sm py-2 border rounded disabled:opacity-50"
                    >
                        Next
                    </button>
                </div>


            </div>

            <div className="bg-[#f5f5f5] relative">

                {/* Top Border */}
                <div className="border-t border-gray-200 w-full mb-8"></div>

                <div className="container-padding section-space py-10">
                    <Swiper
                        modules={[Navigation, Pagination]}
                        navigation={{
                            nextEl: ".swiper-button-next",
                            prevEl: ".swiper-button-prev",
                        }}
                        pagination={{ clickable: true }}
                        spaceBetween={20}
                        loop={true}
                        breakpoints={{
                            0: {
                                slidesPerView: 2,
                                slidesPerGroup: 2,
                            },
                            640: {
                                slidesPerView: 2,
                                slidesPerGroup: 2,
                            },
                            768: {
                                slidesPerView: 3,
                                slidesPerGroup: 3,
                            },
                            1024: {
                                slidesPerView: 4,
                                slidesPerGroup: 4,
                            },
                        }}
                        touchRatio={1}
                        allowTouchMove={true}
                    >

                        <SwiperSlide>
                            <img src={images.brand1} alt="Brand 1" className="mx-auto h-10 object-contain" />
                        </SwiperSlide>
                        <SwiperSlide>
                            <img src={images.brand2} alt="Brand 2" className="mx-auto h-10  object-contain" />
                        </SwiperSlide>
                        <SwiperSlide>
                            <img src={images.brand3} alt="Brand 3" className="mx-auto h-10  object-contain" />
                        </SwiperSlide>
                        <SwiperSlide>
                            <img src={images.brand4} alt="Brand 4" className="mx-auto h-10  object-contain" />
                        </SwiperSlide>
                    </Swiper>


                </div>

                {/* Bottom Border */}
                <div className="border-b border-gray-200 w-full mt-8"></div>
            </div>

            <div className="container-padding section-space">
                {/* Heading */}
                <SectionHeading
                    heading={
                        <>
                            Why Professionals <span className="span-word">Trust</span> Us
                        </>
                    }
                    description="From premium PPE to workplace essentials, our customers share how our top-quality products and service keep their teams safe, organized, and productive."

                />
                <Swiper
                    modules={[Navigation, Pagination]}
                    navigation={{
                        nextEl: ".swiper-button-next",
                        prevEl: ".swiper-button-prev",
                    }}
                    pagination={{ clickable: true }}
                    spaceBetween={20}

                    loop={false}
                    breakpoints={{
                        0: {
                            slidesPerView: 1,
                            slidesPerGroup: 1,
                        },
                        640: {
                            slidesPerView: 1.2,
                            slidesPerGroup: 1,
                        },
                        768: {
                            slidesPerView: 2,
                            slidesPerGroup: 2,
                        },
                        1024: {
                            slidesPerView: 3,
                            slidesPerGroup: 3,
                        },
                    }}
                    className="reviews-slider"
                >
                    {reviews.map((item, index) => {
                        const isCenterCard = index === 1;

                        return (
                            <SwiperSlide key={index} className="px-2">
                                <div
                                    className={`mb-10 p-5 flex flex-col  ${isCenterCard
                                        ? "text-white bg-gradient-to-r from-gray-900 via-gray-800 to-gray-700"
                                        : "bg-gradient-to-r from-gray-100 via-gray-200 via-white text-gray-700"
                                        } rounded-2xl shadow-lg overflow-hidden py-6`}>
                                    {/* <img
                                        src={item.img}
                                        alt="User"
                                        className="w-20 h-20 rounded-full object-cover mb-4"
                                    /> */}
                                    <p className="span-word">{item.title}</p>
                                    <p className={`text-[12px] mb-5 ${isCenterCard ? "text-gray-300" : "text-gray-700"}`}>{item.destination}</p>

                                    <p className={`app-text ${isCenterCard ? "text-gray-300" : "text-gray-700"}`}>{item.description}</p>

                                </div>
                            </SwiperSlide>
                        )
                    })}

                </Swiper>



            </div>

        </div>
    );
};

export default HomePage;
