"use client";

import { useActionState } from "react";
import { authenticate } from "@/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Lock, User } from "lucide-react";
import { motion } from "framer-motion";

export default function LoginPage() {
    const [errorMessage, formAction, isPending] = useActionState(authenticate, undefined);

    return (
        <div className="min-h-screen w-full flex items-center justify-center bg-zinc-950 relative overflow-hidden">
            {/* Background Effects */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0">
                <div className="absolute -top-[20%] -left-[10%] w-[70%] h-[70%] bg-purple-500/10 rounded-full blur-[120px]" />
                <div className="absolute top-[40%] -right-[10%] w-[60%] h-[60%] bg-blue-500/10 rounded-full blur-[120px]" />
            </div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="z-10 w-full max-w-md px-4"
            >
                <Card className="border-white/10 bg-white/5 backdrop-blur-xl shadow-2xl">
                    <CardHeader className="space-y-1 text-center">
                        <div className="mx-auto w-12 h-12 rounded-full bg-gradient-to-tr from-purple-500 to-blue-500 flex items-center justify-center mb-4 shadow-lg shadow-purple-500/20">
                            <Lock className="w-6 h-6 text-white" />
                        </div>
                        <CardTitle className="text-2xl font-bold tracking-tight text-white">
                            Bienvenido
                        </CardTitle>
                        <CardDescription className="text-zinc-400">
                            Inicia sesión para acceder al panel de administración
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form action={(formData) => {
                            formData.append("email", "marc@gymmanager.com"); // Hardcoded admin email

                            // Extract callbackUrl from window.location or searchParams if available
                            const params = new URLSearchParams(window.location.search);
                            const callbackUrl = params.get("callbackUrl");
                            if (callbackUrl) {
                                formData.append("callbackUrl", callbackUrl);
                            }

                            formAction(formData);
                        }} className="space-y-6">
                            <div className="space-y-2">
                                <Label htmlFor="password" className="text-zinc-300 text-center block text-lg font-medium">Contraseña de Acceso</Label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-3.5 h-5 w-5 text-zinc-500" />
                                    <Input
                                        id="password"
                                        type="password"
                                        name="password"
                                        placeholder="Ingrese su PIN"
                                        required
                                        className="pl-10 h-12 text-lg bg-zinc-900/50 border-zinc-800 text-white focus:ring-purple-500/50 focus:border-purple-500/50 text-center tracking-widest"
                                        autoFocus
                                    />
                                </div>
                            </div>

                            {errorMessage && (
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="p-3 rounded-md bg-red-500/10 border border-red-500/20 text-red-400 text-sm text-center"
                                >
                                    {errorMessage}
                                </motion.div>
                            )}

                            <Button
                                className="w-full h-12 text-lg bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white border-0 shadow-lg shadow-purple-500/25 transition-all duration-300"
                                type="submit"
                                disabled={isPending}
                            >
                                {isPending ? (
                                    <>
                                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                        Verificando...
                                    </>
                                ) : (
                                    "Entrar al Sistema"
                                )}
                            </Button>
                        </form>
                    </CardContent>
                    <CardFooter className="flex flex-col gap-2 text-center text-xs text-zinc-500">
                        <p>© 2026 Gym Manager OS</p>
                    </CardFooter>
                </Card>
            </motion.div>
        </div>
    );
}
