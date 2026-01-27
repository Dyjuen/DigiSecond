"use client";

import React from "react";
import { motion } from "motion/react";
import { TestimonialsColumn } from "@/components/ui/testimonials-columns-1";

// Duplicate the original 9 items to create volume if needed, 
// but the column component also loops. We will stick to the user's 9 items 
// effectively distributed.
const testimonialsData = [
    {
        text: "This ERP revolutionized our operations, streamlining finance and inventory. The cloud-based platform keeps us productive, even remotely.",
        image: "https://randomuser.me/api/portraits/women/1.jpg",
        name: "Briana Patton",
        role: "Operations Manager",
    },
    {
        text: "Implementing this ERP was smooth and quick. The customizable, user-friendly interface made team training effortless.",
        image: "https://randomuser.me/api/portraits/men/2.jpg",
        name: "Bilal Ahmed",
        role: "IT Manager",
    },
    {
        text: "The support team is exceptional, guiding us through setup and providing ongoing assistance, ensuring our satisfaction.",
        image: "https://randomuser.me/api/portraits/women/3.jpg",
        name: "Saman Malik",
        role: "Customer Support Lead",
    },
    {
        text: "This ERP's seamless integration enhanced our business operations and efficiency. Highly recommend for its intuitive interface.",
        image: "https://randomuser.me/api/portraits/men/4.jpg",
        name: "Omar Raza",
        role: "CEO",
    },
    {
        text: "Its robust features and quick support have transformed our workflow, making us significantly more efficient.",
        image: "https://randomuser.me/api/portraits/women/5.jpg",
        name: "Zainab Hussain",
        role: "Project Manager",
    },
    {
        text: "The smooth implementation exceeded expectations. It streamlined processes, improving overall business performance.",
        image: "https://randomuser.me/api/portraits/women/6.jpg",
        name: "Aliza Khan",
        role: "Business Analyst",
    },
    {
        text: "Our business functions improved with a user-friendly design and positive customer feedback.",
        image: "https://randomuser.me/api/portraits/men/7.jpg",
        name: "Farhan Siddiqui",
        role: "Marketing Director",
    },
    {
        text: "They delivered a solution that exceeded expectations, understanding our needs and enhancing our operations.",
        image: "https://randomuser.me/api/portraits/women/8.jpg",
        name: "Sana Sheikh",
        role: "Sales Manager",
    },
    {
        text: "Using this ERP, our online presence and conversions significantly improved, boosting business performance.",
        image: "https://randomuser.me/api/portraits/men/9.jpg",
        name: "Hassan Ali",
        role: "E-commerce Manager",
    },
    // Add a few more duplicates to ensure columns aren't too short
    {
        text: "Fantastic service! The automated delivery system is a game changer for my business.",
        image: "https://randomuser.me/api/portraits/women/10.jpg",
        name: "Nina Williams",
        role: "Power Seller",
    },
    {
        text: "I was skeptical at first, but the escrow protection gave me total peace of mind.",
        image: "https://randomuser.me/api/portraits/men/11.jpg",
        name: "David Chen",
        role: "Game Trader",
    },
    {
        text: "Customer support resolved my issue in minutes. Best marketplace experience I've had.",
        image: "https://randomuser.me/api/portraits/women/12.jpg",
        name: "Sarah Johnson",
        role: "Verified Seller",
    }
];

// Split into 3 columns
const firstColumn = testimonialsData.slice(0, 4);
const secondColumn = testimonialsData.slice(4, 8);
const thirdColumn = testimonialsData.slice(8, 12);

export const SellTestimonials = () => {
    return (
        <section className="bg-transparent my-20 relative w-full">
            {/* Gradient overlays for smooth fade */}
            <div className="absolute top-0 left-0 right-0 h-40 bg-gradient-to-b from-background to-transparent z-10 pointer-events-none" />
            <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-background to-transparent z-10 pointer-events-none" />

            <div className="container z-10 mx-auto px-4">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                    viewport={{ once: true }}
                    className="flex flex-col items-center justify-center max-w-[600px] mx-auto text-center"
                >
                    <div className="flex justify-center mb-6">
                        <div className="border border-indigo-500/30 bg-indigo-500/10 text-indigo-300 py-1 px-4 rounded-full text-sm font-medium backdrop-blur-md">
                            Testimonials
                        </div>
                    </div>

                    <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-white mb-6">
                        Kata Mereka Tentang <span className="text-indigo-400">DigiSecond</span>
                    </h2>
                    <p className="text-zinc-400 text-lg leading-relaxed">
                        Bergabunglah dengan ribuan seller dan buyer yang telah mempercayai kami.
                    </p>
                </motion.div>

                <div className="flex justify-center gap-6 mt-16 max-h-[800px] overflow-hidden relative">
                    <TestimonialsColumn testimonials={firstColumn} duration={25} />
                    <TestimonialsColumn testimonials={secondColumn} className="hidden md:block" duration={30} />
                    <TestimonialsColumn testimonials={thirdColumn} className="hidden lg:block" duration={28} />
                </div>
            </div>
        </section>
    );
};
