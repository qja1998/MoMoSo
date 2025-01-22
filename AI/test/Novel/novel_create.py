# novel_create.py

import os
from dotenv import load_dotenv

from langchain.chains import LLMChain
from langchain.prompts import PromptTemplate
from langchain_community.chat_models import ChatOpenAI

# DB 관련 함수
from db_manager import init_db, insert_novel, insert_chapter

load_dotenv()

# DB 초기화 (처음 한 번)
init_db()

# OpenAI API 키
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")

# OpenAI 모델 설정
llm = ChatOpenAI(
    openai_api_key=OPENAI_API_KEY,
    model="gpt-4o-mini"
)

# 1화 생성용 프롬프트 템플릿
prompt_template_1st = """
당신은 창의적인 소설 작가입니다. 아래 정보를 바탕으로 첫 번째 챕터의 소설 초안을 작성해 주세요. 
소설의 톤은 흥미진진하고 몰입감 있게 전개해 주세요.

장르: {genre}
제목: {title}
시놉시스: {synopsis}
등장인물:
{characters}

소설 첫 챕터(서문)를 500~700자 분량으로 작성해주세요.
"""

prompt_1st = PromptTemplate(
    input_variables=["genre", "title", "synopsis", "characters"], 
    template=prompt_template_1st
)

chain_1st = LLMChain(llm=llm, prompt=prompt_1st)

def generate_first_chapter(genre: str, title: str, synopsis: str, characters: list) -> str:
    """
    주어진 장르, 제목, 시놉시스, 등장인물 정보를 바탕으로 소설 1화(첫 챕터)를 생성
    """
    # 등장인물 문자열
    characters_str = "\n".join([
        f"- 이름: {char['name']}, 역할: {char['role']}, 나이: {char['age']}, 성별: {char['sex']}, 직업: {char['job']}, 특징: {char['traits']}"
        for char in characters
    ])

    generated_text = chain_1st.run(
        genre=genre,
        title=title,
        synopsis=synopsis,
        characters=characters_str
    )
    return generated_text

if __name__ == "__main__":
    # 예시 입력
    genre = "SF"
    title = "시간을 달리는 소녀"
    synopsis = "시간을 자유롭게 이동할 수 있는 소녀가 다양한 시대의 사람들을 만나며 돕는 이야기"
    characters = [
        {
            "name": "카리나",
            "role": "주인공",
            "age": 18,
            "sex": "여성",
            "job": "도움을 주는 사람",
            "traits": "타인을 돕는 것을 좋아하고 적극적인 성격"
        },
        {
            "name": "김첨지",
            "role": "구원받는 자",
            "age": 40,
            "sex": "남성",
            "job": "인력거꾼",
            "traits": "아내를 사랑하지만 표현이 서툼. 비극적 상황에 놓인 인물"
        }
    ]

    # 새 소설 레코드 생성
    novel_id = insert_novel(title, genre, synopsis)

    # 첫 챕터(1화) 생성
    first_chapter = generate_first_chapter(genre, title, synopsis, characters)
    print("[생성된 1화]\n", first_chapter)

    # DB에 저장 (1화 -> chapter_number=1)
    insert_chapter(novel_id, 1, first_chapter)
    print(f"소설 ID: {novel_id}, 1화 저장 완료!")
