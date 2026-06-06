import React from 'react';
import { motion } from 'framer-motion';

const MNC_LOGOS = [
    { name: 'Google', path: '/images/google.png', label: 'Google' },
    { name: 'Amazon', path: '/images/amazon.png', label: 'Amazon' },
    { name: 'Microsoft', path: '/images/microsoft.png', label: 'Microsoft' },
    { name: 'Meta', path: '/images/meta.png', label: 'Meta' },
    { name: 'Apple', path: '/images/apple.png', label: 'Apple' },
    { name: 'Netflix', path: '/images/netflix.png', label: 'Netflix' },
    { name: 'NVIDIA', path: '/images/nvidia.png', label: 'NVIDIA' },
    { name: 'Adobe', path: '/images/adobe.png', label: 'Adobe' },
    { name: 'Tesla', path: '/images/tesla.png', label: 'Tesla' },
    { name: 'Intel', path: '/images/intel.png', label: 'Intel' },
    { name: 'Goldman Sachs', path: '/images/goldman-sachs.png', label: 'Goldman Sachs' },
    { name: 'J.P. Morgan', path: '/images/jpmorgan.png', label: 'J.P. Morgan' },
    { name: 'Salesforce', path: '/images/salesforce.png', label: 'Salesforce' },
    { name: 'Oracle', path: '/images/oracle.png', label: 'Oracle' },
    { name: 'Accenture', path: '/images/accenture.png', label: 'Accenture' },
    { name: 'Wipro', path: '/images/wipro.png', label: 'Wipro' },
    { name: 'TCS', path: '/images/tcs.png', label: 'TCS' },
    { name: 'Infosys', path: '/images/infosys.png', label: 'Infosys' },
    { name: 'IBM', path: '/images/ibm.png', label: 'IBM' },
];

const Achievements = () => {
    return (
        <section className="w-full bg-white py-16 px-4 md:px-8 lg:px-12 relative overflow-hidden border-t border-gray-100">
            <div className="max-w-7xl mx-auto">
                {/* MNC Marquee */}
                <div className="text-center mb-14">
                    <h3 className="text-[#0F172A] font-poppins font-bold uppercase tracking-[0.4em] text-sm md:text-base leading-relaxed">
                        Trusted by Top MNCs
                    </h3>
                </div>

                <div className="relative flex overflow-hidden">
                    <div className="flex gap-16 md:gap-24 py-8 items-center animate-marquee hover:[animation-play-state:paused]">
                        {[...MNC_LOGOS, ...MNC_LOGOS, ...MNC_LOGOS].map((logo, idx) => (
                            <div key={idx} className="flex-shrink-0 flex flex-col items-center gap-3 opacity-85 hover:opacity-100 transition-all duration-300">
                                <div className="w-28 md:w-36 h-12 flex items-center justify-center">
                                    <img src={logo.path} alt={logo.name} className="max-h-full max-w-full object-contain filter-none" />
                                </div>
                                <span className="text-gray-400 font-poppins text-[10px] md:text-xs font-medium uppercase tracking-wider">
                                    {logo.label}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Subtle radial purple background glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-purple-50/20 radial-gradient pointer-events-none" />
        </section>
    );
};

export default Achievements;
