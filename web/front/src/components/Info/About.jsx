export default function About() {
  return (
    <section id="about" className="scroll-mt-24 space-y-4">
      <h2 className="text-2xl font-bold">About</h2>

      <p className="leading-relaxed text-gray-600 dark:text-gray-400">
        Hi, I'm{" "}
        <span className="font-semibold text-gray-900 dark:text-gray-100">
          Hadi
        </span>{" "}
        — the developer behind this site. I built it out of frustration with how
        hard it is to actually
        <em> find </em> games on the Play Store. Google gives you a search bar
        and a few generic charts, but almost no real filtering. Want a casual
        offline game under a certain size, released after a specific date, with
        a decent score and no ads? Good luck.
      </p>

      <p className="leading-relaxed text-gray-600 dark:text-gray-400">
        So I made the tool I wished existed: a game discovery site built around
        <span className="font-semibold text-gray-900 dark:text-gray-100">
          {" "}
          real filters and sorting
        </span>
        . Filter by installs, score, price, ratings, reviews, release date,
        tags, genres, Android version — then sort the results however you like.
        No noise, no sponsored placements, just the games that match what you're
        looking for.
      </p>

      <p className="leading-relaxed text-gray-600 dark:text-gray-400">
        There are other discovery sites out there — MiniReview is a great
        example — but most of them cover a limited catalog. This project is
        built to scale to a
        <span className="font-semibold text-gray-900 dark:text-gray-100">
          {" "}
          very large library of games
        </span>
        , so you're not stuck browsing the same few hundred titles everyone else
        already knows about.
      </p>

      <p className="leading-relaxed text-gray-600 dark:text-gray-400">
        The project is also fully
        <span className="font-semibold text-gray-900 dark:text-gray-100">
          {" "}
          open source
        </span>
        . The code lives on GitHub, so anyone can inspect it, learn from it,
        suggest improvements, or build on top of it. If you spot something that
        could be better, you're welcome to contribute.
      </p>

      <p className="leading-relaxed text-gray-600 dark:text-gray-400">
        Whether you're hunting for a hidden gem, comparing two similar games, or
        just curious what came out last month in your favorite genre, this site
        is for you. It's built for people like me — and I hope, for people like
        you.
      </p>

      <p className="text-sm text-gray-500 italic dark:text-gray-500">
        — Hadi, developer
      </p>
    </section>
  );
}
