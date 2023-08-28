// components/TaskModal.js
import { useState, useEffect, React } from "react";
const { BACKEND_BASE_URL } = require("../config");
import axios from "axios";
function TaskModal({ isOpen, onClose, onSubmit, editingTask }) {
  const [selectedStatus, setSelectedStatus] = useState(
    editingTask ? editingTask.status : ""
  );

  useEffect(() => {
    setSelectedStatus(editingTask ? editingTask.status : "");
  }, [editingTask]);

  if (!isOpen) return null;

  const handleSubmit = async (event) => {
    event.preventDefault();
    const taskTitle = event.target.taskTitle.value;
    const taskDescription = event.target.taskDescription.value;
    const taskStatus = event.target.taskStatus.value;

    let task = {};
    try {
      let response = "";
      if (editingTask) {
        task = {
          taskId: editingTask._id,
          title: taskTitle,
          description: taskDescription,
          status: taskStatus,
        };
        response = await axios.post(
          `${BACKEND_BASE_URL}/api/post/updateStatus`,
          task
        );
      } else {
        task = {
          title: taskTitle,
          description: taskDescription,
          status: taskStatus,
        };
        response = await axios.post(
          `${BACKEND_BASE_URL}/api/post/create`,
          task
        );
      }

      console.log("response", response.data);

      if (response.status !== 200) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      console.log("Task saved:", response.data);
    } catch (error) {
      console.error("Error saving task:", error);
    }

    onSubmit(task);
    onClose();
  };

  return (
    <div className="fixed top-0 left-0 w-full h-full flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-[#282727] p-4 sm:p-6 md:p-8 rounded-lg w-full sm:w-2/3 md:w-1/2 lg:w-1/3 bg-opacity-90">
        <form onSubmit={handleSubmit}>
          <div className="my-8 sm:my-12 md:my-16">
            <div className="mb-4 mx-8">
              <label
                htmlFor="taskTitle"
                className="block text-sm font-medium mb-1 "
              ></label>
              <input
                type="text"
                id="taskTitle"
                name="taskTitle"
                className="border rounded-xl p-2 w-full my-2 border-none"
                placeholder="Title"
                defaultValue={editingTask ? editingTask.title : ""}
                required
              />
              <input
                type="text"
                id="taskDescription"
                name="taskDescription"
                className="border rounded-xl p-2 w-full my-2 border-none"
                placeholder="Description"
                defaultValue={editingTask ? editingTask.description : ""}
                required
              />
              <select
                name="taskStatus"
                className="border rounded-xl p-2 w-full my-2 border-none bg-[#3d3c3c] text-white"
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                required
              >
                <option value="" disabled>
                  Status
                </option>
                <option value="To Do" className="text-white my-2 bg-[#3d3c3c]">
                  To Do
                </option>
                <option value="Doing" className="text-white bg-[#3d3c3c]">
                  Doing
                </option>
                <option value="Done" className="text-white bg-[#3d3c3c]">
                  Done
                </option>
              </select>
            </div>
            <div className="flex justify-center space-x-3 sm:space-x-5">
              <button
                type="button"
                className="bg-[#ac1e1e] rounded-md text-white px-3 sm:px-4 py-2"
                onClick={onClose}
              >
                Discard
              </button>
              <button
                type="submit"
                className="bg-[#019A35] rounded-md text-white px-3 sm:px-4 py-2"
              >
                {editingTask ? "Update Task" : "Add Task"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

export default TaskModal;
