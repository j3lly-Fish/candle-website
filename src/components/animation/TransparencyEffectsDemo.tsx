import React from 'react';
import { motion } from 'framer-motion';
import { GlassMorphism, TransparentOverlay } from '@/components/animation';

/**
 * TransparencyEffectsDemo component
 * Showcases various transparency and glass morphism effects
 */
const TransparencyEffectsDemo: React.FC = () => {
  return (
    <div className="container mx-auto px-4 py-12">
      <h2 className="text-3xl font-bold text-center mb-8">Transparency Effects</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {/* Glass Morphism Presets */}
        <div className="space-y-6">
          <h3 className="text-xl font-semibold mb-4">Glass Morphism Presets</h3>
          
          {['default', 'light', 'dark', 'frosted', 'maroon', 'red', 'card', 'overlay', 'button', 'tooltip'].map((preset) => (
            <GlassMorphism
              key={preset}
              preset={preset as any}
              className="p-4 flex items-center justify-center"
              hoverEffect={true}
            >
              <span className="font-medium">{preset} preset</span>
            </GlassMorphism>
          ))}
        </div>
        
        {/* Transparent Overlays */}
        <div className="space-y-6">
          <h3 className="text-xl font-semibold mb-4">Transparent Overlays</h3>
          
          <div className="relative h-64 rounded-lg overflow-hidden">
            <img 
              src="/placeholder-candle.jpg" 
              alt="Candle" 
              className="w-full h-full object-cover"
            />
            <TransparentOverlay opacity={0.3}>
              <div className="flex items-center justify-center h-full">
                <span className="text-white font-bold text-xl">Basic Overlay (0.3 opacity)</span>
              </div>
            </TransparentOverlay>
          </div>
          
          <div className="relative h-64 rounded-lg overflow-hidden">
            <img 
              src="/placeholder-candle.jpg" 
              alt="Candle" 
              className="w-full h-full object-cover"
            />
            <TransparentOverlay 
              gradientOverlay 
              gradientColors={['rgba(0,0,0,0.7)', 'rgba(0,0,0,0)']} 
              gradientDirection="bottom"
            >
              <div className="absolute bottom-4 left-4">
                <span className="text-white font-bold text-xl">Gradient Overlay (Bottom)</span>
              </div>
            </TransparentOverlay>
          </div>
          
          <div className="relative h-64 rounded-lg overflow-hidden">
            <img 
              src="/placeholder-candle.jpg" 
              alt="Candle" 
              className="w-full h-full object-cover"
            />
            <TransparentOverlay 
              showOnHover 
              opacity={0.5}
              blurAmount={3}
            >
              <div className="flex items-center justify-center h-full">
                <GlassMorphism preset="light" className="p-4">
                  <span className="font-bold">Hover to see overlay</span>
                </GlassMorphism>
              </div>
            </TransparentOverlay>
          </div>
        </div>
        
        {/* Interactive Elements */}
        <div className="space-y-6">
          <h3 className="text-xl font-semibold mb-4">Interactive Elements</h3>
          
          <GlassMorphism
            preset="button"
            className="p-4 flex items-center justify-center"
            hoverEffect={true}
            hoverScale={1.05}
            hoverGlow={true}
            glowColor="rgba(255, 0, 0, 0.4)"
            clickEffect="scale"
          >
            <span className="font-medium">Interactive Button</span>
          </GlassMorphism>
          
          <GlassMorphism
            preset="card"
            className="p-6"
            hoverEffect={true}
          >
            <h4 className="font-bold mb-2">Glass Card</h4>
            <p className="text-sm">This card has a glass morphism effect with hover animation.</p>
          </GlassMorphism>
          
          <div className="relative h-64 rounded-lg overflow-hidden">
            <img 
              src="/placeholder-candle.jpg" 
              alt="Candle" 
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <GlassMorphism
                preset="frosted"
                className="p-4 max-w-xs text-center"
                opacity={0.6}
                blurAmount={10}
                hoverEffect={true}
                hoverOpacity={0.8}
              >
                <h4 className="font-bold mb-2">Frosted Glass Overlay</h4>
                <p className="text-sm">This overlay has a frosted glass effect that becomes more opaque on hover.</p>
              </GlassMorphism>
            </div>
          </div>
        </div>
      </div>
      
      {/* Combined Effects Example */}
      <div className="mt-12">
        <h3 className="text-xl font-semibold mb-4">Combined Effects Example</h3>
        
        <div className="relative h-96 rounded-lg overflow-hidden">
          <img 
            src="/placeholder-candle.jpg" 
            alt="Candle" 
            className="w-full h-full object-cover"
          />
          
          <TransparentOverlay 
            gradientOverlay 
            gradientColors={['rgba(0,0,0,0)', 'rgba(0,0,0,0.7)']} 
            gradientDirection="bottom"
          />
          
          <div className="absolute top-4 left-4">
            <GlassMorphism
              preset="light"
              className="px-3 py-1"
              borderRadius="9999px"
            >
              <span className="text-sm font-medium">Featured Product</span>
            </GlassMorphism>
          </div>
          
          <div className="absolute bottom-4 left-4 right-4">
            <GlassMorphism
              preset="frosted"
              className="p-4"
              borderRadius="0.5rem"
            >
              <h4 className="font-bold text-white mb-2">Luxury Scented Candle</h4>
              <p className="text-sm text-white/90 mb-4">Hand-crafted soy wax candle with premium fragrance oils.</p>
              
              <div className="flex justify-between items-center">
                <GlassMorphism
                  preset="red"
                  className="px-3 py-1"
                  opacity={0.8}
                >
                  <span className="text-white font-bold">$24.99</span>
                </GlassMorphism>
                
                <GlassMorphism
                  preset="button"
                  className="px-4 py-2"
                  hoverEffect={true}
                  hoverScale={1.05}
                  clickEffect="scale"
                >
                  <span className="text-white">Add to Cart</span>
                </GlassMorphism>
              </div>
            </GlassMorphism>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TransparencyEffectsDemo;