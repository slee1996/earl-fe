import { example } from "@/exampleresp";

export default function Page() {
  console.log(example);
  return (
    <div className="flex flex-col justify-center items-left w-full px-40 py-20">
      <h1>song display</h1>
      {example.map((component, i) => {
        return (
          <div
            key={component.component + i.toString() + component.lyrics[0][0]}
          >
            <h2>{component.component}</h2>
            {component.lyrics.map((lyric, j) => (
              <p key={lyric + j.toString()}>{lyric}</p>
            ))}
          </div>
        );
      })}
    </div>
  );
}
