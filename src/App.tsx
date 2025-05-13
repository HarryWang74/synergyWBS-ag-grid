import './App.css'
import { RouterProvider, createBrowserRouter } from 'react-router-dom'
import Layout from './Layout'

import { 
  OneTableSolution, 
  MultiTableSolution,
  ShadcnTable,
  DataTableDemo,
  Drag,
} from './pages'

const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    children: [
      {
        path: 'shadcn/',
        element: <ShadcnTable />,
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
        index: true,
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
