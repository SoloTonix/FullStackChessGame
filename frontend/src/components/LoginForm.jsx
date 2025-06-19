import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";



function Loginform(){
    const [username, setUsername] = useState(null);
    const [password, setPassword] = useState(null);
    const [loading, setLoading] = useState(false)
    const {login} = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try{
            await login(username, password);
            //token = localStorage.getItem('access_token')
            //const decoded = jwtDecode(token);
            

            navigate('/')
        }
        catch(err){
            console.log('Login Failed',err)
        }
    };

    return (
        <div>
            <form onSubmit={handleSubmit} className="space-y-6">

                <input type="text" value={username} onChange={(e)=>setUsername(e.target.value)} placeholder="Enter your username" className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" required/>

                <input type="password" value={password} onChange={(e)=>setPassword(e.target.value)} placeholder="Enter your password" className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500" required/>
                <button type="submit" disabled={loading} className={`w-full py-2 px-4 rounded-md text-white font-medium ${loading ? 'bg-blue-400' : 'bg-blue-600 hover:bg-blue-700'} focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors`}>{loading? 'Logging in...':'Login'}</button>
            </form>

            <div className="mt-6 text-center text-sm text-gray-600">
                <p>Don't have an account?</p>
            </div>
        </div>

    )
};

export default Loginform;


