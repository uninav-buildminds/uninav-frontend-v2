// Might not be needed
import React from "react";
import AuthLayout from "@/components/auth/AuthLayout";
import AuthCard from "@/components/auth/AuthCard";
import AuthHeader from "@/components/auth/AuthHeader";
import FormField from "@/components/auth/FormField";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { profileSchema, type ProfileInput } from "@/lib/validation/auth";
import { Link, useNavigate } from "react-router-dom";
import { CircleUserRound, Signature } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const ProfileSetup: React.FC = () => {
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<ProfileInput>({ resolver: zodResolver(profileSchema) });

  const onSubmit = async (data: ProfileInput) => {
    navigate("/auth/signup/success");
  };

  return (
    <AuthLayout>
      <AuthCard>
        <AuthHeader
          title="Your Profile"
          subtitle="Set up your profile in less than a minute, this is how others will see you."
        />

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 sm:space-y-5">
          <FormField label="Full name" htmlFor="fullName" error={errors.fullName?.message}>
            <div className="relative">
              <CircleUserRound className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                id="fullName"
                placeholder="Enter your full name"
                className="w-full rounded-xl border pl-9 pr-3 py-3 text-sm outline-none placeholder:text-muted-foreground/70 focus:ring-2 focus:ring-brand/30"
                {...register("fullName")}
              />
            </div>
          </FormField>

          <FormField label="Username" htmlFor="username" error={errors.username?.message}>
            <div className="relative">
              <Signature className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                id="username"
                placeholder="Create a unique username"
                className="w-full rounded-xl border pl-9 pr-3 py-3 text-sm outline-none placeholder:text-muted-foreground/70 focus:ring-2 focus:ring-brand/30"
                {...register("username")}
              />
            </div>
          </FormField>

          <FormField label="University (Optional)" htmlFor="university" error={errors.university as unknown as string}>
            <Select onValueChange={(v) => setValue("university", v)}>
              <SelectTrigger id="university" className="rounded-xl py-3">
                <SelectValue placeholder="Choose university" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="OAU">Obafemi Awolowo University</SelectItem>
                <SelectItem value="UNILAG">University of Lagos</SelectItem>
              </SelectContent>
            </Select>
          </FormField>

          <FormField label="Faculty (Optional)" htmlFor="faculty" error={errors.faculty as unknown as string}>
            <Select onValueChange={(v) => setValue("faculty", v)}>
              <SelectTrigger id="faculty" className="rounded-xl py-3">
                <SelectValue placeholder="Choose faculty" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Science">Science</SelectItem>
                <SelectItem value="Engineering">Engineering</SelectItem>
                <SelectItem value="Arts">Arts</SelectItem>
              </SelectContent>
            </Select>
          </FormField>

          <FormField label="Department (Optional)" htmlFor="department" error={errors.department as unknown as string}>
            <Select onValueChange={(v) => setValue("department", v)}>
              <SelectTrigger id="department" className="rounded-xl py-3">
                <SelectValue placeholder="Choose department" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Physics">Physics</SelectItem>
                <SelectItem value="Computer Science">Computer Science</SelectItem>
                <SelectItem value="Chemistry">Chemistry</SelectItem>
              </SelectContent>
            </Select>
          </FormField>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-xl bg-brand hover:bg-brand/90 text-white py-3 text-sm font-medium transition-colors"
          >
            Submit
          </button>

          <p className="text-center text-xs sm:text-sm">
            <Link to="/auth/signup/success" className="text-brand font-medium">Skip</Link>
          </p>
        </form>
      </AuthCard>
    </AuthLayout>
  );
};

export default ProfileSetup;
