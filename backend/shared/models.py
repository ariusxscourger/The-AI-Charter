from datetime import datetime
from typing import Optional, Any, Dict
from sqlmodel import SQLModel, Field, Column
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy import DateTime, text

class User(SQLModel, table=True):
    __tablename__ = "users"

    id: Optional[int] = Field(default=None, primary_key=True)
    email: str = Field(unique=True, index=True, nullable=False, max_length=255)
    password_hash: str = Field(nullable=False, max_length=255)
    created_at: Optional[datetime] = Field(
        default=None,
        sa_column=Column(
            DateTime(timezone=True),
            server_default=text("CURRENT_TIMESTAMP"),
            nullable=False
        )
    )

class GovernanceRecordModel(SQLModel, table=True):
    __tablename__ = "governance_records"

    id: Optional[int] = Field(default=None, primary_key=True)
    session_id: str = Field(unique=True, index=True, nullable=False, max_length=255)
    feature_name: str = Field(nullable=False, max_length=255)
    verdict: str = Field(nullable=False, max_length=50)
    record_json: Dict[str, Any] = Field(
        default_factory=dict,
        sa_column=Column(JSONB, nullable=False)
    )
    created_at: Optional[datetime] = Field(
        default=None,
        sa_column=Column(
            DateTime(timezone=True),
            server_default=text("CURRENT_TIMESTAMP"),
            nullable=False
        )
    )
