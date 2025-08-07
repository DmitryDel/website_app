from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey, Table, Text
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.db.base import Base

# Связующая таблица для отношения Many-to-Many между Наборами и Тегами
card_set_tags_association = Table(
    'card_set_tags',
    Base.metadata,
    Column('card_set_id', Integer, ForeignKey('card_sets.id'), primary_key=True),
    Column('tag_id', Integer, ForeignKey('tags.id'), primary_key=True)
)

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Связь "один ко многим": один пользователь - много папок
    folders = relationship("Folder", back_populates="owner", cascade="all, delete-orphan")
    # Связь "один ко многим": один пользователь - много наборов
    card_sets = relationship("CardSet", back_populates="owner", cascade="all, delete-orphan")

class Folder(Base):
    __tablename__ = "folders"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True, nullable=False)
    is_public = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Связь с владельцем (пользователем)
    owner_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    owner = relationship("User", back_populates="folders")

    # Связь "один ко многим": одна папка - много наборов
    card_sets = relationship("CardSet", back_populates="folder", cascade="all, delete-orphan")

class CardSet(Base):
    __tablename__ = "card_sets"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True, nullable=False)
    description = Column(String, nullable=True)
    is_public = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Связь с владельцем (пользователем)
    owner_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    owner = relationship("User", back_populates="card_sets")

    # Связь с папкой
    folder_id = Column(Integer, ForeignKey("folders.id"), nullable=False)
    folder = relationship("Folder", back_populates="card_sets")

    # Связь "многие ко многим" с тегами
    tags = relationship("Tag", secondary=card_set_tags_association, back_populates="card_sets")

    # Связь "один ко многим": один набор - много карточек
    cards = relationship("Card", back_populates="card_set", cascade="all, delete-orphan", lazy="selectin")

class Tag(Base):
    __tablename__ = "tags"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, index=True, nullable=False)

    # Связь "многие ко многим" с наборами
    card_sets = relationship("CardSet", secondary=card_set_tags_association, back_populates="tags")


class Card(Base):
    __tablename__ = "cards"
    id = Column(Integer, primary_key=True, index=True)

    # Используем Text для полей, где может быть много текста
    term = Column(Text, nullable=False)
    definition = Column(Text, nullable=False)
    example = Column(Text, nullable=True)
    translation = Column(Text, nullable=True)

    # Поле для ручной сортировки карточек
    order = Column(Integer, nullable=False, default=0)

    # Связь с набором, к которому принадлежит карточка
    set_id = Column(Integer, ForeignKey("card_sets.id"), nullable=False)
    card_set = relationship("CardSet", back_populates="cards")