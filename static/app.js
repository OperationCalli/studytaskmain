// Import Firebase SDK
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js";
import { getFirestore, collection, addDoc, getDocs, updateDoc, doc, deleteDoc } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js";

// Firebase Configuration
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
const db = getFirestore(app);

// Global Variables
let tasks = [];
let taskTimers = {}; // Store timers

// Add Task
async function addTask(task) {
  try {
    const docRef = await addDoc(collection(db, "tasks"), {
      task: task,
      completed: false,
      time: 0
    });
    console.log("Task added: ", docRef.id);
    loadTasks();
  } catch (e) {
    console.error("Error adding task: ", e);
  }
}

// Get Tasks
async function getTasks() {
  const querySnapshot = await getDocs(collection(db, "tasks"));
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

// Update Task Status
async function updateTaskStatus(taskId, completed) {
  await updateDoc(doc(db, "tasks", taskId), { completed });
  loadTasks();
}

// Delete Task
async function deleteTask(taskId) {
  await deleteDoc(doc(db, "tasks", taskId));
  loadTasks();
}

// Load Tasks
async function loadTasks() {
  tasks = await getTasks();
  updateTaskList();
}

// Update UI
function updateTaskList() {
  $('#task-ul').empty();
  tasks.forEach((task, index) => {
    $('#task-ul').append(`
      <li>
        <input type="checkbox" class="task-checkbox" data-index="${index}" ${task.completed ? 'checked' : ''} />
        <span class="task-text">${task.task}</span>
        
        <input type="number" class="task-timer" id="timer-${index}" min="1" placeholder="Min">
        <button class="start-timer" data-index="${index}">Start</button>
        
        <div class="progress-container">
          <div class="progress-bar" id="progress-${index}" style="width: 0%;"></div>
        </div>

        <button class="delete-task" data-index="${index}">Delete</button>
      </li>
    `);
  });
}

// Task Checkbox Toggle
$(document).on('change', '.task-checkbox', function () {
  const index = $(this).data('index');
  updateTaskStatus(tasks[index].id, this.checked);
  updateProgressBar();
});

// Delete Task
$(document).on('click', '.delete-task', function () {
  deleteTask(tasks[$(this).data('index')].id);
});

// Add Task Button
$('#add-task').click(function () {
  let task = $('#new-task').val().trim();
  if (task) {
    addTask(task);
    $('#new-task').val('');
  }
});

// Timer Functionality
$(document).on('click', '.start-timer', function () {
  const index = $(this).data('index');
  const timerInput = $(`#timer-${index}`).val();
  const taskId = tasks[index].id;
  
  if (!taskTimers[index] || taskTimers[index].paused) {
    if (timerInput && timerInput > 0) {
      startTimer(index, timerInput * 60, taskId);
      $(this).text('Pause');
    }
  } else {
    pauseTimer(index);
    $(this).text('Resume');
  }
});

// Start Timer
function startTimer(index, duration, taskId) {
  let timeRemaining = duration;
  taskTimers[index] = { time: timeRemaining, paused: false };

  taskTimers[index].interval = setInterval(() => {
    if (taskTimers[index].paused) return;
    timeRemaining--;
    taskTimers[index].time = timeRemaining;
    
    let progress = ((duration - timeRemaining) / duration) * 100;
    $(`#progress-${index}`).css('width', `${progress}%`);

    if (timeRemaining <= 0) {
      clearInterval(taskTimers[index].interval);
      playSound('task-complete');
      deleteTask(taskId);
    }
  }, 1000);
}

// Pause Timer
function pauseTimer(index) {
  taskTimers[index].paused = !taskTimers[index].paused;
}

// Progress Bar
function updateProgressBar() {
  const completedTasks = tasks.filter(task => task.completed).length;
  $('#progress-bar').css('width', `${(completedTasks / tasks.length) * 100}%`);
}

// Play Sound
function playSound(type) {
  let sound = new Audio(type === 'task-complete' ? 'static/task.wav' : 'static/victory.wav');
  sound.play();
}

// Victory Message
function showVictoryMessage() {
  $('#victory-message').show();
  setTimeout(() => {
    $('#victory-message').hide();
    deleteAllTasks();
  }, 7000);
}

// Delete All Tasks
async function deleteAllTasks() {
  const querySnapshot = await getDocs(collection(db, "tasks"));
  querySnapshot.forEach(async (doc) => {
    await deleteDoc(doc.ref);
  });
  loadTasks();
}
