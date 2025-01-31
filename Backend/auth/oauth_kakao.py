import httpx
import os
from dotenv import load_dotenv
# from fastapi.templating import Jinja2Templates

load_dotenv()

class KaKaoAPI : 
    def __init__(self):
        self.client_id = os.getenv('KAKAO_CLIENT_ID')
        self.client_secret = os.getenv('KAKAO_CLIENT_SECRET')
        self.redirect_uri = os.getenv('KAKAO_REDIRECT_URI')
        # self.rest_api_key = os.getenv('KAKAO_REST_API_KEY')
        self.logout_redirect_uri = os.getenv('KAKAO_LOGOUT_REDIRECT_URI')

        def getcode_auth_url(self) : 
            # 카카오 로그인을 위한 인증 url 생성 
            return f'https://kauth.kakao.com/oauth/authorize?response_type=code&client_id={self.client_id}&redirect_uri={self.redirect_uri}'
        async def get_token(self, code) : 
            request_url = 'https://kauth.kakao.com/oauth/token'
            params = {
                "grant_type" : "authorization_code",
                "client_id" : self.client_id,
                "redirect_uri" : self.redirect_uri,
                "code" : code
            }

            async with httpx.AsyncClient() as client : 
                response = await client.post(request_url, data=params)
            result = response.json()
            return result
        async def get_user_info(self, access_token) : 
            userinfo_url = "https://kapi.kakao.com/v2/user/me"
            headers= {
                "Authorization" : f"Authorization: Bearer ${access_token}",
                "Content-Type" : "Content-Type: application/x-www-form-urlencoded;charset=utf-8"
            }
            async with httpx.AsyncClient() as client : 
                response = await client.post(userinfo_url, headers=headers)
            return response.json() if response.status_code == 200 else None
        
        async def logout(self, access_token) : 
            logout_url = "https://kapi.kakao.com/v1/user/logout"
            headers = {
                "Authorization" : f"Authorization: Bearer ${access_token}"
            }
            async with httpx.AsyncClient() as client : 
                await client.get(logout_url, headers=headers)
        
        async def refreshAccessToken(self, refresh_token) : 
            refresh_url = "https://kauth.kakao.com/oauth/token"
            headers = {
                "Content-Type" : "Content-Type: application/x-www-form-urlencoded;charset=utf-8"
            }
            params = {
                "grant_type" : "refresh_token",
                "client_id" : self.client_id,
                "refresh_token" : refresh_token
            }
            async with httpx.AsyncClient() as client : 
                response = await client.get(refresh_url, headers=headers, data=params)
            refreshToken = response.json()
            return refreshToken
