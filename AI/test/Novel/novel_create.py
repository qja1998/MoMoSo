# novel_create.py

import os
from dotenv import load_dotenv
from langchain_openai import ChatOpenAI
from langchain.prompts import PromptTemplate

# DB 관련 함수
from db_manager import init_db, insert_novel, insert_chapter

load_dotenv()

# DB 초기화 (처음 한 번)
init_db()

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
    max_tokens=1500,
    # top_p: 다양성을 조절하는 파라미터(0.0 ~ 1.0)
    # 일반적으로 1.0(전체 확률 사용) 설정
    top_p=1.0,
)

# 1화 생성용 프롬프트 템플릿
prompt_template_1st = PromptTemplate(
    input_variables=["genre", "title", "synopsis", "timeline", "characters"],
    template="""
    당신은 주어진 정보를 바탕으로 창의적이고 몰입감 있는 소설을 집필하는 전문 소설 작가입니다.
    제공된 정보를 활용하여 소설의 첫 번째 챕터(서문)를 작성해 주세요.

    - 소설의 톤과 분위기는 {genre} 장르에 맞게 설정하세요.
    - 서술 방식은 생동감 있고 감각적인 묘사를 포함하며, 대사는 자연스럽고 캐릭터의 개성을 반영하도록 작성하세요.
    - 첫 챕터에서는 주인공을 등장시키고, 독자의 흥미를 끌 수 있는 주요 사건 또는 갈등의 단서를 제시하세요.
    - 스토리의 배경을 독자가 쉽게 이해할 수 있도록 자연스럽게 설명하되, 장황하지 않도록 주의하세요.
    - 문장이 매끄럽게 이어지도록 흐름을 유지하며, 문법적으로 올바른 문장을 작성하세요.
    - 반드시 500-700자 분량을 준수하세요.

    장르: {genre}
    제목: {title}
    시놉시스: {synopsis}
    시간적 배경: {timeline}
    등장인물: {characters}

    **소설 첫 챕터(서문)**
    """
)

# PromptTemplate과 ChatOpenAI를 체인으로 연결
chain_1st = prompt_template_1st | llm

def generate_first_chapter(genre: str, title: str, synopsis: str, timeline: str, characters: list) -> str:
    """
    주어진 장르, 제목, 시놉시스, 타임라인, 등장인물 정보를 바탕으로 소설 1화(첫 챕터)를 생성
    """
    # 등장인물 문자열
    characters_str = "\n".join([
        f"- 이름: {char['name']}, 역할: {char['role']}, 나이: {char['age']}, 성별: {char['sex']}, 직업: {char['job']}, 특징: {char['traits']}"
        for char in characters
    ])

    input_data = {
        "genre": genre,
        "title": title,
        "synopsis": synopsis,
        "timeline": timeline,
        "characters": characters_str
    }

    generated_text = chain_1st.invoke(input_data)
    return generated_text

if __name__ == "__main__":
    # 예시 데이터
    genre = "SF"
    title = "시간을 달리는 소녀"
    synopsis = "시간을 자유롭게 이동할 수 있는 능력을 지닌 소녀가 다양한 시대의 사람들을 만나서 도와주는 이야기"
    timeline = "1930년대 일제강점기 비가 오는 어느 날"
    characters = [
        {"name": "김윤하", 
         "role": "주인공", 
         "age": 18, 
         "sex": "여성", 
         "job": "도움을 주는 사람", 
         "traits": "시간을 자유롭게 이동할 수 있는 능력을 지녔으며, 타인의 감정에 깊게 공감하여 도와주려는 마음이 큰 소녀"},
        {"name": "김첨지", 
         "role": "구원받는 자", 
         "age": 40,
         "sex": "남성",
         "job": "인력거꾼",
         "traits": "아내를 마음으로는 사랑하지만 잘 표현하지 못하는 전형적인 가부장적인 남편. \
                    비가 오던 어느날 운 좋게도 많은 수입을 올리고 크게 막걸리 한 잔을 한 후, \
                    병으로 몸져누운 아내를 위해 아내가 먹고 싶어하던 설렁탕을 사왔는데, 안타깝게도 김첨지의 아내는 이미 세상을 떠난 뒤라는 비극을 맞이하게 될 운명을 지닌 사람"},
        {"name": "이지은", 
         "role": "구원받는 자",
         "age": 35,
         "sex": "여성",
         "job": "가정주부", 
         "traits": "평소 병으로 인해 몸이 약하고, 오랫동안 집에 앓아누워있는 상황. \
                    원래는 병으로 몸져눕고 김첨지가 사온 설렁탕을 먹기 전 세상을 떠난 아내이지만, 주인공의 도움을 통해 무사히 설렁탕을 먹게 되는 사람"},
        {"name": "권기범", 
         "role": "대적자",
         "age": 30,
         "sex": "남성",
         "job": "시간 수호자", 
         "traits": "시간을 지키는 자. 시간을 마음대로 이동하고 사람들을 돕는 행위는 자칫하면 시간축에 중대한 영향을 미칠 수 있기 때문에, \
                    이를 막기 위해 김윤하가 사람을 돕는 행위를 저지하려는 존재"},
    ]

    # 등장인물 문자열 생성
    characters_str = "\n".join([
        f"- 이름: {char['name']}, 역할: {char['role']}, 나이: {char['age']}, 성별: {char['sex']}, 직업: {char['job']}, 특징: {char['traits']}"
        for char in characters
    ])

    # 새 소설 레코드 생성
    novel_id = insert_novel(genre, title, synopsis, timeline, characters_str)

    # 첫 챕터(1화) 생성
    first_chapter = generate_first_chapter(genre, title, synopsis, timeline, characters)
    first_chapter_text = first_chapter.content  # AIMessage에서 텍스트 추출
    print("소설 1화 생성 완료!!")

    # 결과물을 파일로 저장
    os.makedirs("novel", exist_ok=True)
    file_name = f"novel/{title}_1화.txt"
    with open(file_name, 'w', encoding='utf-8') as file:
        file.write(first_chapter_text)  # 텍스트만 저장
    print(f"파일 저장 완료: {file_name}")

    # DB에 저장 (1화 -> chapter_number=1)
    insert_chapter(novel_id, 1, first_chapter_text)  # 텍스트만 DB에 저장
    print(f"소설 ID: {novel_id}, 1화 저장 완료!")
