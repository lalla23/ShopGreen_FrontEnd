import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { login } from "../services/authService";
import { UserRole } from "../types";

interface LoginProps {
    onLoginSuccess: (user: { role: UserRole; name: string }) => void;
}

const Login: React.FC<LoginProps> = ({ onLoginSuccess }) => {

    type OpzioniAuth = "login" | "register";
    const [error, setError] = useState('');
    const [activeTab, setActiveTab] = useState<OpzioniAuth>('login');
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);

const handleLogin = async(e:React.FormEvent) => {
    
    e.preventDefault(); //prevengo relod pagina se no si eliminano i dati inseriti dall'utente

    setError('');
    setIsLoading(true);

    try{
        const userDati = await login(username, password); //questa è la risposta del login da authService
        onLoginSuccess(userDati);
    }catch(error){
        console.log("errore " + error.message);

    }finally{
        setIsLoading(false);
    }
}
    return (
        <div className="min-h-[calc(100vh-64px)] flex items-center justify-center bg-gray-50 p-4">
            <div className="w-full max-w-md bg-white rounded-[30px] shadow-xl p-8 border border-gray-100">
               
                <div className="flex bg-gray-200 rounded-full p-1 mb-8 relative">
                    <button
                        onClick={() => setActiveTab("login")}
                        className={`flex-1 py-3 rounded-full text-sm font-bold transition-all duration-300 z-10 
               ${
                   activeTab === "login"
                       ? "bg-[#7dad57] text-white shadow-md"
                       : "text-gray-600 hover:text-gray-800"
               }`}
                    >
                        accedi
                    </button>
                    <button
                        onClick={() => setActiveTab("register")}
                        className={`flex-1 py-3 rounded-full text-sm font-bold transition-all duration-300 z-10
               ${
                   activeTab === "register"
                       ? "bg-[#7dad57] text-white shadow-md"
                       : "text-gray-600 hover:text-gray-800"
               }`}
                    >
                        Registrati
                    </button>
                </div>

                {activeTab === "login" ? (
                    <form
                        onSubmit={handleLogin}
                        className="space-y-5 animate-in fade-in duration-300"
                    >
                        {error && (
                            <div className="bg-red-50 text-red-600 text-sm p-3 rounded-xl text-center">
                                {error}
                            </div>
                        )}

                        <div className="space-y-1">
                            <input
                                type="text"
                                placeholder="username"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                className="w-full bg-gray-200 text-gray-800 placeholder-gray-500 px-6 py-4 rounded-full focus:outline-none focus:ring-2 focus:ring-[#7dad57] transition-all"
                            />
                        </div>

                        <div className="space-y-1">
                            <input
                                type="password"
                                placeholder="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full bg-gray-200 text-gray-800 placeholder-gray-500 px-6 py-4 rounded-full focus:outline-none focus:ring-2 focus:ring-[#7dad57] transition-all"
                            />
                            <div className="px-2">
                                <a
                                    href="#"
                                    className="text-xs text-[#7dad57] hover:underline pl-2 font-medium"
                                >
                                    password dimenticata?
                                </a>
                            </div>
                        </div>

                        <div className="pt-2 flex justify-center">
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="bg-[#d9e8cd] text-black font-bold text-lg px-12 py-3 rounded-2xl hover:bg-[#c4dbb3] transition-colors shadow-sm"
                            >
                                {isLoading ? "caricamento" : "Accedi"}
                            </button>
                        </div>

                        <div className="relative py-4">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-gray-300"></div>
                            </div>
                            <div className="relative flex justify-center text-sm">
                                <span className="px-2 bg-white text-gray-400 font-medium">
                                    oppure
                                </span>
                            </div>
                        </div>

                        <button
                            type="button"
                            className="w-full border border-gray-300 bg-white hover:bg-gray-50 text-gray-700 font-bold py-3.5 px-4 rounded-xl flex items-center justify-center gap-3 transition-colors shadow-sm"
                        >
                            <svg className="w-5 h-5" viewBox="0 0 24 24">
                                <path
                                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                                    fill="#4285F4"
                                />
                                <path
                                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                                    fill="#34A853"
                                />
                                <path
                                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                                    fill="#FBBC05"
                                />
                                <path
                                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                                    fill="#EA4335"
                                />
                            </svg>
                            Accedi con Google
                        </button>
                    </form>
                ) : (
                    <div className="text-center py-10 animate-in fade-in duration-300">
                        <h3 className="text-xl font-bold text-gray-700 mb-2">
                            Registrazione
                        </h3>
                        <p className="text-gray-500 text-sm mb-6">
                            La registrazione è disabilitata nella demo.
                        </p>
                        <button
                            onClick={() => setActiveTab("login")}
                            className="text-[#7dad57] font-bold hover:underline"
                        >
                            Torna al login
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};
