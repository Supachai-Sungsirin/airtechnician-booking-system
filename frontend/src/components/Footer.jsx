import { Wind, Facebook, Instagram, Mail, Phone, MapPin } from "lucide-react";
import { Link } from "react-router-dom";
import logoImage from "../assets/logo.png";

export default function Footer() {
  return (
    <footer className="bg-card border-t border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              {/* Logo */}
              <Link
                to="/"
                className="flex items-center gap-2 hover:opacity-80 transition-opacity"
              >
                <img
                  src={logoImage}
                  alt="CoolQ Logo"
                  className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center"
                />
              </Link>
              <span className="text-xl font-bold text-foreground">CoolQ</span>
            </div>
            <p className="text-muted-foreground text-sm leading-relaxed">
              แพลตฟอร์มจองช่างแอร์ออนไลน์ที่เชื่อถือได้
              เชื่อมต่อคุณกับช่างมืออาชีพ
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold text-foreground mb-4">เมนูหลัก</h3>
            <ul className="space-y-2">
              <li>
                <Link
                  to="/"
                  className="text-muted-foreground hover:text-primary transition-colors text-sm"
                >
                  หน้าแรก
                </Link>
              </li>
              <li>
                <Link
                  to="/about"
                  className="text-muted-foreground hover:text-primary transition-colors text-sm"
                >
                  เกี่ยวกับเรา
                </Link>
              </li>
              <li>
                <Link
                  to="/services"
                  className="text-muted-foreground hover:text-primary transition-colors text-sm"
                >
                  บริการ
                </Link>
              </li>
              <li>
                <Link
                  to="/technician-register"
                  className="text-muted-foreground hover:text-primary transition-colors text-sm"
                >
                  สมัครเป็นช่าง
                </Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="font-semibold text-foreground mb-4">ช่วยเหลือ</h3>
            <ul className="space-y-2">
              <li>
                <a
                  href="#"
                  className="text-muted-foreground hover:text-primary transition-colors text-sm"
                >
                  คำถามที่พบบ่อย
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-muted-foreground hover:text-primary transition-colors text-sm"
                >
                  นโยบายความเป็นส่วนตัว
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-muted-foreground hover:text-primary transition-colors text-sm"
                >
                  เงื่อนไขการใช้งาน
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-muted-foreground hover:text-primary transition-colors text-sm"
                >
                  ติดต่อเรา
                </a>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-semibold text-foreground mb-4">ติดต่อเรา</h3>
            <ul className="space-y-3">
              <li className="flex items-center gap-2 text-muted-foreground text-sm">
                <Phone className="w-4 h-4" />
                <span>02-xxx-xxxx</span>
              </li>
              <li className="flex items-center gap-2 text-muted-foreground text-sm">
                <Mail className="w-4 h-4" />
                <span>info@coolQ.com</span>
              </li>
              <li className="flex items-start gap-2 text-muted-foreground text-sm">
                <MapPin className="w-4 h-4 mt-0.5" />
                <span>กรุงเทพมหานคร ประเทศไทย</span>
              </li>
            </ul>
            <div className="flex items-center gap-3 mt-4">
              <a
                href="#"
                className="w-9 h-9 bg-muted hover:bg-primary hover:text-primary-foreground rounded-lg flex items-center justify-center transition-colors"
              >
                <Facebook className="w-4 h-4" />
              </a>
              <a
                href="#"
                className="w-9 h-9 bg-muted hover:bg-primary hover:text-primary-foreground rounded-lg flex items-center justify-center transition-colors"
              >
                <Instagram className="w-4 h-4" />
              </a>
            </div>
          </div>
        </div>

        <div className="border-t border-border mt-8 pt-8 text-center text-muted-foreground text-sm">
          <p>&copy; 2025 CoolQ. สงวนลิขสิทธิ์.</p>
        </div>
      </div>
    </footer>
  );
}
