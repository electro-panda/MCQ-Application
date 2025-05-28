import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { Flag, XCircle, ArrowLeft, ArrowRight, Send } from "lucide-react";


const AttemptTest = () => {
    const { id: testId } = useParams();
    const navigate = useNavigate();
    const [test, setTest] = useState(null);
    const [answers, setAnswers] = useState({});
    const [markedReview, setMarkedReview] = useState(new Set());
    const [visited, setVisited] = useState(new Set());
    const [current, setCurrent] = useState(0);
    const [timeLeft, setTimeLeft] = useState(null);
    const [loading, setLoading] = useState(true);
    const timerRef = useRef(null);
    const path = import.meta.env.VITE_BASE_URL;

    useEffect(() => {
        const startTest = async () => {
            try {
                const startKey = `startTime_${testId}`;
                let startTime = localStorage.getItem(startKey);

                if (!startTime) {
                    await axios.get(`${path}/result/start/${testId}`, { withCredentials: true });
                    startTime = Date.now();
                    localStorage.setItem(startKey, startTime);
                }

                const { data } = await axios.get(`${path}/test/${testId}`, { withCredentials: true });
                setTest(data);

                const endTime = Number(startTime) + data.timeLimit * 60 * 1000;
                const secondsLeft = Math.max(Math.floor((endTime - Date.now()) / 1000), 0);

                setTimeLeft(secondsLeft);
                setLoading(false);

                // Auto-submit if time has already expired
                if (secondsLeft <= 0) {
                    handleSubmit();
                }
            } catch (error) {
                console.error(error);
                alert("Unable to start the test.");
                navigate("/dashboard");
            }
        };

        startTest();
    }, [testId, navigate, path]);


    useEffect(() => {
        if (timeLeft === null) return;

        if (timeLeft <= 0) {
            clearInterval(timerRef.current);
            handleSubmit();
            return;
        }

        timerRef.current = setInterval(() => {
            setTimeLeft((prev) => {
                if (prev <= 1) {
                    clearInterval(timerRef.current);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timerRef.current);
    }, [timeLeft]);


    const handleChange = (questionId, selectedOption) => {
        setAnswers((prev) => ({ ...prev, [questionId]: selectedOption }));
    };

    const handleMarkReview = (qid) => {
        setMarkedReview((prev) => new Set(prev).add(qid));
    };

    const handleClear = (qid) => {
        setAnswers((prev) => {
            const updated = { ...prev };
            delete updated[qid];
            return updated;
        });
        setMarkedReview((prev) => {
            const newSet = new Set(prev);
            newSet.delete(qid);
            return newSet;
        });
    };

    const handleNavigation = (index) => {
        setCurrent(index);
        setVisited((prev) => new Set(prev).add(test.questions[index]._id));
    };

    const handleSubmit = async () => {
        clearInterval(timerRef.current);

        // Remove stored start time
        localStorage.removeItem(`startTime_${testId}`);

        const formattedAnswers = test.questions.map((question) => ({
            questionId: question._id,
            selectedOption: answers[question._id] || "",
        }));

        try {
            const { data } = await axios.post(
                `${path}/result/${testId}`,
                { answers: formattedAnswers },
                { withCredentials: true }
            );
            navigate(`/result/detail/${data.attemptId}`);
        } catch (err) {
            console.error(err);
            alert(err?.response?.data?.message || "Failed to submit test.");
            navigate("/student/results");
        }
    };


    if (loading || !test) return <div className="p-6 text-center text-xl text-gray-500">Loading test...</div>;

    const currentQuestion = test.questions[current];
    const totalTime = test.timeLimit * 60;
    const minutes = Math.floor(timeLeft / 60);
    const seconds = (timeLeft % 60).toString().padStart(2, "0");

    const getStatusColor = (qid) => {
        if (markedReview.has(qid)) return "bg-yellow-400";
        if (answers[qid]) return "bg-green-500";
        if (visited.has(qid)) return "bg-red-400";
        return "bg-gray-300";
    };

    return (
        <div className="flex max-w-7xl mx-auto min-h-screen">
            {/* Sidebar */}
            <aside className="hidden md:block w-1/5 p-4 border-r bg-white shadow-sm">
                <h2 className="font-semibold mb-4 text-lg">Question Panel</h2>
                <div className="grid grid-cols-4 gap-2">
                    {test.questions.map((q, i) => {
                        const isCurrent = current === i;
                        return (
                            <button
                                key={q._id}
                                onClick={() => handleNavigation(i)}
                                className={`rounded-full w-10 h-10 text-sm font-semibold 
                                ${getStatusColor(q._id)} 
                                ${isCurrent ? "ring-2 ring-black" : ""}
                                text-white transition-all`}
                                title={`Question ${i + 1}`}
                            >
                                {i + 1}
                            </button>
                        );
                    })}
                </div>

                {/* Legend */}
                <div className="mt-6 text-sm space-y-1">
                    <div className="flex items-center gap-2">
                        <span className="w-4 h-4 bg-green-500 rounded-full" /> Answered
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="w-4 h-4 bg-yellow-400 rounded-full" /> Marked for Review
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="w-4 h-4 bg-red-400 rounded-full" /> Visited
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="w-4 h-4 bg-gray-300 rounded-full" /> Not Visited
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 p-8 bg-gray-50">
                <header className="flex justify-between items-center mb-6">
                    <h1 className="text-2xl font-bold text-gray-800">{test.title}</h1>
                    <div className="text-lg font-bold text-red-600 bg-white px-4 py-2 rounded shadow">
                        ⏰ {minutes}:{seconds}
                    </div>
                </header>

                <section className="bg-white p-6 rounded shadow mb-6">
                    <h2 className="text-lg font-semibold mb-4">
                        Question {current + 1}: {currentQuestion.questionText}
                    </h2>
                    <div className="space-y-3">
                        {currentQuestion.options.map((opt, i) => (
                            <label
                                key={i}
                                className={`flex items-center p-3 border rounded cursor-pointer transition-colors duration-200 
                            ${answers[currentQuestion._id] === opt ? "bg-blue-100 border-blue-500" : "hover:bg-gray-100"}`}
                            >
                                <input
                                    type="radio"
                                    name={currentQuestion._id}
                                    checked={answers[currentQuestion._id] === opt}
                                    onChange={() => handleChange(currentQuestion._id, opt)}
                                    className="mr-3"
                                />
                                {opt}
                            </label>
                        ))}
                    </div>
                </section>

                <div className="mt-6 flex flex-wrap justify-between items-center gap-3">
                    <button
                        disabled={current === 0}
                        onClick={() => handleNavigation(current - 1)}
                        className="flex items-center gap-2 px-4 py-2 rounded bg-gray-200 hover:bg-gray-300 disabled:opacity-50"
                    >
                        <ArrowLeft size={16} /> Previous
                    </button>

                    <div className="flex gap-2 flex-wrap">
                        <button
                            onClick={() => handleMarkReview(currentQuestion._id)}
                            className="flex items-center gap-2 px-4 py-2 rounded bg-yellow-400 hover:bg-yellow-500 text-white"
                        >
                            <Flag size={16} /> Mark for Review
                        </button>

                        <button
                            onClick={() => handleClear(currentQuestion._id)}
                            className="flex items-center gap-2 px-4 py-2 rounded bg-red-400 hover:bg-red-500 text-white"
                        >
                            <XCircle size={16} /> Clear Answer
                        </button>
                    </div>

                    {current < test.questions.length - 1 ? (
                        <button
                            onClick={() => handleNavigation(current + 1)}
                            className="flex items-center gap-2 px-4 py-2 rounded bg-blue-600 hover:bg-blue-700 text-white"
                        >
                            Next <ArrowRight size={16} />
                        </button>
                    ) : (
                        <button
                            onClick={handleSubmit}
                            className="flex items-center gap-2 px-6 py-2 rounded bg-green-600 hover:bg-green-700 text-white"
                        >
                            <Send size={16} /> Submit Test
                        </button>
                    )}
                </div>
            </main>
        </div>
    );

};

export default AttemptTest;
