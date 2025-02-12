import requests
import dotenv
import os
from io import BytesIO
from PIL import Image

dotenv.load_dotenv()

JUPYTER_URL = os.environ["JUPYTER_URL"]
# TOKEN = os.environ["TOKEN"]

# 요청 데이터 (서버에 보낼 JSON 데이터)
payload = {
    "genre": "fantasy",
    "style": "watercolor",
    "title": "The Last Dragon",
    "worldview": "high",
    "keywords": ["dragon", "knight", "adventure"]
}

# 요청 헤더
headers = {"Content-Type": "application/json"}

# 서버에 POST 요청 보내기
response = requests.post(JUPYTER_URL + "/api/v1/editor/image_ai", json=payload, headers=headers)

# 응답이 정상적인지 확인
if response.status_code == 200:
    print("✅ 이미지 생성 성공!")

    # 응답된 이미지 데이터를 BytesIO 객체로 변환
    img_data = BytesIO(response.content)

    # PIL로 이미지 열기
    image = Image.open(img_data)

    # 🖼️ 이미지 띄우기
    image.show()

    # 💾 이미지 저장
    image.save("./generated_image.png", format="PNG")
    print("📸 이미지가 'generated_image.png'로 저장되었습니다.")

else:
    print(f"❌ 오류 발생: {response.status_code}, {response.text}")
