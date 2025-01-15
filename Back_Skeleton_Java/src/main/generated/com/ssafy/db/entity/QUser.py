from sqlalchemy import Column, String, Integer
from sqlalchemy.ext.declarative import declarative_base

from .base_entity import BaseEntity

Base = declarative_base()

class User(BaseEntity):
    __tablename__ = 'users'

    # BaseEntity로부터 id 상속
    
    # 사용자 정보 필드
    user_id = Column(String(255), unique=True, nullable=False)
    password = Column(String(255), nullable=False)
    name = Column(String(255), nullable=False)
    department = Column(String(255))
    position = Column(String(255))

    def __init__(self, user_id: str, password: str, name: str, 
                 department: str = None, position: str = None):
        self.user_id = user_id
        self.password = password
        self.name = name
        self.department = department
        self.position = position

    def __repr__(self):
        return f"<User(user_id='{self.user_id}', name='{self.name}')>"
