import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import AIToolCard from './AIToolCard';

interface Tool {
    name: string;
    description: string;
    logo: string;
    category: string;
    url: string;
}

const AIToolGrid: React.FC<{ tools: Tool[] }> = ({ tools }) => {
    return (
        <motion.div
            layout
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 w-full"
        >
            <AnimatePresence mode="popLayout">
                {tools.map((tool) => (
                    <motion.div
                        key={tool.name}
                        layout
                        initial={{ opacity: 0, y: 30, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9, y: -20 }}
                        transition={{ duration: 0.45, ease: "easeOut" }}
                    >
                        <AIToolCard tool={tool} />
                    </motion.div>
                ))}
            </AnimatePresence>
        </motion.div>
    );
};

export default AIToolGrid;
