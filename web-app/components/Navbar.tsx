import Link from "next/link";

export function Navbar() {
  return (
    <nav className="border-b">
      <div className="container flex h-14 items-center px-4">
        <div className="flex gap-6 font-medium">
          <Link href="/" className="transition-colors hover:text-foreground/80">
            Home
          </Link>
          <Link href="/onboarding" className="transition-colors hover:text-foreground/80">
            Get Started
          </Link>
          <Link href="/configuration" className="transition-colors hover:text-foreground/80">
            Configuration
          </Link>
        </div>
      </div>
    </nav>
  );
} 