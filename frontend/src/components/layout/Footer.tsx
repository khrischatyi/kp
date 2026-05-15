import { Link } from "react-router-dom";
import { Instagram, Mail, MapPin, Phone } from "lucide-react";

export function Footer() {
  return (
    <footer className="relative mt-32 border-t border-border/60 bg-surface/50">
      <div className="container py-16 md:py-24">
        <div className="grid gap-12 md:grid-cols-12">
          <div className="md:col-span-5">
            <Link to="/" className="inline-flex items-baseline gap-2 font-display">
              <span className="text-2xl">Atelier</span>
              <span className="text-xs uppercase tracking-widest2 text-muted-foreground">
                Kitchens
              </span>
            </Link>
            <p className="mt-6 max-w-md font-display text-2xl leading-tight text-foreground/85 md:text-3xl">
              Heirloom cabinetry, made by hand for the Pacific Northwest's most considered homes.
            </p>
          </div>

          <div className="md:col-span-3">
            <h4 className="text-xs uppercase tracking-widest2 text-muted-foreground">
              Navigate
            </h4>
            <ul className="mt-5 space-y-3 text-sm">
              <li><Link className="hover:text-accent transition-colors" to="/">Home</Link></li>
              <li><Link className="hover:text-accent transition-colors" to="/kitchens">Kitchens</Link></li>
              <li><Link className="hover:text-accent transition-colors" to="/galleries">Galleries</Link></li>
              <li><Link className="hover:text-accent transition-colors" to="/contacts">Contact</Link></li>
            </ul>
          </div>

          <div className="md:col-span-4">
            <h4 className="text-xs uppercase tracking-widest2 text-muted-foreground">
              Studio
            </h4>
            <ul className="mt-5 space-y-3 text-sm">
              <li className="flex items-center gap-3 text-foreground/80">
                <MapPin className="size-4 text-accent" />
                Seattle · Bellevue · Mercer Island
              </li>
              <li className="flex items-center gap-3 text-foreground/80">
                <Mail className="size-4 text-accent" />
                <a href="mailto:hello@atelierkitchens.com" className="hover:text-accent">
                  hello@atelierkitchens.com
                </a>
              </li>
              <li className="flex items-center gap-3 text-foreground/80">
                <Phone className="size-4 text-accent" />
                <a href="tel:+12065551234" className="hover:text-accent">
                  +1 (206) 555 · 1234
                </a>
              </li>
              <li className="flex items-center gap-3 text-foreground/80">
                <Instagram className="size-4 text-accent" />
                <a href="#" className="hover:text-accent">@atelier.kitchens</a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-16 flex flex-col items-start justify-between gap-3 border-t border-border/60 pt-6 text-xs uppercase tracking-widest2 text-muted-foreground md:flex-row md:items-center">
          <span>© {new Date().getFullYear()} Atelier Kitchens · All rights reserved.</span>
          <span>Crafted in Seattle</span>
        </div>
      </div>
    </footer>
  );
}
