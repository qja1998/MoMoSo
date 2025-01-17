import requests
import json

def get_books_preview(title, limit=10):
    # Open Library API URL
    url = f"https://openlibrary.org/search.json?title={title}&limit={limit}"
    
    # API 요청
    response = requests.get(url)
    data = response.json()
    
    # 책 데이터가 존재하는 경우
    if data['docs']:
        # 최대 limit 개수만큼 책 정보 출력
        for idx, book in enumerate(data['docs']):
            # 책의 모든 정보 출력
            print(f"Book {idx + 1}:")
            print(json.dumps(book, ensure_ascii=False, indent=4))  # JSON 형식으로 출력
            print("\n" + "-"*50 + "\n")  # 구분선
    else:
        print("No results found.")

# 사용 예시
get_books_preview("방법은 모르지만 돈을 많이 벌 예정", limit=10)
