FROM python:3.11-slim AS base

ENV PYTHONUNBUFFERED=1 \
  PYTHONDONTWRITEBYTECODE=1 \
  PIP_NO_CACHE_DIR=1 \
  PIP_DISABLE_PIP_VERSION_CHECK=1

RUN apt-get update && apt-get install -y --no-install-recommends \
  postgresql-client \
  curl \
  build-essential \
  git \
  && rm -rf /var/lib/apt/lists/*

RUN adduser --disabled-password --gecos '' --uid 1000 appuser

WORKDIR /app

FROM base AS dependencies

RUN curl -LsSf https://astral.sh/uv/install.sh | sh
ENV PATH="/root/.local/bin:$PATH"

COPY --chown=appuser:appuser pyproject.toml uv.lock ./
RUN uv sync --no-dev

COPY --chown=appuser:appuser prisma ./prisma
RUN uv run prisma generate && uv run prisma py fetch

FROM base AS production

COPY --from=dependencies --chown=appuser:appuser /app/.venv /app/.venv
COPY --from=dependencies --chown=appuser:appuser /app/prisma /app/prisma
COPY --from=dependencies --chown=appuser:appuser /root/.cache /root/.cache

COPY --chown=appuser:appuser . .
COPY --chown=appuser:appuser start.sh /app/start.sh
RUN chmod +x /app/start.sh

ENV PATH="/app/.venv/bin:$PATH"

USER appuser

EXPOSE 8000

HEALTHCHECK --interval=30s --timeout=10s --start-period=30s --retries=3 \
  CMD curl -f http://localhost:8000/docs || exit 1

CMD ["/app/start.sh"]
