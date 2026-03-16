import httpx
from fastapi import APIRouter, HTTPException
from fastapi.responses import RedirectResponse
from pydantic import BaseModel

from config.settings import settings
from exports.prisma.client import prisma

router = APIRouter()


class FigmaTokenRequest(BaseModel):
    user_id: int
    figma_token: str


@router.post("/save-figma-token")
async def save_figma_token(request: FigmaTokenRequest):
    user = await prisma.user.update(
        where={"id": request.user_id},
        data={"figmaToken": request.figma_token},
    )
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return {
        "success": True,
        "message": "Figma token saved successfully",
        "has_figma_token": True,
    }


@router.get("/check-figma-token/{user_id}")
async def check_figma_token(user_id: int):
    user = await prisma.user.find_unique(where={"id": user_id})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return {
        "has_figma_token": user.figmaToken is not None and len(user.figmaToken) > 0
    }


@router.get("/login")
async def github_login():
    github_auth_url = (
        f"https://github.com/login/oauth/authorize"
        f"?client_id={settings.github_client_id}"
        f"&redirect_uri={settings.github_redirect_url}"
        f"&scope=repo user"
    )
    return RedirectResponse(github_auth_url)


@router.get("/callback")
async def github_callback(code: str):
    async with httpx.AsyncClient() as client:
        token_response = await client.post(
            "https://github.com/login/oauth/access_token",
            headers={"Accept": "application/json"},
            data={
                "client_id": settings.github_client_id,
                "client_secret": settings.github_client_secret,
                "code": code,
                "redirect_uri": settings.github_redirect_url,
            },
        )
        token_data = token_response.json()
        access_token = token_data.get("access_token")
        if not access_token:
            raise HTTPException(status_code=400, detail="Failed to get access token")
    async with httpx.AsyncClient() as client:
        user_response = await client.get(
            "https://api.github.com/user",
            headers={"Authorization": f"Bearer {access_token}"},
        )
        github_user = user_response.json()

    user = await prisma.user.upsert(
        where={"githubId": github_user["id"]},
        data={
            "create": {
                "githubId": github_user["id"],
                "githubUsername": github_user["login"],
                "githubAccessToken": access_token,
                "email": github_user.get("email"),
                "name": github_user.get("name"),
            },
            "update": {
                "githubAccessToken": access_token,
                "email": github_user.get("email"),
                "name": github_user.get("name"),
            },
        },
    )
    print(f"User successfully authenticated: {user.githubUsername}")
    frontend_callback_url = (
        f"{settings.frontend_url}/auth/callback"
        f"?user_id={user.id}"
        f"&username={user.githubUsername}"
        f"&name={user.name or ''}"
        f"&email={user.email or ''}"
    )

    return RedirectResponse(frontend_callback_url)
