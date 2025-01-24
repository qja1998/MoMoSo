# db_manager.py

import os
import mysql.connector
from mysql.connector import Error

# (선택) .env 파일로부터 환경 변수 읽고 싶다면:
from dotenv import load_dotenv
load_dotenv()

# MySQL 접속 정보
DB_HOST = os.getenv("DB_HOST")
DB_PORT = int(os.getenv("DB_PORT"))
DB_USER = os.getenv("DB_USER")
DB_PASSWORD = os.getenv("DB_PASSWORD")
DB_NAME = os.getenv("DB_NAME")

def get_connection(create_db_if_needed=False):
    """
    MySQL 커넥션 반환하는 함수
    
    * create_db_if_needed:
        - True인 경우, 데이터베이스가 존재하지 않으면 새로 생성
        - 기본값은 False로 설정되어 있으며, 데이터베이스가 이미 있다고 가정

    * 장점
        - 유연성: 필요에 따라 데이터베이스를 생성할 수 있어 초기화 과정이 간편
        - 재사용성: 이 함수는 다양한 MySQL 작업에 필요한 기본 연결을 제공
        - 표준화: 모든 연결 작업이 한 곳에서 관리되어 코드의 일관성이 높아짐
    
    * 확장 가능성
        - 연결 풀링(Pooling): 여러 연결을 효율적으로 관리하기 위해 연결 풀을 사용할 수 있음음
        - 로깅 추가: 데이터베이스 생성 및 연결 로그를 기록하여 디버깅 및 감사 용도로 활용
        - 환경 변수 강화: 연결 시간 초과, 암호화 등의 설정을 추가
    """
    try:
        # 우선 DB_NAME 없이 커넥션해본 뒤, 필요 시 DB 생성
        conn = mysql.connector.connect(
            host=DB_HOST,
            port=DB_PORT,
            user=DB_USER,
            password=DB_PASSWORD
        )
        # 자동 커밋 활성화화
        conn.autocommit = True
        cursor = conn.cursor()
        # 필요 시 데이터베이스 생성성
        if create_db_if_needed:
            # DB 생성 (없으면)
            cursor.execute(f"CREATE DATABASE IF NOT EXISTS {DB_NAME} CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;")
        # 초기 연결 종료
        cursor.close()
        conn.close()

        # DB_NAME을 포함한 최종 연결
        conn = mysql.connector.connect(
            host=DB_HOST,
            port=DB_PORT,
            user=DB_USER,
            password=DB_PASSWORD,
            database=DB_NAME
        )
        return conn
    # 에러 발생 시 처리
    except Error as e:
        print("MySQL 연결/초기화 중 오류:", e)
        raise e

def init_db():
    """
    데이터베이스 초기화와 테이블 생성 작업을 담당하는 함수

    * 장점
        - 자동 초기화: 데이터베이스와 테이블이 없을 경우 자동으로 생성.
        - 유연성: IF NOT EXISTS를 사용해 이미 존재하는 경우 오류를 방지.
        - 확장 가능: 테이블 구조를 쉽게 수정하거나 추가 가능.
    
    * 확장 가능성
        - 테이블 인덱스 추가: 검색 속도를 높이기 위해 chapters 테이블의 novel_id, chapter_number에 인덱스 추가.
        - 에러 로깅: 예외 처리에 로깅을 추가해 디버깅 및 추적 가능.
        - 버전 관리: 테이블 스키마 변경 시 버전 관리 시스템 적용 가능.
    """
    try:
        # 데이터베이스 연결
        conn = get_connection(create_db_if_needed=True)
        # MySQL 작업을 위한 커서 객체 생성
        cursor = conn.cursor()

        # novels 테이블
        create_novels_table = """
        CREATE TABLE IF NOT EXISTS novels (
            id INT PRIMARY KEY AUTO_INCREMENT,
            title VARCHAR(255),
            genre VARCHAR(100),
            synopsis TEXT,
            timeline VARCHAR(255),
            characters MEDIUMTEXT
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
        """

        # chapters 테이블
        create_chapters_table = """
        CREATE TABLE IF NOT EXISTS chapters (
            id INT PRIMARY KEY AUTO_INCREMENT,
            novel_id INT,
            chapter_number INT,
            content MEDIUMTEXT,
            FOREIGN KEY(novel_id) REFERENCES novels(id)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
        """

        # 커서 객체를 사용해 각 테이블 생성 SQL 문을 실행
        cursor.execute(create_novels_table)
        cursor.execute(create_chapters_table)

        # SQL 실행 결과를 데이터베이스에 반영
        conn.commit()

        # 데이터베이스와의 연결 및 커서를 닫아 자원 해제
        cursor.close()
        conn.close()

    # 예외 발생 시 처리
    except Error as e:
        print("init_db 에러:", e)
        raise e

