import React, { useRef, useState, useEffect } from 'react';
import { motion, useInView, AnimatePresence } from 'framer-motion';
import { Search, BookOpen, Laptop, Rocket, Trophy, ChevronRight } from 'lucide-react';
import InteractiveCreature from './InteractiveCreature';

const steps = [
    {
        id: '01',
        title: 'Discover',
        icon: <Search className="w-5 h-5" />,
        text: 'Explore career paths.',
        details: 'Deep analysis of trends.',
        color: '#FFFFFF'
    },
    {
        id: '02',
        title: 'Learn',
        icon: <BookOpen className="w-5 h-5" />,
        text: 'Structured modules.',
        details: 'Curated by veterans.',
        color: '#FFFFFF'
    },
    {
        id: '03',
        title: 'Practice',
        icon: <Laptop className="w-5 h-5" />,
        text: 'Hands-on projects.',
        details: 'Build your portfolio.',
        color: '#FFFFFF'
    },
    {
        id: '04',
        title: 'Launch',
        icon: <Rocket className="w-5 h-5" />,
        text: 'Job readiness.',
        details: 'Connect with partners.',
        color: '#FFFFFF'
    },
    {
        id: '05',
        title: 'Excel',
        icon: <Trophy className="w-5 h-5" />,
        text: 'Lead and inspire.',
        details: 'Become an industry icon.',
        color: '#FFFFFF'
    },
];

