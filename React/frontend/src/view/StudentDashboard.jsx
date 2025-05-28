import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import Poopin from "../components/poppin";
import AccountDetails from "../components/AccountDetails";
import { useNavigate, useLocation, Link } from "react-router-dom";
import axios from "axios";
import InteractiveBox from "../components/InteractiveBox";

export default function Student() {
    const navigate = useNavigate();
    const [userData, setUserData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const navigation = [
        { name: "Dashboard", href: "/student/dashboard", current: true },
        { name: "Attempt", href: "/attempt_tests", current: false },
        { name: "View Result", href: "/student/results", current: false },
        { name: "View Tests", href: "/student/view_test", current: false }
        // { name: "Create Mock MCQ", href: "/generate_mcq", current: false },
    ];

    const path = import.meta.env.VITE_BASE_URL;
    const location = useLocation();
    const { success, message } = location.state || {};

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await axios.get(`${path}/current-user`, {
                    withCredentials: true   // if your backend uses cookies/sessions
                });
                if (response.data.user.role !== "student") {
                    await axios.get(`${path}/logout`, {
                        withCredentials: true // if your backend uses cookies/sessions
                    }).then(navigate("/", { state: { success: false, message: "Access Denied: Only students can access this page." } }))
                }
                setUserData(response.data.user);
            } catch (err) {
                setError("Failed to fetch user data");
                console.error(err);
                await axios.get(`${path}/logout`, {
                    withCredentials: true // if your backend uses cookies/sessions
                }).then(navigate("/", { state: { success: false, message: "You are not signed in" } }))
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [path]);

    return (
        <>
            <Navbar navigation={navigation} />

            <div className="flex flex-col items-center mt-20 px-4 sm:px-8">
                {message && <Poopin success={success} message={message} />}
                <h2 className="text-2xl font-semibold text-center mb-6">Student Dashboard</h2>
                <div className="w-full max-w-4xl flex flex-col sm:flex-row justify-center sm:justify-between gap-6 mt-10">
                    <InteractiveBox color="red" text="View Tests" path="/student/view_test" />
                    <InteractiveBox color="yellow" text="Attempt Tests" path="/attempt_tests" />
                    <InteractiveBox color="green" text="View Results" path="/student/results" />
                </div>

                <div className="mt-12 w-full max-w-2xl">
                    {loading ? (
                        <div className="flex items-center justify-center gap-2 text-gray-700">
                            <svg
                                className="animate-spin h-5 w-5 text-indigo-600"
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                            >
                                <circle
                                    className="opacity-25"
                                    cx="12"
                                    cy="12"
                                    r="10"
                                    stroke="currentColor"
                                    strokeWidth="4"
                                ></circle>
                                <path
                                    className="opacity-75"
                                    fill="currentColor"
                                    d="M4 12a8 8 0 018-8v8H4z"
                                ></path>
                            </svg>
                            <span>Loading user details...</span>
                        </div>
                    ) : error ? (
                        <p className="text-red-500 text-center">{error}</p>
                    ) : (
                        <AccountDetails details={userData} />
                    )}
                </div>
            </div>
        </>
    );
}


{/* <Navbar navigation={navigation} />
            <div className="flex flex-wrap justify-center items-center mt-20 flex-col">
                {message && <Poopin success={success} message={message} />}
                <div className="w-300 flex flex-wrap flex-col sm:flex-row justify-start gap-10">
                    <Box color="red" text="View Tests" />
                    <Box color="yellow" text="Attempt Tests" />
                    <Box color="green" text="View Results" />
                </div>

                <div className="mt-10 w-200">
                    {loading ? (
                        <p>Loading user details...</p>
                    ) : error ? (
                        <p className="text-red-500">{error}</p>
                    ) : (
                        <AccountDetails details={userData} />
                    )}
                </div>
            </div> */}