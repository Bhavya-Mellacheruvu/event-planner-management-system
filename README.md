# Event Planner Management System

This project is a full-stack Event Planner application designed to help clients submit event requests and allow event managers to plan, schedule, and allocate vendors efficiently. The system includes user authentication, request workflows, event creation, vendor assignments, and reporting features.

---

## 🚀 Features

### 🔐 User Management
- User registration with role selection (Client or Event Manager)
- Login and authentication
- Profile management for updating personal information

### 👤 Client Functionality
- Dashboard to view all submitted Event Requests
- Create, edit, and delete requests when in Pending state
- View request details, events created by managers, and assigned vendors

### 🎯 Event Manager Functionality
- Dashboard showing Pending Requests (Accept/Reject) and Assigned Requests
- Create and manage events for each request
- Assign vendors with contract details
- Enforced business rules such as budget limits, valid dates, and unique vendor assignments

### 📊 Reports
- Event Request Summary: Track status and budget for all requests
- Vendor Utilization Report: View vendor workloads
- Budget Overview Report: Compare total budget vs. allocated vendor amounts

---

## 🛠️ Tech Stack

- **Frontend:** React.js  
- **Backend:** Node.js, Express  
- **Database:** MySQL  
- **Tools:** Stored Procedures, SQL Views, REST APIs

---

## 📁 Project Structure

