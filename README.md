# 🚀 Project DevOps Journey: From App Creation to  OnPremise and Cloud Deployment

## 📘 Overview

This repository demonstrates the full lifecycle of developing, deploying, and managing a modern web application using best practices in **DevOps** and **Cloud** technologies.

The project consists of:

- **Frontend**: Nuxt.js (Vue.js framework)  
  - [Frontend Infrastructure Diagram (PDF)](./docs/leaderboard_frontend.pdf)
- **Backend**: Node.js with Express  
  - [Backend Infrastructure Diagram (PDF)](./docs/leaderboard_backend.pdf)
- **Database**: MySQL  
  - [Database Architecture Diagram (PDF)](./docs/leaderboard_database.pdf)

Throughout this repository, you will see how we evolve this project from a simple codebase running on a single server, all the way to a scalable, automated, cloud-native infrastructure.

---

## 🛤️ Journey Breakdown

### 1. 🧑‍💻 Application Development

- The frontend and backend apps are developed using modern JavaScript frameworks.
- Code is version-controlled in this repository.
- Local development uses Node.js and MySQL.

---

### 2. 🖥️ Single Server Deployment (On-Premise)

- The app is deployed on a single physical or virtual server.
- Process management is handled using `pm2`.
- Basic deployment scripts automate:
  - Pulling code  
  - Installing dependencies  
  - Restarting services  
- Nginx acts as a reverse proxy to serve the frontend and backend apps.
- **Note**: This approach is simple but limited in scalability and reliability.

---

### 3. 🐳 Dockerizing the Application

- Dockerfiles are created for both frontend and backend apps.
- Docker Compose manages multi-container setups locally.
- Containerization provides:
  - Portability  
  - Reproducibility  
  - Simplified dependency management  
- Enables consistent environments from development through production.

---

### 4. ⚙️ Container Orchestration

- The app is deployed using container orchestrators:
  - **Docker Swarm** for lightweight orchestration on smaller clusters.
  - **Kubernetes** for advanced scaling, self-healing, and load balancing in production environments.
- Kubernetes manifests and Docker Swarm stack files are included for flexible deployment options.

---

### 5. 🏗️ Infrastructure as Code & Configuration Management

- **Terraform** provisions cloud infrastructure on AWS, such as:
  - EC2 instances  
  - Networking  
  - Security groups  
- **Ansible** automates:
  - Server configuration  
  - App deployment  
  - Orchestration tasks  
- This allows infrastructure and deployments to be automated, version-controlled, and repeatable.

---

### 6. 🔁 CI/CD Pipelines

Automated build, test, and deployment pipelines are implemented using:

- **GitHub Actions** for cloud-hosted automation
- **Jenkins** for self-hosted CI/CD with advanced pipeline customizations

Pipelines handle:

- Code linting and testing  
- Building Docker images  
- Deploying containers to orchestrators or servers  

This ensures rapid, reliable, and consistent application delivery.

---

## 📌 Notes

- Each major component (Docker, Kubernetes, Terraform, etc.) has its own folder and documentation.
- You can explore each stage incrementally or jump to the one that fits your needs.

---
