import requests
import json

# 구글 북스 API의 기본 URL
API_URL = "https://www.googleapis.com/books/v1/volumes"

# API 키 입력 (구글 클라우드에서 생성한 API 키)
API_KEY = ""

# 책 검색 함수
def search_books(query):
    # API 요청 파라미터 설정
    params = {
        'q': query,  # 검색할 책 제목이나 키워드
        'key': API_KEY,  # API 키
    }
    
    # GET 요청을 통해 데이터 가져오기
    response = requests.get(API_URL, params=params)
    
    # 요청이 성공적이면 JSON 데이터를 반환
    if response.status_code == 200:
        data = response.json()
        return data
    else:
        print(f"Error: {response.status_code}")
        return None

# 예시: "Python programming" 키워드로 책 검색
result = search_books("왜 구글인가")

# 결과 출력
if result:
    for item in result['items']:
        volume_info = item['volumeInfo']
        
        # volumeInfo 전체 출력 (잘 읽을 수 있도록 JSON 포맷으로 출력)
        print(json.dumps(volume_info, indent=4, ensure_ascii=False))
        print('-' * 50)