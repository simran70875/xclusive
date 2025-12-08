import React, { useRef } from "react";
import type { FC } from "react";
import { splitCategory } from "../utils/splitText";
import type { CategoryType } from "../hooks/useCat";
import { useNavigate } from "react-router-dom";


type CardProps = {
    cardContent: CategoryType[];
    loading?: boolean;
};


const SkeletonMainCard = () => (
    <div className="animate-pulse flex flex-row bg-gray-100 rounded-2xl shadow-lg py-6">
        <div className="p-6 flex-1">
            <div className="h-4 bg-gray-300 rounded w-1/4 mb-4"></div>
            <div className="h-6 bg-gray-300 rounded w-3/4 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/3"></div>
        </div>
        <div className="flex-1 flex items-center justify-center">
            <div className="w-24 h-24 bg-gray-300 rounded-full"></div>
        </div>
    </div>
);

const SkeletonExtraCard = () => (
    <div className="animate-pulse flex flex-col justify-between items-center bg-white rounded-2xl shadow-lg h-72">
        <div className="flex-1 flex items-center justify-center w-full px-4">
            <div className="w-28 h-28 bg-gray-300 rounded-full"></div>
        </div>
        <div className="w-full py-4 text-center">
            <div className="h-4 bg-gray-300 rounded w-1/2 mx-auto"></div>
        </div>
    </div>
);


const CardLayout: FC<CardProps> = ({ cardContent, loading }) => {
    const mainCards = cardContent?.slice(0, 3);
    const extraCards = cardContent?.slice(3);

    // Refs to store animation frames & elements
    const animationFrames = useRef<{ [key: string]: number }>({});
    const imageRefs = useRef<{ [key: string]: HTMLImageElement | null }>({});

    // Handle mouse move with requestAnimationFrame to update transform directly
    const handleMouseMove = (key: string, e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
        if (!imageRefs.current[key]) return;

        const rect = e.currentTarget.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width - 0.5) * 15; // max 15px translation left/right
        const y = ((e.clientY - rect.top) / rect.height - 0.5) * 15; // max 15px translation up/down

        if (animationFrames.current[key]) {
            cancelAnimationFrame(animationFrames.current[key]);
        }

        animationFrames.current[key] = requestAnimationFrame(() => {
            if (imageRefs.current[key]) {
                imageRefs.current[key]!.style.transform = `translate3d(${x}px, ${y}px, 0)`;
            }
        });
    };

    // Reset transform on mouse leave
    const handleMouseLeave = (key: string) => {
        if (animationFrames.current[key]) {
            cancelAnimationFrame(animationFrames.current[key]);
        }
        if (imageRefs.current[key]) {
            imageRefs.current[key]!.style.transform = "translate3d(0, 0, 0)";
        }
    };

    const navigate = useNavigate();

    return (
        <div className="space-y-8">
            {/* First 3 Styled Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {loading
                    ? [1, 2, 3].map((_, i) => <SkeletonMainCard key={`skel-main-${i}`} />)
                    : mainCards.map((item, index) => {
                        const isCenterCard = index === 1;
                        const key = `main-${index}`;

                        return (
                            <div
                                onClick={() => {
                                    if (item?.Categories2?.length > 0) {
                                        navigate("/categories", {
                                            state: { category: item }
                                        });
                                    } else {
                                        navigate("/shop", {
                                            state: { category1: item._id }
                                        })
                                    }
                                }}
                                key={key}
                                className={`group cursor-pointer flex flex-row ${isCenterCard
                                    ? "bg-gradient-to-r from-gray-100 via-gray-200 via-white text-gray-700"
                                    : "text-white bg-gradient-to-r from-gray-900 via-gray-800 to-gray-700"
                                    }  shadow-lg overflow-hidden py-6`}
                                onMouseMove={(e) => handleMouseMove(key, e)}
                                onMouseLeave={() => handleMouseLeave(key)}
                            >
                                <div className="p-6 flex-1 flex flex-col justify-center">
                                    <p className="text-primary font-semibold">Top Category</p>
                                    <p className="text-2xl md:text-3xl font-extrabold mt-2">{splitCategory(item.Category1)}</p>
                                    <div className="mt-4">
                                        <p className={`uppercase nav-link-2 ${isCenterCard ? "text-gray-700" : "text-gray-300"}`}>
                                            View All
                                        </p>
                                    </div>
                                </div>
                                <div className="flex-1 flex items-center justify-center overflow-hidden">
                                    <img
                                        ref={(el) => {
                                            imageRefs.current[key] = el;
                                        }}
                                        src={item.image}
                                        alt={item.Category1}
                                        className="w-20 h-20 md:w-30 md:h-30 object-cover rounded-full transition-transform duration-300 mr-4"
                                        style={{ transform: "translate3d(0,0,0)" }}
                                    />

                                </div>
                            </div>
                        );
                    })}
            </div>

            {/* Extra cards with same hover effect */}
            {loading

                ? <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-6">
                    {[1, 2, 3, 4].map((_, i) => <SkeletonExtraCard key={`skel-extra-${i}`} />)}
                </div>
                : extraCards.length > 0 && (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-6">
                        {extraCards.map((item, index) => {
                            const key = `extra-${index}`;
                            return (
                                <div
                                    onClick={() => {
                                        if (item?.Categories2?.length > 0) {
                                            navigate("/categories", {
                                                state: { category: item }
                                            });
                                        } else {
                                            navigate("/shop", {
                                                state: { category1: item._id }
                                            })
                                        }
                                    }}
                                    key={key}
                                    className="group cursor-pointer flex flex-col justify-between items-center bg-gradient-to-b from-gray-50 via-white via-white text-gray-700 shadow-lg overflow-hidden h-72"
                                    onMouseMove={(e) => handleMouseMove(key, e)}
                                    onMouseLeave={() => handleMouseLeave(key)}
                                >
                                    <div className="flex-1 flex items-center justify-center w-full px-4 overflow-hidden">
                                        <img
                                            ref={(el) => {
                                                imageRefs.current[key] = el;
                                            }}
                                            src={item.image}
                                            alt={item.Category1}
                                            className="max-h-50 object-contain transition-transform duration-300"
                                            style={{ transform: "translate3d(0,0,0)" }}
                                        />
                                    </div>
                                    <div className="w-full py-4 text-center">
                                        <p className="font-semibold group-hover:text-pink-500 uppercase tracking-wide text-sm md:text-[16px]">{item.Category1}</p>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
        </div>
    );
};

export default CardLayout;
