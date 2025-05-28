import Navbar from "../components/Navbar";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Poopin from "../components/poppin";

export default function TeacherViewResults() {
    const navigate = useNavigate();
    const path = import.meta.env.VITE_BASE_URL;

    const [navigation, setNavigation] = useState([]);
    const [attempts, setAttempts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [searchQuery, setSearchQuery] = useState("");


    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await axios.get(`${path}/current-user`, { withCredentials: true });
                const user = res.data.user;

                if (user.role !== "teacher") {
                    await axios.get(`${path}/logout`, { withCredentials: true });
                    return navigate("/", {
                        state: { success: false, message: "Access Denied: Only teachers can view this page." }
                    });
                }

                setNavigation([
                    { name: "Dashboard", href: "/teacher/dashboard", current: true },
                    { name: "View Tests", href: "/view_tests", current: false },
                    { name: "View Result", href: "/view_results", current: false },
                    { name: "Create Test", href: "/teacher/create_test", current: false }
                ]);

                const resultRes = await axios.get(`${path}/result/teacher`, { withCredentials: true });
                setAttempts(resultRes.data);
            } catch (err) {
                console.error(err);
                setError("Failed to fetch result data.");
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [navigate, path]);

    const filteredAttempts = attempts.filter(attempt => {
        const rollno = String(attempt.attemptedBy?.rollno || "").toLowerCase();
        const title = String(attempt.test?.title || "").toLowerCase();
        const query = searchQuery.toLowerCase();
        return rollno.includes(query) || title.includes(query);
    });


    if (loading) return <div className="text-center mt-20 text-gray-500">Loading...</div>;

    return (
        <>
            <Navbar navigation={navigation} />
            <div className="max-w-6xl mx-auto mt-20 px-4">
                <h2 className="text-2xl font-bold mb-6">Test Attempts by Students</h2>
                {error && <Poopin success={false} message={error} />}

                <div className="mb-6">
                    <input
                        type="text"
                        placeholder="Search by Roll Number or Test Title"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="border border-gray-300 rounded px-4 py-2 w-full"
                    />
                </div>


                {filteredAttempts.length === 0 ? (
                    <p className="text-gray-500">No results match your search.</p>
                ) : (
                    <div className="overflow-x-auto rounded-lg shadow border border-gray-200">
                        <table className="min-w-full bg-white divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-600 uppercase">Student Rollno</th>
                                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-600 uppercase">Test Title</th>
                                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-600 uppercase">Score</th>
                                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-600 uppercase">Result</th>
                                    <th className="px-6 py-3 text-center text-sm font-medium text-gray-600 uppercase">Action</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {filteredAttempts.map((attempt) => (
                                    <tr key={attempt._id}>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm">{attempt.attemptedBy?.rollno || "Unknown"}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm">{attempt.test?.title || "Untitled"}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm">{attempt.score} / {attempt.answered.length}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold" style={{ color: attempt.passed ? "green" : "red" }}>
                                            {attempt.passed ? "Pass" : "Fail"}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-center">
                                            <button
                                                onClick={() => navigate(`/result/detail/${attempt._id}`)}
                                                className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-sm"
                                            >
                                                View
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
