import React from 'react';
import { FadeInSection } from './FadeInSection';
import InteractiveButton from './InteractiveButton';
import InteractiveCard from './InteractiveCard';
import TransitionElement from './TransitionElement';

/**
 * Demo component showcasing various animation effects
 * This component demonstrates scroll animations, hover effects, and interaction feedback
 */
const ScrollAnimationDemo: React.FC = () => {
  return (
    <div className="py-12 px-4 max-w-6xl mx-auto">
      <h2 className="text-3xl font-bold text-center mb-12">Animation Showcase</h2>
      
      {/* Button Animations Section */}
      <FadeInSection direction="up" className="mb-16">
        <h3 className="text-2xl font-semibold mb-6">Button Hover & Interaction Effects</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Scale Effect */}
          <div className="p-6 bg-white rounded-lg shadow-md">
            <h4 className="font-medium mb-3">Scale Effect</h4>
            <InteractiveButton 
              variant="primary" 
              hoverEffect="scale"
              feedbackType="scale"
              className="mb-3"
            >
              Hover Me
            </InteractiveButton>
            <p className="text-sm text-gray-600">Buttons grow slightly on hover and shrink when clicked</p>
          </div>
          
          {/* Glow Effect */}
          <div className="p-6 bg-white rounded-lg shadow-md">
            <h4 className="font-medium mb-3">Glow Effect</h4>
            <InteractiveButton 
              variant="primary" 
              hoverEffect="glow"
              feedbackType="glow"
              glowColor="rgba(255, 0, 0, 0.5)"
              className="mb-3"
            >
              Hover Me
            </InteractiveButton>
            <p className="text-sm text-gray-600">Buttons emit a subtle glow on hover and when clicked</p>
          </div>
          
          {/* Color Shift Effect */}
          <div className="p-6 bg-white rounded-lg shadow-md">
            <h4 className="font-medium mb-3">Color Shift Effect</h4>
            <InteractiveButton 
              variant="outline" 
              hoverEffect="color-shift"
              feedbackType="ripple"
              colorShiftTo="#FF0000"
              className="mb-3"
            >
              Hover Me
            </InteractiveButton>
            <p className="text-sm text-gray-600">Buttons change color on hover for visual feedback</p>
          </div>
          
          {/* Lift Effect */}
          <div className="p-6 bg-white rounded-lg shadow-md">
            <h4 className="font-medium mb-3">Lift Effect</h4>
            <InteractiveButton 
              variant="secondary" 
              hoverEffect="lift"
              feedbackType="scale"
              className="mb-3"
            >
              Hover Me
            </InteractiveButton>
            <p className="text-sm text-gray-600">Buttons lift slightly on hover for a 3D effect</p>
          </div>
          
          {/* Ripple Feedback */}
          <div className="p-6 bg-white rounded-lg shadow-md">
            <h4 className="font-medium mb-3">Ripple Feedback</h4>
            <InteractiveButton 
              variant="primary" 
              hoverEffect="scale"
              feedbackType="ripple"
              className="mb-3"
            >
              Click Me
            </InteractiveButton>
            <p className="text-sm text-gray-600">Buttons provide ripple feedback when clicked</p>
          </div>
          
          {/* Combined Effects */}
          <div className="p-6 bg-white rounded-lg shadow-md">
            <h4 className="font-medium mb-3">Combined Effects</h4>
            <div className="flex space-x-2">
              <InteractiveButton 
                variant="primary" 
                size="small"
                hoverEffect="glow"
                feedbackType="scale"
              >
                Small
              </InteractiveButton>
              <InteractiveButton 
                variant="primary" 
                hoverEffect="scale"
                feedbackType="ripple"
              >
                Medium
              </InteractiveButton>
              <InteractiveButton 
                variant="primary" 
                size="large"
                hoverEffect="lift"
                feedbackType="scale"
              >
                Large
              </InteractiveButton>
            </div>
            <p className="text-sm text-gray-600 mt-3">Different sizes with various effects</p>
          </div>
        </div>
      </FadeInSection>
      
      {/* Card Animations Section */}
      <FadeInSection direction="up" className="mb-16" delay={0.2}>
        <h3 className="text-2xl font-semibold mb-6">Card Hover & Interaction Effects</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Scale Effect */}
          <InteractiveCard 
            hoverEffect="scale" 
            clickEffect="scale"
            className="p-6 bg-white rounded-lg"
          >
            <h4 className="font-medium mb-3">Scale Effect</h4>
            <div className="h-32 bg-gray-100 rounded flex items-center justify-center mb-3">
              <span className="text-gray-500">Hover this card</span>
            </div>
            <p className="text-sm text-gray-600">Card grows slightly on hover</p>
          </InteractiveCard>
          
          {/* Glow Effect */}
          <InteractiveCard 
            hoverEffect="glow" 
            clickEffect="scale"
            glowColor="rgba(255, 0, 0, 0.3)"
            className="p-6 bg-white rounded-lg"
          >
            <h4 className="font-medium mb-3">Glow Effect</h4>
            <div className="h-32 bg-gray-100 rounded flex items-center justify-center mb-3">
              <span className="text-gray-500">Hover this card</span>
            </div>
            <p className="text-sm text-gray-600">Card emits a subtle glow on hover</p>
          </InteractiveCard>
          
          {/* Border Effect */}
          <InteractiveCard 
            hoverEffect="border" 
            clickEffect="scale"
            borderColor="#800000"
            className="p-6 bg-white rounded-lg"
          >
            <h4 className="font-medium mb-3">Border Effect</h4>
            <div className="h-32 bg-gray-100 rounded flex items-center justify-center mb-3">
              <span className="text-gray-500">Hover this card</span>
            </div>
            <p className="text-sm text-gray-600">Card shows a border on hover</p>
          </InteractiveCard>
          
          {/* Lift Effect */}
          <InteractiveCard 
            hoverEffect="lift" 
            clickEffect="scale"
            className="p-6 bg-white rounded-lg"
          >
            <h4 className="font-medium mb-3">Lift Effect</h4>
            <div className="h-32 bg-gray-100 rounded flex items-center justify-center mb-3">
              <span className="text-gray-500">Hover this card</span>
            </div>
            <p className="text-sm text-gray-600">Card lifts slightly on hover</p>
          </InteractiveCard>
          
          {/* Transparency Effect */}
          <InteractiveCard 
            hoverEffect="multiple" 
            clickEffect="scale"
            transparencyEffect={true}
            transparencyLevel={0.8}
            className="p-6 rounded-lg"
          >
            <h4 className="font-medium mb-3">Transparency Effect</h4>
            <div className="h-32 bg-gray-100/50 backdrop-blur-sm rounded flex items-center justify-center mb-3">
              <span className="text-gray-700">Hover this card</span>
            </div>
            <p className="text-sm text-gray-700">Card has transparency that changes on hover</p>
          </InteractiveCard>
          
          {/* Multiple Effects */}
          <InteractiveCard 
            hoverEffect="multiple" 
            clickEffect="ripple"
            shadowEffect="light"
            hoverShadowEffect="strong"
            className="p-6 bg-white rounded-lg"
          >
            <h4 className="font-medium mb-3">Multiple Effects</h4>
            <div className="h-32 bg-gray-100 rounded flex items-center justify-center mb-3">
              <span className="text-gray-500">Hover this card</span>
            </div>
            <p className="text-sm text-gray-600">Card combines scale, lift, and shadow effects</p>
          </InteractiveCard>
        </div>
      </FadeInSection>
      
      {/* TransitionElement Examples */}
      <FadeInSection direction="up" className="mb-16" delay={0.4}>
        <h3 className="text-2xl font-semibold mb-6">Interactive Elements</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Image Hover */}
          <div className="p-6 bg-white rounded-lg shadow-md">
            <h4 className="font-medium mb-3">Image Hover</h4>
            <TransitionElement
              hoverScale={1.05}
              hoverElevation={true}
              duration={0.3}
              className="overflow-hidden rounded-lg"
            >
              <div className="h-48 bg-gray-200 rounded-lg flex items-center justify-center">
                <span className="text-gray-500">Hover me</span>
              </div>
            </TransitionElement>
            <p className="text-sm text-gray-600 mt-3">Images scale and lift on hover</p>
          </div>
          
          {/* Text Link */}
          <div className="p-6 bg-white rounded-lg shadow-md">
            <h4 className="font-medium mb-3">Text Link</h4>
            <p className="text-gray-600">
              Read more about our 
              <TransitionElement
                hoverScale={1.05}
                colorShift={true}
                colorShiftTo="#FF0000"
                className="inline-block mx-1"
              >
                <span className="text-maroon cursor-pointer">custom candles</span>
              </TransitionElement>
              and how they&apos;re made.
            </p>
            <p className="text-sm text-gray-600 mt-3">Text links change color and scale slightly on hover</p>
          </div>
          
          {/* Icon Button */}
          <div className="p-6 bg-white rounded-lg shadow-md">
            <h4 className="font-medium mb-3">Icon Button</h4>
            <div className="flex justify-center">
              <TransitionElement
                hoverScale={1.2}
                hoverRotation={10}
                glowEffect={true}
                glowColor="rgba(255, 0, 0, 0.3)"
                className="p-3 bg-maroon text-white rounded-full cursor-pointer"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </TransitionElement>
            </div>
            <p className="text-sm text-gray-600 mt-3">Icon buttons scale, rotate, and glow on hover</p>
          </div>
        </div>
      </FadeInSection>
    </div>
  );
};

export default ScrollAnimationDemo;