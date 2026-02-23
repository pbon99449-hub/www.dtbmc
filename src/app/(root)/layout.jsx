import Footer from '@/component/footer'
import Navbar from '@/component/navbar'
import React from 'react'

const layout = ({children}) => {
  return (
    <>
    <Navbar></Navbar>
    {children}
    <Footer></Footer>
    </>
  )
}

export default layout
