import os
from dotenv import load_dotenv
from langchain_openai import ChatOpenAI
from langchain.prompts import PromptTemplate

# 1. 환경변수 로드 및 OPENAI_API_KEY 가져오기
load_dotenv()
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")

# 2. ChatOpenAI 모델 초기화 (CoT와 길이 조정을 위해 파라미터 설정)
llm = ChatOpenAI(
    openai_api_key=OPENAI_API_KEY,
    model="gpt-4o",
    temperature=0.7,
    max_tokens=1024
)

# 3. PromptTemplate 객체 생성 (소설 줄거리 작성 프롬프트)
synopsis_prompt_template = PromptTemplate(
    input_variables=["genre", "title", "worldview"],
    template="""
    <역할>
    당신은 창의적이고 독창적인 소설 줄거리 작가입니다.
    주어진 소설 장르, 제목, 그리고 세계관 정보를 토대로 독자들이 몰입할 수 있는 줄거리를 작성하세요.
    내부적으로 단계적인 사고(Chain-of-Thought)를 거쳐 아이디어를 구성하되, 최종 출력에는 정리된 줄거리만 나타나도록 합니다.
    줄거리는 200~400자 내외로 작성하세요.

    <목표>
    - 입력된 장르, 제목, 세계관이 반드시 반영된 탄탄한 줄거리를 제시합니다.
    - 문장은 자연스럽게 이어지며, 핵심 갈등이나 분위기를 암시할 수 있어야 합니다.
    - 불필요하거나 관련 없는 설정을 넣지 마십시오.

    <작성 지침>
    - 다양한 감각적 표현과 함께, 스토리의 확장 가능성을 갖도록 구성합니다.
    - 독자의 호기심을 자극하되, 스포일러가 되지 않도록 주의합니다.
    - 최종 결과만 출력하며, 내부적인 사고 과정(CoT)은 공개하지 않습니다.

    <입력 정보>
    - 소설 장르: {{ genre }}
    - 소설 제목: {{ title }}
    - 소설 세계관: {{ worldview }}

    **소설 줄거리**
    """
)

# 4. PromptTemplate과 ChatOpenAI를 체인으로 연결
recommend_synopsis_chain = synopsis_prompt_template | llm

# 5. 사용자 입력 받기 (모두 필수로 처리)
input_genre = input("소설 장르를 입력하세요: ")
input_title = input("소설 제목을 입력하세요: ")
input_worldview = input("소설 세계관을 입력하세요: ")

input_json = {
    "genre": input_genre.strip(),
    "title": input_title.strip(),
    "worldview": input_worldview.strip()
}

# 6. langchain 체인 실행
recommend_synopsis = recommend_synopsis_chain.invoke(input_json)

# 7. 결과 출력
print(f"추천 줄거리:\n{recommend_synopsis.content}")