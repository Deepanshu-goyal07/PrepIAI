import React from 'react'
import Home from './pages/Home'
import { Route, Routes } from 'react-router-dom'
import Auth from './pages/Auth'
import InterviewPage from './pages/InterviewPage'
import { useEffect } from 'react'
import axios from 'axios'
import { useDispatch } from 'react-redux'
import { setUserData } from './redux/userSlice'

export const ServerUrl = "http://localhost:3000"

function App() {

  const dispatch = useDispatch()  //  React Redux hook that returns a reference to the Redux store's dispatch function.

  useEffect(() => {           //  React hook that lets you perform side effects in a functional component.
    const getUser = async () => { //  Async function to get the current user from the server.
      try {
        const result = await axios.get(`${ServerUrl}/api/user/current-user`, { withCredentials: true }); // Make a GET request to the server to get the current user.
        if (result.data.success) { // Check if the request was successful.
          dispatch(setUserData(result.data.user));
        } else {
          dispatch(setUserData(null));
        }
      }
      catch (error) {
        console.log(error)
        dispatch(setUserData(null));
      }
    }
    getUser();
  }, [dispatch])
  return (
    <Routes>
      <Route path='/' element={<Home />} />
      <Route path='/auth' element={<Auth />} />
      <Route path='/interview' element={<InterviewPage />} />
    </Routes>
  )
}

export default App