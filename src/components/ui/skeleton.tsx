import { cn } from "@/lib/utils"
import * as React from "react"

// shadcn/ui skeleton primitive ------------------------------------------------
export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {}

function Skeleton({ className, ...props }: SkeletonProps) {
  return (
    <div
      className={cn("animate-pulse rounded-md bg-neutral-200/80 dark:bg-neutral-800/60", className)}
      {...props}
    />
  )
}

export { Skeleton }
