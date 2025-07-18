'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import TransitionElement from '@/components/animation/TransitionElement';
import { ProductSearch } from '@/components/product';
import { useAuth } from '@/contexts/AuthContext';
import { useCart } from '@/contexts/CartContext';

interface HeaderProps {
  className?: string;
}

export const Header = ({ className = '' }: HeaderProps) => {
  const { user, isAuthenticated, logout } = useAuth();
  const { toggleCart, itemCount } = useCart();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isAccountMenuOpen, setIsAccountMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const toggleAccountMenu = () => {
    setIsAccountMenuOpen(!isAccountMenuOpen);
  };

  const handleLogout = async () => {
    await logout();
    setIsAccountMenuOpen(false);
  };

  const navItems = [
    { href: '/', label: 'Home' },
    { href: '/products', label: 'Products' },
    { href: '/about', label: 'About' },
    { href: '/contact', label: 'Contact' },
  ];

  const mobileMenuVariants = {
    closed: {
      opacity: 0,
      height: 0,
      transition: {
        duration: 0.3,
        ease: [0.4, 0, 0.2, 1],
      },
    },
    open: {
      opacity: 1,
      height: 'auto',
      transition: {
        duration: 0.3,
        ease: [0.4, 0, 0.2, 1],
      },
    },
  };

  const mobileMenuItemVariants = {
    closed: { opacity: 0, x: -20 },
    open: (i: number) => ({
      opacity: 1,
      x: 0,
      transition: {
        delay: i * 0.1,
        duration: 0.3,
        ease: [0.4, 0, 0.2, 1],
      },
    }),
  };

  const accountMenuVariants = {
    closed: {
      opacity: 0,
      scale: 0.95,
      y: -10,
      transition: {
        duration: 0.2,
        ease: [0.4, 0, 0.2, 1],
      },
    },
    open: {
      opacity: 1,
      scale: 1,
      y: 0,
      transition: {
        duration: 0.2,
        ease: [0.4, 0, 0.2, 1],
      },
    },
  };

  return (
    <header className={`bg-white shadow-custom sticky top-0 z-50 ${className}`}>
      <div className="container-custom">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <TransitionElement>
            <Link href="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-secondary rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-sm">C</span>
              </div>
              <span className="text-xl font-bold text-neutral-dark">
                Custom Candles
              </span>
            </Link>
          </TransitionElement>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            {navItems.map((item) => (
              <TransitionElement key={item.href}>
                <Link
                  href={item.href}
                  className="text-neutral-dark hover:text-secondary transition-colors duration-300 font-medium"
                >
                  {item.label}
                </Link>
              </TransitionElement>
            ))}
          </nav>

          {/* Search Bar - Desktop */}
          <div className="hidden md:block flex-grow mx-8 max-w-md">
            <ProductSearch placeholder="Search for candles..." />
          </div>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center space-x-4">
            <TransitionElement>
              <div className="relative">
                <button
                  onClick={toggleAccountMenu}
                  className="text-neutral-dark hover:text-secondary transition-colors duration-300 focus:outline-none"
                  aria-label="Account"
                >
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                    />
                  </svg>
                </button>

                <AnimatePresence>
                  {isAccountMenuOpen && (
                    <motion.div
                      initial="closed"
                      animate="open"
                      exit="closed"
                      variants={accountMenuVariants}
                      className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50 origin-top-right"
                    >
                      {isAuthenticated ? (
                        <>
                          <div className="px-4 py-2 border-b border-gray-100">
                            <p className="text-sm font-medium text-gray-900">
                              {user?.firstName} {user?.lastName}
                            </p>
                            <p className="text-xs text-gray-500 truncate">
                              {user?.email}
                            </p>
                          </div>
                          <Link
                            href="/account/profile"
                            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                            onClick={() => setIsAccountMenuOpen(false)}
                          >
                            Your Profile
                          </Link>
                          <Link
                            href="/account/orders"
                            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                            onClick={() => setIsAccountMenuOpen(false)}
                          >
                            Your Orders
                          </Link>
                          <button
                            onClick={handleLogout}
                            className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          >
                            Sign out
                          </button>
                        </>
                      ) : (
                        <>
                          <Link
                            href="/account/login"
                            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                            onClick={() => setIsAccountMenuOpen(false)}
                          >
                            Sign in
                          </Link>
                          <Link
                            href="/account/register"
                            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                            onClick={() => setIsAccountMenuOpen(false)}
                          >
                            Create account
                          </Link>
                        </>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </TransitionElement>

            <TransitionElement>
              <button
                onClick={toggleCart}
                className="relative text-neutral-dark hover:text-secondary transition-colors duration-300"
                aria-label="Shopping Cart"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l2.5 5m6-5v6a2 2 0 11-4 0v-6m4 0V9a2 2 0 10-4 0v4.01"
                  />
                </svg>
                {/* Cart count badge */}
                {itemCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-secondary text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {itemCount > 99 ? '99+' : itemCount}
                  </span>
                )}
              </button>
            </TransitionElement>
          </div>

          {/* Mobile Menu Button */}
          <TransitionElement className="md:hidden">
            <button
              onClick={toggleMobileMenu}
              className="text-neutral-dark hover:text-secondary transition-colors duration-300 p-2"
              aria-label="Toggle mobile menu"
            >
              <motion.div
                animate={isMobileMenuOpen ? 'open' : 'closed'}
                className="w-6 h-6 flex flex-col justify-center items-center"
              >
                <motion.span
                  variants={{
                    closed: { rotate: 0, y: 0 },
                    open: { rotate: 45, y: 6 },
                  }}
                  className="w-6 h-0.5 bg-current block transition-all duration-300 origin-center"
                />
                <motion.span
                  variants={{
                    closed: { opacity: 1 },
                    open: { opacity: 0 },
                  }}
                  className="w-6 h-0.5 bg-current block mt-1.5 transition-all duration-300"
                />
                <motion.span
                  variants={{
                    closed: { rotate: 0, y: 0 },
                    open: { rotate: -45, y: -6 },
                  }}
                  className="w-6 h-0.5 bg-current block mt-1.5 transition-all duration-300 origin-center"
                />
              </motion.div>
            </button>
          </TransitionElement>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial="closed"
              animate="open"
              exit="closed"
              variants={mobileMenuVariants}
              className="md:hidden overflow-hidden bg-white border-t border-neutral-light"
            >
              {/* Mobile Search */}
              <div className="px-4 py-2">
                <ProductSearch placeholder="Search for candles..." />
              </div>
              
              <nav className="py-4 space-y-4">
                {navItems.map((item, index) => (
                  <motion.div
                    key={item.href}
                    custom={index}
                    variants={mobileMenuItemVariants}
                  >
                    <Link
                      href={item.href}
                      className="block px-4 py-2 text-neutral-dark hover:text-secondary hover:bg-neutral-light transition-all duration-300 font-medium"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      {item.label}
                    </Link>
                  </motion.div>
                ))}
                
                {/* Mobile Account Menu */}
                <motion.div
                  custom={navItems.length}
                  variants={mobileMenuItemVariants}
                  className="border-t border-neutral-light pt-4"
                >
                  {isAuthenticated ? (
                    <>
                      <div className="px-4 py-2 mb-2">
                        <p className="font-medium text-neutral-dark">
                          {user?.firstName} {user?.lastName}
                        </p>
                        <p className="text-sm text-gray-500 truncate">
                          {user?.email}
                        </p>
                      </div>
                      <Link
                        href="/account/profile"
                        className="block px-4 py-2 text-neutral-dark hover:text-secondary hover:bg-neutral-light transition-all duration-300"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        Your Profile
                      </Link>
                      <Link
                        href="/account/orders"
                        className="block px-4 py-2 text-neutral-dark hover:text-secondary hover:bg-neutral-light transition-all duration-300"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        Your Orders
                      </Link>
                      <button
                        onClick={() => {
                          handleLogout();
                          setIsMobileMenuOpen(false);
                        }}
                        className="block w-full text-left px-4 py-2 text-neutral-dark hover:text-secondary hover:bg-neutral-light transition-all duration-300"
                      >
                        Sign out
                      </button>
                    </>
                  ) : (
                    <>
                      <Link
                        href="/account/login"
                        className="block px-4 py-2 text-neutral-dark hover:text-secondary hover:bg-neutral-light transition-all duration-300"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        Sign in
                      </Link>
                      <Link
                        href="/account/register"
                        className="block px-4 py-2 text-neutral-dark hover:text-secondary hover:bg-neutral-light transition-all duration-300"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        Create account
                      </Link>
                    </>
                  )}
                </motion.div>

                {/* Mobile Cart Link */}
                <motion.div
                  custom={navItems.length + 1}
                  variants={mobileMenuItemVariants}
                >
                  <button
                    onClick={() => {
                      toggleCart();
                      setIsMobileMenuOpen(false);
                    }}
                    className="flex items-center space-x-2 px-4 py-2 text-neutral-dark hover:text-secondary hover:bg-neutral-light transition-all duration-300 w-full text-left"
                  >
                    <div className="relative">
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l2.5 5m6-5v6a2 2 0 11-4 0v-6m4 0V9a2 2 0 10-4 0v4.01"
                        />
                      </svg>
                      {itemCount > 0 && (
                        <span className="absolute -top-2 -right-2 bg-secondary text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
                          {itemCount > 99 ? '99+' : itemCount}
                        </span>
                      )}
                    </div>
                    <span>Cart</span>
                  </button>
                </motion.div>
              </nav>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </header>
  );
};

export default Header;