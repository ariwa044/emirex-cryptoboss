import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu } from "lucide-react";
import { useState } from "react";
import fintrixLogo from "@/assets/fintrix-logo.jpg";
const Navigation = () => {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const navItems = [
    { href: "#home", label: "Home" },
    { href: "#about", label: "About" },
    { href: "#plans", label: "Plans" },
    { href: "#calculator", label: "Calculator" },
  ];

  const handleNavClick = (href: string) => {
    setOpen(false);
    const element = document.querySelector(href);
    element?.scrollIntoView({ behavior: "smooth" });
  };

  return <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <img src={fintrixLogo} alt="Fintrix Trade" className="w-10 h-10 rounded-lg object-contain" />
            <span className="text-xl font-bold text-foreground">
              Fintrix Trade
            </span>
          </div>

          <div className="hidden md:flex items-center gap-8">
            {navItems.map((item) => (
              <button
                key={item.href}
                onClick={() => handleNavClick(item.href)}
                className="text-foreground hover:text-primary transition-colors"
              >
                {item.label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-4">
            <Button variant="ghost" className="hidden md:inline-flex" onClick={() => navigate("/auth")}>
              Sign In
            </Button>
            <Button variant="gradient" className="hidden md:inline-flex shadow-lg" onClick={() => navigate("/auth")}>
              Get Started
            </Button>

            {/* Mobile Menu */}
            <Sheet open={open} onOpenChange={setOpen}>
              <SheetTrigger asChild className="md:hidden">
                <Button variant="ghost" size="icon">
                  <Menu className="h-6 w-6" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[300px]">
                <div className="flex flex-col gap-6 mt-8">
                  {navItems.map((item) => (
                    <button
                      key={item.href}
                      onClick={() => handleNavClick(item.href)}
                      className="text-left text-lg font-medium text-foreground hover:text-primary transition-colors"
                    >
                      {item.label}
                    </button>
                  ))}
                  <div className="pt-4 border-t border-border space-y-3">
                    <Button 
                      variant="ghost" 
                      className="w-full justify-start text-lg" 
                      onClick={() => {
                        setOpen(false);
                        navigate("/auth");
                      }}
                    >
                      Sign In
                    </Button>
                    <Button 
                      variant="gradient" 
                      className="w-full justify-start text-lg shadow-lg" 
                      onClick={() => {
                        setOpen(false);
                        navigate("/auth");
                      }}
                    >
                      Get Started
                    </Button>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </nav>;
};
export default Navigation;