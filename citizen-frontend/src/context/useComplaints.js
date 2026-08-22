import { createContext, useContext } from "react";

export const ComplaintContext = createContext(null);

export function useComplaints() {
  return useContext(ComplaintContext);
}

export default useComplaints;
