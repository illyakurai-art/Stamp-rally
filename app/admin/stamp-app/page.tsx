import { redirect } from "next/navigation";

export default function AdminStampAppPage() {
  redirect("/protected");
}
