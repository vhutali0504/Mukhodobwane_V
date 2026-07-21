import { useState, useEffect } from "react";
import ProfilePicker from "./components/ProfilePicker";
import Portfolio from "./components/Portfolio";

export default function App() {
  const [theme, setTheme] = useState(null);

  useEffect(() => {
    if (theme) {
      document.documentElement.setAttribute("data-theme", theme);
    } else {
      document.documentElement.removeAttribute("data-theme");
    }
  }, [theme]);

  if (!theme) {
    return <ProfilePicker onSelect={setTheme} />;
  }

  return <Portfolio theme={theme} onSwitchProfile={() => setTheme(null)} />;
}