"use client"

import { useState } from "react"
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@workspace/ui/components/dropdown-menu"
import {
  Avatar,
  AvatarFallback,
  AvatarImage
} from "@workspace/ui/components/avatar"
import { Calendar, MoreHorizontal, Plus } from "lucide-react"

interface Task {
  id: string
  title: string
  dueDate: string
  assignee: {
    name: string
    avatar: string
  }
  project: string
  visibility: "Personal" | "Public"
}

export function TaskList() {
  const [tasks, setTasks] = useState<Task[]>([
    {
      id: "1",
      title: "Automatic mailers for Payment Made",
      dueDate: "2024-11-28",
      assignee: {
        name: "John",
        avatar: "/placeholder.svg"
      },
      project: "Lilypay",
      visibility: "Personal"
    },
    {
      id: "2",
      title: "Follow up with Laura Williams at Firefly",
      dueDate: "2024-12-02",
      assignee: {
        name: "Sarah",
        avatar: "/placeholder.svg"
      },
      project: "Lilypay",
      visibility: "Public"
    }
  ])

  const [newTask, setNewTask] = useState("")

  const addTask = () => {
    if (newTask.trim()) {
      const task: Task = {
        id: Math.random().toString(),
        title: newTask,
        dueDate:
          new Date().toISOString().split("T")[0] ?? new Date().toISOString(),
        assignee: {
          name: "You",
          avatar: "/placeholder.svg"
        },
        project: "Personal",
        visibility: "Personal"
      }
      setTasks([...tasks, task])
      setNewTask("")
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-2">
        <Input
          placeholder="Add task..."
          value={newTask}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            setNewTask(e.target.value)
          }
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              addTask()
            }
          }}
        />
        <Button onClick={addTask}>
          <Plus className="h-4 w-4" />
        </Button>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[400px]">Task name</TableHead>
            <TableHead>Due date</TableHead>
            <TableHead>Assignee</TableHead>
            <TableHead>Project</TableHead>
            <TableHead>Visibility</TableHead>
            <TableHead className="w-[50px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {tasks.map((task) => (
            <TableRow key={task.id}>
              <TableCell>{task.title}</TableCell>
              <TableCell>
                <div className="flex items-center space-x-2">
                  <Calendar className="h-4 w-4" />
                  <span>{task.dueDate}</span>
                </div>
              </TableCell>
              <TableCell>
                <Avatar className="h-8 w-8">
                  <AvatarImage src={task.assignee.avatar} />
                  <AvatarFallback>{task.assignee.name[0]}</AvatarFallback>
                </Avatar>
              </TableCell>
              <TableCell>{task.project}</TableCell>
              <TableCell>{task.visibility}</TableCell>
              <TableCell>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem>Edit</DropdownMenuItem>
                    <DropdownMenuItem>Delete</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
