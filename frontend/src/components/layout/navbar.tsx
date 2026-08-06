'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, useScroll, useSpring } from 'framer-motion';
import { HeartHandshake, Menu, X, Search, UserPlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/ui/theme-toggle'; // 1. Import ThemeToggle

export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 100, damping: 30 });

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 transition-all duration-300">
      {/* Scroll Progress Indicator */}
      <motion.div
        className="h-1 bg-linear-to-r from-crimson-600 to-rose-400 origin-left"
        style={{ scaleX }}
      />

      <nav
        className={`mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 transition-all duration-300 ${
          isScrolled
            ? 'mt-3 py-3 rounded-2xl bg-background/80 backdrop-blur-md border border-border shadow-2xl shadow-black/20'
            : 'py-5 bg-transparent'
        }`}
      >
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="h-10 w-10 rounded-xl bg-linear-to-tr from-crimson-600 to-rose-500 flex items-center justify-center shadow-lg shadow-crimson-600/30 group-hover:scale-105 transition-transform">
              <HeartHandshake className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold tracking-tight text-foreground">
              Blood<span className="text-crimson-500">Link</span>
            </span>
          </Link>

          {/* Desktop Nav Links */}
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-muted-foreground">
            <Link href="#how-it-works" className="hover:text-foreground transition-colors">How It Works</Link>
            <Link href="#features" className="hover:text-foreground transition-colors">Features</Link>
            <Link href="#why-choose" className="hover:text-foreground transition-colors">Why BloodLink</Link>
            <Link href="#faq" className="hover:text-foreground transition-colors">FAQ</Link>
          </div>

          {/* Action Buttons & Theme Toggle */}
          <div className="hidden md:flex items-center gap-3">
            {/* 2. Theme Toggle Added Here */}
            <ThemeToggle />

            <Button variant="ghost" className="text-muted-foreground hover:text-foreground hover:bg-muted gap-2">
              <Search className="h-4 w-4" />
              Find Blood
            </Button>
            
            <Button className="h-10 px-5 rounded-lg bg-linear-to-r from-red-950 via-rose-800 to-rose-700 text-white font-medium gap-2 transition-all duration-300 hover:scale-[1.03] shadow-md hover:shadow-xl active:scale-[0.98]">
              <UserPlus className="h-4 w-4" />
              Become a Donor
            </Button>
          </div>

          {/* Mobile Menu Trigger */}
          <div className="flex items-center gap-2 md:hidden">
            <ThemeToggle />
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-muted-foreground hover:text-foreground focus:outline-none"
              aria-label="Toggle Navigation Menu"
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown */}
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="md:hidden mt-4 pt-4 border-t border-border flex flex-col gap-4 text-muted-foreground"
          >
            <Link href="#how-it-works" onClick={() => setMobileMenuOpen(false)}>How It Works</Link>
            <Link href="#features" onClick={() => setMobileMenuOpen(false)}>Features</Link>
            <Link href="#why-choose" onClick={() => setMobileMenuOpen(false)}>Why BloodLink</Link>
            <Link href="#faq" onClick={() => setMobileMenuOpen(false)}>FAQ</Link>
            <div className="flex flex-col gap-2 pt-2 border-t border-border">
              <Button variant="outline" className="w-full text-foreground">
                Find Blood
              </Button>
              <Button className="w-full bg-crimson-600 text-white">
                Become a Donor
              </Button>
            </div>
          </motion.div>
        )}
      </nav>
    </header>
  );
}