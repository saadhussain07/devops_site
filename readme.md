# 🚀 RocketDevOps — DevOps Learning Hub

> A comprehensive, multi-page DevOps learning website for students and engineers — covering concepts, tools, workflows, roadmap, quiz, and blog.

**🌐 Live Site:** [rocketdevops.vercel.app](https://rocketdevops.vercel.app)  
**Author:** Muhammad Saad Hussain  
**GitHub:** [@saadhussain07](https://github.com/saadhussain07)  
**LinkedIn:** [muhammad-saad-hussain](https://www.linkedin.com/in/muhammad-saad-hussain-28435b3a2/)

---

## 📸 Preview

> **Live at:** [https://rocketdevops.vercel.app](https://rocketdevops.vercel.app)

**"Ship Faster. Break Nothing. Scale Everything."**

---

## 📄 Pages

| Page | Description |
|------|-------------|
| 🏠 [Home](https://rocketdevops.vercel.app/index.html) | Hero section with live CI/CD pipeline animation |
| ℹ️ [About](https://rocketdevops.vercel.app/about.html) | What is DevOps & why it matters |
| ⚙️ [Tools](https://rocketdevops.vercel.app/tools.html) | Docker, K8s, Jenkins, Terraform, Ansible & more |
| 📚 [Concepts](https://rocketdevops.vercel.app/concepts.html) | CI/CD, IaC, Microservices, Monitoring, DevSecOps |
| 🔄 [Workflow](https://rocketdevops.vercel.app/workflow.html) | Full DevOps lifecycle — Plan → Code → Deploy → Monitor |
| 🗺️ [Roadmap](https://rocketdevops.vercel.app/roadmap.html) | Step-by-step DevOps learning roadmap |
| 🧠 [Quiz](https://rocketdevops.vercel.app/quiz.html) | 111-question bank with explanations and a pass certificate |
| ✍️ [Blog](https://rocketdevops.vercel.app/blog.html) | 13 in-depth tutorials, each on its own page, plus an RSS feed |
| 🔍 [Search](https://rocketdevops.vercel.app/search.html) | Search across all content |
| 🧪 [Projects](https://rocketdevops.vercel.app/projects.html) | 8 hands-on portfolio projects, beginner → advanced |
| 🎤 [Interview Prep](https://rocketdevops.vercel.app/interview.html) | 66 interview questions with model answers |
| 🚑 [Troubleshooting](https://rocketdevops.vercel.app/troubleshooting.html) | 23 playbooks for common production failures |
| 📋 [Cheatsheets](https://rocketdevops.vercel.app/cheatsheets.html) | 200+ copy-paste commands across 14 tools |
| 📖 [Glossary](https://rocketdevops.vercel.app/glossary.html) | DevOps terms A–Z |
| 🧠 [AIOps](https://rocketdevops.vercel.app/aiops.html) | Practical AIOps guide: maturity model, techniques, tools, hands-on lab |
| 🆕 [What's New](https://rocketdevops.vercel.app/changelog.html) | Changelog of site updates |
| 📬 [Contact](https://rocketdevops.vercel.app/contact.html) | Get in touch |

---

## ✨ Features

- 🌙 **Dark / Light mode** toggle
- 📱 **Fully responsive** — mobile, tablet, desktop
- ⚡ **Live CI/CD pipeline animation** on homepage
- 🧠 **Interactive quiz** for DevOps concepts
- 🔍 **Search functionality** across all pages
- 📊 **Key stats** — 46x deployments, 99.9% SLA, 440x faster recovery
- 🚀 **Deployed on Vercel** — zero downtime

---

## 🛠️ Tech Stack

| Technology | Usage |
|-----------|-------|
| HTML5 | Structure & markup |
| CSS3 | Styling & animations |
| Vanilla JavaScript | Interactivity & dark mode |
| Vercel | Deployment & hosting |

---

## 🚀 Local Setup

```bash
# Clone the repo
git clone https://github.com/saadhussain07/devops_site
cd devops_site

# Open in browser (no build step needed)
open index.html
# or
live-server .   # if you have live-server installed
```

### ✍️ Writing a blog article

Blog pages (`blog-*.html`), the blog index cards, `feed.xml`, the blog entries in
`sitemap.xml` and the blog search index are generated from `_blog/`:

1. Write the article body in `_blog/posts/<slug>.html` (start with `<h2>` sections, no `<h1>`).
2. Add its title, description, date, tags etc. to `_blog/posts.json`.
3. Run `node _blog/build.mjs` (Node 18+, no dependencies) and commit the result.

Don't edit the generated `blog-*.html` files or the `BUILD:` regions by hand — they are overwritten.
`_blog/` is excluded from deployment via `.vercelignore`.

---

## 🗺️ DevOps Topics Covered

- CI/CD Pipelines (Jenkins, GitHub Actions, GitLab CI)
- Containerization (Docker)
- Container Orchestration (Kubernetes, Helm, ArgoCD)
- Infrastructure as Code (Terraform, Ansible)
- Cloud Platforms (AWS, Azure, GCP)
- Observability (Prometheus, Grafana, Loki)
- DevSecOps & Security
- GitOps workflow
- AIOps — the future of intelligent operations

---

## 🔗 Related Projects

- [🤖 AIOps K8s Framework](https://github.com/saadhussain07) — multi-agent LLM system for Kubernetes fault detection and remediation
- [📊 K8s Monitoring Stack](https://github.com/saadhussain07/k8s-monitoring-stack) — Prometheus + Grafana + Loki
- [🐧 DevOps Linux Scripts](https://github.com/saadhussain07/devops-linux) — Bash automation scripts
- [⚙️ Flask GitOps ArgoCD](https://github.com/saadhussain07/flask-gitops-argocd-kubernetes-Project) — GitOps pipeline

---

## 📄 License
MIT License — feel free to use, share, and contribute!

---

<p align="center">Built with ❤️ by <a href="https://www.linkedin.com/in/muhammad-saad-hussain-28435b3a2/">Muhammad Saad Hussain</a></p>
<p align="center">⭐ Star this repo if it helped you learn DevOps!</p>