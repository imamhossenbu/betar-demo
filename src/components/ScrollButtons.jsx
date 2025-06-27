import React, { useState, useEffect } from 'react';
import { ArrowUp, ArrowDown } from 'lucide-react';

const ScrollButtons = () => {
    const [isVisible, setIsVisible] = useState(false);

    const scrollToTop = () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    };

    const scrollToBottom = () => {
        window.scrollTo({
            top: document.documentElement.scrollHeight,
            behavior: 'smooth'
        });
    };

    useEffect(() => {
        const toggleVisibility = () => {
            // যখন ব্যবহারকারী যথেষ্ট স্ক্রল করবে, বাটনগুলি দৃশ্যমান হবে
            // এখানে 300 কে ছোট করে 50 বা আপনার প্রয়োজন অনুযায়ী সেট করুন
            if (window.pageYOffset > 50) { // <-- এই মানটি 300 থেকে 50 এ পরিবর্তন করুন (বা আপনার প্রয়োজন অনুযায়ী)
                setIsVisible(true);
            } else {
                setIsVisible(false);
            }
        };

        window.addEventListener('scroll', toggleVisibility);

        return () => {
            window.removeEventListener('scroll', toggleVisibility);
        };
    }, []);

    return (
        <div className="fixed bottom-4 right-4 z-50 flex flex-col space-y-2">
            {isVisible && (
                <>
                    <button
                        onClick={scrollToTop}
                        className="p-3 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-75 transition-all duration-300 transform hover:scale-110"
                        aria-label="Scroll to top"
                    >
                        <ArrowUp size={24} />
                    </button>
                    <button
                        onClick={scrollToBottom}
                        className="p-3 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-75 transition-all duration-300 transform hover:scale-110"
                        aria-label="Scroll to bottom"
                    >
                        <ArrowDown size={24} />
                    </button>
                </>
            )}
        </div>
    );
};

export default ScrollButtons;
