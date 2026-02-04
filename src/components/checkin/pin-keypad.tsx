"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Delete, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface PinKeypadProps {
    onComplete: (pin: string) => void;
    onCancel: () => void;
    isLoading?: boolean;
}

export function PinKeypad({ onComplete, onCancel, isLoading }: PinKeypadProps) {
    const [pin, setPin] = useState("");

    const handleNumberClick = (num: number) => {
        if (pin.length < 4) {
            const newPin = pin + num;
            setPin(newPin);
        }
    };

    const handleDelete = () => {
        setPin(pin.slice(0, -1));
    };

    return (
        <div className="w-full max-w-sm mx-auto space-y-8">
            <div className="flex justify-center gap-4 mb-8">
                {[0, 1, 2, 3].map((i) => (
                    <div
                        key={i}
                        className={cn(
                            "w-12 h-12 rounded-full border-2 flex items-center justify-center transition-all",
                            pin[i]
                                ? "bg-primary border-primary text-primary-foreground"
                                : "border-muted-foreground/30 bg-muted/10"
                        )}
                    >
                        {pin[i] && <span className="text-3xl font-bold">•</span>}
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-3 gap-4">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
                    <Button
                        key={num}
                        variant="outline"
                        className="h-20 text-2xl font-bold rounded-full hover:bg-primary/10 transition-all border-2"
                        onClick={() => handleNumberClick(num)}
                        disabled={isLoading || pin.length >= 4}
                    >
                        {num}
                    </Button>
                ))}

                <Button
                    variant="ghost"
                    className="h-20 rounded-full text-destructive hover:bg-destructive/10 hover:text-destructive"
                    onClick={onCancel}
                    disabled={isLoading}
                >
                    <X className="w-8 h-8" />
                </Button>

                <Button
                    variant="outline"
                    className="h-20 text-2xl font-bold rounded-full hover:bg-primary/10 transition-all border-2"
                    onClick={() => handleNumberClick(0)}
                    disabled={isLoading || pin.length >= 4}
                >
                    0
                </Button>

                <Button
                    variant="ghost"
                    className="h-20 rounded-full hover:bg-muted"
                    onClick={handleDelete}
                    disabled={isLoading || pin.length === 0}
                >
                    <Delete className="w-8 h-8" />
                </Button>
            </div>

            <div className="pt-4">
                <Button
                    className="w-full h-14 text-xl font-bold rounded-xl"
                    onClick={() => onComplete(pin)}
                    disabled={isLoading || pin.length < 4}
                >
                    {isLoading ? "Verificando..." : "ENTRAR"}
                </Button>
            </div>
        </div>
    );
}
