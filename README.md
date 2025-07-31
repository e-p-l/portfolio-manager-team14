# 📈 Portfolio Manager

A modern portfolio management tool for tracking investments, transactions, and portfolio performance. Built with Flask (REST API) and designed for easy integration with a React frontend.

---

## 🛠️ Tech Stack

- **Backend:** Flask
- **Frontend:** React
- **Database:** MySQL

---

## ⚡ Getting Started

### 1. Clone the Repository

```sh
git clone https://github.com/e-p-l/portfolio-manager-team14.git
cd portfolio-manager-team14
```

### 2. Set Up Python Environment

```sh
cd server
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
```

---

## 🗄️ MySQL Setup

### 1. Install MySQL

On macOS (Homebrew):
```sh
brew install mysql
brew services start mysql
```
Or download from [mysql.com](https://dev.mysql.com/downloads/mysql/).

### 2. Secure MySQL (Optional)

```sh
mysql_secure_installation

```
> **Note:**  
> When running `mysql_secure_installation`, you can set a simple password like `password` for development, or choose your own.
> **If you use a different password, make sure to update the `SQLALCHEMY_DATABASE_URI` in `server/app/__init__.py` accordingly.**

### 3. Create the Database

```sh
mysql -u root -p
```

Then in the MySQL shell:

```sql
CREATE DATABASE portfolio_manager_db;
```

## 4. Initialize the Databas with mock data

```sh
python tools/seed_db.py
```
---

## ▶️ Run the Backend Server

```sh
python run.py
```

The API will be available at `http://localhost:1313/`. Swagger docs are at `http://localhost:1313/swagger`.

---

## 📊 Frontend

TBD

---

## 📄 License

MIT
