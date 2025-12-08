const SkeletonBox = ({ className = "" }: { className?: string }) => (
    <div className={`bg-gray-200 animate-pulse rounded ${className}`}></div>
);

export default SkeletonBox;
