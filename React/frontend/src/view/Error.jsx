import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from "axios"
const Error = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const path = import.meta.env.VITE_BASE_URL;
    const { status = 404, message = "Page not found!" } = location.state || {}
    return (
        <div className="flex flex-col items-center justify-center h-screen bg-gray-100 text-center px-4">
            <h1 className="text-6xl font-bold text-red-500">{status}</h1>
            <p className="text-2xl mt-4 text-gray-700">{message}</p>
            <p className="mt-2 text-gray-600">
                Click on the button below
            </p>
            <button
                onClick={() => {
                    axios.get(`${path}/logout`, { withCredentials: true })
                        .finally(() => {
                            navigate("/", {
                                state: { success: false, message: "Some error occurred: Login" }
                            });
                        });
                }}
                className="mt-6 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
                Go Home
            </button>

        </div >
    );
};

export default Error;
