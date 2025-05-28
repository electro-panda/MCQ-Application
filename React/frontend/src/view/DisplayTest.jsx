import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

const navigation = [
    { name: "Dashboard", href: "/teacher/dashboard", current: true },
    { name: "View Tests", href: "/view_tests", current: false },
    { name: "View Result", href: "/view_results", current: false },
    { name: "Create Test", href: "/teacher/create_test", current: false }
];

export default function DisplayTest() {
    const { id } = useParams();
    const path = import.meta.env.VITE_BASE_URL;
    const navigate = useNavigate();

    const [test, setTest] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await axios.get(`${path}/current-user`, { withCredentials: true });
                if (response.data.user.role !== "teacher") {
                    await axios.get(`${path}/logout`, {
                        withCredentials: true // if your backend uses cookies/sessions
                    }).then(navigate("/", {
                        state: { success: false, message: "Access Denied: Only teachers can access this page." }
                    }))

                    return;
                }

                const testRes = await axios.get(`${path}/test/${id}`, { withCredentials: true });
                setTest(testRes.data);
            } catch (err) {
                console.error(err);
                setError("Failed to load test.");
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [path, id, navigate]);

    if (loading) return <div className="text-center mt-20 text-gray-500">Loading...</div>;
    if (error) return <div className="text-center mt-20 text-red-500">{error}</div>;

    return (
        <>
            <Navbar navigation={navigation} />
            <div className="max-w-5xl mx-auto mt-10 px-6">
                <div className="bg-white rounded-xl shadow-md p-6 mb-6">
                    <h1 className="text-4xl font-bold text-indigo-600 mb-3">{test.title}</h1>
                    <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                        <span className="bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full font-medium">
                            Created by: {test.createdBy?.username || "Unknown"}
                        </span>
                        <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full font-medium">
                            Created At: {new Date(test.createdAt).toLocaleDateString()}
                        </span>
                        <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full font-medium">
                            Time Limit: {test.timeLimit} min
                        </span>
                    </div>
                </div>

                <h2 className="text-2xl font-semibold text-gray-800 mb-4">Questions</h2>

                <div className="space-y-6">
                    {test.questions?.length > 0 ? (
                        test.questions.map((q, index) => (
                            <div
                                key={q._id}
                                className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow duration-300 p-5 border border-gray-200"
                            >
                                <p className="text-lg font-medium text-gray-800 mb-3">
                                    Q{index + 1}: {q.questionText}
                                </p>
                                <ul className="space-y-2 text-gray-700">
                                    {q.options.map((option, i) => (
                                        <li
                                            key={i}
                                            className={`px-3 py-2 border rounded ${option === q.correctAnswer
                                                ? "bg-green-100 border-green-300 text-green-800 font-semibold"
                                                : "border-gray-300"
                                                }`}
                                        >
                                            {option}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ))
                    ) : (
                        <p className="text-gray-500">No questions found for this test.</p>
                    )}
                </div>
            </div>
        </>
    );
}
