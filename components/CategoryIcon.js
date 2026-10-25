import { NotebookPen, BookOpen, Headphones, BedDouble, GraduationCap, Shapes } from "lucide-react";

const ICONS = {
  notes: NotebookPen,
  books: BookOpen,
  electronics: Headphones,
  hostel: BedDouble,
  help: GraduationCap,
  other: Shapes,
};

export default function CategoryIcon({ slug, size = 24, ...props }) {
  const Icon = ICONS[slug] || Shapes;
  return <Icon size={size} {...props} />;
}
