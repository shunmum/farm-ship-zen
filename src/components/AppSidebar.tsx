import { Home, Users, ShoppingCart, Printer, Truck, Settings, Tractor, FileText, LogOut } from "lucide-react";
import { NavLink } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";

const menuItems = [
  { title: "ダッシュボード", url: "/", icon: Home },
  { title: "顧客管理", url: "/customers", icon: Users },
  { title: "受注管理", url: "/orders", icon: ShoppingCart },
  { title: "送り状作成", url: "/shipping", icon: Printer },
  { title: "配送履歴", url: "/history", icon: Truck },
  { title: "請求書一括", url: "/invoices/batch", icon: FileText },
  { title: "設定", url: "/settings", icon: Settings },
];

export function AppSidebar() {
  const { signOut } = useAuth();

  const handleLogout = async () => {
    await signOut();
  };

  return (
    <div className="fixed left-0 top-0 h-screen w-20 bg-gradient-to-b from-[#047857] to-[#065F46] shadow-xl flex flex-col">
      <TooltipProvider delayDuration={0}>
        {/* Logo */}
        <div className="flex h-20 items-center justify-center border-b border-white/10">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/10 backdrop-blur-sm">
            <Tractor className="h-7 w-7 text-white" />
          </div>
        </div>

        {/* Menu Items */}
        <nav className="flex flex-col items-center gap-2 p-3 flex-1">
          {menuItems.map((item) => (
            <Tooltip key={item.title}>
              <TooltipTrigger asChild>
                <NavLink
                  to={item.url}
                  end
                  className={({ isActive }) =>
                    cn(
                      "flex h-14 w-14 items-center justify-center rounded-xl transition-all duration-200",
                      isActive
                        ? "bg-white text-primary shadow-lg scale-105"
                        : "text-white hover:bg-white/10 hover:scale-105"
                    )
                  }
                >
                  <item.icon className="h-6 w-6" />
                </NavLink>
              </TooltipTrigger>
              <TooltipContent side="right">
                <p>{item.title}</p>
              </TooltipContent>
            </Tooltip>
          ))}
        </nav>

        {/* Logout Button */}
        <div className="p-3 border-t border-white/10">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleLogout}
                className="h-14 w-14 text-white hover:bg-white/10 hover:text-white rounded-xl"
              >
                <LogOut className="h-6 w-6" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="right">
              <p>ログアウト</p>
            </TooltipContent>
          </Tooltip>
        </div>
      </TooltipProvider>
    </div>
  );
}
