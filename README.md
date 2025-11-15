# VAPOR - Order Management System

Setup and deployment guide for the VAPOR order management system.

## 📋 Table of Contents

1. [Requirements](#requirements)
2. [Installation](#installation)
3. [Backend Setup (Laravel)](#backend-setup-laravel)
4. [Frontend Setup (React)](#frontend-setup-react)
5. [Telegram Bot Setup](#telegram-bot-setup)
6. [Running the Project](#running-the-project)
7. [Project Structure](#project-structure)
8. [Troubleshooting](#troubleshooting)

---

## 🛠 Requirements

Before starting, make sure you have the following installed:

- **PHP** version 8.2 or higher
- **Composer** (PHP dependency manager)
- **Node.js** version 18 or higher
- **npm** (usually installed with Node.js)
- **SQLite** (used for database)
- **Git** (for cloning the repository)

You can check the installation with:
```bash
php -v
composer -v
node -v
npm -v
```

---

## 📦 Installation

### 1. Clone the Repository

If the project is not already downloaded, clone it to your computer:

```bash
git clone https://github.com/jaccoara-cpu/vpror.git
cd vpror
```

### 2. Open the Project

Open a terminal and navigate to the project folder:
```bash
cd "path/to/project"
```

---

## ⚙️ Backend Setup (Laravel)

### Step 1: Install PHP Dependencies

Navigate to the `backend` folder and install dependencies:

```bash
cd backend
composer install
```

### Step 2: Configure Environment Variables

Create a `.env` file based on the example (if it doesn't exist):

```bash
# On Windows
copy .env.example .env

# On Mac/Linux
cp .env.example .env
```

Open the `.env` file in a text editor and configure the following parameters:

#### Basic Application Configuration:

```env
APP_NAME="VAPOR"
APP_ENV=local
APP_KEY=
APP_DEBUG=true
APP_TIMEZONE=Europe/Kiev
APP_URL=http://localhost:8000
APP_LOCALE=ru
APP_FALLBACK_LOCALE=ru
APP_FAKER_LOCALE=ru_UA
```

#### Database (SQLite):

```env
DB_CONNECTION=sqlite
DB_DATABASE=/path/to/project/backend/database/database.sqlite
```

⚠️ **Important:** Make sure the `database/database.sqlite` file exists. If it doesn't, create an empty file:

```bash
# On Mac/Linux
touch database/database.sqlite

# On Windows, create an empty database.sqlite file in the database folder
```

#### Telegram Configuration (skip for now, configure after creating the bot):

```env
TELEGRAM_BOT_TOKEN=your_bot_token
TELEGRAM_USER_ID=your_telegram_id
```

### Step 3: Generate Application Key

Run the command:

```bash
php artisan key:generate
```

This command will automatically add `APP_KEY` to the `.env` file.

### Step 4: Run Database Migrations

Create database tables:

```bash
php artisan migrate
```

If you need to populate the database with test data (optional):

```bash
php artisan db:seed
```

### Step 5: Create Symbolic Link for File Storage

Create a link to access uploaded images:

```bash
php artisan storage:link
```

---

## ⚛️ Frontend Setup (React)

### Step 1: Install Dependencies

Open a new terminal and navigate to the `frontend` folder:

```bash
cd frontend
npm install
```

### Step 2: Configure Environment Variables

Create a `.env` file in the `frontend` folder (if it doesn't exist):

```bash
# On Windows
echo VITE_API_URL=http://localhost:8000/api > .env

# On Mac/Linux
echo "VITE_API_URL=http://localhost:8000/api" > .env
```

Or create the `.env` file manually with the following content:

```env
VITE_API_URL=http://localhost:8000/api
```

This file tells the frontend where to send API requests.

---

## 🤖 Telegram Bot Setup

### Step 1: Create a Telegram Bot

1. Open Telegram and find [@BotFather](https://t.me/BotFather)
2. Send the command `/newbot`
3. Follow the instructions:
   - Enter the bot name (e.g., "VAPOR Admin Bot")
   - Enter the bot username (must end with `bot`, e.g., `vapor_admin_bot`)
4. BotFather will provide you with a **bot token** (looks like `123456789:ABCdefGHIjklMNOpqrsTUVwxyz`)
5. **Save the token** — you'll need it later

### Step 2: Get Your Telegram ID

To allow the bot to send you messages, you need to know your Telegram ID:

#### Method 1: Via @userinfobot (RECOMMENDED)
1. Find [@userinfobot](https://t.me/userinfobot) in Telegram
2. Start a chat with it (press `/start`)
3. The bot will send you your ID — it's a number (e.g., `7736398733`)
4. **Save this number**

#### Method 2: Via Your Created Bot
1. Find your created bot in Telegram
2. Start a chat with it (press `/start`)
3. Important: **The bot must receive a message from you**, otherwise it won't be able to send you messages

### Step 3: Add Token and ID to `.env` File

**📌 IMPORTANT: Where to insert Telegram bot data**

1. Open the `backend/.env` file in any text editor (Notepad, VS Code, etc.)

2. Find or add the following lines in the `.env` file:

   ```
   TELEGRAM_BOT_TOKEN=
   TELEGRAM_USER_ID=
   ```

3. **After the `=` (equals) sign, insert your data:**

   - **In the `TELEGRAM_BOT_TOKEN=` line**, insert the token you received from BotFather
   
   - **In the `TELEGRAM_USER_ID=` line**, insert your Telegram ID (number)

**Example of correct entry in the `.env` file:**

```env
# Telegram Bot Configuration
TELEGRAM_BOT_TOKEN=123456789:ABCdefGHIjklMNOpqrsTUVwxyz
TELEGRAM_USER_ID=7736398733
```

**⚠️ IMPORTANT:**
- DO NOT put spaces before or after the `=` sign
- DO NOT put quotes around values
- Each line should be on a new line
- Token and ID should be without spaces

### Step 4: Test the Bot

1. Make sure you sent `/start` to your bot in Telegram
2. Restart the backend server (if it's running)
3. Try creating a test order through the website — a notification should arrive in Telegram

### Important Notes About the Telegram Bot:

- ⚠️ **The bot must receive a message from you** before it can send you messages
- ⚠️ Use a **numeric ID**, not username (username may not work)
- ⚠️ The bot token is secret information, don't share it publicly
- ⚠️ After changing the `.env` file, you need to **restart the backend server**

---

## 🚀 Running the Project

### ⚡ Quick Start (Step-by-Step Guide)

To run the website, you need to start **two servers simultaneously**:
- **Backend (Laravel)** — processes requests and works with the database
- **Frontend (React)** — displays the website interface

---

### 📝 Option 1: Manual Start (RECOMMENDED for beginners)

#### Step 1: Start Backend Server

1. Open the **first terminal** (command line window)
   
   **On Windows:** Open Command Prompt or PowerShell  
   **On Mac/Linux:** Open Terminal

2. Navigate to the `backend` folder:
   ```bash
   cd backend
   ```
   
   ⚠️ If the project is not in the current folder, use the full path:
   ```bash
   cd "C:\path\to\project\backend"    # Windows
   cd "/path/to/project/backend"      # Mac/Linux
   ```

3. Start the server with:
   ```bash
   php artisan serve
   ```

4. You should see a message:
   ```
   INFO  Server running on [http://127.0.0.1:8000]
   ```
   
   ✅ **Backend is running!** It's now available at: `http://localhost:8000`
   
   ⚠️ **DO NOT CLOSE THIS TERMINAL!** Leave it running.

---

#### Step 2: Start Frontend Server

1. Open a **second terminal** (new command line window)
   
   ⚠️ **Important:** This must be a **NEW** terminal, the first terminal should continue running!

2. Navigate to the `frontend` folder:
   ```bash
   cd frontend
   ```
   
   ⚠️ If the project is not in the current folder, use the full path:
   ```bash
   cd "C:\path\to\project\frontend"    # Windows
   cd "/path/to/project/frontend"      # Mac/Linux
   ```

3. Start the server with:
   ```bash
   npm run dev
   ```

4. You should see a message like:
   ```
   VITE v5.x.x  ready in xxx ms

   ➜  Local:   http://localhost:5173/
   ➜  Network: use --host to expose
   ```
   
   ✅ **Frontend is running!** It's now available at: `http://localhost:5173`
   
   ⚠️ **DO NOT CLOSE THIS TERMINAL!** Leave it running.

---

#### Step 3: Open the Website in Browser

1. Open any browser (Chrome, Firefox, Safari, etc.)

2. In the address bar, enter:
   ```
   http://localhost:5173
   ```
   
   or simply click on the link in the terminal if it's clickable

3. ✅ **The website should load!**

---

### 📋 Option 2: Using Composer Script (for advanced users)

This option runs all services with one command, but requires more resources.

1. Open a terminal in the `backend` folder:
   ```bash
   cd backend
   ```

2. Run the command:
   ```bash
   composer run dev
   ```

This script will automatically start:
- ✅ Backend server (Laravel) on port 8000
- ✅ Queue worker
- ✅ Logs (pail)
- ✅ Frontend (Vite) on port 5173

**After starting:**
- Open a browser and go to `http://localhost:5173`
- The website should load and work

---

### 🛑 How to Stop Servers

To stop the servers:

1. In the terminal where the server is running, press:
   - **Ctrl + C** (on Windows/Mac/Linux)
   
2. Confirm the stop if prompted

3. Repeat for each running terminal

---

### ✅ Verification

After starting both servers, check:

1. **Backend is working:**
   - Open in browser: `http://localhost:8000`
   - Laravel page (or API response) should load

2. **Frontend is working:**
   - Open in browser: `http://localhost:5173`
   - VAPOR website should load

3. **Both servers are running simultaneously:**
   - Two terminals should be open and running
   - First terminal should have `php artisan serve` running
   - Second terminal should have `npm run dev` running

---

## 📁 Project Structure

```
vpror/
├── backend/              # Laravel backend
│   ├── app/
│   │   ├── Http/
│   │   │   ├── Controllers/    # API Controllers
│   │   │   └── Middleware/     # Middleware (authorization, etc.)
│   │   ├── Models/             # Database models
│   │   └── Services/
│   │       └── TelegramService.php  # Telegram service
│   ├── config/
│   │   ├── services.php        # Telegram configuration
│   │   └── database.php        # Database configuration
│   ├── database/
│   │   ├── database.sqlite     # SQLite database
│   │   ├── migrations/         # Database migrations
│   │   └── seeders/            # Seeders (test data)
│   ├── routes/
│   │   └── api.php             # API routes
│   └── .env                    # Environment variables (create!)
│
└── frontend/            # React frontend
    ├── src/
    │   ├── api.js              # API client
    │   ├── pages/              # Application pages
    │   └── components/         # React components
    └── .env                    # Environment variables (create!)
```

---

## 🔧 Troubleshooting

### Problem: "Class not found" or Composer errors

**Solution:**
```bash
cd backend
composer install --no-interaction
```

### Problem: "APP_KEY not set" on startup

**Solution:**
```bash
cd backend
php artisan key:generate
```

### Problem: Database not found

**Solution:**
```bash
cd backend
touch database/database.sqlite
php artisan migrate
```

### Problem: Frontend can't connect to Backend

**Check:**
1. Backend is running (`php artisan serve`)
2. `frontend/.env` has the correct `VITE_API_URL`
3. CORS is configured correctly (by default allows `localhost:5173`)

### Problem: Telegram bot doesn't send messages

**Check:**
1. Bot token is correctly set in `backend/.env`
2. Your Telegram ID is correctly set
3. You sent `/start` to the bot in Telegram
4. Check logs: `backend/storage/logs/laravel.log`

### Problem: Images don't load

**Solution:**
```bash
cd backend
php artisan storage:link
```

Make sure the `backend/storage/app/public` folder exists and is writable.

---

## 📝 Additional Commands

### Clear Laravel Cache:

```bash
cd backend
php artisan config:clear
php artisan cache:clear
php artisan route:clear
php artisan view:clear
```

### View Logs:

Laravel logs are located at: `backend/storage/logs/laravel.log`

### Check Database:

You can use SQLite browsers or the command:
```bash
cd backend
php artisan tinker
```

Then in tinker you can execute commands to work with the database.

---

## 🎯 Quick Start (Brief Version)

1. Install dependencies:
   ```bash
   cd backend && composer install
   cd ../frontend && npm install
   ```

2. Configure `.env` files:
   - `backend/.env` - configure database and Telegram
   - `frontend/.env` - set `VITE_API_URL=http://localhost:8000/api`

3. Create database:
   ```bash
   cd backend
   touch database/database.sqlite
   php artisan key:generate
   php artisan migrate
   php artisan storage:link
   ```

4. Create Telegram bot and add token to `backend/.env`

5. Run the project:
   ```bash
   # Terminal 1 - Backend
   cd backend
   php artisan serve
   
   # Terminal 2 - Frontend
   cd frontend
   npm run dev
   ```

6. Open browser: `http://localhost:5173`

---

## 📞 Support

If you encounter problems, check:
1. All dependencies are installed
2. All `.env` files are configured
3. Database is created and migrations are run
4. Telegram bot is created and you started a chat with it
5. Both servers (backend and frontend) are running

**Good luck with setup! 🚀**
