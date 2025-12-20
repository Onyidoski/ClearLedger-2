// client/components/SkeletonLoader.tsx
export default function SkeletonLoader() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-pulse">
      {/* Fake Balance Card */}
      <div className="bg-gray-800/50 p-6 rounded-xl border border-gray-800 h-32">
        <div className="h-4 bg-gray-700 rounded w-1/3 mb-4"></div>
        <div className="h-8 bg-gray-700 rounded w-2/3 mb-2"></div>
        <div className="h-4 bg-gray-700 rounded w-1/4"></div>
      </div>

      {/* Fake Gas Card */}
      <div className="bg-gray-800/50 p-6 rounded-xl border border-gray-800 h-32">
        <div className="h-4 bg-gray-700 rounded w-1/3 mb-4"></div>
        <div className="h-8 bg-gray-700 rounded w-2/3 mb-2"></div>
        <div className="h-4 bg-gray-700 rounded w-1/4"></div>
      </div>

      {/* Fake Activity Section */}
      <div className="bg-gray-800/50 p-6 rounded-xl border border-gray-800 md:col-span-2 h-24">
        <div className="h-4 bg-gray-700 rounded w-1/4 mb-4"></div>
        <div className="h-6 bg-gray-700 rounded w-1/2"></div>
      </div>

      {/* Fake Chart */}
      <div className="bg-gray-800/50 rounded-xl border border-gray-800 md:col-span-2 h-64 mt-4"></div>
    </div>
  );
}