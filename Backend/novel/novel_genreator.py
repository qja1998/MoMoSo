import os
from dotenv import load_dotenv
import google.generativeai as genai

class NovelGenerator:
    def __init__(self, genre: str, title: str):
        # 환경변수 로드 및 API 키 설정
        load_dotenv()
        self.GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
        genai.configure(api_key=self.GEMINI_API_KEY)
        
        # 기본 정보 초기화
        self.genre = genre
        self.title = title
        self.worldview = ""
        self.synopsis = ""
        self.characters = ""
        self.first_chapter = ""
        self.next_chapter = ""

    def recommend_worldview(self) -> str:
        """소설 세계관을 생성하는 함수"""
        instruction = """
당신은 전문적으로 소설 세계관을 만드는 작가입니다.
주어진 장르, 제목을 기반으로 독창적이고 생동감 있는 소설 세계관을 만들어주세요.
소설 세계관을 구성할 때, 아래의 항목들을 참고하여 상세하게 작성하세요. 각 항목별 작성 가이드라인을 참고하여 내용을 구성하면 더욱 풍부하고 체계적인 세계관을 만들 수 있습니다.

1. 기본 설정
    - 시대: (예: 과거, 현대, 미래 등) - 시대적 배경과 분위기를 구체적으로 설명해주세요.
    - 핵심 테마: (예: 인간과 자연의 대립, 기술과 마법의 공존 등) - 세계관을 관통하는 핵심 주제를 명확히 제시하고, 다른 요소들과의 연관성을 설명해주세요.

2. 지리적 배경
    - 세계 전체의 구조(대륙, 국가, 도시, 마을 등) - 지리적 구조를 시각적으로 표현하고, 각 지역의 특징을 설명해주세요.
    - 주요 지형 및 자연 환경(기후, 산맥, 강 등) - 자연 환경이 세계관에 미치는 영향을 설명하고, 상징적인 의미를 부여할 수 있습니다.
    - 상징적이거나 중요한 장소(예: 전설적인 성, 신비로운 숲 등) - 각 장소의 역사, 특징, 중요성 등을 구체적으로 설명해주세요.

3. 역사와 문화
    - 세계의 건국 신화 및 주요 역사적 사건 - 역사적 사건이 세계관에 미친 영향과 현재 사회에 남은 유산을 설명해주세요.
    - 사회 구조(정치 체제, 경제 시스템, 계층 구조 등) - 사회 구조가 세계관 구성원들의 삶에 미치는 영향을 설명해주세요.
    - 문화와 종교(전통, 의식, 종교적 신념 등) - 문화와 종교가 세계관에 미치는 영향을 설명하고, 독특한 요소들을 강조해주세요.

4. 기술 및 초자연적 요소
    - 세계 내 기술 수준(과거, 현대, 미래 기술) - 기술 수준이 세계관에 미치는 영향과 특징을 설명해주세요.
    - 만약 존재한다면 마법이나 초자연적 현상의 규칙과 한계 - 마법/초자연 현상이 세계관에 미치는 영향과 작동 방식을 구체적으로 설명해주세요.

5. 인물 및 종족
    - 주요 인물이나 집단, 종족의 특징과 역할 - 각 인물/종족의 개성과 세계관 내 역할을 명확하게 설명해주세요.
    - 각 인물/종족이 속한 사회적, 문화적 배경 - 인물/종족의 배경이 그들의 행동 양식에 미치는 영향을 설명해주세요.

6. 갈등 구조
    - 사회 내부 혹은 외부의 갈등 요소(정치적 분쟁, 종족 간 충돌 등) - 갈등의 원인, 진행 과정, 결과를 구체적으로 설명해주세요.
    - 이러한 갈등이 전체 세계관에 미치는 영향 - 갈등이 세계관의 다른 요소들에 미치는 영향을 설명해주세요.

7. 세부 설정 및 고유 용어
    - 세계관 내에서만 사용되는 독특한 용어나 법칙 정리 - 용어의 의미와 사용 예시를 설명하여 세계관의 현실성을 높여주세요.
    - 설정의 일관성을 유지할 수 있도록 참고 자료 작성 - 필요한 경우, 추가적인 자료를 작성하여 세계관의 완성도를 높여주세요.

이 정보를 바탕으로, 소설 세계관에 대해 상세한 설명을 작성해 주세요.
"""
        model = genai.GenerativeModel("models/gemini-2.0-flash", system_instruction=instruction)
        prompt = f"## 소설 장르: {self.genre}\n## 소설 제목: {self.title}\n\n**소설 세계관**\n"
        response = model.generate_content(prompt)
        self.worldview = response.text
        print("Worldview:\n", self.worldview)
        return self.worldview

    def recommend_synopsis(self) -> str:
        """소설 줄거리를 생성하는 함수"""
        instruction = """
당신은 전문적으로 소설 줄거리를 만드는 작가입니다.
주어진 장르, 제목을 기반으로 독창적이고 생동감 있는 소설 줄거리를 만들어주세요.
줄거리를 구성할 때, 소설 세계관과의 연계성을 고려하여 상세하게 작성하세요.
이 정보를 바탕으로, 소설 줄거리에 대해 상세한 설명을 작성해 주세요.
"""
        model = genai.GenerativeModel("models/gemini-2.0-flash", system_instruction=instruction)
        prompt = f"## 소설 장르: {self.genre}\n## 소설 제목: {self.title}\n\n**소설 줄거리**\n"
        response = model.generate_content(prompt)
        self.synopsis = response.text
        print("Synopsis:\n", self.synopsis)
        return self.synopsis

    def recommend_characters(self) -> str:
        """소설 등장인물을 생성하는 함수"""
        instruction = """
당신은 전문적으로 등장인물을 구성하는 소설 작가입니다. 
주어진 장르, 제목, 세계관, 줄거리를 기반으로 소설 등장인물을 만들어주세요.

각 등장인물은 다음 속성을 포함하는 JSON 형태(dict)로 표현해야 합니다.

* 이름: (예: 홍길동, 춘향이 등) - 등장인물의 이름 (필수)
* 성별: (예: 남, 여, 기타) - 등장인물의 성별 (필수)
* 나이: (예: 20세, 30대 초반 등) - 등장인물의 나이 (필수)
* 역할: (예: 주인공, 조력자, 악당 등) - 이야기 속 역할 (필수)
* 직업: (예: 의사, 학생, 무사 등) - 등장인물의 직업 (필수)
* 프로필:
    - (예: 키 180cm, 날카로운 눈매, 과묵한 성격 등) - 외모, 성격, 능력 등 세부 묘사 (선택)
    - (예: 특정 능력, 습관, 버릇, 가치관 등) - 등장인물의 개성을 드러내는 특징 (선택)
    - (예: 가문, 출신, 과거 등) - 등장인물의 과거와 배경 (선택)
    - (예: 주인공과 친구, 연인 관계 등) - 다른 등장인물과의 관계 (선택)

여러 명의 등장인물을 생성할 수 있으며, 각 등장인물은 아래와 같은 형태로 표현해야 합니다.

characters = [
    {
        "이름": "홍길동",
        "성별": "남",
        "나이": "20",
        "역할": "주인공",
        "직업": "무사",
        "프로필": "활달한 성격",
        "특징": "뛰어난 검술"
    }
]
"""
        model = genai.GenerativeModel("models/gemini-2.0-flash", system_instruction=instruction)
        prompt = (
            f"## 소설 장르: {self.genre}\n"
            f"## 소설 제목: {self.title}\n"
            f"## 소설 세계관: {self.worldview}\n"
            f"## 소설 줄거리: {self.synopsis}\n"
            f"## 기존 소설 등장인물: {self.characters}\n\n"
            "**새로운 소설 등장인물**\n"
        )
        response = model.generate_content(prompt)
        new_characters = response.text
        if self.characters:
            self.characters += "\n" + new_characters
        else:
            self.characters = new_characters
        print("Characters:\n", self.characters)
        return self.characters

    def create_novel(self) -> str:
        """소설 초안을 생성하는 함수"""
        instruction = """
당신은 창의적이고 독창적인 소설 작가입니다. 
주어진 장르, 제목, 세계관, 줄거리, 등장인물을 기반으로 소설의 초안을 작성해야 합니다.
장르의 분위기에 맞게 전개하되, 500-1000자 정도의 내용을 작성해야 합니다.
"""
        model = genai.GenerativeModel("models/gemini-2.0-flash", system_instruction=instruction)
        prompt = (
            f"## 소설 장르: {self.genre}\n"
            f"## 소설 제목: {self.title}\n"
            f"## 소설 세계관: {self.worldview}\n"
            f"## 소설 줄거리: {self.synopsis}\n"
            f"## 소설 등장인물: {self.characters}\n\n"
            "**소설 초안**\n"
        )
        response = model.generate_content(prompt)
        self.first_chapter = response.text
        print("Novel Draft:\n", self.first_chapter)
        return self.first_chapter

    def create_next_chapter(self) -> str:
        """소설 다음 화를 생성하는 함수"""
        instruction = """
당신은 창의적이고 독창적인 소설 작가입니다. 
주어진 장르, 제목, 세계관, 줄거리, 등장인물, 소설 이전화를 기반으로 소설의 다음화를 작성해야 합니다.
장르의 분위기에 맞게 전개하되, 500-1000자 정도의 내용을 작성해야 합니다.
"""
        model = genai.GenerativeModel("models/gemini-2.0-flash", system_instruction=instruction)
        prompt = (
            f"## 소설 장르: {self.genre}\n"
            f"## 소설 제목: {self.title}\n"
            f"## 소설 세계관: {self.worldview}\n"
            f"## 소설 줄거리: {self.synopsis}\n"
            f"## 소설 등장인물: {self.characters}\n"
            f"## 소설 초안: {self.first_chapter}\n\n"
            "**소설 다음화**\n"
        )
        response = model.generate_content(prompt)
        self.next_chapter = response.text
        print("Next Chapter:\n", self.next_chapter)
        return self.next_chapter


# 예시 사용법:
if __name__ == "__main__":
    # 소설의 장르와 제목을 입력합니다.
    genre = input("소설의 장르를 입력하세요: ")
    title = input("소설의 제목을 입력하세요: ")
    print(f"소설의 장르: {genre}")
    print(f"소설의 제목: {title}")

    novel_gen = NovelGenerator(genre, title)
    
    # 순차적으로 각 단계의 결과를 생성합니다.
    novel_gen.recommend_worldview()
    novel_gen.recommend_synopsis()
    novel_gen.recommend_characters()
    novel_gen.create_novel()
    novel_gen.create_next_chapter()
