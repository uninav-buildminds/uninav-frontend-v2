import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import SignupForm from "./pages/auth/signup/SignupForm";
import RequestEmailVerification from "./pages/auth/verification/RequestEmailVerification";
import ProfileSetup from "./pages/auth/signup/ProfileSetup";
import SignupSuccess from "./pages/auth/signup/SignupSuccess";
import SigninForm from "./pages/auth/signin/SigninForm";
import RequestReset from "./pages/auth/password/RequestReset";
import CheckInbox from "./pages/auth/password/CheckInbox";
import NewPassword from "./pages/auth/password/NewPassword";
import ResetSuccess from "./pages/auth/password/ResetSuccess";
import ProcessEmailVerification from "./pages/auth/verification/ProcessEmailVerification";
import { AuthRedirect, ProtectedRoute } from "./components/auth/AuthRedirect";
import NotFound from "./pages/NotFound";
import Overview from "./pages/dashboard/Overview";
import ManagementLayout from "./components/management/ManagementLayout";
import ManagementDashboard from "./pages/management/ManagementDashboard";
import CourseManagement from "./pages/management/CourseManagement";
import CoursesReviewPage from "./pages/management/courses-review";
import DLCReviewPage from "./pages/management/dlc-review";
import BlogsReviewPage from "./pages/management/blogs-review";
import UserManagementPage from "./pages/management/user-management";
import { GoogleOAuthProvider } from "@react-oauth/google";
import AuthContextProvider from "./context/authentication/AuthContextProvider";

const queryClient = new QueryClient();

const App = () => {
  return (
		<QueryClientProvider client={queryClient}>
			<TooltipProvider>
				<Toaster />
				<Sonner />
				<BrowserRouter>
					<GoogleOAuthProvider
						clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
						<AuthContextProvider>
							<Routes>
								<Route path="/" element={<Index />} />
								{/* Dashboard */}
								<Route
									path="/dashboard"
									element={
										<ProtectedRoute>
											<Overview />
										</ProtectedRoute>
									}
								/>

								{/* Management Routes */}
								<Route
									path="/management"
									element={
										<ProtectedRoute>
											<ManagementLayout />
										</ProtectedRoute>
									}>
									{/* Management Dashboard - Default route */}
									<Route
										index
										element={<ManagementDashboard />}
									/>

									{/* Management Sub-routes */}
									<Route
										path="courses"
										element={<CourseManagement />}
									/>
									<Route
										path="courses-review"
										element={<CoursesReviewPage />}
									/>
									<Route
										path="dlc-review"
										element={<DLCReviewPage />}
									/>
									<Route
										path="blogs-review"
										element={<BlogsReviewPage />}
									/>
									<Route
										path="user-management"
										element={<UserManagementPage />}
									/>
									{/* Future routes can be added here */}
									{/* <Route path="materials" element={<MaterialsManagement />} /> */}
									{/* <Route path="blogs" element={<BlogsManagement />} /> */}
									{/* <Route path="users" element={<UsersManagement />} /> */}
								</Route>

								{/* Auth - Signup */}
								<Route
									path="/auth/signup"
									element={
										<AuthRedirect>
											<SignupForm />
										</AuthRedirect>
									}
								/>
								<Route
									path="/auth/signup/verify"
									element={
										<AuthRedirect>
											<RequestEmailVerification />
										</AuthRedirect>
									}
								/>
								<Route
									path="/auth/signup/profile"
									element={
										<ProtectedRoute>
											<ProfileSetup />
										</ProtectedRoute>
									}
								/>
								<Route
									path="/auth/signup/success"
									element={
										<ProtectedRoute>
											<SignupSuccess />
										</ProtectedRoute>
									}
								/>

								{/* Auth - Signin */}
								<Route
									path="/auth/signin"
									element={
										<AuthRedirect>
											<SigninForm />
										</AuthRedirect>
									}
								/>
								<Route
									path="/auth/verify-email"
									element={
										<AuthRedirect>
											<ProcessEmailVerification />
										</AuthRedirect>
									}
								/>

								{/* Auth - Password Reset */}
								<Route
									path="/auth/password/forgot"
									element={
										<AuthRedirect>
											<RequestReset />
										</AuthRedirect>
									}
								/>
								<Route
									path="/auth/password/check-inbox"
									element={
										<AuthRedirect>
											<CheckInbox />
										</AuthRedirect>
									}
								/>
								<Route
									path="/auth/reset-password"
									element={
										<AuthRedirect>
											<NewPassword />
										</AuthRedirect>
									}
								/>
								<Route
									path="/auth/password/success"
									element={
										<AuthRedirect>
											<ResetSuccess />
										</AuthRedirect>
									}
								/>

								{/* 404 - Catch all unmatched routes */}
								<Route path="*" element={<NotFound />} />
							</Routes>
						</AuthContextProvider>
					</GoogleOAuthProvider>
				</BrowserRouter>
			</TooltipProvider>
		</QueryClientProvider>
  );
};

export default App;
