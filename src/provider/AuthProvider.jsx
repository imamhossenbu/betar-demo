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
import { axiosSecure } from '../useAxiosSecure'

// Create AuthContext
export const AuthContext = createContext();

const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

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
            await axiosSecure.post('/api/logout', {}, { withCredentials: true });
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
            setLoading(true);

            try {
                if (currentUser?.email) {
                    setUser(currentUser);

                    try {
                        await axiosSecure.post('/users', {
                            uid: currentUser.uid,
                            email: currentUser.email,
                            displayName: currentUser.displayName || '',
                            role: 'user'
                        }, { withCredentials: true });

                        await axiosSecure.post('/jwt', {
                            email: currentUser.email,
                            uid: currentUser.uid,
                        }, { withCredentials: true });

                    } catch (backendErr) {
                        console.error('Backend sync or JWT error:', backendErr);
                        setUser(null);
                        await signOut(auth);
                        await axiosSecure.post('/api/logout', {}, { withCredentials: true });
                    }

                } else {
                    setUser(null);
                    try {
                        await axiosSecure.post('/api/logout', {}, { withCredentials: true });
                    } catch (logoutErr) {
                        console.warn("Failed to clear session:", logoutErr);
                    }
                }
            } catch (globalErr) {
                console.error("Auth state change error:", globalErr);
                Swal.fire('Error!', 'An unexpected authentication error occurred.', 'error');
            } finally {
                setLoading(false);
            }
        });

        return () => unSubscribe();
    }, []);

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
