import { cn } from "../../lib/utils" // <-- THIS IS THE FIX

function Skeleton({
  className,
  ...props
}) {
  return (<div className={cn("animate-pulse rounded-md bg-muted", className)} {...props} />);
}

export { Skeleton }
