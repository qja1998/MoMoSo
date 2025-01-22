# db_manager.py

import os
import mysql.connector
from mysql.connector import Error

# (선택) .env 파일로부터 환경 변수 읽고 싶다면:
from dotenv import load_dotenv
load_dotenv()

# MySQL 접속 정보
DB_HOST = os.getenv("DB_HOST", "localhost")
DB_PORT = int(os.getenv("DB_PORT", 3306))
DB_USER = os.getenv("DB_USER", "root")
DB_PASSWORD = os.getenv("DB_PASSWORD", "root")
DB_NAME = os.getenv("DB_NAME", "novel_test_db")

def get_connection(create_db_if_needed=False):
    """
    MySQL 커넥션 반환.
    create_db_if_needed=True 인 경우, DB가 없으면 생성 시도.
    """
    try:
        # 우선 DB_NAME 없이 커넥션해본 뒤, 필요 시 DB 생성
        conn = mysql.connector.connect(
            host=DB_HOST,
            port=DB_PORT,
            user=DB_USER,
            password=DB_PASSWORD
        )
        conn.autocommit = True
        cursor = conn.cursor()
        if create_db_if_needed:
            # DB 생성 (없으면)
            cursor.execute(f"CREATE DATABASE IF NOT EXISTS {DB_NAME} CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;")
        cursor.close()
        conn.close()

        # 실제로는 해당 DB_NAME으로 커넥션
        conn = mysql.connector.connect(
            host=DB_HOST,
            port=DB_PORT,
            user=DB_USER,
            password=DB_PASSWORD,
            database=DB_NAME
        )
        return conn
    except Error as e:
        print("MySQL 연결/초기화 중 오류:", e)
        raise e

def init_db():
    """
    DB와 테이블을 생성 (존재하지 않으면).
    """
    try:
        conn = get_connection(create_db_if_needed=True)
        cursor = conn.cursor()

        # novels 테이블
        create_novels_table = """
        CREATE TABLE IF NOT EXISTS novels (
            id INT PRIMARY KEY AUTO_INCREMENT,
            title VARCHAR(255),
            genre VARCHAR(100),
            synopsis TEXT
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

        cursor.execute(create_novels_table)
        cursor.execute(create_chapters_table)

        conn.commit()
        cursor.close()
        conn.close()

    except Error as e:
        print("init_db 에러:", e)
        raise e

def insert_novel(title, genre, synopsis):
    """
    novels 테이블에 새 소설 삽입, 삽입된 novel_id 반환
    """
    conn = get_connection()
    cursor = conn.cursor()
    sql = """
    INSERT INTO novels (title, genre, synopsis)
    VALUES (%s, %s, %s)
    """
    cursor.execute(sql, (title, genre, synopsis))
    conn.commit()
    novel_id = cursor.lastrowid
    cursor.close()
    conn.close()
    return novel_id

def insert_chapter(novel_id, chapter_number, content):
    """
    chapters 테이블에 (novel_id, chapter_number, content) 삽입
    """
    conn = get_connection()
    cursor = conn.cursor()
    sql = """
    INSERT INTO chapters (novel_id, chapter_number, content)
    VALUES (%s, %s, %s)
    """
    cursor.execute(sql, (novel_id, chapter_number, content))
    conn.commit()
    cursor.close()
    conn.close()

def get_chapter_count(novel_id):
    """
    특정 novel_id의 현재 챕터 수(= 마지막 챕터 번호) 반환
    """
    conn = get_connection()
    cursor = conn.cursor()
    sql = """
    SELECT MAX(chapter_number) FROM chapters WHERE novel_id=%s
    """
    cursor.execute(sql, (novel_id,))
    row = cursor.fetchone()
    cursor.close()
    conn.close()
    return row[0] if row[0] else 0

def get_all_chapters_content(novel_id):
    """
    해당 novel_id의 모든 챕터를 chapter_number 순으로 합쳐서 반환
    """
    conn = get_connection()
    cursor = conn.cursor()
    sql = """
    SELECT chapter_number, content
    FROM chapters
    WHERE novel_id=%s
    ORDER BY chapter_number
    """
    cursor.execute(sql, (novel_id,))
    rows = cursor.fetchall()
    cursor.close()
    conn.close()

    combined_text = ""
    for chapter_num, content in rows:
        combined_text += f"\n=== [챕터 {chapter_num}] ===\n{content}\n"
    return combined_text
