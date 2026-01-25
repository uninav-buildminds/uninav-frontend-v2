import { AndroidIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useEffect, useState } from "react";

interface InstallPWAProps {
	variant: "default" | "landscape";
}

const InstallPWA = (props: InstallPWAProps) => {
	const [supportsPWA, setSupportsPWA] = useState(false);
	const [promptInstall, setPromptInstall] = useState(null);

	useEffect(() => {
		const handler = (e) => {
			// 1. Prevent the mini-infobar from appearing on mobile
			e.preventDefault();

			// 2. Save the event so it can be triggered later.
			setPromptInstall(e);
			setSupportsPWA(true);
		};

		// 3. Listen for the 'beforeinstallprompt' event
		window.addEventListener("beforeinstallprompt", handler);

		return () => window.removeEventListener("beforeinstallprompt", handler);
	}, []);

	const onClick = (evt) => {
		evt.preventDefault();
		if (!promptInstall) {
			return;
		}

		// 4. Show the install prompt
		promptInstall.prompt();

		// 5. Wait for the user to respond to the prompt
		promptInstall.userChoice.then((choiceResult) => {
			if (choiceResult.outcome === "accepted") {
				console.log("User accepted the install prompt");
			} else {
				console.log("User dismissed the install prompt");
			}
			// Clear the saved prompt since it can't be used again
			setPromptInstall(null);
			setSupportsPWA(false); // Hide the button
		});
	};

	// Only show the button if the browser supports it and hasn't been installed yet
	if (!supportsPWA) {
		return null;
	}

	if (props.variant == "landscape") {
		return (
			<button
				onClick={onClick}
				aria-label="Install UniNav"
				title="Install UniNav"
				className="w-full text-sm text-white bg-brand rounded-lg px-4 py-2 flex items-center justify-center gap-2 transition-colors">
				<HugeiconsIcon icon={AndroidIcon} size={16} />
				Install
			</button>
		);
	}
	return (
		<button
			className="flex flex-col items-center gap-1"
			aria-label="Install UniNav"
			title="Install UniNav"
			onClick={onClick}>
			<div className="rounded-2xl transition-all duration-200 hover:scale-105 hover:bg-[#DCDFFE] h-10 w-10 grid place-items-center ">
				<HugeiconsIcon icon={AndroidIcon} size={16} className="text-gray-700" />
			</div>
			<span className="text-[11px] text-gray-700 text-wrap font-normal">
				Install
			</span>
		</button>
	);
};

export default InstallPWA;
