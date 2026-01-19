import React, { useState, useEffect } from "react";
import { Palette } from "lucide-react";

const THEMES = [
  "light",
  "dark",
  "cupcake",
  "bumblebee",
  "emerald",
  "corporate",
  "synthwave",
  "retro",
  "cyberpunk",
  "valentine",
  "halloween",
  "garden",
  "forest",
  "aqua",
  "lofi",
  "pastel",
  "fantasy",
  "wireframe",
  "black",
  "luxury",
  "dracula",
  "cmyk",
  "autumn",
  "business",
  "acid",
  "lemonade",
  "night",
  "coffee",
  "winter",
  "dim",
  "nord",
  "sunset",
];

const SettingsPage = () => {
  const [theme, setTheme] = useState(localStorage.getItem("theme") || "light");

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
  }, [theme]);

  const handleThemeChange = (newTheme) => {
    setTheme(newTheme);
  };

  return (
    <div className="h-screen container mx-auto px-4 pt-20 max-w-5xl">
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <Palette className="w-8 h-8 text-primary" />
          <div>
            <h1 className="text-2xl font-bold">Settings</h1>
            <p className="text-sm text-base-content/70">
              Customize your chat experience
            </p>
          </div>
        </div>

        <div className="divider"></div>

        {/* Theme Selection */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Theme</h2>
          <p className="text-sm text-base-content/70">
            Choose a theme for your chat interface
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {THEMES.map((t) => (
              <button
                key={t}
                className={`btn btn-outline ${
                  theme === t ? "btn-primary" : ""
                } capitalize`}
                onClick={() => handleThemeChange(t)}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        {/* Preview Card */}
        <div className="mt-8">
          <h3 className="text-lg font-semibold mb-3">Preview</h3>
          <div className="card bg-base-200 shadow-xl">
            <div className="card-body">
              <h2 className="card-title">Theme Preview</h2>
              <p>This is how your messages will look with the current theme.</p>
              <div className="chat chat-start">
                <div className="chat-bubble">Hello! How are you?</div>
              </div>
              <div className="chat chat-end">
                <div className="chat-bubble chat-bubble-primary">
                  I'm doing great, thanks!
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;