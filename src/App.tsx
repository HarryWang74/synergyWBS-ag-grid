import './App.css'
import { RouterProvider, createBrowserRouter } from 'react-router-dom'
import Layout from './Layout'

import { 
  OneTableSolution, 
  MultiTableSolution,
} from './pages'

const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    children: [
      {
        path: 'multi-table/',
        element: <MultiTableSolution />,
      },
      {
        index: true,
        element: <OneTableSolution />,
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
