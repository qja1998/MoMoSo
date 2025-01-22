# next_chapter.py

import os
from dotenv import load_dotenv

from langchain.chains import LLMChain
from langchain.prompts import PromptTemplate
from langchain_community.chat_models import ChatOpenAI

# DB 함수
from db_manager import init_db, get_chapter_count, get_all_chapters_content, insert_chapter

load_dotenv()

# DB 초기화 (이미 했더라도 idempotent)
init_db()

OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
llm = ChatOpenAI(
    openai_api_key=OPENAI_API_KEY,
    model="gpt-4o-mini"
)

# 다음 화 생성 프롬프트 (모든 챕터 누적)
prompt_template_next = """
당신은 창의적인 소설 작가입니다.
아래는 지금까지 작성된 모든 화(챕터)의 내용입니다. 이를 충분히 반영하여,
다음 화인 챕터 {next_chapter_number}를 약 500~700자 분량으로 작성해주세요.

지금까지의 내용:
{all_content}

소설의 장르: {genre}
소설의 제목: {title}
시놉시스: {synopsis}

이번 화에서는 새로운 갈등이나 흥미로운 이벤트를 추가해 독자의 관심을 이어가 주세요.
"""

prompt_next = PromptTemplate(
    input_variables=["all_content", "next_chapter_number", "genre", "title", "synopsis"],
    template=prompt_template_next
)

chain_next = LLMChain(llm=llm, prompt=prompt_next)

def generate_next_chapter(novel_id: int, genre: str, title: str, synopsis: str) -> str:
    """
    지금까지의 모든 화를 참고하여 다음 화(챕터)를 생성,
    chapters 테이블에 삽입하고 생성된 텍스트를 반환.
    """
    # 현재 마지막 챕터 번호
    current_count = get_chapter_count(novel_id)
    if current_count == 0:
        raise ValueError("아직 1화도 없습니다. novel_create.py로 1화를 먼저 생성하세요.")

    next_chapter_number = current_count + 1

    # 지금까지의 모든 화 내용
    all_content = get_all_chapters_content(novel_id)

    generated_text = chain_next.run(
        all_content=all_content,
        next_chapter_number=next_chapter_number,
        genre=genre,
        title=title,
        synopsis=synopsis
    )

    # DB에 다음 화 저장
    insert_chapter(novel_id, next_chapter_number, generated_text)
    return generated_text

if __name__ == "__main__":
    # 예시: 이미 생성된 소설 id, 장르, 제목, 시놉시스가 필요
    # 실제로는 novel_id를 저장/관리하거나, DB에서 novels 테이블 조회해서 가져올 수 있음
    novel_id = 1  # 예: 1화 생성 이후 반환된 novel_id
    genre = "SF"
    title = "시간을 달리는 소녀"
    synopsis = "시간을 자유롭게 이동할 수 있는 소녀가 다양한 시대의 사람들을 만나며 돕는 이야기"

    # 2화 생성
    second_chapter = generate_next_chapter(novel_id, genre, title, synopsis)
    print("[2화 생성]\n", second_chapter)

    # 3화 생성
    third_chapter = generate_next_chapter(novel_id, genre, title, synopsis)
    print("[3화 생성]\n", third_chapter)
