import { Home, Users, ShoppingCart, Printer, Truck, Settings, Tractor, FileText, LogOut } from "lucide-react";
import { NavLink } from "react-router-dom";
import { cn } from "@/lib/utils";
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
    <div className="group fixed left-0 top-0 h-screen w-16 hover:w-60 bg-gradient-to-b from-[#047857] to-[#065F46] shadow-xl flex flex-col transition-all duration-300 z-50">
      {/* Logo */}
      <div className="flex h-16 items-center px-3 border-b border-white/10">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 backdrop-blur-sm flex-shrink-0">
          <Tractor className="h-6 w-6 text-white" />
        </div>
        <span className="ml-3 text-white font-semibold text-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap">
          FarmShip
        </span>
      </div>

      {/* Menu Items */}
      <nav className="flex flex-col gap-1 p-2 flex-1">
        {menuItems.map((item) => (
          <NavLink
            key={item.title}
            to={item.url}
            end
            className={({ isActive }) =>
              cn(
                "flex items-center gap-3 px-3 py-3 rounded-lg transition-all duration-200",
                isActive
                  ? "bg-white text-primary shadow-lg"
                  : "text-white hover:bg-white/10"
              )
            }
          >
            <item.icon className="h-5 w-5 flex-shrink-0" />
            <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap text-sm font-medium">
              {item.title}
            </span>
          </NavLink>
        ))}
      </nav>

      {/* Logout Button */}
      <div className="p-2 border-t border-white/10">
        <Button
          variant="ghost"
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-3 text-white hover:bg-white/10 hover:text-white rounded-lg justify-start"
        >
          <LogOut className="h-5 w-5 flex-shrink-0" />
          <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap text-sm font-medium">
            ログアウト
          </span>
        </Button>
      </div>
    </div>
  );
}
