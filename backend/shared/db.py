import os
from urllib.parse import urlparse, parse_qs, urlencode, urlunparse
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
from sqlmodel import SQLModel

DATABASE_URL = os.environ.get(
    "DATABASE_URL", "postgresql://postgres:postgres_password@localhost:5432/charter_db"
)

# Convert connection URL to asyncpg driver compatible URL
if DATABASE_URL.startswith("postgres://"):
    DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql+asyncpg://", 1)
elif DATABASE_URL.startswith("postgresql://"):
    DATABASE_URL = DATABASE_URL.replace("postgresql://", "postgresql+asyncpg://", 1)

parsed = urlparse(DATABASE_URL)
params = parse_qs(parsed.query)
if "sslmode" in params:
    sslmode = params.pop("sslmode")[0]
    if sslmode in ("require", "prefer", "allow"):
        params["ssl"] = ["require"]
if params:
    DATABASE_URL = urlunparse(parsed._replace(query=urlencode(params, doseq=True)))

# Configure SQLModel/SQLAlchemy async engine
engine = create_async_engine(DATABASE_URL, echo=False, future=True)

async_session_maker = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)


async def init_db():
    print(f"[DB] Initializing SQLModel tables with {DATABASE_URL}...", flush=True)
    # Import models to register them in SQLModel metadata
    from shared.models import User, GovernanceRecordModel

    async with engine.begin() as conn:
        await conn.run_sync(SQLModel.metadata.create_all)
    print("[DB] Tables initialized successfully.", flush=True)


async def close_db():
    await engine.dispose()
    print("[DB] Connection pool closed.", flush=True)


async def get_session() -> AsyncSession:
    async with async_session_maker() as session:
        yield session
