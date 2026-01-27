"use client";
import React from "react";
import { motion } from "motion/react";
import Image from "next/image";

export interface Testimonial {
    text: string;
    image: string;
    name: string;
    role: string;
}

export const TestimonialsColumn = (props: {
    className?: string;
    testimonials: Testimonial[];
    duration?: number;
}) => {
    return (
        <div className={props.className}>
            <motion.div
                animate={{
                    translateY: "-50%",
                }}
                transition={{
                    duration: props.duration || 10,
                    repeat: Infinity,
                    ease: "linear",
                    repeatType: "loop",
                }}
                className="flex flex-col gap-6 pb-6"
            >
                {[...new Array(2)].map((_, index) => (
                    <React.Fragment key={index}>
                        {props.testimonials.map(({ text, image, name, role }, i) => (
                            <div
                                className="p-6 rounded-3xl bg-zinc-900/50 backdrop-blur-sm border border-white/5 shadow-lg max-w-xs w-full"
                                key={i}
                            >
                                <div className="text-zinc-300 text-sm leading-relaxed">{text}</div>
                                <div className="flex items-center gap-3 mt-5">
                                    <Image
                                        width={40}
                                        height={40}
                                        src={image}
                                        alt={name}
                                        className="h-10 w-10 rounded-full object-cover"
                                    />
                                    <div className="flex flex-col">
                                        <div className="font-semibold text-white tracking-tight leading-5">
                                            {name}
                                        </div>
                                        <div className="text-xs leading-5 text-zinc-500 tracking-tight">
                                            {role}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </React.Fragment>
                ))}
            </motion.div>
        </div>
    );
};
