import Navbar from "../components/Navbar";
import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import Poopin from "../components/poppin";

export default function StudentAttemptTest() {
    const location = useLocation();
    const navigate = useNavigate();
    const { success, message } = location.state || {};
    const path = import.meta.env.VITE_BASE_URL;

    const [navigation, setNavigation] = useState([]);
    const [tests, setTests] = useState([]);
    const [unattemptedTests, setUnattemptedTests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");


    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await axios.get(`${path}/current-user`, { withCredentials: true });
                const user = res.data.user;

                // Redirect if not student
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

                // Fetch all tests
                const testRes = await axios.get(`${path}/test`, { withCredentials: true });
                const allTests = testRes.data || [];

                // Fetch student results
                const resultRes = await axios.get(`${path}/result/${user._id}`, { withCredentials: true });
                const attemptedTestIds = resultRes.data.map(attempt => attempt.test._id);

                // Filter only unattempted tests
                const unattempted = allTests.filter(test => !attemptedTestIds.includes(test._id));

                setTests(allTests);
                setUnattemptedTests(unattempted);
            } catch (err) {
                console.error(err);
                setError("Failed to fetch data.");
                navigate("/", { state: { success: false, message: "You are not signed in." } });
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [navigate, path]);

    const filteredTests = unattemptedTests.filter((test) => {
        const title = test.title?.toLowerCase() || "";
        const teacher = test.createdBy?.username?.toLowerCase() || "";
        const query = searchTerm.toLowerCase();

        return title.includes(query) || teacher.includes(query);
    });


    if (loading) {
        return <div className="text-center mt-20 text-gray-500">Loading...</div>;
    }

    return (
        <>
            <Navbar navigation={navigation} />
            <div className="flex flex-col items-center mt-20 px-4 sm:px-8">
                {message && <Poopin success={success} message={message} />}
                {error && <p className="text-red-500 mt-4">{error}</p>}
            </div>

            <div className="max-w-6xl mx-auto mt-10 px-4">
                <h2 className="text-2xl font-bold mb-4">Unattempted Tests</h2>
                <div className="mb-6">
                    <input
                        type="text"
                        placeholder="Search by Test Title or Teacher Name"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value.trimStart())}
                        className="w-full border border-gray-300 rounded px-4 py-2"
                    />
                </div>

                {filteredTests.length === 0 ? (
                    <p className="text-gray-500">No test exists.</p>
                ) : (
                    <div className="overflow-x-auto rounded-lg shadow border border-gray-200">
                        <table className="min-w-full bg-white divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-600 uppercase">Title</th>
                                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-600 uppercase">Created By</th>
                                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-600 uppercase">Total Time (min)</th>
                                    <th className="px-6 py-3 text-center text-sm font-medium text-gray-600 uppercase">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {filteredTests.map((test) => (
                                    <tr key={test._id}>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm">{test.title}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm">{test.createdBy?.username || "Unknown"}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm">{test.timeLimit}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-center">
                                            <button
                                                onClick={() => navigate(`/attempt_test/${test._id}`)}
                                                className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded text-sm"
                                            >
                                                Attempt
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
