import Navbar from "../components/Navbar";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

export default function StudentViewResults() {
    const navigate = useNavigate();
    const path = import.meta.env.VITE_BASE_URL;

    const [navigation, setNavigation] = useState([]);
    const [attempts, setAttempts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Get current user
                const res = await axios.get(`${path}/current-user`, { withCredentials: true });
                const user = res.data.user;

                if (user.role !== "student") {
                    await axios.get(`${path}/logout`, { withCredentials: true });
                    return navigate("/", {
                        state: { success: false, message: "Access Denied: Only students can view this page." }
                    });
                }

                setNavigation([
                    { name: "Dashboard", href: "/student/dashboard", current: true },
                    { name: "Attempt", href: "/attempt_tests", current: false },
                    { name: "View Result", href: "/student/results", current: false },
                    { name: "View Tests", href: "/student/view_test", current: false }
                ]);

                // Fetch all attempts for this student
                const attemptsRes = await axios.get(`${path}/result/${user._id}`, { withCredentials: true });
                setAttempts(attemptsRes.data || []);
            } catch (err) {
                console.error(err);
                setError("Failed to fetch your results.");
                navigate("/", { state: { success: false, message: "You are not signed in" } });
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [navigate, path]);

    if (loading) return <div className="text-center mt-20 text-gray-500">Loading...</div>;

    // Filter attempts based on test title search
    const filteredAttempts = attempts.filter((attempt) => {
        const title = attempt.test?.title?.toLowerCase() || "";
        return title.includes(searchTerm.toLowerCase());
    });

    return (
        <>
            <Navbar navigation={navigation} />
            <div className="max-w-6xl mx-auto mt-20 px-4 sm:px-8">
                <h2 className="text-2xl font-bold mb-4">My Attempted Tests & Results</h2>
                {error && <p className="text-red-500 mb-4">{error}</p>}

                {/* Search Box */}
                <div className="mb-6">
                    <input
                        type="text"
                        placeholder="Search by Test Title"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value.trimStart())}
                        className="w-full border border-gray-300 rounded px-4 py-2"
                    />
                </div>

                {filteredAttempts.length === 0 ? (
                    <p className="text-gray-500">No tests match your search.</p>
                ) : (
                    <div className="overflow-x-auto rounded-lg shadow border border-gray-200">
                        <table className="min-w-full bg-white divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-600 uppercase">Test Title</th>
                                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-600 uppercase">Score</th>
                                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-600 uppercase">Pass/Fail</th>
                                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-600 uppercase">Date Attempted</th>
                                    <th className="px-6 py-3 text-center text-sm font-medium text-gray-600 uppercase">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {filteredAttempts.map((attempt) => (
                                    <tr key={attempt._id}>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm">{attempt.test?.title || "Unknown Test"}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm">{attempt.score ?? "N/A"}</td>
                                        <td
                                            className="px-6 py-4 whitespace-nowrap text-sm font-semibold"
                                            style={{ color: attempt.passed ? "green" : "red" }}
                                        >
                                            {attempt.passed ? "Pass" : "Fail"}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                                            {new Date(attempt.createdAt).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-center">
                                            <button
                                                onClick={() => navigate(`/result/detail/${attempt._id}`)}
                                                className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-sm"
                                            >
                                                View Detail
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </>
    );
}
