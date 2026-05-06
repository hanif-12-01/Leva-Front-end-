<script setup>
import { computed } from 'vue';
import {
  ArrowLeft, ArrowRight, Bell, BookOpen, Bot, Calendar, CalendarClock, Check,
  ChevronDown, Chrome, Circle, ClipboardList, Clock3, Copy, ExternalLink, Flame,
  FolderKanban, GraduationCap, Grid2x2, House, Lamp, Library, Link, LoaderCircle,
  LogOut, MessageCircle, Newspaper, Paperclip, Pencil, Plus, CircleAlert, RefreshCw,
  Search, Send, Settings, Sparkles, SquareKanban, Trash2, Undo2, User, TriangleAlert, X
} from 'lucide-vue-next';

const ICONS = {
  'arrow-left': ArrowLeft,
  'arrow-right': ArrowRight,
  bell: Bell,
  book: BookOpen,
  bot: Bot,
  calendar: Calendar,
  'calendar-clock': CalendarClock,
  check: Check,
  'chevron-down': ChevronDown,
  google: Chrome,
  clipboard: ClipboardList,
  clock: Clock3,
  copy: Copy,
  dashboard: Grid2x2,
  'external-link': ExternalLink,
  flame: Flame,
  folder: FolderKanban,
  'graduation-cap': GraduationCap,
  home: House,
  lamp: Lamp,
  library: Library,
  link: Link,
  loader: LoaderCircle,
  logout: LogOut,
  message: MessageCircle,
  news: Newspaper,
  info: CircleAlert,
  paperclip: Paperclip,
  pencil: Pencil,
  plus: Plus,
  refresh: RefreshCw,
  search: Search,
  send: Send,
  settings: Settings,
  sparkles: Sparkles,
  task: SquareKanban,
  trash: Trash2,
  undo: Undo2,
  user: User,
  warning: TriangleAlert,
  x: X,
};

const props = defineProps({
  name: { type: String, required: true },
  size: { type: [Number, String], default: 18 },
  color: { type: String, default: 'currentColor' },
  strokeWidth: { type: [Number, String], default: 1.8 },
  class: { type: String, default: '' }
});

const currentIcon = computed(() => ICONS[props.name] || Circle);
</script>

<template>
  <component 
    :is="currentIcon" 
    :size="size" 
    :color="color" 
    :stroke-width="strokeWidth" 
    :class="props.class" 
  />
</template>
