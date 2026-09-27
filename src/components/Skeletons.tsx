import React from 'react';

interface SkeletonProps {
  count?: number;
  isCreator?: boolean;
}

export function ProductCardSkeleton({ isCreator = false }: { key?: React.Key; isCreator?: boolean }) {
  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl overflow-hidden border border-slate-100 dark:border-slate-800 shadow-sm flex flex-col justify-between animate-pulse select-none">
      {/* Aspect Square Image Shimmer */}
      <div className="relative aspect-square bg-slate-200/80 dark:bg-slate-800 overflow-hidden flex items-center justify-center">
        {/* Shimmer overlay gradient effect */}
        <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-white/20 dark:via-white/5 to-transparent" />
        {/* Category badge placeholder */}
        <div className="absolute bottom-2.5 right-2.5 h-4 w-16 bg-slate-300/80 dark:bg-slate-700/80 rounded-md" />
        {/* Discount badge placeholder */}
        <div className="absolute top-2.5 left-2.5 h-4 w-12 bg-slate-300/80 dark:bg-slate-700/80 rounded-md" />
      </div>

      {/* Details Area */}
      <div className="p-4 flex-1 flex flex-col justify-between space-y-4">
        <div className="space-y-2">
          {/* Subtitle / Category line */}
          {isCreator && (
            <div className="h-2.5 w-16 bg-indigo-100/70 dark:bg-indigo-950/50 rounded-full" />
          )}
          {/* Title lines */}
          <div className="h-4 bg-slate-200/90 dark:bg-slate-800 rounded-lg w-11/12" />
          <div className="h-3.5 bg-slate-200/60 dark:bg-slate-800/60 rounded-lg w-3/4" />
        </div>

        {/* Footer info: price + button */}
        <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="space-y-1.5">
            <div className="h-4.5 w-16 bg-emerald-100/80 dark:bg-emerald-900/30 rounded-md" />
            <div className="h-3 w-10 bg-slate-200/60 dark:bg-slate-800/60 rounded-md" />
          </div>

          <div className="w-8 h-8 bg-slate-200/80 dark:bg-slate-800 rounded-xl" />
        </div>
      </div>
    </div>
  );
}

export function ProductGridSkeleton({ count = 8, isCreator = false }: SkeletonProps) {
  const items = Array.from({ length: count }, (_, i) => i);
  return (
    <div 
      className={
        isCreator
          ? "grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6"
          : "grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6"
      }
    >
      {items.map((key) => (
        <ProductCardSkeleton key={key} isCreator={isCreator} />
      ))}
    </div>
  );
}

export function OrderCardSkeleton() {
  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl overflow-hidden border border-slate-100 dark:border-slate-800 shadow-xs flex flex-col justify-between p-5 space-y-4 animate-pulse">
      <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
        <div className="space-y-2">
          <div className="h-3 w-16 bg-slate-200 dark:bg-slate-800 rounded" />
          <div className="h-4 w-32 bg-slate-200 dark:bg-slate-800 rounded" />
        </div>
        <div className="h-6 w-20 bg-emerald-100 dark:bg-emerald-900/40 rounded-full" />
      </div>
      <div className="space-y-3 flex-1 py-1">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-slate-200 dark:bg-slate-800 rounded-xl shrink-0" />
          <div className="flex-1 space-y-2 min-w-0">
            <div className="h-3.5 w-3/4 bg-slate-200 dark:bg-slate-800 rounded" />
            <div className="h-3 w-1/3 bg-slate-200 dark:bg-slate-800 rounded" />
          </div>
        </div>
      </div>
      <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
        <div className="space-y-1.5">
          <div className="h-3 w-12 bg-slate-200 dark:bg-slate-800 rounded" />
          <div className="h-4 w-16 bg-emerald-100 dark:bg-emerald-900/30 rounded" />
        </div>
        <div className="h-8 w-24 bg-slate-200 dark:bg-slate-800 rounded-xl" />
      </div>
    </div>
  );
}
