// components/NoResults.jsx
import { Frown } from "lucide-react";

const NoResults = ({ message = "No products found!", description = "Try adjusting your search or filters.", icon = <Frown className="w-10 h-10 text-gray-400" /> }) => {
  return (
    <div className="flex flex-col items-center justify-center text-center p-6 py-10 rounded-2xl bg-gray-50">
      <div className="mb-3 animate-bounce">{icon}</div>
      <h2 className="text-xl font-semibold text-gray-700">{message}</h2>
      <p className="text-sm text-gray-500 mt-1">{description}</p>
    </div>
  );
};

export default NoResults;
