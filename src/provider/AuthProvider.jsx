import React, { createContext, useEffect, useState } from 'react';
import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signInWithPopup,
    signOut,
    updateProfile,
    GoogleAuthProvider,
    onAuthStateChanged,
    sendPasswordResetEmail,
} from 'firebase/auth';
import { auth } from '../../firebase.config';
import Swal from 'sweetalert2';
import useAxiosPublic from '../useAxiosPublic';

// Create AuthContext
export const AuthContext = createContext();

const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const axiosPublic = useAxiosPublic();

    const signup = (email, password) => {
        setLoading(true);
        return createUserWithEmailAndPassword(auth, email, password);
    };

    const login = (email, password) => {
        setLoading(true);
        return signInWithEmailAndPassword(auth, email, password);
    };

    const manageProfile = (name) => {
        return updateProfile(auth.currentUser, {
            displayName: name,
        });
    };

    const logout = async () => {
        setLoading(true);
        try {
            await signOut(auth);
            setUser(null);
            Swal.fire({
                icon: 'success',
                title: 'Logged Out!',
                text: 'You have been successfully logged out.',
                showConfirmButton: false,
                timer: 1500
            });
        } catch (err) {
            console.error("Logout failed:", err);
            Swal.fire('Error!', 'Failed to log out. Please try again.', 'error');
        } finally {
            setLoading(false);
        }
    };

    const resetPassword = (email) => {
        return sendPasswordResetEmail(auth, email);
    };

    const googleLogin = () => {
        const provider = new GoogleAuthProvider();
        setLoading(true);
        return signInWithPopup(auth, provider);
    };

    useEffect(() => {
        const unSubscribe = onAuthStateChanged(auth, async (currentUser) => {
            setUser(currentUser);
            if (currentUser) {
                const userInfo = { email: currentUser.email, uid: currentUser.uid };
                try {
                    const res = await axiosPublic.post('/jwt', userInfo); // ✅ fixed this line
                    if (res.data.token) {
                        localStorage.setItem('token', res.data.token);
                    }
                } catch (error) {
                    console.error('Error fetching token:', error);
                } finally {
                    setLoading(false);
                }
            } else {
                localStorage.removeItem('token');
                setLoading(false);
            }
        });

        return () => unSubscribe();
    }, [axiosPublic]);

    const authData = {
        user,
        setUser,
        loading,
        signup,
        login,
        logout,
        manageProfile,
        googleLogin,
        resetPassword
    };

    return (
        <AuthContext.Provider value={authData}>
            {children}
        </AuthContext.Provider>
    );
};

export default AuthProvider;
