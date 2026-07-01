import type { LandingStatItem } from "@/features/platform/infrastructure/platform-stats.repository";

interface LandingStatsSectionProps {
  stats: LandingStatItem[];
}

export function LandingStatsSection({ stats }: LandingStatsSectionProps) {
  if (stats.length === 0) return null;

  return (
    <section className="border-y border-white/5 bg-surface-container-low py-16 md:py-20">
      <div className="mx-auto grid max-w-container-max grid-cols-2 gap-12 px-margin-mobile text-center md:grid-cols-4 md:px-margin-desktop">
        {stats.map((stat) => (
          <div key={stat.label}>
            <p className="text-headline-lg mb-2 font-bold md:text-[40px]">{stat.value}</p>
            <p className="text-label-sm tracking-widest text-on-surface-variant/50">{stat.label}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
