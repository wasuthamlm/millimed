import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { PlayCircle } from "@/components/ui/icons";
import { advertisements } from "@/data/advertisements";

export function AdvertisementsSection() {
  return (
    <section className="bg-slate-50 py-14 sm:py-20">
      <Container className="flex flex-col gap-10">
        <SectionHeading title="ภาพยนตร์โฆษณา" centered />
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
          {advertisements.map((ad) => (
            <a
              key={ad.youtubeId}
              href={`https://www.youtube.com/watch?v=${ad.youtubeId}`}
              target="_blank"
              rel="noopener noreferrer"
              className="group block overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm transition-shadow hover:shadow-lg"
            >
              <div className="relative aspect-video w-full overflow-hidden bg-slate-900">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={`https://img.youtube.com/vi/${ad.youtubeId}/hqdefault.jpg`}
                  alt={ad.title}
                  loading="lazy"
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 flex items-center justify-center bg-black/20 transition-colors group-hover:bg-black/35">
                  <PlayCircle className="h-14 w-14 text-white drop-shadow-lg" />
                </div>
              </div>
              <div className="p-4 text-center">
                <h3 className="text-base font-bold text-slate-900">{ad.title}</h3>
              </div>
            </a>
          ))}
        </div>
      </Container>
    </section>
  );
}
