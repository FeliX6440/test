import { useState } from "react";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
} from "firebase/auth";
import { auth, db } from "../firebase";
import "../index.css";
import { useNavigate } from "react-router-dom";
import { collection, doc, setDoc } from "firebase/firestore";

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [password2, setPassword2] = useState("");
  const [error, setError] = useState(null);

  const navigate = useNavigate();

  const handleLogin = async () => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate("/dashboard");
    } catch (error) {
      setError(error.message);
    }
  };

  const handleSignup = async () => {
    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      const uid = userCredential.user.uid;

      // Adding the user to Firestore
      await setDoc(doc(db, "users", uid), {
        email: email,
        // Add any other user fields you want
      });

      // Adding a default forms collection with a dummy form
      const formsRef = collection(doc(db, "users", uid), "forms");
      const dummyForm = {
        fields: ["Sample Field"],
      };

      await setDoc(doc(formsRef), dummyForm); // Create a new form document

      navigate("/dashboard");
    } catch (error) {
      setError(error.message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-blue-200 to-pink-100">
      <div className="p-8 bg-white shadow-md rounded-md w-96">
        <h2 className="text-2xl font-bold mb-5">
          {isLogin ? "Login" : "Sign Up"}
        </h2>

        <input
          className="w-full p-2 mb-4 border rounded shadow-sm focus:outline-none focus:border-blue-400"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
        />
        <input
          className="w-full p-2 mb-4 border rounded shadow-sm focus:outline-none focus:border-blue-400"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
        />
        {isLogin ? (
          <button
            className="w-full p-2 mb-4 bg-gradient-to-r from-blue-300 to-cyan-200 text-black font-bold rounded focus:outline-none hover:from-blue-400 hover:to-cyan-300 hover:text-white"
            onClick={handleLogin}
          >
            Login
          </button>
        ) : (
          <div>
            <input
              className="w-full p-2 mb-4 border rounded shadow-sm focus:outline-none focus:border-blue-400"
              type="password"
              value={password2}
              onChange={(e) => setPassword2(e.target.value)}
              placeholder="Repeat Password"
            />
            <button
              className="w-full p-2 mb-4 bg-gradient-to-r from-cyan-200 to-blue-200 text-black font-bold rounded focus:outline-none hover:from-cyan-300 hover:to-blue-300 hover:text-white"
              onClick={handleSignup}
            >
              Sign Up
            </button>
          </div>
        )}
        <button
          className="w-full p-2 bg-gray-200 rounded hover:bg-gray-300 focus:outline-none"
          onClick={() => setIsLogin(!isLogin)}
        >
          {isLogin ? "I Don't Have an Account!" : "I Already Have an Account!"}
        </button>
        {error && <p className="mt-4 text-red-500">{error}</p>}
      </div>
    </div>
  );
};

export default Auth;
