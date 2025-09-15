import { useEffect, useState, useCallback } from "react";

function useCooldownTimer(cooldownSeconds) {
    const [timeLeft, setTimeLeft] = useState(0);

    // Check localStorage on mount only
    useEffect(() => {
        const lastTimestamp = localStorage.getItem('lastRequestTimestamp');
        if(lastTimestamp) {
            const elapsed = (Date.now() - parseInt(lastTimestamp, 10)) / 1000;
            if(elapsed < cooldownSeconds) {
                setTimeLeft(Math.ceil(cooldownSeconds - elapsed));
            }
        }
    }, []); // Empty dependency array - only run on mount

    useEffect(() => {
        if(timeLeft <= 0) return;

        const intervalId = setInterval(() => {
            setTimeLeft(prev => {
                if(prev <= 1) {
                    clearInterval(intervalId);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(intervalId);
    }, [timeLeft]);

    const startTimer = useCallback(() => {
        localStorage.setItem('lastRequestTimestamp', Date.now().toString());
        setTimeLeft(cooldownSeconds);
    }, [cooldownSeconds]);

    const isOnCooldown = timeLeft > 0;

    return { timeLeft, startTimer, isOnCooldown };
}

export default useCooldownTimer;
