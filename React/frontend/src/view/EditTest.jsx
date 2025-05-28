import Navbar from "../components/Navbar";
import { useEffect, useState } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import axios from "axios";
import Poopin from "../components/poppin";
import { Plus, X } from "lucide-react";

const navigation = [
    { name: "Dashboard", href: "/teacher/dashboard", current: false },
    { name: "View Tests", href: "/view_tests", current: false },
    { name: "View Result", href: "/view_results", current: false },
    { name: "Create Test", href: "/teacher/create_test", current: false }
];

export default function EditTest() {
    const path = import.meta.env.VITE_BASE_URL;
    const navigate = useNavigate();
    const location = useLocation();
    const { id } = useParams();  // Test ID from URL
    const { success, message } = location.state || {};

    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState("");

    const [data, setData] = useState({ title: "", timestamp: 1 });

    const [questions, setQuestions] = useState([]);

    useEffect(() => {
        const fetchTest = async () => {
            try {
                // Check user role
                const userRes = await axios.get(`${path}/current-user`, { withCredentials: true });
                if (userRes.data.user.role !== "teacher") {
                    await axios.get(`${path}/logout`, {
                        withCredentials: true // if your backend uses cookies/sessions
                    }).then(navigate("/", { state: { success: false, message: "Access Denied: Only teachers can access this page." } }))
                    return;
                }

                // Fetch test data by id
                const testRes = await axios.get(`${path}/test/${id}`, { withCredentials: true });
                const test = testRes.data;

                setData({ title: test.title, timestamp: test.timeLimit });

                // Transform backend questions to local state shape
                setQuestions(test.questions.map(q => ({
                    question: q.questionText,
                    options: {
                        A: q.options[0] || "",
                        B: q.options[1] || "",
                        C: q.options[2] || "",
                        D: q.options[3] || "",
                    },
                    // Determine correctAnswer key by matching correctAnswer string to options array
                    correctAnswer: ["A", "B", "C", "D"][q.options.findIndex(opt => opt === q.correctAnswer)] || ""
                })));

                setLoading(false);
            } catch (err) {
                console.error(err);
                setError("Failed to load test data.");
                setLoading(false);
            }
        };

        fetchTest();
    }, [id, navigate, path]);

    const handleData = (e) => {
        setData(oldData => ({ ...oldData, [e.target.name]: e.target.value }));
    };

    const handleAddQuestion = () => {
        setQuestions(old => [
            ...old,
            { question: "", options: { A: "", B: "", C: "", D: "" }, correctAnswer: "" }
        ]);
    };

    const handleRemoveQuestion = (index) => {
        if (questions.length === 1) return;
        setQuestions(old => {
            const updated = [...old];
            updated.splice(index, 1);
            return updated;
        });
    };

    const handleInputChange = (index, field, value) => {
        setQuestions(old => {
            const updated = [...old];
            if (field === "question" || field === "correctAnswer") {
                updated[index][field] = value;
            }
            return updated;
        });
    };

    const handleOptionChange = (index, key, value) => {
        setQuestions(old => {
            const updated = [...old];
            updated[index].options[key] = value;
            return updated;
        });
    };

    const handleSubmit = async () => {
        // Validation
        if (!data.title.trim() || data.timestamp <= 0) {
            alert("Please enter a valid test title and timer.");
            return;
        }

        for (let i = 0; i < questions.length; i++) {
            const q = questions[i];
            const optionsTrimmed = {
                A: q.options.A.trim(),
                B: q.options.B.trim(),
                C: q.options.C.trim(),
                D: q.options.D.trim(),
            };

            if (!q.question.trim()) {
                alert(`Question ${i + 1} is empty.`);
                return;
            }

            if (Object.values(optionsTrimmed).some(opt => opt === "")) {
                alert(`All options must be filled for Question ${i + 1}.`);
                return;
            }

            if (!["A", "B", "C", "D"].includes(q.correctAnswer)) {
                alert(`Please select a valid correct option (A, B, C, or D) for Question ${i + 1}.`);
                return;
            }

            if (!optionsTrimmed[q.correctAnswer]) {
                alert(`Correct answer for Question ${i + 1} does not match any option.`);
                return;
            }
        }

        setSubmitting(true);

        try {
            const formattedQuestions = questions.map(q => ({
                questionText: q.question.trim(),
                options: [
                    q.options.A.trim(),
                    q.options.B.trim(),
                    q.options.C.trim(),
                    q.options.D.trim()
                ],
                correctAnswer: q.options[q.correctAnswer].trim()
            }));

            const finalData = {
                test: {
                    title: data.title.trim(),
                    timestamp: data.timestamp,
                    questions: formattedQuestions
                }
            };

            // Assume your backend supports PUT for update
            await axios.put(`${path}/test/${id}`, finalData, { withCredentials: true });

            navigate("/view_tests", { state: { success: true, message: "Test updated successfully!" } });
        } catch (err) {
            console.error(err);
            alert("Failed to update test.");
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <>
                <Navbar navigation={navigation} />
                <div className="text-center mt-20 text-green-600 font-semibold text-xl">Loading...</div>
            </>
        );
    }

    if (error) {
        return (
            <>
                <Navbar navigation={navigation} />
                <div className="text-center mt-20 text-red-600 font-semibold text-xl">{error}</div>
            </>
        );
    }

    return (
        <>
            <Navbar navigation={navigation} />
            <div className="flex flex-col items-center mt-20 px-4 sm:px-8">
                {message && <Poopin success={success} message={message} />}
                <div className="w-full max-w-3xl mb-10">
                    <h1 className="text-3xl font-semibold text-sky-700 mb-6 text-center">Edit Test</h1>

                    {/* Test Info Section */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-4">
                            <label htmlFor="title" className="min-w-[60px] font-medium">Title:</label>
                            <input
                                type="text"
                                id="title"
                                name="title"
                                required
                                value={data.title}
                                onChange={handleData}
                                className="flex-1 rounded-md border border-gray-300 px-3 py-2 text-gray-900 shadow-sm focus:ring-2 focus:ring-green-500 sm:text-sm"
                            />
                        </div>
                        <div className="flex items-center gap-4">
                            <label htmlFor="timer" className="min-w-[60px] font-medium">Timer:</label>
                            <input
                                type="number"
                                id="timer"
                                name="timestamp"
                                required
                                value={data.timestamp}
                                onChange={handleData}
                                className="w-24 rounded-md border border-gray-300 px-3 py-2 text-gray-900 shadow-sm focus:ring-2 focus:ring-green-500 sm:text-sm"
                            />
                        </div>
                    </div>
                </div>

                {/* Questions Section */}
                <div className="w-full max-w-4xl border-2 rounded-xl border-sky-500 shadow-[0_0_30px_rgba(34,197,94,0.5)] p-8">
                    <h2 className="text-2xl font-semibold mb-6 text-sky-700">Questions</h2>

                    {questions.map((q, index) => (
                        <div key={index} className="mb-10 space-y-4 border-b pb-6">
                            <div className="flex items-start gap-4">
                                <label className="min-w-[80px] font-medium pt-2">Question {index + 1}:</label>
                                <textarea
                                    rows={3}
                                    required
                                    value={q.question}
                                    onChange={(e) => handleInputChange(index, "question", e.target.value)}
                                    placeholder="Enter your question"
                                    className="flex-1 rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:ring-2 focus:ring-green-500 sm:text-sm"
                                />
                            </div>

                            {["A", "B", "C", "D"].map((opt) => (
                                <div key={opt} className="flex items-center gap-4">
                                    <label className="min-w-[80px] font-medium">Option {opt}:</label>
                                    <input
                                        type="text"
                                        required
                                        value={q.options[opt]}
                                        onChange={(e) => handleOptionChange(index, opt, e.target.value)}
                                        placeholder={`Enter option ${opt}`}
                                        className="flex-1 rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:ring-2 focus:ring-green-500 sm:text-sm"
                                    />
                                </div>
                            ))}

                            <div className="flex items-center gap-4">
                                <label className="min-w-[120px] font-medium">Correct Option:</label>
                                <select
                                    value={q.correctAnswer}
                                    onChange={(e) => handleInputChange(index, "correctAnswer", e.target.value)}
                                    className="w-40 rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:ring-2 focus:ring-green-500 sm:text-sm"
                                >
                                    <option value="" disabled>Select correct option</option>
                                    {["A", "B", "C", "D"].map((opt) => (
                                        <option key={opt} value={opt}>
                                            {opt}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Add/Remove buttons */}
                            <div className="flex justify-end gap-4 mt-4">
                                {questions.length > 1 && (
                                    <button
                                        type="button"
                                        onClick={() => handleRemoveQuestion(index)}
                                        className="flex items-center gap-1 bg-red-600 text-white px-3 py-2 rounded-md hover:bg-red-700"
                                    >
                                        <X className="w-4 h-4" /> Remove
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}

                    <div className="flex justify-center">
                        <button
                            type="button"
                            onClick={handleAddQuestion}
                            className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700"
                        >
                            <Plus className="w-5 h-5" /> Add Question
                        </button>
                    </div>

                    {/* Submit button */}
                    <div className="mt-8 flex justify-center">
                        <button
                            type="button"
                            onClick={handleSubmit}
                            disabled={submitting}
                            className={`px-8 py-3 rounded-md font-semibold text-white ${submitting ? "bg-gray-400 cursor-not-allowed" : "bg-sky-700 hover:bg-sky-800"
                                }`}
                        >
                            {submitting ? "Updating..." : "Update Test"}
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
}
