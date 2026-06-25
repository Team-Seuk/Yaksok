"""initial tables: pills, conversations, messages

Revision ID: 0001
Revises:
Create Date: 2026-06-25
"""

from __future__ import annotations

from collections.abc import Sequence

import sqlalchemy as sa
from alembic import op
from sqlalchemy.dialects import postgresql

revision: str = "0001"
down_revision: str | None = None
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    op.create_table(
        "pills",
        sa.Column("item_seq", sa.Text(), nullable=False),
        sa.Column("item_name", sa.Text(), nullable=False),
        sa.Column("entp_name", sa.Text(), nullable=True),
        sa.Column("is_otc", sa.Boolean(), nullable=True),
        sa.Column("shape", sa.Text(), nullable=True),
        sa.Column("color_front", sa.Text(), nullable=True),
        sa.Column("color_back", sa.Text(), nullable=True),
        sa.Column("print_front", sa.Text(), nullable=True),
        sa.Column("print_back", sa.Text(), nullable=True),
        sa.Column("line_front", sa.Text(), nullable=True),
        sa.Column("line_back", sa.Text(), nullable=True),
        sa.Column("leng_long", sa.Text(), nullable=True),
        sa.Column("leng_short", sa.Text(), nullable=True),
        sa.Column("thick", sa.Text(), nullable=True),
        sa.Column("class_name", sa.Text(), nullable=True),
        sa.Column("form", sa.Text(), nullable=True),
        sa.Column("chart", sa.Text(), nullable=True),
        sa.Column("image_url", sa.Text(), nullable=True),
        sa.Column("efcy", sa.Text(), nullable=True),
        sa.Column("use_method", sa.Text(), nullable=True),
        sa.Column("caution", sa.Text(), nullable=True),
        sa.Column("raw_json", postgresql.JSONB(astext_type=sa.Text()), nullable=True),
        sa.Column(
            "fetched_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
        sa.PrimaryKeyConstraint("item_seq"),
    )

    op.create_table(
        "conversations",
        sa.Column("id", sa.String(36), nullable=False),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
        sa.PrimaryKeyConstraint("id"),
    )

    op.create_table(
        "messages",
        sa.Column("id", sa.String(36), nullable=False),
        sa.Column("conversation_id", sa.String(36), nullable=False),
        sa.Column("role", sa.String(16), nullable=False),
        sa.Column("content", sa.Text(), nullable=False),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
        sa.ForeignKeyConstraint(["conversation_id"], ["conversations.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
    )


def downgrade() -> None:
    op.drop_table("messages")
    op.drop_table("conversations")
    op.drop_table("pills")
