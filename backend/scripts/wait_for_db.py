import time

from sqlalchemy import create_engine, text
from sqlalchemy.exc import SQLAlchemyError

from app.core.config import settings


def wait_for_database(max_attempts: int = 30, delay_seconds: float = 1.0) -> None:
    engine = create_engine(settings.DATABASE_URL, pool_pre_ping=True)
    last_error: Exception | None = None

    for _attempt in range(max_attempts):
        try:
            with engine.connect() as connection:
                connection.execute(text("SELECT 1"))
            return
        except SQLAlchemyError as exc:
            last_error = exc
            time.sleep(delay_seconds)

    raise RuntimeError("Database did not become ready in time") from last_error


if __name__ == "__main__":
    wait_for_database()
