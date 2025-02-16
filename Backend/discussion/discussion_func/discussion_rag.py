import os
from dotenv import load_dotenv
from langchain.chains import RetrievalQA
from langchain_community.vectorstores import Chroma
from langchain_community.document_loaders import TextLoader
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_google_genai import GoogleGenerativeAIEmbeddings
from langchain_core.messages import HumanMessage

load_dotenv()

class GeminiDiscussionAssistant:
    def __init__(self, document_path: str, api_key: str):
        """문서 경로와 api key를 받아 assistant를 초기화합니다.

        Args:
            document_path (str): Path to the document to be processed.
            api_key (str): Gemini의 API key.
        """
        self.api_key = api_key
        self.document_path = document_path
        self.docs = self._load_documents()
        self.llm = self._initialize_llm()
        self.embeddings = self._initialize_embeddings()
        self.chroma_db = self._initialize_chroma_db()
    
    def _load_documents(self):
        """문서를 불러들이고 문장으로 분리하여 반환합니다.

        Returns:
            list: 문서 리스트
        """
        loader = TextLoader(self.document_path, encoding='UTF8')
        return loader.load_and_split()
    
    def _initialize_llm(self):
        """Gemini miodel를 초기화합니다.

        Returns:
            ChatGoogleGenerativeAI: Configured LLM instance.
        """
        return ChatGoogleGenerativeAI(
            model="gemini-2.0-flash",
            google_api_key=self.api_key
        )
    
    def _initialize_embeddings(self):
        """Gemini의 Embeddings를 초기화합니다.

        Returns:
            GoogleGenerativeAIEmbeddings: Configured embedding instance.
        """
        return GoogleGenerativeAIEmbeddings(
            model = "models/embedding-001", 
            google_api_key=self.api_key
        )
    
    def _initialize_chroma_db(self):
        """Chroma database를 불러오거나 초기화합니다.

        Returns:
            Chroma: Configured Chroma database instance.
        """
        chroma_db = Chroma(persist_directory="data", 
                           embedding_function=self.embeddings,
                           collection_name="lc_chroma_demo")
        collection = chroma_db.get()
        
        if len(collection['ids']) == 0:
            chroma_db = Chroma.from_documents(
                documents=self.docs, 
                embedding=self.embeddings, 
                persist_directory="data",
                collection_name="lc_chroma_demo"
            )
            chroma_db.persist()
        
        return chroma_db
    
    def recommend_discussion_topic(self, query: str):
        """추천 토론 주제를 반환합니다.

        Args:
            query (str): 유저의 발화

        Returns:
            str: 추천 토론 주제
        """
        prompt = f"다음 내용에 대해 토론할 주제를 추천해주세요:\n{query}"
        retriever = self.chroma_db.as_retriever()
        chain = RetrievalQA.from_chain_type(llm=self.llm, chain_type="stuff", retriever=retriever)
        return chain(prompt)['result']
    
    def fact_check(self, query: str):
        """입력된 query에 대한 팩트체크 결과를 반환합니다.

        Args:
            query (str): 팩트체크할 내용

        Returns:
            str: 팩트 체크 결과
        """
        prompt = f"주어진 정보가 아래 문서에서 사실인지 검증해 주세요.\n\n질문: {query}\n\n사실 여부 및 근거:"
        retriever = self.chroma_db.as_retriever()
        chain = RetrievalQA.from_chain_type(llm=self.llm, chain_type="stuff", retriever=retriever)
        return chain(prompt)['result']
    
    def generate_meeting_notes(self, json_file_path: str):
        """JSON 파일로부터 회의록 데이터를 읽어 회의록 요약본을 생성합니다.

        Args:
            json_file_path (str): 회의록이 담긴 JSON 파일 경로.
                                  파일 내 "messages" 리스트의 각 항목은 {"user": <발언자>, "text": <대화내용>} 형식

        Returns:
            str: 생성된 회의록 요약본
        """

        import json
        from langchain_core.messages import SystemMessage, HumanMessage

        # JSON 파일 읽기 및 discussion_minutes 생성
        with open(json_file_path, "r", encoding="utf-8") as json_file:
            data = json.load(json_file)
        discussion_minutes = "\n".join([
            f'{msg["user"]}: {msg["text"]}' for msg in data.get("messages", [])
        ]).strip()

        instruction = """
        당신은 회의록을 분석하여 주요 논의사항과 아이디어를 요약하고, 추가적인 분석을 제안하는 전문가입니다.
        생성되는 텍스트는 순수한 일반 텍스트 형식이어야 하며, 어떠한 마크다운 문법(예: **, ## 등)도 사용하지 말아주세요.
        발언자의 역할과 발언 순서(가능하다면 시간 정보 포함)를 고려하여 대화의 흐름과 주요 아이디어를 효과적으로 도출해 주세요.

        아래의 세 가지 항목으로 요약본을 작성해 주세요:

        1. 주요 논의사항
        - 회의에서 다뤄진 주요 주제나 토론 내용을 간략하게 나열합니다.
        - 발언자와 시간 순서(또는 발언 순서)가 드러나도록 핵심 발언들을 중심으로 정리합니다.

        2. 회의에서 유저에 의해 발생한 핵심 아이디어
        - 회의 참여자가 제시한 핵심 아이디어나 독창적인 의견을 정리합니다.

        3. 회의록을 바탕으로 AI가 분석한 아이디어 제안
        - 회의 내용을 기반으로 추가적인 개선점이나 대안, 또는 토론되지 않은 관점에 대한 AI의 심층 분석을 제안합니다.
        - 논의의 미비점이나 보완할 점을 구체적으로 작성합니다.
        - 회의 내용을 기반으로 AI가 추가로 제안하는 아이디어나 개선점을 구체적으로 작성합니다.

        아래는 예시입니다:

        ### 주요 논의 사항
        * 리나의 첨지 만남 동기에 대한 분석 및 관련 문학적 상징 해석  
        * 현진건 작가의 '운수 좋은 날'과의 연관성 토론 및 등장인물 심리 분석  
        * 시간여행 설정의 개연성 검토와 소설 내 상징적 의미 분석  

        ### 회의에서 유저에 의해 발생한 핵심 아이디어
        * 과거 인물과의 만남 모티브와 소설의 역사적 배경 연결  
        * 시간여행 장치의 의미와 문학적 상징성에 대한 토론  

        ### 회의록을 바탕으로 AI가 분석한 아이디어 제안
            
        ### 시간여행의 규칙 체계화 및 문학적 해석 보완
        - 소설 내 시간여행의 역할과 규칙, 그리고 등장인물의 내면적 갈등을 보다 명확히 해석할 수 있는 방안 제안  
            * 시간여행은 특정 조건에서만 가능하도록 설정하여 극의 긴장감 증가  
            * 과거 변경 시 발생하는 부작용 및 상징적 의미 부여  
            * 시간여행 횟수/기간 제한을 통해 내러티브의 일관성 확보

        - 시간여행 장치와 역사적 인물 상호작용을 통한 심리적 내러티브 확장
            * 시간여행의 조건과 한계 설정
            * 역사적 인물과의 상호작용
            * 내면적 갈등 및 문학적 상징 강화
        """

        prompt = f"""
        ## 회의록 내용:
        {discussion_minutes}

        **회의록 요약**
        """
        # 시스템 메시지와 유저 메시지를 포함하여 LLM 호출
        messages = [
            SystemMessage(content=instruction),
            HumanMessage(content=prompt)
        ]

        return self.llm.invoke(messages)
    
    def delete_collection(self):
        """Delete the Chroma database collection."""
        self.chroma_db.delete_collection()

if __name__ == "__main__":
    GEMINI_API_KEY = os.environ["GEMINI_API_KEY"]
    assistant = GeminiDiscussionAssistant("./시간의 흔적.txt", GEMINI_API_KEY)
    
    query = "이 소설의 논점"
    print("Recommended Discussion Topic:", assistant.recommend_discussion_topic(query))
    print("Fact Check:", assistant.fact_check(query))
    
    transcript = "이 소설은 시간의 흔적을 따라가며 인간의 삶을 그려낸 작품이다."
    print("Meeting Notes:", assistant.generate_meeting_notes(transcript))