import { Link } from "react-router-dom";
import { Instagram, Mail, MapPin, Phone } from "lucide-react";

export function Footer() {
  return (
    <footer className="relative mt-32 border-t border-border/60 bg-surface/50">
      <div className="container py-16 md:py-24">
        <div className="grid gap-12 md:grid-cols-12">
          <div className="md:col-span-5">
            <Link to="/" className="inline-flex items-baseline gap-2 font-display">
              <span className="text-2xl">Woodmore</span>
              <span className="text-xs uppercase tracking-widest2 text-muted-foreground">
                Kitchens LLC
              </span>
            </Link>
            <p className="mt-6 max-w-md font-display text-2xl leading-tight text-foreground/85 md:text-3xl">
              Heirloom cabinetry, made by hand in Monroe — for homes across the
              Greater Seattle area.
            </p>
          </div>

          <div className="md:col-span-3">
            <h4 className="text-xs uppercase tracking-widest2 text-muted-foreground">
              Navigate
            </h4>
            <ul className="mt-5 space-y-3 text-sm">
              <li><Link className="hover:text-accent transition-colors" to="/">Home</Link></li>
              <li><Link className="hover:text-accent transition-colors" to="/galleries">Galleries</Link></li>
              <li><Link className="hover:text-accent transition-colors" to="/contacts">Contact</Link></li>
            </ul>
          </div>

          <div className="md:col-span-4">
            <h4 className="text-xs uppercase tracking-widest2 text-muted-foreground">
              Studio
            </h4>
            <ul className="mt-5 space-y-3 text-sm">
              <li className="flex items-start gap-3 text-foreground/80">
                <MapPin className="mt-0.5 size-4 text-accent" />
                <span>
                  17631 147th St SE<br />
                  Monroe, WA 98272
                </span>
              </li>
              <li className="flex items-center gap-3 text-foreground/80">
                <Mail className="size-4 text-accent" />
                <a href="mailto:litwinshop@gmail.com" className="hover:text-accent">
                  litwinshop@gmail.com
                </a>
              </li>
              <li className="flex items-center gap-3 text-foreground/80">
                <Phone className="size-4 text-accent" />
                <a href="tel:+12068185057" className="hover:text-accent">
                  206.818.5057
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-16 flex flex-col items-start justify-between gap-3 border-t border-border/60 pt-6 text-xs uppercase tracking-widest2 text-muted-foreground md:flex-row md:items-center">
          <span>© {new Date().getFullYear()} Woodmore Kitchens LLC · All rights reserved.</span>
          <span>Crafted in Monroe, Washington</span>
        </div>
      </div>
    </footer>
  );
}
