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
import { signupSchema, type SignupInput } from "@/lib/validation/auth";
import { Link, useNavigate } from "react-router-dom";

const SignupForm: React.FC = () => {
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignupInput>({ 
    resolver: zodResolver(signupSchema), 
    mode: "onBlur"
  });

  const onSubmit = async (data: SignupInput) => {
    console.log("Form data:", data);
    navigate("/auth/signup/verify");
  };

  return (
    <AuthLayout>
      <AuthCard>
        <AuthHeader
          title="Join the Student Revolution"
          subtitle="Find your courses, share your notes, and start earning rewards today. It's free!"
        />

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 sm:space-y-5">
          <FormField label="Email Address" htmlFor="email" error={errors.email?.message}>
            <EmailInput 
              id="email" 
              placeholder="e.g your.name@uni.edu" 
              {...register("email")} 
            />
          </FormField>

          <FormField label="Password" htmlFor="password" error={errors.password?.message}>
            <PasswordInput 
              id="password" 
              placeholder="Enter your password" 
              {...register("password")} 
            />
          </FormField>

          <div className="flex items-start gap-2">
            <input 
              id="agree" 
              type="checkbox" 
              className="h-4 w-4 mt-0.5" 
              {...register("agree")} 
            />
            <label htmlFor="agree" className="text-xs sm:text-sm text-muted-foreground">
              I agree to the <a className="underline" href="#">Terms & Conditions</a> and <a className="underline" href="#">Privacy Policy</a>
            </label>
          </div>
          {errors.agree?.message && <p className="text-xs text-red-600">{errors.agree.message}</p>}

          <div className="relative my-1">
            <div className="absolute inset-0 flex items-center" aria-hidden>
              <div className="w-full border-t" />
            </div>
            <div className="relative flex justify-center">
              <span className="bg-transparent px-2 text-[11px] sm:text-xs text-muted-foreground">or sign up with</span>
            </div>
          </div>

          <div>
            <SocialAuth onGoogle={() => navigate("/auth/signup/verify")} />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-xl bg-brand hover:bg-brand/90 text-white py-3 text-sm font-medium transition-colors"
          >
            Continue
          </button>

          <p className="text-center text-xs text-muted-foreground">
            Already have an account? <Link to="/auth/signin" className="text-brand font-medium">Log in</Link>
          </p>
        </form>
      </AuthCard>
    </AuthLayout>
  );
};

export default SignupForm;