def insert_novel(genre, title, synopsis, timeline, characters):
    """
    novels 테이블에 새 소설 삽입, 삽입된 novel_id 반환하는 함수

    * 입력 매개변수:
        - genre (str): 소설 장르
        - title (str): 소설 제목
        - synopsis (str): 소설의 시놉시스
        - timeline (str): 소설의 시간대 또는 배경
        - characters (str): 등장인물 정보 (JSON 문자열 형식)
    
    * 반환값:
        - 삽입된 소설의 고유 ID (novel_id)

    * 장점
        - 안전성: SQL 쿼리에서 자리 표시자 %s를 사용해 SQL 인젝션을 방지
        - 편의성: 삽입된 소설의 ID를 자동으로 반환하여 이후 작업에서 참조 가능
        - 유연성: characters 필드에 JSON 또는 텍스트 데이터를 저장하여 유연한 캐릭터 정보 관리 가능
    
    * 확장 가능성
        - 입력 데이터 검증: 입력 데이터의 유효성을 검증하는 로직 추가
        - 에러 처리: 삽입 실패 시 예외 처리 및 로깅
        - 트랜잭션 관리: 여러 SQL 작업을 묶어 트랜잭션 단위로 처리
    """
    # 데이터베이스 연결 및 쿼리실행 객체 생성
    conn = get_connection()
    cursor = conn.cursor()

    # novels Table에 새 소설 정보 삽입
    sql = """
    INSERT INTO novels (title, genre, synopsis, timeline, characters)
    VALUES (%s, %s, %s, %s, %s)
    """

    # SQL 쿼리 실행
    cursor.execute(sql, (title, genre, synopsis, timeline, characters))

    # SQL 실행 결과를 데이터베이스에 반영
    conn.commit()

    # 방금 삽입된 레코드의 고유 ID를 반환환
    novel_id = cursor.lastrowid

    # 자원 해제
    cursor.close()
    conn.close()
    return novel_id

def insert_chapter(novel_id, chapter_number, content):
    """
    chapters 테이블에 (novel_id, chapter_number, content) 삽입하는 함수

    * 입력 매개변수:
        - novel_id (int): 이 챕터가 속한 소설의 고유 ID
        - chapter_number (int): 챕터 번호. 예: 1, 2, 3 등
        - content (str): 챕터의 텍스트 내용

    * 장점
        - 안전성: 자리 표시자 %s를 사용해 SQL 인젝션 공격을 방지
        - 간결성: SQL 쿼리 작성 및 실행, 데이터 저장 로직이 간단하고 명확
        - 유연성: 다양한 텍스트 데이터를 content 칼럼에 저장할 수 있음
    
    * 확장 가능성
        - 입력 데이터 검증: novel_id, chapter_number, content의 유효성을 사전에 검증
        - 에러 처리: 삽입 실패 시 예외 처리 및 로깅 추가
        - 트랜잭션 관리: 여러 챕터를 한꺼번에 삽입하는 경우 트랜잭션 단위로 처리 가능
    """
    # 데이터베이스 연결 및 쿼리실행 객체 생성
    conn = get_connection()
    cursor = conn.cursor()

    # chapters Table에 새 챕터 정보 삽입
    sql = """
    INSERT INTO chapters (novel_id, chapter_number, content)
    VALUES (%s, %s, %s)
    """

    # SQL 쿼리 실행
    cursor.execute(sql, (novel_id, chapter_number, content))

    # 데이터베이스에 반영
    conn.commit()

    # 자원 해제
    cursor.close()
    conn.close()

