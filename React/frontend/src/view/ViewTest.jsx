import Navbar from "../components/Navbar";
import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import Poopin from "../components/poppin";

export default function ViewTest() {
    const location = useLocation();
    const navigate = useNavigate();
    const { success, message } = location.state || {};
    const path = import.meta.env.VITE_BASE_URL;

    const [userData, setUserData] = useState(null);
    const [navigation, setNavigation] = useState([]);
    const [tests, setTests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchQuery, setSearchQuery] = useState(""); // 🔍 Added state for search

    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await axios.get(`${path}/current-user`, { withCredentials: true });
                const user = res.data.user;

                if (user.role !== "teacher") {
                    await axios.get(`${path}/logout`, {
                        withCredentials: true
                    }).then(navigate("/", {
                        state: { success: false, message: "Access Denied: Only teachers can view tests." }
                    }));

                    return;
                }

                setUserData(user);
                setNavigation([
                    { name: "Dashboard", href: "/teacher/dashboard", current: true },
                    { name: "View Tests", href: "/view_tests", current: false },
                    { name: "View Result", href: "/view_results", current: false },
                    { name: "Create Test", href: "/teacher/create_test", current: false }
                ]);

                const testRes = await axios.get(`${path}/test`, { withCredentials: true });
                setTests(testRes.data || []);
            } catch (err) {
                console.error(err);
                setError("Failed to fetch data");
                await axios.get(`${path}/logout`, {
                    withCredentials: true
                }).then(navigate("/", { state: { success: false, message: "You are not signed in" } }))
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [path, navigate]);

    const handleDelete = async (testId) => {
        const confirmDelete = window.confirm("Are you sure you want to delete this test?");
        if (!confirmDelete) return;

        try {
            await axios.delete(`${path}/test/${testId}`, { withCredentials: true });
            setTests((prevTests) => prevTests.filter((test) => test._id !== testId));
        } catch (err) {
            console.error("Failed to delete test:", err);
            alert("Error deleting test. Please try again.");
        }
    };

    const filteredTests = tests.filter((test) =>
        test.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        test.createdBy?.username.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (!navigation.length || loading) {
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
                <h2 className="text-2xl font-bold mb-2">All Tests</h2>

                <input
                    type="text"
                    placeholder="Search by test title or teacher name"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full px-4 py-2 mb-6 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />

                {filteredTests.length === 0 ? (
                    <p className="text-gray-500">No tests found.</p>
                ) : (
                    <div className="overflow-x-auto rounded-lg shadow border border-gray-200">
                        <table className="min-w-full bg-white divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-600 uppercase">Title</th>
                                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-600 uppercase">Created By</th>
                                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-600 uppercase">Created At</th>
                                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-600 uppercase">Total Time (min)</th>
                                    <th className="px-6 py-3 text-center text-sm font-medium text-gray-600 uppercase">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {filteredTests.map((test) => (
                                    <tr key={test._id}>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm">{test.title}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm">{test.createdBy?.username || "Unknown"}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm">{new Date(test.createdAt).toLocaleDateString()}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm">{test.timeLimit}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-center space-x-2">
                                            <button
                                                onClick={() => navigate(`/test/${test._id}`)}
                                                className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-sm"
                                            >
                                                View
                                            </button>

                                            {userData && test.createdBy?.username === userData.username && (
                                                <>
                                                    <button
                                                        onClick={() => navigate(`/edit_test/${test._id}`)}
                                                        className="bg-yellow-400 hover:bg-yellow-500 text-white px-3 py-1 rounded text-sm"
                                                    >
                                                        Edit
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(test._id)}
                                                        className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-sm"
                                                    >
                                                        Delete
                                                    </button>
                                                </>
                                            )}
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
