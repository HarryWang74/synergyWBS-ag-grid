import './App.css'
import { RouterProvider, createBrowserRouter } from 'react-router-dom'
import Layout from './Layout'

import { 
  OneTableSolution, 
  MultiTableSolution,
  DataTableDemo,
  Drag,
  ProjectBreakdown,
} from './pages'

const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    children: [
      {
        index: true,
        element: <ProjectBreakdown />,
      },
      {
        path: 'multi-table/',
        element: <MultiTableSolution />,
      },
      {
        path: 'demo/',
        element: <DataTableDemo />,
      },
      {
        path: 'onetable/',
        element: <OneTableSolution />,
      },
      {
        path: 'drag/',
        element: <Drag />,
      },
    ],
  },
])
function App() {
  return (
    <>
      <RouterProvider router={router} />
    </>
  )
}

export default App
