import React from "react";
import AuthLayout from "@/components/auth/AuthLayout";
import AuthCard from "@/components/auth/AuthCard";
import AuthHeader from "@/components/auth/AuthHeader";
import FormField from "@/components/auth/FormField";
import EmailInput from "@/components/auth/EmailInput";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { resetRequestSchema, type ResetRequestInput } from "@/lib/validation/auth";
import { Link, useNavigate } from "react-router-dom";

const RequestReset: React.FC = () => {
  const navigate = useNavigate();
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<ResetRequestInput>({ resolver: zodResolver(resetRequestSchema), mode: "onBlur" });

  const onSubmit = async (_data: ResetRequestInput) => {
    navigate("/auth/password/check-inbox");
  };

  return (
    <AuthLayout>
      <AuthCard>
        <AuthHeader title="Reset your password" subtitle="No worries. Enter your email and we'll send you a link to get back in." />

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <FormField label="Email Address" htmlFor="email" error={errors.email?.message}>
            <EmailInput id="email" placeholder="Enter your email address" {...register("email")} />
          </FormField>

          <button type="submit" disabled={isSubmitting} className="w-full rounded-xl bg-brand hover:bg-brand/90 text-white py-3 text-sm font-medium transition-colors">Send Link</button>

          <p className="text-center text-xs"><Link to="/auth/signin" className="text-brand">Back to Login</Link></p>
        </form>
      </AuthCard>
    </AuthLayout>
  );
};

export default RequestReset;
