import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { LayoutDashboard, Users, Package, Printer, Mail, Settings } from "lucide-react";

const Navigation = () => {
  const location = useLocation();

  const navItems = [
    { path: "/", label: "ダッシュボード", icon: LayoutDashboard },
    { path: "/customers", label: "顧客管理", icon: Users },
    { path: "/orders", label: "受注管理", icon: Package },
    { path: "/shipping", label: "送り状作成", icon: Printer },
    { path: "/mail", label: "宛名印刷", icon: Mail },
    { path: "/settings", label: "設定", icon: Settings },
  ];

  return (
    <nav className="border-b border-border bg-card">
      <div className="mx-auto max-w-7xl px-6">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center gap-2">
            <Package className="h-6 w-6 text-primary" />
            <span className="text-xl font-bold text-foreground">農作物販売管理</span>
          </div>
          <div className="flex gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={cn(
                    "flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
