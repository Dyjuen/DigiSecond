"use client";

import * as React from "react";
import { motion, AnimatePresence } from "motion/react";
import * as Accordion from "@radix-ui/react-accordion";
import { Plus, Minus } from "lucide-react";
import { cn } from "@/lib/utils";

interface FAQItem {
    id: number;
    question: string;
    answer: string;
}

interface ScrollFAQAccordionProps {
    data: FAQItem[];
    className?: string;
}

export default function ChatFAQAccordion({
    data,
    className,
}: ScrollFAQAccordionProps) {
    // Use Radix Accordion state for control
    const [value, setValue] = React.useState<string | undefined>(undefined);

    return (
        <div className={cn("max-w-3xl mx-auto w-full", className)}>
            <Accordion.Root
                type="single"
                collapsible
                value={value}
                onValueChange={setValue}
                className="space-y-6"
            >
                {data.map((item) => (
                    <Accordion.Item
                        key={item.id}
                        value={item.id.toString()}
                        className="border-none"
                    >
                        <Accordion.Header>
                            <Accordion.Trigger className="flex items-center gap-4 group w-full outline-none">
                                {/* Question Chat Bubble (Left) */}
                                <div
                                    className={cn(
                                        "bg-zinc-800 text-zinc-200 px-6 py-4 rounded-3xl rounded-tl-none text-left font-medium transition-all max-w-[85%]",
                                        value === item.id.toString() ? "bg-zinc-700 text-white" : "hover:bg-zinc-700/80"
                                    )}
                                >
                                    {item.question}
                                </div>

                                {/* Toggle Icon */}
                                <div className="text-zinc-500 transition-transform duration-300 group-data-[state=open]:rotate-180">
                                    {value === item.id.toString() ? (
                                        <Minus className="w-5 h-5" />
                                    ) : (
                                        <Plus className="w-5 h-5" />
                                    )}
                                </div>
                            </Accordion.Trigger>
                        </Accordion.Header>

                        <Accordion.Content forceMount>
                            <AnimatePresence initial={false}>
                                {value === item.id.toString() && (
                                    <motion.div
                                        initial={{ opacity: 0, height: 0, y: -10 }}
                                        animate={{ opacity: 1, height: "auto", y: 0 }}
                                        exit={{ opacity: 0, height: 0, y: -10 }}
                                        transition={{ duration: 0.3, ease: "easeOut" }}
                                        className="overflow-hidden"
                                    >
                                        <div className="flex justify-end mt-4">
                                            {/* Answer Chat Bubble (Right) */}
                                            <div className="bg-brand-primary text-white px-6 py-4 rounded-3xl rounded-tr-none max-w-[85%] shadow-lg shadow-brand-primary/20 leading-relaxed">
                                                {item.answer}
                                            </div>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </Accordion.Content>
                    </Accordion.Item>
                ))}
            </Accordion.Root>
        </div>
    );
}
