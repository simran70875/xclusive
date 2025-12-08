import React from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination } from "swiper/modules";
import images from "../components/imagesPath";

type Props = {};

const BrandLayout: React.FC<Props> = () => {
    return (
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
                        <img
                            src={images.brand1}
                            alt="Brand 1"
                            className="mx-auto h-10  object-contain"
                        />
                    </SwiperSlide>
                    <SwiperSlide>
                        <img
                            src={images.brand2}
                            alt="Brand 2"
                            className="mx-auto h-10  object-contain"
                        />
                    </SwiperSlide>
                    <SwiperSlide>
                        <img
                            src={images.brand3}
                            alt="Brand 3"
                            className="mx-auto h-10  object-contain"
                        />
                    </SwiperSlide>
                    <SwiperSlide>
                        <img
                            src={images.brand4}
                            alt="Brand 4"
                            className="mx-auto h-10  object-contain"
                        />
                    </SwiperSlide>
                </Swiper>
            </div>

            {/* Bottom Border */}
            <div className="border-b border-gray-200 w-full mt-8"></div>
        </div>
    );
};

export default BrandLayout;
