import AuthCard from "@/components/auth/AuthCard";
import AuthLayout from "@/components/auth/AuthLayout";
import { API_BASE_URL } from "@/lib/utils";
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
            console.log("Token:", token);
            // Process the email verification token here
            fetch(`${API_BASE_URL}/auth/verify-email/token?token=${token}`).then(async (res) => {
                if (res.ok) {
                    // Email verification successful, should navigate to dashboard when it is implemented
                    navigate("/");
                } else {
                    const error = await res.json();
                    toast.error(error?.message || "Email verification failed. Please try again.");
                    setTimeout(() => {
                        navigate("/auth/signin");
                    }, 8000);
                }
            })
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