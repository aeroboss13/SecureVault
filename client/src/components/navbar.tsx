import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { cn } from "@/lib/utils";
import logoSrc from "@/assets/logo.png";

import { Button } from "@/components/ui/button";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";

import { 
  User, 
  LogOut, 
  Menu, 
  X, 
  LayoutDashboard, 
  History
} from "lucide-react";

export default function Navbar() {
  const [location] = useLocation();
  const { user, logoutMutation } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  const navigation = [
    { name: "Главная", href: "/", icon: LayoutDashboard },
    { name: "История", href: "/history", icon: History },
  ];
  
  const handleLogout = () => {
    logoutMutation.mutate();
  };
  
  return (
    <nav className="bg-primary-700 text-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <div className="flex-shrink-0 flex items-center">
              <img src={logoSrc} alt="FRESH" className="h-8 mr-2" />
              <span className="font-heading font-bold text-xl">Безопасный Доступ</span>
            </div>
            <div className="hidden md:ml-6 md:flex md:items-center md:space-x-4">
              {navigation.map((item) => (
                <Link key={item.name} href={item.href}>
                  <div className={cn(
                    "px-3 py-2 rounded-md text-sm font-medium transition duration-150 ease-in-out flex items-center cursor-pointer",
                    location === item.href 
                      ? "bg-primary-800" 
                      : "hover:bg-primary-600"
                  )}>
                    <item.icon className="h-4 w-4 mr-1.5" />
                    {item.name}
                  </div>
                </Link>
              ))}
            </div>
          </div>
          
          <div className="flex items-center">
            <div className="hidden md:block">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="text-white hover:bg-primary-600">
                    <User className="h-5 w-5 mr-1" />
                    <span>{user?.username}</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem disabled>
                    <User className="h-4 w-4 mr-2" />
                    <span>{user?.username}</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout}>
                    <LogOut className="h-4 w-4 mr-2" />
                    <span>Выйти</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            
            <div className="-mr-2 flex md:hidden">
              <Button 
                variant="ghost" 
                className="text-white hover:bg-primary-600"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                {mobileMenuOpen ? (
                  <X className="h-6 w-6" />
                ) : (
                  <Menu className="h-6 w-6" />
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-primary-800">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            {navigation.map((item) => (
              <Link key={item.name} href={item.href}>
                <div className={cn(
                  "block px-3 py-2 rounded-md text-base font-medium flex items-center cursor-pointer",
                  location === item.href 
                    ? "bg-primary-900 text-white" 
                    : "text-white hover:bg-primary-700"
                )}>
                  <item.icon className="h-5 w-5 mr-2" />
                  {item.name}
                </div>
              </Link>
            ))}
            <button
              onClick={handleLogout}
              className="w-full text-left block px-3 py-2 rounded-md text-base font-medium text-white hover:bg-primary-700 flex items-center"
            >
              <LogOut className="h-5 w-5 mr-2" />
              Выйти
            </button>
          </div>
        </div>
      )}
    </nav>
  );
}
