import Footer from "../components/Footer"
import {
  Clock,
  Shield,
  Star,
  CheckCircle2,
  Smartphone,
  Calendar,
  CreditCard,
  Wrench,
  Award,
  TrendingUp,
  Wind,
  Snowflake,
  Settings,
  Droplets,
  ThermometerSun,
  ArrowRight,
} from "lucide-react"

export default function Home() {
  const features = [
    {
      icon: <Clock className="w-6 h-6" />,
      title: "จองได้ตลอด 24 ชั่วโมง",
      description: "จองช่างได้ทุกเวลา ไม่ว่าจะเป็นวันธรรมดาหรือวันหยุด",
    },
    {
      icon: <Shield className="w-6 h-6" />,
      title: "ช่างมืออาชีพที่ผ่านการตรวจสอบ",
      description: "ช่างทุกคนผ่านการตรวจสอบประวัติและมีใบรับรองมาตรฐาน",
    },
    {
      icon: <Star className="w-6 h-6" />,
      title: "ระบบรีวิวและให้คะแนน",
      description: "ดูรีวิวจากลูกค้าจริง เลือกช่างที่ใช่สำหรับคุณ",
    },
    {
      icon: <CreditCard className="w-6 h-6" />,
      title: "ชำระเงินปลอดภัย",
      description: "รองรับหลายช่องทางการชำระเงิน ปลอดภัย มั่นใจได้",
    },
    {
      icon: <Calendar className="w-6 h-6" />,
      title: "จัดการนัดหมายง่าย",
      description: "ระบบจัดการนัดหมายอัตโนมัติ แจ้งเตือนก่อนถึงเวลา",
    },
    {
      icon: <Smartphone className="w-6 h-6" />,
      title: "ใช้งานง่ายบนมือถือ",
      description: "ออกแบบให้ใช้งานง่าย สะดวก รวดเร็ว บนทุกอุปกรณ์",
    },
  ]

  const services = [
    {
      icon: <Wind className="w-8 h-8" />,
      title: "ติดตั้งแอร์",
      description: "บริการติดตั้งแอร์ใหม่ทุกยี่ห้อ ทุกรุ่น โดยช่างมืออาชีพ พร้อมรับประกันงานติดตั้ง",
      price: "เริ่มต้น 1,500 บาท",
    },
    {
      icon: <Settings className="w-8 h-8" />,
      title: "ซ่อมแอร์",
      description: "แก้ไขปัญหาแอร์ไม่เย็น แอร์รั่ว แอร์มีเสียงดัง และปัญหาอื่นๆ อย่างรวดเร็ว",
      price: "เริ่มต้น 500 บาท",
    },
    {
      icon: <Droplets className="w-8 h-8" />,
      title: "ล้างแอร์",
      description: "ทำความสะอาดแอร์อย่างละเอียด ช่วยให้แอร์เย็นดีขึ้น ประหยัดไฟ และอากาศสะอาด",
      price: "เริ่มต้น 400 บาท",
    },
    {
      icon: <ThermometerSun className="w-8 h-8" />,
      title: "เติมน้ำยาแอร์",
      description: "ตรวจสอบและเติมน้ำยาแอร์ให้เย็นเหมือนเดิม พร้อมตรวจเช็คระบบทั้งหมด",
      price: "เริ่มต้น 800 บาท",
    },
    {
      icon: <Snowflake className="w-8 h-8" />,
      title: "บำรุงรักษาแอร์",
      description: "บริการตรวจเช็คและบำรุงรักษาแอร์เป็นประจำ เพื่อยืดอายุการใช้งาน",
      price: "เริ่มต้น 600 บาท",
    },
    {
      icon: <Wrench className="w-8 h-8" />,
      title: "ย้ายแอร์",
      description: "บริการถอดและติดตั้งแอร์ใหม่ ย้ายแอร์ไปที่ใหม่อย่างปลอดภัย",
      price: "เริ่มต้น 2,000 บาท",
    },
  ]

  const stats = [
    { number: "10,000+", label: "ลูกค้าที่ใช้บริการ" },
    { number: "500+", label: "ช่างมืออาชีพ" },
    { number: "4.8/5", label: "คะแนนความพึงพอใจ" },
    { number: "98%", label: "อัตราการจองสำเร็จ" },
  ]

  const technicianBenefits = [
    {
      icon: <TrendingUp className="w-5 h-5" />,
      text: "เพิ่มรายได้ด้วยการรับงานเพิ่มเติม",
    },
    {
      icon: <Calendar className="w-5 h-5" />,
      text: "จัดการตารางงานได้ด้วยตัวเอง",
    },
    {
      icon: <Award className="w-5 h-5" />,
      text: "สร้างชื่อเสียงผ่านระบบรีวิว",
    },
    {
      icon: <CreditCard className="w-5 h-5" />,
      text: "รับเงินรวดเร็วและปลอดภัย",
    },
  ]

  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-1">
        {/* Hero Section */}
        <section
          id="home"
          className="relative bg-linear-to-br from-primary/5 via-background to-accent/5 py-20 lg:py-32"
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto text-center">
              <h1 className="text-4xl lg:text-6xl font-bold text-foreground mb-6 text-balance">
                แพลตฟอร์มจองช่างแอร์
                <span className="text-primary"> ที่คุณไว้วางใจได้</span>
              </h1>
              <p className="text-lg lg:text-xl text-muted-foreground leading-relaxed text-pretty mb-8">
                เชื่อมต่อคุณกับช่างแอร์มืออาชีพในพื้นที่ของคุณ จองง่าย รวดเร็ว ปลอดภัย ด้วยระบบออนไลน์ที่ทันสมัย
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <a
                  href="/register"
                  className="w-full sm:w-auto px-8 py-4 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-semibold text-lg inline-flex items-center justify-center gap-2"
                >
                  เริ่มจองเลย
                  <ArrowRight className="w-5 h-5" />
                </a>
                <a
                  href="#services"
                  className="w-full sm:w-auto px-8 py-4 bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/80 transition-colors font-semibold text-lg"
                >
                  ดูบริการทั้งหมด
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-16 bg-card border-y border-border">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
              {stats.map((stat, index) => (
                <div key={index} className="text-center">
                  <div className="text-3xl lg:text-4xl font-bold text-primary mb-2">{stat.number}</div>
                  <div className="text-sm text-muted-foreground">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* About Section */}
        <section id="about" className="py-20 lg:py-32">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl lg:text-5xl font-bold text-foreground mb-4 text-balance">ทำไมต้องเลือกเรา</h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto text-pretty">
                ระบบที่ออกแบบมาเพื่อความสะดวกสบายและความปลอดภัยของคุณ
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {features.map((feature, index) => (
                <div
                  key={index}
                  className="bg-card border border-border rounded-xl p-6 hover:border-primary/50 transition-colors"
                >
                  <div className="w-12 h-12 bg-primary/10 text-primary rounded-lg flex items-center justify-center mb-4">
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-semibold text-foreground mb-2">{feature.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Services Section */}
        <section id="services" className="py-20 lg:py-32 bg-card">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl lg:text-5xl font-bold text-foreground mb-4 text-balance">บริการของเรา</h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto text-pretty">
                บริการครบวงจรเกี่ยวกับเครื่องปรับอากาศ ด้วยช่างมืออาชีพที่ผ่านการรับรอง
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {services.map((service, index) => (
                <div
                  key={index}
                  className="bg-background border border-border rounded-xl p-6 hover:border-primary/50 hover:shadow-lg transition-all"
                >
                  <div className="w-16 h-16 bg-primary/10 text-primary rounded-xl flex items-center justify-center mb-4">
                    {service.icon}
                  </div>
                  <h3 className="text-xl font-semibold text-foreground mb-2">{service.title}</h3>
                  <p className="text-muted-foreground leading-relaxed mb-4">{service.description}</p>
                  <div className="flex items-center justify-between pt-4 border-t border-border">
                    <span className="text-primary font-semibold">{service.price}</span>
                    <a
                      href="/register"
                      className="text-sm text-primary hover:text-primary/80 font-medium inline-flex items-center gap-1"
                    >
                      จองเลย
                      <ArrowRight className="w-4 h-4" />
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section className="py-20 lg:py-32">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl lg:text-5xl font-bold text-foreground mb-4 text-balance">วิธีการใช้งาน</h2>
              <p className="text-lg text-muted-foreground text-pretty">เพียง 4 ขั้นตอนง่ายๆ ก็ได้ช่างมาซ่อมแอร์ที่บ้านคุณ</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {[
                { step: "1", title: "สมัครสมาชิก", desc: "สร้างบัญชีฟรีภายใน 2 นาที" },
                { step: "2", title: "เลือกบริการ", desc: "เลือกบริการที่ต้องการและกำหนดวันเวลา" },
                { step: "3", title: "เลือกช่าง", desc: "เลือกช่างจากรีวิวและคะแนน" },
                { step: "4", title: "รับบริการ", desc: "ช่างมาให้บริการตามเวลาที่นัดหมาย" },
              ].map((item, index) => (
                <div key={index} className="text-center">
                  <div className="w-16 h-16 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                    {item.step}
                  </div>
                  <h3 className="text-xl font-semibold text-foreground mb-2">{item.title}</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Technician CTA Section */}
        <section className="py-20 lg:py-32 bg-linear-to-br from-primary/10 via-background to-accent/10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
              <div className="bg-card border border-border rounded-2xl p-8 lg:p-12">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 bg-primary/10 text-primary rounded-lg flex items-center justify-center">
                    <Wrench className="w-6 h-6" />
                  </div>
                  <h2 className="text-3xl lg:text-4xl font-bold text-foreground text-balance">คุณเป็นช่างแอร์มืออาชีพ?</h2>
                </div>

                <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
                  มาร่วมเป็นส่วนหนึ่งของเครือข่ายช่างมืออาชีพของเรา เพิ่มรายได้และสร้างชื่อเสียงในวงการ
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                  {technicianBenefits.map((benefit, index) => (
                    <div key={index} className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-primary/10 text-primary rounded-lg flex items-center justify-center shrink-0">
                        {benefit.icon}
                      </div>
                      <span className="text-foreground">{benefit.text}</span>
                    </div>
                  ))}
                </div>

                <a
                  href="/technician-register"
                  className="inline-flex items-center gap-2 px-8 py-4 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-semibold text-lg"
                >
                  สมัครเป็นช่างกับเรา
                  <CheckCircle2 className="w-5 h-5" />
                </a>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
