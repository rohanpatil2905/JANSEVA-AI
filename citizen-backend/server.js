import "dotenv/config";
import express from "express";
import cors from "cors";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import fs from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";

const app = express();
const port = Number(process.env.PORT || 5001);
const secret =
  process.env.JWT_SECRET || "development-only-secret-change-me";

const dataFile = path.resolve(
  process.env.DATA_FILE || "./data/store.json"
);

const statuses = [
  "Submitted",
  "Under Review",
  "Assigned",
  "In Progress",
  "Resolved"
];

const departments = {
  Roads: "Roads and Public Works",
  "Water Supply": "Water Works",
  Sanitation: "Sanitation",
  "Street Lights": "Electrical Services",
  Drainage: "Drainage and Stormwater",
  "Public Safety": "Public Safety"
};

app.use(
  cors({
    origin: process.env.CLIENT_ORIGIN || true
  })
);

app.use(express.json({ limit: "1mb" }));

const citizenDist = path.resolve(
  process.env.CITIZEN_DIST || "../dist"
);

const officerDist = path.resolve(
  process.env.OFFICER_DIST || "../officer-console/dist"
);

/* =========================================================
   STORE
========================================================= */

async function readStore() {
  try {
    return JSON.parse(
      await fs.readFile(dataFile, "utf8")
    );
  } catch {
    return {
      users: [],
      complaints: []
    };
  }
}

async function writeStore(store) {
  await fs.mkdir(
    path.dirname(dataFile),
    { recursive: true }
  );

  await fs.writeFile(
    dataFile,
    JSON.stringify(store, null, 2)
  );
}

/* =========================================================
   AUTH
========================================================= */

function tokenFor(user) {
  return jwt.sign(
    {
      id: user.id,
      role: user.role,
      email: user.email
    },
    secret,
    {
      expiresIn: "2h"
    }
  );
}

function safeUser(user) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role
  };
}

function auth(requiredRole) {
  return (req, res, next) => {
    try {
      const header =
        req.headers.authorization || "";

      const token = header.replace(
        "Bearer ",
        ""
      );

      req.auth = jwt.verify(
        token,
        secret
      );

      if (
        requiredRole &&
        !requiredRole.includes(req.auth.role)
      ) {
        return res.status(403).json({
          message: "Insufficient permissions."
        });
      }

      next();
    } catch {
      res.status(401).json({
        message: "Authentication required."
      });
    }
  };
}

/* =========================================================
   AI RECOMMENDATIONS
========================================================= */

function aiRecommendations({
  title,
  description,
  category
}) {
  const text =
    `${title} ${description} ${category}`.toLowerCase();

  const detectedCategory =
    category ||
    (
      text.includes("water")
        ? "Water Supply"
        : text.includes("road") ||
          text.includes("pothole")
        ? "Roads"
        : text.includes("light")
        ? "Street Lights"
        : text.includes("garbage") ||
          text.includes("waste")
        ? "Sanitation"
        : "Public Safety"
    );

  const priority =
    /accident|danger|unsafe|emergency|overflow/.test(text)
      ? "High"
      : /week|days|blocked/.test(text)
      ? "Medium"
      : "Low";

  return {
    detectedLanguage:
      /[\u0900-\u097F]/.test(
        `${title} ${description}`
      )
        ? "hi"
        : "en",

    aiCategory: detectedCategory,

    aiDepartment:
      departments[detectedCategory] ||
      "General Civic Services",

    aiPriority: priority,

    aiSummary:
      description.slice(0, 160),

    aiProcessingStatus:
      "completed"
  };
}

/* =========================================================
   HEALTH
========================================================= */

app.get(
  "/api/health",
  (req, res) => {
    res.json({
      ok: true,
      service: "janseva-backend"
    });
  }
);

/* =========================================================
   AUTH ROUTES
========================================================= */

