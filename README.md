# UrbanX – Smart Traffic Prediction System

## Project Overview

UrbanX is a Smart Traffic Prediction System that predicts traffic conditions based on date and time using Machine Learning. It also provides estimated travel delay, route traffic visualization, and an AI chatbot that answers traffic-related queries.

## Features

- Predicts traffic volume using a Machine Learning model.
- Shows traffic level (Low, Medium, High, Severe).
- Estimates travel delay (ETA).
- Displays route traffic on an interactive map.
- AI chatbot for traffic-related questions.
- User Login and Signup functionality.

## Technologies Used

### Frontend
- HTML
- CSS
- JavaScript

### Backend
- Flask (Python)
- Node.js
- Express.js

### Database
- MongoDB

### Machine Learning
- Scikit-learn
- Pandas
- NumPy
- Joblib

### APIs
- Hugging Face Inference API
- OSRM Routing API

## Project Structure

```text
FINAL_PROJECT/
│── backend/
│── pic/
│── app.py
│── clean.py
│── traffic_model.pkl
│── Traffic.csv
│── index.html
│── dashboard.html
│── login.html
│── signup.html
│── main.html
│── style.css
│── stylesmain.css
│── README.md
```

## How to Run the Project

### Step 1: Clone the Repository

```bash
git clone https://github.com/kirti1202/FINAL_PROJECT.git
cd FINAL_PROJECT
```

### Step 2: Create a Virtual Environment

```bash
python -m venv venv
venv\Scripts\activate
```

### Step 3: Install Python Dependencies

```bash
pip install flask flask-cors pandas numpy requests joblib scikit-learn python-dotenv
```

### Step 4: Create a `.env` File

Create a `.env` file in the project folder and add your Hugging Face token.

```text
HF_TOKEN=your_huggingface_token
```

### Step 5: Run the Flask Server

```bash
python app.py
```

### Step 6: Run the Node.js Backend

Open another terminal and run:

```bash
cd backend
npm install
npm start
```

## API Endpoints

| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/` | Health Check |
| POST | `/predict` | Predict Traffic |
| POST | `/chat` | AI Traffic Chat |
| POST | `/route_traffic` | Route Traffic Analysis |

## Future Improvements

- Live traffic integration
- Weather-based traffic prediction
- Mobile responsive interface
- Real-time notifications

## Author

**Kirti Singh Parihar**

B.Tech Information Technology

GitHub: https://github.com/kirti1202
