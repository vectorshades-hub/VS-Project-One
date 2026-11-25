// Applications inserted the first time the server starts with an empty database.
module.exports = [
  {
    name: "Schedule Tracker",
    url: "http://192.168.3.13:5005",
    description: "Manage and monitor project schedules.",
    icon: "calendar-clock",
    status: "available",
    order: 1,
  },
  {
    name: "Attendance Tracker",
    url: "http://192.168.3.13:3001",
    description: "Track employee attendance and related records.",
    icon: "user-check",
    status: "available",
    order: 2,
  },
  {
    name: "Rebar PMS",
    url: "http://192.168.3.13:5006",
    description: "Manage rebar project activities and processes.",
    icon: "layers",
    status: "available",
    order: 3,
  },
  {
    name: "Estimating Manager",
    url: "http://192.168.3.13:3000",
    description: "Manage project estimation activities.",
    icon: "calculator",
    status: "available",
    order: 4,
  },
  {
    name: "QA Submission & Review Management System",
    url: "",
    description: "Manage QA submissions and review processes.",
    icon: "clipboard-check",
    status: "coming_soon",
    order: 5,
  },
];
