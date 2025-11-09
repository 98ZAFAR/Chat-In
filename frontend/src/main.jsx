import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import App from './App.jsx'
import Signup from './pages/Signup.jsx'
import Signin from './pages/Signin.jsx'
import Avatar from './pages/Avatar.jsx'
import Chat from './pages/Chat.jsx'
import AddContact from './components/AddContact.jsx'
import Profile from './pages/Profile.jsx'
import Homepage from './pages/Homepage.jsx'

const router =  createBrowserRouter([
  {
    path:'/',
    element:<App/>,
    children:[
      {
        path:'/',
        element:<Homepage/>
      },
      {
        path:'/signup',
        element:<Signup/>
      },
      {
        path:'/signin',
        element:<Signin/>
      },
      {
        path:'/avatar',
        element:<Avatar/>
      },
      {
        path:'/chat',
        element:<Chat/>
      },
      {
        path:'/add-contact',
        element:<AddContact/>
      },
      {
        path:'/profile',
        element:<Profile/>
      },
    ]
  }
]);

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <RouterProvider router={router}>

    </RouterProvider>
  </StrictMode>,
)