def get_chapter_count(novel_id):
    """
    특정 novel_id의 현재 챕터 수(= 마지막 챕터 번호) 반환하는 함수

    * 입력 매개변수:
        - novel_id (int): 소설의 고유 ID
    
    * 반환값:
        - novel_id에 해당하는 소설의 챕터 수(= 마지막 챕터 번호)
        - 챕터가 없으면 0 반환
    """
    # 데이터베이스 연결 및 쿼리실행 객체 생성
    conn = get_connection()
    cursor = conn.cursor()

    # chapters 테이블에서 특정 novel_id에 해당하는 챕터 수 조회
    sql = """
    SELECT MAX(chapter_number) FROM chapters WHERE novel_id=%s
    """

    # SQL 쿼리 실행
    cursor.execute(sql, (novel_id,))

    # 결과 가져오기 
    row = cursor.fetchone()  # 쿼리 결과에서 첫 번째 행 가져오기

    # 자원 해제
    cursor.close()
    conn.close()
    return row[0] if row[0] else 0

def get_all_chapters_content(novel_id):
    """
    해당 novel_id의 모든 챕터를 chapter_number 순으로 합쳐서 반환하는 함수

    * 입력 매개변수:
        - novel_id (int): 소설의 고유 ID

    * 반환값:
        - novel_id에 해당하는 소설의 모든 챕터 텍스트를 합친 문자열
    """
    # 데이터베이스 연결 및 쿼리실행 객체 생성
    conn = get_connection()
    cursor = conn.cursor()

    # chapters 테이블에서 특정 novel_id에 해당하는 모든 챕터 조회
    sql = """
    SELECT chapter_number, content
    FROM chapters
    WHERE novel_id=%s
    ORDER BY chapter_number
    """

    # SQL 쿼리 실행
    cursor.execute(sql, (novel_id,))

    # 결과 가져오기
    rows = cursor.fetchall()

    # 자원 해제
    cursor.close()
    conn.close()

    # 챕터 번호와 내용을 합쳐서 반환
    combined_text = ""
    for chapter_num, content in rows:
        combined_text += f"\n=== [챕터 {chapter_num}] ===\n{content}\n"
    return combined_text

def get_characters(novel_id):
    """
    특정 소설의 characters 정보를 반환하는 함수

    * 입력 매개변수:
        - novel_id (int): 소설의 고유 ID
    
    * 반환값:
        - novel_id에 해당하는 소설의 characters 정보 문자열 (JSON 또는 일반 텍스트 형식)
        - 해당 소설이 없으면 빈 문자열 반환
    """
    # 데이터베이스 연결 및 쿼리실행 객체 생성
    conn = get_connection()
    cursor = conn.cursor()

    # novels 테이블에서 특정 novel_id에 해당하는 characters 조회
    sql = "SELECT characters FROM novels WHERE id=%s"

    # SQL 쿼리 실행
    cursor.execute(sql, (novel_id,))

    # 결과 가져오기
    row = cursor.fetchone()

    # 자원 해제
    cursor.close()
    conn.close()
    return row[0] if row else ""

def update_characters(novel_id, new_characters):
    """
    novels 테이블의 characters 열 업데이트하는 함수

    * 입력 매개변수:
        - novel_id (int): 소설의 고유 ID
        - new_characters (str): 업데이트할 characters 정보 문자열 (JSON 또는 일반 텍스트 형식)
    """
    # 데이터베이스 연결 및 쿼리실행 객체 생성
    conn = get_connection()
    cursor = conn.cursor()

    # novels 테이블에서 특정 novel_id에 해당하는 characters 업데이트
    sql = """
    UPDATE novels
    SET characters = %s
    WHERE id = %s
    """

    # SQL 쿼리 실행
    cursor.execute(sql, (new_characters, novel_id))

    # 데이터베이스에 반영
    conn.commit()

    # 자원 해제
    cursor.close()
    conn.close()