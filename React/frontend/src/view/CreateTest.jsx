import Navbar from "../components/Navbar";
import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import Poopin from "../components/poppin";
import { Plus, X } from "lucide-react"; // optional: lucide icons

const navigation = [
    { name: "Dashboard", href: "/teacher/dashboard", current: true },
    { name: "View Tests", href: "/view_tests", current: false },
    { name: "View Result", href: "/view_results", current: false },
    { name: "Create Test", href: "/teacher/create_test", current: false }
];

export default function CreateTest() {
    const path = import.meta.env.VITE_BASE_URL;
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
    const location = useLocation();
    const { success, message } = location.state || {};

    const [data, setData] = useState({ title: "", timestamp: 1 })

    // Question list state
    const [questions, setQuestions] = useState([
        {
            question: "",
            options: { A: "", B: "", C: "", D: "" },
            correctAnswer: ""
        }
    ]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await axios.get(`${path}/current-user`, {
                    withCredentials: true
                });
                if (response.data.user.role !== "teacher") {
                    await axios.get(`${path}/logout`, {
                        withCredentials: true // if your backend uses cookies/sessions
                    }).then(navigate("/", {
                        state: { success: false, message: "Access Denied: Only teachers can access this page." }
                    })
                    )

                }
            } catch (err) {
                console.error(err);
                await axios.get(`${path}/logout`, {
                    withCredentials: true // if your backend uses cookies/sessions
                }).then(navigate("/", {
                    state: { success: false, message: "You are not signed in" }
                }))
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [path]);

    const handleData = (e) => {
        setData(oldData => {
            return { ...oldData, [e.target.name]: e.target.value }
        })
    }

    const handleAddQuestion = () => {
        setQuestions([
            ...questions,
            {
                question: "",
                options: { A: "", B: "", C: "", D: "" },
                correctAnswer: ""
            }
        ]);
    };

    const handleRemoveQuestion = (index) => {
        if (questions.length === 1) return;
        const updated = [...questions];
        updated.splice(index, 1);
        setQuestions(updated);
    };

    const handleInputChange = (index, field, value) => {
        const updated = [...questions];
        if (field === "question" || field === "correctAnswer") {
            updated[index][field] = value;
        }
        setQuestions(updated);
    };

    const handleOptionChange = (index, key, value) => {
        const updated = [...questions];
        updated[index].options[key] = value;
        setQuestions(updated);
    };

    const handleClick = async () => {
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

            // Check empty fields
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

            const response = await axios.post(`${path}/test`, finalData, {
                withCredentials: true
            });
            console.log(response);
            navigate("/view_tests", { state: { success: true, message: "Test created successfully!" } });
        } catch (err) {
            console.error(err);
            alert("Failed to create test.");
        }
    };




    return (
        <>
            <Navbar navigation={navigation} />
            <div className="flex flex-col items-center mt-20 px-4 sm:px-8">
                {message && <Poopin success={success} message={message} />}
                <div className="w-full max-w-3xl mb-10">
                    <h1 className="text-3xl font-semibold text-green-700 mb-6 text-center">Create New Test</h1>

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
                <div className="w-full max-w-4xl border-2 rounded-xl border-green-500 shadow-[0_0_30px_rgba(34,197,94,0.5)] p-8">
                    <h2 className="text-2xl font-semibold mb-6 text-green-700">Questions</h2>

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

                    {/* Submit Test */}
                    <div className="pt-8 flex justify-center">
                        <button
                            type="submit"
                            onClick={handleClick}
                            className="w-80 bg-green-600 text-white font-medium py-2 px-4 rounded-md hover:bg-green-700 transition duration-200"
                        >
                            Submit Test
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
}
