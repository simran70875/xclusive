import React from "react";

interface SectionHeadingProps {
    heading: React.ReactNode;
    description?: string;
    className?: string;
    uppercase?: boolean;
    tAlign?: string;

}

const SectionHeading: React.FC<SectionHeadingProps> = ({
    heading,
    description,
    className,
    uppercase = false,
    tAlign = false
}) => {
    return (
        <div className={className ?? `mb-10 md:mb:30 flex flex-col items-center ${tAlign ? tAlign : "text-center"} px-4 sm:px-6`}>
            <h2 className={`site-heading pb-10 ${tAlign ? tAlign : "text-center"} ${uppercase ? "uppercase" : ""}`}>
                {heading}
            </h2>
            <p className="app-text max-w-4xl">{description}</p>
        </div>
    );
};

export default SectionHeading;
