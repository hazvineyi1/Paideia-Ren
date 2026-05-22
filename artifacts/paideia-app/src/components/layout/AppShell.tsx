import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import type { ReactNode } from "react";
import { LayoutDashboard, FileText, ClipboardList, MessageSquare, HelpCircle, BookOpen, Users, Settings, LogOut } from "lucide-react";

const NAV = [
  { path: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { path: "/plans/new", label: "Lesson planner", icon: FileText },
  { path: "/worksheets/new", label: "Worksheet generator", icon: ClipboardList },
  { path: "/parent-drafts/new", label: "Parent update", icon: MessageSquare },
  { path: "/quizzes/new", label: "Quiz and exit tickets", icon: HelpCircle },
  { path: "/classes", label: "Classes and students", icon: Users },
  { path: "/samples", label: "Samples library", icon: BookOpen },
  { path: "/settings", label: "Settings", icon: Settings },
];

export function AppShell({ children }: { children: ReactNode }) {
  const { teacher, signOut } = useAuth();
  const [loc, setLoc] = useLocation();

  const onSignOut = async () => {
    await signOut();
    setLoc("/login");
  };

  return (
    <div className="min-h-screen flex bg-background">
      <aside className="w-64 shrink-0 border-r bg-card flex flex-col no-print">
        <div className="p-6 border-b">
          <Link href="/dashboard" className="block">
            <div className="font-serif text-2xl text-primary leading-tight">Paideia-Ren</div>
            <div className="text-xs tracking-wider uppercase text-muted-foreground mt-1">Teacher co-pilot</div>
          </Link>
        </div>
        <nav className="flex-1 p-3 space-y-1">
          {NAV.map((item) => {
            const Icon = item.icon;
            const active = loc === item.path || (item.path !== "/dashboard" && loc.startsWith(item.path.replace("/new", "")));
            return (
              <Link
                key={item.path}
                href={item.path}
                className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm transition ${
                  active
                    ? "bg-primary text-primary-foreground"
                    : "text-foreground hover:bg-secondary"
                }`}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="p-3 border-t">
          <div className="px-3 py-2 mb-1">
            <div className="text-sm font-medium truncate">{teacher?.name}</div>
            <div className="text-xs text-muted-foreground truncate">{teacher?.email}</div>
          </div>
          <button
            onClick={onSignOut}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm text-muted-foreground hover:bg-secondary"
          >
            <LogOut className="h-4 w-4" />
            Sign out
          </button>
        </div>
      </aside>
      <main className="flex-1 min-w-0">
        <div className="max-w-5xl mx-auto px-8 py-10">{children}</div>
      </main>
    </div>
  );
}
