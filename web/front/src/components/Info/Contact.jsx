export default function Contact() {
  const links = [
    {
      label: "Email",
      value: "8hadim@gmail.com",
      href: "mailto:8hadim@gmail.com",
    },
    {
      label: "GitHub",
      value: "@8HadiG",
      href: "https://github.com/8HadiG",
    },
    {
      label: "Source code",
      value: "8HadiG/game-fit",
      href: "https://github.com/8HadiG/game-fit",
    },
    {
      label: "Telegram",
      value: "@HADIKMD",
      href: "https://t.me/HADIKMD",
    },
  ];

  return (
    <section id="contact" className="scroll-mt-24 space-y-4">
      <h2 className="text-2xl font-bold">Contact</h2>

      <p className="leading-relaxed text-gray-600 dark:text-gray-400">
        Found a bug, have a suggestion, or just want to say hi? I'd love to hear
        from you. The fastest way is to open an issue on GitHub — but email and
        Telegram work too.
      </p>

      <ul className="space-y-2">
        {links.map(({ label, value, href }) => (
          <li
            key={label}
            className="flex flex-wrap items-baseline gap-2 text-sm"
          >
            <span className="w-24 shrink-0 font-medium text-gray-500 dark:text-gray-400">
              {label}
            </span>
            <a
              href={href}
              target={href.startsWith("http") ? "_blank" : undefined}
              rel={href.startsWith("http") ? "noopener noreferrer" : undefined}
              className="break-all text-blue-600 hover:underline dark:text-blue-400"
            >
              {value}
            </a>
          </li>
        ))}
      </ul>
    </section>
  );
}
