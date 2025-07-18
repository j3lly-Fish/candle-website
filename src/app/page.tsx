import { PageTransition, FadeInSection, TransitionElement } from "@/components/animation";
import { Hero, FeaturedProducts } from "@/components/home";

export default function Home() {
  return (
    <PageTransition key="home">
      <div className="bg-primary">
        {/* Hero Section */}
        <Hero />
        
        {/* Featured Products Section */}
        <FeaturedProducts />
        
        {/* Customization Preview Section */}
        <section className="container-custom py-16">
          <FadeInSection>
            <h2 className="text-3xl font-bold mb-8 text-center">Create Your Perfect Candle</h2>
          </FadeInSection>
          
          <div className="flex flex-col md:flex-row gap-8">
            <FadeInSection className="w-full md:w-1/2" delay={0.1}>
              <div className="glass p-6 rounded-lg">
                <h3 className="text-2xl font-semibold mb-4">Choose Your Options</h3>
                
                <div className="mb-4">
                  <label className="block mb-2 font-medium">Scent</label>
                  <div className="flex gap-2 flex-wrap">
                    {['Vanilla', 'Lavender', 'Cinnamon', 'Ocean'].map((scent) => (
                      <TransitionElement key={scent} className="px-3 py-1 border border-accent rounded-full cursor-pointer hover:bg-accent hover:text-primary transition-colors duration-300">
                        {scent}
                      </TransitionElement>
                    ))}
                  </div>
                </div>
                
                <div className="mb-4">
                  <label className="block mb-2 font-medium">Color</label>
                  <div className="flex gap-2">
                    {['#FFFFFF', '#FF0000', '#800000', '#000000'].map((color) => (
                      <TransitionElement 
                        key={color} 
                        className="w-8 h-8 rounded-full cursor-pointer border-2 border-neutral-light hover:border-accent transition-colors duration-300" 
                        style={{ backgroundColor: color }}
                      >
                        <div />
                      </TransitionElement>
                    ))}
                  </div>
                </div>
                
                <div className="mb-6">
                  <label className="block mb-2 font-medium">Size</label>
                  <div className="flex gap-2">
                    {['S', 'M', 'L'].map((size) => (
                      <TransitionElement 
                        key={size} 
                        className="w-10 h-10 flex items-center justify-center border border-accent rounded-full cursor-pointer hover:bg-accent hover:text-primary transition-colors duration-300"
                      >
                        {size}
                      </TransitionElement>
                    ))}
                  </div>
                </div>

                <TransitionElement>
                  <button className="btn btn-primary w-full">
                    Customize Your Candle
                  </button>
                </TransitionElement>
              </div>
            </FadeInSection>
            
            <FadeInSection className="w-full md:w-1/2" delay={0.2}>
              <div className="h-80 bg-gradient-to-br from-neutral-light to-white rounded-lg flex items-center justify-center shadow-custom">
                <div className="text-center">
                  <div className="w-20 h-28 bg-accent rounded-t-full mx-auto mb-4 relative">
                    {/* Candle flame */}
                    <div className="absolute -top-2 left-1/2 transform -translate-x-1/2">
                      <div className="w-3 h-4 bg-gradient-to-t from-secondary to-yellow-400 rounded-full animate-pulse"></div>
                    </div>
                  </div>
                  <p className="text-accent text-xl font-semibold">Your Custom Candle</p>
                  <p className="text-neutral-dark text-sm">Preview updates as you customize</p>
                </div>
              </div>
            </FadeInSection>
          </div>
        </section>
      </div>
    </PageTransition>
  );
}
