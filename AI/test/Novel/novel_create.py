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
    temperature=1.0,
    # max_tokens: 출력될 텍스트의 최대 토큰 수 지정
    # 입력 토큰과 출력 토큰의 합이 최대 토큰 한도 초과하면 안됨(gpt-4o-mini: 16,384 tokens)
    max_tokens=1000,
    # top_p: 다양성을 조절하는 파라미터(0.0 ~ 1.0)
    # 일반적으로 1.0(전체 확률 사용) 설정
    top_p=1.0,
)

# 1화 생성용 프롬프트 템플릿
prompt_template_1st = PromptTemplate(
    input_variables=["genre", "title", "worldview", "synopsis", "characters"],
    template="""
    당신은 주어진 정보를 바탕으로 창의적이고 몰입감 있는 소설을 집필하는 전문 소설 작가입니다.
    제공된 정보를 활용하여 소설의 첫 번째 챕터(서문)를 작성해 주세요.

    - 소설의 톤과 분위기는 {genre} 장르에 맞게 설정하세요.
    - 서술 방식은 생동감 있고 감각적인 묘사를 포함하며, 대사는 자연스럽고 캐릭터의 개성을 반영하도록 작성하세요.
    - 첫 챕터에서는 주인공을 등장시키고, 독자의 흥미를 끌 수 있는 주요 사건 또는 갈등의 단서를 제시하세요.
    - 스토리의 배경을 독자가 쉽게 이해할 수 있도록 자연스럽게 설명하되, 장황하지 않도록 주의하세요.
    - 문장이 매끄럽게 이어지도록 흐름을 유지하며, 문법적으로 올바른 문장을 작성하세요.
    - 소설은 반드시 한글 기준으로 500-700자 분량을 준수하고, 다음 챕터가 이어질 수 있도록 마무리하세요.

    소설의 장르: {genre}
    소설의 제목: {title}
    세계관 소개: {worldview}
    시놉시스: {synopsis}
    등장인물: {characters}

    **소설 첫 챕터(서문)**
    """
)

# PromptTemplate과 ChatOpenAI를 체인으로 연결
chain_1st = prompt_template_1st | llm

def generate_first_chapter(genre: str, title: str, worldview: str, synopsis: str, characters: list) -> str:
    """
    주어진 장르, 제목, 세계관, 시놉시스, 등장인물 정보를 바탕으로 소설 1화(첫 챕터)를 생성
    """
    # 등장인물 문자열
    characters_str = "\n".join([
        f"- 이름: {char['name']}, 역할: {char['role']}, 나이: {char['age']}, 성별: {char['sex']}, 직업: {char['job']}, 프로필: {char['profile']}"
        for char in characters
    ])

    input_data = {
        "genre": genre,
        "title": title,
        "worldview": worldview,
        "synopsis": synopsis,
        "characters": characters_str
    }

    generated_text = chain_1st.invoke(input_data)
    return generated_text

