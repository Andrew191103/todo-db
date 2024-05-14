import axios from 'axios';

const API_URL = 'http://localhost:8000'; // Adjust if your FastAPI server runs on a different port

export const getTodos = async (userEmail) => {
  try {
    const response = await axios.get(`${API_URL}/todo/get`, {
      params: { userEmail: userEmail }
    });
    return response.data.TodoItems;
  } catch (error) {
    console.error('Error fetching todos:', error);
    throw error;
  }
};

export const createTodo = async (todo) => {
  try {
    const response = await axios.post(`${API_URL}/todo/post`, todo);
    return response.data.TodoItem;
  } catch (error) {
    console.error('Error adding todo item:', error);
    throw error;
  }
};

export const updateTodo = async (id, todo) => {
  try {
    const response = await axios.put(`${API_URL}/todo/put/${id}`, todo);
    return response.data.TodoItem;
  } catch (error) {
    console.error('Error updating todo item:', error);
    throw error;
  }
};

export const deleteTodo = async (id) => {
  try {
    const response = await axios.delete(`${API_URL}/todo/delete/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting todo item:', error);
    throw error;
  }
};
