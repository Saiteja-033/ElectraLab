# ElectraLab

**ElectraLab** is an Electronics Laboratory Management System designed to streamline equipment tracking, laboratory component inventories, allocations, and administrative workflows in college and institutional electronics laboratories.

---

## 🛠️ Technology Stack

- **Frontend**: React, JavaScript, CSS, Vite
- **Backend**: Java 21, Spring Boot, Maven
- **Database**: MySQL on Aiven Cloud
- **ORM**: Spring Data JPA & Hibernate
- **API Testing**: Postman
- **Version Control**: Git & GitHub

---

## 📁 Project Structure

```text
ElectraLab/
├── frontend/        # React + Vite client application
├── backend/         # Spring Boot (Java 21) REST API application
├── database/        # SQL schema migrations, DDL scripts, and setup guides
├── README.md        # Project documentation and architecture guide
└── .gitignore       # Global ignore patterns (secrets, build artifacts, node_modules)
```

---

## 📋 Environment Prerequisites

To run and contribute to this project, ensure the following tools are installed:

- **Java Development Kit (JDK)**: Java 21 LTS (`java -version`)
- **Apache Maven**: 3.9+ (`mvn -v`)
- **Node.js**: v20+ or v24+ (`node -v`)
- **npm**: v10+ or v11+ (`npm -v` / `npm.cmd -v`)
- **Git**: 2.x+ (`git --version`)

---

## 🔒 Security & Configuration Guidelines

1. **Database Secrets**: Never commit real database passwords, usernames, or cloud connection strings to version control.
2. **Environment Variables**: Aiven MySQL credentials will be injected via environment variables or local property configurations excluded by `.gitignore`.

---

## 🚀 Next Steps

1. **Frontend Initialization**: Scaffold React + Vite application inside `frontend/`.
2. **Backend Initialization**: Generate Spring Boot starter skeleton with Maven inside `backend/`.
3. **Database Setup**: Configure connection pooling and credentials for MySQL on Aiven Cloud.
