"""init

Revision ID: a7d2b865fa56
Revises: a7a8d53911bf
Create Date: 2024-12-16 12:08:45.590499

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision: str = 'a7d2b865fa56'
down_revision: Union[str, None] = 'a7a8d53911bf'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # ### commands auto generated by Alembic - please adjust! ###
    op.create_table('holidays',
    sa.Column('id', sa.Integer(), nullable=False),
    sa.Column('theme', sa.String(), nullable=False),
    sa.Column('guests_count', sa.Integer(), nullable=True),
    sa.Column('guests', postgresql.JSONB(astext_type=sa.Text()), nullable=True),
    sa.Column('details', sa.String(), nullable=False),
    sa.Column('latitude', sa.Float(), nullable=True),
    sa.Column('longitude', sa.Float(), nullable=True),
    sa.Column('location_address', sa.String(), nullable=True),
    sa.Column('created_at', sa.DateTime(), nullable=True),
    sa.Column('updated_at', sa.DateTime(), nullable=True),
    sa.PrimaryKeyConstraint('id')
    )
    # ### end Alembic commands ###


def downgrade() -> None:
    # ### commands auto generated by Alembic - please adjust! ###
    op.drop_table('holidays')
    # ### end Alembic commands ###
