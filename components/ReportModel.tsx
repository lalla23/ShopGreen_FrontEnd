import React, { useState } from "react";
import { Shop } from "../types";
import { X, AlertTriangle, CheckCircle, Info } from "lucide-react";

interface ReportModalProps {
    shop: Shop | null;
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (shopId: string, reason: string, details: string) => void;
}

const ReportModal: React.FC<ReportModalProps> = ({
    shop,
    isOpen,
    onClose,
    onSubmit,
}) => {
    const [reason, setReason] = useState("");
    const [details, setDetails] = useState("");
    const [isSuccess, setIsSuccess] = useState(false);

    if (!isOpen || !shop) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit(shop.id, reason, details);
        setIsSuccess(true);

        // Close after success message
        setTimeout(() => {
            setIsSuccess(false);
            setReason("");
            setDetails("");
            onClose();
        }, 2000);
    };

    const handleClose = () => {
        if (!isSuccess) {
            setReason("");
            setDetails("");
        }
        onClose();
    };

    const REASONS = [
        { val: "closed", label: "Attività chiusa" },
        { val: "sustainability", label: "Non sostenibile" },
        { val: "data_error", label: "Dati errati" },
        { val: "other", label: "Altro" },
    ];

    return (
        <div className="fixed inset-0 z-[3000] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="w-full max-w-md bg-white rounded-[30px] shadow-2xl p-8 border border-gray-100 relative animate-in fade-in zoom-in duration-300">
                {/* Header */}
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-gray-900">
                        Segnala Problema
                    </h2>
                    <button
                        onClick={handleClose}
                        className="p-2 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors"
                    >
                        <X className="w-5 h-5 text-gray-500" />
                    </button>
                </div>

                {!isSuccess ? (
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Context Info */}
                        <div className="bg-[#f0fdf4] p-4 rounded-2xl border border-green-100 flex items-center gap-3">
                            <div className="bg-white p-2 rounded-full shadow-sm">
                                <AlertTriangle className="w-5 h-5 text-[#7dad57]" />
                            </div>
                            <div>
                                <p className="text-xs text-green-600 font-bold uppercase tracking-wider">
                                    Attività
                                </p>
                                <p className="text-gray-900 font-bold leading-tight">
                                    {shop.name}
                                </p>
                            </div>
                        </div>

                        {/* Reason Grid (Radio Buttons styled as pills) */}
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-gray-600 ml-2">
                                Motivo della segnalazione
                            </label>
                            <div className="grid grid-cols-2 gap-3">
                                {REASONS.map((opt) => (
                                    <button
                                        key={opt.val}
                                        type="button"
                                        onClick={() => setReason(opt.val)}
                                        className={`py-3 px-2 rounded-xl text-sm font-bold transition-all duration-200 border-2
                                    ${
                                        reason === opt.val
                                            ? "bg-[#7dad57] text-white border-[#7dad57] shadow-md transform scale-[1.02]"
                                            : "bg-gray-100 text-gray-500 border-transparent hover:bg-gray-200"
                                    }
                                `}
                                    >
                                        {opt.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Details Textarea */}
                        <div
                            className={`transition-all duration-300 overflow-hidden ${
                                reason
                                    ? "max-h-48 opacity-100"
                                    : "max-h-0 opacity-0"
                            }`}
                        >
                            <label className="text-sm font-bold text-gray-600 ml-2 mb-2 block">
                                Dettagli aggiuntivi
                            </label>
                            <textarea
                                required={
                                    reason === "data_error" ||
                                    reason === "other"
                                }
                                value={details}
                                onChange={(e) => setDetails(e.target.value)}
                                placeholder="Descrivi brevemente il problema..."
                                className="w-full bg-gray-200 text-gray-800 placeholder-gray-500 px-5 py-4 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#7dad57] transition-all resize-none h-32"
                            />
                        </div>

                        {/* Submit Button */}
                        <div className="pt-2">
                            <button
                                type="submit"
                                disabled={!reason}
                                className="w-full bg-[#d9e8cd] text-black font-bold text-lg py-3 rounded-2xl hover:bg-[#c4dbb3] transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed transform active:scale-95"
                            >
                                Invia Segnalazione
                            </button>
                        </div>
                    </form>
                ) : (
                    // Success State
                    <div className="flex flex-col items-center justify-center py-12 space-y-6">
                        <div className="w-24 h-24 bg-[#d9e8cd] rounded-full flex items-center justify-center animate-bounce shadow-lg">
                            <CheckCircle className="w-12 h-12 text-green-800" />
                        </div>
                        <div className="text-center space-y-2">
                            <h3 className="text-3xl font-bold text-gray-900">
                                Ricevuto!
                            </h3>
                            <p className="text-gray-500 max-w-xs mx-auto">
                                Grazie per il tuo contributo. Verificheremo la
                                segnalazione al più presto.
                            </p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ReportModal;
