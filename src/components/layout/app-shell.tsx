import Link from "next/link";
import { BrainCircuit, CircleDot } from "lucide-react";

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
    <div className="app-frame">
      <header className="shell-header">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-5 py-4 lg:flex-row lg:items-center lg:justify-between">
          <Link href="/" className="flex items-center gap-3 font-semibold">
            <span className="brand-mark">
              <BrainCircuit className="h-5 w-5" aria-hidden />
            </span>
            <span>
              <span className="block text-base leading-5">长投罗盘</span>
              <span className="mt-0.5 flex items-center gap-1 text-xs font-normal text-muted-foreground">
                <CircleDot className="h-3 w-3 text-primary" aria-hidden />
                A 股价值投资工作台
              </span>
            </span>
          </Link>
          <nav className="flex flex-wrap gap-2 text-sm text-muted-foreground">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="nav-link"
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
      </header>
      <div className="mx-auto max-w-7xl px-5 py-8">{children}</div>
    </div>
  );
}
