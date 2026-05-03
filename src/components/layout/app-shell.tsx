import Link from "next/link";
import { BrainCircuit } from "lucide-react";

const navItems = [
  { href: "/", label: "学习地图" },
  { href: "/mentor", label: "AI 导师" },
  { href: "/training", label: "训练场" },
  { href: "/watchlist", label: "观察池" },
  { href: "/valuations", label: "估值工具" },
  { href: "/system", label: "投资系统" },
  { href: "/reviews", label: "复盘" },
  { href: "/settings", label: "设置" }
];

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen">
      <header className="border-b border-border bg-card">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-6 py-4 lg:flex-row lg:items-center lg:justify-between">
          <Link href="/" className="flex items-center gap-3 font-semibold">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <BrainCircuit className="h-5 w-5" aria-hidden />
            </span>
            <span>长投罗盘</span>
          </Link>
          <nav className="flex flex-wrap gap-2 text-sm text-muted-foreground">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="rounded-md px-3 py-2 transition hover:bg-muted hover:text-foreground"
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
      </header>
      <div className="mx-auto max-w-7xl px-6 py-8">{children}</div>
    </div>
  );
}
