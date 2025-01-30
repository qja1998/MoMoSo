# next_chapter.py

import os
from dotenv import load_dotenv
from langchain_openai import ChatOpenAI
from langchain.prompts import PromptTemplate
import mysql.connector

# DB 함수
from db_manager import init_db, get_chapter_count, get_all_chapters_content, insert_chapter, get_characters, update_characters

load_dotenv()

# DB 초기화 (이미 했더라도 idempotent)
init_db()

# MySQL 연결 설정
DB_HOST = os.getenv("DB_HOST")
DB_PORT = int(os.getenv("DB_PORT"))
DB_USER = os.getenv("DB_USER")
DB_PASSWORD = os.getenv("DB_PASSWORD")
DB_NAME = os.getenv("DB_NAME")

def get_novel_info(novel_id):
    """
    novels 테이블에서 특정 novel_id에 해당하는 소설 정보를 반환
    """
    conn = mysql.connector.connect(
        host=DB_HOST,
        port=DB_PORT,
        user=DB_USER,
        password=DB_PASSWORD,
        database=DB_NAME
    )
    cursor = conn.cursor(dictionary=True)
    cursor.execute("SELECT title, genre, synopsis, timeline, characters FROM novels WHERE id = %s", (novel_id,))
    novel_info = cursor.fetchone()
    cursor.close()
    conn.close()
    return novel_info

# OpenAI API 키
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")

# OpenAI 모델 설정
llm = ChatOpenAI(
    # openai_api_key: OpenAI API 인증 키 설정
    openai_api_key=OPENAI_API_KEY,
    # model: 사용할 OpenAI 모델 설정
    model="gpt-4o-mini",
    # temperature: 생성된 텍스트의 창의성 조정(0.0(결정적) ~ 2.0(창의적))
    temperature=0.7,
    # max_tokens: 출력될 텍스트의 최대 토큰 수 지정
    # 입력 토큰과 출력 토큰의 합이 최대 토큰 한도 초과하면 안됨(gpt-4o-mini: 16,384 tokens)
    max_tokens=10000,
    # top_p: 다양성을 조절하는 파라미터(0.0 ~ 1.0)
    # 일반적으로 1.0(전체 확률 사용) 설정
    top_p=1.0,
)

# 다음 화 생성 프롬프트 (모든 챕터 누적)
prompt_template_next = PromptTemplate(
    input_variables=["all_content", "next_chapter_number", "genre", "title", "synopsis", "timeline", "characters"],
    template="""
    당신은 창의적이고 몰입감 있는 소설을 집필하는 전문 소설 작가입니다.
    
    아래는 지금까지 작성된 모든 화(챕터)의 내용입니다. 이를 충분히 인지하고, 개연성을 유지하면서 
    다음 화인 챕터 {next_chapter_number}를 작성하세요.
    
    **반드시 이전 화의 내용을 반복하지 않되, 마지막 장면을 자연스럽게 이어받아 전개하세요.**
    
    지금까지의 내용: {all_content}
    
    소설의 장르: {genre}
    소설의 제목: {title}
    시놉시스: {synopsis}
    시간적 배경: {timeline}
    등장인물: {characters}
    
    이번 화에서는 다음 사항을 고려하여 작성하세요:
    - 이전 화의 서술 방식과 톤을 유지하며, 이야기의 흐름이 자연스럽게 이어지도록 하세요.
    - 새로운 갈등, 반전, 또는 등장인물 간의 중요한 상호작용을 추가하여 독자의 관심을 유지하세요.
    - 등장인물의 감정과 동기를 세밀하게 묘사하여 몰입감을 높이세요.
    - 스토리의 개연성을 유지하면서 무리한 설정 변경 없이 자연스럽게 진행하세요.
    - 대화와 행동 묘사를 활용하여 장면을 생동감 있게 표현하세요.
    - 반드시 500-700자 분량을 준수하세요.
    """
)

# PromptTemplate과 ChatOpenAI를 체인으로 연결
chain_next = prompt_template_next | llm

def generate_next_chapter(novel_id: int) -> str:
    """
    지금까지의 모든 화를 참고하여 다음 화(챕터)를 생성,
    chapters 테이블에 삽입하고 생성된 텍스트를 반환.
    """
    # 소설 정보 가져오기
    novel_info = get_novel_info(novel_id)
    if not novel_info:
        raise ValueError(f"Novel ID {novel_id}에 해당하는 소설이 없습니다.")

    genre = novel_info["genre"]
    title = novel_info["title"]
    synopsis = novel_info["synopsis"]
    timeline = novel_info["timeline"]
    characters = novel_info["characters"]

    # 현재 마지막 챕터 번호
    current_count = get_chapter_count(novel_id)
    if current_count == 0:
        raise ValueError("아직 1화도 없습니다. novel_create.py로 1화를 먼저 생성하세요.")

    next_chapter_number = current_count + 1

    # 지금까지의 모든 화 내용
    all_content = get_all_chapters_content(novel_id)

    # 소설 생성
    generated_text = chain_next.invoke({
        "all_content": all_content,
        "next_chapter_number": next_chapter_number,
        "genre": genre,
        "title": title,
        "synopsis": synopsis,
        "timeline": timeline,
        "characters": characters
    })

    return (generated_text.content, next_chapter_number)

def add_new_character(novel_id):
    """
    사용자 입력을 통해 새로운 등장인물을 추가하고, DB에 반영하는 함수.
    """
    # 기존 등장인물 목록 가져오기
    existing_characters = get_characters(novel_id)
    
    print("\n📌 새로운 등장인물 정보를 입력하세요:")
    name = input("이름: ")
    role = input("역할 (예: 주인공, 조력자, 대적자 등): ")
    age = input("나이: ")
    sex = input("성별 (남성/여성): ")
    job = input("직업: ")
    traits = input("특징: ")

    # 새 등장인물 정보를 문자열로 구성
    new_character = f"- 이름: {name}, 역할: {role}, 나이: {age}, 성별: {sex}, 직업: {job}, 특징: {traits}"

    # 기존 등장인물 목록에 추가
    updated_characters = existing_characters + "\n" + new_character

    # DB 업데이트
    update_characters(novel_id, updated_characters)
    
    print(f"\n✅ '{name}' 캐릭터가 추가되었습니다!")

if __name__ == "__main__":
    # novel_id를 직접 DB에서 가져와 설정
    novel_id = int(input("소설 ID를 입력하세요: "))  # novels 테이블에서 해당 ID를 확인 후 설정

    # 새 등장인물 추가 여부 확인
    add_character_option = input("새로운 등장인물을 추가하시겠습니까? (y/n): ").strip().lower()
    if add_character_option == "y":
        add_new_character(novel_id)

    # 다음 화 생성
    next_chapter, next_chapter_number = generate_next_chapter(novel_id)
    print(f"소설 {next_chapter_number}화 생성 완료!!")

    # 결과물을 파일로 저장
    os.makedirs("novel", exist_ok=True)
    file_name = f"novel/{get_novel_info(novel_id)['title']}_{next_chapter_number}화.txt"
    with open(file_name, 'w', encoding='utf-8') as file:
        file.write(next_chapter)
    print(f"파일 저장 완료: {file_name}")

    # DB에 저장
    insert_chapter(novel_id, next_chapter_number, next_chapter)  # 텍스트만 DB에 저장
    print(f"소설 ID: {novel_id}, {next_chapter_number}화 저장 완료!")