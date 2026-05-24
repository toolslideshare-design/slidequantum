import { cn } from "@/lib/utils";

type AdminFieldProps = {
  label: string;
  children: React.ReactNode;
  className?: string;
};

export function AdminField({ label, children, className }: AdminFieldProps) {
  return (
    <label className={cn("block space-y-2", className)}>
      <span className="text-sm font-medium text-foreground">{label}</span>
      {children}
    </label>
  );
}

export function adminInputClassName() {
  return "w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-sm outline-none transition-colors focus:border-orange-500/50 focus:ring-2 focus:ring-orange-500/20";
}

export function adminTextareaClassName(rows = 4) {
  return cn(adminInputClassName(), `min-h-[${rows * 1.5}rem] resize-y`);
}
