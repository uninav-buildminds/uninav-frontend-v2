import { verifyEmail } from "@/api/auth.api";
import AuthCard from "@/components/auth/AuthCard";
import AuthLayout from "@/components/auth/AuthLayout";
import { Loader } from "lucide-react";
import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "sonner";

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
					// Email verification successful, should navigate to dashboard when it is implemented
					toast("Email verification successful!");
					navigate("/auth/signup/success");
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