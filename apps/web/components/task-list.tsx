"use client"
import { supabase } from "@/utils/supabase/client"
import { Button } from "@workspace/ui/components/button"
import { Input } from "@workspace/ui/components/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@workspace/ui/components/table"
import { Calendar, Plus } from "lucide-react"
import { useState } from "react"

interface Task {
  id: string
  title: string
  description: string
  status: string
  due_date: string
  completed: boolean
}

function AddTaskForm() {
  const [newTask, setNewTask] = useState("")

  const addTask = async () => {
    await supabase
      .from("Tasks")
      .insert([{ title: newTask }])
      .select()
  }

  return (
    <div className="flex items-center space-x-2">
      <Input
        placeholder="Add task..."
        value={newTask}
        onChange={(e) => setNewTask(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") addTask()
        }}
      />
      <Button onClick={addTask}>
        <Plus className="h-4 w-4" />
      </Button>
    </div>
  )
}

export async function TaskList() {
  try {
    const { data: tasks, error } = await supabase
      .from("Tasks")
      .select("*")
      .returns<Task[]>()

    if (error) {
      console.error("Error fetching tasks:", error)
      return <div>Error loading tasks</div>
    }

    if (!tasks) {
      console.log("No tasks found")
      return <div>No tasks found</div>
    }

    return (
      <div className="space-y-4">
        <AddTaskForm />
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[400px]">Title</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Due Date</TableHead>
              <TableHead>Completed?</TableHead>
              <TableHead className="w-[50px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {tasks?.map((task) => (
              <TableRow key={task.id}>
                <TableCell>{task.title}</TableCell>
                <TableCell>{task.description}</TableCell>
                <TableCell>{task.status}</TableCell>
                <TableCell>
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-4 w-4" />
                    <span>{task.due_date}</span>
                  </div>
                </TableCell>
                <TableCell>{task.completed ? "Yes" : "No"}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    )
  } catch (e) {
    console.error("Exception fetching tasks:", e)
    return <div>Error loading tasks</div>
  }
}
