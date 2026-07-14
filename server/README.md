# 🚀 Server - Nan Local-Verse Engine API

FastAPI backend server for the Nan Local-Verse Engine platform. Provides RESTful APIs for campaign management, quest system, weather integration, and AI-powered suggestions.

---

## 🚀 Quick Start

### Prerequisites
- Python 3.14+
- pip or uv (recommended)

### Setup

```bash
# Install dependencies with uv (recommended)
uv sync

# Or with pip
pip install -e .

# Create environment file
cp .env.example .env

# Run development server
python -m uvicorn app.main:app --reload
```

Server runs on [http://localhost:8000](http://localhost:8000)

API Documentation: [http://localhost:8000/docs](http://localhost:8000/docs) (Swagger UI)

---

## 📁 Project Structure

```
server/
├── app/
│   ├── main.py              # FastAPI app initialization
│   │
│   ├── api/
│   │   └── v1/
│   │       └── endpoints/
│   │           ├── campaigns.py      # Campaign CRUD
│   │           ├── quests.py         # Quest system
│   │           ├── weather.py        # Weather triggers
│   │           ├── analytics.py      # Performance metrics
│   │           └── users.py          # User management
│   │
│   ├── services/            # Business logic
│   │   ├── campaign_service.py
│   │   ├── ai_service.py            # Google Genai integration
│   │   ├── weather_service.py       # Weather API integration
│   │   ├── quest_service.py
│   │   └── analytics_service.py
│   │
│   ├── schemas/             # Pydantic models
│   │   ├── campaign.py
│   │   ├── quest.py
│   │   ├── user.py
│   │   └── responses.py
│   │
│   └── database.py          # Supabase connection
│
├── pyproject.toml           # Project metadata & dependencies
├── uv.lock                  # Dependency lock file
└── README.md
```

---

## 🛠️ Tech Stack

| Component | Technology |
|-----------|-----------|
| **Framework** | FastAPI |
| **Server** | Uvicorn |
| **Database** | Supabase (PostgreSQL) |
| **AI** | Google Genai |
| **Async** | Python asyncio |
| **Validation** | Pydantic |
| **Language** | Python 3.14+ |
| **Package Manager** | uv (or pip) |

---

## ⚙️ Environment Variables

Create `.env`:

```env
# Supabase
SUPABASE_URL=your_supabase_project_url
SUPABASE_KEY=your_supabase_service_role_key

# Google Genai (for AI features)
GOOGLE_GENAI_API_KEY=your_google_genai_api_key

# CORS Configuration
ALLOWED_ORIGINS=http://localhost:3000,https://yourdomain.com

# App Config
APP_ENV=development  # or 'production'
API_VERSION=v1
```

Get these values from:
- [Supabase Console](https://supabase.com/dashboard) (URL & Key)
- [Google AI Studio](https://aistudio.google.com/app/apikey) (Genai API Key)

---

## 📚 API Endpoints

### Health Check
```http
GET /
→ { "status": "Nan Engine Online", "version": "1.0.0", "environment": "development" }
```

### Campaigns (B2B)
```http
GET    /api/v1/campaigns                 # List campaigns
POST   /api/v1/campaigns                 # Create campaign
GET    /api/v1/campaigns/{id}            # Get campaign details
PUT    /api/v1/campaigns/{id}            # Update campaign
DELETE /api/v1/campaigns/{id}            # Delete campaign
POST   /api/v1/campaigns/{id}/suggest    # Get AI suggestions
```

### Quests (B2C)
```http
GET    /api/v1/quests                    # List active quests
GET    /api/v1/quests/{id}               # Get quest details
POST   /api/v1/quests/claim              # Claim quest reward
GET    /api/v1/leaderboard               # Get top players
GET    /api/v1/leaderboard/user/{id}     # Get user rank
```

### Weather Integration
```http
GET    /api/v1/weather/current           # Current weather
GET    /api/v1/weather/forecast          # 7-day forecast
POST   /api/v1/weather/trigger-campaigns # Trigger weather-based campaigns
```

### Analytics
```http
GET    /api/v1/analytics/campaigns/{id}  # Campaign performance
GET    /api/v1/analytics/quests          # Quest statistics
GET    /api/v1/analytics/footfall        # Tourist footfall trends
```

---

## 🤖 Key Features

### Campaign Management
- Create marketing campaigns for local businesses
- AI-suggested copy based on weather context
- Schedule campaigns or trigger by weather events
- Track performance metrics

### AI Integration (Google Genai)
- Generate marketing copy for campaigns
- Suggest seasonal content based on weather
- Personalize recommendations for tourists
- Context-aware messaging

### Weather API Integration
- Real-time weather data
- Triggers campaigns when conditions match
- Weather-based quest suggestions
- Historical weather context for analytics

### Quest System
- Create and manage tourist missions
- Random reward wheel mechanics
- Track quest completions
- Leaderboard rankings

---

## 📦 Dependencies

```toml
[project]
dependencies = [
    "fastapi>=0.139.0",           # Web framework
    "google-genai>=2.11.0",       # AI features
    "httpx>=0.28.1",              # HTTP client
    "pydantic>=2.13.4",           # Data validation
    "pydantic-settings>=2.14.2",  # Settings management
    "python-dotenv>=1.2.2",       # Environment variables
    "supabase>=2.31.0",           # Database client
    "uvicorn>=0.51.0",            # ASGI server
]
```

---

## 🚀 Running the Server

### Development Mode
```bash
# With auto-reload
python -m uvicorn app.main:app --reload

# Specify port
python -m uvicorn app.main:app --reload --port 8001
```

### Production Mode
```bash
# Single worker
python -m uvicorn app.main:app --host 0.0.0.0 --port 8000

# Multiple workers (gunicorn)
gunicorn -w 4 -k uvicorn.workers.UvicornWorker app.main:app
```

---

## 🗄️ Database Setup

### Supabase Tables
Create these tables in Supabase PostgreSQL:

```sql
-- Businesses (Operators)
CREATE TABLE businesses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  phone TEXT,
  location TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Campaigns
CREATE TABLE campaigns (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  business_id UUID NOT NULL REFERENCES businesses(id),
  title TEXT NOT NULL,
  description TEXT,
  weather_trigger TEXT,
  is_active BOOLEAN DEFAULT true,
  impressions INTEGER DEFAULT 0,
  clicks INTEGER DEFAULT 0,
  conversions INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Quests
CREATE TABLE quests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT,
  location TEXT,
  reward_points INTEGER NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Quest Completions
CREATE TABLE quest_completions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL,
  quest_id UUID NOT NULL REFERENCES quests(id),
  completed_at TIMESTAMP DEFAULT NOW()
);

-- Leaderboard
CREATE TABLE leaderboard (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL UNIQUE,
  total_points INTEGER DEFAULT 0,
  rank INTEGER,
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### Row-Level Security (RLS)
Configure RLS policies in Supabase for:
- Operators can only see their own campaigns
- Public can view quests and leaderboard
- Users can only modify their own profile

---

## 🧪 Testing

```bash
# Install pytest
pip install pytest pytest-asyncio

# Run tests
pytest

# Run with coverage
pytest --cov=app
```

---

## 📝 Code Structure

### Services (`app/services/`)
Contains business logic:
- `ai_service.py` - Google Genai API calls
- `weather_service.py` - Weather data & triggers
- `campaign_service.py` - Campaign management logic
- `quest_service.py` - Quest mechanics
- `analytics_service.py` - Metrics calculation

### Schemas (`app/schemas/`)
Pydantic models for request/response validation:
- Define API contracts
- Type hints for IDE support
- Automatic OpenAPI/Swagger docs

### Endpoints (`app/api/v1/endpoints/`)
Route handlers:
- Receive requests
- Call services for business logic
- Return responses

---

## 🔐 Security

- CORS configured for allowed origins
- Supabase Auth for user authentication
- Row-level security (RLS) on database
- Environment variables for secrets
- Input validation via Pydantic
- SQL injection protection via ORM

---

## 🌐 CORS Configuration

Configured in `app/main.py`:
```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,  # From .env ALLOWED_ORIGINS
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

---

## 📊 Performance Considerations

- Async/await for non-blocking I/O
- Connection pooling with Supabase
- Caching strategies (if needed)
- Rate limiting (to be implemented)
- Database query optimization

---

## 🐛 Troubleshooting

### Supabase Connection Error
```python
# Check in app/main.py or database.py
supabase = create_client(SUPABASE_URL, SUPABASE_KEY)
```

### API Documentation Not Loading
- Ensure FastAPI is running correctly
- Visit [http://localhost:8000/docs](http://localhost:8000/docs)
- Check for errors in terminal

### Google Genai API Error
- Verify `GOOGLE_GENAI_API_KEY` is set
- Check API quota in Google AI Studio
- Ensure internet connection

### Database Query Timeout
- Check Supabase status
- Optimize queries
- Add pagination for large datasets

---

## 🚀 Deployment

### Docker
```dockerfile
FROM python:3.14-slim
WORKDIR /app
COPY . .
RUN pip install -e .
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
```

### Railway, Render, or Heroku
1. Push to GitHub
2. Connect repository to platform
3. Set environment variables
4. Deploy

---

## 📞 Support

- Frontend Issues? → See [client/README.md](../client/README.md)
- Overall Project? → See [README.md](../README.md)

---

## 📚 Resources

- [FastAPI Documentation](https://fastapi.tiangolo.com)
- [Supabase Docs](https://supabase.com/docs)
- [Google Genai API](https://ai.google.dev/gemini-api/docs)
- [Pydantic Documentation](https://docs.pydantic.dev)

---

**Built with ❤️ for Nan Province Tourism** 🌾🚀
