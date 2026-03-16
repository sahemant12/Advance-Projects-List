from typing import Optional

from langchain_core.messages import HumanMessage
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_groq import ChatGroq
from langchain_openai import ChatOpenAI

from config.settings import settings


class LLMClient:
    def __init__(self, provider: Optional[str] = None):
        self.provider = provider or settings.ai_provider
        self.model = self._initialize_model()

    def _initialize_model(self):
        if self.provider == "gemini":
            return ChatGoogleGenerativeAI(
                model="gemini-2.0-flash-exp",
                google_api_key=settings.gemini_api_key,
                temperature=0.7,
            )

        elif self.provider == "groq":
            return ChatGroq(
                model="llama-3.3-70b-versatile",
                groq_api_key=settings.groq_api_key,
                temperature=0.7,
            )

        elif self.provider == "openai":
            return ChatOpenAI(
                model="gpt-5",
                api_key=settings.openai_api_key,
                temperature=0.2
            )
        else:
            raise ValueError(f"Unsupported Provider: {self.provider}")

    async def generate_text(self, prompt: str):
        response = await self.model.ainvoke(prompt)
        return response.content

    async def generate_with_image(
        self, prompt: str, image_urls: list[str]
    ):
        if self.provider == "gemini":
            content: list = [{"type": "text", "text": prompt}]
            for url in image_urls:
                content.append({"type": "image_url", "image_url": {"url": url}})

            message = HumanMessage(content=content)
            response = await self.model.ainvoke([message])

            usage = {"input_tokens": 0, "output_tokens": 0, "total_tokens": 0}
            if hasattr(response, "response_metadata"):
                metadata = response.response_metadata
                if "usage_metadata" in metadata:
                    usage_metadata = metadata["usage_metadata"]
                    usage["input_tokens"] = usage_metadata.get("input_tokens", 0)
                    usage["output_tokens"] = usage_metadata.get("output_tokens", 0)
                    usage["total_tokens"] = usage_metadata.get("total_tokens", 0)

            return {"content": response.content, "usage": usage}

        elif self.provider == "openai":
            content: list = [{"type": "text", "text": prompt}]
            for url in image_urls:
                content.append({"type": "image_url", "image_url": {"url": url}})

            message = HumanMessage(content=content)
            response = await self.model.ainvoke([message])

            usage = {"input_tokens": 0, "output_tokens": 0, "total_tokens": 0}
            if hasattr(response, "response_metadata"):
                metadata = response.response_metadata
                if "token_usage" in metadata:
                    token_usage = metadata["token_usage"]
                    usage["input_tokens"] = token_usage.get("prompt_tokens", 0)
                    usage["output_tokens"] = token_usage.get("completion_tokens", 0)
                    usage["total_tokens"] = token_usage.get("total_tokens", 0)

            return {"content": response.content, "usage": usage}
        else:
            result = await self.generate_text(prompt)
            return {"content": result, "usage": {"input_tokens": 0, "output_tokens": 0, "total_tokens": 0}}

    def get_provider_info(self):
        return {"provider": self.provider, "model": self.model.model_name}
