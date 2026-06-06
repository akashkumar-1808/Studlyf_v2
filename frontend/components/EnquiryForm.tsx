import React, { useState, useRef } from 'react';
import { motion, AnimatePresence, useSpring } from 'framer-motion';
import { Send, User, Mail, Globe, Phone, MessageSquare, HelpCircle, Check, Loader2 } from 'lucide-react';
import InteractiveCreature from './InteractiveCreature';
import emailjs from '@emailjs/browser';

const EnquiryForm: React.FC = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        country: '',
        phone: '',
        description: '',
        questions: ''
    });
    const [focusedField, setFocusedField] = useState<string | null>(null);
    const [isVerified, setIsVerified] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Mouse Tilt Effect
    const containerRef = useRef<HTMLDivElement>(null);
    const [rotateX, setRotateX] = useState(0);
    const [rotateY, setRotateY] = useState(0);

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!containerRef.current) return;
        const rect = containerRef.current.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        const mouseX = e.clientX;
        const mouseY = e.clientY;

        setRotateX((mouseY - centerY) / 40);
        setRotateY((centerX - mouseX) / 40);
    };

    const handleMouseLeave = () => {
        setRotateX(0);
        setRotateY(0);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!isVerified) {
            alert('Please complete the human verification to proceed.');
            return;
        }

        setIsSubmitting(true);

        const serviceId = import.meta.env.VITE_EMAIL_JS_SERVICE_ID;
        const templateId = import.meta.env.VITE_EMAIL_JS_TEMPLATE_ID;
        const publicKey = import.meta.env.VITE_EMAIL_JS_USER_ID;

        // Clean any potential whitespace from environment variables
        const cleanServiceId = serviceId?.trim();
        const cleanTemplateId = templateId?.trim();
        const cleanPublicKey = publicKey?.trim();

        if (!cleanServiceId || !cleanTemplateId || !cleanPublicKey) {
            console.error('Missing EmailJS Configuration! Please check your .env file.', { 
                serviceId: cleanServiceId, 
                templateId: cleanTemplateId, 
                publicKey: cleanPublicKey ? '***' : undefined 
            });
            alert('Email service is not configured properly.');
            setIsSubmitting(false);
            return;
        }

        const templateParams = {
            to_email: 'vishnumaxpolla32@gmail.com',
            from_name: formData.name,
            from_email: formData.email,
            country: formData.country,
            phone: formData.phone,
            description: formData.description,
            questions: formData.questions,
            // Fallbacks in case the template uses different variable names
            name: formData.name,
            email: formData.email,
            message: formData.questions
        };

        try {
            await emailjs.send(cleanServiceId, cleanTemplateId, templateParams, {
                publicKey: cleanPublicKey
            });
            
            setIsSubmitted(true);
            setFormData({
                name: '',
                email: '',
                country: '',
                phone: '',
                description: '',
                questions: ''
            });
            setIsVerified(false);
            setTimeout(() => setIsSubmitted(false), 5000);
        } catch (error: any) {
            console.error('Failed to send email. Status:', error?.status, 'Text:', error?.text, 'Error:', error);
            alert(`Failed to send inquiry: ${error?.text || 'Unknown error. Check console.'}`);
        } finally {
            setIsSubmitting(false);
        }
    };

    const inputClasses = (fieldName: string) => `
        w-full bg-[#7C3AED] border rounded-2xl py-3.5 px-12 text-white text-sm text-center
        placeholder:text-transparent transition-all duration-500 outline-none
        ${focusedField === fieldName ? 'border-white shadow-[0_0_20px_rgba(255,255,255,0.3)] scale-[1.02]' : 'border-white/20'}
    `;

    const labelClasses = (fieldName: string, value: string) => `
        absolute transition-all duration-500 pointer-events-none font-semibold tracking-wide
        ${focusedField === fieldName || value
            ? 'left-12 -top-7 text-xs text-black bg-transparent px-3 scale-100 translate-y-0'
            : 'left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2 text-sm text-white/80'}
    `;

    return (
        <section id="enquiry-form" className="relative w-full overflow-hidden bg-white py-2 px-4 md:px-8 font-poppins">
            {/* 🌌 Animated Background Elements */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
                {/* Seamless Section Blend (Fade from pure white) */}
                <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-white to-transparent z-10" />
                <motion.div
                    className="absolute inset-0 opacity-10"
                    animate={{
                        background: [
                            "radial-gradient(circle at 20% 20%, #7C3AED 0%, transparent 60%)",
                            "radial-gradient(circle at 80% 80%, #7C3AED 0%, transparent 60%)",
                            "radial-gradient(circle at 20% 20%, #7C3AED 0%, transparent 60%)"
                        ]
                    }}
                    transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
                />

                {[...Array(15)].map((_, i) => (
                    <motion.div
                        key={i}
                        className="absolute w-1.5 h-1.5 bg-[#7C3AED]/20 rounded-full"
                        initial={{
                            x: Math.random() * 100 + "%",
                            y: Math.random() * 100 + "%",
                        }}
                        animate={{
                            y: [null, "-20vh"],
                            opacity: [0.1, 0.4, 0.1],
                        }}
                        transition={{
                            duration: Math.random() * 8 + 7,
                            repeat: Infinity,
                            ease: "easeInOut",
                            delay: Math.random() * 5
                        }}
                    />
                ))}
            </div>

            {/* 🔘 Main Form Container */}
            <motion.div
                ref={containerRef}
                onMouseMove={handleMouseMove}
                onMouseLeave={handleMouseLeave}
                style={{
                    perspective: 2000,
                    rotateX: useSpring(rotateX, { stiffness: 100, damping: 30 }),
                    rotateY: useSpring(rotateY, { stiffness: 100, damping: 30 }),
                }}
                initial={{ opacity: 0, scale: 0.95, y: 50 }}
                whileInView={{ opacity: 1, scale: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
                className="max-w-4xl w-full relative z-10 mx-auto"
            >
                {/* 🌈 Form Box with Purple Background */}
                <div className="relative bg-[#7C3AED] backdrop-blur-2xl border border-white/20 rounded-[2.5rem] p-8 md:p-14 overflow-hidden shadow-[0_40px_100px_rgba(124,58,237,0.3)] group">

                    {/* ⚡ Animated Scan Light Effect */}
                    <motion.div
                        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent w-[200%] -translate-x-[100%]"
                        animate={{ x: ["100%", "-100%"] }}
                        transition={{ duration: 4, repeat: Infinity, ease: "linear", repeatDelay: 2 }}
                        style={{ skewX: -20 }}
                    />

                    {/* Header */}
                    <div className="text-center space-y-4 mb-12 relative z-10">
                        <motion.h2
                            initial={{ opacity: 0, y: -20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8 }}
                            className="text-3xl md:text-5xl font-bold tracking-tight text-white drop-shadow-lg"
                        >
                            Let's Get To Know Each Other
                        </motion.h2>
                        <p className="text-white text-base md:text-lg font-medium max-w-xl mx-auto opacity-90">
                            Elevate your vision with our AI-driven expertise.
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-10 relative z-10">
                        <div className="grid md:grid-cols-2 gap-10">
                            {/* Name */}
                            <motion.div className="relative group">
                                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-white group-focus-within:scale-110 transition-all duration-500 z-10" size={18} />
                                <input name="name" type="text" value={formData.name} onChange={handleChange} onFocus={() => setFocusedField('name')} onBlur={() => setFocusedField(null)} required className={inputClasses('name')} />
                                <label className={labelClasses('name', formData.name)}>Full Name *</label>
                            </motion.div>

                            {/* Email */}
                            <motion.div className="relative group">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-white group-focus-within:scale-110 transition-all duration-500 z-10" size={18} />
                                <input name="email" type="email" value={formData.email} onChange={handleChange} onFocus={() => setFocusedField('email')} onBlur={() => setFocusedField(null)} required className={inputClasses('email')} />
                                <label className={labelClasses('email', formData.email)}>Email Address *</label>
                            </motion.div>

                            {/* Country */}
                            <motion.div className="relative group">
                                <Globe className="absolute left-4 top-1/2 -translate-y-1/2 text-white group-focus-within:scale-110 transition-all duration-500 z-10" size={18} />
                                <input name="country" type="text" value={formData.country} onChange={handleChange} onFocus={() => setFocusedField('country')} onBlur={() => setFocusedField(null)} required className={inputClasses('country')} />
                                <label className={labelClasses('country', formData.country)}>Your Country *</label>
                            </motion.div>

                            {/* Phone */}
                            <motion.div className="relative group">
                                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-white group-focus-within:scale-110 transition-all duration-500 z-10" size={18} />
                                <input name="phone" type="tel" value={formData.phone} onChange={handleChange} onFocus={() => setFocusedField('phone')} onBlur={() => setFocusedField(null)} className={inputClasses('phone')} />
                                <label className={labelClasses('phone', formData.phone)}>Phone Number</label>
                            </motion.div>
                        </div>

                        {/* Describe You */}
                        <motion.div className="relative group">
                            <MessageSquare className="absolute left-4 top-1/2 -translate-y-1/2 text-white group-focus-within:scale-110 transition-all duration-500 z-10" size={18} />
                            <select
                                name="description"
                                value={formData.description}
                                onChange={handleChange}
                                onFocus={() => setFocusedField('description')}
                                onBlur={() => setFocusedField(null)}
                                required
                                className={`${inputClasses('description')} appearance-none cursor-pointer`}
                            >
                                <option value="" className="bg-[#7C3AED]"></option>
                                <option value="learner" className="bg-[#7C3AED]">Student / Learner</option>
                                <option value="professional" className="bg-[#7C3AED]">Industry Professional</option>
                                <option value="partner" className="bg-[#7C3AED]">Strategic Partner</option>
                                <option value="other" className="bg-[#7C3AED]">Other</option>
                            </select>
                            <label className={labelClasses('description', formData.description)}>What describes you best? *</label>
                        </motion.div>

                        {/* Questions */}
                        <motion.div className="relative group">
                            <HelpCircle className="absolute left-4 top-1/2 -translate-y-1/2 text-white group-focus-within:scale-110 transition-all duration-500 z-10" size={18} />
                            <textarea
                                name="questions"
                                value={formData.questions}
                                onChange={handleChange}
                                onFocus={() => setFocusedField('questions')}
                                onBlur={() => setFocusedField(null)}
                                rows={3}
                                className={`${inputClasses('questions')} py-3.5 min-h-[100px] resize-none`}
                            />
                            <label className={labelClasses('questions', formData.questions)}>Any questions for us?</label>
                        </motion.div>

                        <div className="flex justify-center md:justify-start">
                            <motion.div
                                onClick={() => setIsVerified(!isVerified)}
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                className="bg-white/20 border border-white/30 rounded-xl p-3 flex items-center gap-4 text-xs text-white font-semibold cursor-pointer select-none transition-all duration-300 hover:bg-white/30"
                            >
                                <div className="w-5 h-5 border-2 border-white/60 rounded flex items-center justify-center bg-white/10 group">
                                    {isVerified && (
                                        <motion.div
                                            initial={{ scale: 0, opacity: 0 }}
                                            animate={{ scale: 1, opacity: 1 }}
                                            transition={{ type: "spring", stiffness: 300, damping: 20 }}
                                        >
                                            <Check className="text-white" size={16} strokeWidth={4} />
                                        </motion.div>
                                    )}
                                </div>
                                <span className="tracking-wide">Secured by Human Verification</span>
                            </motion.div>
                        </div>

                        {/* Submit Button */}
                        <motion.div className="pt-4 flex justify-center">
                            <motion.button
                                type="submit"
                                disabled={isSubmitting}
                                className={`px-16 py-3.5 text-base rounded-2xl transition-all duration-300 flex items-center gap-3 group overflow-hidden glow-btn glow-btn-purple ${isSubmitting ? 'opacity-70 cursor-not-allowed' : ''}`}
                            >
                                <span className="glow-orb glow-orb-1" />
                                <span className="glow-orb glow-orb-2" />
                                <span className="glow-orb glow-orb-3" />
                                <span className="glow-label flex items-center gap-3 w-full justify-center">
                                    {isSubmitting ? (
                                        <>
                                            <Loader2 size={18} className="animate-spin" />
                                            <span className="tracking-wider">Sending...</span>
                                        </>
                                    ) : (
                                        <>
                                            <span className="tracking-wider">Submit Inquiry</span>
                                            <Send size={18} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                                        </>
                                    )}
                                </span>
                            </motion.button>
                        </motion.div>

                        {/* Interactive Creature below Submit Button */}
                        <div className="flex justify-center -mt-8 pointer-events-none relative z-0">
                            <InteractiveCreature targetButtonText="Submit Inquiry" />
                        </div>
                    </form>

                    <AnimatePresence>
                        {isSubmitted && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="absolute inset-0 z-50 flex items-center justify-center bg-[#7C3AED]/95 backdrop-blur-md rounded-[2.5rem]"
                            >
                                <div className="text-center space-y-6 px-10 text-white">
                                    <h3 className="text-3xl font-bold">Inquiry Sent!</h3>
                                    <p className="opacity-90">Thank you for reaching out.</p>
                                    <motion.button
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        onClick={() => setIsSubmitted(false)}
                                        className="px-8 py-2 bg-white text-[#7C3AED] rounded-xl font-bold text-sm shadow-lg"
                                    >
                                        Submit Another
                                    </motion.button>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </motion.div>
        </section>
    );
};

export default EnquiryForm;
