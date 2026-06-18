import asyncio
from logging.config import fileConfig

from sqlalchemy import pool
from sqlalchemy.engine import Connection
from sqlalchemy.ext.asyncio import async_engine_from_config

from alembic import context

# this is the Alembic Config object, which provides
# access to the values within the .ini file in use.
config = context.config

# Interpret the config file for Python logging.
# This line sets up loggers basically.
if config.config_file_name is not None:
    fileConfig(config.config_file_name)

import os
import sys
from dotenv import load_dotenv

# Add backend directory to sys.path so we can import from shared
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

# Load env variables from root .env or backend .env
_backend_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
_root_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "../.."))
for _env_path in [
    os.path.join(_backend_dir, ".env"),
    os.path.join(_root_dir, ".env"),
]:
    if os.path.exists(_env_path):
        load_dotenv(_env_path)
        break

from shared.models import SQLModel  # This registers the models on SQLModel.metadata

target_metadata = SQLModel.metadata

# other values from the config, defined by the needs of env.py,
# can be acquired:
# my_important_option = config.get_main_option("my_important_option")
# ... etc.


def _normalize_db_url(url: str) -> str:
    if url.startswith("postgres://"):
        url = url.replace("postgres://", "postgresql+asyncpg://", 1)
    elif url.startswith("postgresql://"):
        url = url.replace("postgresql://", "postgresql+asyncpg://", 1)
    from urllib.parse import urlparse, parse_qs, urlencode, urlunparse
    parsed = urlparse(url)
    params = parse_qs(parsed.query)
    if "sslmode" in params:
        sslmode = params.pop("sslmode")[0]
        if sslmode in ("require", "prefer", "allow"):
            params["ssl"] = ["require"]
    if params:
        new_query = urlencode(params, doseq=True)
        url = urlunparse(parsed._replace(query=new_query))
    return url


def run_migrations_offline() -> None:
    """Run migrations in 'offline' mode.

    This configures the context with just a URL
    and not an Engine, though an Engine is acceptable
    here as well.  By skipping the Engine creation
    we don't even need a DBAPI to be available.

    Calls to context.execute() here emit the given string to the
    script output.

    """
    db_url = os.environ.get(
        "DATABASE_URL",
        "postgresql://postgres:postgres_password@localhost:5432/charter_db",
    )
    db_url = _normalize_db_url(db_url)
    url = db_url
    context.configure(
        url=url,
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
    )

    with context.begin_transaction():
        context.run_migrations()


def do_run_migrations(connection: Connection) -> None:
    context.configure(connection=connection, target_metadata=target_metadata)

    with context.begin_transaction():
        context.run_migrations()


async def run_async_migrations() -> None:
    """In this scenario we need to create an Engine
    and associate a connection with the context.

    """

    section = config.get_section(config.config_ini_section, {})
    db_url = os.environ.get(
        "DATABASE_URL",
        "postgresql://postgres:postgres_password@localhost:5432/charter_db",
    )
    db_url = _normalize_db_url(db_url)
    section["sqlalchemy.url"] = db_url

    connectable = async_engine_from_config(
        section,
        prefix="sqlalchemy.",
        poolclass=pool.NullPool,
    )

    async with connectable.connect() as connection:
        await connection.run_sync(do_run_migrations)

    await connectable.dispose()


def run_migrations_online() -> None:
    """Run migrations in 'online' mode."""

    asyncio.run(run_async_migrations())


if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()
