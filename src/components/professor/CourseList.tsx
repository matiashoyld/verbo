import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "~/components/ui/table"

export function CourseList() {
  const courses = [
    { id: 1, name: "Introduction to Literature", students: 30, assignments: 5 },
    { id: 2, name: "Advanced Poetry Analysis", students: 25, assignments: 4 },
    { id: 3, name: "Modern American Novels", students: 35, assignments: 6 },
  ]

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Course Name</TableHead>
          <TableHead>Students</TableHead>
          <TableHead>Assignments</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {courses.map((course) => (
          <TableRow key={course.id}>
            <TableCell className="font-medium">{course.name}</TableCell>
            <TableCell>{course.students}</TableCell>
            <TableCell>{course.assignments}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}

