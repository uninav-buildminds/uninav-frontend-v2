import React from "react";
import AuthLayout from "@/components/auth/AuthLayout";
import AuthCard from "@/components/auth/AuthCard";
import AuthHeader from "@/components/auth/AuthHeader";
import FormField from "@/components/auth/FormField";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { profileSetupSchema, type ProfileSetupInput } from "@/lib/validation/auth";
import { Link, useNavigate } from "react-router-dom";
import { Signature } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import useSWR, { Fetcher } from "swr";
import { Faculty } from "@/lib/types/faculty.types";
import { API_BASE_URL } from "@/lib/utils";
import { Department } from "@/lib/types/department.types";
import { updateUserProfile } from "@/api/user.api";
import { toast } from "@/components/ui/sonner";
import LoadingButton from "@/components/auth/LoadingButton";
import { httpClient } from "@/api/api";

const fetchFaculties: Fetcher<{ data: Faculty[] }> = (url: string) => httpClient<{ data: Faculty[] }>(url).then((res) => res.data);
const ProfileSetup: React.FC = () => {
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<ProfileSetupInput>({ resolver: zodResolver(profileSetupSchema) });
  const { data, error, isLoading } = useSWR(`${API_BASE_URL}/faculty`, fetchFaculties);
  const [selectedFacultyId, setSelectedFacultyId] = React.useState<string | null>(null);

  const onSubmit = async (data: ProfileSetupInput) => {
    try {
		await updateUserProfile({
			...data,
			level: data.level ? parseInt(data.level, 10) : 100,
		});
      navigate("/auth/signup/success");
    } catch (error) {
      if (error.statusCode === 400) {
        // Username already taken
        toast.error("Username already taken. Please choose another one.");
      } else {
        toast.error(error.message || "Profile update failed. Please try again.");
      }
    
    }
  }

  const facultyValueChangeHandler = (value: string) => {
      setSelectedFacultyId(value);
      setValue("faculty", value);
    }
  
    const levelValueChangeHandler = (value: string) => {
      function isValidLevel(level: string): level is ProfileSetupInput["level"] {
        return ["100", "200", "300", "400", "500", "600", "700"].includes(
          level
        );
      }
  
      if (isValidLevel(value)) {
        setValue("level", value);
      } else {
        setValue("level", "100");
      }
    };

  const faculties = data?.data || [];
  const departments: Department[] = faculties.find(faculty => faculty.id === selectedFacultyId)?.departments || [];
  return (
		<AuthLayout>
			<AuthCard>
				<AuthHeader
					title="Your Profile"
					subtitle="Set up your profile in less than a minute, this is how others will see you."
				/>

				<form
					onSubmit={handleSubmit(onSubmit)}
					className="space-y-4 sm:space-y-5">
					<FormField
						label="Username"
						htmlFor="username"
						error={errors.username?.message}>
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

					<FormField
						label="Faculty (Optional)"
						htmlFor="faculty"
						error={errors.faculty?.message}>
						<Select
							onValueChange={facultyValueChangeHandler}
							disabled={isLoading || error}>
							<SelectTrigger
								id="faculty"
								className="rounded-xl py-3">
								<SelectValue placeholder="Choose faculty" />
							</SelectTrigger>
							<SelectContent>
								{faculties.map((faculty) => (
									<SelectItem
										key={faculty.id}
										value={faculty.id}>
										{faculty.name}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</FormField>

					<FormField
						label="Department (Optional)"
						htmlFor="department"
						error={errors.department?.message}>
						<Select
							onValueChange={(v) => setValue("department", v)}
							disabled={isLoading || error}>
							<SelectTrigger
								id="department"
								className="rounded-xl py-3">
								<SelectValue placeholder="Choose department" />
							</SelectTrigger>

							<SelectContent>
								{departments.map((department) => (
									<SelectItem
										key={department.id}
										value={department.id}>
										{department.name}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</FormField>

					<FormField
						label="Level (Optional)"
						htmlFor="level"
						error={errors.level?.message}>
						<Select onValueChange={levelValueChangeHandler}>
							<SelectTrigger
								id="level"
								className="rounded-xl py-3">
								<SelectValue placeholder="Choose level" />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="100">100</SelectItem>
								<SelectItem value="200">200</SelectItem>
								<SelectItem value="300">300</SelectItem>
								<SelectItem value="400">400</SelectItem>
								<SelectItem value="500">500</SelectItem>
								<SelectItem value="600">600</SelectItem>
								<SelectItem value="700">700</SelectItem>
							</SelectContent>
						</Select>
					</FormField>

					<LoadingButton
						isLoading={isSubmitting}
						disabled={isSubmitting}
						loadingText="Creating Profile...">
						Submit
					</LoadingButton>

					<p className="text-center text-xs sm:text-sm">
						<Link
							to="/auth/signup/success"
							className="text-brand font-medium">
							Skip
						</Link>
					</p>
				</form>
			</AuthCard>
		</AuthLayout>
  );
};

export default ProfileSetup;
