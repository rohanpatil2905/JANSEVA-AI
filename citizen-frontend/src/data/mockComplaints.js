const mockComplaints = [
    {
        id: "JS-001",
        title: "Large pothole on MG Road causing accidents",
        description:
            "There is a large pothole near the MG Road bus stop that has been causing accidents for the past two weeks. Several two-wheelers have skidded and one auto-rickshaw was damaged. Immediate repair is needed before the situation worsens.",
        category: "Roads",
        status: "In Progress",
        createdAt: "2025-08-10",
        userEmail: "demo@janseva.ai",
        statusHistory: [
            { status: "Submitted", timestamp: "2025-08-10T08:00:00.000Z" },
            { status: "Under Review", timestamp: "2025-08-11T08:00:00.000Z" },
            { status: "Assigned", timestamp: "2025-08-12T08:00:00.000Z" },
            { status: "In Progress", timestamp: "2025-08-13T08:00:00.000Z" },
        ],
        location: "MG Road, Near Central Bus Stop, Pune",
    },
    {
        id: "JS-002",
        title: "No water supply for three days in Shivaji Nagar",
        description:
            "Residents of Shivaji Nagar Ward 12 have not received municipal water supply for the past three days. The overhead tank in the area appears to be empty and the supply pipeline may have a leak near the main junction.",
        category: "Water Supply",
        status: "Assigned",
        createdAt: "2025-08-12",
        userEmail: "demo@janseva.ai",
        location: "Shivaji Nagar, Ward 12, Pune",
    },
    {
        id: "JS-003",
        title: "Garbage not collected for over a week",
        description:
            "The garbage collection truck has not visited Laxmi Chowk area for more than a week. Waste is piling up on the roadside and the stench is unbearable. Stray animals are scattering the garbage, creating a health hazard for nearby residents.",
        category: "Sanitation",
        status: "Under Review",
        createdAt: "2025-08-14",
        userEmail: "demo@janseva.ai",
        location: "Laxmi Chowk, Nagpur",
    },
    {
        id: "JS-004",
        title: "Street lights not working on Station Road",
        description:
            "All street lights on Station Road between the railway crossing and the post office have been non-functional for the past ten days. The area becomes completely dark after 7 PM, making it unsafe for pedestrians and commuters.",
        category: "Street Lights",
        status: "Submitted",
        createdAt: "2025-08-16",
        userEmail: "demo@janseva.ai",
        location: "Station Road, Nashik",
    },
    {
        id: "JS-005",
        title: "Blocked drainage causing waterlogging",
        description:
            "The main drainage channel near Ambedkar Garden is completely blocked with plastic waste and debris. Even light rain causes severe waterlogging in the surrounding residential area, and water enters ground-floor homes.",
        category: "Drainage",
        status: "Resolved",
        createdAt: "2025-08-05",
        userEmail: "demo@janseva.ai",
        location: "Ambedkar Garden, Solapur",
    },
    {
        id: "JS-006",
        title: "Broken boundary wall at public park is a safety risk",
        description:
            "The boundary wall of Nehru Park on the eastern side has collapsed partially. Children playing in the park are at risk as the broken wall opens directly onto a busy road. Temporary barricades are also missing.",
        category: "Public Safety",
        status: "In Progress",
        createdAt: "2025-08-08",
        userEmail: "demo@janseva.ai",
        location: "Nehru Park, East Side, Aurangabad",
    },
];

export default mockComplaints;
