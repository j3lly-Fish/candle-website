import React from 'react';
import { motion } from 'framer-motion';
import { GlassMorphism } from '@/components/animation';

interface ProductTabsProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  tabs: {
    id: string;
    label: string;
    content: React.ReactNode;
  }[];
}

/**
 * ProductTabs component with glass morphism effects
 * Displays tabs with content and applies transparency effects
 */
const ProductTabs: React.FC<ProductTabsProps> = ({ activeTab, setActiveTab, tabs }) => {
  return (
    <div className="pt-6">
      {/* Tab Navigation with Glass Morphism */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => (
            <GlassMorphism
              key={tab.id}
              preset={activeTab === tab.id ? 'red' : 'light'}
              opacity={activeTab === tab.id ? 0.1 : 0.05}
              blurAmount={2}
              borderWidth="0"
              borderRadius="0"
              className={`pb-4 px-1 border-b-2 ${
                activeTab === tab.id
                  ? 'border-red-600'
                  : 'border-transparent'
              }`}
              onClick={() => setActiveTab(tab.id)}
              hoverEffect={true}
              hoverOpacity={0.15}
            >
              <span className={`whitespace-nowrap font-medium text-sm ${
                activeTab === tab.id ? 'text-red-600' : 'text-gray-500'
              }`}>
                {tab.label}
              </span>
            </GlassMorphism>
          ))}
        </nav>
      </div>
      
      {/* Tab Content with Animation */}
      <div className="py-4">
        {tabs.map((tab) => (
          activeTab === tab.id && (
            <motion.div
              key={tab.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <GlassMorphism
                preset="light"
                opacity={0.05}
                blurAmount={1}
                borderWidth="0"
                className="p-4 rounded-md"
              >
                {tab.content}
              </GlassMorphism>
            </motion.div>
          )
        ))}
      </div>
    </div>
  );
};

export default ProductTabs;