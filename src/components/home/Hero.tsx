'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { FadeInSection, TransitionElement, FloatingElement, GlassMorphism } from '@/components/animation';

interface HeroProps {
  className?: string;
}

export const Hero = ({ className = '' }: HeroProps) => {
  // Animation variants for the hero title
  const _titleVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08,
      },
    },
  };

  const _letterVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.4,
      },
    },
  };

  // Split text for letter animation
  const _titleWords = ['Custom', 'Candles', 'Handcrafted', 'For', 'You'];

  return (
    <section className={`container-custom py-16 md:py-24 ${className}`}>
      <div className="flex flex-col lg:flex-row items-center justify-between gap-12">
        {/* Hero Content */}
        <div className="w-full lg:w-1/2 space-y-6">
          <FadeInSection cascade staggerDelay={0.08} duration={0.6}>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
              <span className="inline-block">Custom </span>
              <span className="inline-block">Candles </span>
              <span className="inline-block text-secondary">Handcrafted </span>
              <span className="inline-block">For </span>
              <span className="inline-block">You</span>
            </h1>
          </FadeInSection>

          <FadeInSection delay={0.3} duration={0.7}>
            <p className="text-lg md:text-xl text-neutral-dark leading-relaxed">
              Create your perfect ambiance with our premium custom candles. 
              Choose your scent, color, and size for a personalized experience 
              that transforms any space into your sanctuary.
            </p>
          </FadeInSection>

          <FadeInSection delay={0.5} staggerChildren staggerDelay={0.15}>
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <TransitionElement 
                hoverScale={1.05} 
                glowEffect={true}
                glowColor="red"
                hoverElevation={true}
                className="inline-block"
              >
                <Link 
                  href="/products" 
                  className="btn btn-primary text-center px-8 py-3 text-lg font-semibold flex items-center justify-center gap-2"
                >
                  <span>Shop Now</span>
                  <motion.svg 
                    className="w-5 h-5" 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                    animate={{ x: [0, 5, 0] }}
                    transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </motion.svg>
                </Link>
              </TransitionElement>
              
              <TransitionElement 
                hoverScale={1.05}
                colorShift={true}
                colorShiftTo="#800000"
                className="inline-block"
              >
                <Link 
                  href="/about" 
                  className="btn btn-secondary text-center px-8 py-3 text-lg font-semibold"
                >
                  Learn More
                </Link>
              </TransitionElement>
            </div>
          </FadeInSection>

          {/* Trust Indicators */}
          <FadeInSection delay={0.7} staggerChildren staggerDelay={0.2}>
            <div className="flex flex-wrap items-center gap-6 pt-8 text-sm text-neutral-dark">
              <TransitionElement hoverScale={1.05} className="flex items-center gap-2">
                <motion.svg 
                  className="w-5 h-5 text-secondary" 
                  fill="currentColor" 
                  viewBox="0 0 20 20"
                  animate={{ rotate: [0, 10, 0] }}
                  transition={{ repeat: Infinity, duration: 2, ease: "easeInOut", repeatDelay: 1 }}
                >
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </motion.svg>
                <span>Premium Materials</span>
              </TransitionElement>
              <TransitionElement hoverScale={1.05} className="flex items-center gap-2">
                <motion.svg 
                  className="w-5 h-5 text-secondary" 
                  fill="currentColor" 
                  viewBox="0 0 20 20"
                  animate={{ rotate: [0, 10, 0] }}
                  transition={{ repeat: Infinity, duration: 2, ease: "easeInOut", repeatDelay: 1.2 }}
                >
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </motion.svg>
                <span>Handcrafted Quality</span>
              </TransitionElement>
              <TransitionElement hoverScale={1.05} className="flex items-center gap-2">
                <motion.svg 
                  className="w-5 h-5 text-secondary" 
                  fill="currentColor" 
                  viewBox="0 0 20 20"
                  animate={{ rotate: [0, 10, 0] }}
                  transition={{ repeat: Infinity, duration: 2, ease: "easeInOut", repeatDelay: 1.4 }}
                >
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </motion.svg>
                <span>Free Shipping</span>
              </TransitionElement>
            </div>
          </FadeInSection>
        </div>

        {/* Hero Image */}
        <div className="w-full lg:w-1/2">
          <FadeInSection delay={0.3} direction="left">
            <FloatingElement intensity="subtle" duration={4}>
              <div className="relative">
                {/* Main candle image placeholder */}
                <GlassMorphism 
                  opacity={0.8} 
                  blurAmount={8} 
                  hoverEffect={true} 
                  hoverOpacity={0.9}
                  borderRadius="1rem"
                  className="relative h-96 md:h-[500px] w-full overflow-hidden"
                >
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      <motion.div 
                        className="w-24 h-32 bg-accent rounded-t-full mx-auto mb-4 relative"
                        animate={{ 
                          boxShadow: ['0 0 0px rgba(128, 0, 0, 0)', '0 0 20px rgba(128, 0, 0, 0.5)', '0 0 0px rgba(128, 0, 0, 0)'] 
                        }}
                        transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
                      >
                        {/* Candle flame */}
                        <motion.div 
                          className="absolute -top-2 left-1/2 transform -translate-x-1/2"
                          animate={{ 
                            y: [-1, 1, -1],
                            scale: [1, 1.2, 1]
                          }}
                          transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
                        >
                          <div className="w-3 h-4 bg-gradient-to-t from-secondary to-yellow-400 rounded-full animate-pulse"></div>
                        </motion.div>
                      </motion.div>
                      <motion.p 
                        className="text-accent text-lg font-semibold"
                        animate={{ opacity: [0.8, 1, 0.8] }}
                        transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
                      >
                        Premium Candle
                      </motion.p>
                      <p className="text-neutral-dark text-sm">Handcrafted with Love</p>
                    </div>
                  </div>
                  
                  {/* Decorative elements */}
                  <motion.div 
                    className="absolute top-4 right-4 w-16 h-16 bg-secondary bg-opacity-10 rounded-full"
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
                  ></motion.div>
                  <motion.div 
                    className="absolute bottom-4 left-4 w-12 h-12 bg-accent bg-opacity-10 rounded-full"
                    animate={{ scale: [1, 1.15, 1] }}
                    transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
                  ></motion.div>
                </GlassMorphism>

                {/* Floating decorative elements */}
                <FloatingElement intensity="normal" duration={5} direction="both">
                  <motion.div 
                    className="absolute -top-4 -right-4 w-8 h-8 bg-secondary rounded-full opacity-20"
                    animate={{ opacity: [0.2, 0.4, 0.2] }}
                    transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
                  ></motion.div>
                </FloatingElement>
                
                <FloatingElement intensity="normal" duration={6} direction="vertical">
                  <motion.div 
                    className="absolute -bottom-2 -left-2 w-6 h-6 bg-accent rounded-full opacity-30"
                    animate={{ opacity: [0.3, 0.5, 0.3] }}
                    transition={{ repeat: Infinity, duration: 2.5, ease: "easeInOut" }}
                  ></motion.div>
                </FloatingElement>
                
                {/* Additional floating elements */}
                <FloatingElement intensity="subtle" duration={7} direction="horizontal">
                  <motion.div 
                    className="absolute top-1/4 right-1/4 w-4 h-4 bg-secondary rounded-full opacity-10"
                    animate={{ opacity: [0.1, 0.3, 0.1] }}
                    transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
                  ></motion.div>
                </FloatingElement>
                
                <FloatingElement intensity="subtle" duration={8} direction="both">
                  <motion.div 
                    className="absolute bottom-1/3 right-1/3 w-5 h-5 bg-accent rounded-full opacity-15"
                    animate={{ opacity: [0.15, 0.35, 0.15] }}
                    transition={{ repeat: Infinity, duration: 3.5, ease: "easeInOut" }}
                  ></motion.div>
                </FloatingElement>
              </div>
            </FloatingElement>
          </FadeInSection>
        </div>
      </div>
    </section>
  );
};

export default Hero;