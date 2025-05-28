import { useNavigate } from "react-router-dom";

export default function InteractiveBox({ color, text, path }) {
    const navigate = useNavigate();
    const bgColor = {
        red: "bg-red-500 hover:bg-red-600",
        yellow: "bg-yellow-500 hover:bg-yellow-600",
        green: "bg-green-500 hover:bg-green-600",
    }[color] || "bg-gray-500";

    return (
        <div
            className={`text-white font-semibold px-12 py-10 rounded-lg shadow-lg cursor-pointer transform transition-transform duration-300 hover:scale-105 ${bgColor}`}
            role="button"
            tabIndex={0}
            onClick={() => navigate(`${path}`)}
        >
            {text}
        </div>
    );
};

