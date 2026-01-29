"use client";

import { useEffect, useState } from "react";

interface CountdownProps {
    targetDate: Date;
    onEnd?: () => void;
    className?: string;
}

export function Countdown({ targetDate, onEnd, className = "" }: CountdownProps) {
    const [timeLeft, setTimeLeft] = useState<{
        days: number;
        hours: number;
        minutes: number;
        seconds: number;
    }>({ days: 0, hours: 0, minutes: 0, seconds: 0 });

    const [isEnded, setIsEnded] = useState(false);

    useEffect(() => {
        const calculateTimeLeft = () => {
            const difference = new Date(targetDate).getTime() - new Date().getTime();

            if (difference > 0) {
                setTimeLeft({
                    days: Math.floor(difference / (1000 * 60 * 60 * 24)),
                    hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
                    minutes: Math.floor((difference / 1000 / 60) % 60),
                    seconds: Math.floor((difference / 1000) % 60),
                });
            } else {
                setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
                if (!isEnded) {
                    setIsEnded(true);
                    onEnd?.();
                }
            }
        };

        const timer = setInterval(calculateTimeLeft, 1000);
        calculateTimeLeft(); // Initial call

        return () => clearInterval(timer);
    }, [targetDate, onEnd, isEnded]);

    if (isEnded) {
        return <span className={`text-zinc-500 font-medium ${className}`}>Lelang Berakhir</span>;
    }

    return (
        <div className={`flex gap-2 text-sm font-mono ${className}`}>
            <div className="flex flex-col items-center p-2 bg-zinc-100 dark:bg-zinc-800 rounded-lg min-w-[3rem]">
                <span className="font-bold text-zinc-900 dark:text-white">{timeLeft.days}</span>
                <span className="text-[10px] text-zinc-500 uppercase">Hari</span>
            </div>
            <div className="flex flex-col items-center p-2 bg-zinc-100 dark:bg-zinc-800 rounded-lg min-w-[3rem]">
                <span className="font-bold text-zinc-900 dark:text-white">{timeLeft.hours}</span>
                <span className="text-[10px] text-zinc-500 uppercase">Jam</span>
            </div>
            <div className="flex flex-col items-center p-2 bg-zinc-100 dark:bg-zinc-800 rounded-lg min-w-[3rem]">
                <span className="font-bold text-zinc-900 dark:text-white">{timeLeft.minutes}</span>
                <span className="text-[10px] text-zinc-500 uppercase">Mnt</span>
            </div>
            <div className="flex flex-col items-center p-2 bg-zinc-100 dark:bg-zinc-800 rounded-lg min-w-[3rem]">
                <span className="text-brand-primary font-bold">{timeLeft.seconds}</span>
                <span className="text-[10px] text-zinc-500 uppercase">Dtk</span>
            </div>
        </div>
    );
}
