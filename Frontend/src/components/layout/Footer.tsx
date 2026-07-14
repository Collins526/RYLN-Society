import { Link } from "wouter";

export function Footer() {
  return (
    <footer className="bg-foreground text-background py-12 mt-auto">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-2">
            <h3 className="text-xl font-bold tracking-tight text-accent mb-4">Rift Youth Leadership Network</h3>
            <p className="text-muted/80 max-w-md">
              A purposeful, community-driven digital home for ambitious youth in the Rift Valley. 
              Connecting young leaders to meaningful programs and opportunities.
            </p>
          </div>
          <div>
            <h4 className="text-lg font-semibold mb-4 text-white">Quick Links</h4>
            <ul className="space-y-2">
              <li><Link href="/" className="text-muted/80 hover:text-accent transition-colors">Home</Link></li>
              <li><Link href="/about" className="text-muted/80 hover:text-accent transition-colors">About Us</Link></li>
              <li><Link href="/activities" className="text-muted/80 hover:text-accent transition-colors">Programs</Link></li>
              <li><Link href="/gallery" className="text-muted/80 hover:text-accent transition-colors">Gallery</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-lg font-semibold mb-4 text-white">Get Involved</h4>
            <ul className="space-y-2">
              <li><Link href="/register" className="text-muted/80 hover:text-accent transition-colors">Join as Member</Link></li>
              <li><Link href="/contact" className="text-muted/80 hover:text-accent transition-colors">Contact Us</Link></li>
            </ul>
          </div>
        </div>
        <div className="mt-12 pt-8 border-t border-muted/20 text-center text-muted/60 text-sm">
          <p>&copy; {new Date().getFullYear()} Rift Youth Leadership Network. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
