# 📈 Portfolio Manager

This project is part of a CSF training focused on learning how to build APIs and front-end integrations.

---

## 🚀 Features

### Backend (Flask REST API)
- Save and retrieve portfolio records
- Organize portfolios by asset
- Store transactions and portfolio contents
- Designed for extensibility

### Frontend (TBD)
- Browse a portfolio
- View portfolio performance (graphical)
- Add and remove portfolio items

---

## 🛠️ Tech Stack

- **Backend:** Flask, MySQL, SQLAlchemy
- **Frontend:** TBD (Angular, React, etc.)
- **Database:** sqlite

---

## 📦 Getting Started

1. **Clone the repo:**
   ```bash
   git clone https://github.com/e-p-l/portfolio-manager.git
   cd portfolio-manager
   ```
2. **Set up virtual environment:**
    ```bash
    cd portfolio-manager/server
    python3 -m venv venv
    source venv/bin/activate  # On Windows: venv\Scripts\activate
    pip install -r requirements.txt
    ```
3. **Initialize the database**
    ```bash
    python tools/seed_db.py
    ```
4. **Start the server**
    ```bash
    python run.py
    ```

---

## 📄 License

MIT
