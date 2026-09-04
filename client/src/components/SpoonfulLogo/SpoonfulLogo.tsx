import { Soup } from "lucide-react";
import "./SpoonfulLogo.css";

export default function SpoonfulLogo() {
  return (
    <span className="spoonful-logo">
      <Soup aria-hidden="true" className="spoonful-logo-icon" strokeWidth={2.8} />
      <span>spoonful</span>
    </span>
  );
}