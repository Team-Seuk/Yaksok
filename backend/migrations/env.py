import sys
from logging.config import fileConfig
from pathlib import Path

from alembic import context

# backend/ 를 sys.path 에 추가해 apps.*, core.* import 가 동작하게 한다.
sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

# ORM 모델을 import 해야 Base.metadata 에 테이블이 등록된다.
import apps.guidance.adapter.outbound.orm.models as _guidance_orm  # noqa: E402, F401
import apps.pill.adapter.outbound.orm.pill_orm as _pill_orm  # noqa: E402, F401
from core.config import get_settings  # noqa: E402
from core.db import Base, engine  # noqa: E402

config = context.config

if config.config_file_name is not None:
    fileConfig(config.config_file_name)

# DATABASE_URL 을 .env 에서 읽어 alembic.ini sqlalchemy.url 을 덮어쓴다.
config.set_main_option("sqlalchemy.url", get_settings().database_url)

target_metadata = Base.metadata


def run_migrations_offline() -> None:
    url = config.get_main_option("sqlalchemy.url")
    context.configure(
        url=url,
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
    )
    with context.begin_transaction():
        context.run_migrations()


def run_migrations_online() -> None:
    with engine.connect() as connection:
        context.configure(connection=connection, target_metadata=target_metadata)
        with context.begin_transaction():
            context.run_migrations()


if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()
