import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ENV } from "@/lib/env.config";
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
import DashboardLayout from "./layouts/DashboardLayout";
import Overview from "./pages/dashboard/Overview";
import Libraries from "./pages/dashboard/Libraries";
import RecentMaterials from "./pages/dashboard/RecentMaterials";
import Recommendations from "./pages/dashboard/Recommendations";
import Notifications from "./pages/dashboard/Notifications";
import SettingsPage from "./pages/dashboard/Settings";
import MaterialView from "./pages/dashboard/MaterialView";
import FolderView from "./pages/dashboard/FolderView";
import ManagementLayout from "./components/management/ManagementLayout";
import ManagementDashboard from "./pages/management/ManagementDashboard";
import CourseManagement from "./pages/management/CourseManagement";
import CoursesReviewPage from "./pages/management/courses-review";
import DLCReviewPage from "./pages/management/dlc-review";
import BlogsReviewPage from "./pages/management/blogs-review";
import MaterialsReviewPage from "./pages/management/materials-review";
import UserManagementPage from "./pages/management/user-management";
import ErrorReportsPage from "./pages/management/error-reports";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { PostHogProvider } from "@posthog/react";
import AuthContextProvider from "./context/authentication/AuthContextProvider";
import { BookmarkProvider } from "./context/bookmark/BookmarkContextProvider";
import { DepartmentProvider } from "./context/department/DepartmentContextProvider";
import { FullscreenProvider } from "./context/FullscreenContext";
import { FolderProvider } from "./context/folder/FolderContextProvider";
import BatchImageGenerator from "./pages/dashboard/BatchImageGenerator";
import Help from "./pages/dashboard/Help";
import Profile from "./pages/dashboard/Profile";
import GuidesPage from "./pages/dashboard/GuidesPage";
import PublicFolderView from "./pages/public/PublicFolderView";
import PublicMaterialView from "./pages/public/PublicMaterialView";
import ScrollToTop from "./components/ScrollToTop";
import SubdomainRouter from "./components/SubdomainRouter";
import SessionTracker from "./components/SessionTracker";
import ClubsFeed from "./pages/dashboard/ClubsFeed";
import ClubDetail from "./pages/dashboard/ClubDetail";
import MyClubs from "./pages/dashboard/MyClubs";
import AdminClubs from "./pages/management/AdminClubs";
import AdminFlags from "./pages/management/AdminFlags";
import AdminRequests from "./pages/management/AdminRequests";
import HomePage from "./pages/home/HomePage";

const queryClient = new QueryClient();

const App = () => {
  return (
    <>
      <PostHogProvider
        apiKey={import.meta.env.VITE_PUBLIC_POSTHOG_KEY}
        options={{
          api_host: import.meta.env.VITE_PUBLIC_POSTHOG_HOST,
          defaults: "2025-05-24",
          capture_exceptions: true,
          debug: import.meta.env.MODE === "development",
        }}
      >
        <QueryClientProvider client={queryClient}>
          <TooltipProvider>
            <Toaster />
            <Sonner />

            <BrowserRouter>
              <ScrollToTop />
              <GoogleOAuthProvider clientId={ENV.GOOGLE_CLIENT_ID}>
                <AuthContextProvider>
                  <DepartmentProvider>
                    <BookmarkProvider>
                      <FolderProvider>
                        <FullscreenProvider>
                          <SubdomainRouter />
                          <SessionTracker />
                          <Routes>
                            <Route path="/" element={<Index />} />

                            <Route
                              path="/dashboard-batch"
                              element={<BatchImageGenerator />}
                            />
                            {/* Dashboard Routes - Nested */}
                            <Route
                              path="/dashboard"
                              element={
                                <ProtectedRoute>
                                  <DashboardLayout />
                                </ProtectedRoute>
                              }
                            >
                              {/* Dashboard Index - Overview */}
                              <Route index element={<Overview />} />

                              {/* Dashboard Sub-routes */}
                              <Route path="libraries" element={<Libraries />} />
                              <Route
                                path="recent"
                                element={<RecentMaterials />}
                              />
                              <Route
                                path="recommendations"
                                element={<Recommendations />}
                              />
                              <Route
                                path="notifications"
                                element={<Notifications />}
                              />
                              <Route
                                path="settings"
                                element={<SettingsPage />}
                              />
                              <Route path="help" element={<Help />} />

                              {/* Profile View */}
                              <Route
                                path="profile/:userId"
                                element={<Profile />}
                              />

                              {/* Material View */}
                              <Route
                                path="material/:slug"
                                element={<MaterialView />}
                              />

                              {/* Folder View */}
                              <Route
                                path="folder/:slug"
                                element={<FolderView />}
                              />
                            </Route>

                            {/* Home Hub Route */}
                            <Route
                              path="/home"
                              element={
                                <ProtectedRoute>
                                  <HomePage />
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
                              }
                            >
                              {/* Management Dashboard - Default route */}
                              <Route index element={<ManagementDashboard />} />

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
                                path="materials-review"
                                element={<MaterialsReviewPage />}
                              />
                              <Route
                                path="user-management"
                                element={<UserManagementPage />}
                              />
                              <Route
                                path="error-reports"
                                element={<ErrorReportsPage />}
                              />
                              {/* Admin Clubs */}
                              <Route path="clubs" element={<AdminClubs />} />
                              <Route
                                path="clubs/flags"
                                element={<AdminFlags />}
                              />
                              <Route
                                path="clubs/requests"
                                element={<AdminRequests />}
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
                              element={<RequestReset />}
                            />
                            <Route
                              path="/auth/password/check-inbox"
                              element={<CheckInbox />}
                            />
                            <Route
                              path="/auth/reset-password"
                              element={<NewPassword />}
                            />
                            <Route
                              path="/auth/password/success"
                              element={<ResetSuccess />}
                            />

                            {/* Public Guides Route - no authentication required */}
                            <Route path="/guides" element={<GuidesPage />} />

                            {/* Public View Routes - No authentication required */}
                            <Route
                              path="/view/folder/:slug"
                              element={<PublicFolderView />}
                            />
                            <Route
                              path="/view/material/:slug"
                              element={<PublicMaterialView />}
                            />
                            {/* Clubs Routes */}
                            <Route path="/clubs" element={<ClubsFeed />} />
                            <Route path="/clubs/:id" element={<ClubDetail />} />
                            <Route
                              path="/clubs/my"
                              element={
                                <ProtectedRoute>
                                  <MyClubs />
                                </ProtectedRoute>
                              }
                            />

                            {/* 404 - Catch all unmatched routes */}
                            <Route path="*" element={<NotFound />} />
                          </Routes>
                        </FullscreenProvider>
                      </FolderProvider>
                    </BookmarkProvider>
                  </DepartmentProvider>
                </AuthContextProvider>
              </GoogleOAuthProvider>
            </BrowserRouter>
          </TooltipProvider>
        </QueryClientProvider>
      </PostHogProvider>
    </>
  );
};

export default App;
