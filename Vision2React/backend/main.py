from contextlib import asynccontextmanager
import os
import uvicorn
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from config.settings import settings
from exports.prisma.client import connect_db, disconnect_db, prisma
from exports.redis.queue import enqueue
from exports.redis.redis import redis_client
from routes.auth import router as github_auth_router
from routes.controller import router as github_controller_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    await connect_db()
    yield
    await disconnect_db()


app = FastAPI(title="Vision2React API", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        settings.frontend_url,  
        "http://localhost:3000", 
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class FigmaRequest(BaseModel):
    figma_url: str
    user_id: int


app.include_router(github_auth_router, prefix="/auth/github", tags=["auth"])
app.include_router(github_controller_router, prefix="/api/github", tags=["github"])


@app.post("/api/figma")
async def get_figma_design(request: FigmaRequest):
    try:
        # Get user and verify they have a Figma token
        user = await prisma.user.find_unique(where={"id": request.user_id})
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        if not user.figmaToken:
            raise HTTPException(
                status_code=400,
                detail="Figma token not found. Please set up your token first.",
            )

        figma_url = request.figma_url
        if "/file/" in figma_url:
            file_key = figma_url.split("/file/")[1].split("/")[0]
        elif "/design/" in figma_url:
            file_key = figma_url.split("/design/")[1].split("/")[0]
        else:
            raise HTTPException(status_code=400, detail="Invalid Figma URL Format")

        redis_client.setex(f"status:{file_key}", 3600, "queued")
        # Pass user_id to worker so it can fetch the user's token
        enqueue(
            {
                "node_type": "fetch_figma",
                "payload": {"file_key": file_key, "user_id": request.user_id},
            }
        )
        return {"message": "Figma file queued for processing", "file_key": file_key}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/status/{file_key}")
async def get_status(file_key: str):
    status = redis_client.get(f"status:{file_key}")

    if not status:
        raise HTTPException(status_code=404, detail="File key not found")

    status_str = status.decode("utf-8") if isinstance(status, bytes) else status

    return {
        "file_key": file_key,
        "status": status_str,
    }


@app.get("/api/preview/{file_key}")
async def get_preview_link(file_key):
    preview_url = redis_client.get(f"preview:{file_key}")
    status = redis_client.get(f"status:{file_key}")
    if not preview_url:
        status_str = (
            status.decode("utf-8") if isinstance(status, bytes) else "not_found"
        )
        if "failed" in status_str:
            raise HTTPException(
                status_code=500, detail=f"Conversion failed: {status_str}"
            )
        elif status_str in ["queued", "processing"]:
            raise HTTPException(
                status_code=202, detail=f"Still processing. Status: {status_str}"
            )
        else:
            raise HTTPException(status_code=404, detail="Preview not found or expired")
    return {
        "file_key": file_key,
        "preview_url": (
            preview_url.decode("utf-8")
            if isinstance(preview_url, bytes)
            else preview_url
        ),
        "status": status.decode("utf-8") if isinstance(status, bytes) else "completed",
    }


if __name__ == "__main__":
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run(app, host="0.0.0.0", port=port)
