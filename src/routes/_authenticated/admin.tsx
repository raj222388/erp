import { createFileRoute, Link, Outlet, useNavigate, useRouterState } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import {
  LayoutDashboard, Settings, Users, Newspaper, Calendar, Images,
  MessageSquare, Star, HelpCircle, LogOut, Presentation, Menu, X, Bell, GraduationCap,
  UserCircle, School, BookOpen, IdCard,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/admin")({
  component: AdminLayout,
});

type Item = { to: string; label: string; icon: typeof LayoutDashboard; exact?: boolean };
const items: Item[] = [
  { to: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { to: "/admin/settings", label: "Site settings", icon: Settings },
  { to: "/admin/hero", label: "Hero slider", icon: Presentation },
  { to: "/admin/students", label: "Students", icon: UserCircle },
  { to: "/admin/id-cards", label: "Student ID Cards", icon: IdCard },
  { to: "/admin/teachers", label: "Teachers", icon: Users },
  { to: "/admin/classrooms", label: "Classrooms", icon: School },
  { to: "/admin/portal", label: "School portal", icon: BookOpen },
  { to: "/admin/news", label: "News", icon: Newspaper },
  { to: "/admin/events", label: "Events", icon: Calendar },
  { to: "/admin/gallery", label: "Gallery", icon: Images },
  { to: "/admin/testimonials", label: "Testimonials", icon: Star },
  { to: "/admin/faqs", label: "FAQs", icon: HelpCircle },
  { to: "/admin/notices", label: "Notices", icon: Bell },
  { to: "/admin/messages", label: "Messages", icon: MessageSquare },
];


function AdminLayout() {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const path = useRouterState({ select: (s) => s.location.pathname });

  const signOut = async () => {
    await supabase.auth.signOut();
    toast.success("Signed out");
    navigate({ to: "/auth" });
  };

  return (
    <div className="min-h-screen bg-surface flex">
      {/* Sidebar */}
      <aside className={`fixed lg:sticky top-0 h-screen w-64 bg-primary text-primary-foreground z-40 transition-transform lg:translate-x-0 print:hidden ${open ? "translate-x-0" : "-translate-x-full"}`}>
        <div className="p-5 flex items-center gap-3 border-b border-primary-foreground/10">
          <div className="h-9 w-9 rounded-full bg-gold text-gold-foreground grid place-items-center"><GraduationCap size={18} /></div>
          <div>
            <div className="font-display text-sm font-semibold">Greenfield</div>
            <div className="text-[10px] uppercase tracking-widest opacity-60">Admin</div>
          </div>
        </div>
        <nav className="p-3 space-y-0.5">
          {items.map((it) => {
            const active = it.exact ? path === it.to : path.startsWith(it.to);
            return (
              <Link
                key={it.to}
                to={it.to}
                onClick={() => setOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition ${active ? "bg-gold text-gold-foreground" : "hover:bg-primary-foreground/10"}`}
              >
                <it.icon size={16} />
                {it.label}
              </Link>
            );
          })}
        </nav>
        <div className="absolute bottom-0 left-0 right-0 p-3 border-t border-primary-foreground/10 space-y-1">
          <Link to="/" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm hover:bg-primary-foreground/10">
            View site →
          </Link>
          <button onClick={signOut} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm hover:bg-primary-foreground/10">
            <LogOut size={16} /> Sign out
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 min-w-0">
        <header className="lg:hidden sticky top-0 z-30 bg-background border-b border-border px-4 py-3 flex items-center justify-between print:hidden">
          <button onClick={() => setOpen(!open)}>{open ? <X /> : <Menu />}</button>
          <div className="font-display">Admin</div>
        </header>
        <main className="p-6 lg:p-10 max-w-6xl print:p-0 print:max-w-none">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