app.post(
  "/api/auth/register",
  async (req, res, next) => {
    try {
      const {
        name,
        email,
        password
      } = req.body;

      if (
        !name?.trim() ||
        !/^\S+@\S+\.\S+$/.test(
          email || ""
        ) ||
        (password || "").length < 6
      ) {
        return res.status(400).json({
          message:
            "Name, valid email, and a 6-character password are required."
        });
      }

      const store = await readStore();

      if (
        store.users.some(
          user =>
            user.email ===
            email.toLowerCase()
        )
      ) {
        return res.status(409).json({
          message:
            "Email is already registered."
        });
      }

      const user = {
        id: randomUUID(),
        name: name.trim(),
        email: email.toLowerCase(),
        passwordHash:
          await bcrypt.hash(
            password,
            12
          ),
        role: "citizen",
        createdAt:
          new Date().toISOString()
      };

      store.users.push(user);

      await writeStore(store);

      res.status(201).json({
        user: safeUser(user),
        token: tokenFor(user)
      });
    } catch (error) {
      next(error);
    }
  }
);

app.post(
  "/api/auth/login",
  async (req, res, next) => {
    try {
      const store = await readStore();

      let user =
        store.users.find(
          item =>
            item.email ===
            (
              req.body.email || ""
            ).toLowerCase()
        );

      /* Demo citizen */
      if (
        !user &&
        req.body.email?.toLowerCase() ===
          "demo@janseva.ai" &&
        req.body.password ===
          "demo123"
      ) {
        user = {
          id: "demo-citizen",
          name: "Demo Citizen",
          email: "demo@janseva.ai",
          role: "citizen"
        };
      }

      /* Demo official */
      if (
        !user &&
        req.body.email?.toLowerCase() ===
          "official@janseva.ai" &&
        req.body.password ===
          "official123"
      ) {
        user = {
          id: "demo-official",
          name: "Demo Official",
          email: "official@janseva.ai",
          role: "official"
        };
      }

      if (
        !user ||
        (
          user.passwordHash &&
          !(
            await bcrypt.compare(
              req.body.password || "",
              user.passwordHash
            )
          )
        )
      ) {
        return res.status(401).json({
          message:
            "Invalid email or password."
        });
      }

      res.json({
        user: safeUser(user),
        token: tokenFor(user)
      });
    } catch (error) {
      next(error);
    }
  }
);

app.post(
  "/api/auth/logout",
  auth(),
  (req, res) => {
    res.json({
      ok: true
    });
  }
);

app.get(
  "/api/auth/me",
  auth(),
  async (req, res) => {
    const store =
      await readStore();

    const user =
      store.users.find(
        item =>
          item.id ===
          req.auth.id
      ) ||
      (
        req.auth.id ===
        "demo-citizen"
          ? {
              id: "demo-citizen",
              name: "Demo Citizen",
              email:
                "demo@janseva.ai",
              role: "citizen"
            }
          : req.auth.id ===
              "demo-official"
          ? {
              id: "demo-official",
              name: "Demo Official",
              email:
                "official@janseva.ai",
              role: "official"
            }
          : null
      );

    if (!user) {
      return res.status(404).json({
        message:
          "User not found."
      });
    }

    res.json({
      user: safeUser(user)
    });
  }
);

/* =========================================================
   COMPLAINT ROUTES
========================================================= */

/*
 GET ALL COMPLAINTS
*/
app.get(
  "/api/complaints",
  auth(),
  async (req, res) => {
    const store =
      await readStore();

    const complaints =
      req.auth.role === "citizen"
        ? store.complaints.filter(
            item =>
              item.userId ===
              req.auth.id
          )
        : store.complaints;

    res.json({
      complaints
    });
  }
);

/*
 GET SINGLE COMPLAINT
*/
app.get(
  "/api/complaints/:id",
  auth(),
  async (req, res) => {
    const store =
      await readStore();

    const complaint =
      store.complaints.find(
        item =>
          item.id ===
          req.params.id
      );

    if (
      !complaint ||
      (
        req.auth.role ===
          "citizen" &&
        complaint.userId !==
          req.auth.id
      )
    ) {
      return res.status(404).json({
        message:
          "Complaint not found."
      });
    }

    res.json({
      complaint
    });
  }
);