if __name__ == "__main__":
    # 예시 데이터
    genre = "SF, 디스토피아, 배틀로얄, 초능력"
    title = "이터널 리턴: 아글라이아의 실험"
    worldview = """
    지구가 형성될 때부터 존재했던 미지의 힘, **VF(Variable Force)**. 
    이 힘은 자연현상을 초월하는 강력한 능력을 부여하며, 운석을 지구로 끌어들이거나 특정 생명체에 변칙적인 힘을 발현시키는 등 신비로운 성질을 가지고 있다.

    그러나 VF의 존재는 인간에게도 미미한 영향을 끼쳤고, 그 흔적은 신화나 전설, 종교적 이야기 속에서나 남아 전해져 왔다.
    초인적인 신체 능력, 염동력, 예지력 등 전설 속에 등장하는 능력들은 실상 VF의 영향을 받은 인간들일 가능성이 컸다.
    하지만 그 횟수는 극히 적었고, 인간이 이를 과학적으로 증명하기엔 너무나도 부족한 데이터뿐이었다.

    이에 흥미를 가진 **비밀 연구 조직 '아글라이아'**는 VF의 존재를 추적하고 연구하기 시작했다.
    그들은 VF가 어떻게 발현되고, 특정한 조건에서 어떤 성질을 띄며, 인간에게 어떤 영향을 끼치는지를 실험하기 위해 2001년, 루미아 섬의 원주민들을 강제로 이주시키고,
    그곳을 **살아남기 위해 서로를 죽여야만 하는 전장으로 만들었다**.

    그러나 VF의 가능성은 끝이 없었고, 예상조차 할 수 없는 변칙성을 보여주었다.
    이에 따라, 아글라이아는 실험체의 모집 범위를 넓혀 **전 세계에서 특출난 재능을 가진 사람들, 혹은 VF 발현 가능성이 있는 인물들을 강제적으로 납치하거나 모집**하였다.

    기술력 면에서도 세계 최상급을 자랑하는 아글라이아는, 2001년 실험이 시작된 이후부터 지금까지  
    **실험체들이 늙지 않도록 조치하고, 실험이 시작될 때마다 기억을 지움으로써 실험을 '영원히 반복'하고 있다**.

    현재 진행 중인 **2차 실험**에서는, VF의 발현을 더욱 효과적으로 끌어내기 위해 실험체들에게 극한의 상황을 부여하고 있다.  
    이들은 강제적으로 폭탄 목걸이를 착용한 채 루미아 섬에서 생존해야 하며, 서로를 죽이지 않으면 금지구역 설정과 강력한 '야생동물' 투입으로 강제적으로 도태된다.  

    그러나 **일부 실험체들은 이 실험을 끝낼 방법을 찾기 위해 움직이기 시작했다...**
    """
    synopsis = """
    견습 수녀 키아라는 신의 뜻을 따라 어둠 속에서 빛을 전하려 했지만, 세상은 그녀를 외면했고 그녀의 신앙은 흔들리기 시작했다.
    잔혹한 사채업자 다르코는 폭력과 돈이 세상의 진리라 믿었고, 누구도 그의 길을 막을 수 없었다.
    이들이 강제로 끌려온 곳은 ‘아글라이아’라 불리는 정체불명의 실험 구역.

    여기서 실험체들은 서로를 죽여야만 살아남을 수 있으며, 모든 사망자는 기억을 잃고 실험이 재시작되는 ‘이터널 리턴’의 굴레에 갇혀 있다.
    이들은 단순한 생존을 넘어, 이 실험을 끝내기 위한 방법을 찾기 시작한다.

    그러나 아글라이아의 지도자 안젤리카와 급진적인 부소장 에르샤, 그리고 그들이 창조한 인류를 초월한 존재 ‘이바’와 ‘에키온’이 이 실험을 지배하고 있다.
    그들의 계획은 무엇이며, 실험체들은 이 끝없는 실험에서 벗어날 수 있을까?

    살아남기 위한 처절한 싸움 속에서, 진정한 자유를 쟁취하기 위한 전투가 시작된다.
    """
    characters = [
        {
            "name": "키아라",
            "role": "주인공",
            "age": 21,
            "sex": "여성",
            "job": "견습 수녀",
            "profile": """
            어릴 때부터 성당에서 신앙 교육을 받으며 살아왔다. 하지만 현실의 냉혹함을 마주하면서 점점 신에 대한 의심이 커졌고, 
            신성한 것과 추악한 것 사이에서 갈등하고 있다. 
            폭력과 죄악을 증오하지만, 동시에 아름다움과 순수한 것에 대한 강한 집착을 가지고 있다. 
            실험 구역에서 생존을 위해 자신이 믿었던 신념과 싸우며 변화해 나간다.
            """
        },
        {
            "name": "다르코",
            "role": "반(半) 대적자",
            "age": 35,
            "sex": "남성",
            "job": "사채업자",
            "profile": """
            돈과 폭력이 모든 것을 해결해 준다고 믿는 남자. 어릴 적 경찰이었던 아버지에게 버림받았고, 
            이후 폭력을 통해 자신의 힘을 증명하며 살아왔다. 
            아글라이아의 실험에 참가하게 되면서도 그는 여전히 자신의 신념을 지키려 하지만, 
            점점 이 실험이 단순한 돈과 권력을 넘어선 것임을 깨닫게 된다. 
            자신이 시스템의 일부로서 이용당하고 있음을 깨닫고, 실험을 끝낼 방법을 찾기 시작한다.
            """
        },
        {
            "name": "에르샤",
            "role": "대적자 (아글라이아 부소장)",
            "age": "40대 후반 (실제 나이 불명)",
            "sex": "여성",
            "job": "아글라이아 부소장",
            "profile": """
            아글라이아의 실험을 급진적으로 추진하는 인물. 실험체들의 한계를 시험하기 위해 직접 서울에 테러를 감행하고,
            괴물 ‘스킬라’를 풀어놓아 실험체들을 극한의 상황으로 몰아넣었다. 
            온건한 안젤리카와는 자주 대립하며, 더욱 강력한 존재를 창조하려는 목표를 가지고 있다. 
            그녀는 실험체 ‘이바’를 자신의 궁극적인 창조물로 보고 있으며, 실험의 결과를 조작하려 한다.
            """
        },
        {
            "name": "이바 (Eva)",
            "role": "불완전한 신 인류",
            "age": "불명 (신체적 나이 20대 초반)",
            "sex": "여성",
            "job": "실험체",
            "profile": """
            아글라이아가 창조한 신 인류 중 하나. 인간을 초월하는 신체 능력을 가졌으며, 
            모든 감정을 제거당한 채 실험에 참여하고 있다. 
            하지만, 실험을 거듭할수록 사라졌다고 믿었던 감정이 되살아나기 시작하며, 
            인간성과 신 인류 사이에서 갈등하게 된다. 
            자신을 ‘창조자’로 여기는 에르샤와의 관계도 점점 변화해 간다.

            말을 걸어도 상냥하게 웃어줄 뿐, 자신을 드러낼 수 있는 대답은 하지 않는다.
            그런 모습에서 어딘가 비밀스럽고 신비로운 분위기가 느껴진다.

            통각이 둔한 상태라 무언가에 잘 부딪치고 넘어진다.
            멍들고 상처가 나도 잘 모른다.
            조금만 건드려도 부서질 것 같은 가녀린 몸이지만, 모두를 두렵게 만들 강력한 힘을 숨기고 있다.
            """
        }
    ]

    # 등장인물 문자열 생성
    characters_str = "\n".join([
        f"- 이름: {char['name']}, 역할: {char['role']}, 나이: {char['age']}, 성별: {char['sex']}, 직업: {char['job']}, 프로필: {char['profile']}"
        for char in characters
    ])

    # 새 소설 레코드 생성
    novel_id = insert_novel(genre, title, worldview, synopsis, characters_str)

    # 첫 챕터(1화) 생성
    first_chapter = generate_first_chapter(genre, title, worldview, synopsis, characters)
    first_chapter_text = first_chapter.content  # 텍스트 추출
    print("소설 1화 생성 완료!!")

    # 결과물을 파일로 저장
    output_dir = os.path.join(os.getcwd(), "novel")
    os.makedirs("novel", exist_ok=True)
    file_name = os.path.join(output_dir, f"{title}_1화.txt")
    with open(file_name, 'w', encoding='utf-8') as file:
        file.write(first_chapter_text)  # 텍스트만 저장
    print(f"파일 저장 완료: {file_name}")

    # DB에 저장 (1화 -> chapter_number=1)
    insert_chapter(novel_id, 1, first_chapter_text)  # 텍스트만 DB에 저장
    print(f"소설 ID: {novel_id}, 1화 저장 완료!")
