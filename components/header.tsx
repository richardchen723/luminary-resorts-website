"use client"

import Link from "next/link"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Menu, X } from "lucide-react"
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu"

export function Header() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isMobileStayMenuOpen, setIsMobileStayMenuOpen] = useState(false)
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20)
    }
    // Set initial scroll state
    handleScroll()
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const cabins = [
    { name: "Moss", href: "/stay/moss" },
    { name: "Dew", href: "/stay/dew" },
    { name: "Sol", href: "/stay/sol" },
    { name: "Mist", href: "/stay/mist" },
  ]

  const navLinks = [
    { href: "/gallery", label: "Gallery" },
    { href: "/location", label: "Location" },
    { href: "/about", label: "About" },
    { href: "/faq", label: "FAQ" },
    { href: "/contact", label: "Contact" },
  ]

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isMounted && isScrolled 
            ? "bg-background/95 backdrop-blur-md shadow-sm" 
            : "bg-background/90 backdrop-blur-sm"
        }`}
      >
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-20">
            <Link href="/" className="flex items-center">
              <span className="text-2xl tracking-[0.15em] text-foreground font-medium">LUMINARY RESORTS</span>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center gap-8">
              <NavigationMenu viewport={false}>
                <NavigationMenuList>
                  <NavigationMenuItem>
                    <NavigationMenuTrigger className="text-sm tracking-wide text-foreground/80 hover:text-foreground data-[state=open]:text-foreground bg-transparent h-auto py-0">
                      Stay
                    </NavigationMenuTrigger>
                    <NavigationMenuContent>
                      <div className="w-[200px] p-2">
                        {cabins.map((cabin) => (
                          <NavigationMenuLink key={cabin.href} asChild>
                            <Link
                              href={cabin.href}
                              className="block select-none rounded-md px-3 py-2 text-sm leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                            >
                              {cabin.name}
                            </Link>
                          </NavigationMenuLink>
                        ))}
                      </div>
                    </NavigationMenuContent>
                  </NavigationMenuItem>
                </NavigationMenuList>
              </NavigationMenu>
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-sm tracking-wide text-foreground/80 hover:text-foreground transition-colors"
                >
                  {link.label}
                </Link>
              ))}
            </nav>

            {/* Desktop CTA */}
            <div className="hidden lg:flex items-center gap-4">
              <Button asChild size="lg" className="rounded-full">
                <Link href="#booking">Book Now</Link>
              </Button>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-2"
              aria-label="Toggle menu"
            >
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-40 lg:hidden bg-background pt-20">
          <nav className="container mx-auto px-4 py-8 flex flex-col gap-6">
            <div>
              <button
                onClick={() => setIsMobileStayMenuOpen(!isMobileStayMenuOpen)}
                className="text-xl text-foreground hover:text-foreground/70 transition-colors flex items-center gap-2"
              >
                Stay {isMobileStayMenuOpen ? "−" : "+"}
              </button>
              {isMobileStayMenuOpen && (
                <div className="ml-4 mt-2 flex flex-col gap-3">
                  {cabins.map((cabin) => (
                    <Link
                      key={cabin.href}
                      href={cabin.href}
                      onClick={() => {
                        setIsMobileMenuOpen(false)
                        setIsMobileStayMenuOpen(false)
                      }}
                      className="text-lg text-foreground/80 hover:text-foreground transition-colors"
                    >
                      {cabin.name}
                    </Link>
                  ))}
                </div>
              )}
            </div>
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setIsMobileMenuOpen(false)}
                className="text-xl text-foreground hover:text-foreground/70 transition-colors"
              >
                {link.label}
              </Link>
            ))}
            <Button asChild size="lg" className="w-full rounded-full mt-4">
              <Link href="#booking" onClick={() => setIsMobileMenuOpen(false)}>
                Book Now
              </Link>
            </Button>
          </nav>
        </div>
      )}
    </>
  )
}
