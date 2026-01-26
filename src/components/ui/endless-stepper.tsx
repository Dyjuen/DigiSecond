"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { cn } from "@/lib/utils";

interface Step {
    number: number;
    title: string;
    description: string;
}

interface EndlessStepperProps {
    steps: Step[];
    loopInterval?: number;
    className?: string;
}

export const EndlessStepper = ({
    steps,
    loopInterval = 4000,
    className
}: EndlessStepperProps) => {
    const [activeStep, setActiveStep] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setActiveStep((prev) => (prev + 1) % steps.length);
        }, loopInterval);

        return () => clearInterval(interval);
    }, [steps.length, loopInterval]);

    return (
        <div className={cn("w-full max-w-5xl mx-auto", className)}>
            <div className="relative flex justify-between items-start mb-12">
                {/* Connecting Line - Background */}
                <div className="absolute top-[28px] left-0 w-full h-[2px] bg-zinc-800 -z-10 rounded-full" />

                {/* Connecting Line - Progress */}
                <motion.div
                    className="absolute top-[28px] left-0 h-[2px] bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-500 -z-10 rounded-full"
                    animate={{
                        width: `${(activeStep / (steps.length - 1)) * 100}%`
                    }}
                    transition={{ duration: 0.5, ease: "easeInOut" }}
                />

                {steps.map((step, index) => {
                    const isActive = index <= activeStep;
                    const isCurrent = index === activeStep;

                    return (
                        <div key={step.number} className="flex flex-col items-center group cursor-default">
                            {/* Step Circle */}
                            <div className="relative">
                                {/* Active Pulse Effect - Single Clean Pulse */}
                                {isCurrent && (
                                    <motion.div
                                        layoutId="pulse-glow"
                                        className="absolute inset-0 rounded-full bg-indigo-500/30 blur-lg"
                                        initial={{ scale: 1, opacity: 0 }}
                                        animate={{ scale: 1.5, opacity: [0, 0.5, 0] }}
                                        transition={{ duration: 1.5, repeat: Infinity, ease: "easeOut" }}
                                    />
                                )}

                                <motion.div
                                    className={cn(
                                        "w-14 h-14 rounded-full flex items-center justify-center text-xl font-bold border-2 transition-colors duration-300 z-10 relative bg-zinc-950",
                                        isActive ? "border-indigo-400 text-white shadow-[0_0_15px_rgba(99,102,241,0.4)]" : "border-zinc-800 text-zinc-700"
                                    )}
                                    animate={{
                                        scale: isCurrent ? 1.1 : 1,
                                        borderColor: isActive ? "#818cf8" : "#27272a",
                                    }}
                                >
                                    {step.number}
                                </motion.div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Content Area - Swapping Text */}
            <div className="relative h-[120px] text-center">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={activeStep}
                        initial={{ opacity: 0, y: 20, filter: "blur(10px)" }}
                        animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                        exit={{ opacity: 0, y: -20, filter: "blur(10px)" }}
                        transition={{ duration: 0.4 }}
                        className="absolute inset-0 flex flex-col items-center"
                    >
                        <h3 className="text-2xl font-bold text-white mb-3">
                            {steps[activeStep].title}
                        </h3>
                        <p className="text-zinc-400 max-w-lg mx-auto leading-relaxed">
                            {steps[activeStep].description}
                        </p>
                    </motion.div>
                </AnimatePresence>
            </div>
        </div>
    );
};