/*
 CREATE COMPLAINT
*/
app.post(
  "/api/complaints",
  auth(),
  async (req, res, next) => {
    try {
      const {
        title,
        description,
        category,
        location,
        latitude,
        longitude
      } = req.body;

      if (
        !title?.trim() ||
        !description?.trim() ||
        !category ||
        !location?.trim()
      ) {
        return res.status(400).json({
          message:
            "Title, description, category, and location are required."
        });
      }

      const store =
        await readStore();

      const now =
        new Date().toISOString();

      const complaint = {
        id: `JS-${String(
          store.complaints.length + 1
        ).padStart(6, "0")}`,

        userId:
          req.auth.id,

        title:
          title.trim(),

        description:
          description.trim(),

        category,

        /*
         * IMPORTANT:
         * Keep the actual location entered
         * by the citizen.
         */
        location:
          location.trim(),

        /*
         * Preserve GPS coordinates too.
         */
        latitude:
          latitude ?? null,

        longitude:
          longitude ?? null,

        status:
          "Submitted",

        statusHistory: [
          {
            status:
              "Submitted",
            timestamp:
              now
          }
        ],

        createdAt:
          now,

        updatedAt:
          now,

        ...aiRecommendations(
          req.body
        )
      };

      store.complaints.push(
        complaint
      );

      await writeStore(
        store
      );

      res.status(201).json({
        complaint
      });
    } catch (error) {
      next(error);
    }
  }
);

/* =========================================================
   ASSIGN COMPLAINT
========================================================= */

/*
 IMPORTANT:
 This is the endpoint that was missing.

 POST
 /api/complaints/:id/assign
*/
app.post(
  "/api/complaints/:id/assign",
  auth(["official", "admin"]),
  async (req, res, next) => {
    try {
      const store =
        await readStore();

      const complaint =
        store.complaints.find(
          item =>
            item.id ===
            req.params.id
        );

      if (!complaint) {
        return res.status(404).json({
          message:
            "Complaint not found."
        });
      }

      const {
        officerId,
        officerName,
        department,
        ward,
        notes
      } = req.body;

      const now =
        new Date().toISOString();

      /*
       * Save officer information
       */
      complaint.assignedOfficerId =
        officerId || null;

      complaint.assignedOfficerName =
        officerName ||
        "Municipal Officer";

      /*
       * Save department
       */
      complaint.assignedDepartment =
        department ||
        complaint.aiDepartment ||
        complaint.department ||
        "General Civic Services";

      /*
       * Save ward
       */
      complaint.assignedWard =
        ward || null;

      /*
       * Optional officer notes
       */
      complaint.assignmentNotes =
        notes || null;

      /*
       * Assignment metadata
       */
      complaint.assignedAt =
        now;

      complaint.assignedBy =
        req.auth.id;

      /*
       * Change status
       */
      complaint.status =
        "Assigned";

      complaint.updatedAt =
        now;

      /*
       * Make sure history exists
       */
      if (
        !Array.isArray(
          complaint.statusHistory
        )
      ) {
        complaint.statusHistory =
          [];
      }

      /*
       * Record assignment
       */
      complaint.statusHistory.push({
        status:
          "Assigned",

        timestamp:
          now,

        officerId:
          complaint.assignedOfficerId,

        officerName:
          complaint.assignedOfficerName,

        department:
          complaint.assignedDepartment,

        ward:
          complaint.assignedWard
      });

      await writeStore(
        store
      );

      res.json({
        message:
          "Complaint assigned successfully.",

        complaint
      });
    } catch (error) {
      console.error(
        "Assignment failed:",
        error
      );

      next(error);
    }
  }
);

/* =========================================================
   UPDATE STATUS
========================================================= */

