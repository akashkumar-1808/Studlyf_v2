import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Minus } from 'lucide-react';

const faqData = [
  {
    question: "How does Studlyf accelerate my career growth?",
    answer: "Studlyf is an AI-powered ecosystem designed to bridge the gap between academic learning and industry demands. Through real-world projects, guided mentorship, and direct exposure to startups, we transform ambitious students into future-ready professionals."
  },
  {
    question: "What is StudOTT, and how is it different from normal courses?",
    answer: "StudOTT is our premium streaming platform for learning. Unlike traditional video lectures, it delivers high-impact, curated skill-building modules, technical deep-dives, and career preparation resources that actually move the needle for your growth."
  },
  {
    question: "Do I need prior tech experience to succeed here?",
    answer: "Absolutely not. The Studlyf ecosystem is built for everyone from day-one beginners to advanced innovators. Our AI-driven pathways adapt to your level, guiding you step-by-step from foundational concepts to advanced, portfolio-ready projects."
  },
  {
    question: "How do the opportunities and placements actually work?",
    answer: "We partner directly with forward-thinking organizations. As you build your profile through our ecosystem—participating in hackathons, unlocking certifications, and completing projects—you gain exclusive access to tailored internships, hiring challenges, and placement support."
  },
  {
    question: "What makes the Studlyf community unique?",
    answer: "We aren't just another forum. The Studlyf community is a high-trust network of ambitious peers, industry mentors, and innovators. It’s a collaborative space where you don't just consume content—you build, collaborate, and launch real ideas together."
  }
];

const FAQ: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section className="relative bg-[#F8F9FA] py-24 sm:py-32 px-6 overflow-hidden font-poppins">
      {/* Premium Ambient Background */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full bg-[#7C3AED]/5 blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] rounded-full bg-[#06B6D4]/5 blur-[120px]" />
      </div>

      <div className="relative max-w-7xl mx-auto flex flex-col lg:flex-row gap-16 lg:gap-24">

        {/* Left Column: Sticky Intro */}
        <div className="lg:w-1/3 flex flex-col items-start lg:sticky lg:top-32 h-fit">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-[#7C3AED]/10 shadow-sm mb-6"
          >
            <span className="text-xs font-bold text-[#7C3AED] uppercase tracking-widest">
              Clear Your Doubts
            </span>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-4xl sm:text-5xl font-black text-slate-900 leading-[1.1] tracking-tight mb-6"
          >
            Everything you need to <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#7C3AED] to-[#06B6D4]">know.</span>
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-slate-500 text-lg leading-relaxed mb-10"
          >
            Get answers to your questions and understand how the Studlyf ecosystem powers your career growth.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
          >
            <p className="text-slate-400 text-sm font-semibold">
              Still have questions? <br />
              <a href="#" className="text-[#7C3AED] hover:text-[#6D28D9] transition-colors inline-flex items-center gap-1 mt-2 group">
                Connect with the STUDLYF team
                <span className="group-hover:translate-x-1 transition-transform">→</span>
              </a>
            </p>
          </motion.div>
        </div>

        {/* Right Column: Premium Accordion Stack */}
        <div className="lg:w-2/3 flex flex-col gap-4">
          {faqData.map((item, index) => {
            const isOpen = openIndex === index;

            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <div
                  className={`
                    relative overflow-hidden rounded-[1.5rem] transition-all duration-500 cursor-pointer group
                    ${isOpen
                      ? 'bg-white shadow-[0_32px_64px_-12px_rgba(124,58,237,0.12)] border border-[#7C3AED]/20 ring-1 ring-[#7C3AED]/5'
                      : 'bg-white/60 backdrop-blur-xl border border-white hover:bg-white/90 hover:shadow-lg hover:shadow-[#7C3AED]/5 hover:-translate-y-0.5'
                    }
                  `}
                  onClick={() => setOpenIndex(isOpen ? null : index)}
                >
                  {/* Subtle active glow line */}
                  {isOpen && (
                    <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-[#7C3AED] to-[#06B6D4]" />
                  )}

                  <div className="p-6 sm:p-8 flex items-start">
                    <div className="flex-1">
                      <div className="flex items-center justify-between gap-6">
                        <h4 className={`
                          text-lg sm:text-xl font-bold leading-snug transition-colors duration-300
                          ${isOpen ? 'text-slate-900' : 'text-slate-700 group-hover:text-slate-900'}
                        `}>
                          {item.question}
                        </h4>

                        {/* Custom Animated Plus/Minus Toggle */}
                        <div className={`
                          shrink-0 w-8 h-8 rounded-full border flex items-center justify-center transition-all duration-500
                          ${isOpen
                            ? 'bg-[#7C3AED]/10 border-[#7C3AED]/20 text-[#7C3AED] rotate-180'
                            : 'bg-white border-slate-200 text-slate-400 group-hover:border-[#7C3AED]/30 group-hover:text-[#7C3AED]'
                          }
                        `}>
                          {isOpen ? <Minus className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                        </div>
                      </div>

                      {/* Expandable Content */}
                      <AnimatePresence initial={false}>
                        {isOpen && (
                          <motion.div
                            initial={{ height: 0, opacity: 0, filter: 'blur(4px)' }}
                            animate={{ height: 'auto', opacity: 1, filter: 'blur(0px)' }}
                            exit={{ height: 0, opacity: 0, filter: 'blur(4px)' }}
                            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                            className="overflow-hidden"
                          >
                            <div className="pt-5 pr-12">
                              <p className="text-slate-500 leading-relaxed sm:text-lg font-medium">
                                {item.answer}
                              </p>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default FAQ;
