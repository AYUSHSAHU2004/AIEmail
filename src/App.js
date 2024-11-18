import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'; // Use Navigate for redirection
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './firebase/firebase';
import Home from './Home';
import NewGroup from './Pages/NewGroup/NewGroup';
import axios from 'axios';
import Login from './Pages/Login/Login';
import SignUp from './Pages/SignUp/SignUp';

const App = () => {
  const [user, setUser] = useState(null);
  const [isEmailValid, setIsEmailValid] = useState(false);
  const [loading, setLoading] = useState(true);


  useEffect(() => {
    // Listen for changes in the authentication state
    const unsubscribe = onAuthStateChanged(auth, async(user) => {
      if (user) {
        setUser(user); // If the user is logged in, set the user state
        try {
          setLoading(true);
          const response = await axios.get(
            `http://localhost:3020/checkUser/${user.email}`
          );
          if (response.status === 200) {
            setIsEmailValid(true); // Email exists in the database
          } else {
            setIsEmailValid(false);
          }
        } catch (error) {
          console.error('Error validating email:', error);
          setIsEmailValid(false); // Email not valid
        } finally {
          setLoading(false); // Stop loading
        }
      } else {
        setUser(null); // If not, set user state to null
      }
    });
    

    // Cleanup the listener when the component unmounts
    return () => unsubscribe();
  }, []);

  return (
    <Router>
      <Routes>
        <Route
          path="/"
          element={user ? <Home /> : <Navigate to="/login" />} // Redirect to /login if no user
        />
        <Route
          path="/login"
          element={(user && isEmailValid )? <Navigate to="/" /> : <Login />} // Redirect to / if user is logged in
        />
        <Route
          path="/SignUp"
          element=<SignUp/>
        />
        <Route
          path="/NewGroup"
          element=<NewGroup/>
        />
      </Routes>
    </Router>
  );
};

export default App;
