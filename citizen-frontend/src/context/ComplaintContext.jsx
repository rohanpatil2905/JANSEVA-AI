import { useEffect, useState } from "react";
import { ComplaintContext } from "./useComplaints";
import mockComplaints from "../data/mockComplaints";
import { complaintService } from "../services/complaintService";

const STORAGE_KEY = "complaints";

function readComplaints() {
  try {
    const savedComplaints = localStorage.getItem(STORAGE_KEY);
    if (!savedComplaints) return mockComplaints.map((complaint) => ({ ...complaint }));

    const parsedComplaints = JSON.parse(savedComplaints);
    return Array.isArray(parsedComplaints) ? parsedComplaints : mockComplaints.map((complaint) => ({ ...complaint }));
  } catch {
    return mockComplaints.map((complaint) => ({ ...complaint }));
  }
}

function persistComplaints(complaints) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(complaints));
  } catch {
    return false;
  }
  return true;
}

function createComplaintId(complaints) {
  const usedIds = new Set(complaints.map((complaint) => complaint.id));
  let sequence = complaints.reduce((highest, complaint) => {
    const number = Number.parseInt(String(complaint.id || "").replace("JS-", ""), 10);
    return Number.isNaN(number) ? highest : Math.max(highest, number);
  }, 0) + 1;

  let id = `JS-${String(sequence).padStart(6, "0")}`;
  while (usedIds.has(id)) id = `JS-${String(++sequence).padStart(6, "0")}`;
  return id;
}

export function ComplaintProvider({ children }) {
  const [complaints, setComplaints] = useState(readComplaints);
  const [loading, setLoading] = useState(Boolean(localStorage.getItem("token")));

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;
    complaintService.getComplaints(token)
      .then(setComplaints)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const addComplaint = async (complaint) => {
    const token = localStorage.getItem("token");
    if (token) {
      const savedComplaint = await complaintService.createComplaint({
        title: complaint.title,
        description: complaint.description,
        category: complaint.category,
        location: complaint.location,
        latitude: complaint.latitude,
        longitude: complaint.longitude,
      }, token);
      setComplaints((current) => [...current, savedComplaint]);
      return savedComplaint;
    }

    const timestamp = new Date().toISOString();
    const newComplaint = {
      ...complaint,
      id: complaint.id || createComplaintId(complaints),
      status: complaint.status || "Submitted",
      createdAt: complaint.createdAt || timestamp,
      updatedAt: timestamp,
      statusHistory: complaint.statusHistory || [{ status: "Submitted", timestamp }],
    };
    const updatedComplaints = [...complaints, newComplaint];

    setComplaints(updatedComplaints);
    persistComplaints(updatedComplaints);
    return newComplaint;
  };

  const getUserComplaints = (userEmail) => {
    return complaints.filter((complaint) => complaint.userEmail === userEmail);
  };

  const updateComplaintStatus = async (complaintId, status) => {
    const token = localStorage.getItem("token");
    if (token) {
      const updatedComplaint = await complaintService.updateComplaintStatus(complaintId, status, token);
      setComplaints((current) => current.map((complaint) => complaint.id === complaintId ? updatedComplaint : complaint));
      return updatedComplaint;
    }

    const timestamp = new Date().toISOString();
    const updatedComplaints = complaints.map((complaint) => {
      if (complaint.id !== complaintId) return complaint;
      return {
        ...complaint,
        status,
        updatedAt: timestamp,
        statusHistory: [
          ...(Array.isArray(complaint.statusHistory) ? complaint.statusHistory : []),
          { status, timestamp },
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