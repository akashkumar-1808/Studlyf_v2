import React, { useEffect } from 'react';

// Lightweight frontend performance observer to log core metrics
export const PerformanceMonitor: React.FC = () => {
    useEffect(() => {
        const observer = new PerformanceObserver((list) => {
            list.getEntries().forEach((entry) => {
            });
        });

        observer.observe({ entryTypes: ['paint', 'largest-contentful-paint', 'layout-shift'] });

        // Log total requests after load
        window.addEventListener('load', () => {
            const requests = performance.getEntriesByType('resource');
            
        });

        return () => observer.disconnect();
    }, []);

    return null;
};

