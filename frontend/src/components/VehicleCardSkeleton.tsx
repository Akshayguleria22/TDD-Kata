const VehicleCardSkeleton = () => {
  return (
    <div className="bg-white border-2 border-foreground rounded-2xl shadow-pop overflow-hidden flex flex-col h-full relative p-5">
      {/* Skeleton for Title and Category */}
      <div className="flex justify-between items-start mb-3">
        <div className="w-full">
          {/* Title Skeleton */}
          <div className="h-6 w-3/4 rounded bg-foreground/10 animate-pulse relative overflow-hidden">
            <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/40 to-transparent animate-[shimmer_1.5s_infinite]"></div>
          </div>
          {/* Category Skeleton */}
          <div className="h-5 w-1/3 rounded-full bg-tertiary/20 border-2 border-foreground/10 mt-3 animate-pulse"></div>
        </div>
        {/* Price Skeleton */}
        <div className="h-8 w-24 rounded bg-accent/20 animate-pulse relative overflow-hidden"></div>
      </div>
      
      {/* Description Skeleton */}
      <div className="space-y-2 mt-4 flex-grow">
        <div className="h-3 w-full rounded bg-foreground/10 animate-pulse"></div>
        <div className="h-3 w-5/6 rounded bg-foreground/10 animate-pulse"></div>
      </div>

      {/* Footer Skeleton */}
      <div className="flex justify-between items-center mt-6 pt-4 border-t-2 border-foreground/10">
        <div className="h-4 w-24 rounded bg-foreground/10 animate-pulse"></div>
        <div className="h-10 w-28 rounded-full bg-foreground/10 animate-pulse"></div>
      </div>
    </div>
  );
};

export default VehicleCardSkeleton;
