import { lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { CartProvider } from './context/CartContext'
import { ThemeProvider } from './context/ThemeContext'
import Navbar from './components/Navbar/Navbar'

const Home    = lazy(() => import('./pages/Home/Home'))
const Shop    = lazy(() => import('./pages/Shop/Shop'))
const About   = lazy(() => import('./pages/About/About'))
const Contact = lazy(() => import('./pages/Contact/Contact'))
const Explore = lazy(() => import('./pages/Explore/Explore'))

export default function App() {
  return (
    <ThemeProvider>
      <CartProvider>
        <BrowserRouter>
          <Navbar />
          <Suspense fallback={<div className="pageLoader">Loading...</div>}>
            <Routes>
              <Route path="/"        element={<Home />} />
              <Route path="/shop"    element={<Shop />} />
              <Route path="/about"   element={<About />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/explore" element={<Explore />} />
            </Routes>
          </Suspense>
        </BrowserRouter>
      </CartProvider>
    </ThemeProvider>
  )
}
