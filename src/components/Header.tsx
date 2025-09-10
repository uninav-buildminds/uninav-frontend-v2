import React, { useContext, useState } from "react";
import { LayoutDashboard, LogOut, Menu, Upload, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Menubar, MenubarContent, MenubarItem, MenubarMenu, MenubarTrigger } from "./ui/menubar";
import { useGoogleOneTapLogin } from "@react-oauth/google";
import { toast } from "sonner";
import AuthContext from "@/context/authentication/AuthContext";
import { signInWithOneTap } from "@/api/auth.api";

const ChevronDownIcon = () => (
  <svg
    className="ml-1 h-4 w-4 text-current"
    fill="none"
    stroke="currentColor"
    strokeWidth={2}
    viewBox="0 0 24 24"
    aria-hidden="true"
  >
    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
  </svg>
);

const Header: React.FC = () => {
	const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
	const { user, isLoading, refreshAuthState, logOut } = useContext(AuthContext);
	
	useGoogleOneTapLogin({
		onSuccess: (credentialResponse) =>
			signInWithOneTap(credentialResponse, refreshAuthState, () =>
				toast.error("Google One Tap login failed")
			),
		onError: () => {
			toast.error("Google One Tap login failed");
		},
		disabled: user !== undefined || isLoading,
	});

	const toggleMobileMenu = () => {
		setIsMobileMenuOpen(!isMobileMenuOpen);
	};

  return (
		<div className="fixed top-6 inset-x-0 z-fixed flex justify-center px-4">
			<motion.div
				className="w-[min(1100px,100%)] flex items-center justify-between gap-4 rounded-full border bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/60 shadow-sm px-4 md:px-6 py-3"
				initial={{ opacity: 0, y: -8 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}>
				<a href="/" className="inline-flex items-center gap-2">
					<img
						src="/assets/logo.svg"
						alt="UniNav logo"
						className="h-8 w-auto"
					/>
					<span className="text-base font-semibold text-brand">
						UniNav
					</span>
				</a>

				{/* Desktop Navigation */}
				<nav className="hidden md:flex items-center gap-6 text-sm">
					<a
						href="#home"
						className="hover:text-brand transition-colors">
						Home
					</a>
					<a
						href="#browse"
						className="flex items-center hover:text-brand transition-colors">
						Browse Courses
						<ChevronDownIcon />
					</a>
					<a
						href="#faqs"
						className="hover:text-brand transition-colors">
						FAQs
					</a>
					<a
						href="#contact"
						className="hover:text-brand transition-colors">
						Contact
					</a>
				</nav>

				{/* Desktop Actions */}
				<div className="hidden md:flex items-center gap-3">
					{user && (
						<>
							<Menubar className="bg-transparent border-0">
								<MenubarMenu>
									<MenubarTrigger className="data-[state=open]:bg-transparent focus:bg-transparent px-0">
										<span className="inline-flex items-center justify-center rounded-full px-4 py-2 text-sm font-medium text-white bg-brand">
											{user.firstName}
										</span>
									</MenubarTrigger>
									<MenubarContent>
										<MenubarItem>
											<Upload size={16} />
											<span className="ms-2">Upload</span>
										</MenubarItem>
										<MenubarItem>
											<LayoutDashboard size={16} />
											<a
												className="ms-2"
												href="/dashboard">
												Dashboard
											</a>
										</MenubarItem>
										<MenubarItem onClick={logOut}>
											<LogOut size={16} />
											<span className="ms-2">Logout</span>
										</MenubarItem>
									</MenubarContent>
								</MenubarMenu>
							</Menubar>
						</>
					)}
					{!user && isLoading && (
						<div className="inline-flex items-center justify-center rounded-full border border-brand px-4 py-2 text-sm font-medium text-brand">
							<span>Validating</span>
							<div className="ms-2 animate-spin rounded-full h-4 w-4 border-b-2 border-brand"></div>
						</div>
					)}
					{!user && !isLoading && (
						<a
							href="/auth/signin"
							className="inline-flex items-center justify-center rounded-full border border-brand px-4 py-2 text-sm font-medium text-brand">
							<span>Sign In</span>
						</a>
					)}
				</div>

				{/* Mobile Menu Button */}
				<button
					onClick={toggleMobileMenu}
					className="md:hidden inline-flex items-center justify-center p-2 rounded-full hover:bg-gray-100 transition-colors"
					aria-label="Toggle mobile menu"
					aria-expanded={isMobileMenuOpen}
					aria-controls="mobile-menu">
					{isMobileMenuOpen ? (
						<X className="h-5 w-5 text-gray-600" />
					) : (
						<Menu className="h-5 w-5 text-gray-600" />
					)}
				</button>
			</motion.div>

			{/* Mobile Menu */}
			<AnimatePresence>
				{isMobileMenuOpen && (
					<motion.div
						id="mobile-menu"
						className="md:hidden absolute top-full left-4 right-4 mt-2 bg-white rounded-2xl border shadow-lg backdrop-blur supports-[backdrop-filter]:bg-white/95"
						initial={{ opacity: 0, y: -8 }}
						animate={{ opacity: 1, y: 0 }}
						exit={{ opacity: 0, y: -8 }}
						transition={{
							duration: 0.25,
							ease: [0.22, 1, 0.36, 1],
						}}>
						<nav className="p-4 space-y-3">
							<a
								href="#home"
								className="block px-4 py-3 rounded-xl hover:bg-gray-50 transition-colors text-sm font-medium"
								onClick={() => setIsMobileMenuOpen(false)}>
								Home
							</a>
							<a
								href="#browse"
								className="block px-4 py-3 rounded-xl hover:bg-gray-50 transition-colors text-sm font-medium"
								onClick={() => setIsMobileMenuOpen(false)}>
								Browse Courses
							</a>
							<a
								href="#faqs"
								className="block px-4 py-3 rounded-xl hover:bg-gray-50 transition-colors text-sm font-medium"
								onClick={() => setIsMobileMenuOpen(false)}>
								FAQs
							</a>
							<a
								href="#contact"
								className="block px-4 py-3 rounded-xl hover:bg-gray-50 transition-colors text-sm font-medium"
								onClick={() => setIsMobileMenuOpen(false)}>
								Contact
							</a>
						</nav>

						<div className="border-t p-4 space-y-3">
							{user && (
								<>
									<a
										href="#upload"
										className="block w-full text-center rounded-xl px-4 py-3 text-sm font-medium text-white bg-brand"
										onClick={() =>
											setIsMobileMenuOpen(false)
										}>
										Upload
									</a>
									<a
										href="/dashboard"
										className="block w-full text-center rounded-xl px-4 py-3 text-sm font-medium text-white bg-brand"
										onClick={() =>
											setIsMobileMenuOpen(false)
										}>
										Dashboard
									</a>
									<button
										onClick={() => {
											logOut();
											setIsMobileMenuOpen(false);
										}}
										className="block w-full text-center rounded-xl px-4 py-3 text-sm font-medium text-white bg-red-600 hover:bg-red-700 transition-colors">
										Logout
									</button>
								</>
							)}
							{!user && isLoading && (
								<div className="flex justify-center items-center gap-4 w-full text-center rounded-xl border border-brand px-4 py-3 text-sm font-medium text-brand">
									<span>Validating</span>
									<div className="animate-spin rounded-full h-4 w-4 border-b-2 border-brand"></div>
								</div>
							)}
							{!user && !isLoading && (
								<a
									href="/auth/signin"
									className="block w-full text-center rounded-xl border border-brand px-4 py-3 text-sm font-medium text-brand"
									onClick={() => setIsMobileMenuOpen(false)}>
									Sign In
								</a>
							)}
						</div>
					</motion.div>
				)}
			</AnimatePresence>
		</div>
	);
};

export default Header;
