from pydantic import BaseModel
from typing import List, Optional

class TodoBase(BaseModel):
    text: str
    inprog: Optional[bool] = False
    completed: Optional[bool] = False

class TodoCreate(TodoBase):
    pass

class TodoUpdate(TodoBase):
    pass

class TodoDisplay(TodoBase):
    id: int

    class Config:
        orm_mode = True

class UserBase(BaseModel):
    username: str

class UserCreate(UserBase):
    pass

class UserDisplay(UserBase):
    id: int
    todos: List[TodoDisplay] = []

    class Config:
        orm_mode = True
