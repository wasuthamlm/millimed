import { Container } from "@/components/ui/Container";

export default function NewsLoading() {
  return (
    <div className="bg-slate-50">
      <Container className="flex flex-col gap-10 py-14 sm:py-20">
        <div className="flex flex-col items-center gap-3 text-center">
          <div className="h-8 w-64 animate-pulse rounded bg-slate-200" />
          <span className="h-1 w-16 rounded-full bg-brand-gold" aria-hidden="true" />
        </div>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="flex flex-col gap-3 rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
              <div className="aspect-[4/3] w-full animate-pulse rounded-xl bg-slate-200" />
              <div className="h-4 w-3/4 animate-pulse rounded bg-slate-200" />
              <div className="h-4 w-1/2 animate-pulse rounded bg-slate-200" />
            </div>
          ))}
        </div>
      </Container>
    </div>
  );
}
