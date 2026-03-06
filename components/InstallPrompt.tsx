import React, { useState, useEffect } from 'react';
import { Download, X, Share, PlusSquare, Smartphone } from 'lucide-react';

export const InstallPrompt: React.FC = () => {
    const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
    const [showPrompt, setShowPrompt] = useState(false);
    const [platform, setPlatform] = useState<'ios' | 'android' | 'other'>('other');

    useEffect(() => {
        // Detect platform
        const userAgent = window.navigator.userAgent.toLowerCase();
        const isIos = /iphone|ipad|ipod/.test(userAgent);
        const isAndroid = /android/.test(userAgent);

        if (isIos) {
            setPlatform('ios');
        } else if (isAndroid) {
            setPlatform('android');
        }

        // Check if already installed
        const isStandalone = window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone;
        
        if (!isStandalone) {
            // For Android/Chrome
            window.addEventListener('beforeinstallprompt', (e) => {
                e.preventDefault();
                setDeferredPrompt(e);
                setShowPrompt(true);
            });

            // For iOS, we show it after a small delay if not standalone
            if (isIos) {
                const hasShownIosPrompt = localStorage.getItem('hasShownIosInstallPrompt');
                if (!hasShownIosPrompt) {
                    setTimeout(() => setShowPrompt(true), 3000);
                }
            }
        }
    }, []);

    const handleInstallClick = async () => {
        if (deferredPrompt) {
            deferredPrompt.prompt();
            const { outcome } = await deferredPrompt.userChoice;
            if (outcome === 'accepted') {
                setDeferredPrompt(null);
                setShowPrompt(false);
            }
        }
    };

    const closePrompt = () => {
        setShowPrompt(false);
        if (platform === 'ios') {
            localStorage.setItem('hasShownIosInstallPrompt', 'true');
        }
    };

    if (!showPrompt) return null;

    return (
        <div className="fixed bottom-4 left-4 right-4 z-[100] animate-in slide-in-from-bottom-10 duration-500">
            <div className="bg-white rounded-2xl shadow-2xl border border-blue-100 p-4 flex flex-col gap-3 max-w-md mx-auto">
                <div className="flex justify-between items-start">
                    <div className="flex items-center gap-3">
                        <div className="bg-blue-600 p-2 rounded-xl shadow-lg">
                            <Smartphone className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h3 className="font-bold text-blue-900 leading-tight">Instalar Aplicativo</h3>
                            <p className="text-xs text-blue-500">Acesse o Pitangueiras FC mais rápido!</p>
                        </div>
                    </div>
                    <button onClick={closePrompt} className="p-1 hover:bg-blue-50 rounded-full transition-colors">
                        <X className="w-5 h-5 text-blue-400" />
                    </button>
                </div>

                {platform === 'ios' ? (
                    <div className="bg-blue-50 p-3 rounded-xl space-y-2">
                        <p className="text-xs text-blue-800 font-medium">Para instalar no seu iPhone:</p>
                        <ol className="text-[11px] text-blue-600 space-y-1 list-decimal list-inside">
                            <li className="flex items-center gap-1">Toque no ícone de compartilhar <Share className="w-3 h-3 inline" /></li>
                            <li className="flex items-center gap-1">Role para baixo e toque em "Adicionar à Tela de Início" <PlusSquare className="w-3 h-3 inline" /></li>
                        </ol>
                    </div>
                ) : (
                    <button 
                        onClick={handleInstallClick}
                        className="w-full py-3 bg-blue-600 text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-blue-700 transition-all shadow-lg shadow-blue-200"
                    >
                        <Download className="w-4 h-4" /> Instalar Agora
                    </button>
                )}
            </div>
        </div>
    );
};
