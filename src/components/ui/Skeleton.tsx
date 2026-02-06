type Props = {
  className?: string;
};

export default function Skeleton({ className = "" }: Props) {
  return <div className={`animate-pulse rounded-md border bg-black/5 ${className}`} />;
}
