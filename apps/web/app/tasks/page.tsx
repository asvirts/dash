import { TaskList } from "@/components/task-list"
import { List, LayoutGrid } from "lucide-react"
import { Button } from "@workspace/ui/components/button"
import { Tabs, TabsList, TabsTrigger } from "@workspace/ui/components/tabs"

export default function Page() {
  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-semibold">My tasks</h1>
        <div className="flex items-center space-x-4">
          <Tabs defaultValue="list">
            <TabsList>
              <TabsTrigger value="list">
                <List className="h-4 w-4" />
              </TabsTrigger>
              <TabsTrigger value="board">
                <LayoutGrid className="h-4 w-4" />
              </TabsTrigger>
            </TabsList>
          </Tabs>
          <Button>Customize</Button>
        </div>
      </div>
      <TaskList />
    </div>
  )
}
