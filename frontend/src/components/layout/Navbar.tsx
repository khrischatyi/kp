import * as React from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";
import { Menu, X } from "lucide-react";

import { ToggleTheme } from "@/components/ui/toggle-theme";
import { cn } from "@/lib/utils";

const LINKS = [
  { to: "/", label: "Home" },
  { to: "/galleries", label: "Galleries" },
  { to: "/about", label: "About" },
  { to: "/careers", label: "Careers" },
  { to: "/contacts", label: "Contact" },
];

export function Navbar() {
  const { scrollY } = useScroll();
  const blur = useTransform(scrollY, [0, 120], [0, 14]);
  const bg = useTransform(scrollY, [0, 120], ["0", "0.75"]);
  const borderOpacity = useTransform(scrollY, [0, 120], [0, 0.6]);
  const [open, setOpen] = React.useState(false);
  const [scrolled, setScrolled] = React.useState(false);
  const location = useLocation();
  const isHome = location.pathname === "/";

  // Track scroll to flip navbar colors when over the dark hero
  React.useEffect(() => {
    const unsubscribe = scrollY.on("change", (v) => setScrolled(v > 80));
    return unsubscribe;
  }, [scrollY]);

  // When on homepage and not scrolled, use light text for dark hero bg
  const heroOverlay = isHome && !scrolled;

  // Close mobile menu on route change
  React.useEffect(() => setOpen(false), [location.pathname]);

  // Prevent body scroll when mobile menu is open
  React.useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  return (
    <>
      <motion.header
        style={{
          backdropFilter: blur.get() ? `saturate(140%) blur(${blur.get()}px)` : undefined,
        }}
        className="fixed inset-x-0 top-0 z-50"
      >
        <motion.div
          style={{
            backgroundColor: useTransform(bg, (v) => `hsl(var(--background) / ${v})`),
            borderColor: useTransform(borderOpacity, (v) => `hsl(var(--border) / ${v})`),
          }}
          className="border-b backdrop-blur-md transition-colors"
        >
          <div className="container flex h-16 items-center justify-between md:h-20">
            <Link
              to="/"
              className="group inline-flex flex-col font-display leading-none"
              aria-label="SCI Seattle Cabinets & Interiors — Home"
            >
              <span className={cn(
                "text-xl font-medium tracking-tight transition-colors duration-300 md:text-2xl",
                heroOverlay ? "text-white" : "text-foreground",
              )}>
                SCI
              </span>
              <span className={cn(
                "hidden text-[9px] uppercase tracking-widest2 transition-colors duration-300 group-hover:text-accent md:inline",
                heroOverlay ? "text-white/60" : "text-muted-foreground",
              )}>
                Seattle Cabinets &amp; Interiors
              </span>
            </Link>

            <div className="flex items-center gap-3">
              {/* Desktop nav */}
              <nav className="hidden items-center gap-7 md:flex">
                {LINKS.map((l) => (
                  <NavLink
                    key={l.to}
                    to={l.to}
                    end={l.to === "/"}
                    className={({ isActive }) =>
                      cn(
                        "relative text-[13px] uppercase tracking-widest2 transition-colors duration-300",
                        heroOverlay
                          ? isActive ? "text-white" : "text-white/60 hover:text-white"
                          : isActive ? "text-foreground" : "text-muted-foreground hover:text-foreground",
                      )
                    }
                  >
                    {({ isActive }) => (
                      <>
                        {l.label}
                        {isActive && (
                          <motion.span
                            layoutId="navbar-underline"
                            className="absolute -bottom-1 left-0 right-0 h-px bg-accent"
                            transition={{ type: "spring", stiffness: 380, damping: 30 }}
                          />
                        )}
                      </>
                    )}
                  </NavLink>
                ))}
              </nav>

              <ToggleTheme heroOverlay={heroOverlay} />
              <button
                type="button"
                aria-label={open ? "Close menu" : "Open menu"}
                aria-expanded={open}
                onClick={() => setOpen((s) => !s)}
                className={cn(
                  "inline-flex size-10 items-center justify-center rounded-full border transition-colors duration-300 md:hidden",
                  heroOverlay
                    ? "border-white/30 text-white hover:bg-white/10"
                    : "border-border/60 text-foreground hover:bg-foreground/[0.05]",
                )}
              >
                {open ? <X className="size-4" /> : <Menu className="size-4" />}
              </button>
            </div>
          </div>
        </motion.div>
      </motion.header>

      {/* Mobile drawer */}
      <AnimatePresence>
        {open && (
          <motion.div
            className="fixed inset-0 top-16 z-40 md:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
          >
            <motion.div
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -20, opacity: 0 }}
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              className="glass absolute inset-x-0 top-0 border-b border-border/60 px-6 pb-10 pt-8"
            >
              <nav className="flex flex-col gap-6">
                {LINKS.map((l, idx) => (
                  <motion.div
                    key={l.to}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.08 + idx * 0.05, duration: 0.5 }}
                  >
                    <NavLink
                      to={l.to}
                      end={l.to === "/"}
                      className={({ isActive }) =>
                        cn(
                          "font-display text-4xl tracking-tight transition-colors",
                          isActive ? "text-foreground" : "text-muted-foreground",
                        )
                      }
                    >
                      {l.label}
                    </NavLink>
                  </motion.div>
                ))}
              </nav>
              <div className="mt-10 border-t border-border/60 pt-6 text-xs uppercase tracking-widest2 text-muted-foreground">
                Monroe · Snohomish County · Greater Seattle
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
