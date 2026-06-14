import os
import asyncpg

DATABASE_URL = os.environ.get(
    "DATABASE_URL",
    "postgresql://postgres:postgres_password@localhost:5432/charter_db"
)

# Replace postgres:// with postgresql:// if needed for asyncpg
if DATABASE_URL.startswith("postgres://"):
    DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql://", 1)

db_pool = None

async def get_db_pool() -> asyncpg.Pool:
    global db_pool
    if db_pool is None:
        db_pool = await asyncpg.create_pool(DATABASE_URL)
    return db_pool

async def init_db():
    print(f"[DB] Initializing database connection pool with {DATABASE_URL}...", flush=True)
    pool = await get_db_pool()
    async with pool.acquire() as conn:
        # Create users table
        await conn.execute("""
            CREATE TABLE IF NOT EXISTS users (
                id SERIAL PRIMARY KEY,
                email VARCHAR(255) UNIQUE NOT NULL,
                password_hash VARCHAR(255) NOT NULL,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
            );
        """)
        # Create governance_records table
        await conn.execute("""
            CREATE TABLE IF NOT EXISTS governance_records (
                id SERIAL PRIMARY KEY,
                session_id VARCHAR(255) UNIQUE NOT NULL,
                feature_name VARCHAR(255) NOT NULL,
                verdict VARCHAR(50) NOT NULL,
                record_json JSONB NOT NULL,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
            );
        """)
        print("[DB] Tables initialized successfully.", flush=True)

async def close_db():
    global db_pool
    if db_pool is not None:
        await db_pool.close()
        db_pool = None
        print("[DB] Connection pool closed.", flush=True)
