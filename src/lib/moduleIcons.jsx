import {
  Users, Calendar, ClipboardCheck, Star, TrendingUp, MessageCircle,
  BarChart2, Layout, Network, Zap, Headphones, Briefcase, BookOpen,
  Building, Monitor, Globe, Heart, Award, Home, MapPin, Box,
} from 'lucide-react'

const MAP = {
  users: Users,
  calendar: Calendar,
  'clipboard-check': ClipboardCheck,
  star: Star,
  'trending-up': TrendingUp,
  'message-circle': MessageCircle,
  'bar-chart-2': BarChart2,
  layout: Layout,
  network: Network,
  zap: Zap,
  headphones: Headphones,
  briefcase: Briefcase,
  'book-open': BookOpen,
  building: Building,
  monitor: Monitor,
  globe: Globe,
  heart: Heart,
  award: Award,
  home: Home,
  'map-pin': MapPin,
}

export function ModuleIcon({ name, className, size = 16, style }) {
  const Icon = MAP[name] || Box
  return <Icon size={size} className={className} style={style} />
}

export default ModuleIcon
