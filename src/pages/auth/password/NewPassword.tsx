import React, { useEffect } from "react";
import AuthLayout from "@/components/auth/AuthLayout";
import AuthCard from "@/components/auth/AuthCard";
import AuthHeader from "@/components/auth/AuthHeader";
import FormField from "@/components/auth/FormField";
import PasswordInput from "@/components/auth/PasswordInput";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { newPasswordSchema, type NewPasswordInput } from "@/lib/validation/auth";
import { useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import { API_BASE_URL } from "@/lib/utils";

const NewPassword: React.FC = () => {
  const navigate = useNavigate();
  const {
		register,
		handleSubmit,
		formState: { errors, isSubmitting },
  } = useForm<NewPasswordInput>({
		resolver: zodResolver(newPasswordSchema),
		mode: "onBlur",
  });
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");

  useEffect(() => {
    if (!token) {
      toast.error("Missing token. Please try again.");
      navigate("/auth/password/forgot");
    }
  }, [token, navigate]);

  const onSubmit = async (_data: NewPasswordInput) => {
		if (!_data.password) {
			toast.error("Password cannot be empty.");
			return;
		}

		const response = await fetch(`${API_BASE_URL}/auth/reset-password`, {
			method: "POST",
			body: JSON.stringify({
				token: encodeURIComponent(token),
				newPassword: _data.password,
			}),
			credentials: "include",
		});

		if (response.ok) {
			toast.success("Password reset successful!");
			navigate("/auth/password/success");
		} else {
			const error = await response.json();
			toast.error(
				error?.message || "Something went wrong. Please try again."
			);
		}
  };

  return (
    <AuthLayout>
      <AuthCard>
        <AuthHeader title="Create a new password" subtitle="Must be at least 8 characters" />

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 sm:space-y-5">
          <FormField label="New password" htmlFor="password" error={errors.password?.message}>
            <PasswordInput id="password" placeholder="Create a new password" {...register("password")} />
          </FormField>

          <FormField label="Confirm new password" htmlFor="confirmPassword" error={errors.confirmPassword?.message}>
            <PasswordInput id="confirmPassword" placeholder="Re-enter new password" {...register("confirmPassword")} />
          </FormField>

          <button type="submit" disabled={isSubmitting} className="w-full rounded-xl bg-brand hover:bg-brand/90 text-white py-3 text-sm font-medium transition-colors">Save Password</button>
        </form>
      </AuthCard>
    </AuthLayout>
  );
};

export default NewPassword;
