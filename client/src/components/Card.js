import { useState, useEffect, useCallback, useRef } from "react";
import TaskModal from "../components/TaskModal";
import axios from "axios";
import { DndProvider, useDrag, useDrop } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPenSquare, faTrash, faPen } from "@fortawesome/free-solid-svg-icons";

import { BACKEND_BASE_URL } from "../config";


const TaskCard = ({ task, index, handleEdit, handleDelete }) => {
  const [{ isDragging }, drag] = useDrag({
    type: "TASK",
    item: { index, taskId: task._id, oldStatus: task.status },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  return (
    <div
      ref={drag}
      style={{ opacity: isDragging ? 0.5 : 1 }}
      className="outercard flex items-center justify-between bg-[#282727] my-2 sm:my-4"
    >
      <div className="inner1 m-1 sm:m-2 px-1 sm:px-2">
        <div className="title text-lg sm:text-xl">{task.title}</div>
        <div className="description">{task.description}</div>
      </div>
      <div className="flex space-x-2 sm:space-x-4 px-1 sm:px-2">
        <div
          className="edit cursor-pointer focus:outline-none active:scale-95 p-2 rounded-full hover:bg-green-600 transition duration-300"
          onClick={(e) => {
            e.stopPropagation();
            handleEdit(task);
          }}
        >
          <FontAwesomeIcon icon={faPen} size="xl" />
        </div>
        <div
          className="delete p-2 rounded-full hover:bg-red-600 transition duration-300 cursor-pointer"
          onClick={(e) => {
            e.stopPropagation();
            handleDelete(task);
          }}
        >
          <FontAwesomeIcon icon={faTrash} size="xl" />
        </div>
      </div>
    </div>
  );
};

const TaskColumn = ({
  status,
  tasks,
  handleMoveTask,
  handleEdit,
  handleDelete,
}) => {
  const [, drop] = useDrop({
    accept: "TASK",
    drop: (item) => {
      // handleMoveTask(item.taskId, tasks[item.index].status, status);
      handleMoveTask(item.taskId, item.oldStatus, status);
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
    }),
  });

  return (
    <div ref={drop} style={{ minHeight: "100px" }}>
      {tasks.map((task, index) => (
        <TaskCard
          key={task._id}
          task={task}
          index={index}
          handleDelete={handleDelete}
          handleEdit={handleEdit}
        />
      ))}
    </div>
  );
};

const Card = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [tasks, setTasks] = useState([]);
  const [editingTask, setEditingTask] = useState(null);
  const [refreshData, setRefreshData] = useState(false);

  const [todo, setTodo] = useState([]);
  const [doing, setDoing] = useState([]);
  const [done, setDone] = useState([]);

  useEffect(() => {
    async function fetchData() {
      const response = await axios.get(`${BACKEND_BASE_URL}/api/post/getall`);
      const allTasks = response.data.allPosts;
      console.log("allTasks", allTasks);

      let todoTasks = [];
      let doingTasks = [];
      let doneTasks = [];

      for (let task of allTasks) {
        if (task.status === "To Do") {
          todoTasks.push(task);
        } else if (task.status === "Doing") {
          doingTasks.push(task);
        } else if (task.status === "Done") {
          doneTasks.push(task);
        }
      }

      console.log("todoTasks", todoTasks);
      console.log("doingTasks", doingTasks);
      console.log("doneTasks", doneTasks);
      setTodo(todoTasks);
      setDoing(doingTasks);
      setDone(doneTasks);
    }

    fetchData();
  }, [refreshData]);

  const handleOpenModal = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingTask(null);
  };
  const handleDelete = async (taskToDelete) => {
    console.log("taskToDelete", taskToDelete._id);
    if (taskToDelete.status === "To Do") {
      setTodo((prevTodo) =>
        prevTodo.filter((task) => task._id !== taskToDelete._id)
      );
    } else if (taskToDelete.status === "Doing") {
      setDoing((prevDoing) =>
        prevDoing.filter((task) => task._id !== taskToDelete._id)
      );
    } else if (taskToDelete.status === "Done") {
      setDone((prevDone) =>
        prevDone.filter((task) => task._id !== taskToDelete._id)
      );
    }
    setTasks((prevTasks) =>
      prevTasks.filter((task) => task._id !== taskToDelete._id)
    );
    try {
      const response = await axios.post(`${BACKEND_BASE_URL}/api/post/delete`, {
        _id: taskToDelete._id,
      });
      console.log("response", response.data);

      if (response.status !== 200) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
    } catch (error) {
      console.error("Error saving task:", error);
    }
    setRefreshData((prev) => !prev);
  };
  const handleEdit = (task) => {
    setEditingTask(task);
    setIsModalOpen(true);
  };

  const handleTaskSubmit = (task) => {
    console.log("Task added:", task);
    if (editingTask) {
      setTasks((prevTasks) =>
        prevTasks.map((t) => (t === editingTask ? task : t))
      );
    } else {
      if (task.status === "To Do") {
        setTodo((prevTodo) => [...prevTodo, task]);
      } else if (task.status === "Doing") {
        setDoing((prevDoing) => [...prevDoing, task]);
      } else if (task.status === "Done") {
        setDone((prevDone) => [...prevDone, task]);
      }
    }
    setRefreshData((prev) => !prev);
    handleCloseModal();
  };

  const handleMoveTask = async (taskId, oldStatus, newStatus) => {
    console.log("taskId", taskId);
    console.log("taskId", oldStatus);
    console.log("taskId", newStatus);
    try {
      const response = await axios.post(
        `${BACKEND_BASE_URL}/api/post/updateStatus`,
        {
          taskId: taskId,
          status: newStatus,
        }
      );
      if (response.status !== 200) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      // Update local state if necessary
      setRefreshData((prev) => !prev);
    } catch (error) {
      console.error("Error updating task status:", error);
    }
  };
  return (
    <DndProvider backend={HTML5Backend}>
      <div className="outerContainer h-screen flex items-center justify-center">
        <div className="container">
          <button
            className="bg-[#019A35] rounded-md text-white px-4 py-2 m-4 sm:m-6"
            onClick={handleOpenModal}
          >
            Add Task
          </button>
          <TaskModal
            isOpen={isModalOpen}
            onClose={handleCloseModal}
            onSubmit={handleTaskSubmit}
            editingTask={editingTask}
          />
          <div className="">
            <div className="addtask"></div>
            <div className="alltodo grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              <div className="todo bg-[#151515]">
                <div className="text-xl sm:text-3xl font-bold mb-2 px-2 sm:px-4 py-2">
                  <h1>To Do</h1>
                </div>
                <hr />
                <TaskColumn
                  status="To Do"
                  tasks={todo}
                  handleMoveTask={handleMoveTask}
                  handleEdit={handleEdit}
                  handleDelete={handleDelete}
                />
                {/* {todo.map((task) => (
                  <div
                    key={task.title}
                    className="outercard flex items-center justify-between bg-[#282727] my-2 sm:my-4"
                  ></div>
                ))} */}
              </div>
              <div className="doing bg-[#151515]">
                <div className="text-xl sm:text-3xl font-bold mb-2 px-2 sm:px-4 py-2">
                  <h1>Doing</h1>
                </div>
                <hr />
                <TaskColumn
                  status="Doing"
                  tasks={doing}
                  handleMoveTask={handleMoveTask}
                  handleEdit={handleEdit}
                  handleDelete={handleDelete}
                />
                {/* {doing.map((task) => (
                  <div
                    key={task.title}
                    className="outercard flex items-center justify-between bg-[#282727] my-2 sm:my-4"
                  ></div>
                ))} */}
              </div>
              <div className="done bg-[#151515]">
                <div className="text-xl sm:text-3xl font-bold mb-2 px-2 sm:px-4 py-2">
                  <h1>Done</h1>
                </div>
                <hr />
                <TaskColumn
                  status="Done"
                  tasks={done}
                  handleMoveTask={handleMoveTask}
                  handleEdit={handleEdit}
                  handleDelete={handleDelete}
                />
                {/* {done.map((task) => (
                  <div
                    key={task.title}
                    className="outercard flex items-center justify-between bg-[#282727] my-2 sm:my-4"
                  ></div>
                ))} */}
              </div>
            </div>
          </div>
        </div>
      </div>
    </DndProvider>
  );
};

export default Card;