const RoadmapSection: React.FC = () => {
    const containerRef = useRef<HTMLDivElement>(null);
    const isInView = useInView(containerRef, { margin: "-100px" });
    const [hoveredStep, setHoveredStep] = useState<number | null>(null);
    const [isMouseOver, setIsMouseOver] = useState(false);

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            if (!containerRef.current) return;
            const rect = containerRef.current.getBoundingClientRect();
            const isInside = (
                e.clientX >= rect.left &&
                e.clientX <= rect.right &&
                e.clientY >= rect.top &&
                e.clientY <= rect.bottom
            );
            setIsMouseOver(isInside);
        };

        window.addEventListener('mousemove', handleMouseMove);
        return () => window.removeEventListener('mousemove', handleMouseMove);
    }, []);

    // Full Width Straight Line Path (0 to 1000)
    const pathD = "M 0 100 L 1000 100";

    // Balanced distribution along the full path for 5 items
    const nodePositions = [
        { left: '10%', top: '100px', cardDir: 'up' },
        { left: '30%', top: '100px', cardDir: 'down' },
        { left: '50%', top: '100px', cardDir: 'up' },
        { left: '70%', top: '100px', cardDir: 'down' },
        { left: '90%', top: '100px', cardDir: 'up' },
    ];

    return (
        <section
            ref={containerRef}
            className={`py-20 bg-white overflow-hidden relative flex flex-col items-center ${isMouseOver ? 'lg:cursor-none' : ''}`}
        >
            {isMouseOver && <InteractiveCreature isCursor className="hidden lg:block scale-75" />}

            {/* The Violet Box */}
            <motion.div
                initial={{ opacity: 0, y: 40 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 1, ease: [0.19, 1, 0.22, 1] }}
                className="w-[95%] max-w-[1400px] bg-[#6C3BFF] rounded-[60px] relative overflow-hidden pt-20 pb-40 px-6 md:px-12 shadow-[0_40px_100px_rgba(108,59,255,0.2)]"
            >
                {/* Ambient Lighting & Particles inside the box */}
                <div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden">
                    <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-white/10 rounded-full blur-[120px]" />
                    <div className="absolute bottom-0 right-1/4 w-[600px] h-[600px] bg-purple-400/20 rounded-full blur-[120px]" />

                    <motion.div
                        animate={{
                            x: [0, 50, -50, 0],
                            y: [0, -30, 30, 0],
                            opacity: [0.1, 0.2, 0.1]
                        }}
                        transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
                        className="absolute top-1/2 left-1/2 w-[800px] h-[800px] bg-white/5 rounded-full blur-[150px] -translate-x-1/2 -translate-y-1/2"
                    />
                </div>

                {/* Header */}
                <div className="text-center mb-24 relative z-10">
                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        animate={isInView ? { opacity: 1, y: 0 } : {}}
                        className="text-4xl md:text-6xl font-black text-white mb-6 tracking-tight"
                    >
                        Master Your <span className="text-purple-200">Path</span>
                    </motion.h2>
                    <motion.p
                        initial={{ opacity: 0, y: 15 }}
                        animate={isInView ? { opacity: 1, y: 0 } : {}}
                        className="text-base md:text-lg text-white/70 max-w-xl mx-auto font-medium"
                    >
                        Your journey to career excellence, defined by standards.
                    </motion.p>
                </div>

                {/* Desktop Roadmap (Animated Full Line) */}
                <div className="hidden lg:flex relative items-center justify-between w-full mx-auto min-h-[400px] z-10">
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1200px] h-[200px] -z-10">
                        <svg width="100%" height="100%" viewBox="0 0 1000 200" fill="none" className="overflow-visible">
                            {/* Background Faint Line */}
                            <motion.path
                                d={pathD}
                                stroke="rgba(255,255,255,0.05)"
                                strokeWidth="2"
                                strokeLinecap="round"
                            />

                            {/* Animated Primary Line (Dashed Base) */}
                            <motion.path
                                d={pathD}
                                stroke="rgba(255,255,255,0.2)"
                                strokeWidth="4"
                                strokeDasharray="10 15"
                                strokeLinecap="round"
                            />

                            {/* Solid Drawing Line */}
                            <motion.path
                                d={pathD}
                                stroke="white"
                                strokeWidth="4"
                                strokeLinecap="round"
                                initial={{ pathLength: 0 }}
                                animate={isInView ? { pathLength: 1 } : {}}
                                transition={{ duration: 2.5, ease: "easeInOut" }}
                            />

                            {/* Extra Glowing Accent Line (Delayed) */}
                            <motion.path
                                d={pathD}
                                stroke="rgba(255,255,255,0.4)"
                                strokeWidth="8"
                                strokeLinecap="round"
                                className="blur-[8px]"
                                initial={{ pathLength: 0 }}
                                animate={isInView ? { pathLength: 1 } : {}}
                                transition={{ duration: 3, delay: 0.5, ease: "easeInOut" }}
                            />
                        </svg>

                        {/* High-Energy Traveling Pulse */}
                        <motion.div
                            className="absolute top-0 left-0 w-3 h-3 bg-white rounded-full shadow-[0_0_25px_rgba(255,255,255,1),0_0_50px_rgba(255,255,255,0.5)] z-30"
                            animate={{ offsetDistance: ["0%", "100%"] }}
                            transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
                            style={{ offsetPath: `path("${pathD}")` }}
                        >
                        {/* Traveling Pulse Trail / Particles could go here */}
                        </motion.div>

                        {/* Extra Decorative Nodes on Path (Path Enrichment) */}
                        {[20, 40, 60, 80].map((pos) => (
                            <motion.div
                                key={pos}
                                initial={{ scale: 0, opacity: 0 }}
                                animate={isInView ? { scale: 1, opacity: 1 } : {}}
                                transition={{ delay: 3 + (pos/100), duration: 0.5 }}
                                className="absolute top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-white shadow-[0_0_15px_white] z-20"
                                style={{ left: `${pos}%` }}
                            />
                        ))}
                    </div>

                    {steps.map((step, index) => {
                        const pt = nodePositions[index];
                        return (
                            <div key={step.id} className="absolute" style={{ left: pt.left, top: '50%', transform: 'translate(-50%, -50%)' }}>
                                <div className="relative flex flex-col items-center group" onMouseEnter={() => setHoveredStep(index)} onMouseLeave={() => setHoveredStep(null)}>

                                    {/* Full Vertical Dashed Line - BOTH SIDES (Symmetry) */}
                                    {/* Upward Line */}
                                    <motion.div
                                        initial={{ scaleY: 0 }}
                                        animate={isInView ? { scaleY: 1 } : {}}
                                        transition={{ delay: 2 + index * 0.2, duration: 0.8 }}
                                        className="absolute w-0 border-l-[5px] border-dashed border-white origin-bottom transition-all duration-500 z-30 h-48 bottom-10"
                                    />
                                    {/* Downward Line */}
                                    <motion.div
                                        initial={{ scaleY: 0 }}
                                        animate={isInView ? { scaleY: 1 } : {}}
                                        transition={{ delay: 2.2 + index * 0.2, duration: 0.8 }}
                                        className="absolute w-0 border-l-[5px] border-dashed border-white origin-top transition-all duration-500 z-30 h-48 top-10"
                                    />

                                    {/* Node with Radial Glow */}
                                    <motion.div
                                        initial={{ scale: 0, opacity: 0 }}
                                        animate={isInView ? { scale: 1, opacity: 1 } : {}}
                                        transition={{ delay: 1.5 + index * 0.3, type: "spring", stiffness: 200 }}
                                        whileHover={{ scale: 1.25, rotate: 10 }}
                                        className="w-10 h-10 rounded-full border-2 border-white shadow-[0_0_20px_rgba(255,255,255,0.3)] flex items-center justify-center z-40 cursor-pointer transition-all active:scale-95"
                                        style={{
                                            backgroundColor: hoveredStep === index ? 'white' : 'rgba(255,255,255,0.1)',
                                            backdropFilter: 'blur(12px)'
                                        }}
                                    >
                                        <span className={`text-xs font-black transition-colors ${hoveredStep === index ? 'text-[#6C3BFF]' : 'text-white'}`}>
                                            {step.id}
                                        </span>
                                        {/* Background Pulse */}
                                        <motion.div
                                            animate={{ scale: [1, 1.4, 1], opacity: [0.3, 0, 0.3] }}
                                            transition={{ duration: 2, repeat: Infinity }}
                                            className="absolute inset-0 rounded-full bg-white/20"
                                        />
                                    </motion.div>

                                    {/* Card with Floating Animation */}
                                    <motion.div
                                        initial={{ opacity: 0, scale: 0.8, y: pt.cardDir === 'up' ? -30 : 30 }}
                                        animate={isInView ? { opacity: 1, scale: 1, y: 0 } : {}}
                                        transition={{ delay: 2.2 + index * 0.2, type: "spring", damping: 15 }}
                                        className={`absolute w-52 p-6 bg-white shadow-[0_20px_60px_rgba(0,0,0,0.3)] rounded-[32px] z-50 ${pt.cardDir === 'up' ? '-top-[230px]' : 'top-24'} group-hover:-translate-y-3 transition-all duration-500 border border-white/10`}
                                    >
                                        <div className="w-10 h-10 rounded-2xl flex items-center justify-center mb-4 bg-gradient-to-br from-[#6C3BFF]/20 to-[#8B5CF6]/20 text-[#6C3BFF] shadow-inner">
                                            {step.icon}
                                        </div>
                                        <h3 className="text-lg font-black text-black mb-1.5 tracking-tight group-hover:text-[#6C3BFF] transition-colors">{step.title}</h3>
                                        <p className="text-[12px] text-gray-500 font-semibold leading-relaxed mb-0">{step.text}</p>

                                        <AnimatePresence>
                                            {hoveredStep === index && (
                                                <motion.div
                                                    initial={{ height: 0, opacity: 0, marginTop: 0 }}
                                                    animate={{ height: 'auto', opacity: 1, marginTop: 16 }}
                                                    exit={{ height: 0, opacity: 0, marginTop: 0 }}
                                                    className="overflow-hidden border-t border-gray-50 pt-3"
                                                >
                                                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-1">Expert Goal</p>
                                                    <p className="text-[11px] text-[#6C3BFF] font-medium leading-tight italic">"{step.details}"</p>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </motion.div>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Mobile View with Animated Line */}
                <div className="lg:hidden space-y-6 relative max-w-xs mx-auto z-10">
                    <div className="absolute left-5 top-5 bottom-5 w-0.5 bg-white/10 rounded-full overflow-hidden">
                        <motion.div
                            initial={{ height: 0 }}
                            whileInView={{ height: '100%' }}
                            transition={{ duration: 1.5 }}
                            className="w-full bg-white shadow-[0_0_10px_white]"
                        />
                    </div>
                    {steps.map((step, index) => (
                        <motion.div key={step.id} initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} className="flex gap-5 relative z-10">
                            <div className="w-10 h-10 rounded-full border border-white/50 bg-white/20 backdrop-blur-md flex items-center justify-center shrink-0">
                                <span className="text-white text-xs font-black">{step.id}</span>
                            </div>
                            <div className="bg-white p-5 rounded-2xl shadow-2xl w-full">
                                <h3 className="text-base font-black text-[#6C3BFF] mb-1">{step.title}</h3>
                                <p className="text-xs text-gray-400 font-bold">{step.text}</p>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </motion.div>
        </section>
    );
};

export default RoadmapSection;
