// Import the necessary Firebase functions
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js";
import { getFirestore, collection, addDoc, getDocs, updateDoc, doc, deleteDoc } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyA_PxbnrROxqzGs4yNu3opkWhHXeBxPhCw",
  authDomain: "studytask-a3f7b.firebaseapp.com",
  projectId: "studytask-a3f7b",
  storageBucket: "studytask-a3f7b.firebasestorage.app",
  messagingSenderId: "898055158562",
  appId: "1:898055158562:web:3550a30f65bbffa96ac37b"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);  // Initialize Firestore

// Global variable to store tasks
let tasks = [];

// Function to add tasks to Firestore
async function addTask(task) {
  try {
    const docRef = await addDoc(collection(db, "tasks"), {
      task: task,
      completed: false
    });
    console.log("Task added with ID: ", docRef.id);
    loadTasks();  // Reload tasks after adding
  } catch (e) {
    console.error("Error adding task: ", e);
  }
}

// Function to get tasks from Firestore
async function getTasks() {
  const querySnapshot = await getDocs(collection(db, "tasks"));
  const tasksArray = [];
  querySnapshot.forEach((doc) => {
    tasksArray.push({ id: doc.id, ...doc.data() });
  });
  return tasksArray;
}

// Function to update task status in Firestore
async function updateTaskStatus(taskId, completed) {
  const taskRef = doc(db, "tasks", taskId);
  await updateDoc(taskRef, {
    completed: completed
  });
  loadTasks(); // Reload tasks after updating
}

// Function to delete task from Firestore
async function deleteTask(taskId) {
  const taskRef = doc(db, "tasks", taskId);
  await deleteDoc(taskRef);
  loadTasks(); // Reload tasks after deleting
}

// Function to load tasks and update the UI
async function loadTasks() {
  tasks = await getTasks();  // Reload tasks from Firestore
  updateTaskList();  // Refresh task list in UI
}

// Function to render the task list
function updateTaskList() {
  $('#task-ul').empty();  // Clear existing tasks in the UI
  tasks.forEach((task, index) => {
    $('#task-ul').append(`
      <li>
        <input type="checkbox" class="task-checkbox" data-index="${index}" ${task.completed ? 'checked' : ''} />
        <span class="task-text">${task.task}</span>
        <button class="delete-task" data-index="${index}">Delete</button>
      </li>
    `);
  });
}

// Task checkbox toggle
$(document).on('change', '.task-checkbox', function () {
  const index = $(this).data('index');
  const taskId = tasks[index].id;
  const completed = this.checked;
  tasks[index].completed = completed;
  updateTaskStatus(taskId, completed);  // Update task in Firestore
  updateProgressBar();  // Update progress bar after task change
});

// Delete task
$(document).on('click', '.delete-task', function () {
  const index = $(this).data('index');
  const taskId = tasks[index].id;
  deleteTask(taskId);  // Delete task from Firestore
});

// Add task
$('#add-task').click(function () {
  let task = $('#new-task').val().trim();
  if (task) {
    addTask(task);  // Add new task to Firestore
    $('#new-task').val(''); // Clear the input field
  }
});

// Update progress bar based on completed tasks
function updateProgressBar() {
  const completedTasks = tasks.filter(task => task.completed).length;
  const progress = (completedTasks / tasks.length) * 100;
  $('#progress-bar').css('width', progress + '%');

  if (progress === 100) {
    playSound('victory'); // Play victory sound when all tasks are completed
    showVictoryMessage();
  }
}

// Play sound (either task-complete or victory)
function playSound(type) {
  let sound;
  if (type === 'task-complete') {
    sound = new Audio('static/task.wav'); // Ensure correct file path
  } else if (type === 'victory') {
    sound = new Audio('static/victory.wav'); // Ensure correct file path
  }
  sound.play();
}

// Show "VICTORY" message for 7 seconds
function showVictoryMessage() {
    $('#victory-message').show();
    setTimeout(async function () {
        $('#victory-message').hide();
        
        // Clear tasks after victory in UI and Firestore
        tasks = [];  // Clear the local tasks array
        updateTaskList();  // Ensure UI is cleared
        updateProgressBar(); // Reset progress bar

        // Delete all tasks from Firestore
        await deleteAllTasks(); // Ensure tasks are deleted from Firestore
        loadTasks();  // Reload tasks to confirm everything is cleared
    }, 7000);
}

// Function to reset all tasks' completed status in Firestore
async function resetTaskCompletion() {
    const querySnapshot = await getDocs(collection(db, "tasks"));
    querySnapshot.forEach(async (doc) => {
        const taskRef = doc(db, "tasks", doc.id);
        await updateDoc(taskRef, {
            completed: false // Reset completed status
        });
    });
}

// Function to delete all tasks from Firestore
async function deleteAllTasks() {
    const querySnapshot = await getDocs(collection(db, "tasks"));
    querySnapshot.forEach(async (doc) => {
        const taskRef = doc(db, "tasks", doc.id);
        await deleteDoc(taskRef);  // Delete each task from Firestore
    });
    tasks = [];  // Clear the local tasks array after deletion
    updateTaskList();  // Clear the UI task list
}

// Function to clear tasks when page reloads (on refresh)
window.onbeforeunload = async function () {
    // Ensure tasks are reloaded from Firestore on page refresh
    loadTasks();
};
