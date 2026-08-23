import { createContext, useContext, useEffect, useState } from "react";
import { complaintService } from "../services/complaintService";

const ComplaintContext = createContext();

export function ComplaintProvider({ children }) {
    const [complaints, setComplaints] = useState(() => {
        const savedComplaints = localStorage.getItem("complaints");

        try {
            const parsed = savedComplaints ? JSON.parse(savedComplaints) : [];
            return Array.isArray(parsed) ? parsed : [];
        } catch {
            return [];
        }
    });

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (!token) return;
        complaintService.getComplaints(token)
            .then(setComplaints)
            .catch(() => {});
    }, []);

    const addComplaint = async (complaint) => {
        const token = localStorage.getItem("token");
        if (token) {
            const savedComplaint = await complaintService.createComplaint(complaint, token);
            setComplaints((current) => [...current, savedComplaint]);
            return savedComplaint;
        }

        const updatedComplaints = [...complaints, complaint];
        setComplaints(updatedComplaints);
        localStorage.setItem("complaints", JSON.stringify(updatedComplaints));
        return complaint;
    };

    const getUserComplaints = () => {
        return complaints;
    };

    return (
        <ComplaintContext.Provider
            value={{
                complaints,
                addComplaint,
                getUserComplaints,
            }}
        >
            {children}
        </ComplaintContext.Provider>
    );
}

export function useComplaints() {
    return useContext(ComplaintContext);
}