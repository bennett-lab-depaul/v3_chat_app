import { useAuth } from "@/context/AuthProvider";

export default function FooterNav() {
    const { profile } = useAuth();

    if (profile.role == "Caregiver") {
        return (
            <div>

            </div>
        );
    } else {
        return (
            <div>

            </div>
        );
    }
}