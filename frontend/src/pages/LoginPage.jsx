import { useState } from "react";
import Loginform from "../components/LoginForm"
const LoginPage = () => {
    const [error, setError] = useState(null);
    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-200">
            <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-gray-800">King Solomon</h1>
                    <p className="text-gray-600 mt-2">Sign in to your account</p>
                </div>

                {error && (
                    <div className="mb-4 p-3 bg-red border border-red-400 text-red-700 rounded">{error}</div>
                )}

                <Loginform/>
            </div>

        </div>
    )
};

export default LoginPage;