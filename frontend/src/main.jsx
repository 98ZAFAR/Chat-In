import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import App from './App.jsx'
import Signup from './pages/Signup.jsx'
import Signin from './pages/Signin.jsx'

const router =  createBrowserRouter([
  {
    path:'/',
    element:<App/>,
    children:[
      {
        path:'/signup',
        element:<Signup/>
      },

      {
        path:'/signin',
        element:<Signin/>
      }
    ]
  }
]);

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <RouterProvider router={router}>

    </RouterProvider>
  </StrictMode>,
)
