import React from "react"
import { Link, useLocation } from "react-router-dom"
import { Wind, Menu, X } from "lucide-react"

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = React.useState(false)
  const location = useLocation()
  const isHomePage = location.pathname === "/"

  const handleSmoothScroll = (e, targetId) => {
    e.preventDefault()
    const element = document.getElementById(targetId)
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" })
      setIsMenuOpen(false)
    }
  }

  return (
    <nav className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
              <Wind className="w-6 h-6 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold text-foreground">CoolQ</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            {isHomePage ? (
              <>
                <a
                  href="#home"
                  onClick={(e) => handleSmoothScroll(e, "home")}
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  หน้าแรก
                </a>
                <a
                  href="#about"
                  onClick={(e) => handleSmoothScroll(e, "about")}
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  เกี่ยวกับเรา
                </a>
                <a
                  href="#services"
                  onClick={(e) => handleSmoothScroll(e, "services")}
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  บริการ
                </a>
              </>
            ) : (
              <>
                <Link to="/" className="text-muted-foreground hover:text-foreground transition-colors">
                  หน้าแรก
                </Link>
                <Link to="/#about" className="text-muted-foreground hover:text-foreground transition-colors">
                  เกี่ยวกับเรา
                </Link>
                <Link to="/#services" className="text-muted-foreground hover:text-foreground transition-colors">
                  บริการ
                </Link>
              </>
            )}
            <Link
              to="/technician-register"
              className="text-primary hover:text-primary/80 font-medium transition-colors"
            >
              สมัครเป็นช่าง
            </Link>
          </div>

          {/* Auth Buttons - Desktop */}
          <div className="hidden md:flex items-center gap-3">
            <Link to="/login" className="px-4 py-2 text-foreground hover:text-primary transition-colors">
              เข้าสู่ระบบ
            </Link>
            <Link
              to="/register"
              className="px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-medium"
            >
              สมัครสมาชิก
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 text-foreground hover:bg-muted rounded-lg transition-colors"
          >
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-border">
            <div className="flex flex-col gap-4">
              {isHomePage ? (
                <>
                  <a
                    href="#home"
                    onClick={(e) => handleSmoothScroll(e, "home")}
                    className="text-muted-foreground hover:text-foreground transition-colors py-2"
                  >
                    หน้าแรก
                  </a>
                  <a
                    href="#about"
                    onClick={(e) => handleSmoothScroll(e, "about")}
                    className="text-muted-foreground hover:text-foreground transition-colors py-2"
                  >
                    เกี่ยวกับเรา
                  </a>
                  <a
                    href="#services"
                    onClick={(e) => handleSmoothScroll(e, "services")}
                    className="text-muted-foreground hover:text-foreground transition-colors py-2"
                  >
                    บริการ
                  </a>
                </>
              ) : (
                <>
                  <Link
                    to="/"
                    onClick={() => setIsMenuOpen(false)}
                    className="text-muted-foreground hover:text-foreground transition-colors py-2"
                  >
                    หน้าแรก
                  </Link>
                  <Link
                    to="/#about"
                    onClick={() => setIsMenuOpen(false)}
                    className="text-muted-foreground hover:text-foreground transition-colors py-2"
                  >
                    เกี่ยวกับเรา
                  </Link>
                  <Link
                    to="/#services"
                    onClick={() => setIsMenuOpen(false)}
                    className="text-muted-foreground hover:text-foreground transition-colors py-2"
                  >
                    บริการ
                  </Link>
                </>
              )}
              <Link
                to="/technician-register"
                onClick={() => setIsMenuOpen(false)}
                className="text-primary hover:text-primary/80 font-medium transition-colors py-2"
              >
                สมัครเป็นช่าง
              </Link>
              <div className="flex flex-col gap-2 pt-4 border-t border-border">
                <Link
                  to="/login"
                  onClick={() => setIsMenuOpen(false)}
                  className="px-4 py-2 text-center text-foreground hover:bg-muted rounded-lg transition-colors"
                >
                  เข้าสู่ระบบ
                </Link>
                <Link
                  to="/register"
                  onClick={() => setIsMenuOpen(false)}
                  className="px-4 py-2 text-center bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-medium"
                >
                  สมัครสมาชิก
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}
