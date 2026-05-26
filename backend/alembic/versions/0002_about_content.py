"""add about_content table

Revision ID: 0002
Revises: 0001
Create Date: 2026-05-26

"""
from __future__ import annotations

from alembic import op
import sqlalchemy as sa


revision = "0002"
down_revision = "0001"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "about_content",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("title", sa.String(length=500), nullable=False),
        sa.Column("body", sa.Text(), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
    )
    # Seed with default content
    op.execute(
        """
        INSERT INTO about_content (id, title, body) VALUES (
            1,
            'Crafting Spaces, Building Trust',
            'SCI Seattle Cabinets & Interiors has been serving the greater Seattle area with bespoke cabinetry and interior solutions since 1996. Our team of skilled craftsmen combines traditional woodworking techniques with modern design sensibilities.

From custom kitchen cabinets to complete interior renovations, we take pride in every project we deliver. Our commitment to quality materials and meticulous attention to detail ensures results that stand the test of time.

We believe that great design should be accessible. That''s why we work closely with each client to understand their vision, lifestyle, and budget — creating solutions that are both beautiful and practical.

Based in Monroe, Snohomish County, we proudly serve clients throughout the greater Seattle metropolitan area, bringing expert craftsmanship to homes across the Pacific Northwest.'
        )
        """
    )


def downgrade() -> None:
    op.drop_table("about_content")
