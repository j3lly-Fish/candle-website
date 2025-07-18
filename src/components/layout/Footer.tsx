'use client';

import Link from 'next/link';
import TransitionElement from '@/components/animation/TransitionElement';

interface FooterProps {
  className?: string;
}

export const Footer = ({ className = '' }: FooterProps) => {
  const currentYear = new Date().getFullYear();

  const footerLinks = {
    company: [
      { href: '/about', label: 'About Us' },
      { href: '/contact', label: 'Contact' },
      { href: '/careers', label: 'Careers' },
      { href: '/press', label: 'Press' },
    ],
    products: [
      { href: '/products', label: 'All Products' },
      { href: '/products/scented', label: 'Scented Candles' },
      { href: '/products/unscented', label: 'Unscented Candles' },
      { href: '/products/gift-sets', label: 'Gift Sets' },
    ],
    support: [
      { href: '/help', label: 'Help Center' },
      { href: '/shipping', label: 'Shipping Info' },
      { href: '/returns', label: 'Returns' },
      { href: '/size-guide', label: 'Size Guide' },
    ],
    legal: [
      { href: '/privacy', label: 'Privacy Policy' },
      { href: '/terms', label: 'Terms of Service' },
      { href: '/cookies', label: 'Cookie Policy' },
      { href: '/accessibility', label: 'Accessibility' },
    ],
  };

  const socialLinks = [
    {
      href: 'https://facebook.com',
      label: 'Facebook',
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
        </svg>
      ),
    },
    {
      href: 'https://instagram.com',
      label: 'Instagram',
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 6.62 5.367 11.987 11.988 11.987 6.62 0 11.987-5.367 11.987-11.987C24.014 5.367 18.637.001 12.017.001zM8.449 16.988c-1.297 0-2.448-.49-3.323-1.297C4.198 14.895 3.708 13.744 3.708 12.447s.49-2.448 1.418-3.323c.875-.807 2.026-1.297 3.323-1.297s2.448.49 3.323 1.297c.928.875 1.418 2.026 1.418 3.323s-.49 2.448-1.418 3.244c-.875.807-2.026 1.297-3.323 1.297zm7.83-9.405c-.49 0-.928-.175-1.297-.49-.368-.315-.49-.753-.49-1.243 0-.49.122-.928.49-1.243.369-.315.807-.49 1.297-.49s.928.175 1.297.49c.315.315.49.753.49 1.243 0 .49-.175.928-.49 1.243-.369.315-.807.49-1.297.49z" />
        </svg>
      ),
    },
    {
      href: 'https://twitter.com',
      label: 'Twitter',
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" />
        </svg>
      ),
    },
    {
      href: 'https://pinterest.com',
      label: 'Pinterest',
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.174-.105-.949-.199-2.403.041-3.439.219-.937 1.406-5.957 1.406-5.957s-.359-.72-.359-1.781c0-1.663.967-2.911 2.168-2.911 1.024 0 1.518.769 1.518 1.688 0 1.029-.653 2.567-.992 3.992-.285 1.193.6 2.165 1.775 2.165 2.128 0 3.768-2.245 3.768-5.487 0-2.861-2.063-4.869-5.008-4.869-3.41 0-5.409 2.562-5.409 5.199 0 1.033.394 2.143.889 2.741.097.118.112.222.083.343-.09.375-.293 1.199-.334 1.363-.053.225-.172.271-.402.165-1.495-.69-2.433-2.878-2.433-4.646 0-3.776 2.748-7.252 7.92-7.252 4.158 0 7.392 2.967 7.392 6.923 0 4.135-2.607 7.462-6.233 7.462-1.214 0-2.357-.629-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24.009 12.017 24.009c6.624 0 11.99-5.367 11.99-11.988C24.007 5.367 18.641.001 12.017.001z" />
        </svg>
      ),
    },
  ];

  return (
    <footer className={`bg-neutral-dark text-primary ${className}`}>
      <div className="container-custom">
        {/* Main Footer Content */}
        <div className="py-12">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
            {/* Brand Section */}
            <div className="lg:col-span-1">
              <TransitionElement>
                <Link href="/" className="flex items-center space-x-2 mb-4">
                  <div className="w-8 h-8 bg-secondary rounded-full flex items-center justify-center">
                    <span className="text-primary font-bold text-sm">C</span>
                  </div>
                  <span className="text-xl font-bold text-primary">
                    Custom Candles
                  </span>
                </Link>
              </TransitionElement>
              <p className="text-neutral-light mb-6 text-sm leading-relaxed">
                Handcrafted candles made with love and premium materials. 
                Create your perfect ambiance with our customizable collection.
              </p>
              
              {/* Newsletter Signup */}
              <div className="mb-6">
                <h4 className="text-primary font-semibold mb-3">Stay Updated</h4>
                <div className="flex">
                  <input
                    type="email"
                    placeholder="Enter your email"
                    className="flex-1 px-3 py-2 bg-primary text-neutral-dark rounded-l-md focus:outline-none focus:ring-2 focus:ring-secondary text-sm"
                  />
                  <TransitionElement>
                    <button className="bg-secondary hover:bg-accent text-primary px-4 py-2 rounded-r-md transition-colors duration-300 text-sm font-medium">
                      Subscribe
                    </button>
                  </TransitionElement>
                </div>
              </div>
            </div>

            {/* Company Links */}
            <div>
              <h4 className="text-primary font-semibold mb-4">Company</h4>
              <ul className="space-y-2">
                {footerLinks.company.map((link) => (
                  <li key={link.href}>
                    <TransitionElement>
                      <Link
                        href={link.href}
                        className="text-neutral-light hover:text-secondary transition-colors duration-300 text-sm"
                      >
                        {link.label}
                      </Link>
                    </TransitionElement>
                  </li>
                ))}
              </ul>
            </div>

            {/* Products Links */}
            <div>
              <h4 className="text-primary font-semibold mb-4">Products</h4>
              <ul className="space-y-2">
                {footerLinks.products.map((link) => (
                  <li key={link.href}>
                    <TransitionElement>
                      <Link
                        href={link.href}
                        className="text-neutral-light hover:text-secondary transition-colors duration-300 text-sm"
                      >
                        {link.label}
                      </Link>
                    </TransitionElement>
                  </li>
                ))}
              </ul>
            </div>

            {/* Support Links */}
            <div>
              <h4 className="text-primary font-semibold mb-4">Support</h4>
              <ul className="space-y-2">
                {footerLinks.support.map((link) => (
                  <li key={link.href}>
                    <TransitionElement>
                      <Link
                        href={link.href}
                        className="text-neutral-light hover:text-secondary transition-colors duration-300 text-sm"
                      >
                        {link.label}
                      </Link>
                    </TransitionElement>
                  </li>
                ))}
              </ul>
            </div>

            {/* Legal Links */}
            <div>
              <h4 className="text-primary font-semibold mb-4">Legal</h4>
              <ul className="space-y-2">
                {footerLinks.legal.map((link) => (
                  <li key={link.href}>
                    <TransitionElement>
                      <Link
                        href={link.href}
                        className="text-neutral-light hover:text-secondary transition-colors duration-300 text-sm"
                      >
                        {link.label}
                      </Link>
                    </TransitionElement>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Bottom Footer */}
        <div className="border-t border-neutral-light border-opacity-20 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            {/* Copyright */}
            <p className="text-neutral-light text-sm">
              © {currentYear} Custom Candles. All rights reserved.
            </p>

            {/* Social Links */}
            <div className="flex items-center space-x-4">
              <span className="text-neutral-light text-sm mr-2">Follow us:</span>
              {socialLinks.map((social) => (
                <TransitionElement key={social.href}>
                  <a
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-neutral-light hover:text-secondary transition-colors duration-300"
                    aria-label={social.label}
                  >
                    {social.icon}
                  </a>
                </TransitionElement>
              ))}
            </div>

            {/* Payment Methods */}
            <div className="flex items-center space-x-2">
              <span className="text-neutral-light text-sm mr-2">We accept:</span>
              <div className="flex space-x-2">
                {/* Visa */}
                <div className="w-8 h-5 bg-primary rounded flex items-center justify-center">
                  <span className="text-xs font-bold text-neutral-dark">VISA</span>
                </div>
                {/* Mastercard */}
                <div className="w-8 h-5 bg-primary rounded flex items-center justify-center">
                  <span className="text-xs font-bold text-neutral-dark">MC</span>
                </div>
                {/* PayPal */}
                <div className="w-8 h-5 bg-primary rounded flex items-center justify-center">
                  <span className="text-xs font-bold text-neutral-dark">PP</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;