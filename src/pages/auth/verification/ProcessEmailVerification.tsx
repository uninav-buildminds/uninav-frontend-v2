import { httpClient } from "@/api/api";
import { verifyEmail } from "@/api/auth.api";
import AuthCard from "@/components/auth/AuthCard";
import AuthLayout from "@/components/auth/AuthLayout";
import { API_BASE_URL } from "@/lib/utils";
import { Loader } from "lucide-react";
import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import { preload } from "swr";

// Start prefetching all the faculties and their departments, they will be used in profile setup
preload(`${API_BASE_URL}/faculty`, (url: string) =>
	httpClient(url).then((res) => res.data)
);

const ProcessEmailVerification: React.FC = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const token = searchParams.get("token");

    useEffect(() => {
		if (!token) {
			navigate("/auth/signin");
		} else {
			verifyEmail(token)
				.then(() => {
					toast("Email verification successful!");
					navigate("/auth/signup/profile");
				})
				.catch((error) => {
					toast.error(error.message);
					setTimeout(() => {
						navigate("/auth/signin");
					}, 8000);
				});
		}
	}, [token, navigate]);
    return (
        <AuthLayout>
            <AuthCard>
                <h1 className="text-center text-2xl font-semibold mb-4">Processing Email Verification</h1>
                <Loader className="mx-auto animate-spin" size={64} />
            </AuthCard>
        </AuthLayout>
    )
}

export default ProcessEmailVerification;