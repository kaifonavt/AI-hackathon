'use client';

import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import Link from "next/link";
import { Menu, X } from 'lucide-react';
import { titleFont, textFont } from '@/app/fonts';

const Navigation = () => {
  const { isLoggedIn } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navLinks = [
    { href: "/dashboard", label: "Home" },
    { href: "/dashboard/schedule", label: "Schedule" },
    { href: "/dashboard/courses", label: "Courses" },
    isLoggedIn 
      ? { href: "/dashboard/profile", label: "Profile" }
      : { href: "/login", label: "Login" }
  ];

  return (
    <nav className={`bg-purple-900/50 backdrop-blur-sm fixed w-full z-50 shadow-lg ${textFont.className}`}>
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link 
              href="/" 
              className={`text-3xl font-bold text-white ${titleFont.className}`}
            >
              #NotSecretSanta
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`text-white hover:text-pink-400 transition ${textFont.className}`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="text-white p-2"
              aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
            >
              {isMobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`text-white hover:text-pink-400 transition block px-3 py-2 ${textFont.className}`}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navigation;