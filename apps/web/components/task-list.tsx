import { createClient } from "@/utils/supabase/server"
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
import { redirect } from "next/navigation"

interface Task {
  id: string
  title: string
  description: string
  status: string
  due_date: string
  completed: boolean
}

export async function TaskList() {
  const supabase = createClient()

  const {
    data: { user }
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/sign-in")
  }

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

    console.log("Tasks loaded:", tasks)

    // Rest of your component code...
    return (
      <div className="space-y-4">
        <div className="flex items-center space-x-2">
          <Input
            placeholder="Add task..."
            // onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            //     setNewTask(e.target.value)
            // }
            //   onKeyDown={(e) => {
            //     if (e.key === "Enter") {
            //       addTask()
            //     }
            //   }}
          />
          <Button>
            <Plus className="h-4 w-4" />
          </Button>
        </div>
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
