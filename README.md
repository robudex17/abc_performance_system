# ABC Performance System

![Docker](https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white)
![Kubernetes](https://img.shields.io/badge/Kubernetes-326CE5?style=for-the-badge&logo=kubernetes&logoColor=white)
![ArgoCD](https://img.shields.io/badge/ArgoCD-EF7B4D?style=for-the-badge&logo=argo&logoColor=white)
![GitHub Actions](https://img.shields.io/badge/GitHub_Actions-2088FF?style=for-the-badge&logo=github-actions&logoColor=white)
![Nuxt.js](https://img.shields.io/badge/Nuxt.js-00DC82?style=for-the-badge&logo=nuxt.js&logoColor=white)
![Express](https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white)
![MariaDB](https://img.shields.io/badge/MariaDB-003545?style=for-the-badge&logo=mariadb&logoColor=white)
![Ansible](https://img.shields.io/badge/Ansible-EE0000?style=for-the-badge&logo=ansible&logoColor=white)

> A full-stack performance tracking and leaderboard system — rebuilt from a manual PM2-based deployment into a fully automated GitOps pipeline running on a self-hosted Kubernetes cluster.

---

## ⚠️ Confidentiality Notice

This repository is a **portfolio representation** of a production system I architected and deployed for my organization. All sensitive data, credentials, company-specific names, and identifying information have been replaced with generic equivalents to protect confidentiality.

The GitOps pipeline, Kubernetes architecture, and CI/CD workflow shown here **mirror the actual production implementation**, which currently runs on a physical Kubernetes cluster (1 control plane + 3 worker nodes) inside our organization's infrastructure.

---

## 📖 Project Overview

ABC Performance System is a full-stack web application for tracking and displaying agent performance metrics via a real-time leaderboard. It consists of:

- **Frontend** — Nuxt.js SPA (Vue.js) with real-time updates via Socket.IO
- **Backend** — Express.js REST API with JWT authentication
- **Database** — MariaDB for structured data storage
- **Image Storage** — MinIO (S3-compatible) for agent profile photos

---

## 🏗️ Architecture Evolution — The Journey

### Phase 1: Before (Single Server + PM2)

This is where we started — a single server running everything manually:

```
Developer
    │
    │  git push
    ▼
GitHub (app code)
    │
    │  manual: SSH into server
    │  manual: git pull
    │  manual: npm run build (frontend)
    │  manual: pm2 restart
    ▼
Single Server
├── Frontend (Nuxt.js) — managed by PM2
├── Backend (Express.js) — managed by PM2
├── MariaDB
└── Static images folder (inside app repo)
```

**Pain points with this approach:**
- Every deployment required manually SSH-ing into the server
- Running `git pull`, `npm run build`, `pm2 restart` by hand every time
- One server = single point of failure
- Images uploaded by users lived inside the app repo (got wiped on redeploy)
- No rollback strategy — if something broke, fixing it was manual and stressful
- PM2 handled process management, but offered no self-healing at the infrastructure level
- No visibility into what version was running or when it was deployed

---

### Phase 2: After (GitOps + Kubernetes)

```
Developer
    │
    │  git push (to backend/ or frontend/)
    ▼
GitHub (abc_performance_system)
    │
    │  GitHub Actions triggered (path-based)
    │  ├── Build Docker image
    │  ├── Push to DockerHub (tagged with commit SHA)
    │  └── Update image tag in config repo
    ▼
GitHub (abc_performance_config)
    │
    │  ArgoCD watches this repo
    │  Detects new commit → syncs to cluster
    ▼
Kubernetes Cluster
├── Control Plane (1 node)
└── Worker Nodes (2 nodes in homelab / 3 in production)
    ├── Backend pods (Express.js)
    ├── Frontend pods (Nuxt.js)
    └── ArgoCD (managing deployments)

External Services (outside cluster)
├── MariaDB (on worker node OS — not inside K8s)
└── MinIO (S3-compatible image storage)
```

**What changed:**
- Zero manual SSH for deployments — push code, everything else is automatic
- PM2 completely removed — Kubernetes Deployment handles process management, self-healing, and restarts
- Images stored in MinIO (S3-compatible) — survive pod restarts and redeployments
- Every deployment is a git commit — full audit trail and easy rollback
- Multi-node cluster — no single point of failure

---

## 🤔 Why GitOps over Traditional CI/CD?

This is one of the most important architectural decisions in this project.

### Traditional CI/CD (Push-based)

In a traditional pipeline, the CI tool deploys directly to the cluster:

```
Code Push → GitHub Actions → Build → kubectl apply → Kubernetes
```

**The problem:** GitHub Actions needs direct access to your Kubernetes cluster. This means storing cluster credentials as CI secrets — a significant security risk. The CI tool has the power to directly modify your production infrastructure.

### GitOps (Pull-based)

Instead, we split the responsibility between CI and CD:

```
CI:  Code Push → GitHub Actions → Build Image → Update Config Repo
CD:  ArgoCD watches Config Repo → Detects change → Syncs to Cluster
```

**GitHub Actions handles CI only:**
- Build the Docker image
- Push to DockerHub
- Update the image tag in the config repo

**ArgoCD handles CD:**
- Watches the config repo for changes
- Pulls and applies changes to the cluster itself
- GitHub Actions NEVER touches the cluster directly

**Benefits:**
- ✅ No cluster credentials stored in GitHub — ArgoCD runs inside the cluster and pulls changes itself
- ✅ Config repo is the single source of truth for what's running in the cluster
- ✅ ArgoCD detects and auto-corrects any drift between desired and actual state
- ✅ Full audit trail — every deployment is traceable to a git commit
- ✅ Rollback is as simple as reverting a commit in the config repo
- ✅ Clear separation — developers own the app repo, ops owns the config repo

---

## 🛠️ Tech Stack

| Layer | Technology | Purpose |
|---|---|---|
| Frontend | Nuxt.js 3 (Vue.js) | SPA with real-time leaderboard UI |
| Backend | Express.js (Node.js 22) | REST API + Socket.IO server |
| Database | MariaDB | Relational data storage |
| Image Storage | MinIO | S3-compatible object storage for profile images |
| Containerization | Docker | Application packaging |
| Container Registry | DockerHub | Image storage and versioning |
| Orchestration | Kubernetes (kubeadm) | Container orchestration |
| CNI | Calico | Pod networking (172.16.0.0/16) |
| GitOps | ArgoCD | Continuous deployment + drift detection |
| CI/CD | GitHub Actions | Automated build and image push |
| Config Management | Ansible | Automated Kubernetes cluster bootstrap |
| Virtualization | Proxmox VE | Bare-metal hypervisor (homelab) |
| OS | Ubuntu 26.04 LTS | All VMs and cluster nodes |

---

## 🔄 CI/CD Pipeline

### How it works

Two separate GitHub Actions workflows exist — one for backend, one for frontend. Each is triggered only when its respective folder changes:

```yaml
# Backend workflow triggers only on backend/ changes
on:
  push:
    branches: [main]
    paths:
      - 'backend/**'
```

**This means:**
- Change frontend code → only frontend image rebuilds
- Change backend code → only backend image rebuilds
- No unnecessary rebuilds

### Pipeline steps

```
1. Developer pushes code to main branch
2. GitHub Actions detects path-based change
3. Runner spins up (fresh Ubuntu VM — GitHub hosted)
4. Builds Docker image from Dockerfile
5. Tags image with short commit SHA (e.g. a1b2c3d)
   └── Why SHA not 'latest'? Immutable, traceable, rollback-friendly
6. Pushes image to DockerHub
7. Checks out abc_performance_config repo
8. Updates image tag in deployment.yaml with new SHA
9. Commits and pushes to config repo
10. ArgoCD detects new commit in config repo
11. ArgoCD applies updated deployment to cluster
12. Kubernetes performs rolling update
13. New pod starts → health check passes → old pod terminated
```

---

## 🏠 Infrastructure

### Homelab (Portfolio)

Built on a single physical server running Proxmox VE:

| Component | Spec |
|---|---|
| CPU | Intel Core i7-4770K @ 3.5GHz (4c/8t) |
| RAM | 32GB |
| Storage | 2TB HDD |
| Hypervisor | Proxmox VE |

**VM Layout:**

| VM | Role | vCPU | RAM | IP |
|---|---|---|---|---|
| k8master | Control Plane | 2 | 4GB | 192.168.1.10 |
| k8worker1 | Worker Node | 2 | 6GB | 192.168.1.20 |
| k8worker02 | Worker Node + MariaDB | 2 | 6GB | 192.168.1.30 |

**Network Design:**

| Bridge | Purpose | Subnet |
|---|---|---|
| vmbr0 | Public internet (NIC0) | Public IP |
| vmbr1 | Private NAT | 10.10.10.0/24 |
| vmbr2 | Office LAN (NIC1) | 192.168.1.0/24 |

**IP/CIDR Plan (no conflicts):**

| Network | CIDR | Purpose |
|---|---|---|
| VM LAN | 192.168.1.0/24 | Node-to-node communication |
| K8s Services | 10.96.0.0/12 | ClusterIP range |
| Calico Pods | 172.16.0.0/16 | Pod-to-pod networking |

> 💡 The same Kubernetes setup runs in production on physical servers inside our organization's network. Proxmox was used here to replicate the multi-node cluster topology on a single homelab machine for portfolio purposes.

### Cluster Bootstrap

The Kubernetes cluster was bootstrapped using **Ansible** — eliminating the need to manually run `kubeadm init` and `kubeadm join` on each node. The playbook automates:

- Installing container runtime (containerd)
- Installing kubeadm, kubelet, kubectl
- Initializing the control plane
- Joining worker nodes
- Installing Calico CNI

> 🔗 Ansible playbook repo: [kubernetes-ansible](https://github.com/robudex17/kubernetes-ansible)

---

## 📁 Repository Structure

```
abc_performance_system/       ← this repo (app code)
├── database/
│   └── database.sql          ← schema + mock data + default admin user
├── backend/
│   ├── src/
│   │   ├── controllers/
│   │   ├── routes/
│   │   ├── middleware/
│   │   │   └── fileupload.js  ← MinIO upload handler
│   │   └── server.js
│   ├── Dockerfile
│   ├── .env.example          ← environment variable template
│   └── package.json
├── frontend/
│   ├── components/
│   ├── pages/
│   ├── plugins/
│   ├── nuxt.config.ts
│   └── Dockerfile
└── .github/
    └── workflows/
        ├── backend-deploy.yaml
        └── frontend-deploy.yaml

abc_performance_config/       ← separate repo (K8s manifests)
├── backend/
│   ├── configmap.yaml
│   ├── deployment.yaml
│   └── service.yaml
└── frontend/
    ├── configmap.yaml
    ├── deployment.yaml
    └── service.yaml
```

> The Kubernetes manifests live in a **separate config repo** ([abc_performance_config](https://github.com/robudex17/abc_performance_config)) — a core GitOps principle. ArgoCD watches the config repo, not the app repo.

---

## 🖼️ Image Storage — MinIO

User-uploaded profile images are stored in **MinIO** (self-hosted, S3-compatible object storage) rather than inside the application container.

**Why this matters in Kubernetes:**
- Container filesystems are ephemeral — files written inside a pod are lost when the pod restarts
- Storing images in MinIO means they persist across pod restarts, redeployments, and scaling events

**Migration path to AWS:**
The backend uses the MinIO SDK which is fully S3-compatible. Moving to AWS S3 in the future requires only changing environment variables — zero code changes:

```bash
# Self-hosted MinIO (current)
S3_ENDPOINT=192.168.1.100
S3_PORT=9000

# AWS S3 (future)
S3_ENDPOINT=s3.amazonaws.com
S3_PORT=443
```

---

## ⚙️ Environment Variables

### Backend

| Variable | Type | Description |
|---|---|---|
| `PORT` | ConfigMap | Express server port |
| `DB_HOST` | ConfigMap | MariaDB host IP |
| `DB_NAME` | ConfigMap | Database name |
| `S3_ENDPOINT` | ConfigMap | MinIO server IP |
| `S3_PORT` | ConfigMap | MinIO API port |
| `S3_BUCKET` | ConfigMap | MinIO bucket name |
| `DB_USER` | Secret | Database username |
| `DB_PASSWORD` | Secret | Database password |
| `JWT_SECRET` | Secret | JWT signing secret |
| `JWT_REFRESH_SECRET` | Secret | JWT refresh signing secret |
| `S3_ACCESS_KEY` | Secret | MinIO access key |
| `S3_SECRET_KEY` | Secret | MinIO secret key |

### Frontend

| Variable | Type | Description |
|---|---|---|
| `NITRO_PORT` | ConfigMap | Nuxt server port |
| `NUXT_PUBLIC_API_URL` | ConfigMap | Backend API URL |
| `NUXT_PUBLIC_SOCKET_IO_URL` | ConfigMap | Socket.IO server URL |
| `NUXT_IMAGE_BASE_URL` | ConfigMap | MinIO public image base URL |

> Secrets are **never committed to git**. They are applied manually to the cluster using `kubectl apply` and managed as Kubernetes Secrets. See [abc_performance_config](https://github.com/robudex17/abc_performance_config) for the secret template.

---

## 🚀 Local Development Setup

### Prerequisites

- Node.js 22
- Docker
- MariaDB
- MinIO (or Docker: `docker run -d -p 9000:9000 -p 9001:9001 quay.io/minio/minio server /data --console-address ":9001"`)

### Step 1 — Database Setup

Create a MariaDB database and restore the provided SQL file:

```bash
# Create the database
mysql -u root -p -e "CREATE DATABASE abc_performance_db;"

# Restore schema + mock data
mysql -u root -p abc_performance_db < database/database.sql
```

This will:
- Create all required tables
- Load mock data so the app has something to display
- Create a default admin user:

| Field | Value |
|---|---|
| Username | `admin` |
| Password | `admin123` |
| LoginAs  | `admin` |
| Username | `Danielle` |
| Password | `agent123` |
| LoginAs  | `Unit Manager` |

> ⚠️ Change the default admin password immediately after your first login.

### Step 2 — MinIO Setup

Run MinIO locally using Docker:

```bash
docker run -d \
  --name minio \
  -p 9000:9000 \
  -p 9001:9001 \
  -v minio-data:/data \
  -e MINIO_ROOT_USER=minioadmin \
  -e MINIO_ROOT_PASSWORD=minioadmin123 \
  quay.io/minio/minio server /data --console-address ":9001"
```

Then:
1. Open MinIO console at `http://localhost:9001`
2. Login with `minioadmin` / `minioadmin123`
3. Create a bucket (e.g. `leaderboard-uploads`)
4. Set the bucket to **public read**:

```bash
# Install MinIO client
wget https://dl.min.io/client/mc/release/linux-amd64/mc
chmod +x mc && sudo mv mc /usr/local/bin/

# Set bucket to public
mc alias set local http://localhost:9000 minioadmin minioadmin123
mc anonymous set public local/leaderboard-uploads
```

### Step 3 — Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Copy environment template and fill in your values
cp .env.example .env
```

Edit `.env` with your local values:

```bash
PORT=8082
DB_HOST=localhost
DB_NAME=abc_performance
DB_USER=your_db_user
DB_PASSWORD=your_db_password
JWT_SECRET=any_random_string_here
JWT_REFRESH_SECRET=another_random_string_here
S3_ENDPOINT=localhost
S3_PORT=9000
S3_ACCESS_KEY=minioadmin
S3_SECRET_KEY=minioadmin123
S3_BUCKET=leaderboard-uploads
```

Then start the backend:

```bash
npm run dev
```

### Step 4 — Frontend Setup

```bash
cd frontend
npm install
cp .env.example .env   # fill in your values
```

Edit `.env` with your local values:

```bash
NITRO_PORT="3000"
NUXT_PUBLIC_API_URL="http://{BACKEND_IPADDRESS}:{BACKEND_PORT}/api"
NUXT_PUBLIC_SOCKET_IO_URL="http://{BACKEND_IPADDRESS}:{BACKEND_PORT}"
NUXT_IMAGE_BASE_URL="http://{MINIO_IPADDRESS}:9000"
```

Then start the frontend:

```bash
npm run dev
```

---

## 💡 Key Lessons Learned

**1. PM2 is redundant inside Kubernetes**
PM2's job is process supervision and restart-on-crash. Kubernetes Deployments do this natively at the infrastructure level — with self-healing, rolling updates, and replica management built in.

**2. Never store uploaded files inside the container**
Container filesystems are ephemeral. MinIO (or any S3-compatible storage) should be used for user-uploaded content from day one.

**3. `NUXT_PUBLIC_*` variables are baked at build time by default**
With `ssr: false`, Nuxt is a CSR app — the browser makes API calls directly. Using Nuxt's `runtimeConfig` allows env vars to be injected at runtime instead of build time, enabling one Docker image to work across all environments.

**4. Separate app repo from config repo**
Keeping Kubernetes manifests in a separate repo (GitOps principle) gives ArgoCD a clean source of truth and prevents accidental deployments from app code changes.

**5. Never commit secrets to git — not even in private repos**
Git history is permanent. Even deleted files remain in history. Use `.gitignore`, Kubernetes Secrets, or Sealed Secrets for sensitive values.

**6. Use commit SHA tags, not `latest`**
Tagging Docker images with the git commit SHA makes every deployment traceable, auditable, and easily reversible.

---

## 👤 Author

**Rogmer Bulaclac**
Network Engineer → DevOps Engineer

[![LinkedIn](https://img.shields.io/badge/LinkedIn-0077B5?style=for-the-badge&logo=linkedin&logoColor=white)](https://www.linkedin.com/in/rogmer-bulaclac/)
[![GitHub](https://img.shields.io/badge/GitHub-100000?style=for-the-badge&logo=github&logoColor=white)](https://github.com/robudex17)

---

## 🔗 Related Repository

| Repo | Description |
|---|---|
| [abc_performance_system](https://github.com/robudex17/abc_performance_system) | Application source code (this repo) |
| [abc_performance_config](https://github.com/robudex17/abc_performance_config) | Kubernetes manifests watched by ArgoCD |
