import { createContext, useContext, useState } from "react";

const ComplaintContext = createContext();

export function ComplaintProvider({ children }) {
    const [complaints, setComplaints] = useState(() => {
        const savedComplaints = localStorage.getItem("complaints");

        return savedComplaints
            ? JSON.parse(savedComplaints)
            : [];
    });

    const addComplaint = (complaint) => {
        const updatedComplaints = [
            ...complaints,
            complaint,
        ];

        setComplaints(updatedComplaints);

        localStorage.setItem(
            "complaints",
            JSON.stringify(updatedComplaints)
        );
    };

    const getUserComplaints = (userEmail) => {
        return complaints.filter(
            (complaint) => complaint.userEmail === userEmail
        );
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