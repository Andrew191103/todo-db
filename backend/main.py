from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from typing import List, Optional
from pydantic import BaseModel

from database import SessionLocal, engine
import models, schemas, crud

# Initialize the FastAPI app
app = FastAPI()

# Define allowed origins for CORS
origins = [
    "http://localhost:5173",  # Frontend server
    "http://localhost:8000"   # Backend server itself (if needed)
]

# Configure CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,  # allow origins as a list of URLs
    allow_credentials=True,
    allow_methods=["*"],  # Allow all methods
    allow_headers=["*"]   # Allow all headers
)

# Generate database tables
models.Base.metadata.create_all(bind=engine)

# Dependency to get the database session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Pydantic models for your endpoints
class TodoItem(BaseModel):
    id: int
    text: str
    inprog: bool
    completed: bool

    class Config:
        orm_mode = True

class UpdateTodoItem(BaseModel):
    text: Optional[str]
    completed: Optional[bool]
    inprog: Optional[bool]

class TodoDisplay(BaseModel):
    id: int
    text: str
    inprog: bool
    completed: bool

    class Config:
        orm_mode = True

# Read all TodoItems
@app.get("/todo/get", response_model=List[TodoDisplay])
def get_todo_list(db: Session = Depends(get_db)):
    todos = crud.get_todos_by_user(db, user_id=1)  # Example for user_id=1, adjust as needed
    return todos

# Read a single TodoItem by ID
@app.get("/todo/get/{item_id}", response_model=TodoDisplay)
def get_todo_item(item_id: int, db: Session = Depends(get_db)):
    todo_item = crud.get_todo_by_id(db, todo_id=item_id)
    if not todo_item:
        raise HTTPException(status_code=404, detail="TodoItem not found")
    return todo_item

# Create a TodoItem
@app.post("/todo/post", response_model=TodoDisplay)
def add_todo_item(todo_item: schemas.TodoCreate, db: Session = Depends(get_db)):
    new_todo = crud.create_todo(db, todo=todo_item, user_id=1)  # Example for user_id=1, adjust as needed
    return new_todo

# Delete a TodoItem
@app.delete("/todo/delete/{item_id}", response_model=dict)
def delete_todo_item(item_id: int, db: Session = Depends(get_db)):
    success = crud.delete_todo(db, todo_id=item_id)
    if success:
        return {"Success": True, "Message": "TodoItem deleted successfully"}
    else:
        return {"Success": False, "Message": "TodoItem not found"}

# Update a TodoItem
@app.put("/todo/put/{item_id}", response_model=TodoDisplay)
def update_todo_item(item_id: int, todo_data: UpdateTodoItem, db: Session = Depends(get_db)):
    updated_todo = crud.update_todo(db, todo_id=item_id, todo=schemas.TodoUpdate(**todo_data.dict()))
    if updated_todo:
        return updated_todo
    else:
        raise HTTPException(status_code=404, detail="TodoItem not found")
