import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const faqData = [
  {
    id: 1,
    question: "What defines the Engineering Readiness Standard?",
    answer: "The Standard is a clinical verification framework that measures an engineer's ability to take ownership of complex systems.",
    image: "https://images.unsplash.com/photo-1581092160562-40aa08e78837?auto=format&fit=crop&q=80&w=400"
  },
  {
    id: 2,
    question: "How does the 'Clinical Verification' process work?",
    answer: "Verification involves a multi-stage audit: first, a baseline logic assessment; second, a high-stakes job simulation.",
    image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&q=80&w=400"
  },
  {
    id: 3,
    question: "Is this protocol suitable for early-career engineers?",
    answer: "Yes. In the generative age, early-career engineers need a way to distinguish their actual capability from prompt-engineered claims.",
    image: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&q=80&w=400"
  },
  {
    id: 4,
    question: "How do hiring partners use the Studlyf score?",
    answer: "Institutional partners use the score to bypass initial screening rounds. A verified profile provides auditable data.",
    image: "https://images.unsplash.com/photo-1454165833772-d996d49513d7?auto=format&fit=crop&q=80&w=400"
  },
  {
    id: 5,
    question: "Can I use AI tools during the assessment?",
    answer: "AI usage is expected. The assessment is designed to measure what you do with that output—how you verify and secure it.",
    image: "https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&q=80&w=400"
  }
];

const FAQCarousel: React.FC = () => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % faqData.length);
  };

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + faqData.length) % faqData.length);
  };

  return (
    <section className="py-20 bg-[#F5F3FF] overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">

          <motion.h3
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-5xl sm:text-6xl font-black text-[#111827] uppercase tracking-tighter font-poppins"
          >
            The Standard, <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#6C4DFF] via-[#EC4899] to-[#FF5B5B] inline-block">CLARIFIED.</span>
          </motion.h3>
        </div>

        <div className="relative flex items-center justify-center min-h-[400px]">
          {/* Navigation Arrows */}
          <button
            onClick={handlePrev}
            className="absolute left-8 z-20 p-5 rounded-full bg-white/80 backdrop-blur-md shadow-2xl border border-gray-100 text-[#7C3AED] hover:scale-110 active:scale-95 transition-all focus:outline-none cursor-pointer"
          >
            <ChevronLeft className="w-10 h-10" />
          </button>

          <button
            onClick={handleNext}
            className="absolute right-8 z-20 p-5 rounded-full bg-white/80 backdrop-blur-md shadow-2xl border border-gray-100 text-[#7C3AED] hover:scale-110 active:scale-95 transition-all focus:outline-none cursor-pointer"
          >
            <ChevronRight className="w-10 h-10" />
          </button>

          {/* Carousel Container */}
          <div className="flex items-center justify-center w-full relative">
            <AnimatePresence mode="popLayout" initial={false}>
              {faqData.map((item, index) => {
                // Circular indexing for displaying neighbor items
                const isCenter = index === currentIndex;
                const isLeft = index === (currentIndex - 1 + faqData.length) % faqData.length;
                const isRight = index === (currentIndex + 1) % faqData.length;

                if (!isCenter && !isLeft && !isRight) return null;

                return (
                  <motion.div
                    key={item.id}
                    initial={{
                      opacity: 0,
                      scale: 0.8,
                      x: isRight ? 300 : isLeft ? -300 : 0,
                      zIndex: isCenter ? 10 : 5
                    }}
                    animate={{
                      opacity: isCenter ? 1 : 0.3,
                      scale: isCenter ? 1 : 0.8,
                      x: isCenter ? 0 : isLeft ? -500 : 500,
                      zIndex: isCenter ? 10 : 5,
                      filter: isCenter ? 'blur(0px)' : 'blur(8px)'
                    }}
                    exit={{
                      opacity: 0,
                      scale: 0.8,
                      x: isLeft ? -200 : 200
                    }}
                    transition={{
                      type: "spring",
                      stiffness: 300,
                      damping: 30,
                      opacity: { duration: 0.2 }
                    }}
                    className="absolute max-w-xl w-full px-4"
                  >
                    <div
                      onClick={() => !isCenter && (isLeft ? handlePrev() : handleNext())}
                      className={`bg-white rounded-[2.5rem] p-8 border border-gray-100 shadow-[0_24px_48px_-12px_rgba(124,58,237,0.08)] overflow-hidden group cursor-pointer transition-all duration-500 font-poppins ${isCenter ? 'ring-2 ring-[#7C3AED]/20 shadow-[0_24px_56px_-14px_rgba(124,58,237,0.15)] bg-white/95 backdrop-blur-sm' : 'hover:scale-[1.02]'
                        }`}
                    >
                      <div className="h-48 rounded-2xl mb-8 overflow-hidden bg-gray-100">
                        <img
                          src={item.image}
                          alt={item.question}
                          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                        />
                      </div>

                      <h4 className="text-2xl font-black text-[#111827] uppercase mb-4 tracking-tight leading-[1.1] font-poppins">
                        {item.question}
                      </h4>

                      <p className="text-gray-500 leading-relaxed text-sm font-sans font-medium">
                        {item.answer}
                      </p>

                      {isCenter && (
                        <motion.button
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="mt-8 text-[10px] font-black text-[#7C3AED] uppercase tracking-[0.2em] flex items-center gap-3 hover:gap-5 transition-all group/btn font-poppins"
                        >
                          Deep Dive Logic <ChevronRight className="w-4 h-4 transition-transform group-hover/btn:translate-x-1" />
                        </motion.button>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        </div>

        <div className="mt-16 flex justify-center gap-4">
          {faqData.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`h-1.5 transition-all duration-300 rounded-full ${index === currentIndex ? 'w-8 bg-[#7C3AED]' : 'w-2 bg-gray-200 hover:bg-gray-300'
                }`}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default FAQCarousel;
