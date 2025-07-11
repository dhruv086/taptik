import React, { useEffect } from 'react'
import Navbar from './components/Navbar'
import { Navigate, Route, Routes } from 'react-router-dom'
import HomePage from './pages/HomePage'
import SignUpPage from './pages/SignUpPage'
import LoginPage from './pages/LoginPage'
import SettingsPage from './pages/SettingsPage'
import ProfilePage from './pages/ProfilePage'
import NotificationPage from './pages/NotificationPage'
import SearchPage from './pages/SearchPage'
import ResetPasswordPage from './pages/ResetPasswordPage'
import { useAuthStore } from './store/useAuthStore'
import { Loader } from 'lucide-react'
import {Toaster} from 'react-hot-toast'



const App = () => {
  const { authUser, checkAuth,isCheckingAuth,onlineUsers } = useAuthStore()
  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

if(isCheckingAuth&& !authUser){
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader className="size-10 animate-spin " />
        </div>
    )
  }



  return(

    <div>
      <Navbar />
      <Routes>
        <Route path='/' element={authUser ?<HomePage /> : <Navigate to="/login"/>}/>
        <Route path='/signup' element={!authUser ?<SignUpPage /> : <Navigate to="/"/>}/>
        <Route path='/login' element={!authUser ?<LoginPage />: <Navigate to="/"/>}/>
        <Route path='/settings' element={<SettingsPage />}/>
        <Route path='/profile' element={authUser ?<ProfilePage /> : <Navigate to="/login"/>}/>
        <Route path='/notifications' element={authUser?<NotificationPage /> : <Navigate to="/login"/>}/> 
        <Route path='/search' element={authUser ? <SearchPage /> : <Navigate to="/login" />} />
        <Route path='/reset-password' element={authUser ? <ResetPasswordPage /> : <Navigate to="/login" />} />
      </Routes>

      <Toaster />
    </div>
    )
}

export default App