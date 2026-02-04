"use client";

import { useEffect, useState } from "react";
import { motion, useSpring, useTransform } from "framer-motion";

type Props = {
    value: number;
    duration?: number;
    className?: string;
};

export function AnimatedCounter({ value, duration = 1, className }: Props) {
    const [isClient, setIsClient] = useState(false);

    useEffect(() => {
        setIsClient(true);
    }, []);

    const spring = useSpring(0, {
        bounce: 0,
        duration: duration * 1000,
    });

    const display = useTransform(spring, (current) =>
        Math.round(current).toLocaleString()
    );

    useEffect(() => {
        if (isClient) {
            spring.set(value);
        }
    }, [spring, value, isClient]);

    if (!isClient) {
        return <span className={className}>{value}</span>;
    }

    return <motion.span className={className}>{display}</motion.span>;
}
