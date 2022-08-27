window.onload = function() {
  // Toggle theme

  const localTheme = window.localStorage && window.localStorage.getItem("theme");
  const themeToggle = document.querySelector(".theme-toggle");

  if (localTheme) {
    document.body.classList.remove("light-theme", "dark-theme");
    document.body.classList.add(localTheme);
    document
      .querySelector("meta[name='theme-color']")
      .setAttribute("content", localTheme.includes("dark") ? "#292a2d" : "#EDE3D9");
  }

  themeToggle.addEventListener("click", () => {
    const themeUndefined = !new RegExp("(dark|light)-theme").test(document.body.className);
    const isOSDark = window.matchMedia("(prefers-color-scheme: dark)").matches;

    if (themeUndefined) {
      if (isOSDark) {
        document.body.classList.add("light-theme");
        document.querySelector("meta[name='theme-color']").setAttribute("content", "#EDE3D9");
      } else {
        document.body.classList.add("dark-theme");
        document.querySelector("meta[name='theme-color']").setAttribute("content", "#292a2d");
      }
    } else {
      const theme = document.body.classList.contains("dark-theme") ? "#EDE3D9" : "#292a2d";
      document.querySelector("meta[name='theme-color']").setAttribute("content", theme);
      document.body.classList.toggle("light-theme");
      document.body.classList.toggle("dark-theme");
    }

    window.localStorage &&
      window.localStorage.setItem(
        "theme",
        document.body.classList.contains("dark-theme") ? "dark-theme" : "light-theme",
      );
  });
};
