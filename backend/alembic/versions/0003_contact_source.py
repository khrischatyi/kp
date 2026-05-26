"""add source column to contact_submissions

Revision ID: 0003
Revises: 0002
Create Date: 2026-05-26

"""
from __future__ import annotations

from alembic import op
import sqlalchemy as sa


revision = "0003"
down_revision = "0002"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column(
        "contact_submissions",
        sa.Column("source", sa.String(length=32), nullable=False, server_default="contact"),
    )


def downgrade() -> None:
    op.drop_column("contact_submissions", "source")
