import React, { useContext } from "react";
import AuthLayout from "@/components/auth/AuthLayout";
import AuthCard from "@/components/auth/AuthCard";
import AuthHeader from "@/components/auth/AuthHeader";
import FormField from "@/components/auth/FormField";
import EmailInput from "@/components/auth/EmailInput";
import PasswordInput from "@/components/auth/PasswordInput";
import SocialAuth from "@/components/auth/SocialAuth";
import LoadingButton from "@/components/auth/LoadingButton";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { signinSchema, type SigninInput } from "@/lib/validation/auth";
import { Link, useNavigate } from "react-router-dom";
import { API_BASE_URL } from "@/lib/utils";
import { toast } from "sonner";
import AuthContext from "@/context/authentication/AuthContext";

const SigninForm: React.FC = () => {
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SigninInput>({
    resolver: zodResolver(signinSchema),
    mode: "onBlur",
  });
  const { logIn } = useContext(AuthContext);

  const onSubmit = async (data: SigninInput) => {
    if (!data.email || !data.password) {
      return toast.error("Email and password are required.");
    }

    try {
      const res = await logIn(data.email, data.password);
      console.log(res);
      // navigate("/dashboard");
    } catch (error) {
      if (error.statusCode === 400) {
        // Email not verified, Backend has sent a verification link, notify the user
        toast.error(
          "Email not verified. Please check your inbox for the verification link."
        );
        navigate(`/auth/signup/verify?email=${data.email}`);
      } else {
        toast.error(error.message || "Login failed. Please try again.");
      }
    }
  };

  const initiateGoogleAuth = async () => {
    window.location.href = `${API_BASE_URL}/auth/google?state=${window.location.origin}`;
  };

  return (
    <AuthLayout>
      <AuthCard>
        <AuthHeader
          title="Welcome back!"
          subtitle="Access your personalized course recommendations and points"
        />

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="space-y-4 sm:space-y-5"
        >
          <FormField
            label="Email Address"
            htmlFor="email"
            error={errors.email?.message}
          >
            <EmailInput
              id="email"
              placeholder="Enter your email address"
              {...register("email")}
            />
          </FormField>

          <FormField
            label="Password"
            htmlFor="password"
            error={errors.password?.message}
          >
            <PasswordInput
              id="password"
              placeholder="Enter your password"
              {...register("password")}
            />
          </FormField>

          <div className="flex justify-end -mt-2">
            <Link to="/auth/password/forgot" className="text-xs text-brand">
              Forgot password?
            </Link>
          </div>

          <LoadingButton
            isLoading={isSubmitting}
            disabled={isSubmitting}
            loadingText="Signing in..."
          >
            Sign in
          </LoadingButton>

          <div className="relative my-1">
            <div className="absolute inset-0 flex items-center" aria-hidden>
              <div className="w-full border-t" />
            </div>
            <div className="relative flex justify-center">
              <span className="bg-transparent px-2 text-[11px] sm:text-xs text-muted-foreground">
                or sign in with
              </span>
            </div>
          </div>

          <SocialAuth onGoogle={initiateGoogleAuth} />

          <p className="text-center text-xs text-muted-foreground">
            Don't have an account?{" "}
            <Link to="/auth/signup" className="text-brand font-medium">
              Create one
            </Link>
          </p>
        </form>
      </AuthCard>
    </AuthLayout>
  );
};

export default SigninForm;