app.patch(
  "/api/complaints/:id/status",
  auth(["official", "admin"]),
  async (req, res) => {
    const store =
      await readStore();

    const complaint =
      store.complaints.find(
        item =>
          item.id ===
          req.params.id
      );

    if (!complaint) {
      return res.status(404).json({
        message:
          "Complaint not found."
      });
    }

    if (
      !statuses.includes(
        req.body.status
      )
    ) {
      return res.status(400).json({
        message:
          "Invalid status."
      });
    }

    const now =
      new Date().toISOString();

    complaint.status =
      req.body.status;

    complaint.updatedAt =
      now;

    if (
      !Array.isArray(
        complaint.statusHistory
      )
    ) {
      complaint.statusHistory =
        [];
    }

    complaint.statusHistory.push({
      status:
        req.body.status,

      timestamp:
        now
    });

    await writeStore(
      store
    );

    res.json({
      complaint
    });
  }
);

/* =========================================================
   AI RECOMMENDATIONS
========================================================= */

app.get(
  "/api/ai/recommendations/:id",
  auth(["official", "admin"]),
  async (req, res) => {
    const store =
      await readStore();

    const complaint =
      store.complaints.find(
        item =>
          item.id ===
          req.params.id
      );

    if (!complaint) {
      return res.status(404).json({
        message:
          "Complaint not found."
      });
    }

    res.json({
      complaintId:
        complaint.id,

      predictedCategory:
        complaint.aiCategory ||
        complaint.category,

      recommendedDepartment:
        complaint.aiDepartment ||
        "General Civic Services",

      severityScore:
        complaint.aiPriority ===
        "High"
          ? 90
          : complaint.aiPriority ===
            "Medium"
          ? 60
          : 30,

      confidence:
        85,

      aiSummary:
        complaint.aiSummary ||
        complaint.description,

      xaiFactors: []
    });
  }
);

/* =========================================================
   DASHBOARD
========================================================= */

app.get(
  "/api/dashboard/kpis",
  auth(["official", "admin"]),
  async (req, res) => {
    const store =
      await readStore();

    const complaints =
      store.complaints;

    const openStatuses =
      new Set([
        "Submitted",
        "Under Review",
        "Assigned",
        "In Progress"
      ]);

    res.json({
      totalComplaints:
        complaints.length,

      openComplaints:
        complaints.filter(
          item =>
            openStatuses.has(
              item.status
            )
        ).length,

      criticalComplaints:
        complaints.filter(
          item =>
            item.aiPriority ===
            "High"
        ).length,

      resolvedToday:
        complaints.filter(
          item =>
            item.status ===
              "Resolved" &&
            item.updatedAt?.slice(
              0,
              10
            ) ===
              new Date()
                .toISOString()
                .slice(0, 10)
        ).length,

      slaAtRisk:
        0
    });
  }
);

/* =========================================================
   FRONTEND SERVING
========================================================= */

app.use(
  "/officer",
  express.static(
    officerDist
  )
);

app.use(
  express.static(
    citizenDist
  )
);

app.use(
  "/officer",
  (req, res) =>
    res.sendFile(
      path.join(
        officerDist,
        "index.html"
      )
    )
);

app.use(
  (req, res, next) => {
    if (
      req.method === "GET" &&
      !req.path.startsWith(
        "/api/"
      ) &&
      !path.extname(
        req.path
      )
    ) {
      return res.sendFile(
        path.join(
          citizenDist,
          "index.html"
        )
      );
    }

    next();
  }
);

/* =========================================================
   ERROR HANDLER
========================================================= */

app.use(
  (
    error,
    req,
    res,
    next
  ) => {
    console.error(
      error
    );

    res.status(500).json({
      message:
        "Unexpected server error."
    });
  }
);

/* =========================================================
   START SERVER
========================================================= */

app.listen(
  port,
  () => {
    console.log(
      `JanSeva API listening on http://localhost:${port}`
    );
  }
);