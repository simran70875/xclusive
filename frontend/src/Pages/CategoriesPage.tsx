// src/pages/CategoriesPage.tsx
import { ArrowRight, ChevronLeft, ChevronRight, Grid, Leaf, Truck } from "lucide-react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper/modules";
import images from "../components/imagesPath";
import OrangeOutlineButton from "../components/Button/OrangeOutlineButton";
import { splitCategory } from "../utils/splitText";
import { useLocation, useNavigate } from "react-router-dom";
import useCategories from "../hooks/useCat";
import { useEffect, useState } from "react";
import SkeletonBox from "../components/SkeletonBox";
import CardLayout from "../layouts/CardLayout";


const CategoriesPage = () => {
    const location = useLocation();
    const navigate = useNavigate();

    const { category, activeSubCategory } = location.state || {};
    const { categories, categoryLoading } = useCategories();
    const [selectedSubCategory, setSelectedSubCategory] = useState<any | null>(null);


    useEffect(() => {
        if (activeSubCategory) {
            setSelectedSubCategory(activeSubCategory);
        }
    }, [activeSubCategory]);

    return (
        <div className="w-full relative bg-white">
            <div className="mt-24 px-6 md:px-0 container-padding-mid">
                <div
                    className="container-padding relative h-[500px] md:h-[500px] p-0 bg-cover bg-center "
                    style={{ backgroundImage: `url(${images.new_arrivals})` }}>

                    <div className="bg-gradient-to-r from-gray-900 h-full w-full px-10 text-gray-100 flex flex-col justify-center">
                        <p className="text-3xl md:text-5xl font-extrabold mt-2 uppercase">
                            {
                                splitCategory(selectedSubCategory?.label ? selectedSubCategory.label : (category != "allCategories" && categories) ? category?.Category1 : "Top Categories")
                            }
                        </p>

                        <OrangeOutlineButton
                            className="mt-10"
                            label="Shop Now"
                            icon={<ArrowRight className="w-4 h-4" />}
                            onClick={() => {
                                category != "allCategories" ? navigate("/shop", { state: { category1: category?._id } }) : navigate("/shop")
                            }}
                        />

                    </div>

                </div>
            </div>


            {
                category == "allCategories" && <div className="container-padding pt-10 px-0">
                    <CardLayout
                        cardContent={categories}
                        loading={categoryLoading}
                    />
                </div>
            }


            <div className="container-padding md:p-0 container-padding-mid py-10">
                {/* Card Layout */}
                <div>
                    <div className="space-y-8">
                        {selectedSubCategory && (
                            <div className="flex flex-row items-center gap-2 mt-10">
                                <button
                                    className="text-sm text-gray-700 hover:underline"
                                    onClick={() => setSelectedSubCategory(null)}
                                >
                                    {category != "allCategories" && category?.Category1}
                                </button>

                                <span className="text-gray-500">{">"}</span>

                                <button
                                    onClick={() => setSelectedSubCategory(null)}
                                    className="text-sm text-pink-500 hover:underline"
                                >
                                    {selectedSubCategory.label}
                                </button>
                            </div>
                        )}


                        {
                            categoryLoading ? (
                                <div className="grid grid-cols-2 md:grid-cols-5 gap-6 mt-10">
                                    {Array.from({ length: 10 }).map((_, i) => (
                                        <SkeletonBox key={i} className="h-16 w-full" />
                                    ))}
                                </div>
                            ) : selectedSubCategory ? (
                                <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
                                    {selectedSubCategory.Categories3.map((item: any) => (
                                        <div
                                            key={item._id}
                                            onClick={() => {
                                                navigate("/shop", { state: { category1: category?._id, category2: selectedSubCategory?._id, category3: item._id } });
                                                window.scrollTo({ top: 0, behavior: "smooth" });
                                            }}
                                            className="cursor-pointer bg-gray-50 text-gray-700 px-3 overflow-hidden hover:bg-pink-400 hover:text-white shadow flex flex-col items-center justify-center"
                                        >
                                            <div className="w-full py-4 text-center">
                                                <p className="text-sm">{item.Category3}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="grid grid-cols-2 md:grid-cols-5 gap-6 mt-10">
                                    {category != "allCategories" && category?.Categories2.map((item: any, index: number) => (
                                        <div
                                            key={index}
                                            onClick={() => {
                                                if (item?.Categories3?.length > 0) {
                                                    setSelectedSubCategory(item);
                                                    window.scrollTo({ top: 0, behavior: "smooth" });
                                                } else {
                                                    navigate("/shop", { state: { category1: category?._id, category2: item._id } });
                                                    window.scrollTo({ top: 0, behavior: "smooth" });
                                                }
                                            }}
                                            className="cursor-pointer bg-gray-50 text-gray-700 px-3 overflow-hidden hover:bg-pink-400 hover:text-white shadow flex flex-col items-center justify-center"
                                        >
                                            <div className="w-full py-4 text-center">
                                                <p className="text-sm">{item.label}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )
                        }
                    </div>
                </div>
            </div>



            <div className="container-padding md:px-0 section-space">
                <div className="relative">
                    {/* Heading */}
                    <h2 className="font-bold text-lg mb-10 text-gray-700">
                        You may also like:
                    </h2>

                    {/* Navigation arrows */}
                    <div className="absolute top-1/2 -translate-y-1/2 left-0 md:-left-15 z-50 swiper-button-prev text-black hover:text-pink-500">
                        <ChevronLeft size={24} />
                    </div>
                    <div className="absolute top-1/2 -translate-y-1/2 right-0 md:-right-15 z-10 swiper-button-next text-black hover:text-pink-500">
                        <ChevronRight size={24} />
                    </div>

                    {/* Swiper itself */}
                    <Swiper
                        modules={[Navigation]}
                        navigation={{
                            nextEl: '.swiper-button-next',
                            prevEl: '.swiper-button-prev',
                        }}
                        spaceBetween={40}
                        loop={true}
                        breakpoints={{
                            0: { slidesPerView: 2 },
                            640: { slidesPerView: 2 },
                            768: { slidesPerView: 3 },
                            1024: { slidesPerView: 4 },
                        }}
                    >
                        {categoryLoading
                            ? Array.from({ length: 4 }).map((_, i) => (
                                <SwiperSlide key={i}>
                                    <SkeletonBox className="h-72 w-full mb-4" />
                                    <SkeletonBox className="h-4 w-1/2" />
                                </SwiperSlide>
                            ))
                            : categories?.map((item, index) => (
                                <SwiperSlide key={index}>
                                    <div className="flex flex-col cursor-pointer mb-5 group"
                                        onClick={() => {
                                            if (item?.Categories2?.length > 0) {
                                                navigate("/categories", { state: { category: item } });
                                                setSelectedSubCategory(null);
                                                window.scrollTo({ top: 0, behavior: 'smooth' });
                                            } else {
                                                navigate("/shop", { state: { category1: item?._id } });
                                                setSelectedSubCategory(null);
                                                window.scrollTo({ top: 0, behavior: 'smooth' });
                                            }
                                        }}
                                    >
                                        <div className="relative border border-[#f5f5f5] h-72 overflow-hidden flex items-center justify-center transition-transform duration-300 group-hover:scale-101">
                                            <img
                                                src={item.image}
                                                alt={item?.Category1}
                                                className="w-full h-40 object-contain"
                                            />
                                        </div>
                                        <p className="app-text h-auto mt-2">Category</p>
                                        <h3 className="text-sm text-gray-700 group-hover:text-pink-500 font-semibold mt-1">
                                            {item?.Category1}
                                        </h3>
                                    </div>
                                </SwiperSlide>
                            ))}
                    </Swiper>

                </div>
            </div>




            <div className="border-y border-gray-200 py:0 md:py-10 mb-20">
                <div className="container-padding px-4 grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-gray-200 text-left">

                    {/* Column 1 */}
                    <div className="flex flex-row-reverse md:flex-row items-center justify-around md:justify-center py-10 px-6 gap-4 h-full">
                        <Grid className="text-primary" size={50} />
                        <div>
                            <h4 className="font-semibold text-gray-800 uppercase">Certified Products</h4>
                            <p className="text-sm text-gray-600 mt-1">Quality assured for your peace of mind</p>
                        </div>
                    </div>

                    {/* Column 2 */}
                    <div className="flex flex-row-reverse md:flex-row items-center justify-around md:justify-center py-10 px-6 gap-4 h-full">
                        <Leaf className="text-primary" size={50} />
                        <div>
                            <h4 className="font-semibold text-gray-800 uppercase">1400+ Styles</h4>
                            <p className="text-sm text-gray-600 mt-1">Wide selection to suit every preference</p>
                        </div>
                    </div>

                    {/* Column 3 */}
                    <div className="flex flex-row-reverse md:flex-row items-center justify-around md:justify-center py-10 px-6 gap-4 h-full">
                        <Truck className="text-primary" size={50} />
                        <div>
                            <h4 className="font-semibold text-gray-800 uppercase">Fast & Reliable</h4>
                            <p className="text-sm text-gray-600 mt-1">Swift delivery and dependable service</p>
                        </div>
                    </div>

                </div>
            </div>



            <div className="bg-[#f5f5f5] py-16 md:py-30 relative overflow-hidden col-aligned-center">
                <div className="container-padding">
                    <div className="md:max-w-[64%] mx-auto flex flex-col items-center justify-center text-center">
                        <p className="text-gray-700 text-sm md:text-base font-semibold uppercase">
                            Your Trusted Workwear
                        </p>

                        <p className="site-heading mt-3 uppercase">
                            We’re Here to Help
                        </p>

                        <div className="w-20 h-2 bg-primary rounded-sm my-5 mx-auto"></div>

                        <p className="app-text">
                            At Work Safety, we value open communication and are always eager to assist you with any inquiries or concerns you may have. Whether you need more information about our products, have a question about an order, or simply want to share feedback, our team is ready to help.
                        </p>


                        <OrangeOutlineButton
                            className="mt-10"
                            label="Contact Us"
                            icon={<ArrowRight className="w-4 h-4" />}
                            onClick={() => console.log("Button clicked!")}
                        />


                    </div>
                </div>


            </div>






        </div>
    );
};

export default CategoriesPage;
