from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="allow")

    gemini_api_key: str = ""
    groq_api_key: str = ""
    openai_api_key: str = ""
    claude_api_key: str = ""
    ai_provider: str = ""
    e2b_api_key: str = ""
    e2b_template_id: str = ""
    github_client_id: str = ""
    github_client_secret: str = ""
    github_redirect_url: str = ""
    frontend_url: str = "http://localhost:3000"
    redis_url: str = "redis://localhost:6379"


settings = Settings()
