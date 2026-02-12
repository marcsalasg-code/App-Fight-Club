"use client";

import { useActionState, useEffect, useState } from "react";
import { authenticate } from "@/actions/auth";
import { getLoginUsers, type LoginUser } from "@/actions/login-users";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
// import { Label } from "@/components/ui/label"; // Unused in new design
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, ArrowLeft, ShieldCheck, User as UserIcon } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";

export default function LoginPage() {
    const [errorMessage, formAction, isPending] = useActionState(authenticate, undefined);

    // State
    const [users, setUsers] = useState<LoginUser[]>([]);
    const [isLoadingUsers, setIsLoadingUsers] = useState(true);
    const [selectedUser, setSelectedUser] = useState<LoginUser | null>(null);
    const [pin, setPin] = useState("");

    // Effects
    useEffect(() => {
        async function load() {
            try {
                const data = await getLoginUsers();
                setUsers(data);
            } catch (error) {
                toast.error("Error cargando usuarios");
            } finally {
                setIsLoadingUsers(false);
            }
        }
        load();
    }, []);

    useEffect(() => {
        if (errorMessage) {
            toast.error(errorMessage);
            setPin(""); // Clear PIN on error
        }
    }, [errorMessage]);

    // Handlers
    const handleUserSelect = (user: LoginUser) => {
        setSelectedUser(user);
        setPin("");
    };

    const handleBack = () => {
        setSelectedUser(null);
        setPin("");
    };

    const handlePinChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setPin(e.target.value);
    };

    // Auto-submit when PIN is 4 digits (optional but feels Kiosk-like)
    // Or just let them hit Enter/Button. Let's keep button for creating FormData properly.

    return (
        <div className="min-h-screen w-full flex flex-col items-center justify-center bg-zinc-950 text-zinc-100 relative overflow-hidden font-sans selection:bg-purple-500/30">

            {/* Background Atmosphere */}
            <div className="absolute inset-0 z-0 pointer-events-none">
                <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-purple-900/20 rounded-full blur-[120px]" />
                <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-indigo-900/20 rounded-full blur-[120px]" />
                <div className="absolute top-[20%] right-[20%] w-[30%] h-[30%] bg-blue-900/10 rounded-full blur-[100px]" />
            </div>

            <div className="z-10 w-full max-w-4xl px-6 flex flex-col items-center gap-8">

                {/* Brand Header */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center space-y-2"
                >
                    <div className="mx-auto w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-600 to-indigo-600 flex items-center justify-center shadow-xl shadow-purple-500/20 mb-4">
                        <ShieldCheck className="w-8 h-8 text-white" />
                    </div>
                    <h1 className="text-4xl font-bold tracking-tight text-white bg-clip-text text-transparent bg-gradient-to-b from-white to-white/70">
                        Gym Manager OS
                    </h1>
                    <p className="text-zinc-500 font-medium">Panel de Acceso Seguro</p>
                </motion.div>

                {/* Main Content Area */}
                <div className="w-full max-w-md min-h-[400px] relative perspective-1000">
                    <AnimatePresence mode="wait">

                        {/* VIEW 1: USER SELECTOR */}
                        {!selectedUser ? (
                            <motion.div
                                key="user-grid"
                                initial={{ opacity: 0, rotateY: -10, scale: 0.95 }}
                                animate={{ opacity: 1, rotateY: 0, scale: 1 }}
                                exit={{ opacity: 0, rotateY: 10, scale: 0.95 }}
                                transition={{ duration: 0.3 }}
                                className="w-full"
                            >
                                {isLoadingUsers ? (
                                    <div className="flex flex-col items-center justify-center py-20 gap-4">
                                        <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
                                        <p className="text-sm text-zinc-600">Conectando...</p>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {users.map((user) => (
                                            <button
                                                key={user.id}
                                                onClick={() => handleUserSelect(user)}
                                                className="group relative flex flex-col items-center p-6 rounded-xl bg-zinc-900/50 border border-zinc-800/50 hover:bg-zinc-800/50 hover:border-purple-500/30 transition-all duration-200 cursor-pointer text-center space-y-3"
                                            >
                                                {/* Avatar Placeholder */}
                                                <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-zinc-800 to-zinc-700 flex items-center justify-center text-2xl font-bold text-zinc-300 group-hover:scale-110 group-hover:from-purple-900 group-hover:to-indigo-900 group-hover:text-white transition-all duration-300 shadow-lg">
                                                    {user.name.substring(0, 2).toUpperCase()}
                                                </div>

                                                <div>
                                                    <h3 className="text-lg font-semibold text-zinc-200 group-hover:text-white transition-colors">
                                                        {user.name}
                                                    </h3>
                                                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${user.role === 'ADMIN' ? 'bg-amber-500/10 text-amber-500' : 'bg-blue-500/10 text-blue-500'}`}>
                                                        {user.role}
                                                    </span>
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </motion.div>
                        ) : (
                            /* VIEW 2: PIN ENTRY */
                            <motion.div
                                key="pin-entry"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                transition={{ duration: 0.3 }}
                                className="w-full"
                            >
                                <Card className="border-zinc-800 bg-zinc-900/80 backdrop-blur-xl shadow-2xl">
                                    <CardContent className="pt-8 pb-8 px-8 space-y-8">

                                        {/* Identify selected user */}
                                        <div className="text-center space-y-2">
                                            <button
                                                onClick={handleBack}
                                                className="absolute top-4 left-4 p-2 text-zinc-500 hover:text-white transition-colors rounded-full hover:bg-white/5"
                                                title="Volver"
                                            >
                                                <ArrowLeft className="w-5 h-5" />
                                            </button>

                                            <div className="mx-auto w-16 h-16 rounded-full bg-gradient-to-tr from-purple-900 to-indigo-900 flex items-center justify-center text-xl font-bold text-white shadow-inner mb-2">
                                                {selectedUser.name.substring(0, 2).toUpperCase()}
                                            </div>
                                            <h2 className="text-xl font-medium text-white">Hola, {selectedUser.name}</h2>
                                            <p className="text-sm text-zinc-500">Introduce tu PIN personal</p>
                                        </div>

                                        <form action={(formData) => {
                                            if (!selectedUser) return;
                                            formData.append("email", selectedUser.email);
                                            formAction(formData);
                                        }} className="space-y-6">

                                            <div className="space-y-4">
                                                <div className="relative">
                                                    <Input
                                                        type="password"
                                                        name="password"
                                                        value={pin}
                                                        onChange={handlePinChange}
                                                        placeholder="••••"
                                                        maxLength={6}
                                                        className="h-16 text-center text-3xl tracking-[0.5em] bg-black/50 border-zinc-700 text-white focus:ring-purple-500/50 focus:border-purple-500 placeholder:text-zinc-700 rounded-xl transition-all"
                                                        autoFocus
                                                        autoComplete="off"
                                                    />
                                                </div>
                                            </div>

                                            <Button
                                                className="w-full h-12 text-lg font-medium bg-white text-black hover:bg-zinc-200 transition-colors"
                                                type="submit"
                                                disabled={isPending || pin.length < 4}
                                            >
                                                {isPending ? (
                                                    <Loader2 className="w-5 h-5 animate-spin" />
                                                ) : (
                                                    "Acceder"
                                                )}
                                            </Button>
                                        </form>

                                    </CardContent>
                                </Card>
                            </motion.div>
                        )}

                    </AnimatePresence>
                </div>

                <div className="text-zinc-600 text-sm">
                    Versión 2.5.0 &bull; Secure Access
                </div>

            </div>
        </div>
    );
}
