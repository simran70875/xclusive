import images from "./imagesPath";

const SiteLoader = ({ hide }: { hide: boolean }) => {
    return (
        <div
            className={`fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-black text-white transition-all duration-600 ease-in-out
        ${hide ? 'translate-y-[-100%] opacity-0' : 'translate-y-0 opacity-100'}
      `}
        >
            {/* <img
                src="/loader.gif"
                alt="Loading workwear gear..."
                className="w-50 h-auto mb-6"
            /> */}
            <img
                src={images.logo_white}
                alt="Loading workwear gear..."
                className="w-100 h-auto mb-6 animate-pulse"
            />
            {/* <p className="text-lg font-semibold tracking-wide text-white animate-pulse">
                Gearing up... Safety in every step.
            </p> */}
        </div>
    );
};

export default SiteLoader;
