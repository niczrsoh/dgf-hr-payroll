import React from "react";
import { createBrowserRouter } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import MainLayout from "./layouts/MainLayout";
import Dashboard from "./pages/Dashboard";
import EmployeeManagement from "./pages/EmployeeManagement";
import AttendanceEntry from "./pages/AttendanceEntry";
import AdvancePayment from "./pages/AdvancePayment";
import PayrollProcessing from "./pages/PayrollProcessing";
import Payslip from "./pages/Payslip";
import BranchManagement from "./pages/BranchManagement";
import PayrollSettings from "./pages/PayrollSettings";
import ComingSoon from "./pages/ComingSoon";
import Reporting from "./pages/Reporting";

export const router = createBrowserRouter([
  {
    path: "/login",
    element: <LoginPage />,
  },
  {
    path: "/",
    element: <MainLayout />,
    children: [
      { index: true, element: <Dashboard /> },
      { path: "employees", element: <EmployeeManagement /> },
      { path: "attendance", element: <AttendanceEntry /> },
      { path: "advance", element: <AdvancePayment /> },
      { path: "payroll", element: <PayrollProcessing /> },
      { path: "payslip", element: <Payslip /> },
      { path: "branches", element: <BranchManagement /> },
      { path: "reporting", element: <Reporting /> },
      { path: "settings", element: <PayrollSettings /> },
      { path: "coming-soon/:module", element: <ComingSoon /> },
    ],
  },
]);
