import { useEffect, useState } from "react";
import { ComplaintContext } from "./useComplaints";
import mockComplaints from "../data/mockComplaints";
import { complaintService } from "../services/complaintService";

const STORAGE_KEY = "complaints";

function readComplaints() {
    try {
        const savedComplaints = localStorage.getItem(STORAGE_KEY);

        if (!savedComplaints) {
            return mockComplaints.map((complaint) => ({ ...complaint }));
        }

        const parsedComplaints = JSON.parse(savedComplaints);

        return Array.isArray(parsedComplaints)
            ? parsedComplaints
            : mockComplaints.map((complaint) => ({ ...complaint }));
    } catch {
        return mockComplaints.map((complaint) => ({ ...complaint }));
    }
}

function persistComplaints(complaints) {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(complaints));
        return true;
    } catch {
        return false;
    }
}

function createComplaintId(complaints) {
    const usedIds = new Set(
        complaints.map((complaint) => complaint.id)
    );

    let sequence =
        complaints.reduce((highest, complaint) => {
            const number = Number.parseInt(
                String(complaint.id || "").replace("JS-", ""),
                10
            );

            return Number.isNaN(number)
                ? highest
                : Math.max(highest, number);
        }, 0) + 1;

    let id = `JS-${String(sequence).padStart(6, "0")}`;

    while (usedIds.has(id)) {
        sequence += 1;
        id = `JS-${String(sequence).padStart(6, "0")}`;
    }

    return id;
}

export function ComplaintProvider({ children }) {
    const [complaints, setComplaints] = useState(readComplaints);

    const [loading, setLoading] = useState(
        Boolean(localStorage.getItem("token"))
    );

    useEffect(() => {
        const token = localStorage.getItem("token");

        if (!token) {
            setLoading(false);
            return;
        }

        complaintService
            .getComplaints(token)
            .then((data) => {
                console.log(
                    "ComplaintContext - API complaints:",
                    data
                );

                if (Array.isArray(data)) {
                    setComplaints(data);
                } else {
                    console.error(
                        "ComplaintContext - Invalid API data:",
                        data
                    );
                    setComplaints([]);
                }
            })
            .catch((error) => {
                console.error(
                    "ComplaintContext - Failed to load complaints:",
                    error
                );
            })
            .finally(() => {
                setLoading(false);
            });
    }, []);

    const addComplaint = async (complaint) => {
        const token = localStorage.getItem("token");

        if (token) {
            const savedComplaint =
                await complaintService.createComplaint(
                    {
                        title: complaint.title,
                        description: complaint.description,
                        category: complaint.category,
                        location: complaint.location,
                        latitude: complaint.latitude,
                        longitude: complaint.longitude,
                    },
                    token
                );

            setComplaints((current) => [
                ...current,
                savedComplaint,
            ]);

            return savedComplaint;
        }

        const timestamp = new Date().toISOString();

        const newComplaint = {
            ...complaint,
            id:
                complaint.id ||
                createComplaintId(complaints),
            status:
                complaint.status ||
                "Submitted",
            createdAt:
                complaint.createdAt ||
                timestamp,
            updatedAt: timestamp,
            statusHistory:
                complaint.statusHistory || [
                    {
                        status: "Submitted",
                        timestamp,
                    },
                ],
        };

        const updatedComplaints = [
            ...complaints,
            newComplaint,
        ];

        setComplaints(updatedComplaints);
        persistComplaints(updatedComplaints);

        return newComplaint;
    };

    const getUserComplaints = (userEmail, userId) => {
        if (!userId && !userEmail) {
            return [];
        }

        return complaints.filter((complaint) => {
            /*
             * Backend API:
             * complaint.citizen_id
             */
            if (
                complaint.citizen_id &&
                userId
            ) {
                return (
                    String(complaint.citizen_id) ===
                    String(userId)
                );
            }

            /*
             * Old/local frontend data:
             * complaint.userId
             */
            if (
                complaint.userId &&
                userId
            ) {
                return (
                    String(complaint.userId) ===
                    String(userId)
                );
            }

            /*
             * Old/local frontend data:
             * complaint.userEmail
             */
            if (
                complaint.userEmail &&
                userEmail
            ) {
                return (
                    String(complaint.userEmail)
                        .toLowerCase() ===
                    String(userEmail)
                        .toLowerCase()
                );
            }

            return false;
        });
    };

    const updateComplaintStatus = async (
        complaintId,
        status
    ) => {
        const token = localStorage.getItem("token");

        if (token) {
            const updatedComplaint =
                await complaintService.updateComplaintStatus(
                    complaintId,
                    status,
                    token
                );

            setComplaints((current) =>
                current.map((complaint) =>
                    complaint.id === complaintId
                        ? updatedComplaint
                        : complaint
                )
            );

            return updatedComplaint;
        }

        const timestamp =
            new Date().toISOString();

        const updatedComplaints =
            complaints.map((complaint) => {
                if (
                    complaint.id !== complaintId
                ) {
                    return complaint;
                }

                return {
                    ...complaint,
                    status,
                    updatedAt: timestamp,
                    statusHistory: [
                        ...(Array.isArray(
                            complaint.statusHistory
                        )
                            ? complaint.statusHistory
                            : []),
                        {
                            status,
                            timestamp,
                        },
                    ],
                };
            });

        setComplaints(updatedComplaints);
        persistComplaints(updatedComplaints);
    };

    return (
        <ComplaintContext.Provider
            value={{
                complaints,
                loading,
                addComplaint,
                getUserComplaints,
                updateComplaintStatus,
            }}
        >
            {children}
        </ComplaintContext.Provider>
    );
}

export default ComplaintProvider;