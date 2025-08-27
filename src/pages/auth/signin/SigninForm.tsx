import React from "react";
import AuthLayout from "@/components/auth/AuthLayout";
import AuthCard from "@/components/auth/AuthCard";
import AuthHeader from "@/components/auth/AuthHeader";
import FormField from "@/components/auth/FormField";
import EmailInput from "@/components/auth/EmailInput";
import PasswordInput from "@/components/auth/PasswordInput";
import SocialAuth from "@/components/auth/SocialAuth";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { signinSchema, type SigninInput } from "@/lib/validation/auth";
import { Link, useNavigate } from "react-router-dom";
import { API_BASE_URL } from "@/lib/utils";
import Header from "@/components/Header";
import { preload } from "swr";
import { toast } from "sonner";

// Start prefetching all the faculties and their departments in case the user goes to sign up
preload(`${API_BASE_URL}/faculty`, (url: string) => fetch(url).then((res) => res.json()));

const SigninForm: React.FC = () => {
  const navigate = useNavigate();
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<SigninInput>({ resolver: zodResolver(signinSchema), mode: "onBlur" });

  const onSubmit = async (data: SigninInput) => {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        emailOrMatricNo: data.email,
        password: data.password,
      }),
      credentials: "include",
    });

    if (response.ok) {
      // Should probably navigate to the dashboard when its implemented
      return navigate("/");
    }
    if (response.status === 400) {
      // Email not verified, Backend has sent a verification link, notify the user
      navigate(`/auth/signup/verify?email=${data.email}`);
    } else {
      const error = await response.json();
      toast.error(error?.message || "Login failed. Please try again.");
    }
  };

  const initiateGoogleAuth = async () => {
    window.location.href = `${API_BASE_URL}/auth/google`;
  }

  return (
    <AuthLayout>
      <Header />
      <AuthCard>
        <AuthHeader title="Welcome back!" subtitle="Access your personalized course recommendations and points" />

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 sm:space-y-5">
          <FormField label="Email Address" htmlFor="email" error={errors.email?.message}>
            <EmailInput id="email" placeholder="Enter your email address" {...register("email")} />
          </FormField>

          <FormField label="Password" htmlFor="password" error={errors.password?.message}>
            <PasswordInput id="password" placeholder="Enter your password" {...register("password")} />
          </FormField>

          <div className="flex justify-end -mt-2">
            <Link to="/auth/password/forgot" className="text-xs text-brand">Forgot password?</Link>
          </div>

          <button type="submit" disabled={isSubmitting} className="w-full rounded-xl bg-brand hover:bg-brand/90 text-white py-3 text-sm font-medium transition-colors">
            Sign in
          </button>

          <div className="relative my-1">
            <div className="absolute inset-0 flex items-center" aria-hidden>
              <div className="w-full border-t" />
            </div>
            <div className="relative flex justify-center">
              <span className="bg-transparent px-2 text-[11px] sm:text-xs text-muted-foreground">or sign in with</span>
            </div>
          </div>


          <SocialAuth onGoogle={initiateGoogleAuth} />

          <p className="text-center text-xs text-muted-foreground">
            Don't have an account? <Link to="/auth/signup" className="text-brand font-medium">Create one</Link>
          </p>
        </form>
      </AuthCard>
    </AuthLayout>
  );
};

export default SigninForm;
