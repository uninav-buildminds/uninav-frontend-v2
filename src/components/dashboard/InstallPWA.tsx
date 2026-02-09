import React, {useState, useEffect} from 'react';
import {AndroidIcon} from "@hugeicons/core-free-icons";
import {HugeiconsIcon} from "@hugeicons/react";
import {deferredPrompt} from '../../main';

interface InstallPWAProps {
    variant: "default" | "landscape";
}

const InstallPWA = (props: InstallPWAProps) => {
    const [isInstallable, setIsInstallable] = useState(!!deferredPrompt);
    const [installPrompt, setInstallPrompt] = useState(deferredPrompt);

    useEffect(() => {
        const handleBeforeInstallPrompt = (e) => {
            e.preventDefault();
            setInstallPrompt(e);
            setIsInstallable(true);
        };

        // Listen for the raw event (in case it happens now)
        window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

        // Listen for the custom event
        window.addEventListener('pwa-ready', () => {
            setInstallPrompt(deferredPrompt);
            setIsInstallable(true);
        });

        return () => {
            window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
            window.removeEventListener('pwa-ready', handleBeforeInstallPrompt);
        };
    }, []);

    const handleInstallClick = async () => {
        if (!installPrompt) return;
        installPrompt.prompt();
        await installPrompt.userChoice;

        // We've used the prompt, so we can't use it again.
        setInstallPrompt(null);
        setIsInstallable(false);
    };

    if (!isInstallable) return null;

    if (props.variant == "landscape") {
        return (
            <button
                onClick={handleInstallClick}
                aria-label="Install UniNav"
                title="Install UniNav"
                className="w-full text-sm text-white bg-brand rounded-lg px-4 py-2 flex items-center justify-center gap-2 transition-colors">
                <HugeiconsIcon icon={AndroidIcon} size={16}/>
                Install
            </button>
        );
    }
    return (
        <button
            className="flex flex-col items-center gap-1"
            aria-label="Install UniNav"
            title="Install UniNav"
            onClick={handleInstallClick}>
            <div
                className="rounded-2xl transition-all duration-200 hover:scale-105 hover:bg-[#DCDFFE] h-10 w-10 grid place-items-center ">
                <HugeiconsIcon icon={AndroidIcon} size={16} className="text-gray-700"/>
            </div>
            <span className="text-[11px] text-gray-700 text-wrap font-normal">
				Install
			</span>
        </button>
    );
};

export default InstallPWA;