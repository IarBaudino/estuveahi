import Image from "next/image";
import Link from "next/link";
import { siteConfig } from "@/config/site";
import { routes } from "@/config/routes";
import { cn } from "@/shared/lib/utils";

interface SiteLogoProps {
  className?: string;
  imageClassName?: string;
  showName?: boolean;
  nameClassName?: string;
  href?: string;
  size?: "sm" | "md" | "lg";
}

const sizeMap = {
  sm: { box: 28, className: "h-7 w-7" },
  md: { box: 32, className: "h-8 w-8" },
  lg: { box: 40, className: "h-10 w-10" },
} as const;

export function SiteLogo({
  className,
  imageClassName,
  showName = true,
  nameClassName,
  href = routes.home,
  size = "md",
}: SiteLogoProps) {
  const dimensions = sizeMap[size];

  const content = (
    <>
      <Image
        src={siteConfig.logo}
        alt={siteConfig.name}
        width={dimensions.box}
        height={dimensions.box}
        className={cn("shrink-0 rounded-sm object-contain", dimensions.className, imageClassName)}
        priority
      />
      {showName ? (
        <span
          className={cn(
            "text-headline-md font-bold tracking-tighter text-primary",
            nameClassName,
          )}
        >
          {siteConfig.name}
        </span>
      ) : null}
    </>
  );

  if (!href) {
    return (
      <div className={cn("inline-flex items-center gap-2.5", className)}>{content}</div>
    );
  }

  return (
    <Link
      href={href}
      className={cn("inline-flex items-center gap-2.5 transition-opacity hover:opacity-90", className)}
      aria-label={`${siteConfig.name} — inicio`}
    >
      {content}
    </Link>
  );
}
