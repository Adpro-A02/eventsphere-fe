import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { usePathname } from "next/navigation";
import { GiHamburgerMenu } from "react-icons/gi";
import { IoMdClose } from "react-icons/io";
import { useRouter } from "next/navigation";
import { HiUser } from "react-icons/hi2";
import { HiSparkles } from "react-icons/hi2";
import { HiCreditCard } from "react-icons/hi2";
import { isAdmin as checkIsAdmin } from "@/libs/auth/auth";

const Navbar: React.FC = () => {
  const router = useRouter();
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const pathname = usePathname();
  const isAdminRoute = pathname?.startsWith("/admin");
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const adminStatus = checkIsAdmin();
      setIsAdmin(adminStatus);
      if (isAdminRoute && pathname === "/admin" && !adminStatus) {
        router.push("/dashboard");
      }
    }
  }, [pathname, isAdminRoute, router]);

  if (
    pathname.startsWith("/login") ||
    pathname.startsWith("/register") ||
    pathname.startsWith("/unathorized")
  ) {
    return null;
  }
  const fullNavRoute = [
    { id: 1, href: "/ads", name: "Manajemen Iklan" },
    { id: 2, href: "/review", name: "Review" },
    { id: 3, href: "/event", name: "Event" },
    { id: 4, href: "/transaction", name: "Transaksi" },
    { id: 6, href: "/admin", name: "Admin", adminOnly: true },
  ];
  const NavRoute = fullNavRoute.filter((route) => !route.adminOnly || isAdmin);
  const fullAdminNavRoute = [
    {
      id: 1,
      href: "/admin",
      name: "Dashboard",
      icon: <HiUser className="text-xl" />,
      adminOnly: true,
    },
    {
      id: 2,
      href: "/admin/transactions",
      name: "Transactions",
      icon: <HiCreditCard className="text-xl" />,
      adminOnly: true,
    },
  ];
  const AdminNavRoute = fullAdminNavRoute.filter(
    (route) => !route.adminOnly || isAdmin,
  );

  if (isAdminRoute) {
    return (
      <>
        {/* Admin Navbar */}
        <nav className="z-[120] lg:w-64 lg:h-screen lg:fixed drop-shadow-sm">
          {/* Mobile hamburger for admin layout */}
          <div className="lg:hidden flex justify-between p-4 shadow-md">
            <HiSparkles className="text-3xl text-black" />
          </div>

          {/* Admin sidebar - always visible on desktop, toggleable on mobile */}
          <div
            className={`z-[115] fixed lg:static top-0 items-start left-0 w-64 pt-10 h-full shadow-lg bg-white flex flex-col gap-6 p-4 transition-all duration-300 ${isMobileOpen ? "translate-x-0" : "lg:translate-x-0 -translate-x-full"}`}
          >
            <div className="flex items-center justify-center gap-2 self-center">
              <span className="text-2xl font-bold text-black">EventSphere</span>
            </div>
            <div className="flex flex-col justify-between w-full h-full">
              <div className="w-full mt-4 flex flex-col gap-[15px]">
                {AdminNavRoute.map(({ id, href, name, icon }) => (
                  <Link key={id} href={href} className="w-full">
                    <div
                      className={`flex items-center gap-3 py-3 px-2 rounded-md ${pathname === href ? "bg-black text-white hover:bg-black/10" : "text-black hover:bg-black/10"}`}
                    >
                      {icon}
                      <span className="text-lg">{name}</span>
                    </div>
                  </Link>
                ))}
              </div>

              <div>
                <Button
                  variant="ghost"
                  className="flex items-center gap-2 px-4 py-3"
                  onClick={() => {
                    router.push("/dashboard");
                  }}
                >
                  Dashboard
                </Button>
              </div>
            </div>
          </div>

          <div
            className={`z-[110] lg:hidden fixed top-0 left-0 w-full h-full bg-black/50 transition-all duration-100 ${isMobileOpen ? "opacity-100" : "opacity-0 pointer-events-none"}`}
            onClick={() => setIsMobileOpen(false)}
          />
        </nav>
      </>
    );
  }

  return (
    <nav className="z-[120] sticky top-0 left-0 h-20 px-7 xl:px-16 2xl:px-20 py-3 lg:py-4 bg-white shadow flex flex-row w-full items-center justify-between">
      <Link href="/">
        <div className="relative flex items-center gap-2">
          <span className="text-xl xl:text-2xl font-semibold text-black hidden lg:block">
            EventSphere.
          </span>
          <HiSparkles className="text-3xl text-black block lg:hidden" />
        </div>
      </Link>

      <div className="max-lg:hidden flex flex-row gap-9">
        {NavRoute.map(({ id, href, name }) => (
          <Link
            key={id}
            href={href}
            target={href.startsWith("https://") ? "_blank" : undefined}
            rel={href.startsWith("https://") ? "noreferrer" : undefined}
          >
            <span
              className={`text-base font-normal text-gray-400 hover:text-gray-500 ${pathname?.startsWith(href) ? "text-black font-semibold" : ""}`}
            >
              {name}
            </span>
          </Link>
        ))}
      </div>

      {/* Mobile */}
      <div className="max-lg:flex hidden">
        <button
          className="text-2xl text-black"
          onClick={() => setIsMobileOpen(!isMobileOpen)}
        >
          {isMobileOpen ? <IoMdClose /> : <GiHamburgerMenu />}
        </button>
      </div>

      <div
        className={`fixed top-0 left-0 w-full h-full bg-black/50 z-50 transition-all duration-100 ${isMobileOpen ? "opacity-100" : "opacity-0 pointer-events-none"}`}
        onClick={() => setIsMobileOpen(false)}
      />

      <div
        className={`fixed top-0 items-center left-0 w-64 pt-10 h-full bg-white z-50 flex flex-col gap-4 p-4 transition-all duration-300 ${isMobileOpen ? "translate-x-0" : "-translate-x-full"}`}
      >
        {NavRoute.map(({ id, href, name }) => (
          <Link
            key={id}
            href={href}
            target={href.startsWith("https://") ? "_blank" : undefined}
            rel={href.startsWith("https://") ? "noreferrer" : undefined}
          >
            <span
              className={`text-lg font-normal text-gray-400 hover:text-gray-500 ${pathname?.startsWith(href) ? "text-black font-semibold" : ""}`}
            >
              {name}
            </span>
          </Link>
        ))}
      </div>
    </nav>
  );
};

export default Navbar;
