import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import Navbar from "../components/Navbar";

export default function ViewResult() {
    const { attemptId } = useParams();
    const navigate = useNavigate();
    const path = import.meta.env.VITE_BASE_URL;

    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [user, setUser] = useState({})

    const [navigation, setNavigation] = useState(null);
    useEffect(() => {
        const fetchUser = async () => {
            try {
                const response = await axios.get(`${path}/current-user`, { withCredentials: true })
                const fetchedUser = response.data.user
                setUser(fetchedUser)
                if (user.role == "student") {
                    setNavigation([
                        { name: "Dashboard", href: "/student/dashboard", current: true },
                        { name: "Attempt", href: "/attempt_tests", current: false },
                        { name: "View Result", href: "/student/results", current: false },
                        { name: "View Tests", href: "/student/view_test", current: false }
                    ])
                }
                else {
                    setNavigation([
                        { name: "Dashboard", href: "/teacher/dashboard", current: true },
                        { name: "View Tests", href: "/view_tests", current: false },
                        { name: "View Result", href: "/view_results", current: false },
                        // { name: "Create Mock MCQ", href: "/generate_mcq", current: false },
                        { name: "Create Test", href: "/teacher/create_test", current: false }
                    ])
                }
            } catch (err) {
                console.error(err);
                return navigate("/", { state: { success: false, message: "You are not signed in" } });
            }
        }
        fetchUser(), [path, navigate]
    })

    useEffect(() => {
        const fetchResult = async () => {
            try {
                const response = await axios.get(`${path}/current-user`, { withCredentials: true })
                setUser(response.data.user)

                const res = await axios.get(`${path}/result/detail/${attemptId}`, {
                    withCredentials: true,
                });
                setResult(res.data);
            } catch (err) {
                console.error(err);
                setError("Failed to load result. Redirecting...");
                setTimeout(() => navigate("/"), 3000);
            } finally {
                setLoading(false);
            }
        };
        fetchResult();
    }, [attemptId, path, navigate]);

    if (loading)
        return (
            <div className="text-center mt-20 text-gray-500 text-lg font-semibold">
                Loading result...
            </div>
        );

    if (error)
        return (
            <div className="text-center mt-20 text-red-600 text-lg font-semibold">
                {error}
            </div>
        );

    if (!result)
        return (
            <div className="text-center mt-20 text-gray-600 text-lg font-semibold">
                No result found.
            </div>
        );

    const { test, attemptedBy, score, passed, answered } = result;

    return (
        <>
            <Navbar navigation={navigation} />
            <div className="max-w-6xl mx-auto mt-20 px-4 sm:px-8">
                {/* Header Section */}
                <header className="mb-8">
                    <h1 className="text-4xl font-extrabold text-gray-800 mb-2">{test.title} - Result</h1>
                    <div className="flex flex-wrap items-center gap-4 text-gray-700 text-lg">
                        <p>
                            <span className="font-semibold">Student:</span> {attemptedBy?.rollno || "You"}
                        </p>
                        <p>
                            <span className="font-semibold">Score:</span> {score} / {test.questions.length}
                        </p>
                        <p>
                            <span className="font-semibold">Status:</span>{" "}
                            <span
                                className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${passed
                                    ? "bg-green-100 text-green-800"
                                    : "bg-red-100 text-red-800"
                                    }`}
                            >
                                {passed ? "Passed ✅" : "Failed ❌"}
                            </span>
                        </p>
                    </div>
                </header>

                {/* Questions List */}
                <section className="space-y-8">
                    {answered.map((answer, idx) => {
                        const question = answer.questionId;
                        if (!question) return null;

                        return (
                            <article
                                key={question._id || idx}
                                className="p-6 bg-white rounded-lg shadow-md border border-gray-200 hover:shadow-lg transition-shadow duration-300"
                            >
                                <div className="flex justify-between items-center mb-4 flex-wrap sm:flex-nowrap gap-2">
                                    <h2 className="text-xl font-semibold text-gray-900 mb-4">
                                        {idx + 1}. {question.questionText}
                                    </h2>

                                    {answer.selectedOption === "" && (
                                        <span className="bg-red-100 text-red-800 text-sm font-semibold px-3 py-1 rounded-full">
                                            Not Answered
                                        </span>
                                    )}
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    {question.options.map((option, i) => {
                                        const isSelected = answer.selectedOption === option;
                                        const isCorrect = question.correctAnswer === option;

                                        // Colors for option boxes:
                                        // Green if correct answer, red if user's wrong selection, gray otherwise
                                        let bgColor = "bg-gray-50";
                                        let borderColor = "border-gray-300";
                                        let textColor = "text-gray-800";

                                        if (isCorrect) {
                                            bgColor = "bg-green-100";
                                            borderColor = "border-green-500";
                                            textColor = "text-green-800 font-semibold";
                                        } else if (isSelected && !isCorrect) {
                                            bgColor = "bg-red-100";
                                            borderColor = "border-red-500";
                                            textColor = "text-red-800 font-semibold";
                                        }

                                        return (
                                            <label
                                                key={i}
                                                className={`${bgColor} ${borderColor} ${textColor} border rounded-md cursor-default flex items-center p-3 select-none transition-transform transform hover:scale-[1.02]`}
                                            >
                                                <input
                                                    type="radio"
                                                    checked={isSelected}
                                                    disabled
                                                    className="mr-4 cursor-default"
                                                    aria-checked={isSelected}
                                                />
                                                <span className="break-words">{option}</span>

                                                {isCorrect && (
                                                    <span className="ml-auto text-green-600 font-bold" aria-label="Correct answer">
                                                        ✔
                                                    </span>
                                                )}
                                                {isSelected && !isCorrect && (
                                                    <span className="ml-auto text-red-600 font-bold" aria-label="Your selection">
                                                        ✘
                                                    </span>
                                                )}
                                            </label>
                                        );
                                    })}
                                </div>
                            </article>
                        );
                    })}
                </section>
            </div>
            <div className="flex justify-center items-center my-12 flex-wrap sm:flex-nowrap gap-2">
                <button
                    onClick={() => navigate(`/${user.role}/dashboard`)}
                    className="flex items-center gap-2 px-4 py-2 rounded bg-violet-800 hover:bg-violet-900 disabled:opacity-50 font-semibold text-white">Go to Dashboard</button>
            </div>
        </>
    );
}
