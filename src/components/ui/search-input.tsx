"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useDebounce } from "@/hooks/use-debounce";
import { useEffect, useState, useTransition } from "react";
import { Input } from "@/components/ui/input";
import { Loader2, Search, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface SearchInputProps {
    placeholder?: string;
    className?: string;
    defaultValue?: string;
}

export function SearchInput({
    placeholder = "Buscar...",
    className,
    defaultValue
}: SearchInputProps) {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    // Initialize with URL param or provided default
    const initialQuery = searchParams.get("search") ?? defaultValue ?? "";
    const [value, setValue] = useState(initialQuery);
    const debouncedValue = useDebounce(value, 400);
    const [isPending, startTransition] = useTransition();

    useEffect(() => {
        const params = new URLSearchParams(searchParams);

        if (debouncedValue) {
            params.set("search", debouncedValue);
        } else {
            params.delete("search");
        }

        startTransition(() => {
            router.replace(`${pathname}?${params.toString()}`);
        });
    }, [debouncedValue, pathname, router, searchParams]);

    return (
        <div className={cn("relative", className)}>
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
                type="text"
                placeholder={placeholder}
                className="pl-9 pr-8"
                value={value}
                onChange={(e) => setValue(e.target.value)}
            />
            {isPending ? (
                <Loader2 className="absolute right-2.5 top-2.5 h-4 w-4 animate-spin text-muted-foreground" />
            ) : value ? (
                <button
                    onClick={() => setValue("")}
                    className="absolute right-2.5 top-2.5 text-muted-foreground hover:text-foreground"
                >
                    <X className="h-4 w-4" />
                </button>
            ) : null}
        </div>
    );
}
