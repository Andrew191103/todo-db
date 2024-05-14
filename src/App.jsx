import { useState, useEffect } from "react";
import "./App.css";
import { useNavigate } from 'react-router-dom';
import { useUser } from './authContext/UserContext';
import { getTodos, createTodo, updateTodo, deleteTodo } from './apu';
import { collection, query, where, onSnapshot, addDoc, doc, updateDoc, deleteDoc, setDoc } from 'firebase/firestore';
import { db } from "./firebase/firebase";
import { ref, uploadBytes, getStorage } from 'firebase/storage';

function App() {
  const navigate = useNavigate();
  const { userEmail } = useUser();
  const [todos, setTodos] = useState([]);
  const [newItem, setNewItem] = useState("");
  const [taskStatus, setTaskStatus] = useState("To Do");
  const [showPopup, setShowPopup] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editedTitle, setEditedTitle] = useState("");
  const [filter, setFilter] = useState("All");
  const [error, setError] = useState("");
  const [displayName, setDisplayName] = useState('');
  const [showProfilePopup, setShowProfilePopup] = useState(false);
  const [newDisplayName, setNewDisplayName] = useState('');
  const [userAge, setUserAge] = useState('');
  const [userNationality, setUserNationality] = useState('');
  const [profilePicUrl, setProfilePicUrl] = useState(null);
  const [profilePic, setProfilePic] = useState(null);

  const goToProfile = () => {
    navigate('/account');
  };

  const handleSignOut = () => {
    navigate('/');
  };

  useEffect(() => {
    if (userEmail) {
      const userProfileRef = doc(db, 'UserProfile', userEmail);
      const unsubscribe = onSnapshot(userProfileRef, (docSnapshot) => {
        if (docSnapshot.exists()) {
          const userData = docSnapshot.data();
          setDisplayName(userData.DisplayName || userEmail);
          setUserAge(userData.Age || '');
          setUserNationality(userData.Nationality || '');
          setProfilePicUrl(userData.ProfilePicture || '');
        }
      }, (error) => {
        console.error("Error fetching user profile: ", error);
      });
      return () => unsubscribe();
    }
  }, [userEmail]);

  const storage = getStorage();

  const handleProfilePictureUpload = (file) => {
    if (file && file.name) {
      const storageRef = ref(storage, `profilePictures/${file.name}`);
      
      uploadBytes(storageRef, file).then((snapshot) => {
        console.log("Profile picture uploaded successfully");
        // Here you can update the user's profile with the URL of the uploaded image
      }).catch((error) => {
        console.error("Error uploading profile picture:", error);
      });
    } else {
      console.error("Invalid file object:", file);
    }
  }

  useEffect(() => {
    const fetchTodos = async () => {
      try {
        const response = await axios.get("http://localhost:8000/todo/get", {
          params: { userEmail: userEmail }
        });
        setTodos(response.data.TodoItems || []);  // Ensure it's an array
      } catch (error) {
        console.error("Error fetching todos from FastAPI:", error);
        setError("Failed to fetch todos.");
      }
    };

    if (userEmail) {
      fetchTodos();
    }
  }, [userEmail]);

  const handleTodoSubmit = async (event) => {
    event.preventDefault();

    try {
      const newTodo = await createTodo({ text: newItem, inprog: true, completed: false });
      setTodos(prevTodos => [...prevTodos, newTodo]);
      setNewItem("");
      setShowPopup(false);
    } catch (error) {
      console.error('Failed to create todo:', error);
    }
  };

  const handleProfilePopupSubmit = (e) => {
    e.preventDefault();
    if (profilePic) {
      handleProfilePictureUpload(profilePic);
    } else {
      updateUserProfile(profilePicUrl);
    }
  };

  const updateUserProfile = (newProfilePicUrl) => {
    const userProfileRef = doc(db, 'UserProfile', userEmail);
    const updatedProfile = {
      DisplayName: newDisplayName || displayName,
      Age: userAge,
      Nationality: userNationality,
      ProfilePicture: newProfilePicUrl
    };

    setDoc(userProfileRef, updatedProfile, { merge: true })
      .then(() => {
        setShowProfilePopup(false);
        setProfilePic(null);
      })
      .catch((error) => {
        console.error("Error updating user profile: ", error);
      });
  };

  const handlePopupSubmit = (e) => {
    e.preventDefault();
    console.log("Adding task...");
    if (!newItem.trim()) return;

    const todo = {
      text: newItem,
      completed: taskStatus === "Done",
      status: taskStatus,
      user: userEmail
    };

    addDoc(collection(db, "todos"), todo)
      .then((docRef) => {
        console.log("Document written with ID: ", docRef.id);
        setNewItem("");
        setShowPopup(false);
        setTaskStatus("To Do");
      })
      .catch((error) => {
        console.error("Error adding document: ", error);
      });
  };

  function getVisibleTodos() {
    if (filter === "In Progress") {
      return todos.filter((todo) => todo && !todo.completed && todo.status === "In Progress");
    } else if (filter === "Done") {
      return todos.filter((todo) => todo && todo.completed && todo.status === "Done");
    } else if (filter === "To Do") {
      return todos.filter((todo) => todo && !todo.completed && todo.status === "To Do");
    }
    return todos.filter(todo => todo);
  }

  function toggleTodo(id, completed) {
    const todoRef = doc(db, "todos", id);
    updateDoc(todoRef, { completed: completed });
  }

  const deleteTodo = async (id) => {
    if (!id) {
      console.error("Attempted to delete a todo without a valid id");
      return;
    }
    try {
      console.log("Deleting todo with id:", id);
      const response = await axios.delete(`http://localhost:8000/todo/delete/${id}`);
      console.log("Delete response:", response.data);
      const updatedTodos = todos.filter((todo) => todo.id !== id);
      setTodos(updatedTodos);
    } catch (error) {
      console.error('Error deleting todo item:', error);
    }
  };

  function toggleEdit(id) {
    setEditingId(id);
    const todo = todos.find(todo => todo.id === id);
    setEditedTitle(todo ? todo.text : '');
  }

  function handleEdit(id) {
    const todoRef = doc(db, "todos", id);
    updateDoc(todoRef, { text: editedTitle })
      .then(() => setEditingId(null));
  }

  return (
    <>
      {userEmail && (
        <div style={{ position: 'absolute', top: '60px', left: '130px' }}>
          <div className="profile-pic-container">
            {profilePicUrl ? (
              <img src={profilePicUrl} alt="Profile" className="profile-pic" />
            ) : (
              <div className="profile-pic default-pic"></div>
            )}
          </div>
          <p>Welcome back, {displayName}</p>
          <p>Age: {userAge}</p>
          <p>Nationality: {userNationality}</p>
          <button onClick={() => setShowProfilePopup(true)} className="label-white">Edit Profile Details</button>
          <button onClick={goToProfile} className="label-white">Go to Profile</button>
        </div>
      )}

      {showProfilePopup && (
        <div className="overlay" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <div className="modal" style={{ background: 'white', padding: '20px', borderRadius: '10px' }}>
            <form onSubmit={handleProfilePopupSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <label htmlFor="displayName" className="label-black">Display Name:</label>
              <input
                type="text"
                id="displayName"
                value={newDisplayName}
                onChange={(e) => setNewDisplayName(e.target.value)}
                placeholder="Enter new display name"
              />
              <label htmlFor="profilePic" className="label-black">Profile Picture:</label>
              <input
                type="file"
                id="profilePic"
                onChange={(e) => setProfilePic(e.target.files[0])}
              />
              <label htmlFor="userAge" className="label-black">Age:</label>
              <input
                type="number"
                id="userAge"
                value={userAge}
                onChange={(e) => setUserAge(e.target.value)}
                placeholder="Enter your age"
              />
              <label htmlFor="userNationality" className="label-black">Nationality:</label>
              <input
                type="text"
                id="userNationality"
                value={userNationality}
                onChange={(e) => setUserNationality(e.target.value)}
                placeholder="Enter your nationality"
              />
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <button type="submit" className="label-white" style={{ flexGrow: 1, marginRight: '10px' }}>Save</button>
                <button type="button" className="label-white" onClick={() => setShowProfilePopup(false)} style={{ flexGrow: 1 }}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="Sign-Out-Button" style={{ position: 'absolute', top: '10px', left: '10px' }}>
        <button
          className="sign-out-button"
          style={{
            boxShadow: "inset 0 2px 4px 0 rgb(2 6 23 / 0.3), inset 0 -2px 4px 0 rgb(203 213 225)",
            display: "inline-flex",
            cursor: "pointer",
            alignItems: "center",
            gap: "1rem",
            borderRadius: "0.375rem",
            border: "1px solid rgb(203 213 225)",
            background: "linear-gradient(to bottom, rgb(249 250 251), rgb(229 231 235))",
            padding: "0.5rem 1rem",
            fontWeight: "600",
            opacity: "1",
            textDecoration: "none",
            color: "rgb(55 65 81)",
          }}
          onClick={handleSignOut}
        >
          Sign Out
        </button>
      </div>

      <div className="App">
        <div className="todo-header">
          <h1 className="header">To-Do List</h1>
          <p style={{ fontSize: 'smaller', marginTop: '-2rem' }}>Andrew Sebastian Sibuea - 2602169711</p>
          <select
            className="filter-dropdown"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          >
            <option value="All">All</option>
            <option value="Done">Done</option>
            <option value="To Do">To Do</option>
            <option value="In Progress">In Progress</option>
          </select>
        </div>

        <ul className="list">
          {todos.length > 0 ? (
            getVisibleTodos().map((todo) => (
              <li key={todo.id} className={`flex justify-between items-center my-2 ${todo.completed ? 'completed' : ''}`}>
                <div className="checkbox-container">
                  <input
                    type="checkbox"
                    checked={todo.completed}
                    onChange={(e) => toggleTodo(todo.id, e.target.checked)}
                    className="check"
                  />
                </div>
                <div className="task-text">
                  {editingId === todo.id ? (
                    <input
                      type="text"
                      value={editedTitle}
                      onChange={(e) => setEditedTitle(e.target.value)}
                      className="edit-input"
                      autoFocus
                    />
                  ) : (
                    <span className={`ml-2 ${todo.completed ? 'line-through' : ''}`}>
                      {todo.text}
                    </span>
                  )}
                </div>
                <div className="button-container">
                  <button
                    type="button"
                    onClick={() => toggleEdit(todo.id)}
                    className="btn-edit"
                  >
                    <span>Edit</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => deleteTodo(todo.id)}
                    className="btn-delete"
                  >
                    <span>Delete</span>
                  </button>
                  {editingId === todo.id && (
                    <button
                      type="button"
                      onClick={() => handleEdit(todo.id)}
                      className="btn-save"
                    >
                      <span>Save</span>
                    </button>
                  )}
                </div>
              </li>
            ))
          ) : (
            <li>No todos available</li>
          )}
        </ul>
      </div>

      {showPopup && (
        <div className="overlay">
          <div className="modal">
            <form onSubmit={handleTodoSubmit}>
              <label htmlFor="status">Status</label>
              <select
                id="status"
                value={taskStatus}
                onChange={(e) => setTaskStatus(e.target.value)}
              >
                <option value="To Do">To Do</option>
                <option value="In Progress">In Progress</option>
                <option value="Done">Done</option>
              </select>
              <div className="popup-buttons">
                <button type="submit" className="btn btn-primary">
                  Add Task
                </button>
                <button type="button" className="btn" onClick={() => setShowPopup(false)}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <form className="new-item-form" onSubmit={(e) => e.preventDefault()}>
        <div className="form-control">
          <label htmlFor="item">Enter a new task</label>
          <input
            className="input input-alt"
            placeholder="What do you need to do?"
            type="text"
            id="item"
            value={newItem}
            onChange={(e) => setNewItem(e.target.value)}
            style={{
              border: '2px solid #FF6347',
              borderRadius: '5px',
              padding: '10px',
              fontSize: '1rem',
              boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.1)',
              backgroundColor: 'rgba(255, 99, 71, 0.1)',
              color: '#333',
              transition: 'border-color 0.3s, box-shadow 0.3s'
            }}
          />

          <span className="input-border input-border-alt"></span>
        </div>

        <button className="btn" type="button" onClick={() => setShowPopup(true)}>
          <span>Add</span>
        </button>
      </form>
    </>
  );
}

export default App;
